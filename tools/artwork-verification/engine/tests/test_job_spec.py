"""Tests for the typed job sheet."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from printsahaj_verify.job_spec import (
    JobSpecError,
    load_job_spec,
    parse_colour_declaration,
)


class ParseColourDeclarationTests(unittest.TestCase):
    def test_six_col_plus_varnish(self) -> None:
        count, extras = parse_colour_declaration("6 COL + VARNISH")
        self.assertEqual(count, 6)
        self.assertEqual(extras, ("Varnish",))

    def test_plain_colour_count(self) -> None:
        count, extras = parse_colour_declaration("4 COL")
        self.assertEqual(count, 4)
        self.assertEqual(extras, ())

    def test_unknown_extra_is_loud(self) -> None:
        with self.assertRaises(JobSpecError):
            parse_colour_declaration("6 COL + GLITTER")

    def test_missing_number_is_loud(self) -> None:
        with self.assertRaises(JobSpecError):
            parse_colour_declaration("COL + VARNISH")


class LoadJobSpecTests(unittest.TestCase):
    def _write(self, payload: dict) -> Path:
        folder = Path(tempfile.mkdtemp())
        path = folder / "job.json"
        path.write_text(json.dumps(payload), encoding="utf-8")
        return path

    def _valid(self) -> dict:
        return {
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
        }

    def test_kalonji_declares_seven_units(self) -> None:
        spec = load_job_spec(self._write(self._valid()))
        self.assertEqual(spec.declared_units, 7)
        self.assertEqual(spec.special_units, ("Varnish",))

    def test_list_mismatch_is_loud(self) -> None:
        payload = self._valid()
        payload["colour_list"] = ["Cyan", "Magenta", "Yellow", "Black"]
        with self.assertRaises(JobSpecError):
            load_job_spec(self._write(payload))

    def test_special_mismatch_is_loud(self) -> None:
        payload = self._valid()
        payload["special_units"] = ["White"]
        with self.assertRaises(JobSpecError):
            load_job_spec(self._write(payload))

    def test_missing_file_is_loud(self) -> None:
        with self.assertRaises(JobSpecError):
            load_job_spec(Path("/tmp/printsahaj-missing-job.json"))


if __name__ == "__main__":
    unittest.main()
