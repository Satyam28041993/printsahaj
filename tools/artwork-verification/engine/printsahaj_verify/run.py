"""Run the checks that are ready for a job folder."""

from __future__ import annotations

from pathlib import Path

import pymupdf

from printsahaj_verify.checks.plate_count import CHECK_ID, CHECK_TITLE, check_plate_count
from printsahaj_verify.job_spec import JobSpec, JobSpecError, load_job_spec
from printsahaj_verify.models import CheckResult

JOB_FILE_NAME = "job.json"

#: File-name fragments that mean "this is not the separations set".
NOT_SEPARATION_MARKERS: tuple[str, ...] = (
    "job-sheet",
    "jobsheet",
    "job_sheet",
    "composite",
    "proof",
    "approval",
)


def count_pdf_pages(path: Path) -> int:
    """Return the page count of a PDF. Raises if the file cannot be opened."""
    try:
        with pymupdf.open(path) as document:
            return document.page_count
    except Exception as error:  # noqa: BLE001 - surface the file problem
        raise JobSpecError(f"Cannot read PDF {path}: {error}") from error


def find_separations_pdf(folder: Path) -> Path | None:
    """Find the separations PDF, or None if the folder has no PDF.

    Ambiguous sets (several PDFs, none named as separations) raise JobSpecError.
    """
    pdfs = sorted(path for path in folder.glob("*.pdf") if path.is_file())
    if not pdfs:
        return None

    named = [path for path in pdfs if "separat" in path.name.lower()]
    if len(named) == 1:
        return named[0]
    if len(named) > 1:
        names = ", ".join(path.name for path in named)
        raise JobSpecError(f"Several files look like separations: {names}")

    others = [
        path
        for path in pdfs
        if not any(marker in path.name.lower() for marker in NOT_SEPARATION_MARKERS)
    ]
    if len(others) == 1:
        return others[0]
    if len(others) > 1:
        names = ", ".join(path.name for path in others)
        raise JobSpecError(
            "Several PDFs found. Name the plate file so it includes "
            f"'separations'. Files: {names}"
        )
    return None


def run_job(folder: Path) -> tuple[JobSpec, list[CheckResult]]:
    """Load the job and run every check that is implemented."""
    spec = load_job_spec(folder / JOB_FILE_NAME)
    separations = find_separations_pdf(folder)

    if separations is None:
        plate_result = CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=f"Separations PDF not found in {folder}",
        )
    else:
        plate_result = check_plate_count(spec, count_pdf_pages(separations))

    return spec, [plate_result]
