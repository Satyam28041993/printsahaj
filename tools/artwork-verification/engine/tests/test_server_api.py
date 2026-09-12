"""Local desk API: create a job, upload, read a report."""

from __future__ import annotations

import io
import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

import pymupdf

from printsahaj_verify.server import DeskHandler
from printsahaj_verify import store


def _blank_pdf(pages: int) -> bytes:
    document = pymupdf.open()
    for _ in range(pages):
        document.new_page()
    buffer = io.BytesIO()
    document.save(buffer)
    document.close()
    return buffer.getvalue()


class ServerApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.root = Path(tempfile.mkdtemp())
        self.patcher = patch.object(store, "DEFAULT_JOBS_ROOT", self.root)
        self.patcher.start()
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), DeskHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        host, port = self.server.server_address[:2]
        self.base = f"http://{host}:{port}"

    def tearDown(self) -> None:
        self.server.shutdown()
        self.patcher.stop()

    def test_create_upload_report(self) -> None:
        import urllib.request

        payload = json.dumps(
            {
                "job_id": "JOB1",
                "file_name": "TEST LABEL",
                "customer": "ACME",
                "colour_declaration": "4 COL",
                "colour_list": ["Cyan", "Magenta", "Yellow", "Black"],
                "label_size_mm": [50, 50],
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            f"{self.base}/api/jobs",
            data=payload,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(request) as response:
            created = json.loads(response.read().decode("utf-8"))
        self.assertEqual(created["job"]["job_id"], "JOB1")

        pdf = _blank_pdf(3)
        boundary = "----testboundary"
        body = (
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="role"\r\n\r\n'
            "separations\r\n"
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="file"; filename="separations.pdf"\r\n'
            "Content-Type: application/pdf\r\n\r\n"
        ).encode("utf-8") + pdf + f"\r\n--{boundary}--\r\n".encode("utf-8")
        upload = urllib.request.Request(
            f"{self.base}/api/jobs/JOB1/files",
            data=body,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        )
        with urllib.request.urlopen(upload) as response:
            saved = json.loads(response.read().decode("utf-8"))
        self.assertEqual(saved["role"], "separations")

        with urllib.request.urlopen(self.base + "/") as response:
            home = response.read().decode("utf-8")
        self.assertIn("Artwork Verification", home)
        self.assertIn("Naya job", home)
        self.assertIn("start-tool.bat", home)
        self.assertNotIn("CGM2026-27-1326", home)
        self.assertNotIn("DAILY KALONJI", home)
        self.assertNotIn("6 COL + VARNISH", home)
        self.assertNotIn("DAILY PHARMA", home)

        with urllib.request.urlopen(f"{self.base}/api/jobs/JOB1/report") as response:
            report = json.loads(response.read().decode("utf-8"))
        plate = next(item for item in report["checks"] if item["check_id"] == "plate_count")
        self.assertTrue(plate["ran"])
        self.assertEqual(len(plate["findings"]), 1)
        self.assertNotIn("PASS", json.dumps(report))
        self.assertNotIn("FAIL", json.dumps(report))
        self.assertNotIn("APPROVED", json.dumps(report))

    def test_bind_error_points_at_local_url(self) -> None:
        from printsahaj_verify.server import bind_error_message, ready_banner

        text = bind_error_message("127.0.0.1", 8765, OSError("Address already in use"))
        self.assertIn("http://127.0.0.1:8765", text)
        self.assertIn("start-tool.bat", text)
        self.assertNotIn("PASS", text)
        banner = ready_banner("http://127.0.0.1:8765")
        self.assertIn("CHAL RAHA HAI", banner)
        self.assertIn("http://127.0.0.1:8765", banner)

    def test_serve_exits_when_port_is_busy(self) -> None:
        from printsahaj_verify.server import serve

        with patch(
            "printsahaj_verify.server.ThreadingHTTPServer",
            side_effect=OSError("Address already in use"),
        ):
            with self.assertRaises(SystemExit):
                serve("127.0.0.1", 8765)


if __name__ == "__main__":
    unittest.main()
