"""Check D — which plate holds which text, and single-plate warnings."""

from __future__ import annotations

from printsahaj_verify.extract import DocumentText, normalise_token
from printsahaj_verify.job_spec import JobSpec
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "plate_text_map"
CHECK_TITLE = "Per-plate text map"


def check_plate_text_map(
    job: JobSpec,
    separations: DocumentText | None,
) -> CheckResult:
    """Flag mandatory wording that sits on only one plate."""
    if separations is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Separations PDF not found",
        )
    if not job.mandatory_texts:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="No mandatory texts typed on the job (e.g. manufacturer name)",
            observations={
                "pages": str(len(separations.pages)),
            },
        )

    findings: list[Finding] = []
    observations: dict[str, str] = {}

    for phrase in job.mandatory_texts:
        needle = normalise_token(phrase)
        pages = [
            page.number
            for page in separations.pages
            if needle in normalise_token(page.text)
        ]
        observations[phrase] = (
            f"pages {pages}" if pages else "not found on any plate"
        )
        if not pages:
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"Mandatory text {phrase!r} was not found on any "
                        "separation page."
                    ),
                    certainty=Certainty.DETERMINISTIC,
                    expected=f"{phrase} on at least one plate",
                    found="not found",
                    location="Separations text",
                )
            )
        elif len(pages) == 1:
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"Mandatory text {phrase!r} sits on plate page "
                        f"{pages[0]} only. If that unit fails, the label "
                        "loses a required field."
                    ),
                    certainty=Certainty.ADVISORY,
                    expected="more than one plate, if the process allows",
                    found=f"page {pages[0]} only",
                    location=f"Separations page {pages[0]}",
                )
            )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations=observations,
    )
