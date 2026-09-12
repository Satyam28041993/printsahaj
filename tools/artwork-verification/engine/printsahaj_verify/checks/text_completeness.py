"""Check C — text on the approved file versus text on the separations."""

from __future__ import annotations

from printsahaj_verify.extract import DocumentText
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "text_completeness"
CHECK_TITLE = "Text completeness"
#: Ignore tokens this short — they are usually codes or crumbs.
SAMPLE_LIMIT = 20


def _unique(tokens: list[str]) -> list[str]:
    seen: list[str] = []
    for token in tokens:
        if token not in seen:
            seen.append(token)
    return seen


def check_text_completeness(
    approved: DocumentText | None,
    separations: DocumentText | None,
) -> CheckResult:
    """Text on the approval/artwork that is on no plate will not print."""
    if approved is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Approval PDF (or client artwork) not found",
        )
    if separations is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Separations PDF not found",
        )

    approved_tokens = set(_unique(approved.all_tokens))
    plate_tokens = set(_unique(separations.all_tokens))

    missing_on_plates = sorted(approved_tokens - plate_tokens)
    extra_on_plates = sorted(plate_tokens - approved_tokens)

    findings: list[Finding] = []
    if missing_on_plates:
        sample = ", ".join(missing_on_plates[:SAMPLE_LIMIT])
        more = len(missing_on_plates) - min(len(missing_on_plates), SAMPLE_LIMIT)
        extra = f" (+{more} more)" if more > 0 else ""
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=(
                    f"{len(missing_on_plates)} text token(s) are on the approved "
                    f"file but on no separation page, so they will not print. "
                    f"Examples: {sample}{extra}."
                ),
                certainty=Certainty.DETERMINISTIC,
                expected="approved text present on at least one plate",
                found=f"{len(missing_on_plates)} token(s) missing from plates",
                location="Approved PDF vs merged separations",
            )
        )
    if extra_on_plates:
        sample = ", ".join(extra_on_plates[:SAMPLE_LIMIT])
        more = len(extra_on_plates) - min(len(extra_on_plates), SAMPLE_LIMIT)
        extra = f" (+{more} more)" if more > 0 else ""
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=(
                    f"{len(extra_on_plates)} text token(s) are on a separation "
                    f"but not on the approved file. Examples: {sample}{extra}."
                ),
                certainty=Certainty.ADVISORY,
                expected="separation text also present on the approved file",
                found=f"{len(extra_on_plates)} token(s) only on plates",
                location="Merged separations vs approved PDF",
            )
        )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations={
            "approved_tokens": str(len(approved_tokens)),
            "plate_tokens": str(len(plate_tokens)),
            "missing_on_plates": str(len(missing_on_plates)),
            "extra_on_plates": str(len(extra_on_plates)),
        },
    )
