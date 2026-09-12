"""Checks for the full job workflow: two vendor PDFs, approval, geometry."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import pymupdf

from printsahaj_verify.checks.colour_names import check_colour_names
from printsahaj_verify.checks.geometry import check_geometry
from printsahaj_verify.extract import parse_vendor_header, read_document_text
from printsahaj_verify.job_spec import load_job_spec
from printsahaj_verify.models import Certainty
from printsahaj_verify.run import run_job
from printsahaj_verify.store import create_or_update_job, save_upload
from tests.helpers import kalonji_spec


def write_text_pdf(path: Path, pages: list[str]) -> None:
    document = pymupdf.open()
    for text in pages:
        page = document.new_page()
        page.insert_text((40, 40), text, fontsize=11)
    document.save(path)
    document.close()


class HeaderParseTests(unittest.TestCase):
    def test_kalonji_style_header(self) -> None:
        header = parse_vendor_header(
            "PLATE : 1.14MM LABEL SIZE : 76.000 X 114MM CLY: 238.125MM "
            "PAPER SIZE : 169MM Col: 6"
        )
        self.assertEqual(header.cylinder_repeat_mm, 238.125)
        self.assertEqual(header.paper_width_mm, 169.0)
        self.assertEqual(header.label_width_mm, 76.0)
        self.assertEqual(header.label_height_mm, 114.0)
        self.assertEqual(header.col_count, 6)
        result = check_geometry(kalonji_spec(), header)
        self.assertTrue(result.ran)
        col_findings = [item for item in result.findings if "Col:" in item.summary]
        self.assertEqual(len(col_findings), 1)


class ColourNameTests(unittest.TestCase):
    def test_missing_gold_and_varnish(self) -> None:
        folder = Path(tempfile.mkdtemp())
        path = folder / "separations.pdf"
        write_text_pdf(
            path,
            [
                "Cyan plate Col: 6",
                "Magenta",
                "Yellow",
                "Black",
                "617 Gold band",
                "7483 DAILY PHARMA",
            ],
        )
        result = check_colour_names(kalonji_spec(), read_document_text(path))
        self.assertTrue(result.ran)
        varnish = [item for item in result.findings if "Varnish" in item.summary]
        self.assertEqual(len(varnish), 1)
        self.assertIs(varnish[0].certainty, Certainty.DETERMINISTIC)


class StoreAndRunTests(unittest.TestCase):
    def test_create_job_upload_and_catch_plate_gap(self) -> None:
        root = Path(tempfile.mkdtemp())
        payload = {
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
            "special_units": ["Varnish"],
            "label_size_mm": [114, 76],
            "print_type": "Flexo",
            "mandatory_texts": ["DAILY PHARMA"],
        }
        folder = create_or_update_job(payload, root=root)
        spec = load_job_spec(folder / "job.json")
        self.assertEqual(spec.declared_units, 7)

        approval = Path(tempfile.mkdtemp()) / "a.pdf"
        write_text_pdf(approval, ["DAILY KALONJI DAILY PHARMA 100 ML"])
        save_upload(
            "CGM2026-27-1326",
            "approval",
            approval.read_bytes(),
            "approval.pdf",
            root=root,
        )

        separations = Path(tempfile.mkdtemp()) / "s.pdf"
        write_text_pdf(
            separations,
            [
                "Cyan Col: 6",
                "Magenta Col: 6",
                "Yellow Col: 6",
                "Black Col: 6 ingredients",
                "617 Col: 6",
                "7483 Col: 6 DAILY PHARMA",
            ],
        )
        save_upload(
            "CGM2026-27-1326",
            "separations",
            separations.read_bytes(),
            "separations.pdf",
            root=root,
        )

        job, results, files = run_job(folder)
        self.assertIsNotNone(files.separations)
        plate = next(item for item in results if item.check_id == "plate_count")
        self.assertEqual(len(plate.findings), 1)
        single = next(item for item in results if item.check_id == "plate_text_map")
        self.assertTrue(
            any("only" in finding.summary for finding in single.findings)
        )
        self.assertEqual(job.job_id, "CGM2026-27-1326")


if __name__ == "__main__":
    unittest.main()
