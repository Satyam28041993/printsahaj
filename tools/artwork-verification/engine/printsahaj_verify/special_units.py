"""Load special printing units from a versioned JSON pack."""

from __future__ import annotations

import json
from pathlib import Path

DEFAULT_PACK_PATH = (
    Path(__file__).resolve().parents[1] / "rule_packs" / "special_units.default.json"
)


def load_special_units(path: Path | None = None) -> dict[str, str]:
    """Return token → canonical special-unit name."""
    pack = path or DEFAULT_PACK_PATH
    if not pack.is_file():
        raise ValueError(f"Special-unit pack not found: {pack}")
    raw = json.loads(pack.read_text(encoding="utf-8"))
    units = raw.get("units")
    if not isinstance(units, dict) or not units:
        raise ValueError(f"Special-unit pack has no units: {pack}")
    return {str(key).upper(): str(value) for key, value in units.items()}


def canonical_special_unit(raw: str, table: dict[str, str] | None = None) -> str:
    """Map one ``+`` clause such as ``MATT LAMINATION`` or ``RAYS UV``."""
    mapping = table or load_special_units()
    found: list[str] = []
    for word in raw.upper().replace("-", " ").split():
        if word in mapping and mapping[word] not in found:
            found.append(mapping[word])
    if not found:
        known = ", ".join(sorted(set(mapping.values())))
        raise ValueError(
            f"Unknown special unit {raw!r}. Known: {known}"
        )
    return found[0]
