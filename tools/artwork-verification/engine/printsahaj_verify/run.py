"""Run checks for one step, or for the whole job."""

from __future__ import annotations

from pathlib import Path

from printsahaj_verify.approval_sheet import parse_approval_sheet
from printsahaj_verify.checks.approval_sheet_check import check_approval_sheet
from printsahaj_verify.checks.artwork_vs_approval import CHECK_ID as ARTWORK_ID
from printsahaj_verify.checks.artwork_vs_approval import CHECK_TITLE as ARTWORK_TITLE
from printsahaj_verify.checks.artwork_vs_approval import (
    check_artwork_vs_approval,
    result_from_vision_wording,
)
from printsahaj_verify.checks.label_marks import check_label_marks
from printsahaj_verify.checks.visual_layout import check_visual_layout
from printsahaj_verify.checks.colour_names import check_colour_names
from printsahaj_verify.checks.geometry import check_geometry
from printsahaj_verify.checks.headers import check_headers
from printsahaj_verify.checks.job_identity import check_job_identity
from printsahaj_verify.checks.plate_count import CHECK_ID as PLATE_ID
from printsahaj_verify.checks.plate_count import CHECK_TITLE as PLATE_TITLE
from printsahaj_verify.checks.plate_count import check_plate_count
from printsahaj_verify.checks.plate_text_map import CHECK_ID as PLATE_TEXT_ID
from printsahaj_verify.checks.plate_text_map import CHECK_TITLE as PLATE_TEXT_TITLE
from printsahaj_verify.checks.plate_text_map import check_plate_text_map
from printsahaj_verify.checks.printout import check_printout
from printsahaj_verify.checks.text_completeness import CHECK_ID as TEXT_ID
from printsahaj_verify.checks.text_completeness import CHECK_TITLE as TEXT_TITLE
from printsahaj_verify.checks.text_completeness import check_text_completeness
from printsahaj_verify.extract import (
    DocumentText,
    count_pdf_pages,
    hash_file,
    parse_vendor_header,
    read_document_text,
)
from printsahaj_verify.files import JobFiles, discover_job_files, is_pdf
from printsahaj_verify.job_spec import JobSpec, JobSpecError, load_job_spec
from printsahaj_verify.models import Certainty, CheckResult, Finding
from printsahaj_verify.stages import STAGE_ORDER, previous_stage
from printsahaj_verify.vision import VisionNotes, compare_label_previews

JOB_FILE_NAME = "job.json"
STAGES_FILE_NAME = "stages.json"

IMAGE_TEXT_REASON = (
    "File is an image. Local PDF text extract cannot read pixels. "
    "Set PRINTSAHAJ_GEMINI_API_KEY on this machine to compare wording, "
    "or open the two previews side by side."
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
    notes: VisionNotes | None,
    vision_error: str | None = None,
) -> CheckResult:
    client_is_image = files.client_artwork is not None and not is_pdf(files.client_artwork)
    approval_is_image = files.approval is not None and not is_pdf(files.approval)
    if client_is_image or approval_is_image:
        if notes is not None and notes.wording_same is not None:
            return result_from_vision_wording(notes)
        return CheckResult(
            check_id=ARTWORK_ID,
            title=ARTWORK_TITLE,
            not_run_reason=vision_error or IMAGE_TEXT_REASON,
        )
    return check_artwork_vs_approval(client_doc, approval_doc)


def _vision_notes(files: JobFiles) -> tuple[VisionNotes | None, str | None]:
    """One Gemini call for wording, layout, logo, batch and MRP."""
    if files.client_artwork is None or files.approval is None:
        return None, None
    try:
        return compare_label_previews(files.client_artwork, files.approval), None
    except (JobSpecError, OSError, TimeoutError, ValueError) as error:
        return None, str(error)


def _plate_count_result(
    spec: JobSpec,
    files: JobFiles,
    header_col: int | None,
) -> CheckResult:
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
    pages = count_pdf_pages(files.separations)
    if spec.has_colour_line:
        return check_plate_count(spec, pages)
    if header_col is None:
        return CheckResult(
            check_id=PLATE_ID,
            title=PLATE_TITLE,
            not_run_reason="No colour line on the job, and Col: was not read from the vendor header",
        )
    if pages == header_col:
        return CheckResult(
            check_id=PLATE_ID,
            title=PLATE_TITLE,
            observations={
                "declared_units": str(header_col),
                "separation_pages": str(pages),
                "source": "vendor header Col:",
            },
        )
    return CheckResult(
        check_id=PLATE_ID,
        title=PLATE_TITLE,
        findings=[
            Finding(
                check_id=PLATE_ID,
                summary=(
                    f"Vendor Col: {header_col}, SEP pages {pages}. "
                    "Plate count does not match."
                ),
                certainty=Certainty.DETERMINISTIC,
                expected=f"Col: {header_col}",
                found=f"{pages} separation pages",
                location="Vendor header Col: vs SEP page count",
            )
        ],
        observations={
            "declared_units": str(header_col),
            "separation_pages": str(pages),
            "source": "vendor header Col:",
        },
    )


def file_hashes(files: JobFiles) -> dict[str, str]:
    """Fingerprint each uploaded file so a later swap is visible."""
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


def load_stages_checked(folder: Path) -> list[str]:
    """Which steps have been run on this job."""
    path = folder / STAGES_FILE_NAME
    if not path.is_file():
        return []
    import json

    raw = json.loads(path.read_text(encoding="utf-8"))
    checked = raw.get("checked", [])
    if not isinstance(checked, list):
        raise JobSpecError("stages.json checked must be a list")
    return [str(item) for item in checked if str(item) in STAGE_ORDER]


