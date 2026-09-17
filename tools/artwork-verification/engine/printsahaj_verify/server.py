"""Local desk server: JSON API + the Flutter web build.

This is the tool, not the PrintSahaj marketing site. Jobs stay on this machine.
"""

from __future__ import annotations

import json
import logging
import os
import re
import subprocess
import sys
import threading
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

from printsahaj_verify.extract import render_preview_png
from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.remarks import add_remark, load_remarks
from printsahaj_verify.reporting.json_report import build_report
from printsahaj_verify.reporting.terminal import format_report
from printsahaj_verify.run import load_stages_checked, run_job, run_stage
from printsahaj_verify.vision import (
    DEFAULT_LANGUAGE,
    LANGUAGE_NAMES,
    gemini_banner_line,
    gemini_status,
    set_output_language,
)
from printsahaj_verify.store import (
    create_or_update_job,
    delete_all_jobs,
    delete_job,
    job_folder,
    job_snapshot,
    list_jobs,
    resolve_slot_file,
    save_last_review,
    save_upload,
)

DESK_HTML = Path(__file__).resolve().parent / "static" / "desk.html"
WEB_ROOT = Path(__file__).resolve().parents[2] / "app" / "build" / "web"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765
OPEN_BROWSER_ENV = "PRINTSAHAJ_OPEN_BROWSER"

# Off by default so the local desktop tool keeps working with no login.
# Set to "1" only in the Cloud Run deployment, which is reachable over the
# open internet and therefore needs a signed-in user.
REQUIRE_AUTH_ENV = "PRINTSAHAJ_REQUIRE_AUTH"

# A valid Firebase token only proves the caller has some account in the
# project. Anyone who can reach the sign-up endpoint can get one, so the desk
# also checks the address against this list. Comma-separated, case-insensitive.
ALLOWED_EMAILS_ENV = "PRINTSAHAJ_ALLOWED_EMAILS"

_log = logging.getLogger("printsahaj.desk")
_firebase_ready = False


def auth_required() -> bool:
    """True when callers must present a Firebase ID token."""
    return os.environ.get(REQUIRE_AUTH_ENV, "0") == "1"


def allowed_emails() -> set[str]:
    """Addresses cleared to use the desk, lower-cased."""
    raw = os.environ.get(ALLOWED_EMAILS_ENV, "")
    return {part.strip().lower() for part in raw.split(",") if part.strip()}


def _ensure_firebase_admin() -> None:
    global _firebase_ready
    if _firebase_ready:
        return
    import firebase_admin

    if not firebase_admin._apps:  # noqa: SLF001
        firebase_admin.initialize_app()
    _firebase_ready = True


def _verify_token(token: str) -> dict:
    """Return the claims in a Firebase ID token, or raise if it is not valid.

    The only place the Firebase SDK is touched, so the gate around it can be
    tested without the SDK installed.
    """
    _ensure_firebase_admin()
    from firebase_admin import auth as firebase_auth

    return dict(firebase_auth.verify_id_token(token))


def _authenticated(handler: BaseHTTPRequestHandler) -> bool:
    """True when the request may proceed. Always true unless auth is required."""
    if not auth_required():
        return True
    allowed = allowed_emails()
    if not allowed:
        # Fail closed. An empty list on a public deployment would otherwise let
        # in every account in the Firebase project.
        _log.error(
            "%s is set but %s is empty, so every request is refused. "
            "Set it to the addresses that may use the desk.",
            REQUIRE_AUTH_ENV,
            ALLOWED_EMAILS_ENV,
        )
        return False
    header = handler.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return False
    token = header[len("Bearer ") :].strip()
    if not token:
        return False
    try:
        claims = _verify_token(token)
    except Exception:
        # Logged, not swallowed: a broken service account looks exactly like a
        # bad password from the browser, and only the log tells them apart.
        _log.warning("Could not verify the ID token", exc_info=True)
        return False
    email = str(claims.get("email", "")).lower()
    if not email or email not in allowed:
        _log.warning("Refused a signed-in user who is not on the allow list")
        return False
    if not claims.get("email_verified", False):
        _log.warning("Refused %s: the address is not verified", email)
        return False
    return True


