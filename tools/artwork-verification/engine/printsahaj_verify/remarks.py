"""Human remarks on a report. The machine never writes a verdict here."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REMARKS_FILE_NAME = "remarks.json"


def empty_remarks() -> dict[str, Any]:
    return {"items": [], "overall": None}


def load_remarks(folder: Path) -> dict[str, Any]:
    path = folder / REMARKS_FILE_NAME
    if not path.is_file():
        return empty_remarks()
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return empty_remarks()
    items = raw.get("items")
    if not isinstance(items, list):
        items = []
    return {"items": items, "overall": raw.get("overall")}


def add_remark(
    folder: Path,
    *,
    check_id: str | None,
    summary: str | None,
    remark: str,
    by: str,
) -> dict[str, Any]:
    """Append one remark. Empty remarks are rejected."""
    text = remark.strip()
    if not text:
        raise ValueError("Remark text is empty")
    who = by.strip() or "unknown"
    payload = load_remarks(folder)
    entry = {
        "check_id": check_id,
        "summary": summary,
        "remark": text,
        "by": who,
        "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    if check_id is None and summary is None:
        payload["overall"] = entry
    else:
        payload["items"].append(entry)
    (folder / REMARKS_FILE_NAME).write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return payload
