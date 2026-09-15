"""Vendor-step review: colour names, cylinder teeth, ups, label match."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import pymupdf

from printsahaj_verify.checks.colour_names import check_colour_names, plate_name_list
from printsahaj_verify.checks.geometry import check_geometry
from printsahaj_verify.checks.composite_matter import check_composite_matter
from printsahaj_verify.checks.plate_review import check_plate_review
from printsahaj_verify.checks.text_completeness import NO_PLATE_TEXT, check_text_completeness
from printsahaj_verify.extract import (
    DocumentText,
    PageText,
    coding_panel_on_file,
    count_label_frames,
    parse_vendor_header,
    render_preview_png,
)
from printsahaj_verify.probe import page_colorant_from_xref_text
from printsahaj_verify.reporting.review import build_review
from printsahaj_verify.vision import (
    COMPOSITE_REVIEW_PROMPT,
    PLATE_REVIEW_PROMPT,
    CompositeVisionNotes,
    PlateVisionNote,
    claims_missing_coding_panel,
    composite_notes_from_payload,
    correct_composite_notes,
    plate_notes_from_payload,
)
from tests.helpers import kalonji_spec
from tests.test_stages import BIN_VENDOR_TEXT


def _pages(count: int) -> list[PageText]:
    return [PageText(index + 1, "", []) for index in range(count)]


class ColourNameUvTests(unittest.TestCase):
    def test_uv_plate_matches_varnish_special_unit(self) -> None:
        document = DocumentText(
            path=Path("separations.pdf"),
            pages=_pages(7),
            colorants=["Cyan", "Magenta", "Yellow", "Black", "GOLD", "P#207483#20C", "UV"],
            page_colorants=["Cyan", "Magenta", "Yellow", "Black", "GOLD", "P 7483 C", "UV"],
        )
        result = check_colour_names(kalonji_spec(), document)
        self.assertTrue(result.ran)
        varnish = [item for item in result.findings if "Varnish" in item.summary]
        self.assertEqual(varnish, [])
        self.assertIn("7 UV", result.observations["plate_names"])
        self.assertIn("1 CYAN", plate_name_list(document))

    def test_device_colorant_strips_hash20(self) -> None:
        name = page_colorant_from_xref_text(
            "/SeparationInfo << /DeviceColorant /P#207483#20C >>"
        )
        self.assertEqual(name, "P 7483 C")
        self.assertEqual(
            page_colorant_from_xref_text("/SeparationInfo << /DeviceColorant /UV >>"),
            "UV",
        )


class GeometryReviewTests(unittest.TestCase):
    def test_cylinder_shows_mm_and_teeth(self) -> None:
        header = parse_vendor_header(BIN_VENDOR_TEXT)
        result = check_geometry(kalonji_spec(), header)
        self.assertIn("298.450 mm", result.observations["cylinder_written"])
        self.assertIn("94 teeth", result.observations["cylinder_written"])
        self.assertIn("3.175", result.observations["cylinder_written"])

    def test_label_size_matches_first_approval_when_swapped(self) -> None:
        header = parse_vendor_header(BIN_VENDOR_TEXT)
        result = check_geometry(
            kalonji_spec(),
            header,
            approval_label_mm=(95.25, 57.15),
        )
        self.assertEqual(result.observations["label_matches_approval"], "yes")
        mismatches = [
            item for item in result.findings if "first-approval" in item.summary
        ]
        self.assertEqual(mismatches, [])

    def test_label_size_mismatch_is_flagged(self) -> None:
        header = parse_vendor_header(BIN_VENDOR_TEXT)
        result = check_geometry(
            kalonji_spec(),
            header,
            approval_label_mm=(50.0, 50.0),
        )
        self.assertEqual(result.observations["label_matches_approval"], "no")
        self.assertTrue(
            any("does not match the first-approval" in item.summary for item in result.findings)
        )


class UpsFrameTests(unittest.TestCase):
    def test_green_punch_frames_count_as_ups(self) -> None:
        path = Path(tempfile.mkdtemp()) / "comp.pdf"
        document = pymupdf.open()
        page = document.new_page(width=829, height=375)
        # 57.15 x 95.25 mm ≈ 162 x 270 pt. Use the real-job punch size.
        boxes = [
            (6, 20),
            (282, 20),
            (558, 20),
            (6, 193),
            (282, 193),
            (558, 193),
        ]
        for x0, y0 in boxes:
            page.draw_rect(
                pymupdf.Rect(x0, y0, x0 + 265.1, y0 + 162.6),
                color=(0, 0.65, 0.32),
                fill=(0, 0.65, 0.32),
            )
        document.save(path)
        document.close()
        count = count_label_frames(path, 57.15, 95.25)
        self.assertEqual(count, 6)
        header = parse_vendor_header(
            "LABEL SIZE : 57.150 X 95.250MM CLY: 298.450MM PAPER SIZE : 132.150MM"
        )
        result = check_geometry(kalonji_spec(), header, composite_path=path)
        self.assertEqual(result.observations["ups_written"], "6")
        self.assertEqual(result.observations["ups_source"], "punch_frames")


class TextLayerTests(unittest.TestCase):
    def test_outlined_plates_do_not_invent_missing_tokens(self) -> None:
        approval = DocumentText(
            path=Path("a.pdf"),
            pages=[PageText(1, "BIN FARUQ KALONJI OIL BATCH MRP", ["BIN", "FARUQ"])],
        )
        plates = DocumentText(path=Path("s.pdf"), pages=_pages(7))
        result = check_text_completeness(approval, plates)
        self.assertFalse(result.ran)
        self.assertEqual(result.not_run_reason, NO_PLATE_TEXT)


class PlateReviewTests(unittest.TestCase):
    def test_lists_uv_cutout_note_and_advisory_mismatch(self) -> None:
        document = DocumentText(
            path=Path("s.pdf"),
            pages=_pages(7),
            page_colorants=["Cyan", "Magenta", "Yellow", "Black", "GOLD", "P 7483 C", "UV"],
        )
        notes = (
            PlateVisionNote(1, "Cyan", True, "bowl and FSSAI on cyan", False),
            PlateVisionNote(7, "UV", True, "windows for batch and MRP", True),
        )
        result = check_plate_review(document, notes)
        self.assertTrue(result.ran)
        self.assertEqual(result.observations["plate_7_name"], "UV")
        self.assertEqual(result.observations["plate_1_same"], "match")
        self.assertIn("unvarnished", result.observations["plate_7_note"])
        self.assertEqual(result.findings, [])
        bad = check_plate_review(
            document,
            (PlateVisionNote(1, "Cyan", False, "bowl shape differs", False),),
        )
        self.assertEqual(len(bad.findings), 1)
        self.assertEqual(bad.findings[0].certainty.value, "advisory")

    def test_payload_parser(self) -> None:
        notes = plate_notes_from_payload(
            {
                "plates": [
                    {
                        "page": 1,
                        "name": "Cyan",
                        "matter_same": True,
                        "note": "ok",
                        "uv_cutouts": False,
                    }
                ]
            }
        )
        self.assertEqual(notes[0].name, "Cyan")
        self.assertTrue(notes[0].matter_same)


class PreviewWidthTests(unittest.TestCase):
    def test_viewer_width_renders_a_wider_png(self) -> None:
        path = Path(tempfile.mkdtemp()) / "wide.pdf"
        document = pymupdf.open()
        document.new_page(width=829, height=375)
        document.save(path)
        document.close()
        thumb = render_preview_png(path, 1)
        wide = render_preview_png(path, 1, max_width_px=2800)
        self.assertTrue(thumb.startswith(b"\x89PNG"))
        self.assertTrue(wide.startswith(b"\x89PNG"))
        self.assertGreater(len(wide), len(thumb))


class VendorReviewCopyTests(unittest.TestCase):
    def test_review_names_teeth_and_wording_explain(self) -> None:
        from printsahaj_verify.models import CheckResult

        colours = check_colour_names(
            kalonji_spec(),
            DocumentText(
                path=Path("s.pdf"),
                pages=_pages(7),
                colorants=["Cyan", "Magenta", "Yellow", "Black", "GOLD", "P 7483 C", "UV"],
                page_colorants=["Cyan", "Magenta", "Yellow", "Black", "GOLD", "P 7483 C", "UV"],
            ),
        )
        header = parse_vendor_header(BIN_VENDOR_TEXT)
        geometry = check_geometry(kalonji_spec(), header, approval_label_mm=(95.25, 57.15))
        plates = CheckResult(
            check_id="plate_count",
            title="Plate count",
            observations={"separation_pages": "7", "declared_units": "7"},
        )
        look = check_plate_review(
            DocumentText(
                path=Path("s.pdf"),
                pages=_pages(7),
                page_colorants=["Cyan", "Magenta", "Yellow", "Black", "GOLD", "P 7483 C", "UV"],
            )
        )
        wording = check_text_completeness(
            DocumentText(path=Path("a.pdf"), pages=[PageText(1, "HELLO", ["HELLO"])]),
            DocumentText(path=Path("s.pdf"), pages=_pages(7)),
        )
        review = build_review(
            [plates, colours, geometry, look, wording],
            ["vendor"],
        )
        vendor = next(item for item in review["stages"] if item["stage_id"] == "vendor")
        by_id = {item["id"]: item for item in vendor["items"]}
        self.assertIn("7 SEP pages", by_id["plates"]["detail"])
        self.assertNotIn("1 CYAN", by_id["plates"]["detail"])
        self.assertNotIn("1 CYAN", by_id["sep_colours"]["detail"])
        self.assertIn("94 teeth", by_id["cylinder"]["detail"])
        self.assertIn("matches first-approval", by_id["label"]["detail"])
        self.assertNotIn("wording_on_plates", by_id)
        self.assertEqual(by_id["plate_7"]["state"], "wait")
        self.assertIn("UV", by_id["plate_7"]["title"])
        self.assertEqual(by_id["ups_matter"]["state"], "wait")
        titles = [item["title"] for item in vendor["items"]]
        self.assertEqual(sum(1 for title in titles if "CYAN" in title.upper()), 1)
        blob = str(review).upper()
        self.assertNotIn("PASS", blob)
        self.assertNotIn("APPROVED", blob)
        self.assertNotIn("FAIL", blob)

    def test_verified_plates_and_ups_show_detail(self) -> None:
        from printsahaj_verify.models import CheckResult

        look = check_plate_review(
            DocumentText(
                path=Path("s.pdf"),
                pages=_pages(2),
                page_colorants=["Cyan", "UV"],
            ),
            notes=(
                PlateVisionNote(1, "Cyan", True, "bowl and FSSAI on cyan only", False),
                PlateVisionNote(2, "UV", True, "windows left for batch and MRP", True),
            ),
        )
        composite = check_composite_matter(
            Path("v.pdf"),
            6,
            CompositeVisionNotes(
                ups_count=6,
                all_ups_same=True,
                matches_artwork=True,
                matches_approval=True,
                damaged_up=None,
                note="All 6 ups match the artwork and the first-approval label.",
            ),
        )
        review = build_review(
            [
                CheckResult(
                    check_id="plate_count",
                    title="Plate count",
                    observations={"separation_pages": "2", "declared_units": "2"},
                ),
                look,
                composite,
            ],
            ["vendor"],
        )
        vendor = next(item for item in review["stages"] if item["stage_id"] == "vendor")
        by_id = {item["id"]: item for item in vendor["items"]}
        self.assertEqual(by_id["plate_1"]["state"], "clear")
        self.assertIn("bowl", by_id["plate_1"]["detail"])
        self.assertEqual(by_id["plate_2"]["state"], "clear")
        self.assertIn("windows", by_id["plate_2"]["detail"])
        self.assertEqual(by_id["ups_matter"]["state"], "clear")
        self.assertIn("6 ups", by_id["ups_matter"]["detail"])
        parsed = composite_notes_from_payload(
            {
                "ups_count": 6,
                "all_ups_same": True,
                "matches_artwork": True,
                "matches_approval": False,
                "damaged_up": 3,
                "note": "up 3 text cropped",
            }
        )
        self.assertEqual(parsed.damaged_up, 3)
        self.assertFalse(parsed.matches_approval)
        blob = str(review).upper()
        self.assertNotIn("PASS", blob)
        self.assertNotIn("APPROVED", blob)
        self.assertNotIn("FAIL", blob)


def _two_up_composite(with_coding_panel: bool) -> Path:
    """Two landscape ups with green punch strokes. Optional white coding box."""
    path = Path(tempfile.mkdtemp()) / "ups.pdf"
    document = pymupdf.open()
    page = document.new_page(width=560, height=200)
    boxes = [(8, 18), (288, 18)]
    for x0, y0 in boxes:
        frame = pymupdf.Rect(x0, y0, x0 + 265.1, y0 + 162.6)
        page.draw_rect(frame, color=(0, 0, 0), fill=(0.05, 0.05, 0.05))
        page.draw_rect(frame, color=(0, 0.65, 0.32), width=2)
        if with_coding_panel:
            white = pymupdf.Rect(x0 + 170, y0 + 12, x0 + 252, y0 + 78)
            page.draw_rect(white, color=(1, 1, 1), fill=(1, 1, 1))
    document.save(path)
    document.close()
    return path


class CodingPanelTests(unittest.TestCase):
    def test_white_coding_panel_is_seen_on_each_up(self) -> None:
        path = _two_up_composite(with_coding_panel=True)
        self.assertTrue(coding_panel_on_file(path, 57.15, 95.25))

    def test_black_right_side_is_not_a_coding_panel(self) -> None:
        path = _two_up_composite(with_coding_panel=False)
        self.assertFalse(coding_panel_on_file(path, 57.15, 95.25))

    def test_gemini_missing_box_claim_is_recognised(self) -> None:
        note = (
            "There are 6 ups arranged in a 2x3 grid, and all ups match each "
            "other with none damaged. However, they do not match the client "
            "artwork or first-approval label because the white batch coding "
            "box beside Batch No., Pkd., and M.R.P. is missing across all ups."
        )
        self.assertTrue(claims_missing_coding_panel(note))
        self.assertFalse(claims_missing_coding_panel("All 6 ups match each other."))

    def test_false_missing_box_claim_is_dropped(self) -> None:
        notes = CompositeVisionNotes(
            ups_count=6,
            all_ups_same=True,
            matches_artwork=False,
            matches_approval=False,
            damaged_up=None,
            note=(
                "they do not match because the white batch coding box beside "
                "Batch No., Pkd., and M.R.P. is missing across all ups."
            ),
        )
        fixed = correct_composite_notes(notes, True, True)
        self.assertTrue(fixed.matches_artwork)
        self.assertTrue(fixed.matches_approval)
        self.assertIn("coding panel is present", fixed.note.lower())
        result = check_composite_matter(Path("v.pdf"), 6, fixed, coding_panel=True)
        self.assertEqual(result.findings, [])
        self.assertEqual(result.observations["coding_panel"], "yes")

    def test_uploaded_bin_faruq_composite_has_coding_panel(self) -> None:
        uploads = Path("/home/ubuntu/.cursor/projects/workspace/uploads")
        matches = list(uploads.glob("CGM2026-27-9824*.pdf")) if uploads.is_dir() else []
        if not matches:
            self.skipTest("uploaded Bin Faruq composite is not on this machine")
        self.assertTrue(coding_panel_on_file(matches[0], 57.15, 95.25))

    def test_missing_box_claim_kept_when_panel_absent(self) -> None:
        notes = CompositeVisionNotes(
            ups_count=6,
            all_ups_same=True,
            matches_artwork=False,
            matches_approval=False,
            damaged_up=None,
            note="the white batch coding box is missing across all ups.",
        )
        kept = correct_composite_notes(notes, False, True)
        self.assertFalse(kept.matches_artwork)
        result = check_composite_matter(Path("v.pdf"), 6, kept, coding_panel=False)
        self.assertEqual(len(result.findings), 1)
        self.assertEqual(result.findings[0].certainty.value, "advisory")


class PlateTextReviewTests(unittest.TestCase):
    def test_prompts_ask_for_text_on_each_ink(self) -> None:
        self.assertIn("text_on_plate", PLATE_REVIEW_PROMPT)
        self.assertIn("coding window", COMPOSITE_REVIEW_PROMPT)
        self.assertIn("blank", COMPOSITE_REVIEW_PROMPT.lower())

    def test_payload_keeps_text_on_this_ink(self) -> None:
        notes = plate_notes_from_payload(
            {
                "plates": [
                    {
                        "page": 1,
                        "name": "Cyan",
                        "matter_same": True,
                        "note": "process cyan in the bowl only",
                        "uv_cutouts": False,
                        "text_on_plate": "no body copy",
                        "text_not_on_plate": "Bin Faruq, ingredients table",
                        "images_note": "bowl tonal values, FSSAI mark",
                    }
                ]
            }
        )
        self.assertEqual(notes[0].text_on_plate, "no body copy")
        self.assertIn("Bin Faruq", notes[0].text_not_on_plate)
        self.assertIn("bowl", notes[0].images_note)

    def test_review_row_lists_text_separate_from_images(self) -> None:
        from printsahaj_verify.models import CheckResult

        look = check_plate_review(
            DocumentText(
                path=Path("s.pdf"),
                pages=_pages(1),
                page_colorants=["Black"],
            ),
            notes=(
                PlateVisionNote(
                    1,
                    "Black",
                    True,
                    "type sits on black",
                    False,
                    "Ingredients, Nutritional Facts, Daily Pharma address",
                    "Bin Faruq, Kalonji Oil (gold)",
                    "solid background and knockouts",
                ),
            ),
        )
        review = build_review(
            [
                CheckResult(
                    check_id="plate_count",
                    title="Plate count",
                    observations={"separation_pages": "1", "declared_units": "1"},
                ),
                look,
            ],
            ["vendor"],
        )
        vendor = next(item for item in review["stages"] if item["stage_id"] == "vendor")
        by_id = {item["id"]: item for item in vendor["items"]}
        detail = by_id["plate_1"]["detail"]
        self.assertIn("Text on this ink:", detail)
        self.assertIn("Ingredients", detail)
        self.assertIn("Not on this ink:", detail)
        self.assertIn("Images:", detail)
        blob = str(review).upper()
        self.assertNotIn("PASS", blob)
        self.assertNotIn("APPROVED", blob)
        self.assertNotIn("FAIL", blob)


if __name__ == "__main__":
    unittest.main()