def bind_error_message(host: str, port: int, error: OSError) -> str:
    """Explain why the desk could not listen, in language a person can act on."""
    text = str(error)
    blocked = "10013" in text or "forbidden" in text.lower() or "access permissions" in text.lower()
    extra = ""
    if blocked:
        extra = (
            " An old PrintVerify window is still holding this port. "
            "Close every black tool window, then run start-tool.bat again."
        )
    return (
        f"Port {port} did not open ({error}).{extra} "
        f"If the tool is already running, open http://{host}:{port} in the browser. "
        "Otherwise run start-tool.bat again."
    )


def ready_banner(url: str, gemini_line: str | None = None) -> str:
    """Lines printed after the desk is listening."""
    gemini = gemini_line if gemini_line is not None else gemini_banner_line()
    return (
        "\n========================================\n"
        "PrintVerify is running\n"
        f"Browser: {url}\n"
        f"{gemini}\n"
        "Do not close this window\n"
        "========================================\n"
    )


def listening_pids(port: int) -> list[int]:
    """Process ids listening on *port*. Empty when they cannot be read."""
    pids: list[int] = []
    try:
        if os.name == "nt":
            raw = subprocess.check_output(
                ["netstat", "-ano", "-p", "tcp"],
                text=True,
                errors="replace",
                timeout=8,
            )
            for line in raw.splitlines():
                if f":{port}" not in line or "LISTENING" not in line.upper():
                    continue
                parts = line.split()
                if not parts:
                    continue
                try:
                    pid = int(parts[-1])
                except ValueError:
                    continue
                if pid > 0 and pid not in pids:
                    pids.append(pid)
        else:
            raw = subprocess.check_output(
                ["ss", "-lptn"],
                text=True,
                errors="replace",
                timeout=8,
            )
            needle = f":{port} "
            for line in raw.splitlines():
                if needle not in line and f":{port}\n" not in line + "\n":
                    if f":{port}" not in line:
                        continue
                for match in re.findall(r"pid=(\d+)", line):
                    pid = int(match)
                    if pid > 0 and pid not in pids:
                        pids.append(pid)
    except (FileNotFoundError, subprocess.CalledProcessError, OSError, subprocess.TimeoutExpired):
        return []
    return pids


def clear_desk_port(port: int) -> list[int]:
    """Stop Windows processes holding *port* so a new start-tool.bat can bind.

    Only those PIDs are closed. Linux leaves the port alone.
    """
    if os.name != "nt":
        return []
    stopped: list[int] = []
    for pid in listening_pids(port):
        if pid == os.getpid():
            continue
        try:
            subprocess.run(
                ["taskkill", "/F", "/PID", str(pid)],
                check=False,
                timeout=8,
                capture_output=True,
            )
            stopped.append(pid)
        except (OSError, subprocess.TimeoutExpired):
            continue
    return stopped


def _json(handler: BaseHTTPRequestHandler, status: int, payload: object) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.end_headers()
    handler.wfile.write(body)


def _bytes(handler: BaseHTTPRequestHandler, data: bytes, content_type: str) -> None:
    handler.send_response(200)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(data)))
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(data)


SUFFIX_TYPES = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}


def _read_json(handler: BaseHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length) if length else b"{}"
    data = json.loads(raw.decode("utf-8") or "{}")
    if not isinstance(data, dict):
        raise JobSpecError("JSON body must be an object")
    return data


def _parse_multipart(handler: BaseHTTPRequestHandler) -> tuple[dict[str, str], tuple[str, bytes]]:
    """Minimal multipart reader for one file plus text fields."""
    content_type = handler.headers.get("Content-Type", "")
    if "boundary=" not in content_type:
        raise JobSpecError("Upload is not multipart")
    boundary = content_type.split("boundary=", 1)[1].strip().encode("ascii")
    length = int(handler.headers.get("Content-Length", "0"))
    blob = handler.rfile.read(length)
    parts = blob.split(b"--" + boundary)
    fields: dict[str, str] = {}
    upload: tuple[str, bytes] | None = None
    for part in parts:
        if not part or part in (b"--\r\n", b"--"):
            continue
        header_blob, _, body = part.partition(b"\r\n\r\n")
        headers = header_blob.decode("utf-8", errors="replace")
        if body.endswith(b"--\r\n"):
            body = body[:-4]
        elif body.endswith(b"--"):
            body = body[:-2]
        if body.endswith(b"\r\n"):
            body = body[:-2]
        disposition = ""
        for line in headers.split("\r\n"):
            if line.lower().startswith("content-disposition:"):
                disposition = line
        name_match = None
        filename = None
        for item in disposition.split(";"):
            item = item.strip()
            if item.startswith("name="):
                name_match = item.split("=", 1)[1].strip().strip('"')
            if item.startswith("filename="):
                filename = item.split("=", 1)[1].strip().strip('"')
        if not name_match:
            continue
        if filename:
            upload = (filename, body)
        else:
            fields[name_match] = body.decode("utf-8", errors="replace")
    if upload is None:
        raise JobSpecError("No file in the upload")
    return fields, upload


