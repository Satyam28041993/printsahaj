"""Can we read the colour line the client signed on the first-approval sheet?"""

from __future__ import annotations

from pathlib import Path

from printsahaj_verify.approval_sheet import ApprovalSheet, parse_approval_sheet
from printsahaj_verify.files import is_pdf
from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "approval_sheet"
CHECK_TITLE = "Approval sheet"


def check_approval_sheet(path: Path | None) -> CheckResult:
    """Read colour line and label size. Does not say the sheet is signed off."""
    if path is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="First approval file nahi hai",
        )
    if not is_pdf(path):
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=(
                "First approval ek image hai. Colour line PDF se padhi jati hai. "
                "Preview aankh se dekho."
            ),
        )
    try:
        sheet = parse_approval_sheet(path)
    except JobSpecError as error:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=str(error),
        )
    return _result_from_sheet(sheet)


def _result_from_sheet(sheet: ApprovalSheet) -> CheckResult:
    findings: list[Finding] = []
    if not sheet.colour_declaration:
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary="Approval sheet par colour line (jaise 5 COL + UV) nahi padhi.",
                certainty=Certainty.DETERMINISTIC,
                expected="N COL + special units",
                found="no colour line",
                location="First approval PDF",
            )
        )
    observations = {
        "colour_declaration": sheet.colour_declaration or "none",
        "colour_list": ", ".join(sheet.colour_list) if sheet.colour_list else "none",
        "special_units": ", ".join(sheet.special_units) if sheet.special_units else "none",
        "label_mm": (
            f"{sheet.label_width_mm} x {sheet.label_height_mm}"
            if sheet.label_width_mm and sheet.label_height_mm
            else "none"
        ),
        "product_name": sheet.product_name or "none",
    }
    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations=observations,
    )
