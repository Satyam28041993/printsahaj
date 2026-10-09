"""Job ids must not escape the jobs directory.

'.' and '..' used to pass the name check. Creating '..' wrote job.json into
the parent of the jobs root, and deleting it removed everything there.
"""

from __future__ import annotations

import json
import tempfile
import threading
import unittest
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

from printsahaj_verify import store
from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.server import DeskHandler
from printsahaj_verify.store import (
    JOB_CODE_ERROR,
    create_or_update_job,
    delete_job,
    job_folder,
    job_snapshot,
)

PARENT_JOB = '{"job_id": "..", "file_name": "SECRET", "customer": "LEAKED"}\n'
KEY_TEXT = "secret\n"


def _payload(job_id: str) -> dict[str, str]:
    return {"job_id": job_id, "file_name": "ART", "customer": "ACME"}


class JobFolderGuardTests(unittest.TestCase):
    def setUp(self) -> None:
        self.sandbox = Path(tempfile.mkdtemp())
        self.root = self.sandbox / "jobs"
        self.root.mkdir()
        (self.sandbox / "gemini-key.txt").write_text(KEY_TEXT, encoding="utf-8")
        engine = self.sandbox / "engine"
        engine.mkdir()
        (engine / "keep.py").write_text("x = 1\n", encoding="utf-8")
        (self.sandbox / "job.json").write_text(PARENT_JOB, encoding="utf-8")
        (self.root / "job.json").write_text(PARENT_JOB, encoding="utf-8")
        create_or_update_job(_payload("KEEP"), root=self.root)

    def assert_sandbox_intact(self) -> None:
        self.assertEqual(
            (self.sandbox / "gemini-key.txt").read_text(encoding="utf-8"), KEY_TEXT
        )
        self.assertEqual(
            (self.sandbox / "engine" / "keep.py").read_text(encoding="utf-8"),
            "x = 1\n",
        )
        self.assertEqual(
            (self.sandbox / "job.json").read_text(encoding="utf-8"), PARENT_JOB
        )
        self.assertTrue((self.root / "KEEP" / "job.json").is_file())
        self.assertFalse((self.sandbox / "remarks.json").exists())

    def test_dot_dotdot_separators_and_absolute_ids_are_rejected(self) -> None:
        outside = self.sandbox / "escaped"
        rejected = [
            ".",
            "..",
            " .. ",
            "",
            "   ",
            "../x",
            "..\\x",
            "foo/../../etc",
            "foo\\..\\bar",
            "/etc/passwd",
            str(outside),
            "C:/Windows/System32",
            "a/b",
            "a\\b",
        ]
        for job_id in rejected:
            with self.subTest(job_id=job_id):
                with self.assertRaises(JobSpecError) as caught:
                    job_folder(job_id, root=self.root)
                self.assertEqual(str(caught.exception), JOB_CODE_ERROR)
                with self.assertRaises(JobSpecError):
                    create_or_update_job(_payload(job_id), root=self.root)
                with self.assertRaises(JobSpecError):
                    delete_job(job_id, root=self.root)
                with self.assertRaises(JobSpecError):
                    job_snapshot(job_id, root=self.root)
        self.assertFalse(outside.exists())
        self.assert_sandbox_intact()

    def test_dotted_code_still_stays_inside_the_jobs_root(self) -> None:
        folder = create_or_update_job(_payload("JOB.1"), root=self.root)
        self.assertEqual(folder, self.root / "JOB.1")
        self.assertEqual(job_folder("JOB.1", root=self.root), self.root / "JOB.1")
        delete_job("JOB.1", root=self.root)
        self.assertFalse((self.root / "JOB.1").exists())
        self.assert_sandbox_intact()

    def test_symlink_outside_the_jobs_root_is_not_a_job_folder(self) -> None:
        outside = self.sandbox / "outside"
        outside.mkdir()
        (outside / "secret.txt").write_text("nope\n", encoding="utf-8")
        (self.root / "LINKED").symlink_to(outside, target_is_directory=True)
        with self.assertRaises(JobSpecError):
            create_or_update_job(_payload("LINKED"), root=self.root)
        with self.assertRaises(JobSpecError):
            job_snapshot("LINKED", root=self.root)
        with self.assertRaises(JobSpecError):
            delete_job("LINKED", root=self.root)
        self.assertFalse((outside / "job.json").exists())
        self.assertEqual((outside / "secret.txt").read_text(encoding="utf-8"), "nope\n")
        self.assert_sandbox_intact()

    def test_resolved_path_stays_inside_when_the_name_check_is_bypassed(self) -> None:
        outside = self.sandbox / "escaped"
        bypassed = {
            "..": "..",
            ".": ".",
            "absolute": str(outside),
            "nested": "../x",
        }
        for label, code in bypassed.items():
            with self.subTest(label=label):
                with patch("printsahaj_verify.store._safe_code", return_value=code):
                    with self.assertRaises(JobSpecError):
                        create_or_update_job(_payload("IGNORED"), root=self.root)
                    with self.assertRaises(JobSpecError):
                        delete_job("IGNORED", root=self.root)
        self.assertFalse(outside.exists())
        self.assertFalse((self.sandbox / "x").exists())
        self.assert_sandbox_intact()


class JobIdApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.sandbox = Path(tempfile.mkdtemp())
        self.root = self.sandbox / "jobs"
        self.root.mkdir()
        (self.sandbox / "gemini-key.txt").write_text(KEY_TEXT, encoding="utf-8")
        engine = self.sandbox / "engine"
        engine.mkdir()
        (engine / "keep.py").write_text("x = 1\n", encoding="utf-8")
        (self.sandbox / "job.json").write_text(PARENT_JOB, encoding="utf-8")
        self.patcher = patch.object(store, "DEFAULT_JOBS_ROOT", self.root)
        self.patcher.start()
        create_or_update_job(_payload("KEEP"), root=self.root)
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), DeskHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.host, self.port = self.server.server_address[:2]

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.patcher.stop()

    def request(
        self,
        method: str,
        target: str,
        body: bytes | None = None,
        content_type: str | None = None,
    ) -> tuple[int, bytes]:
        connection = HTTPConnection(self.host, self.port, timeout=10)
        headers = {}
        if content_type:
            headers["Content-Type"] = content_type
        connection.request(method, target, body=body, headers=headers)
        response = connection.getresponse()
        payload = response.read()
        status = response.status
        connection.close()
        return status, payload

    def assert_sandbox_intact(self) -> None:
        self.assertEqual(
            (self.sandbox / "gemini-key.txt").read_text(encoding="utf-8"), KEY_TEXT
        )
        self.assertTrue((self.sandbox / "engine" / "keep.py").is_file())
        self.assertEqual(
            (self.sandbox / "job.json").read_text(encoding="utf-8"), PARENT_JOB
        )
        self.assertTrue((self.root / "KEEP" / "job.json").is_file())
        self.assertFalse((self.sandbox / "remarks.json").exists())
        self.assertFalse((self.sandbox / "client_artwork.pdf").exists())

    def assert_bad_id(self, method: str, target: str, body: bytes | None = None, content_type: str | None = None) -> None:
        status, payload = self.request(method, target, body, content_type)
        self.assertEqual(status, 400, msg=f"{method} {target} -> {status} {payload!r}")
        parsed = json.loads(payload.decode("utf-8"))
        self.assertIsInstance(parsed["error"], str)
        self.assertNotIn("LEAKED", parsed["error"])
        self.assertNotIn("Traceback", parsed["error"])
        self.assert_sandbox_intact()

    def test_api_rejects_traversal_ids(self) -> None:
        outside = self.sandbox / "escaped"

        def create(job_id: str) -> bytes:
            return json.dumps(_payload(job_id)).encode("utf-8")
        remark = json.dumps({"remark": "note", "by": "tester"}).encode("utf-8")
        check = json.dumps({"stage": "approval"}).encode("utf-8")
        boundary = "----travboundary"
        upload = (
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="role"\r\n\r\n'
            "client_artwork\r\n"
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="file"; filename="x.pdf"\r\n'
            "Content-Type: application/pdf\r\n\r\n"
            "%PDF-1.1\n"
            f"\r\n--{boundary}--\r\n"
        ).encode("utf-8")
        upload_type = f"multipart/form-data; boundary={boundary}"
        json_type = "application/json"

        cases: list[tuple[str, str, bytes | None, str | None]] = [
            ("POST", "/api/jobs", create("."), json_type),
            ("POST", "/api/jobs", create(".."), json_type),
            ("POST", "/api/jobs", create(""), json_type),
            ("POST", "/api/jobs", create("../x"), json_type),
            ("POST", "/api/jobs", create("/etc/passwd"), json_type),
            ("POST", "/api/jobs", create(str(outside)), json_type),
            ("GET", "/api/jobs/.", None, None),
            ("GET", "/api/jobs/..", None, None),
            ("GET", "/api/jobs/..%2F", None, None),
            ("GET", "/api/jobs/%2e%2e", None, None),
            ("GET", "/api/jobs/../x", None, None),
            ("GET", "/api/jobs/%2Fetc%2Fpasswd", None, None),
            ("DELETE", "/api/jobs/.", None, None),
            ("DELETE", "/api/jobs/..", None, None),
            ("DELETE", "/api/jobs/..%2F", None, None),
            ("DELETE", "/api/jobs/%2e%2e", None, None),
            ("DELETE", "/api/jobs/../x", None, None),
            ("DELETE", "/api/jobs/%2Ftmp%2Fabs", None, None),
            ("GET", "/api/jobs/../report", None, None),
            ("GET", "/api/jobs/..%2Freport", None, None),
            ("GET", "/api/jobs/../report.txt", None, None),
            ("GET", "/api/jobs/..%2Freport.txt", None, None),
            ("POST", "/api/jobs/../remarks", remark, json_type),
            ("POST", "/api/jobs/..%2Fremarks", remark, json_type),
            ("POST", "/api/jobs/../files", upload, upload_type),
            ("POST", "/api/jobs/..%2Ffiles", upload, upload_type),
            ("POST", "/api/jobs/../check", check, json_type),
            ("POST", "/api/jobs/..%2Fcheck", check, json_type),
            ("GET", "/api/jobs/../files/client_artwork", None, None),
            ("GET", "/api/jobs/..%2Ffiles/client_artwork", None, None),
            (
                "GET",
                "/api/jobs/..%2Ffiles/client_artwork/preview?page=1",
                None,
                None,
            ),
        ]
        for method, target, body, content_type in cases:
            with self.subTest(method=method, target=target):
                self.assert_bad_id(method, target, body, content_type)
        self.assertFalse(outside.exists())

        status, payload = self.request("GET", "/api/jobs/KEEP")
        self.assertEqual(status, 200, msg=payload)
        self.assertNotIn(b"LEAKED", payload)
        self.assertIn(b"KEEP", payload)

        status, payload = self.request(
            "POST",
            "/api/jobs",
            create("JOB.1"),
            json_type,
        )
        self.assertEqual(status, 200, msg=payload)
        self.assertTrue((self.root / "JOB.1" / "job.json").is_file())

        status, payload = self.request("DELETE", "/api/jobs/JOB.1")
        self.assertEqual(status, 200, msg=payload)
        self.assertFalse((self.root / "JOB.1").exists())
        self.assert_sandbox_intact()
