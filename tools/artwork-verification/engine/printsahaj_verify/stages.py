"""Verification happens in three steps. Not everything at once."""

from __future__ import annotations

from dataclasses import dataclass

STAGE_APPROVAL = "approval"
STAGE_VENDOR = "vendor"
STAGE_PRINT = "print"
STAGE_ORDER: tuple[str, ...] = (STAGE_APPROVAL, STAGE_VENDOR, STAGE_PRINT)

STAGE_TITLES: dict[str, str] = {
    STAGE_APPROVAL: "1. First approval",
    STAGE_VENDOR: "2. Vendor plates",
    STAGE_PRINT: "3. Printout",
}

STAGE_HINTS: dict[str, str] = {
    STAGE_APPROVAL: "Client artwork and the first-approval sheet, where colours and plates are written.",
    STAGE_VENDOR: "Vendor composite (ups, cylinder, paper) and SEP separations (one page per plate).",
    STAGE_PRINT: "Photo after the machine print. No automatic grade — compare by eye.",
}

STAGE_SLOTS: dict[str, tuple[str, ...]] = {
    STAGE_APPROVAL: ("client_artwork", "approval"),
    STAGE_VENDOR: ("vendor_composite", "separations"),
    STAGE_PRINT: ("printout",),
}

STAGE_CHECKS: dict[str, tuple[str, ...]] = {
    STAGE_APPROVAL: (
        "job_identity",
        "approval_sheet",
        "artwork_vs_approval",
        "visual_layout",
        "label_marks",
    ),
    STAGE_VENDOR: (
        "job_identity",
        "plate_count",
        "colour_names",
        "geometry",
        "plate_review",
        "headers",
        "text_completeness",
        "plate_text_map",
    ),
    STAGE_PRINT: ("printout",),
}


@dataclass(frozen=True)
class StageDef:
    """One human step in the desk."""

    stage_id: str
    title: str
    hint: str
    slots: tuple[str, ...]
    check_ids: tuple[str, ...]


def stage_definitions() -> tuple[StageDef, ...]:
    """The three steps, in order."""
    return tuple(
        StageDef(
            stage_id=stage_id,
            title=STAGE_TITLES[stage_id],
            hint=STAGE_HINTS[stage_id],
            slots=STAGE_SLOTS[stage_id],
            check_ids=STAGE_CHECKS[stage_id],
        )
        for stage_id in STAGE_ORDER
    )


def previous_stage(stage_id: str) -> str | None:
    """Stage that must be checked before this one, or None for the first."""
    if stage_id not in STAGE_ORDER:
        return None
    index = STAGE_ORDER.index(stage_id)
    if index == 0:
        return None
    return STAGE_ORDER[index - 1]
