"""Run every implemented check for a job folder."""

from __future__ import annotations

from pathlib import Path

from printsahaj_verify.checks.artwork_vs_approval import CHECK_ID as ARTWORK_ID
from printsahaj_verify.checks.artwork_vs_approval import CHECK_TITLE as ARTWORK_TITLE
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
    DocumentText,
    count_pdf_pages,
    hash_file,
    parse_vendor_header,
    read_document_text,
)
from printsahaj_verify.files import JobFiles, discover_job_files, is_pdf
from printsahaj_verify.job_spec import JobSpec, load_job_spec
from printsahaj_verify.models import CheckResult

JOB_FILE_NAME = "job.json"

IMAGE_TEXT_REASON = (
    "File is an image. This tool does not read text from images. "
    "Compare the preview by eye."
)


def _pdf_text(path: Path | None) -> DocumentText | None:
    """Extract text only from PDFs. Images stay out of wording checks."""
    if path is None or not is_pdf(path):
        return None
    return read_document_text(path)


def _artwork_vs_approval_result(
    files: JobFiles,
    client_doc: DocumentText | None,
    approval_doc: DocumentText | None,
) -> CheckResult:
    client_is_image = files.client_artwork is not None and not is_pdf(files.client_artwork)
    approval_is_image = files.approval is not None and not is_pdf(files.approval)
    if client_is_image or approval_is_image:
        return CheckResult(
            check_id=ARTWORK_ID,
            title=ARTWORK_TITLE,
            not_run_reason=IMAGE_TEXT_REASON,
        )
    return check_artwork_vs_approval(client_doc, approval_doc)


def _plate_count_result(spec: JobSpec, files: JobFiles) -> CheckResult:
    if files.separations is None:
        return CheckResult(
            check_id=PLATE_ID,
            title=PLATE_TITLE,
            not_run_reason="Separations PDF not found",
        )
    if not is_pdf(files.separations):
        return CheckResult(
            check_id=PLATE_ID,
            title=PLATE_TITLE,
            not_run_reason=(
                "Separations is an image. Plate count needs a PDF "
                "(one page per plate)."
            ),
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

    client_doc = _pdf_text(files.client_artwork)
    approval_doc = _pdf_text(files.approval)
    composite_doc = _pdf_text(files.vendor_composite)
    separations_doc = _pdf_text(files.separations)

    approved_for_text = approval_doc or client_doc
    header = parse_vendor_header(composite_doc.full_text) if composite_doc else None
    vendor_docs = [doc for doc in (composite_doc, separations_doc) if doc is not None]

    results = [
        _artwork_vs_approval_result(files, client_doc, approval_doc),
        _plate_count_result(spec, files),
        check_colour_names(spec, separations_doc),
        check_geometry(spec, header),
        check_headers(spec, vendor_docs),
        check_text_completeness(approved_for_text, separations_doc),
        check_plate_text_map(spec, separations_doc),
        check_printout(files.printouts),
    ]
    return spec, results, files
