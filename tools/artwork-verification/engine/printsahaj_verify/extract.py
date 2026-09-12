"""Read text and numbers from job PDFs. This is reading, not a check."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf

from printsahaj_verify.constants import (
    MEASUREMENT_TOLERANCE_MM,
    PREVIEW_MAX_WIDTH_PX,
    PREVIEW_MAX_ZOOM,
    PREVIEW_MIN_WIDTH_PX,
    PUNCH_GREEN_MIN_G,
    PUNCH_GREEN_RATIO,
    PUNCH_MIN_AREA_MM2,
    PUNCH_SIZE_TOLERANCE_MM,
    VIEWER_MAX_WIDTH_PX,
    VIEWER_MAX_ZOOM,
    points_to_mm,
)
from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.probe import read_colorants, read_page_device_colorants, read_spans

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
UPS_LABELED_PATTERN = re.compile(
    r"(?:NO\.?\s*OF\s+)?UPS\s*[:=]?\s*(\d+)",
    re.IGNORECASE,
)
UPS_SUFFIX_PATTERN = re.compile(r"(\d+)\s*UPS\b", re.IGNORECASE)
ACROSS_PATTERN = re.compile(r"ACROSS\s*[:=]?\s*(\d+)", re.IGNORECASE)
AROUND_PATTERN = re.compile(r"AROUND\s*[:=]?\s*(\d+)", re.IGNORECASE)


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
    page_colorants: list[str] = field(default_factory=list)

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
                page_colorants=read_page_device_colorants(document),
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


def preview_page_count(path: Path) -> int:
    """Page count for a PDF or image. Images count as one page."""
    try:
        with pymupdf.open(path) as document:
            return document.page_count
    except Exception as error:  # noqa: BLE001
        raise JobSpecError(f"Cannot open for preview {path}: {error}") from error


def clamp_preview_width(max_width_px: int | None) -> tuple[int, float]:
    """Thumbnail cap, or a wider cap for the compare window."""
    if max_width_px is None:
        return PREVIEW_MAX_WIDTH_PX, PREVIEW_MAX_ZOOM
    width = max(PREVIEW_MIN_WIDTH_PX, min(int(max_width_px), VIEWER_MAX_WIDTH_PX))
    return width, VIEWER_MAX_ZOOM


def render_preview_png(
    path: Path,
    page_number: int = 1,
    max_width_px: int | None = None,
) -> bytes:
    """Rasterise one PDF page or an image to PNG for the desk preview.

    ``page_number`` is 1-based. This is a picture for a human, not a grade.
    """
    cap, max_zoom = clamp_preview_width(max_width_px)
    try:
        with pymupdf.open(path) as document:
            if document.page_count < 1:
                raise JobSpecError(f"File has no pages: {path}")
            index = page_number - 1
            if index < 0 or index >= document.page_count:
                raise JobSpecError(
                    f"Preview page {page_number} is outside 1–{document.page_count}"
                )
            page = document[index]
            width = page.rect.width
            if width <= 0:
                raise JobSpecError(f"Page has no width: {path}")
            zoom = min(cap / width, max_zoom)
            pixmap = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            return pixmap.tobytes("png")
    except JobSpecError:
        raise
    except Exception as error:  # noqa: BLE001
        raise JobSpecError(f"Cannot render preview {path}: {error}") from error


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
    ups_count: int | None = None
    ups_across: int | None = None
    ups_around: int | None = None


def _parse_ups(text: str) -> tuple[int | None, int | None, int | None]:
    """Read ups / across / around when the vendor header writes them."""
    across = ACROSS_PATTERN.search(text)
    around = AROUND_PATTERN.search(text)
    ups_across = int(across.group(1)) if across else None
    ups_around = int(around.group(1)) if around else None
    labeled = UPS_LABELED_PATTERN.search(text)
    suffix = UPS_SUFFIX_PATTERN.search(text)
    ups_count = None
    if labeled:
        ups_count = int(labeled.group(1))
    elif suffix:
        ups_count = int(suffix.group(1))
    elif ups_across is not None and ups_around is not None:
        ups_count = ups_across * ups_around
    return ups_count, ups_across, ups_around


def parse_vendor_header(text: str) -> VendorHeader:
    """Read cylinder, paper, label, plate and ups figures from header text."""
    cly = CLY_PATTERN.search(text)
    paper = PAPER_PATTERN.search(text)
    label = LABEL_PATTERN.search(text)
    plate = PLATE_PATTERN.search(text)
    col = COL_PATTERN.search(text)
    ups_count, ups_across, ups_around = _parse_ups(text)
    return VendorHeader(
        cylinder_repeat_mm=float(cly.group(1)) if cly else None,
        paper_width_mm=float(paper.group(1)) if paper else None,
        label_width_mm=float(label.group(1)) if label else None,
        label_height_mm=float(label.group(2)) if label else None,
        plate_thickness_mm=float(plate.group(1)) if plate else None,
        col_count=int(col.group(1)) if col else None,
        raw_text=text,
        ups_count=ups_count,
        ups_across=ups_across,
        ups_around=ups_around,
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


def _is_punch_green(color: object) -> bool:
    if not isinstance(color, (tuple, list)) or len(color) < 3:
        return False
    red, green, blue = float(color[0]), float(color[1]), float(color[2])
    return (
        green >= PUNCH_GREEN_MIN_G
        and green > red * PUNCH_GREEN_RATIO
        and green > blue * 0.9
    )


def _near_label_mm(
    width_mm: float,
    height_mm: float,
    label_width_mm: float | None,
    label_height_mm: float | None,
) -> bool:
    area = width_mm * height_mm
    if area < PUNCH_MIN_AREA_MM2:
        return False
    if label_width_mm is None or label_height_mm is None:
        return width_mm >= 30 and height_mm >= 30
    pair = sorted((width_mm, height_mm))
    expect = sorted((label_width_mm, label_height_mm))
    return (
        abs(pair[0] - expect[0]) <= PUNCH_SIZE_TOLERANCE_MM
        and abs(pair[1] - expect[1]) <= PUNCH_SIZE_TOLERANCE_MM
    )


def count_label_frames(
    path: Path,
    label_width_mm: float | None,
    label_height_mm: float | None,
) -> int | None:
    """Count green punch-line frames around each up on a vendor composite.

    Each label on the imposition has a green punch / die line. That count is
    the number of ups. None when no such frames could be read.
    """
    try:
        with pymupdf.open(path) as document:
            if document.page_count < 1:
                return None
            page = document[0]
            centers: list[tuple[float, float]] = []
            for drawing in page.get_drawings():
                if not (
                    _is_punch_green(drawing.get("color"))
                    or _is_punch_green(drawing.get("fill"))
                ):
                    continue
                rect = drawing.get("rect")
                if rect is None:
                    continue
                width_mm = points_to_mm(rect.width)
                height_mm = points_to_mm(rect.height)
                if not _near_label_mm(
                    width_mm, height_mm, label_width_mm, label_height_mm
                ):
                    continue
                centers.append(
                    (points_to_mm((rect.x0 + rect.x1) / 2), points_to_mm((rect.y0 + rect.y1) / 2))
                )
    except Exception as error:  # noqa: BLE001
        raise JobSpecError(f"Cannot read punch frames {path}: {error}") from error
    if not centers:
        return None
    unique: list[tuple[float, float]] = []
    gap = PUNCH_SIZE_TOLERANCE_MM
    for x_mm, y_mm in centers:
        if any(abs(x_mm - ox) <= gap and abs(y_mm - oy) <= gap for ox, oy in unique):
            continue
        unique.append((x_mm, y_mm))
    return len(unique) if unique else None


def page_size_mm(path: Path) -> tuple[float, float]:
    """Width and height of the first page, in millimetres."""
    with pymupdf.open(path) as document:
        if document.page_count < 1:
            raise JobSpecError(f"PDF has no pages: {path}")
        rect = document[0].rect
        return points_to_mm(rect.width), points_to_mm(rect.height)
