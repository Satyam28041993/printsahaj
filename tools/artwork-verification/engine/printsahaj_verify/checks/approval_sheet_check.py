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
            not_run_reason="First approval file is missing",
        )
    if not is_pdf(path):
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=(
                "First approval is an image. The colour line is read from a PDF. "
                "Compare the preview by eye."
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
                summary="No colour line (for example 5 COL + UV) could be read on the approval sheet.",
                certainty=Certainty.DETERMINISTIC,
                expected="N COL + special units",
                found="no colour line",
                location="First approval PDF",
            )
        )
    upper = sheet.raw_text.upper()
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
        "has_mrp": "yes" if "MRP" in upper else "no",
        "has_batch": "yes" if "BATCH" in upper else "no",
    }
    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations=observations,
    )
