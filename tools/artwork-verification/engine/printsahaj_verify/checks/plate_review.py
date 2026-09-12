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
NOT_READ = (
    "Text and images on this plate were not read automatically. "
    "Set a Gemini key, or open this plate preview next to the artwork."
)


def plate_identities(separations: DocumentText) -> list[tuple[int, str]]:
    """``(page_number, ink name)`` for each SEP page."""
    count = max(len(separations.pages), len(separations.page_colorants))
    rows: list[tuple[int, str]] = []
    for index in range(count):
        name = ""
        if index < len(separations.page_colorants):
            name = normalise_ink_name(separations.page_colorants[index])
        if not name and index < len(separations.colorants):
            name = normalise_ink_name(separations.colorants[index])
        rows.append((index + 1, name or "unnamed"))
    return rows


def check_plate_review(
    separations: DocumentText | None,
    notes: tuple[PlateVisionNote, ...] | None = None,
    vision_error: str | None = None,
) -> CheckResult:
    """Name each SEP page. Gemini notes become advisory findings."""
    if separations is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Separations PDF not found",
        )
    identities = plate_identities(separations)
    if not identities:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="No separation pages to review",
        )

    by_page = {note.page: note for note in notes or ()}
    findings: list[Finding] = []
    observations: dict[str, str] = {
        "plate_count": str(len(identities)),
        "verified": "yes" if notes else "no",
    }
    if vision_error and notes is None:
        observations["vision"] = vision_error
    elif notes is None:
        observations["vision"] = NOT_READ

    for page, name in identities:
        observations[f"plate_{page}_name"] = name
        note = by_page.get(page)
        if note is None:
            observations[f"plate_{page}_same"] = "unread"
            extra = UV_NOTE if ("UV" in name or "VARNISH" in name) else ""
            observations[f"plate_{page}_note"] = extra or NOT_READ
            continue
        flag = (
            "match"
            if note.matter_same is True
            else "mismatch"
            if note.matter_same is False
            else "unread"
        )
        observations[f"plate_{page}_same"] = flag
        detail = note.note or name
        if note.uv_cutouts is True:
            observations[f"plate_{page}_uv"] = "unvarnished window"
            detail = detail + " " + UV_NOTE
        observations[f"plate_{page}_note"] = detail
        if note.matter_same is False:
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"Plate {page} ({note.name or name}): "
                        + (note.note or "Matter does not look the same as the artwork.")
                    ),
                    certainty=Certainty.ADVISORY,
                    expected="Same shape and wording as the artwork and first-approval label",
                    found=note.note or "differs",
                    location=f"Separations page {page}",
                )
            )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations=observations,
    )
