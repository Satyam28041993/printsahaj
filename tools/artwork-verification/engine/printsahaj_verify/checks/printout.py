"""Printout step — store the photo, do not pretend to grade the print.

Matching a machine print photo to PDFs for text, alignment and logo needs
calibrated capture and extra libraries that are not in this build. The
check records that the photo arrived and asks a human for a remark.
"""

from __future__ import annotations

from pathlib import Path

from printsahaj_verify.models import CheckResult

CHECK_ID = "printout"
CHECK_TITLE = "Printout vs files"


def check_printout(printouts: tuple[Path, ...]) -> CheckResult:
    """Record whether a print photo is present. Never claims a visual grade."""
    if not printouts:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=(
                "No printout photo uploaded yet. After the machine print, "
                "add the photo and write a remark on text, alignment and logo."
            ),
        )

    names = ", ".join(path.name for path in printouts)
    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        observations={
            "printout_files": names,
            "automatic_visual_match": (
                "not run — photo-to-PDF text, alignment and logo matching "
                "needs extra libraries; write a human remark"
            ),
        },
        not_run_reason=(
            "Print photo is stored. Automatic match of text, alignment and "
            "logo against the PDFs is not run in this version. Compare by "
            "eye and write a remark."
        ),
    )
