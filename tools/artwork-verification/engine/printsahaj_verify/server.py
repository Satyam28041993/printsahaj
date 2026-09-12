"""Local desk server: JSON API + the Flutter web build.

This is the tool, not the PrintSahaj marketing site. Jobs stay on this machine.
"""

from __future__ import annotations

import json
import os
import sys
import threading
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
from printsahaj_verify.store import (
    create_or_update_job,
    job_folder,
    job_snapshot,
    list_jobs,
    resolve_slot_file,
    save_upload,
)

DESK_HTML = Path(__file__).resolve().parent / "static" / "desk.html"
WEB_ROOT = Path(__file__).resolve().parents[2] / "app" / "build" / "web"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765
OPEN_BROWSER_ENV = "PRINTSAHAJ_OPEN_BROWSER"


def bind_error_message(host: str, port: int, error: OSError) -> str:
    """Explain why the desk could not listen, in language a person can act on."""
    return (
        f"Port {port} did not open ({error}). "
        f"If the tool is already running, open http://{host}:{port} in the browser. "
        "Otherwise run start-tool.bat again."
    )


def ready_banner(url: str) -> str:
    """Lines printed after the desk is listening."""
    return (
        "\n========================================\n"
        "Artwork Verification is running\n"
        f"Browser: {url}\n"
        "Do not close this window\n"
        "========================================\n"
    )


def _json(handler: BaseHTTPRequestHandler, status: int, payload: object) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
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
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        query = parse_qs(parsed.query)
        parts = [item for item in path.split("/") if item]
        try:
            if path == "/api/health":
                _json(self, 200, {"ok": True, "tool": "artwork-verification"})
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
                    try:
                        page = int(page_raw)
                    except ValueError as error:
                        raise JobSpecError("preview page must be a number") from error
                    _bytes(self, render_preview_png(target, page), "image/png")
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
                spec, results, files, checked = run_stage(job_folder(job_id), stage)
                report = build_report(
                    spec, results, files, load_remarks(job_folder(job_id)), checked
                )
                report["stage"] = stage
                _json(self, 200, report)
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
        except (JobSpecError, ValueError, FileNotFoundError, json.JSONDecodeError) as error:
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
