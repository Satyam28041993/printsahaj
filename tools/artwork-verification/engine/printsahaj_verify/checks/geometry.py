"""Check E — cylinder repeat, label size and paper width."""

from __future__ import annotations

from pathlib import Path

from printsahaj_verify.constants import CIRCULAR_PITCH_MM, MEASUREMENT_TOLERANCE_MM
from printsahaj_verify.extract import (
    VendorHeader,
    count_label_frames,
    measurements_match,
)
from printsahaj_verify.job_spec import JobSpec
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "geometry"
CHECK_TITLE = "Geometry"


def _near_whole_teeth(repeat_mm: float) -> tuple[bool, float]:
    teeth = repeat_mm / CIRCULAR_PITCH_MM
    nearest = round(teeth)
    return abs(teeth - nearest) <= MEASUREMENT_TOLERANCE_MM, teeth


def _same_label_pair(
    left: tuple[float, float],
    right: tuple[float, float],
) -> bool:
    sheet = sorted(left)
    other = sorted(right)
    return measurements_match(sheet[0], other[0]) and measurements_match(
        sheet[1], other[1]
    )


def check_geometry(
    job: JobSpec,
    header: VendorHeader | None,
    approval_label_mm: tuple[float, float] | None = None,
    composite_path: Path | None = None,
) -> CheckResult:
    """Compare sizes with the vendor header, first-approval size, and cylinder teeth."""
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
    if header.paper_width_mm is not None:
        observations["paper_written"] = f"{header.paper_width_mm:.3f} mm"
    if header.label_width_mm is not None and header.label_height_mm is not None:
        observations["label_written"] = (
            f"{header.label_width_mm} x {header.label_height_mm} mm"
        )
    if header.ups_count is not None:
        observations["ups_written"] = str(header.ups_count)
        observations["ups_source"] = "header"
    if header.ups_across is not None:
        observations["ups_across"] = str(header.ups_across)
    if header.ups_around is not None:
        observations["ups_around"] = str(header.ups_around)
    if header.col_count is not None:
        observations["header_col"] = str(header.col_count)

    repeat = header.cylinder_repeat_mm or job.cylinder_repeat_mm
    if repeat is not None:
        observations["cylinder_repeat_mm"] = f"{repeat:.3f}"
        whole, teeth = _near_whole_teeth(repeat)
        observations["teeth"] = f"{teeth:.4f}"
        teeth_shown = str(round(teeth)) if whole else f"{teeth:.4f}"
        observations["cylinder_written"] = (
            f"{repeat:.3f} mm / {teeth_shown} teeth "
            f"({repeat:.3f} ÷ {CIRCULAR_PITCH_MM})"
        )
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

    if (
        approval_label_mm is not None
        and header.label_width_mm is not None
        and header.label_height_mm is not None
    ):
        observations["approval_label_mm"] = (
            f"{approval_label_mm[0]} x {approval_label_mm[1]} mm"
        )
        vendor_pair = (header.label_width_mm, header.label_height_mm)
        if _same_label_pair(approval_label_mm, vendor_pair):
            observations["label_matches_approval"] = "yes"
        else:
            observations["label_matches_approval"] = "no"
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        "Vendor label size does not match the first-approval sheet."
                    ),
                    certainty=Certainty.DETERMINISTIC,
                    expected=f"{approval_label_mm[0]} x {approval_label_mm[1]} mm",
                    found=f"{header.label_width_mm} x {header.label_height_mm} mm",
                    location="First-approval label size vs vendor LABEL SIZE",
                )
            )

    if (
        observations.get("ups_written") is None
        and composite_path is not None
    ):
        frames = count_label_frames(
            composite_path,
            header.label_width_mm,
            header.label_height_mm,
        )
        if frames is not None:
            observations["ups_written"] = str(frames)
            observations["ups_source"] = "punch_frames"

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
