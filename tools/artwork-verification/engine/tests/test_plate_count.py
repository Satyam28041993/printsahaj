"""Tests for Check A — plate count."""

from __future__ import annotations

import unittest

from printsahaj_verify.checks.plate_count import check_plate_count
from printsahaj_verify.models import Certainty
from tests.helpers import kalonji_spec


class PlateCountTests(unittest.TestCase):
    def test_kalonji_six_pages_is_a_finding(self) -> None:
        result = check_plate_count(kalonji_spec(), 6)
        self.assertTrue(result.ran)
        self.assertEqual(len(result.findings), 1)
        finding = result.findings[0]
        self.assertIs(finding.certainty, Certainty.DETERMINISTIC)
        self.assertIn("7", finding.expected or "")
        self.assertIn("6", finding.found or "")
        self.assertIn("Varnish", finding.summary)

    def test_matching_counts_have_no_finding(self) -> None:
        result = check_plate_count(kalonji_spec(), 7)
        self.assertTrue(result.ran)
        self.assertEqual(result.findings, [])

    def test_extra_pages_are_a_finding(self) -> None:
        result = check_plate_count(kalonji_spec(), 8)
        self.assertEqual(len(result.findings), 1)
        self.assertIn("extra", result.findings[0].summary.lower())

    def test_negative_page_count_does_not_run(self) -> None:
        result = check_plate_count(kalonji_spec(), -1)
        self.assertFalse(result.ran)
        self.assertIsNotNone(result.not_run_reason)


if __name__ == "__main__":
    unittest.main()
