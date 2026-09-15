"""Reporter wording and the Kalonji folder run."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import pymupdf

from printsahaj_verify.checks.plate_count import check_plate_count
from printsahaj_verify.job_spec import JobSpecError, load_job_spec
from printsahaj_verify.models import CheckResult
from printsahaj_verify.reporting.terminal import (
    FORBIDDEN_VERDICT_WORDS,
    format_report,
)
from printsahaj_verify.run import run_job
from tests.helpers import kalonji_spec

KALONJI_JOB = (
    Path(__file__).resolve().parents[2] / "samples" / "kalonji" / "job.json"
)


def write_blank_pdf(path: Path, pages: int) -> None:
    document = pymupdf.open()
    for _ in range(pages):
        document.new_page()
    document.save(path)
    document.close()


class ReporterTests(unittest.TestCase):
    def test_separates_findings_from_not_checked(self) -> None:
        job = kalonji_spec()
        report = format_report(job, [check_plate_count(job, 6)])
        self.assertIn("FINDINGS (certain)", report)
        self.assertIn("FLAGS (please judge)", report)
        self.assertIn("NOT CHECKED", report)
        self.assertIn("Colour shade / accuracy", report)
        for word in FORBIDDEN_VERDICT_WORDS:
            self.assertNotIn(word, report)

    def test_unrun_check_is_stated(self) -> None:
        job = kalonji_spec()
        unrun = CheckResult(
            check_id="plate_count",
            title="Plate count",
            not_run_reason="Separations PDF not found",
        )
        report = format_report(job, [unrun])
        self.assertIn("CHECKS NOT RUN", report)
        self.assertIn("Separations PDF not found", report)


class KalonjiRegressionTests(unittest.TestCase):
    """Regression test #1: 7 declared units, 6 separation pages."""

    def test_job_json_loads(self) -> None:
        spec = load_job_spec(KALONJI_JOB)
        self.assertEqual(spec.declared_units, 7)

    def test_six_page_set_is_caught(self) -> None:
        folder = Path(tempfile.mkdtemp())
        (folder / "job.json").write_text(
            KALONJI_JOB.read_text(encoding="utf-8"),
            encoding="utf-8",
        )
        write_blank_pdf(folder / "separations.pdf", 6)
        job, results, _files = run_job(folder)
        plate = next(item for item in results if item.check_id == "plate_count")
        self.assertEqual(job.declared_units, 7)
        self.assertTrue(plate.ran)
        self.assertEqual(len(plate.findings), 1)
        report = format_report(job, results)
        self.assertIn("Varnish", report)
        self.assertIn("6", plate.findings[0].found or "")
        for word in FORBIDDEN_VERDICT_WORDS:
            self.assertNotIn(word, report)

    def test_missing_pdf_is_stated_not_skipped(self) -> None:
        folder = KALONJI_JOB.parent
        job, results, _files = run_job(folder)
        plate = next(item for item in results if item.check_id == "plate_count")
        self.assertEqual(job.job_id, "CGM2026-27-1326")
        self.assertFalse(plate.ran)
        self.assertIn("not found", (plate.not_run_reason or "").lower())

    def test_ambiguous_pdfs_are_loud(self) -> None:
        folder = Path(tempfile.mkdtemp())
        (folder / "job.json").write_text(
            KALONJI_JOB.read_text(encoding="utf-8"),
            encoding="utf-8",
        )
        write_blank_pdf(folder / "a.pdf", 6)
        write_blank_pdf(folder / "b.pdf", 6)
        with self.assertRaises(JobSpecError):
            run_job(folder)


if __name__ == "__main__":
    unittest.main()
