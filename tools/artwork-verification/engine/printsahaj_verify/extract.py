"""Read text and numbers from job PDFs. This is reading, not a check."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf

from printsahaj_verify.constants import (
    CODING_PANEL_MIN_WHITE_FRAC,
    CODING_PANEL_RENDER_ZOOM,
    CODING_PANEL_RIGHT_FRAC,
    CODING_PANEL_SAMPLE_STEP,
    CODING_PANEL_UPPER_FRAC,
    CODING_PANEL_WHITE_MIN,
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


#: Some pre-press vendors (this one included) put a "job specification
#: report" cover ahead of the real plates: the full composite plus a header
#: table (Job ID, Client, Colours, colour swatches). It is not an ink plate.
#: Vendors only ever prepend this, so only page 1 is ever checked for it.
REPORT_COVER_MARKERS = ("ARTWORK SIZE", "OPERATOR", "FILE NAME", "JOB ID")


def _looks_like_report_cover(text: str) -> bool:
    """True when a page reads like a vendor's report cover, not a plate.

    A real one-ink separation page carries little more than registration
    marks and the ink's own share of the artwork — it does not carry a
    job-tracking header table. Requiring two markers (rather than one)
    keeps a plate that happens to repeat a single stray word from being
    mistaken for the cover.
    """
    upper = text.upper()
    if "JOB SPECIFICATION REPORT" in upper:
        return True
    return sum(marker in upper for marker in REPORT_COVER_MARKERS) >= 2


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

    @property
    def has_report_cover(self) -> bool:
        """True when page 1 is a report cover rather than a plate."""
        return bool(self.pages) and _looks_like_report_cover(self.pages[0].text)

    @property
    def plate_pages(self) -> list[PageText]:
        """Pages that are one-ink plates, skipping a report cover at page 1."""
        return self.pages[1:] if self.has_report_cover else self.pages

    @property
    def plate_page_colorants(self) -> list[str]:
        """``page_colorants``, aligned with :attr:`plate_pages`."""
        return self.page_colorants[1:] if self.has_report_cover else self.page_colorants


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


@dataclass(frozen=True)
class LabelFrame:
    """One punch / die rectangle around an up, in page points."""

    x0: float
    y0: float
    x1: float
    y1: float


def list_label_frames(
    path: Path,
    label_width_mm: float | None,
    label_height_mm: float | None,
) -> list[LabelFrame]:
    """Green punch-line frames around each up, unique by centre.

    Empty when no such frames could be read.
    """
    try:
        with pymupdf.open(path) as document:
            if document.page_count < 1:
                return []
            page = document[0]
            found: list[LabelFrame] = []
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
                found.append(LabelFrame(rect.x0, rect.y0, rect.x1, rect.y1))
    except Exception as error:  # noqa: BLE001
        raise JobSpecError(f"Cannot read punch frames {path}: {error}") from error
    unique: list[LabelFrame] = []
    gap = PUNCH_SIZE_TOLERANCE_MM
    for frame in found:
        x_mm = points_to_mm((frame.x0 + frame.x1) / 2)
        y_mm = points_to_mm((frame.y0 + frame.y1) / 2)
        if any(
            abs(x_mm - points_to_mm((other.x0 + other.x1) / 2)) <= gap
            and abs(y_mm - points_to_mm((other.y0 + other.y1) / 2)) <= gap
            for other in unique
        ):
            continue
        unique.append(frame)
    return unique


def count_label_frames(
    path: Path,
    label_width_mm: float | None,
    label_height_mm: float | None,
) -> int | None:
    """Count green punch-line frames around each up on a vendor composite.

    Each label on the imposition has a green punch / die line. That count is
    the number of ups. None when no such frames could be read.
    """
    frames = list_label_frames(path, label_width_mm, label_height_mm)
    return len(frames) if frames else None


def render_clip_png(
    path: Path,
    page_number: int,
    frame: LabelFrame,
    max_width_px: int | None = None,
) -> bytes:
    """Rasterise one up (or other clip) for a close-up compare."""
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
            clip = pymupdf.Rect(frame.x0, frame.y0, frame.x1, frame.y1)
            width = clip.width
            if width <= 0:
                raise JobSpecError(f"Clip has no width: {path}")
            zoom = min(cap / width, max_zoom)
            pixmap = page.get_pixmap(
                matrix=pymupdf.Matrix(zoom, zoom),
                clip=clip,
                alpha=False,
            )
            return pixmap.tobytes("png")
    except JobSpecError:
        raise
    except Exception as error:  # noqa: BLE001
        raise JobSpecError(f"Cannot render clip {path}: {error}") from error


def _white_fraction(
    pixmap: object,
    x0: int,
    y0: int,
    x1: int,
    y1: int,
) -> float:
    """Share of near-white pixels in a pixmap rectangle."""
    samples = getattr(pixmap, "samples", None)
    width = int(getattr(pixmap, "width", 0))
    height = int(getattr(pixmap, "height", 0))
    channels = int(getattr(pixmap, "n", 3))
    if not samples or width < 1 or height < 1:
        return 0.0
    x0 = max(0, min(width, x0))
    x1 = max(0, min(width, x1))
    y0 = max(0, min(height, y0))
    y1 = max(0, min(height, y1))
    if x1 <= x0 or y1 <= y0:
        return 0.0
    step = CODING_PANEL_SAMPLE_STEP
    white = 0
    total = 0
    for row in range(y0, y1, step):
        base = row * width * channels
        for col in range(x0, x1, step):
            index = base + col * channels
            red = samples[index]
            green = samples[index + 1]
            blue = samples[index + 2]
            total += 1
            if (
                red >= CODING_PANEL_WHITE_MIN
                and green >= CODING_PANEL_WHITE_MIN
                and blue >= CODING_PANEL_WHITE_MIN
            ):
                white += 1
    return white / total if total else 0.0


def coding_panel_in_pixmap(pixmap: object) -> bool:
    """True when the right (or top) coding area is a large white rectangle."""
    width = int(getattr(pixmap, "width", 0))
    height = int(getattr(pixmap, "height", 0))
    if width < 8 or height < 8:
        return False
    if width >= height:
        x0 = int(width * (1.0 - CODING_PANEL_RIGHT_FRAC))
        y1 = int(height * CODING_PANEL_UPPER_FRAC)
        fraction = _white_fraction(pixmap, x0, 0, width, y1)
    else:
        y1 = int(height * CODING_PANEL_RIGHT_FRAC)
        x0 = int(width * (1.0 - CODING_PANEL_UPPER_FRAC))
        fraction = _white_fraction(pixmap, x0, 0, width, y1)
    return fraction >= CODING_PANEL_MIN_WHITE_FRAC


def coding_panel_on_file(
    path: Path,
    label_width_mm: float | None = None,
    label_height_mm: float | None = None,
) -> bool | None:
    """True when a white Batch / Pkd / M.R.P. coding panel is visible.

    On a composite, every punch-framed up must show the panel. On a single
    label (artwork or first-approval), the coding corner of the page is read.
    """
    try:
        with pymupdf.open(path) as document:
            if document.page_count < 1:
                return None
            page = document[0]
            frames = list_label_frames(path, label_width_mm, label_height_mm)
            zoom = pymupdf.Matrix(CODING_PANEL_RENDER_ZOOM, CODING_PANEL_RENDER_ZOOM)
            if frames:
                return all(
                    coding_panel_in_pixmap(
                        page.get_pixmap(
                            matrix=zoom,
                            clip=pymupdf.Rect(frame.x0, frame.y0, frame.x1, frame.y1),
                            alpha=False,
                        )
                    )
                    for frame in frames
                )
            pixmap = page.get_pixmap(matrix=zoom, alpha=False)
            return coding_panel_in_pixmap(pixmap)
    except JobSpecError:
        raise
    except Exception as error:  # noqa: BLE001
        raise JobSpecError(f"Cannot read coding panel {path}: {error}") from error


def page_size_mm(path: Path) -> tuple[float, float]:
    """Width and height of the first page, in millimetres."""
    with pymupdf.open(path) as document:
        if document.page_count < 1:
            raise JobSpecError(f"PDF has no pages: {path}")
        rect = document[0].rect
        return points_to_mm(rect.width), points_to_mm(rect.height)
