"""Resolve the five job files from a folder.

Preferred names are fixed so the desk app and the command line agree.
Older loose folders (Kalonji samples) still work via name hints.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from printsahaj_verify.job_spec import JobSpecError

CLIENT_ARTWORK_NAME = "client_artwork.pdf"
APPROVAL_NAME = "approval.pdf"
VENDOR_COMPOSITE_NAME = "vendor_composite.pdf"
SEPARATIONS_NAME = "separations.pdf"
PRINTOUT_DIR_NAME = "printouts"

IMAGE_SUFFIXES: tuple[str, ...] = (".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff")
#: Suffixes the desk will store. TIFF stays discoverable for older print photos.
UPLOAD_SUFFIXES: tuple[str, ...] = (".pdf", ".png", ".jpg", ".jpeg", ".webp")
ROLE_STEMS: tuple[str, ...] = (
    "client_artwork",
    "approval",
    "vendor_composite",
    "separations",
)


def is_pdf(path: Path) -> bool:
    """True when the file is a PDF by suffix. Images are not treated as PDFs."""
    return path.suffix.lower() == ".pdf"


def role_candidate_names(stem: str) -> tuple[str, ...]:
    """Preferred on-disk names for one upload slot, PDF first then images."""
    return tuple(f"{stem}{suffix}" for suffix in UPLOAD_SUFFIXES)


def find_role_file(folder: Path, stem: str) -> Path | None:
    """Return the stored file for a role, or None if that slot is empty."""
    return _first_existing(folder, role_candidate_names(stem))


def is_named_role_file(path: Path) -> bool:
    """True when the filename is a reserved job-slot name."""
    return path.stem.lower() in ROLE_STEMS


@dataclass(frozen=True)
class JobFiles:
    """Paths that exist for one job. Missing roles are None, never guessed away."""

    client_artwork: Path | None
    approval: Path | None
    vendor_composite: Path | None
    separations: Path | None
    printouts: tuple[Path, ...]


def _first_existing(folder: Path, names: tuple[str, ...]) -> Path | None:
    for name in names:
        path = folder / name
        if path.is_file():
            return path
    return None


def _hinted_pdf(folder: Path, hints: tuple[str, ...], exclude: set[Path]) -> Path | None:
    matches = [
        path
        for path in sorted(folder.glob("*.pdf"))
        if path not in exclude
        and any(hint in path.name.lower() for hint in hints)
    ]
    if len(matches) > 1:
        names = ", ".join(path.name for path in matches)
        raise JobSpecError(f"Several files match {hints}: {names}")
    return matches[0] if matches else None


def discover_job_files(folder: Path) -> JobFiles:
    """Find each role. Ambiguous names raise. Missing roles stay None."""
    client = find_role_file(folder, "client_artwork") or _first_existing(
        folder, ("artwork.pdf",)
    )
    approval = find_role_file(folder, "approval") or _first_existing(
        folder, ("job-sheet.pdf", "job_sheet.pdf")
    )
    composite = find_role_file(folder, "vendor_composite") or _first_existing(
        folder, ("composite.pdf", "vendor_artwork.pdf")
    )
    separations = find_role_file(folder, "separations") or _first_existing(
        folder, ("separation.pdf",)
    )

    taken = {path for path in (client, approval, composite, separations) if path}

    if client is None:
        client = _hinted_pdf(folder, ("artwork", "client"), taken)
        if client:
            taken.add(client)
    if approval is None:
        approval = _hinted_pdf(folder, ("approval", "job-sheet", "jobsheet"), taken)
        if approval:
            taken.add(approval)
    if composite is None:
        composite = _hinted_pdf(folder, ("composite", "proof"), taken)
        if composite:
            taken.add(composite)
    if separations is None:
        separations = _hinted_pdf(folder, ("separat",), taken)
        if separations:
            taken.add(separations)

    leftovers = [
        path
        for path in sorted(folder.glob("*.pdf"))
        if path not in taken
    ]
    if separations is None and len(leftovers) == 1:
        separations = leftovers[0]
        taken.add(separations)
    elif separations is None and len(leftovers) > 1:
        names = ", ".join(path.name for path in leftovers)
        raise JobSpecError(
            "Several PDFs found. Name them client_artwork, approval, "
            f"vendor_composite or separations. Files: {names}"
        )

    printout_dir = folder / PRINTOUT_DIR_NAME
    printouts: list[Path] = []
    if printout_dir.is_dir():
        printouts.extend(
            path
            for path in sorted(printout_dir.iterdir())
            if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES
        )
    printouts.extend(
        path
        for path in sorted(folder.iterdir())
        if path.is_file()
        and path.suffix.lower() in IMAGE_SUFFIXES
        and not is_named_role_file(path)
    )

    return JobFiles(
        client_artwork=client,
        approval=approval,
        vendor_composite=composite,
        separations=separations,
        printouts=tuple(printouts),
    )
