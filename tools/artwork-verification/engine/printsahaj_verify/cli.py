"""Command-line entry. Prints the report. Checks never print themselves."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.probe import use_utf8_output
from printsahaj_verify.reporting.terminal import format_report
from printsahaj_verify.run import run_job


def main(argv: list[str] | None = None) -> int:
    """Run verification on a job folder. Returns a process exit code."""
    use_utf8_output()
    parser = argparse.ArgumentParser(
        description=(
            "Compare a typed job sheet with the files in a job folder. "
            "Reports findings. Does not approve or reject the job."
        ),
    )
    parser.add_argument(
        "job_folder",
        type=Path,
        help="Folder with job.json and, when present, the job PDFs",
    )
    args = parser.parse_args(argv)

    folder = args.job_folder
    if not folder.is_dir():
        print(f"Not a folder: {folder}", file=sys.stderr)
        return 1

    try:
        job, results = run_job(folder)
    except JobSpecError as error:
        print(f"Job file problem: {error}", file=sys.stderr)
        return 2

    print(format_report(job, results))
    return 0
