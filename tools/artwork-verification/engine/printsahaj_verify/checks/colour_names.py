"""Check B — job-sheet colour names versus inks found on the separations."""

from __future__ import annotations

from printsahaj_verify.colour_map import (
    load_colour_map,
    normalise_ink_name,
    production_names_for,
)
from printsahaj_verify.extract import DocumentText
from printsahaj_verify.job_spec import JobSpec
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "colour_names"
CHECK_TITLE = "Colour name mapping"


HEADER_WINDOW_CHARS = 400


def _names_from_separations(document: DocumentText) -> list[str]:
    names = [normalise_ink_name(item) for item in document.colorants]
    for page in document.pages:
        header = page.text[:HEADER_WINDOW_CHARS]
        for token in header.replace("/", " ").replace(":", " ").split():
            cleaned = normalise_ink_name(token)
            if len(cleaned) >= 2 and cleaned not in names:
                names.append(cleaned)
    return names


def check_colour_names(job: JobSpec, separations: DocumentText | None) -> CheckResult:
    """Map each declared colour onto a name found in the separation set."""
    if not job.has_colour_line:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Colour line not entered on the job yet",
        )
    if separations is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Separations PDF not found",
        )

    mapping = load_colour_map()
    found_names = _names_from_separations(separations)
    findings: list[Finding] = []
    matched: list[str] = []
    missing: list[str] = []

    for colour in job.colour_list:
        aliases = production_names_for(colour, mapping)
        if any(alias in found_names for alias in aliases):
            matched.append(colour)
        else:
            missing.append(colour)
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"Job sheet colour {colour!r} was not found on the "
                        f"separation set (looked for {', '.join(aliases)})."
                    ),
                    certainty=Certainty.DETERMINISTIC,
                    expected=colour,
                    found=", ".join(found_names) if found_names else "no ink names read",
                    location="Job sheet colour list vs separation inks / headers",
                )
            )

    for special in job.special_units:
        aliases = production_names_for(special, mapping) + [normalise_ink_name(special)]
        if not any(alias in found_names for alias in aliases):
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"Special unit {special!r} is on the job sheet but "
                        "no matching plate name was found in the separation set."
                    ),
                    certainty=Certainty.DETERMINISTIC,
                    expected=special,
                    found=", ".join(found_names) if found_names else "no ink names read",
                    location="Job sheet special units vs separation inks / headers",
                )
            )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations={
            "matched_colours": ", ".join(matched) if matched else "none",
            "missing_colours": ", ".join(missing) if missing else "none",
            "found_names": ", ".join(found_names) if found_names else "none",
        },
    )
