"""Every up on the vendor composite versus artwork and first approval."""

from __future__ import annotations

from pathlib import Path

from printsahaj_verify.models import Certainty, CheckResult, Finding
from printsahaj_verify.vision import CompositeVisionNotes

CHECK_ID = "composite_matter"
CHECK_TITLE = "Composite ups vs artwork"

NOT_READ = (
    "Each up's text and images were not read automatically. "
    "Set a Gemini key, or open the composite next to the artwork "
    "and the first-approval label."
)


def check_composite_matter(
    composite: Path | None,
    counted_ups: int | None,
    notes: CompositeVisionNotes | None = None,
    vision_error: str | None = None,
    coding_panel: bool | None = None,
) -> CheckResult:
    """Say whether every up matches the artwork and first-approval label."""
    if composite is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Vendor composite PDF not found",
        )

    observations: dict[str, str] = {
        "counted_ups": str(counted_ups) if counted_ups is not None else "none",
        "verified": "yes" if notes else "no",
        "coding_panel": (
            "yes" if coding_panel is True else "no" if coding_panel is False else "unread"
        ),
    }
    if notes is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=vision_error or NOT_READ,
            observations=observations,
        )

    findings: list[Finding] = []
    if notes.ups_count is not None:
        observations["vision_ups"] = str(notes.ups_count)
    observations["all_ups_same"] = (
        "yes"
        if notes.all_ups_same is True
        else "no"
        if notes.all_ups_same is False
        else "unread"
    )
    observations["matches_artwork"] = (
        "yes"
        if notes.matches_artwork is True
        else "no"
        if notes.matches_artwork is False
        else "unread"
    )
    observations["matches_approval"] = (
        "yes"
        if notes.matches_approval is True
        else "no"
        if notes.matches_approval is False
        else "unread"
    )
    observations["note"] = notes.note or "none"
    if notes.damaged_up:
        observations["damaged_up"] = str(notes.damaged_up)

    if notes.all_ups_same is False or notes.damaged_up:
        which = f" Up {notes.damaged_up}." if notes.damaged_up else ""
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=(
                    "One or more ups on the vendor composite do not match "
                    "the other labels."
                    + which
                    + ((" " + notes.note) if notes.note else "")
                ),
                certainty=Certainty.ADVISORY,
                expected="Every up has the same text and images",
                found=notes.note or "ups differ",
                location="Vendor composite",
            )
        )
    if notes.matches_artwork is False or notes.matches_approval is False:
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=(
                    "Composite label matter does not look the same as the "
                    "client artwork and/or the first-approval label. "
                    + (notes.note or "")
                ),
                certainty=Certainty.ADVISORY,
                expected="Same wording and images as artwork and first approval",
                found=notes.note or "differs",
                location="Vendor composite vs artwork / first approval",
            )
        )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations=observations,
    )
