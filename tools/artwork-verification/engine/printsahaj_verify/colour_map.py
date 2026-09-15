"""Load the colour name mapping table from a versioned JSON pack."""

from __future__ import annotations

import json
from pathlib import Path

from printsahaj_verify.job_spec import JobSpecError

DEFAULT_MAP_PATH = (
    Path(__file__).resolve().parents[1] / "rule_packs" / "colour_map.default.json"
)


def load_colour_map(path: Path | None = None) -> dict[str, list[str]]:
    """Return job-sheet name → list of production names."""
    pack = path or DEFAULT_MAP_PATH
    if not pack.is_file():
        raise JobSpecError(f"Colour mapping pack not found: {pack}")
    raw = json.loads(pack.read_text(encoding="utf-8"))
    mappings = raw.get("mappings")
    if not isinstance(mappings, dict) or not mappings:
        raise JobSpecError(f"Colour mapping pack has no mappings: {pack}")
    result: dict[str, list[str]] = {}
    for key, value in mappings.items():
        if not isinstance(value, list) or not value:
            raise JobSpecError(f"Mapping for {key!r} must be a non-empty list")
        result[str(key)] = [str(item) for item in value]
    return result


def normalise_ink_name(name: str) -> str:
    """Strip PDF name noise so Gold/617 style names can meet."""
    cleaned = name.replace("#20", " ").replace("_", " ")
    return " ".join(cleaned.split()).upper()


def production_names_for(job_name: str, mapping: dict[str, list[str]]) -> list[str]:
    """Names that count as this job-sheet colour on a separation."""
    aliases = mapping.get(job_name, [job_name])
    return [normalise_ink_name(alias) for alias in aliases] + [normalise_ink_name(job_name)]
