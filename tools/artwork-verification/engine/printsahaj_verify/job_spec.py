"""Digitised job sheet — the source of truth every check compares against.

Phase 0 types these fields in. The job-sheet PDF is not parsed.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

# Special units live in rule_packs/special_units.default.json — not here.


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
    cylinder_repeat_mm: float | None = None
    paper_width_mm: float | None = None
    plate_thickness_mm: float | None = None
    ups_across: int | None = None
    ups_around: int | None = None
    mandatory_texts: tuple[str, ...] = ()

    @property
    def has_colour_line(self) -> bool:
        """True when the operator has typed the colour declaration."""
        return bool(self.colour_declaration and self.colour_list)

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
    from printsahaj_verify.special_units import canonical_special_unit

    for raw in parts[1:]:
        token = raw.strip()
        if not token:
            continue
        try:
            extras.append(canonical_special_unit(token))
        except ValueError as error:
            raise JobSpecError(
                f"{error} in colour_declaration {text!r}"
            ) from error
    return colour_count, tuple(extras)


def _as_string(data: dict[str, Any], key: str) -> str:
    value = data.get(key)
    if not isinstance(value, str) or not value.strip():
        raise JobSpecError(f"job.json is missing a non-empty string field: {key}")
    return value.strip()


def _normalise_special(name: str) -> str:
    from printsahaj_verify.special_units import canonical_special_unit

    try:
        return canonical_special_unit(name)
    except ValueError as error:
        raise JobSpecError(str(error)) from error


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
    declaration_raw = raw.get("colour_declaration")
    has_list = isinstance(colour_list_raw, list) and bool(colour_list_raw)
    has_declaration = isinstance(declaration_raw, str) and bool(declaration_raw.strip())

    if has_list ^ has_declaration:
        raise JobSpecError(
            "colour_declaration and colour_list must both be present, or both left empty"
        )

    if has_list and has_declaration:
        colour_list = tuple(str(item).strip() for item in colour_list_raw)
        if any(not item for item in colour_list):
            raise JobSpecError("colour_list contains an empty name")
        declaration = declaration_raw.strip()
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
    else:
        colour_list = ()
        declaration = ""
        special_units = ()

    width = 0.0
    height = 0.0
    size = raw.get("label_size_mm")
    if size is not None:
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
    customer = raw.get("customer")
    print_type = raw.get("print_type")
    mandatory_raw = raw.get("mandatory_texts")
    mandatory: tuple[str, ...] = ()
    if mandatory_raw is not None:
        if not isinstance(mandatory_raw, list):
            raise JobSpecError("mandatory_texts must be a list of strings")
        mandatory = tuple(str(item).strip() for item in mandatory_raw if str(item).strip())

    def _optional_float(key: str) -> float | None:
        value = raw.get(key)
        if value is None or value == "":
            return None
        try:
            return float(value)
        except (TypeError, ValueError) as error:
            raise JobSpecError(f"{key} must be a number") from error

    def _optional_int(key: str) -> int | None:
        value = raw.get(key)
        if value is None or value == "":
            return None
        try:
            return int(value)
        except (TypeError, ValueError) as error:
            raise JobSpecError(f"{key} must be a whole number") from error

    return JobSpec(
        job_id=_as_string(raw, "job_id"),
        file_name=_as_string(raw, "file_name"),
        customer=str(customer).strip() if isinstance(customer, str) else "",
        colour_declaration=declaration,
        colour_list=colour_list,
        special_units=special_units,
        label_width_mm=width,
        label_height_mm=height,
        print_type=str(print_type).strip() if isinstance(print_type, str) and print_type.strip() else "Flexo",
        paper=str(paper).strip() if isinstance(paper, str) and paper.strip() else None,
        date=str(date).strip() if isinstance(date, str) and date.strip() else None,
        cylinder_repeat_mm=_optional_float("cylinder_repeat_mm"),
        paper_width_mm=_optional_float("paper_width_mm"),
        plate_thickness_mm=_optional_float("plate_thickness_mm"),
        ups_across=_optional_int("ups_across"),
        ups_around=_optional_int("ups_around"),
        mandatory_texts=mandatory,
    )


def job_spec_to_dict(job: JobSpec) -> dict[str, object]:
    """Write a JobSpec back to the job.json shape."""
    payload: dict[str, object] = {
        "job_id": job.job_id,
        "file_name": job.file_name,
        "customer": job.customer,
        "print_type": job.print_type,
    }
    if job.colour_declaration:
        payload["colour_declaration"] = job.colour_declaration
        payload["colour_list"] = list(job.colour_list)
        payload["special_units"] = list(job.special_units)
    if job.label_width_mm > 0 and job.label_height_mm > 0:
        payload["label_size_mm"] = [job.label_width_mm, job.label_height_mm]
    if job.paper:
        payload["paper"] = job.paper
    if job.date:
        payload["date"] = job.date
    if job.cylinder_repeat_mm is not None:
        payload["cylinder_repeat_mm"] = job.cylinder_repeat_mm
    if job.paper_width_mm is not None:
        payload["paper_width_mm"] = job.paper_width_mm
    if job.plate_thickness_mm is not None:
        payload["plate_thickness_mm"] = job.plate_thickness_mm
    if job.ups_across is not None:
        payload["ups_across"] = job.ups_across
    if job.ups_around is not None:
        payload["ups_around"] = job.ups_around
    if job.mandatory_texts:
        payload["mandatory_texts"] = list(job.mandatory_texts)
    return payload
