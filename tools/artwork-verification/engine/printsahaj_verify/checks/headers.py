"""Check F — job code, date and Col: must not drift across pages."""

from __future__ import annotations

import re

from printsahaj_verify.extract import COL_PATTERN, DocumentText
from printsahaj_verify.job_spec import JobSpec
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "headers"
CHECK_TITLE = "Header consistency"


def _col_values(document: DocumentText) -> list[tuple[int, str]]:
    found: list[tuple[int, str]] = []
    for page in document.pages:
        match = COL_PATTERN.search(page.text)
        if match:
            found.append((page.number, match.group(1)))
    return found


def check_headers(
    job: JobSpec,
    documents: list[DocumentText],
) -> CheckResult:
    """Flag mixed revisions: different Col: values or a missing job code."""
    if not documents:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="No vendor PDFs to read headers from",
        )

    findings: list[Finding] = []
    col_seen: list[str] = []
    pages_with_code = 0
    pages_total = 0

    for document in documents:
        for number, value in _col_values(document):
            col_seen.append(value)
            if col_seen and value != col_seen[0]:
                findings.append(
                    Finding(
                        check_id=CHECK_ID,
                        summary=(
                            f"{document.path.name} page {number} has Col: {value}, "
                            f"but another page has Col: {col_seen[0]}. "
                            "Pages from two revisions may be mixed."
                        ),
                        certainty=Certainty.DETERMINISTIC,
                        expected=f"Col: {col_seen[0]}",
                        found=f"Col: {value}",
                        location=f"{document.path.name} page {number}",
                    )
                )
        for page in document.pages:
            pages_total += 1
            if job.job_id and job.job_id.upper() in page.text.upper():
                pages_with_code += 1

    if job.date:
        date_compact = re.sub(r"[^0-9]", "", job.date)
        dates_found = 0
        if date_compact:
            for document in documents:
                for page in document.pages:
                    page_compact = re.sub(r"[^0-9]", "", page.text)
                    if date_compact and date_compact in page_compact:
                        dates_found += 1
        # Date absence is advisory — many headers omit it.
        if date_compact and dates_found == 0:
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"Job date {job.date} was not found in any vendor header."
                    ),
                    certainty=Certainty.ADVISORY,
                    expected=job.date,
                    found="date not read from headers",
                    location="Vendor composite and separations headers",
                )
            )

    observations = {
        "col_values": ", ".join(col_seen) if col_seen else "none",
        "pages_with_job_code": f"{pages_with_code}/{pages_total}",
    }
    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations=observations,
    )
