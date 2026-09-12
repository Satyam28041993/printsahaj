"""Local desk server: JSON API + the Flutter web build.

This is the tool, not the PrintSahaj marketing site. Jobs stay on this machine.
"""

from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.remarks import add_remark, load_remarks
from printsahaj_verify.reporting.json_report import build_report
from printsahaj_verify.reporting.terminal import format_report
from printsahaj_verify.run import run_job
from printsahaj_verify.store import (
    create_or_update_job,
    job_folder,
    job_snapshot,
    list_jobs,
    save_upload,
)

DESK_HTML = Path(__file__).resolve().parent / "static" / "desk.html"
WEB_ROOT = Path(__file__).resolve().parents[2] / "app" / "build" / "web"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765


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
        body = body.rstrip(b"\r\n")
        if body.endswith(b"--"):
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
        try:
            if path == "/api/health":
                _json(self, 200, {"ok": True, "tool": "artwork-verification"})
                return
            if path == "/api/jobs":
                _json(self, 200, {"jobs": list_jobs()})
                return
            if path.startswith("/api/jobs/") and path.endswith("/report"):
                job_id = path[len("/api/jobs/") : -len("/report")]
                folder = job_folder(job_id)
                spec, results, files = run_job(folder)
                _json(self, 200, build_report(spec, results, files, load_remarks(folder)))
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
    server = ThreadingHTTPServer((host, port), DeskHandler)
    print(f"Artwork verification tool: http://{host}:{port}", file=sys.stderr)
    server.serve_forever()
