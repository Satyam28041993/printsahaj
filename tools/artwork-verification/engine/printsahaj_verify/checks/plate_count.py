"""Check A — declared printing units versus separation page count."""

from __future__ import annotations

from printsahaj_verify.job_spec import JobSpec
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "plate_count"
CHECK_TITLE = "Plate count"


def check_plate_count(job: JobSpec, separation_page_count: int) -> CheckResult:
    """Compare declared units (colours + specials) with separation pages.

    A mismatch is deterministic: it is arithmetic. The report names the
    special units so a human can see what is likely absent (e.g. varnish).
    It does not say PASS or FAIL.
    """
    if not job.has_colour_line:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Colour line not entered on the job yet",
        )
    if separation_page_count < 0:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Separation page count cannot be negative",
        )

    expected = job.declared_units
    observations = {
        "colour_declaration": job.colour_declaration,
        "colour_count": str(len(job.colour_list)),
        "special_units": ", ".join(job.special_units) if job.special_units else "none",
        "declared_units": str(expected),
        "separation_pages": str(separation_page_count),
    }

    if expected == separation_page_count:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            observations=observations,
        )

    missing = expected - separation_page_count
    if missing > 0 and job.special_units:
        specials = ", ".join(job.special_units)
        summary = (
            f"Declared {expected} units ({job.colour_declaration}), "
            f"found {separation_page_count} separation pages. "
            f"{missing} unit(s) missing. Special units declared: {specials}."
        )
    elif missing > 0:
        summary = (
            f"Declared {expected} units ({job.colour_declaration}), "
            f"found {separation_page_count} separation pages. "
            f"{missing} unit(s) missing."
        )
    else:
        extra = separation_page_count - expected
        summary = (
            f"Declared {expected} units ({job.colour_declaration}), "
            f"found {separation_page_count} separation pages. "
            f"{extra} extra page(s)."
        )

    finding = Finding(
        check_id=CHECK_ID,
        summary=summary,
        certainty=Certainty.DETERMINISTIC,
        expected=f"{expected} units ({job.colour_declaration})",
        found=f"{separation_page_count} separation pages",
        location="Job sheet colour line vs separation PDF page count",
    )
    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=[finding],
        observations=observations,
    )
