"""Bowl / product-image place and logo place on the two label pictures.

Pixels are not measured locally. When Gemini notes are present, those
answers become advisory findings. Otherwise the check is stated as not run.
"""

from __future__ import annotations

from printsahaj_verify.models import Certainty, CheckResult, Finding
from printsahaj_verify.vision import VisionNotes

CHECK_ID = "visual_layout"
CHECK_TITLE = "Image alignment and logo"

NO_BOTH = "Need client artwork and the first-approval file to compare layout."
NO_GEMINI = (
    "Pixel layout (bowl / product photo place and logo place) is not read "
    "from the files on this machine. Set PRINTSAHAJ_GEMINI_API_KEY to compare, "
    "or open both previews side by side."
)


def _flag(present: bool | None) -> str:
    if present is True:
        return "match"
    if present is False:
        return "mismatch"
    return "unread"


def check_visual_layout(
    notes: VisionNotes | None,
    have_both: bool,
    vision_error: str | None = None,
) -> CheckResult:
    """Compare product-image place and logo place. Advisory when Gemini ran."""
    if not have_both:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=NO_BOTH,
            observations={"alignment": "unread", "logo": "unread"},
        )
    if notes is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=vision_error or NO_GEMINI,
            observations={"alignment": "unread", "logo": "unread"},
        )

    findings: list[Finding] = []
    if notes.product_centered_both is False:
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=(
                    "Product image place does not look the same on both labels. "
                    + (notes.alignment_note or "Compare the two previews side by side.")
                ),
                certainty=Certainty.ADVISORY,
                expected="Main product photo in the same middle place on both",
                found=notes.alignment_note or "place differs",
                location="Client artwork vs first approval preview",
            )
        )
    if notes.logo_same_place is False:
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=(
                    "Logo place does not look the same on both labels. "
                    + (notes.logo_note or "Compare the two previews side by side.")
                ),
                certainty=Certainty.ADVISORY,
                expected="Logo in the same place on both",
                found=notes.logo_note or "place differs",
                location="Client artwork vs first approval preview",
            )
        )
    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations={
            "alignment": _flag(notes.product_centered_both),
            "logo": _flag(notes.logo_same_place),
            "alignment_note": notes.alignment_note or "none",
            "logo_note": notes.logo_note or "none",
            "source": notes.source,
        },
    )
