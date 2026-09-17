"""Batch number / date must be one value everywhere, and say so in red."""

from __future__ import annotations

import unittest

from printsahaj_verify.checks.batch_consistency import check_batch_consistency
from printsahaj_verify.models import Certainty
from printsahaj_verify.reporting.review import BAD_LINE_MARKER, build_review
from printsahaj_verify.vision import CompositeVisionNotes, PlateVisionNote, VisionNotes


def reference(batch: str = "", date: str = "") -> VisionNotes:
    return VisionNotes(
        wording_same=True,
        wording_note="",
        product_centered_both=True,
        alignment_note="",
        logo_same_place=True,
        logo_note="",
        batch_on_label=bool(batch),
        batch_note="",
        mrp_on_label=True,
        mrp_note="",
        source="test",
        batch_text=batch,
        mfg_date_text=date,
    )


def plate(batch: str = "", date: str = "") -> PlateVisionNote:
    return PlateVisionNote(
        page=4,
        name="Black",
        matter_same=True,
        note="",
        uv_cutouts=None,
        batch_text=batch,
        mfg_date_text=date,
    )


def composite(batch: str = "", date: str = "") -> CompositeVisionNotes:
    return CompositeVisionNotes(
        ups_count=2,
        all_ups_same=True,
        matches_artwork=True,
        matches_approval=True,
        damaged_up=None,
        note="",
        batch_text=batch,
        mfg_date_text=date,
    )


class BatchConsistencyTests(unittest.TestCase):
    def test_same_value_everywhere_is_not_a_finding(self) -> None:
        result = check_batch_consistency(
            reference("AM/KO/07/07/26"),
            (plate("AM/KO/07/07/26"),),
            composite("AM/KO/07/07/26"),
        )
        self.assertEqual(result.findings, [])
        self.assertEqual(result.observations["batch_artwork"], "AM/KO/07/07/26")

    def test_spacing_and_case_alone_are_not_a_mismatch(self) -> None:
        result = check_batch_consistency(
            reference("am/ko/07/07/26"),
            (plate("AM/KO/07/07/26  "),),
            None,
        )
        self.assertEqual(result.findings, [])

    def test_a_different_batch_on_the_plate_is_certain(self) -> None:
        result = check_batch_consistency(
            reference("AM/KO/07/07/26"),
            (plate("AM/KO/08/07/26"),),
            composite("AM/KO/07/07/26"),
        )
        self.assertEqual(len(result.findings), 1)
        finding = result.findings[0]
        self.assertIs(finding.certainty, Certainty.DETERMINISTIC)
        self.assertIn("AM/KO/08/07/26", finding.summary)
        self.assertIn("AM/KO/07/07/26", finding.summary)

    def test_a_different_date_is_also_caught(self) -> None:
        result = check_batch_consistency(
            reference("AM/KO/07/07/26", "13 JULY 2026"),
            (plate("AM/KO/07/07/26", "14 JULY 2026"),),
            None,
        )
        self.assertEqual(len(result.findings), 1)
        self.assertIn("Manufacturing date", result.findings[0].summary)

    def test_blank_on_the_artwork_is_a_coding_window_not_a_mismatch(self) -> None:
        # The artwork leaves the box empty on purpose; the press codes it.
        result = check_batch_consistency(
            reference(""),
            (plate("AM/KO/07/07/26"),),
            composite("AM/KO/07/07/26"),
        )
        self.assertEqual(result.findings, [])

    def test_nothing_read_does_not_run(self) -> None:
        result = check_batch_consistency(reference(""), (plate(),), composite())
        self.assertFalse(result.ran)

    def test_no_reference_does_not_run(self) -> None:
        result = check_batch_consistency(None, (plate("A1"),), None)
        self.assertFalse(result.ran)


class BatchReviewRowTests(unittest.TestCase):
    def _row(self, result_findings_source) -> dict[str, str]:
        review = build_review([result_findings_source], ["vendor"])
        vendor = next(
            item for item in review["stages"] if item["stage_id"] == "vendor"
        )
        return next(
            item for item in vendor["items"] if item["id"] == "batch_consistency"
        )

    def test_mismatch_row_is_red_and_marks_the_bad_line(self) -> None:
        result = check_batch_consistency(
            reference("AM/KO/07/07/26"),
            (plate("AM/KO/08/07/26"),),
            composite("AM/KO/07/07/26"),
        )
        row = self._row(result)
        self.assertEqual(row["state"], "issue")
        # The detail box marks only the line that disagrees.
        marked = [
            line
            for line in row["text_block"].splitlines()
            if line.startswith(BAD_LINE_MARKER)
        ]
        self.assertEqual(len(marked), 1)
        self.assertIn("AM/KO/08/07/26", marked[0])
        self.assertIn("Separation plate", marked[0])

    def test_matching_row_is_clear_with_no_marked_line(self) -> None:
        result = check_batch_consistency(
            reference("AM/KO/07/07/26"),
            (plate("AM/KO/07/07/26"),),
            composite("AM/KO/07/07/26"),
        )
        row = self._row(result)
        self.assertEqual(row["state"], "clear")
        self.assertNotIn(BAD_LINE_MARKER, row["text_block"])
        self.assertIn("AM/KO/07/07/26", row["text_block"])
