"""Optional Gemini look at two label previews.

A PNG has no text layer. PyMuPDF cannot read wording, bowl position, logo
place, batch or MRP from pixels. When PRINTSAHAJ_GEMINI_API_KEY is set,
this module sends the two previews to Gemini and returns structured notes.

Notes are advisory. They are not a sign-off. Artwork leaves this machine
when Gemini is used. No new Python package is added — stdlib HTTP only.
"""

from __future__ import annotations

import base64
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from printsahaj_verify.extract import render_preview_png
from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.reporting.terminal import FORBIDDEN_VERDICT_WORDS

GEMINI_KEY_ENV = "PRINTSAHAJ_GEMINI_API_KEY"
GEMINI_KEY_FILE_NAME = "gemini-key.txt"
GEMINI_MODEL_ENV = "PRINTSAHAJ_GEMINI_MODEL"
DEFAULT_GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_TIMEOUT_SEC = 45
GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "{model}:generateContent"
)

VISION_PROMPT = """You compare two pictures of the same printed label.
Image 1 is the client artwork. Image 2 is the first-approval sheet
(it may include a form around the label). Look at the LABEL artwork,
not the form table around it.

Return JSON only with these keys:
wording_same (boolean): printed wording on both labels matches
wording_note (string): short note
product_centered_both (boolean): the main product photo (bowl, bottle)
sits in the same middle place on both labels
alignment_note (string): short note
logo_same_place (boolean): the brand logo sits in the same place on both
logo_note (string): short note
batch_on_label (boolean): a batch number is printed on the label artwork.
A blank box or missing batch is false
batch_note (string): short note
mrp_on_label (boolean): MRP is printed on the label artwork
mrp_note (string): short note

Do not write the words PASS, APPROVED, FAIL, or COMPLIANT.
"""


@dataclass(frozen=True)
class VisionNotes:
    """What Gemini reported about the two label pictures."""

    wording_same: bool | None
    wording_note: str
    product_centered_both: bool | None
    alignment_note: str
    logo_same_place: bool | None
    logo_note: str
    batch_on_label: bool | None
    batch_note: str
    mrp_on_label: bool | None
    mrp_note: str
    source: str


def gemini_key_path() -> Path:
    """``gemini-key.txt`` sits next to ``start-tool.bat``."""
    return Path(__file__).resolve().parents[2] / GEMINI_KEY_FILE_NAME


def read_gemini_api_key(path: Path | None = None) -> str:
    """Key from the environment, or the first line of ``gemini-key.txt``.

    The environment variable wins when both are set. Notepad's UTF-8 BOM
    is stripped. Lines starting with ``#`` are ignored.
    """
    env = os.environ.get(GEMINI_KEY_ENV, "").strip()
    if env:
        return env
    target = path or gemini_key_path()
    if not target.is_file():
        return ""
    text = target.read_text(encoding="utf-8-sig")
    for line in text.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line
    return ""


def gemini_configured() -> bool:
    """True when a Gemini API key is set on this machine."""
    return bool(read_gemini_api_key())


def gemini_model_name() -> str:
    """Model id, overridable with PRINTSAHAJ_GEMINI_MODEL."""
    return os.environ.get(GEMINI_MODEL_ENV, DEFAULT_GEMINI_MODEL).strip() or (
        DEFAULT_GEMINI_MODEL
    )


def scrub_vision_text(text: str) -> str:
    """Strip forbidden verdict words so a report cannot contain them."""
    cleaned = text
    for word in FORBIDDEN_VERDICT_WORDS:
        cleaned = re.sub(re.escape(word), "noted", cleaned, flags=re.IGNORECASE)
    return cleaned


def _as_bool(value: object) -> bool | None:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "yes", "1"}:
            return True
        if lowered in {"false", "no", "0"}:
            return False
    return None


def notes_from_payload(payload: dict[str, object], source: str) -> VisionNotes:
    """Build notes from a parsed Gemini JSON object."""
    return VisionNotes(
        wording_same=_as_bool(payload.get("wording_same")),
        wording_note=scrub_vision_text(str(payload.get("wording_note") or "")),
        product_centered_both=_as_bool(payload.get("product_centered_both")),
        alignment_note=scrub_vision_text(str(payload.get("alignment_note") or "")),
        logo_same_place=_as_bool(payload.get("logo_same_place")),
        logo_note=scrub_vision_text(str(payload.get("logo_note") or "")),
        batch_on_label=_as_bool(payload.get("batch_on_label")),
        batch_note=scrub_vision_text(str(payload.get("batch_note") or "")),
        mrp_on_label=_as_bool(payload.get("mrp_on_label")),
        mrp_note=scrub_vision_text(str(payload.get("mrp_note") or "")),
        source=source,
    )


def _post_gemini(url: str, body: bytes, timeout: int) -> bytes:
    """HTTP POST. Patch this in tests — do not call the network there."""
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def _parse_gemini_body(raw: bytes) -> dict[str, object]:
    """Read the JSON object Gemini was asked to return."""
    try:
        envelope = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as error:
        raise JobSpecError(f"Gemini reply was not JSON: {error}") from error
    if not isinstance(envelope, dict):
        raise JobSpecError("Gemini reply was not an object")
    if envelope.get("error"):
        raise JobSpecError(f"Gemini error: {envelope['error']}")
    candidates = envelope.get("candidates")
    if not isinstance(candidates, list) or not candidates:
        raise JobSpecError("Gemini returned no candidates")
    first = candidates[0]
    if not isinstance(first, dict):
        raise JobSpecError("Gemini candidate was not an object")
    content = first.get("content")
    if not isinstance(content, dict):
        raise JobSpecError("Gemini content was missing")
    parts = content.get("parts")
    if not isinstance(parts, list) or not parts:
        raise JobSpecError("Gemini parts were missing")
    text = ""
    first_part = parts[0]
    if isinstance(first_part, dict):
        text = str(first_part.get("text") or "")
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        payload = json.loads(text)
    except json.JSONDecodeError as error:
        raise JobSpecError(f"Gemini text was not JSON: {error}") from error
    if not isinstance(payload, dict):
        raise JobSpecError("Gemini JSON was not an object")
    return payload


def compare_label_previews(
    client: Path,
    approval: Path,
) -> VisionNotes | None:
    """Send both previews to Gemini. None when no key is set."""
    key = read_gemini_api_key()
    if not key:
        return None
    client_png = render_preview_png(client, 1)
    approval_png = render_preview_png(approval, 1)
    model = gemini_model_name()
    url = GEMINI_ENDPOINT.format(model=model) + "?key=" + urllib.parse.quote(key)
    body = json.dumps(
        {
            "contents": [
                {
                    "parts": [
                        {"text": VISION_PROMPT},
                        {
                            "inline_data": {
                                "mime_type": "image/png",
                                "data": base64.b64encode(client_png).decode("ascii"),
                            }
                        },
                        {
                            "inline_data": {
                                "mime_type": "image/png",
                                "data": base64.b64encode(approval_png).decode("ascii"),
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0,
                "responseMimeType": "application/json",
            },
        }
    ).encode("utf-8")
    try:
        raw = _post_gemini(url, body, GEMINI_TIMEOUT_SEC)
    except urllib.error.URLError as error:
        raise JobSpecError(f"Gemini request did not complete: {error}") from error
    payload = _parse_gemini_body(raw)
    return notes_from_payload(payload, source=f"gemini:{model}")
