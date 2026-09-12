"""Read text and numbers from job PDFs. This is reading, not a check."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf

from printsahaj_verify.constants import MEASUREMENT_TOLERANCE_MM, points_to_mm
from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.probe import read_colorants, read_spans

#: Smallest token kept when comparing text across files.
MIN_COMPARE_TOKEN_LENGTH = 2

CLY_PATTERN = re.compile(r"CLY\s*:?\s*([0-9]+(?:\.[0-9]+)?)\s*MM", re.IGNORECASE)
PAPER_PATTERN = re.compile(
    r"PAPER\s*SIZE\s*:?\s*([0-9]+(?:\.[0-9]+)?)\s*MM", re.IGNORECASE
)
LABEL_PATTERN = re.compile(
    r"LABEL\s*SIZE\s*:?\s*([0-9]+(?:\.[0-9]+)?)\s*[xX×]\s*([0-9]+(?:\.[0-9]+)?)\s*MM",
    re.IGNORECASE,
)
PLATE_PATTERN = re.compile(r"PLATE\s*:?\s*([0-9]+(?:\.[0-9]+)?)\s*MM", re.IGNORECASE)
COL_PATTERN = re.compile(r"Col\s*:\s*([0-9]+)", re.IGNORECASE)


@dataclass
class PageText:
    """Text on one PDF page."""

    number: int
    text: str
    tokens: list[str]


@dataclass
class DocumentText:
    """Text from every page of one PDF."""

    path: Path
    pages: list[PageText] = field(default_factory=list)
    colorants: list[str] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        return "\n".join(page.text for page in self.pages)

    @property
    def all_tokens(self) -> list[str]:
        tokens: list[str] = []
        for page in self.pages:
            tokens.extend(page.tokens)
        return tokens


def normalise_token(text: str) -> str:
    """Collapse a text run for comparison: trim, squeeze space, upper-case."""
    return " ".join(text.split()).upper()


def tokens_from_text(text: str) -> list[str]:
    """Split text into comparable tokens, dropping crumbs."""
    tokens: list[str] = []
    for raw in re.split(r"[^\w\u0900-\u097F]+", text, flags=re.UNICODE):
        token = raw.strip()
        if len(token) >= MIN_COMPARE_TOKEN_LENGTH:
            tokens.append(normalise_token(token))
    return tokens


def read_document_text(path: Path) -> DocumentText:
    """Extract page text, tokens, and spot ink names from one PDF."""
    try:
        with pymupdf.open(path) as document:
            pages: list[PageText] = []
            for index, page in enumerate(document):
                spans = read_spans(page)
                text = " ".join(span.text for span in spans)
                pages.append(
                    PageText(
                        number=index + 1,
                        text=text,
                        tokens=tokens_from_text(text),
                    )
                )
            return DocumentText(
                path=path,
                pages=pages,
                colorants=read_colorants(document),
            )
    except JobSpecError:
        raise
    except Exception as error:  # noqa: BLE001 - the file must not be silently skipped
        raise JobSpecError(f"Cannot read PDF {path}: {error}") from error


def count_pdf_pages(path: Path) -> int:
    """Return the page count of a PDF."""
    try:
        with pymupdf.open(path) as document:
            return document.page_count
    except Exception as error:  # noqa: BLE001
        raise JobSpecError(f"Cannot read PDF {path}: {error}") from error


@dataclass(frozen=True)
class VendorHeader:
    """Numbers commonly printed on a vendor composite / plate header."""

    cylinder_repeat_mm: float | None
    paper_width_mm: float | None
    label_width_mm: float | None
    label_height_mm: float | None
    plate_thickness_mm: float | None
    col_count: int | None
    raw_text: str


def parse_vendor_header(text: str) -> VendorHeader:
    """Read cylinder, paper, label and plate figures from header text."""
    cly = CLY_PATTERN.search(text)
    paper = PAPER_PATTERN.search(text)
    label = LABEL_PATTERN.search(text)
    plate = PLATE_PATTERN.search(text)
    col = COL_PATTERN.search(text)
    return VendorHeader(
        cylinder_repeat_mm=float(cly.group(1)) if cly else None,
        paper_width_mm=float(paper.group(1)) if paper else None,
        label_width_mm=float(label.group(1)) if label else None,
        label_height_mm=float(label.group(2)) if label else None,
        plate_thickness_mm=float(plate.group(1)) if plate else None,
        col_count=int(col.group(1)) if col else None,
        raw_text=text,
    )


def measurements_match(left: float, right: float) -> bool:
    """True when two millimetre values agree within the trade tolerance."""
    return abs(left - right) <= MEASUREMENT_TOLERANCE_MM


def hash_file(path: Path) -> str:
    """SHA-256 of a file, for version lock between stages."""
    import hashlib

    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def page_size_mm(path: Path) -> tuple[float, float]:
    """Width and height of the first page, in millimetres."""
    with pymupdf.open(path) as document:
        if document.page_count < 1:
            raise JobSpecError(f"PDF has no pages: {path}")
        rect = document[0].rect
        return points_to_mm(rect.width), points_to_mm(rect.height)
