"""Shared test jobs."""

from printsahaj_verify.job_spec import JobSpec


def kalonji_spec() -> JobSpec:
    """The DAILY KALONJI job sheet, typed."""
    return JobSpec(
        job_id="CGM2026-27-1326",
        file_name="DAILY KALONJI 100 ML",
        customer="DAILY PHARMA",
        colour_declaration="6 COL + VARNISH",
        colour_list=(
            "Yellow",
            "Magenta",
            "Cyan",
            "Black",
            "Gold",
            "P 7483 C",
        ),
        special_units=("Varnish",),
        label_width_mm=114.0,
        label_height_mm=76.0,
        print_type="Flexo",
    )
