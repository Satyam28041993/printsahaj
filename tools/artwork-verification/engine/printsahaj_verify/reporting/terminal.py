"""Plain-text report for the terminal.

Never writes PASS, APPROVED, FAIL, or COMPLIANT. Findings, flags, and
what was not checked are separate blocks.
"""

from __future__ import annotations

from printsahaj_verify.job_spec import JobSpec
from printsahaj_verify.models import Certainty, CheckResult

#: Words this product is forbidden to use as a verdict.
FORBIDDEN_VERDICT_WORDS: tuple[str, ...] = (
    "PASS",
    "APPROVED",
    "FAIL",
    "COMPLIANT",
)

NOT_CHECKED_LINES: tuple[str, ...] = (
    "Colour shade / accuracy",
    "Trap and overprint intent",
    "Design / aesthetics",
    "Print photo text, alignment and logo (automatic)",
)


def format_report(job: JobSpec, results: list[CheckResult]) -> str:
    """Render one job's check results as a terminal report."""
    certain = [
        finding
        for result in results
        for finding in result.findings
        if finding.certainty is Certainty.DETERMINISTIC
    ]
    advisory = [
        finding
        for result in results
        for finding in result.findings
        if finding.certainty is Certainty.ADVISORY
    ]
    not_run = [result for result in results if not result.ran]

    lines: list[str] = []
    lines.append("PrintSahaj — PrintVerify")
    lines.append(f"Job {job.job_id}   {job.file_name}")
    lines.append(f"Customer   {job.customer}")
    lines.append("")

    lines.append("FINDINGS (certain)")
    if certain:
        for finding in certain:
            lines.append(f"- {finding.summary}")
            if finding.expected:
                lines.append(f"  Expected: {finding.expected}")
            if finding.found:
                lines.append(f"  Found:    {finding.found}")
            if finding.location:
                lines.append(f"  Look at:  {finding.location}")
    else:
        lines.append("- None")
    lines.append("")

    lines.append("FLAGS (please judge)")
    if advisory:
        for finding in advisory:
            lines.append(f"- {finding.summary}")
            if finding.location:
                lines.append(f"  Look at:  {finding.location}")
    else:
        lines.append("- None")
    lines.append("")

    if not_run:
        lines.append("CHECKS NOT RUN")
        for result in not_run:
            lines.append(f"- {result.title}: {result.not_run_reason}")
        lines.append("")

    lines.append("NOT CHECKED")
    for item in NOT_CHECKED_LINES:
        lines.append(f"- {item}")
    lines.append("")

    ran = sum(1 for result in results if result.ran)
    lines.append(
        f"{len(certain)} finding(s), {len(advisory)} flag(s). "
        f"Checks run: {ran}. Checks not run: {len(not_run)}."
    )
    report = "\n".join(lines)

    upper = report.upper()
    for word in FORBIDDEN_VERDICT_WORDS:
        if word in upper:
            raise RuntimeError(
                f"Reporter produced a forbidden verdict word: {word}"
            )
    return report
