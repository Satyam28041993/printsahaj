"""Diagnostic reader for job PDFs.

This is not a check. It exists to answer one question before any parser is
written: what is actually inside the files this printer receives?

Separation PDFs differ from one plate vendor to the next — different headers,
different colorant naming, different page furniture. Guessing at that structure
produces a parser that works on nobody's files. So the first thing we do with a
real job is read it and look.

Usage:
    python probe.py ../samples/kalonji
    python probe.py ../samples/kalonji/separations.pdf --text-limit 40
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf

from printsahaj_verify.constants import points_to_mm

#: PDF objects declare spot inks as Separation or DeviceN colour spaces. The
#: colorant name sits right after the keyword, so the object text can be scanned
#: for it without rendering anything.
SEPARATION_PATTERN = re.compile(r"/Separation\s*/([^\s/\[\]<>]+)")
DEVICEN_PATTERN = re.compile(r"/DeviceN\s*\[([^\]]*)\]")

#: Text shorter than this is usually a stray artefact rather than content.
MIN_MEANINGFUL_TEXT_LENGTH = 1


@dataclass
class TextSpan:
    """One run of text with the position and type size it was drawn at."""

    text: str
    font: str
    size_pt: float
    x_mm: float
    y_mm: float

    @property
    def size_mm(self) -> float:
        """Nominal type height in millimetres, for font-size floor checks."""
        return points_to_mm(self.size_pt)


@dataclass
class PageProbe:
    """What one page of a PDF contains."""

    number: int
    width_mm: float
    height_mm: float
    rotation: int
    image_count: int
    spans: list[TextSpan] = field(default_factory=list)

    @property
    def text_lines(self) -> list[str]:
        """Non-empty text of the page, in reading order."""
        return [s.text for s in self.spans if s.text.strip()]


@dataclass
class DocumentProbe:
    """What one PDF contains."""

    path: Path
    page_count: int
    pages: list[PageProbe] = field(default_factory=list)
    #: Spot ink names declared anywhere in the file.
    colorants: list[str] = field(default_factory=list)
    metadata: dict[str, str] = field(default_factory=dict)


def read_spans(page: pymupdf.Page) -> list[TextSpan]:
    """Extract every text run on a page with its position, font and size."""
    spans: list[TextSpan] = []
    raw = page.get_text("dict")

    for block in raw.get("blocks", []):
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                text = span.get("text", "")
                if len(text.strip()) < MIN_MEANINGFUL_TEXT_LENGTH:
                    continue
                origin_x, origin_y = span.get("origin", (0.0, 0.0))
                spans.append(
                    TextSpan(
                        text=text,
                        font=span.get("font", "unknown"),
                        size_pt=float(span.get("size", 0.0)),
                        x_mm=points_to_mm(origin_x),
                        y_mm=points_to_mm(origin_y),
                    )
                )
    return spans


def read_colorants(document: pymupdf.Document) -> list[str]:
    """Find spot ink names declared in the file's colour spaces.

    Separation PDFs name their ink somewhere. Sometimes it is only printed in
    the page header by the RIP, but often the colour space itself carries it —
    and when it does, it is far more reliable than parsing header text.
    """
    names: list[str] = []
    for xref in range(1, document.xref_length()):
        try:
            obj = document.xref_object(xref, compressed=False)
        except Exception:  # noqa: BLE001 - a damaged object must not stop the probe
            continue
        for match in SEPARATION_PATTERN.finditer(obj):
            names.append(match.group(1))
        for match in DEVICEN_PATTERN.finditer(obj):
            names.extend(part.lstrip("/") for part in match.group(1).split() if part.startswith("/"))

    seen: list[str] = []
    for name in names:
        if name not in seen:
            seen.append(name)
    return seen


def probe_document(path: Path) -> DocumentProbe:
    """Read one PDF and describe what is in it."""
    with pymupdf.open(path) as document:
        pages = [
            PageProbe(
                number=index + 1,
                width_mm=points_to_mm(page.rect.width),
                height_mm=points_to_mm(page.rect.height),
                rotation=page.rotation,
                image_count=len(page.get_images(full=True)),
                spans=read_spans(page),
            )
            for index, page in enumerate(document)
        ]
        return DocumentProbe(
            path=path,
            page_count=document.page_count,
            pages=pages,
            colorants=read_colorants(document),
            metadata={k: v for k, v in (document.metadata or {}).items() if v},
        )


def format_probe(probe: DocumentProbe, text_limit: int) -> str:
    """Render a probe as a plain-text report."""
    lines: list[str] = []
    lines.append("=" * 72)
    lines.append(f"FILE   {probe.path.name}")
    lines.append(f"PAGES  {probe.page_count}")

    if probe.colorants:
        lines.append(f"INKS   {', '.join(probe.colorants)}")
    else:
        lines.append("INKS   none declared in colour spaces "
                     "(ink names may only exist in the page header text)")

    if probe.metadata:
        interesting = {k: v for k, v in probe.metadata.items()
                       if k in {"title", "producer", "creator", "creationDate"}}
        for key, value in interesting.items():
            lines.append(f"{key.upper():<7}{value}")

    for page in probe.pages:
        lines.append("")
        lines.append("-" * 72)
        lines.append(
            f"PAGE {page.number}   "
            f"{page.width_mm:.3f} x {page.height_mm:.3f} mm   "
            f"rotation {page.rotation}   images {page.image_count}   "
            f"text runs {len(page.spans)}"
        )

        shown = page.spans[:text_limit]
        for span in shown:
            lines.append(
                f"  [{span.x_mm:7.2f},{span.y_mm:7.2f}] "
                f"{span.size_mm:5.2f}mm  {span.font[:22]:<22}  {span.text}"
            )
        remaining = len(page.spans) - len(shown)
        if remaining > 0:
            lines.append(f"  ... {remaining} more text runs "
                         f"(raise --text-limit to see them)")

    return "\n".join(lines)


def collect_pdfs(target: Path) -> list[Path]:
    """Resolve a file or directory argument to a list of PDFs."""
    if target.is_dir():
        return sorted(target.glob("*.pdf"))
    return [target]


def use_utf8_output() -> None:
    """Force UTF-8 on stdout.

    Indian label artwork carries Devanagari, Gujarati, Tamil and other scripts,
    and separation headers use typographic characters. The Windows console
    defaults to a legacy codepage that cannot encode any of it, so printing the
    extracted text would crash. Reading the text is the entire point of this
    tool, so the output stream is switched rather than the text sanitised.
    """
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is not None:
            reconfigure(encoding="utf-8", errors="replace")


def main(argv: list[str] | None = None) -> int:
    """Entry point. Returns a process exit code."""
    use_utf8_output()
    parser = argparse.ArgumentParser(
        description="Describe what is inside a job's PDFs, before writing any parser.",
    )
    parser.add_argument("target", type=Path, help="A PDF file, or a folder of PDFs")
    parser.add_argument(
        "--text-limit",
        type=int,
        default=25,
        help="Text runs to print per page (default: 25)",
    )
    args = parser.parse_args(argv)

    if not args.target.exists():
        print(f"Not found: {args.target}", file=sys.stderr)
        return 1

    pdfs = collect_pdfs(args.target)
    if not pdfs:
        print(f"No PDFs in {args.target}", file=sys.stderr)
        return 1

    for path in pdfs:
        print(format_probe(probe_document(path), args.text_limit))
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
