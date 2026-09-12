"""Step-by-step checks, approval-sheet parse, and the short checklist."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import pymupdf

from printsahaj_verify.approval_sheet import parse_approval_sheet
from printsahaj_verify.job_codes import guess_file_role, job_codes_in_text
from printsahaj_verify.job_spec import JobSpecError, parse_colour_declaration
from printsahaj_verify.reporting.checklist import STATE_ISSUE, build_checklist
from printsahaj_verify.reporting.json_report import build_report
from printsahaj_verify.run import run_job, run_stage
from printsahaj_verify.store import create_or_update_job, save_upload
from tests.helpers import kalonji_spec


def write_text_pdf(path: Path, text: str) -> None:
    document = pymupdf.open()
    page = document.new_page()
    page.insert_textbox(page.rect + (36, 36, -36, -36), text, fontsize=11)
    document.save(path)
    document.close()


AYUVYA_TEXT = (
    "HERBAL HILLS  File Name:- AYUVYA I GAIN 90 TABLETS AT 279  "
    "5 COL + MATT LAMINATION + RAYS UV  FLEXO  "
    "YELLOW MAGENTA CYAN BLACK RAYS UV P P WHITE  168 mm X 53 mm"
)

BIN_VENDOR_TEXT = (
    "CGM2026-27-9824_BIN FARUQ KALONJI OIL 50ML LABEL 13-Aug-26 Col: 7 "
    "PLATE : 1.14MM LABEL SIZE : 57.150 X 95.250MM CLY: 298.450MM "
    "PAPER SIZE : 132.150MM Cyan Magenta Yellow Black GOLD P 7483 C UV"
)


class SpecialUnitTests(unittest.TestCase):
    def test_matt_lamination_and_rays_uv(self) -> None:
        count, extras = parse_colour_declaration("5 COL + MATT LAMINATION + RAYS UV")
        self.assertEqual(count, 5)
        self.assertEqual(extras, ("Lamination", "UV"))

    def test_unknown_still_loud(self) -> None:
        with self.assertRaises(JobSpecError):
            parse_colour_declaration("6 COL + GLITTER")


class ApprovalAndCodesTests(unittest.TestCase):
    def test_parse_ayuvya_style_sheet(self) -> None:
        path = Path(tempfile.mkdtemp()) / "approval.pdf"
        write_text_pdf(path, AYUVYA_TEXT)
        sheet = parse_approval_sheet(path)
        self.assertIn("5 COL", sheet.colour_declaration or "")
        self.assertEqual(sheet.special_units, ("Lamination", "UV"))
        self.assertEqual(sheet.label_width_mm, 168.0)
        self.assertEqual(sheet.label_height_mm, 53.0)
        self.assertEqual(len(sheet.colour_list), 5)

    def test_filename_roles_and_codes(self) -> None:
        self.assertEqual(
            job_codes_in_text("SEP---CGM2026-27-9824_BIN FARUQ.pdf"),
            ("CGM2026-27-9824",),
        )
        self.assertEqual(
            guess_file_role("SEP---CGM2026-27-9824_BIN FARUQ.pdf"),
            "separations",
        )
        self.assertEqual(
            guess_file_role("AYUVYA LABEL FOR APPROVAL.pdf"),
            "approval",
        )
        self.assertEqual(
            guess_file_role("CGM2026-27-9824_BIN FARUQ KALONJI.pdf"),
            "vendor_composite",
        )
        self.assertEqual(guess_file_role("label.png"), "client_artwork")


class MixedJobTests(unittest.TestCase):
    def test_ayuvya_on_kalonji_job_is_an_issue(self) -> None:
        root = Path(tempfile.mkdtemp())
        folder = create_or_update_job(
            {
                "job_id": "CGM2026-27-1326",
                "file_name": "DAILY KALONJI 100 ML",
                "customer": "DAILY PHARMA",
                "colour_declaration": "6 COL + VARNISH",
                "colour_list": [
                    "Yellow",
                    "Magenta",
                    "Cyan",
                    "Black",
                    "Gold",
                    "P 7483 C",
                ],
            },
            root=root,
        )
        scratch = Path(tempfile.mkdtemp())
        approval = scratch / "a.pdf"
        write_text_pdf(approval, AYUVYA_TEXT)
        save_upload(
            "CGM2026-27-1326",
            "approval",
            approval.read_bytes(),
            "AYUVYA LABEL FOR APPROVAL.pdf",
            root=root,
        )
        vendor = scratch / "v.pdf"
        write_text_pdf(vendor, BIN_VENDOR_TEXT)
        save_upload(
            "CGM2026-27-1326",
            "vendor_composite",
            vendor.read_bytes(),
            "CGM2026-27-9824_BIN FARUQ.pdf",
            root=root,
        )
        spec, results, _files = run_job(folder)
        self.assertEqual(spec.job_id, "CGM2026-27-1326")
        identity = next(item for item in results if item.check_id == "job_identity")
        self.assertTrue(identity.findings)
        checklist = build_checklist(results, ["approval"])
        self.assertEqual(checklist["overall"], STATE_ISSUE)
        self.assertEqual(checklist["overall_label"], "Issue found")
        blob = str(checklist).upper()
        self.assertNotIn("PASS", blob)
        self.assertNotIn("APPROVED", blob)
        self.assertNotIn("FAIL", blob)

    def test_vendor_step_locked_until_approval_checked(self) -> None:
        folder = create_or_update_job(
            {
                "job_id": "JOB9",
                "file_name": "TEST",
                "customer": "ACME",
            },
            root=Path(tempfile.mkdtemp()),
        )
        with self.assertRaises(JobSpecError):
            run_stage(folder, "vendor")

    def test_bin_faruq_seven_pages_match_col_seven(self) -> None:
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
        write_text_pdf(vendor, BIN_VENDOR_TEXT)
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
        plate = next(item for item in results if item.check_id == "plate_count")
        self.assertTrue(plate.ran)
        self.assertEqual(len(plate.findings), 0)

    def test_kalonji_six_pages_still_caught(self) -> None:
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
        spec, results, files = run_job(folder)
        plate = next(item for item in results if item.check_id == "plate_count")
        self.assertTrue(plate.ran)
        self.assertEqual(len(plate.findings), 1)
        report = build_report(spec, results, files, {}, ["approval", "vendor"])
        self.assertEqual(report["checklist"]["overall"], STATE_ISSUE)
        self.assertNotIn("PASS", str(report))
        self.assertNotIn("FAIL", str(report))
        self.assertNotIn("APPROVED", str(report))


if __name__ == "__main__":
    unittest.main()
