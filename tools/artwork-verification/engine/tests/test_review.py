"""Point-wise review: ticks, crosses, and compare-by-eye rows."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import pymupdf

from printsahaj_verify.reporting.checklist import STATE_ISSUE
from printsahaj_verify.reporting.review import build_review
from printsahaj_verify.run import run_job, run_stage
from printsahaj_verify.store import (
    create_or_update_job,
    delete_all_jobs,
    save_upload,
)
from tests.helpers import kalonji_spec
from tests.test_stages import BIN_VENDOR_TEXT, write_text_pdf


class ReviewTests(unittest.TestCase):
    def test_kalonji_missing_varnish_is_a_red_cross(self) -> None:
        root = Path(tempfile.mkdtemp())
        folder = create_or_update_job(
            {
                "job_id": kalonji_spec().job_id,
                "file_name": kalonji_spec().file_name,
                "customer": kalonji_spec().customer,
                "colour_declaration": "6 COL + VARNISH",
                "colour_list": list(kalonji_spec().colour_list),
            },
            root=root,
        )
        document = pymupdf.open()
        for _ in range(6):
            document.new_page()
        sep = folder / "s.pdf"
        document.save(sep)
        document.close()
        save_upload(
            kalonji_spec().job_id,
            "separations",
            sep.read_bytes(),
            "separations.pdf",
            root=root,
        )
        _spec, results, _files = run_job(folder)
        review = build_review(results, ["approval", "vendor"])
        vendor = next(item for item in review["stages"] if item["stage_id"] == "vendor")
        plates = next(item for item in vendor["items"] if item["id"] == "plates")
        self.assertEqual(plates["state"], STATE_ISSUE)
        self.assertIn("6", plates["detail"])
        blob = str(review).upper()
        self.assertNotIn("PASS", blob)
        self.assertNotIn("APPROVED", blob)
        self.assertNotIn("FAIL", blob)

    def test_approval_logo_and_alignment_are_compare_by_eye(self) -> None:
        root = Path(tempfile.mkdtemp())
        folder = create_or_update_job(
            {"job_id": "R1", "file_name": "ART", "customer": "ACME"},
            root=root,
        )
        document = pymupdf.open()
        page = document.new_page(width=80, height=60)
        page.draw_rect(page.rect, color=(1, 0, 0), fill=(1, 0, 0))
        png = page.get_pixmap().tobytes("png")
        document.close()
        save_upload("R1", "client_artwork", png, "label.png", root=root)
        write_text_pdf(folder / "a.pdf", "6 COL LABEL SIZE 50 X 50 MM")
        save_upload("R1", "approval", (folder / "a.pdf").read_bytes(), "a.pdf", root=root)
        _spec, results, _files, _checked = run_stage(folder, "approval")
        review = build_review(results, ["approval"])
        approval = next(item for item in review["stages"] if item["stage_id"] == "approval")
        by_id = {item["id"]: item for item in approval["items"]}
        self.assertNotIn("same_job", by_id)
        self.assertEqual(by_id["alignment"]["state"], "wait")
        self.assertEqual(by_id["logo"]["state"], "wait")
        self.assertIn("gemini", by_id["alignment"]["detail"].lower())
        self.assertTrue(any("alignment" in line.lower() for line in approval["not_checked"]))

    def test_vendor_header_mentions_become_ticks(self) -> None:
        root = Path(tempfile.mkdtemp())
        folder = create_or_update_job(
            {
                "job_id": "CGM2026-27-9824",
                "file_name": "BIN FARUQ KALONJI OIL 50ML",
                "customer": "BIN FARUQ",
            },
            root=root,
        )
        vendor = folder / "v.pdf"
        write_text_pdf(
            vendor,
            BIN_VENDOR_TEXT + " 13 UPS ACROSS : 7 AROUND : 2",
        )
        save_upload(
            "CGM2026-27-9824",
            "vendor_composite",
            vendor.read_bytes(),
            "CGM2026-27-9824_BIN FARUQ.pdf",
            root=root,
        )
        document = pymupdf.open()
        for _ in range(7):
            document.new_page()
        sep = folder / "s.pdf"
        document.save(sep)
        document.close()
        save_upload(
            "CGM2026-27-9824",
            "separations",
            sep.read_bytes(),
            "SEP---CGM2026-27-9824.pdf",
            root=root,
        )
        run_stage(folder, "approval")
        _spec, results, _files, _checked = run_stage(folder, "vendor")
        review = build_review(results, ["approval", "vendor"])
        vendor_stage = next(item for item in review["stages"] if item["stage_id"] == "vendor")
        by_id = {item["id"]: item for item in vendor_stage["items"]}
        self.assertEqual(by_id["plates"]["state"], "clear")
        self.assertEqual(by_id["cylinder"]["state"], "clear")
        self.assertEqual(by_id["paper"]["state"], "clear")
        self.assertEqual(by_id["ups"]["state"], "clear")
        self.assertIn("298.450", by_id["cylinder"]["detail"])
        self.assertIn("13", by_id["ups"]["detail"])

    def test_vendor_wording_findings_do_not_use_verdict_words(self) -> None:
        root = Path(tempfile.mkdtemp())
        folder = create_or_update_job(
            {"job_id": "V1", "file_name": "ART", "customer": "ACME"},
            root=root,
        )
        write_text_pdf(folder / "a.pdf", "HELLO WORLD MRP 10")
        save_upload("V1", "approval", (folder / "a.pdf").read_bytes(), "a.pdf", root=root)
        write_text_pdf(folder / "v.pdf", "CGM Col: 1 CLY: 31.750MM PAPER SIZE : 50MM LABEL SIZE : 10 X 10MM 1 UPS")
        save_upload("V1", "vendor_composite", (folder / "v.pdf").read_bytes(), "v.pdf", root=root)
        write_text_pdf(folder / "s.pdf", "PLATE ONE")
        save_upload("V1", "separations", (folder / "s.pdf").read_bytes(), "s.pdf", root=root)
        run_stage(folder, "approval")
        _spec, results, _files, checked = run_stage(folder, "vendor")
        review = build_review(results, checked)
        from printsahaj_verify.reporting.checklist import build_checklist
        checklist = build_checklist(results, checked)
        blob = (str(review) + str(checklist)).upper()
        self.assertNotIn("APPROVED", blob)
        self.assertNotIn("PASS", blob)
        self.assertNotIn("FAIL", blob)

    def test_delete_all_jobs_empties_the_root(self) -> None:
        root = Path(tempfile.mkdtemp())
        create_or_update_job(
            {"job_id": "OLD1", "file_name": "ART", "customer": "ACME"},
            root=root,
        )
        create_or_update_job(
            {"job_id": "OLD2", "file_name": "ART", "customer": "ACME"},
            root=root,
        )
        self.assertEqual(delete_all_jobs(root=root), 2)
        self.assertEqual(list(root.iterdir()), [])


if __name__ == "__main__":
    unittest.main()