class DeskHandler(BaseHTTPRequestHandler):
    """HTTP handler for /api/* and the Flutter web files."""

    def log_message(self, format: str, *args: object) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), format % args))

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        query = parse_qs(parsed.query)
        parts = [item for item in path.split("/") if item]
        if path.startswith("/api/") and path != "/api/health" and not _authenticated(self):
            _json(self, 401, {"error": "Sign in required"})
            return
        try:
            if path == "/api/health":
                payload = {
                    "ok": True,
                    "tool": "artwork-verification",
                    "auth_required": auth_required(),
                    "languages": sorted(LANGUAGE_NAMES),
                }
                payload.update(gemini_status())
                _json(self, 200, payload)
                return
            if path == "/api/jobs":
                _json(self, 200, {"jobs": list_jobs()})
                return
            if (
                len(parts) >= 5
                and parts[0] == "api"
                and parts[1] == "jobs"
                and parts[3] == "files"
            ):
                job_id = parts[2]
                role = parts[4]
                target = resolve_slot_file(job_id, role)
                if len(parts) == 6 and parts[5] == "preview":
                    page_raw = query.get("page", ["1"])[0]
                    width_raw = query.get("width", [""])[0]
                    try:
                        page = int(page_raw)
                    except ValueError as error:
                        raise JobSpecError("preview page must be a number") from error
                    max_width = None
                    if width_raw:
                        try:
                            max_width = int(width_raw)
                        except ValueError as error:
                            raise JobSpecError("preview width must be a number") from error
                    _bytes(
                        self,
                        render_preview_png(target, page, max_width_px=max_width),
                        "image/png",
                    )
                    return
                if len(parts) == 5:
                    content_type = SUFFIX_TYPES.get(
                        target.suffix.lower(), "application/octet-stream"
                    )
                    _bytes(self, target.read_bytes(), content_type)
                    return
            if path.startswith("/api/jobs/") and path.endswith("/report"):
                job_id = path[len("/api/jobs/") : -len("/report")]
                folder = job_folder(job_id)
                spec, results, files = run_job(folder)
                _json(
                    self,
                    200,
                    build_report(
                        spec,
                        results,
                        files,
                        load_remarks(folder),
                        load_stages_checked(folder),
                    ),
                )
                return
            if path.startswith("/api/jobs/") and path.endswith("/report.txt"):
                job_id = path[len("/api/jobs/") : -len("/report.txt")]
                folder = job_folder(job_id)
                spec, results, _files = run_job(folder)
                text = format_report(spec, results).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Content-Length", str(len(text)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(text)
                return
            if path.startswith("/api/jobs/"):
                job_id = path[len("/api/jobs/") :].strip("/")
                _json(self, 200, job_snapshot(job_id))
                return
        except (JobSpecError, FileNotFoundError, json.JSONDecodeError) as error:
            _json(self, 400, {"error": str(error)})
            return
        self._serve_static(path)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        if path.startswith("/api/") and not _authenticated(self):
            _json(self, 401, {"error": "Sign in required"})
            return
        try:
            if path == "/api/jobs":
                payload = _read_json(self)
                folder = create_or_update_job(payload)
                _json(self, 200, job_snapshot(Path(folder).name))
                return
            if path.startswith("/api/jobs/") and path.endswith("/check"):
                job_id = path[len("/api/jobs/") : -len("/check")]
                payload = _read_json(self)
                stage = str(payload.get("stage", "approval"))
                set_output_language(str(payload.get("lang", DEFAULT_LANGUAGE)))
                try:
                    spec, results, files, checked = run_stage(job_folder(job_id), stage)
                    report = build_report(
                        spec, results, files, load_remarks(job_folder(job_id)), checked
                    )
                    slim = {
                        "stage": stage,
                        "checklist": report["checklist"],
                        "review": report["review"],
                        "counts": report["counts"],
                        "stages_checked": checked,
                    }
                    save_last_review(job_id, slim)
                finally:
                    set_output_language(DEFAULT_LANGUAGE)
                _json(self, 200, slim)
                return
            if path.startswith("/api/jobs/") and path.endswith("/files"):
                job_id = path[len("/api/jobs/") : -len("/files")]
                fields, (filename, data) = _parse_multipart(self)
                role = fields.get("role", "")
                saved = save_upload(job_id, role, data, filename)
                _json(self, 200, {"saved": saved.name, "role": role})
                return
            if path.startswith("/api/jobs/") and path.endswith("/remarks"):
                job_id = path[len("/api/jobs/") : -len("/remarks")]
                payload = _read_json(self)
                remarks = add_remark(
                    job_folder(job_id),
                    check_id=payload.get("check_id"),
                    summary=payload.get("summary"),
                    remark=str(payload.get("remark", "")),
                    by=str(payload.get("by", "")),
                )
                _json(self, 200, remarks)
                return
        except (JobSpecError, ValueError, FileNotFoundError, json.JSONDecodeError, RuntimeError) as error:
            _json(self, 400, {"error": str(error)})
            return
        _json(self, 404, {"error": f"Unknown path {path}"})

    def do_DELETE(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        if path.startswith("/api/") and not _authenticated(self):
            _json(self, 401, {"error": "Sign in required"})
            return
        try:
            if path == "/api/jobs":
                removed = delete_all_jobs()
                _json(self, 200, {"removed": removed})
                return
            if path.startswith("/api/jobs/"):
                job_id = path[len("/api/jobs/") :].strip("/")
                if not job_id or "/" in job_id:
                    raise JobSpecError("Unknown path")
                delete_job(job_id)
                _json(self, 200, {"removed": job_id})
                return
        except (JobSpecError, FileNotFoundError) as error:
            _json(self, 400, {"error": str(error)})
            return
        _json(self, 404, {"error": f"Unknown path {path}"})

    def _serve_static(self, path: str) -> None:
        # The built-in desk always works. Flutter web, if built, is at /app/.
        if path in {"/", "/index.html", "/desk", "/desk.html"}:
            target = DESK_HTML
        elif path.startswith("/app"):
            relative = path[len("/app") :].lstrip("/") or "index.html"
            target = (WEB_ROOT / relative).resolve()
            if not WEB_ROOT.is_dir() or (
                WEB_ROOT not in target.parents and target != WEB_ROOT
            ):
                target = DESK_HTML
            elif target.is_dir():
                target = target / "index.html"
            if not target.is_file():
                target = DESK_HTML
        else:
            target = DESK_HTML
        data = target.read_bytes()
        types = {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript",
            ".css": "text/css",
            ".png": "image/png",
            ".json": "application/json",
            ".wasm": "application/wasm",
        }
        self.send_response(200)
        self.send_header("Content-Type", types.get(target.suffix, "text/html; charset=utf-8"))
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)


def serve(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT) -> None:
    """Start the local desk. Blocks until the process is stopped."""
    try:
        server = ThreadingHTTPServer((host, port), DeskHandler)
    except OSError as error:
        stopped = clear_desk_port(port)
        if stopped:
            print(
                f"Closed old process on port {port}: {stopped}. Starting again...",
                file=sys.stderr,
            )
            time.sleep(1.5)
            try:
                server = ThreadingHTTPServer((host, port), DeskHandler)
            except OSError as error2:
                print(bind_error_message(host, port, error2), file=sys.stderr)
                raise SystemExit(1) from error2
        else:
            print(bind_error_message(host, port, error), file=sys.stderr)
            raise SystemExit(1) from error
    url = f"http://{host}:{port}"
    print(ready_banner(url), file=sys.stderr)
    if os.environ.get(OPEN_BROWSER_ENV, "1") != "0":
        threading.Timer(0.3, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    finally:
        server.server_close()
