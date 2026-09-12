"""Check E — cylinder repeat, label size and paper width."""

from __future__ import annotations

from printsahaj_verify.constants import CIRCULAR_PITCH_MM, MEASUREMENT_TOLERANCE_MM
from printsahaj_verify.extract import VendorHeader, measurements_match
from printsahaj_verify.job_spec import JobSpec
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "geometry"
CHECK_TITLE = "Geometry"


def _near_whole_teeth(repeat_mm: float) -> tuple[bool, float]:
    teeth = repeat_mm / CIRCULAR_PITCH_MM
    nearest = round(teeth)
    return abs(teeth - nearest) <= MEASUREMENT_TOLERANCE_MM, teeth


def check_geometry(
    job: JobSpec,
    header: VendorHeader | None,
) -> CheckResult:
    """Compare job-sheet sizes with the vendor header, and test cylinder teeth."""
    if header is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Vendor composite / plate PDF not found",
        )

    has_any = any(
        value is not None
        for value in (
            header.cylinder_repeat_mm,
            header.paper_width_mm,
            header.label_width_mm,
            header.plate_thickness_mm,
        )
    )
    if not has_any:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=(
                "Vendor PDF has no CLY / PAPER SIZE / LABEL SIZE / PLATE line "
                "that could be read"
            ),
            observations={"header_text": header.raw_text[:300]},
        )

    findings: list[Finding] = []
    observations: dict[str, str] = {}

    repeat = header.cylinder_repeat_mm or job.cylinder_repeat_mm
    if repeat is not None:
        observations["cylinder_repeat_mm"] = f"{repeat:.3f}"
        whole, teeth = _near_whole_teeth(repeat)
        observations["teeth"] = f"{teeth:.4f}"
        if not whole:
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"Cylinder repeat {repeat} mm ÷ {CIRCULAR_PITCH_MM} "
                        f"is {teeth:.4f} teeth — not a whole tooth count."
                    ),
                    certainty=Certainty.DETERMINISTIC,
                    expected=f"whole number of teeth at {CIRCULAR_PITCH_MM} mm",
                    found=f"{teeth:.4f} teeth",
                    location="Vendor header CLY",
                )
            )

    if (
        job.label_width_mm > 0
        and header.label_width_mm is not None
        and header.label_height_mm is not None
    ):
        # Headers sometimes swap width/height relative to the job sheet.
        sheet = sorted((job.label_width_mm, job.label_height_mm))
        header_pair = sorted((header.label_width_mm, header.label_height_mm))
        observations["job_label_mm"] = f"{job.label_width_mm} x {job.label_height_mm}"
        observations["header_label_mm"] = (
            f"{header.label_width_mm} x {header.label_height_mm}"
        )
        if not (
            measurements_match(sheet[0], header_pair[0])
            and measurements_match(sheet[1], header_pair[1])
        ):
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        "Label size on the job sheet does not match the "
                        "vendor header."
                    ),
                    certainty=Certainty.DETERMINISTIC,
                    expected=f"{job.label_width_mm} x {job.label_height_mm} mm",
                    found=f"{header.label_width_mm} x {header.label_height_mm} mm",
                    location="Job sheet label size vs vendor LABEL SIZE",
                )
            )

    if job.paper_width_mm is not None and header.paper_width_mm is not None:
        observations["paper_width_mm"] = str(header.paper_width_mm)
        if not measurements_match(job.paper_width_mm, header.paper_width_mm):
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary="Paper width on the job does not match the vendor header.",
                    certainty=Certainty.DETERMINISTIC,
                    expected=f"{job.paper_width_mm} mm",
                    found=f"{header.paper_width_mm} mm",
                    location="Job paper width vs vendor PAPER SIZE",
                )
            )

    if header.col_count is not None and job.has_colour_line:
        observations["header_col"] = str(header.col_count)
        if header.col_count != job.declared_units:
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"Vendor header Col: {header.col_count} does not match "
                        f"declared units {job.declared_units} "
                        f"({job.colour_declaration})."
                    ),
                    certainty=Certainty.DETERMINISTIC,
                    expected=str(job.declared_units),
                    found=str(header.col_count),
                    location="Vendor header Col: vs job sheet units",
                )
            )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations=observations,
    )
