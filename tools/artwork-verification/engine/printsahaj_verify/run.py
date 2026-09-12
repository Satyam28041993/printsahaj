"""Run every implemented check for a job folder."""

from __future__ import annotations

from pathlib import Path

from printsahaj_verify.checks.artwork_vs_approval import check_artwork_vs_approval
from printsahaj_verify.checks.colour_names import check_colour_names
from printsahaj_verify.checks.geometry import check_geometry
from printsahaj_verify.checks.headers import check_headers
from printsahaj_verify.checks.plate_count import CHECK_ID as PLATE_ID
from printsahaj_verify.checks.plate_count import CHECK_TITLE as PLATE_TITLE
from printsahaj_verify.checks.plate_count import check_plate_count
from printsahaj_verify.checks.plate_text_map import check_plate_text_map
from printsahaj_verify.checks.printout import check_printout
from printsahaj_verify.checks.text_completeness import check_text_completeness
from printsahaj_verify.extract import (
    count_pdf_pages,
    hash_file,
    parse_vendor_header,
    read_document_text,
)
from printsahaj_verify.files import JobFiles, discover_job_files
from printsahaj_verify.job_spec import JobSpec, load_job_spec
from printsahaj_verify.models import CheckResult

JOB_FILE_NAME = "job.json"


def _plate_count_result(spec: JobSpec, files: JobFiles) -> CheckResult:
    if files.separations is None:
        return CheckResult(
            check_id=PLATE_ID,
            title=PLATE_TITLE,
            not_run_reason="Separations PDF not found",
        )
    return check_plate_count(spec, count_pdf_pages(files.separations))


def file_hashes(files: JobFiles) -> dict[str, str]:
    """Fingerprint each uploaded PDF so a later swap is visible."""
    hashes: dict[str, str] = {}
    for label, path in (
        ("client_artwork", files.client_artwork),
        ("approval", files.approval),
        ("vendor_composite", files.vendor_composite),
        ("separations", files.separations),
    ):
        if path is not None:
            hashes[label] = hash_file(path)
    return hashes


def run_job(folder: Path) -> tuple[JobSpec, list[CheckResult], JobFiles]:
    """Load the job and run every check. Missing files become not-run results."""
    spec = load_job_spec(folder / JOB_FILE_NAME)
    files = discover_job_files(folder)

    client_doc = read_document_text(files.client_artwork) if files.client_artwork else None
    approval_doc = read_document_text(files.approval) if files.approval else None
    composite_doc = (
        read_document_text(files.vendor_composite) if files.vendor_composite else None
    )
    separations_doc = read_document_text(files.separations) if files.separations else None

    approved_for_text = approval_doc or client_doc
    header = parse_vendor_header(composite_doc.full_text) if composite_doc else None
    vendor_docs = [doc for doc in (composite_doc, separations_doc) if doc is not None]

    results = [
        check_artwork_vs_approval(client_doc, approval_doc),
        _plate_count_result(spec, files),
        check_colour_names(spec, separations_doc),
        check_geometry(spec, header),
        check_headers(spec, vendor_docs),
        check_text_completeness(approved_for_text, separations_doc),
        check_plate_text_map(spec, separations_doc),
        check_printout(files.printouts),
    ]
    return spec, results, files
