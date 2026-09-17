"""The cloud desk refuses anyone who is not a signed-in, listed user."""

from __future__ import annotations

import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

from printsahaj_verify import server, store
from printsahaj_verify.server import DeskHandler

LISTED = "owner@printsahaj.com"
STRANGER = "someone@example.com"


class AuthGateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.root = Path(tempfile.mkdtemp())
        self.store_patch = patch.object(store, "DEFAULT_JOBS_ROOT", self.root)
        self.store_patch.start()
        self.env_patch = patch.dict(
            "os.environ",
            {
                server.REQUIRE_AUTH_ENV: "1",
                server.ALLOWED_EMAILS_ENV: LISTED,
            },
        )
        self.env_patch.start()
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), DeskHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        host, port = self.server.server_address[:2]
        self.base = f"http://{host}:{port}"

    def tearDown(self) -> None:
        self.server.shutdown()
        self.env_patch.stop()
        self.store_patch.stop()

    def _get(self, path: str, token: str | None = None) -> tuple[int, dict]:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        request = urllib.request.Request(f"{self.base}{path}", headers=headers)
        try:
            with urllib.request.urlopen(request) as response:
                return response.status, json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            return error.code, json.loads(error.read().decode("utf-8"))

    def test_health_is_open_and_announces_the_gate(self) -> None:
        status, payload = self._get("/api/health")
        self.assertEqual(status, 200)
        self.assertTrue(payload["auth_required"])

    def test_job_list_without_a_token_is_refused(self) -> None:
        status, payload = self._get("/api/jobs")
        self.assertEqual(status, 401)
        self.assertIn("Sign in", payload["error"])

    def test_delete_all_without_a_token_is_refused(self) -> None:
        request = urllib.request.Request(f"{self.base}/api/jobs", method="DELETE")
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request)
        self.assertEqual(caught.exception.code, 401)

    def test_a_listed_user_gets_in(self) -> None:
        claims = {"email": LISTED, "email_verified": True}
        with patch.object(server, "_verify_token", return_value=claims):
            status, payload = self._get("/api/jobs", token="good-token")
        self.assertEqual(status, 200)
        self.assertEqual(payload["jobs"], [])

    def test_a_valid_token_for_an_unlisted_address_is_refused(self) -> None:
        claims = {"email": STRANGER, "email_verified": True}
        with patch.object(server, "_verify_token", return_value=claims):
            status, _ = self._get("/api/jobs", token="good-token")
        self.assertEqual(status, 401)

    def test_an_unverified_address_is_refused(self) -> None:
        claims = {"email": LISTED, "email_verified": False}
        with patch.object(server, "_verify_token", return_value=claims):
            status, _ = self._get("/api/jobs", token="good-token")
        self.assertEqual(status, 401)

    def test_an_empty_allow_list_refuses_everyone(self) -> None:
        claims = {"email": LISTED, "email_verified": True}
        with patch.dict(
            "os.environ", {server.ALLOWED_EMAILS_ENV: ""}
        ), patch.object(server, "_verify_token", return_value=claims):
            status, _ = self._get("/api/jobs", token="good-token")
        self.assertEqual(status, 401)


class LocalDeskTests(unittest.TestCase):
    """With the gate off, the desktop tool keeps working with no login."""

    def setUp(self) -> None:
        self.root = Path(tempfile.mkdtemp())
        self.store_patch = patch.object(store, "DEFAULT_JOBS_ROOT", self.root)
        self.store_patch.start()
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), DeskHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        host, port = self.server.server_address[:2]
        self.base = f"http://{host}:{port}"

    def tearDown(self) -> None:
        self.server.shutdown()
        self.store_patch.stop()

    def test_no_token_needed(self) -> None:
        with urllib.request.urlopen(f"{self.base}/api/jobs") as response:
            payload = json.loads(response.read().decode("utf-8"))
        self.assertEqual(response.status, 200)
        self.assertEqual(payload["jobs"], [])


if __name__ == "__main__":
    unittest.main()
