"""Read the first-approval sheet: colour line, size, product name.

That sheet is the same artwork with colours / plates written on it, then
sent to the client. It is not the vendor composite.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from printsahaj_verify.extract import read_document_text
from printsahaj_verify.files import is_pdf
from printsahaj_verify.job_spec import JobSpecError, parse_colour_declaration

COLOUR_LINE_PATTERN = re.compile(
    r"(\d+)\s*COL((?:\s*\+\s*[A-Za-z][A-Za-z]*(?:\s+[A-Za-z][A-Za-z]*)*)*)",
    re.IGNORECASE,
)
LABEL_SIZE_PATTERN = re.compile(
    r"(\d+(?:\.\d+)?)\s*mm\s*[xX×]\s*(\d+(?:\.\d+)?)\s*mm",
    re.IGNORECASE,
)
KNOWN_COLOURS: tuple[str, ...] = (
    "YELLOW",
    "MAGENTA",
    "CYAN",
    "BLACK",
    "WHITE",
    "GOLD",
)
PANTONE_PATTERN = re.compile(r"P(?:ANTONE)?\s*\d+\s*C", re.IGNORECASE)


@dataclass(frozen=True)
class ApprovalSheet:
    """Fields read from a first-approval PDF. Missing bits stay None."""

    colour_declaration: str | None
    colour_list: tuple[str, ...]
    special_units: tuple[str, ...]
    label_width_mm: float | None
    label_height_mm: float | None
    product_name: str | None
    raw_text: str


def parse_approval_sheet(path: Path) -> ApprovalSheet:
    """Extract the written colour line and label size from an approval PDF."""
    if not is_pdf(path):
        raise JobSpecError(
            "First approval is an image. Colour line cannot be read from it."
        )
    document = read_document_text(path)
    text = document.full_text
    declaration: str | None = None
    colours: tuple[str, ...] = ()
    specials: tuple[str, ...] = ()
    match = COLOUR_LINE_PATTERN.search(text)
    if match:
        declaration = " ".join(match.group(0).split())
        try:
            count, specials = parse_colour_declaration(declaration)
        except JobSpecError:
            count = int(match.group(1))
            specials = ()
        colours = _colours_from_text(text, count)
    size = LABEL_SIZE_PATTERN.search(text)
    width = float(size.group(1)) if size else None
    height = float(size.group(2)) if size else None
    return ApprovalSheet(
        colour_declaration=declaration,
        colour_list=colours,
        special_units=specials,
        label_width_mm=width,
        label_height_mm=height,
        product_name=_product_name(text),
        raw_text=text,
    )


def _colours_from_text(text: str, expected: int) -> tuple[str, ...]:
    found: list[str] = []
    upper = text.upper()
    for name in KNOWN_COLOURS:
        if re.search(rf"\b{name}\b", upper) and name.title() not in found:
            if name == "WHITE":
                found.append("White")
            else:
                found.append(name.title())
    for pantone in PANTONE_PATTERN.findall(text):
        cleaned = " ".join(pantone.upper().split())
        if cleaned not in found:
            found.append(cleaned)
    return tuple(found[:expected]) if expected else tuple(found)


def _product_name(text: str) -> str | None:
    """Best-effort product line — long mixed-case run that is not a header label."""
    skip = {
        "LABEL SIZE",
        "FILE NAME",
        "CUSTOMER NAME",
        "NO. OF COLOURS",
        "PRINT TYPE",
        "MATERIAL",
    }
    for line in re.split(r"[\n\r]+", text):
        cleaned = " ".join(line.split())
        if len(cleaned) < 8 or cleaned.upper() in skip:
            continue
        if COLOUR_LINE_PATTERN.search(cleaned):
            continue
        if LABEL_SIZE_PATTERN.search(cleaned):
            continue
        letters = sum(1 for char in cleaned if char.isalpha())
        if letters >= 8 and not cleaned.endswith(":-"):
            return cleaned
    return None