def save_stage_checked(folder: Path, stage_id: str) -> list[str]:
    """Record that a step was checked. Does not claim the step is OK."""
    import json

    checked = load_stages_checked(folder)
    if stage_id not in checked:
        checked.append(stage_id)
    path = folder / STAGES_FILE_NAME
    path.write_text(
        json.dumps({"checked": checked}, indent=2) + "\n",
        encoding="utf-8",
    )
    return checked


def apply_approval_defaults(folder: Path, spec: JobSpec, files: JobFiles) -> JobSpec:
    """If the job has no colour line yet, copy it from the approval sheet."""
    if spec.has_colour_line or files.approval is None or not is_pdf(files.approval):
        return spec
    try:
        sheet = parse_approval_sheet(files.approval)
    except JobSpecError:
        return spec
    if not sheet.colour_declaration or not sheet.colour_list:
        return spec
    from printsahaj_verify.job_spec import (
        job_spec_to_dict,
        load_job_spec,
        parse_colour_declaration,
    )

    try:
        count, _specials = parse_colour_declaration(sheet.colour_declaration)
    except JobSpecError:
        return spec
    if len(sheet.colour_list) != count:
        return spec
    payload = job_spec_to_dict(spec)
    payload["colour_declaration"] = sheet.colour_declaration
    payload["colour_list"] = list(sheet.colour_list)
    payload["special_units"] = list(sheet.special_units)
    if (
        spec.label_width_mm <= 0
        and sheet.label_width_mm
        and sheet.label_height_mm
    ):
        payload["label_size_mm"] = [sheet.label_width_mm, sheet.label_height_mm]
    if not spec.file_name and sheet.product_name:
        payload["file_name"] = sheet.product_name
    path = folder / JOB_FILE_NAME
    path.write_text(
        __import__("json").dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return load_job_spec(path)


def _collect_results(spec: JobSpec, files: JobFiles) -> list[CheckResult]:
    client_doc = _pdf_text(files.client_artwork)
    approval_doc = _pdf_text(files.approval)
    composite_doc = _pdf_text(files.vendor_composite)
    separations_doc = _pdf_text(files.separations)
    header = parse_vendor_header(composite_doc.full_text) if composite_doc else None
    vendor_docs = [doc for doc in (composite_doc, separations_doc) if doc is not None]
    identity_docs = [doc for doc in (approval_doc, composite_doc) if doc is not None]
    identity_paths = [
        path
        for path in (
            files.client_artwork,
            files.approval,
            files.vendor_composite,
            files.separations,
        )
        if path is not None
    ]
    identity = check_job_identity(spec, identity_paths, identity_docs)
    notes, vision_error = _vision_notes(files)
    client_is_image = (
        files.client_artwork is not None and not is_pdf(files.client_artwork)
    )
    approval_is_image = files.approval is not None and not is_pdf(files.approval)
    mixed_jobs = any(
        item.certainty is Certainty.DETERMINISTIC for item in identity.findings
    )
    approved_for_text = approval_doc or client_doc
    if mixed_jobs:
        text_result = CheckResult(
            check_id=TEXT_ID,
            title=TEXT_TITLE,
            not_run_reason="Different jobs are mixed. Wording compare skipped.",
        )
        plate_text = CheckResult(
            check_id=PLATE_TEXT_ID,
            title=PLATE_TEXT_TITLE,
            not_run_reason="Different jobs are mixed. Text map skipped.",
        )
    else:
        text_result = check_text_completeness(approved_for_text, separations_doc)
        plate_text = check_plate_text_map(spec, separations_doc)

    return [
        identity,
        check_approval_sheet(files.approval),
        _artwork_vs_approval_result(
            files, client_doc, approval_doc, notes, vision_error
        ),
        check_visual_layout(
            notes,
            files.client_artwork is not None and files.approval is not None,
            vision_error,
        ),
        check_label_marks(
            client_doc,
            approval_doc,
            client_is_image,
            approval_is_image,
            notes,
            vision_error,
        ),
        _plate_count_result(spec, files, header.col_count if header else None),
        check_colour_names(spec, separations_doc),
        check_geometry(spec, header),
        check_headers(spec, vendor_docs),
        text_result,
        plate_text,
        check_printout(files.printouts),
    ]


def run_job(folder: Path) -> tuple[JobSpec, list[CheckResult], JobFiles]:
    """Load the job and run every check. Missing files become not-run results."""
    spec = load_job_spec(folder / JOB_FILE_NAME)
    files = discover_job_files(folder)
    spec = apply_approval_defaults(folder, spec, files)
    return spec, _collect_results(spec, files), files


def run_stage(
    folder: Path,
    stage_id: str,
) -> tuple[JobSpec, list[CheckResult], JobFiles, list[str]]:
    """Run every check, then mark this step as checked if the previous step is done."""
    if stage_id not in STAGE_ORDER:
        raise JobSpecError(f"Unknown stage: {stage_id}")
    previous = previous_stage(stage_id)
    already = load_stages_checked(folder)
    if previous is not None and previous not in already:
        raise JobSpecError(
            f"Check the {previous} step first. This step comes after it."
        )
    spec, results, files = run_job(folder)
    checked = save_stage_checked(folder, stage_id)
    return spec, results, files, checked
