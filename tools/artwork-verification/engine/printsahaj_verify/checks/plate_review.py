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
    """``(page_number, ink name)`` for each real plate page.

    ``page_number`` is the actual PDF page (1-based), so it still points at
    the right page in the file even when a vendor's own report cover sits
    at page 1 and is excluded here.
    """
    plate_pages = separations.plate_pages
    colorants = separations.plate_page_colorants
    offset = len(separations.pages) - len(plate_pages)
    count = max(len(plate_pages), len(colorants))
    rows: list[tuple[int, str]] = []
    for index in range(count):
        name = ""
        if index < len(colorants):
            name = normalise_ink_name(colorants[index])
        if not name and index < len(separations.colorants):
            name = normalise_ink_name(separations.colorants[index])
        rows.append((index + 1 + offset, name or "unnamed"))
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
        if note.text_on_plate:
            observations[f"plate_{page}_text"] = note.text_on_plate
        if note.text_not_on_plate:
            observations[f"plate_{page}_text_not"] = note.text_not_on_plate
        if note.images_note:
            observations[f"plate_{page}_images"] = note.images_note
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
