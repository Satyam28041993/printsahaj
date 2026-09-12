"""Digitised job sheet — the source of truth every check compares against.

Phase 0 types these fields in. The job-sheet PDF is not parsed.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

#: Words that name a printing unit which is not a process/spot colour.
SPECIAL_UNIT_WORDS: frozenset[str] = frozenset(
    {
        "VARNISH",
        "COATING",
        "WHITE",
        "PRIMER",
        "FOIL",
        "EMBOSS",
        "LAMINATE",
        "LAMINATION",
    }
)


class JobSpecError(ValueError):
    """The job file is malformed. Callers must not continue."""


@dataclass(frozen=True)
class JobSpec:
    """One job's typed specification, matching product spec §4.1."""

    job_id: str
    file_name: str
    customer: str
    colour_declaration: str
    colour_list: tuple[str, ...]
    special_units: tuple[str, ...]
    label_width_mm: float
    label_height_mm: float
    print_type: str
    paper: str | None = None
    date: str | None = None

    @property
    def declared_units(self) -> int:
        """Colour plates plus special units (varnish, white, …)."""
        return len(self.colour_list) + len(self.special_units)


def parse_colour_declaration(text: str) -> tuple[int, tuple[str, ...]]:
    """Read a line like ``6 COL + VARNISH`` into a colour count and extras.

    The leading integer is the colour count. Tokens after ``+`` are special
    units. Fails loudly if the line has no number or an unknown extra.
    """
    stripped = text.strip()
    if not stripped:
        raise JobSpecError("colour_declaration is empty")

    parts = [part.strip() for part in stripped.replace(",", "+").split("+")]
    head = parts[0]
    digits = ""
    for character in head:
        if character.isdigit():
            digits += character
        elif digits:
            break
    if not digits:
        raise JobSpecError(
            f"colour_declaration has no colour count: {text!r}"
        )
    colour_count = int(digits)

    extras: list[str] = []
    for raw in parts[1:]:
        token = raw.strip().upper()
        if not token:
            continue
        word = token.split()[0]
        if word not in SPECIAL_UNIT_WORDS:
            raise JobSpecError(
                f"Unknown special unit {raw!r} in colour_declaration {text!r}. "
                f"Known: {', '.join(sorted(SPECIAL_UNIT_WORDS))}"
            )
        extras.append("Varnish" if word == "VARNISH" else word.title())
    return colour_count, tuple(extras)


def _as_string(data: dict[str, Any], key: str) -> str:
    value = data.get(key)
    if not isinstance(value, str) or not value.strip():
        raise JobSpecError(f"job.json is missing a non-empty string field: {key}")
    return value.strip()


def _normalise_special(name: str) -> str:
    word = name.strip().upper().split()[0]
    if word not in SPECIAL_UNIT_WORDS:
        raise JobSpecError(f"Unknown special unit: {name!r}")
    return "Varnish" if word == "VARNISH" else word.title()


def load_job_spec(path: Path) -> JobSpec:
    """Load and validate ``job.json``. Raises JobSpecError on any problem."""
    if not path.is_file():
        raise JobSpecError(f"Job file not found: {path}")

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise JobSpecError(f"job.json is not valid JSON: {error}") from error

    if not isinstance(raw, dict):
        raise JobSpecError("job.json must be an object")

    colour_list_raw = raw.get("colour_list")
    if not isinstance(colour_list_raw, list) or not colour_list_raw:
        raise JobSpecError("job.json needs a non-empty colour_list")
    colour_list = tuple(str(item).strip() for item in colour_list_raw)
    if any(not item for item in colour_list):
        raise JobSpecError("colour_list contains an empty name")

    declaration = _as_string(raw, "colour_declaration")
    declared_colours, declared_specials = parse_colour_declaration(declaration)

    if len(colour_list) != declared_colours:
        raise JobSpecError(
            f"colour_declaration says {declared_colours} colours "
            f"({declaration!r}) but colour_list has {len(colour_list)} names"
        )

    if "special_units" in raw:
        special_raw = raw["special_units"]
        if not isinstance(special_raw, list):
            raise JobSpecError("special_units must be a list")
        special_units = tuple(_normalise_special(str(item)) for item in special_raw)
        if special_units != declared_specials:
            raise JobSpecError(
                f"special_units {list(special_units)} do not match "
                f"colour_declaration extras {list(declared_specials)}"
            )
    else:
        special_units = declared_specials

    size = raw.get("label_size_mm")
    if not isinstance(size, list) or len(size) != 2:
        raise JobSpecError("label_size_mm must be [width, height] in millimetres")
    try:
        width = float(size[0])
        height = float(size[1])
    except (TypeError, ValueError) as error:
        raise JobSpecError("label_size_mm values must be numbers") from error
    if width <= 0 or height <= 0:
        raise JobSpecError("label_size_mm values must be greater than zero")

    paper = raw.get("paper")
    date = raw.get("date")

    return JobSpec(
        job_id=_as_string(raw, "job_id"),
        file_name=_as_string(raw, "file_name"),
        customer=_as_string(raw, "customer"),
        colour_declaration=declaration,
        colour_list=colour_list,
        special_units=special_units,
        label_width_mm=width,
        label_height_mm=height,
        print_type=_as_string(raw, "print_type"),
        paper=str(paper).strip() if isinstance(paper, str) and paper.strip() else None,
        date=str(date).strip() if isinstance(date, str) and date.strip() else None,
    )
