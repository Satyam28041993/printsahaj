"""One row per separation plate: ink name, then optional Gemini matter notes."""

from __future__ import annotations

from printsahaj_verify.colour_map import normalise_ink_name
from printsahaj_verify.extract import DocumentText
from printsahaj_verify.models import Certainty, CheckResult, Finding
from printsahaj_verify.vision import PlateVisionNote

CHECK_ID = "plate_review"
CHECK_TITLE = "Plate-by-plate review"

UV_NOTE = (
    "UV / varnish plate. A cut-out or white window on this plate is the "
    "unvarnished area where batch number and MRP print."
)


def _plate_rows(separations: DocumentText) -> list[str]:
    rows: list[str] = []
    count = max(len(separations.pages), len(separations.page_colorants))
    for index in range(count):
        name = ""
        if index < len(separations.page_colorants):
            name = normalise_ink_name(separations.page_colorants[index])
        if not name and index < len(separations.colorants):
            name = normalise_ink_name(separations.colorants[index])
        label = name or "unnamed"
        extra = ""
        if "UV" in label or "VARNISH" in label:
            extra = " — " + UV_NOTE
        rows.append(f"Plate {index + 1}: {label}{extra}")
    return rows


def check_plate_review(
    separations: DocumentText | None,
    notes: tuple[PlateVisionNote, ...] | None = None,
    vision_error: str | None = None,
) -> CheckResult:
    """List each SEP page. Gemini notes are advisory when present."""
    if separations is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Separations PDF not found",
        )
    rows = _plate_rows(separations)
    if not rows:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="No separation pages to review",
        )

    findings: list[Finding] = []
    observations: dict[str, str] = {
        "plate_count": str(len(rows)),
        "plates": " | ".join(rows),
    }
    if vision_error and notes is None:
        observations["vision"] = vision_error

    if notes:
        for note in notes:
            key = f"plate_{note.page}"
            observations[key] = note.note or note.name
            observations[f"{key}_same"] = (
                "match"
                if note.matter_same is True
                else "mismatch"
                if note.matter_same is False
                else "unread"
            )
            if note.uv_cutouts is True:
                observations[f"{key}_uv"] = "unvarnished window"
            if note.matter_same is False:
                findings.append(
                    Finding(
                        check_id=CHECK_ID,
                        summary=(
                            f"Plate {note.page} ({note.name or 'unnamed'}): "
                            + (note.note or "Matter does not look the same as the artwork.")
                        ),
                        certainty=Certainty.ADVISORY,
                        expected="Same shape and wording as the artwork on this ink",
                        found=note.note or "differs",
                        location=f"Separations page {note.page}",
                    )
                )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations=observations,
    )
