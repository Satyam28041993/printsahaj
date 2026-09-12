"""PDF or image uploads keep their suffix and stay out of the printout list."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import pymupdf

from printsahaj_verify.extract import render_preview_png
from printsahaj_verify.files import discover_job_files
from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.run import run_job
from printsahaj_verify.store import create_or_update_job, save_upload


def _red_png() -> bytes:
    document = pymupdf.open()
    page = document.new_page(width=80, height=60)
    page.draw_rect(page.rect, color=(1, 0, 0), fill=(1, 0, 0))
    data = page.get_pixmap().tobytes("png")
    document.close()
    return data


class UploadDiscoveryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.root = Path(tempfile.mkdtemp())

    def test_png_client_artwork_is_not_a_printout(self) -> None:
        folder = create_or_update_job(
            {"job_id": "P1", "file_name": "ART", "customer": "ACME"},
            root=self.root,
        )
        saved = save_upload("P1", "client_artwork", _red_png(), "art.png", root=self.root)
        self.assertEqual(saved.name, "client_artwork.png")
        files = discover_job_files(folder)
        self.assertEqual(files.client_artwork, saved)
        self.assertEqual(files.printouts, ())

    def test_preview_png_starts_with_png_header(self) -> None:
        folder = create_or_update_job(
            {"job_id": "P2", "file_name": "ART", "customer": "ACME"},
            root=self.root,
        )
        path = save_upload("P2", "approval", _red_png(), "ok.png", root=self.root)
        preview = render_preview_png(path, 1)
        self.assertTrue(preview.startswith(b"\x89PNG"))
        self.assertTrue(folder.is_dir())

    def test_image_client_does_not_break_plate_count(self) -> None:
        folder = create_or_update_job(
            {
                "job_id": "P3",
                "file_name": "DAILY KALONJI 100 ML",
                "customer": "DAILY PHARMA",
                "colour_declaration": "6 COL + VARNISH",
                "colour_list": ["Yellow", "Magenta", "Cyan", "Black", "Gold", "P 7483 C"],
            },
            root=self.root,
        )
        save_upload("P3", "client_artwork", _red_png(), "art.png", root=self.root)
        document = pymupdf.open()
        for _ in range(6):
            document.new_page()
        separations = folder / "separations.pdf"
        document.save(separations)
        document.close()
        _spec, results, files = run_job(folder)
        self.assertEqual(files.client_artwork.name, "client_artwork.png")
        plate = next(item for item in results if item.check_id == "plate_count")
        self.assertTrue(plate.ran)
        self.assertEqual(len(plate.findings), 1)
        artwork = next(item for item in results if item.check_id == "artwork_vs_approval")
        self.assertFalse(artwork.ran)
        self.assertIn("image", artwork.not_run_reason.lower())

    def test_bad_suffix_is_loud(self) -> None:
        create_or_update_job(
            {"job_id": "P4", "file_name": "ART", "customer": "ACME"},
            root=self.root,
        )
        with self.assertRaises(JobSpecError):
            save_upload("P4", "client_artwork", b"xx", "notes.txt", root=self.root)


if __name__ == "__main__":
    unittest.main()
