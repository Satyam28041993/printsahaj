"""Read printer job codes from filenames and header text."""

from __future__ import annotations

import re

JOB_CODE_PATTERN = re.compile(r"CGM\d{4}-\d{2}-\d+", re.IGNORECASE)


def job_codes_in_text(text: str) -> tuple[str, ...]:
    """Unique CGM job codes found in a filename or header, upper-cased."""
    found: list[str] = []
    for match in JOB_CODE_PATTERN.finditer(text):
        code = match.group(0).upper()
        if code not in found:
            found.append(code)
    return tuple(found)


def guess_file_role(filename: str) -> str | None:
    """Guess an upload slot from a vendor-style filename."""
    name = filename.lower()
    stem = name.rsplit("/", 1)[-1]
    if stem.startswith("sep") or "separat" in stem:
        return "separations"
    if "approval" in stem:
        return "approval"
    if job_codes_in_text(stem):
        return "vendor_composite"
    if stem.endswith((".png", ".jpg", ".jpeg", ".webp")):
        return "client_artwork"
    return None
