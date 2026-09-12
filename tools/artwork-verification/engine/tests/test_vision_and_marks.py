"""Job-code ignore, batch/MRP marks, and optional Gemini notes."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from printsahaj_verify.checks.job_identity import check_job_identity
from printsahaj_verify.checks.label_marks import NO_BATCH, NO_MRP, check_label_marks
from printsahaj_verify.checks.visual_layout import check_visual_layout
from printsahaj_verify.extract import read_document_text
from printsahaj_verify.job_spec import load_job_spec
from printsahaj_verify.reporting.review import build_review
from printsahaj_verify.run import run_job
from printsahaj_verify.store import create_or_update_job, save_upload
from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.vision import (
    GEMINI_KEY_ENV,
    VisionNotes,
    compare_label_previews,
    generate_content_url,
    gemini_configured,
    is_retryable_gemini_error,
    models_from_list_payload,
    notes_from_payload,
    preferred_model_order,
    scrub_vision_text,
    short_model_name,
)
from tests.test_stages import BIN_VENDOR_TEXT, write_text_pdf


def _notes(**overrides: object) -> VisionNotes:
    payload = {
        "wording_same": True,
        "wording_note": "same wording",
        "product_centered_both": True,
        "alignment_note": "bowl in the middle on both",
        "logo_same_place": True,
        "logo_note": "logo top left on both",
        "batch_on_label": False,
        "batch_note": "blank box",
        "mrp_on_label": True,
        "mrp_note": "MRP 199 on both",
    }
    payload.update(overrides)
    return notes_from_payload(payload, source="gemini:test")


class JobCodeIgnoreTests(unittest.TestCase):
    def test_typed_job_code_wins_over_filename_code(self) -> None:
        root = Path(tempfile.mkdtemp())
        folder = create_or_update_job(
            {
                "job_id": "PGPL-001",
                "file_name": "BIN FARUQ KALONJI OIL 50ML",
                "customer": "BIN FARUQ",
            },
            root=root,
        )
        vendor = folder / "v.pdf"
        write_text_pdf(vendor, BIN_VENDOR_TEXT)
        save_upload(
            "PGPL-001",
            "vendor_composite",
            vendor.read_bytes(),
            "CGM2026-27-9824_BIN FARUQ.pdf",
            root=root,
        )
        spec = load_job_spec(folder / "job.json")
        from printsahaj_verify.files import discover_job_files

        files = discover_job_files(folder)
        result = check_job_identity(
            spec,
            [path for path in (files.vendor_composite,) if path],
            [read_document_text(files.vendor_composite)] if files.vendor_composite else [],
        )
        self.assertEqual(result.observations["job_code"], "PGPL-001")
        self.assertEqual(result.observations["file_codes"], "ignored")
        self.assertIn("CGM2026-27-9824", result.observations["codes"])
        for finding in result.findings:
            self.assertNotIn("another job", finding.summary)


class LabelMarkTests(unittest.TestCase):
    def test_pdf_without_batch_or_mrp(self) -> None:
        path = Path(tempfile.mkdtemp()) / "a.pdf"
        write_text_pdf(path, "6 COL + VARNISH LABEL SIZE 57 x 95 MM")
        doc = read_document_text(path)
        result = check_label_marks(None, doc, False, False)
        self.assertTrue(result.ran)
        summaries = [item.summary for item in result.findings]
        self.assertTrue(any(NO_BATCH in line for line in summaries))
        self.assertTrue(any(NO_MRP in line for line in summaries))

    def test_image_without_gemini_does_not_invent_a_miss(self) -> None:
        result = check_label_marks(None, None, True, False)
        self.assertFalse(result.ran)
        self.assertEqual(result.observations["has_batch"], "unread")
        self.assertIn("image", (result.not_run_reason or "").lower())

    def test_gemini_missing_batch_uses_operator_wording(self) -> None:
        result = check_label_marks(None, None, True, False, notes=_notes())
        self.assertTrue(result.ran)
        self.assertEqual(result.observations["has_batch"], "no")
        self.assertEqual(result.observations["has_mrp"], "yes")
        self.assertTrue(any(NO_BATCH in item.summary for item in result.findings))
        self.assertFalse(any(NO_MRP in item.summary for item in result.findings))


class VisionNoteTests(unittest.TestCase):
    def setUp(self) -> None:
        from printsahaj_verify import vision as vision_mod

        vision_mod._STATUS_CACHE = None

    def test_key_file_is_read_when_env_is_empty(self) -> None:
        from printsahaj_verify.vision import read_gemini_api_key

        folder = Path(tempfile.mkdtemp())
        path = folder / "gemini-key.txt"
        path.write_text("\ufeff# comment\nAIza-test-key-123\n", encoding="utf-8")
        with patch.dict("os.environ", {GEMINI_KEY_ENV: ""}):
            self.assertEqual(read_gemini_api_key(path), "AIza-test-key-123")

    def test_probe_reports_when_google_accepts_the_key(self) -> None:
        from printsahaj_verify.vision import gemini_status, probe_gemini

        with patch.dict("os.environ", {GEMINI_KEY_ENV: "test-key"}):
            with patch("printsahaj_verify.vision._get_gemini", return_value=b"{}"):
                from printsahaj_verify import vision as vision_mod

                vision_mod._STATUS_CACHE = None
                ok, detail = probe_gemini()
                self.assertTrue(ok)
                self.assertIn("accepted", detail.lower())
                status = gemini_status(force=True)
                self.assertTrue(status["gemini_ok"])
                vision_mod._STATUS_CACHE = None

    def test_env_key_wins_over_file(self) -> None:
        from printsahaj_verify.vision import read_gemini_api_key

        path = Path(tempfile.mkdtemp()) / "gemini-key.txt"
        path.write_text("file-key\n", encoding="utf-8")
        with patch.dict("os.environ", {GEMINI_KEY_ENV: "env-key"}):
            self.assertEqual(read_gemini_api_key(path), "env-key")

    def test_scrub_strips_verdict_words(self) -> None:
        self.assertNotIn("FAIL", scrub_vision_text("this would FAIL a check").upper())
        self.assertNotIn("PASS", scrub_vision_text("PASS").upper())

    def test_layout_mismatch_is_advisory(self) -> None:
        notes = _notes(product_centered_both=False, logo_same_place=False)
        result = check_visual_layout(notes, True)
        self.assertTrue(result.ran)
        self.assertEqual(len(result.findings), 2)
        self.assertEqual(result.observations["alignment"], "mismatch")
        self.assertEqual(result.observations["logo"], "mismatch")

    def test_no_gemini_is_not_run(self) -> None:
        result = check_visual_layout(None, True)
        self.assertFalse(result.ran)
        self.assertIn("PRINTSAHAJ_GEMINI_API_KEY", result.not_run_reason or "")

    def test_vision_error_is_shown_when_gemini_404s(self) -> None:
        result = check_visual_layout(
            None,
            True,
            vision_error="Gemini HTTP 404 at https://example/models/gemini-2.0-flash",
        )
        self.assertFalse(result.ran)
        self.assertIn("404", result.not_run_reason or "")

    def test_url_does_not_double_models_prefix(self) -> None:
        url = generate_content_url("models/gemini-2.5-flash", "k")
        self.assertIn("/v1beta/models/gemini-2.5-flash:generateContent", url)
        self.assertNotIn("models/models/", url)
        self.assertEqual(short_model_name("models/gemini-2.5-flash"), "gemini-2.5-flash")

    def test_list_payload_keeps_generate_content_models(self) -> None:
        names = models_from_list_payload(
            {
                "models": [
                    {
                        "name": "models/gemini-2.5-flash",
                        "supportedGenerationMethods": ["generateContent"],
                    },
                    {
                        "name": "models/gemini-2.0-flash",
                        "supportedGenerationMethods": ["embedContent"],
                    },
                ]
            }
        )
        self.assertEqual(names, ["gemini-2.5-flash"])
        self.assertEqual(
            preferred_model_order(["gemini-2.5-flash", "gemini-2.0-flash"]),
            ["gemini-2.5-flash", "gemini-2.0-flash"],
        )
        self.assertTrue(
            is_retryable_gemini_error(JobSpecError("Gemini HTTP 404 at /models/x"))
        )
        self.assertFalse(
            is_retryable_gemini_error(JobSpecError("Gemini HTTP 403 at /models/x"))
        )

    def test_review_uses_gemini_notes(self) -> None:
        from printsahaj_verify.checks.artwork_vs_approval import result_from_vision_wording
        from printsahaj_verify.models import CheckResult

        notes = _notes(wording_same=False, batch_on_label=False, mrp_on_label=False)
        review = build_review(
            [
                CheckResult(check_id="approval_sheet", title="Approval sheet"),
                result_from_vision_wording(notes),
                check_visual_layout(notes, True),
                check_label_marks(None, None, True, False, notes=notes),
            ],
            ["approval"],
        )
        approval = next(item for item in review["stages"] if item["stage_id"] == "approval")
        by_id = {item["id"]: item for item in approval["items"]}
        self.assertNotIn("same_job", by_id)
        self.assertEqual(by_id["wording"]["state"], "judge")
        self.assertEqual(by_id["batch"]["state"], "issue")
        self.assertIn(NO_BATCH, by_id["batch"]["detail"])
        self.assertIn(NO_MRP, by_id["mrp"]["detail"])
        blob = str(review).upper()
        self.assertNotIn("PASS", blob)
        self.assertNotIn("APPROVED", blob)
        self.assertNotIn("FAIL", blob)

    def test_gemini_http_is_parsed(self) -> None:
        root = Path(tempfile.mkdtemp())
        folder = create_or_update_job(
            {"job_id": "G1", "file_name": "ART", "customer": "ACME"},
            root=root,
        )
        document = __import__("pymupdf").open()
        page = document.new_page(width=80, height=60)
        page.draw_rect(page.rect, color=(1, 0, 0), fill=(1, 0, 0))
        png = page.get_pixmap().tobytes("png")
        document.close()
        save_upload("G1", "client_artwork", png, "label.png", root=root)
        write_text_pdf(folder / "a.pdf", "APPROVAL TEXT 6 COL LABEL SIZE 50 X 50 MM")
        save_upload("G1", "approval", (folder / "a.pdf").read_bytes(), "a.pdf", root=root)
        payload = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": json.dumps(
                                    {
                                        "wording_same": False,
                                        "wording_note": "net wt differs",
                                        "product_centered_both": True,
                                        "alignment_note": "bowl centred",
                                        "logo_same_place": True,
                                        "logo_note": "logo ok",
                                        "batch_on_label": False,
                                        "batch_note": "blank",
                                        "mrp_on_label": False,
                                        "mrp_note": "missing",
                                    }
                                )
                            }
                        ]
                    }
                }
            ]
        }
        fake = json.dumps(payload).encode("utf-8")
        listed = json.dumps(
            {
                "models": [
                    {
                        "name": "models/gemini-2.5-flash",
                        "supportedGenerationMethods": ["generateContent"],
                    }
                ]
            }
        ).encode("utf-8")
        with patch.dict("os.environ", {GEMINI_KEY_ENV: "test-key"}):
            self.assertTrue(gemini_configured())
            with patch(
                "printsahaj_verify.vision._get_gemini",
                return_value=listed,
            ), patch(
                "printsahaj_verify.vision._post_gemini",
                return_value=fake,
            ):
                _spec, results, _files = run_job(folder)
        wording = next(item for item in results if item.check_id == "artwork_vs_approval")
        marks = next(item for item in results if item.check_id == "label_marks")
        self.assertTrue(wording.ran)
        self.assertTrue(any("wording" in item.summary.lower() for item in wording.findings))
        self.assertTrue(any(NO_BATCH in item.summary for item in marks.findings))

    def test_404_retries_the_next_flash_model(self) -> None:
        root = Path(tempfile.mkdtemp())
        folder = create_or_update_job(
            {"job_id": "G2", "file_name": "ART", "customer": "ACME"},
            root=root,
        )
        document = __import__("pymupdf").open()
        page = document.new_page(width=80, height=60)
        page.draw_rect(page.rect, color=(0, 1, 0), fill=(0, 1, 0))
        png = page.get_pixmap().tobytes("png")
        document.close()
        save_upload("G2", "client_artwork", png, "label.png", root=root)
        write_text_pdf(folder / "a.pdf", "FIRST APPROVAL 6 COL LABEL SIZE 50 X 50 MM")
        save_upload("G2", "approval", (folder / "a.pdf").read_bytes(), "a.pdf", root=root)
        reply = json.dumps(
            {
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {
                                    "text": json.dumps(
                                        {
                                            "wording_same": True,
                                            "wording_note": "same",
                                            "product_centered_both": True,
                                            "alignment_note": "centred",
                                            "logo_same_place": True,
                                            "logo_note": "same place",
                                            "batch_on_label": True,
                                            "batch_note": "B1",
                                            "mrp_on_label": True,
                                            "mrp_note": "199",
                                        }
                                    )
                                }
                            ]
                        }
                    }
                ]
            }
        ).encode("utf-8")
        listed = json.dumps(
            {
                "models": [
                    {
                        "name": "models/gemini-2.0-flash",
                        "supportedGenerationMethods": ["generateContent"],
                    },
                    {
                        "name": "models/gemini-2.5-flash",
                        "supportedGenerationMethods": ["generateContent"],
                    },
                ]
            }
        ).encode("utf-8")
        calls: list[str] = []

        def fake_post(url: str, _body: bytes, _timeout: int) -> bytes:
            calls.append(url.split("?", 1)[0])
            if "gemini-2.5-flash:" in url:
                raise JobSpecError(
                    "Gemini HTTP 404 at "
                    "https://generativelanguage.googleapis.com/v1beta/models/"
                    "gemini-2.5-flash:generateContent"
                )
            return reply

        with patch.dict("os.environ", {GEMINI_KEY_ENV: "test-key"}):
            with patch(
                "printsahaj_verify.vision._get_gemini",
                return_value=listed,
            ), patch(
                "printsahaj_verify.vision._post_gemini",
                side_effect=fake_post,
            ):
                notes = compare_label_previews(
                    folder / "client_artwork.png",
                    folder / "approval.pdf",
                )
        self.assertIsNotNone(notes)
        assert notes is not None
        self.assertEqual(notes.source, "gemini:gemini-2.0-flash")
        self.assertTrue(any("gemini-2.5-flash" in url for url in calls))
        self.assertTrue(any("gemini-2.0-flash" in url for url in calls))

    def test_check_continues_when_every_model_404s(self) -> None:
        root = Path(tempfile.mkdtemp())
        folder = create_or_update_job(
            {"job_id": "G3", "file_name": "ART", "customer": "ACME"},
            root=root,
        )
        document = __import__("pymupdf").open()
        page = document.new_page(width=80, height=60)
        page.draw_rect(page.rect, color=(0, 0, 1), fill=(0, 0, 1))
        png = page.get_pixmap().tobytes("png")
        document.close()
        save_upload("G3", "client_artwork", png, "label.png", root=root)
        write_text_pdf(folder / "a.pdf", "FIRST APPROVAL 6 COL LABEL SIZE 50 X 50 MM")
        save_upload("G3", "approval", (folder / "a.pdf").read_bytes(), "a.pdf", root=root)

        def boom(url: str, _body: bytes, _timeout: int) -> bytes:
            raise JobSpecError(f"Gemini HTTP 404 at {url.split('?', 1)[0]}")

        with patch.dict("os.environ", {GEMINI_KEY_ENV: "test-key"}):
            with patch(
                "printsahaj_verify.vision._get_gemini",
                return_value=b'{"models":[]}',
            ), patch(
                "printsahaj_verify.vision._post_gemini",
                side_effect=boom,
            ):
                _spec, results, _files = run_job(folder)
        wording = next(item for item in results if item.check_id == "artwork_vs_approval")
        layout = next(item for item in results if item.check_id == "visual_layout")
        marks = next(item for item in results if item.check_id == "label_marks")
        sheet = next(item for item in results if item.check_id == "approval_sheet")
        self.assertFalse(wording.ran)
        self.assertIn("404", wording.not_run_reason or "")
        self.assertFalse(layout.ran)
        self.assertIn("404", layout.not_run_reason or "")
        self.assertFalse(marks.ran)
        self.assertIn("404", marks.not_run_reason or "")
        self.assertTrue(sheet.ran)


if __name__ == "__main__":
    unittest.main()
