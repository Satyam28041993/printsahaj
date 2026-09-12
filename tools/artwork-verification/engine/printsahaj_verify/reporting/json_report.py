"""Structured report for the desk app. Same rules as the terminal report."""

from __future__ import annotations

from printsahaj_verify.files import JobFiles
from printsahaj_verify.job_spec import JobSpec, job_spec_to_dict
from printsahaj_verify.models import Certainty, CheckResult
from printsahaj_verify.reporting.terminal import NOT_CHECKED_LINES
from printsahaj_verify.run import file_hashes


def files_to_dict(files: JobFiles) -> dict[str, object]:
    return {
        "client_artwork": files.client_artwork.name if files.client_artwork else None,
        "approval": files.approval.name if files.approval else None,
        "vendor_composite": files.vendor_composite.name if files.vendor_composite else None,
        "separations": files.separations.name if files.separations else None,
        "printouts": [path.name for path in files.printouts],
        "printout": ", ".join(path.name for path in files.printouts) or None,
    }


def build_report(
    job: JobSpec,
    results: list[CheckResult],
    files: JobFiles,
    remarks: dict,
) -> dict[str, object]:
    """JSON report: findings, flags, not-run, not-checked, remarks. No verdict."""
    certain = [
        finding.to_dict()
        for result in results
        for finding in result.findings
        if finding.certainty is Certainty.DETERMINISTIC
    ]
    advisory = [
        finding.to_dict()
        for result in results
        for finding in result.findings
        if finding.certainty is Certainty.ADVISORY
    ]
    return {
        "job": job_spec_to_dict(job),
        "files": files_to_dict(files),
        "file_hashes": file_hashes(files),
        "findings": certain,
        "flags": advisory,
        "checks": [result.to_dict() for result in results],
        "not_checked": list(NOT_CHECKED_LINES)
        + [
            "Print photo text, alignment and logo (automatic)",
            "Barcode ISO grade",
        ],
        "remarks": remarks,
        "counts": {
            "findings": len(certain),
            "flags": len(advisory),
            "checks_run": sum(1 for result in results if result.ran),
            "checks_not_run": sum(1 for result in results if not result.ran),
        },
    }
