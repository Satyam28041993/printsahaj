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
from contextvars import ContextVar
from dataclasses import dataclass
from pathlib import Path

from printsahaj_verify.constants import CODING_PANEL_CLOSEUP_WIDTH_PX
from printsahaj_verify.extract import list_label_frames, render_clip_png, render_preview_png
from printsahaj_verify.job_spec import JobSpecError
from printsahaj_verify.reporting.terminal import FORBIDDEN_VERDICT_WORDS

GEMINI_KEY_ENV = "PRINTSAHAJ_GEMINI_API_KEY"
GEMINI_KEY_FILE_NAME = "gemini-key.txt"
GEMINI_MODEL_ENV = "PRINTSAHAJ_GEMINI_MODEL"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_TIMEOUT_SEC = 45
GEMINI_API_VERSIONS: tuple[str, ...] = ("v1beta", "v1")
GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/{version}/models/"
    "{model}:generateContent"
)
GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models"
GEMINI_MODEL_CANDIDATES: tuple[str, ...] = (
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash",
)

# The desk can be read in any of these. A press operator picks one at the top
# of the screen and the notes come back written that way.
LANGUAGE_NAMES = {
    "en": "simple English",
    "hi": "Hinglish — Hindi written in English letters, the way people type on WhatsApp",
    "mr": "Marathi",
    "gu": "Gujarati",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "bn": "Bengali",
    "pa": "Punjabi",
}
DEFAULT_LANGUAGE = "en"
_output_language: ContextVar[str] = ContextVar("output_language", default=DEFAULT_LANGUAGE)


def set_output_language(code: str) -> None:
    """Choose the language the notes come back in. Unknown codes fall back."""
    _output_language.set(code if code in LANGUAGE_NAMES else DEFAULT_LANGUAGE)


def output_language() -> str:
    """The language code the notes are being written in right now."""
    return _output_language.get()


def language_rule() -> str:
    """The instruction that puts the notes in the operator's language."""
    code = output_language()
    name = LANGUAGE_NAMES.get(code, LANGUAGE_NAMES[DEFAULT_LANGUAGE])
    script = ""
    if code == "hi":
        script = (
            "Hinglish means Hindi in Roman letters, like a WhatsApp message. "
            'Example: "Bowl dono labels par center mein barabar hai." '
            "Do not use Devanagari script.\n"
        )
    return (
        f"\nWrite every note and explanation in {name}. {script}"
        "Keep sentences short and plain, the way you would explain it to a "
        "press operator who is not a designer. Do not use prepress jargon "
        "without saying what it means.\n"
        "JSON keys and booleans stay in English. If a plate has no readable "
        "sentence, set text_on_plate to exactly: no body copy\n"
        "Text printed ON the label stays exactly as printed. Never translate "
        "the label's own words.\n"
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

PLATE_REVIEW_PROMPT = """You review flexo separation plates against the label.
{refs}

For EACH plate, name the printed TEXT that sits on that ink, separately
from images. This is a prepress plate check, not an art description.

Process C / M / Y plates usually carry only tonal values of the photo
(bowl, glow, leaf). If there is little or no readable sentence on that
ink, write text_on_plate as "no body copy". Do not list gold brand words
as if they sit on cyan.

Black usually carries ingredients, nutritional facts, usage, storage,
manufacturer address, FSSAI number, website and phone.

Spot gold / special usually carries the brand name, product name, claim
badges, the words Batch No. / Pkd. / M.R.P. (labels only), volume and
Product of India.

Spot green often carries only a leaf / watermark — say if no sentence
sits on it.

The last plate is often UV / varnish. No type sits on varnish. A hole,
white box or cut-out is the unvarnished coding window where batch number
and MRP are coded later. That window is expected.

Every image after the reference(s) should be one ink, full of registration
marks, with little else. If one instead shows the whole label in full
colour with several labels side by side and a data table (job ID, client
name, colour count) — a vendor's own tracking cover sheet, not a plate —
say so in that item's note and set text_on_plate to "not a plate — this is
the vendor's report cover" rather than describing it as an ink.

Return JSON only:
plates (array of objects): page (number, 1-based), name (string),
matter_same (boolean),
text_on_plate (string): words / phrases actually visible on THIS ink,
or "no body copy" / "no type",
text_not_on_plate (string): important words that belong on other inks,
images_note (string): bowl, logo, FSSAI, glow on this ink,
note (string): one-line summary,
uv_cutouts (boolean)

Do not write the words PASS, APPROVED, FAIL, or COMPLIANT.
"""

COMPOSITE_REVIEW_PROMPT = """You compare every label on a vendor composite
(imposition, several ups) with the client artwork and the first-approval label.

{refs}

Count how many labels sit on the composite (green punch / die line around
each up). For every up, look at printed wording, bowl / product photo,
logo and FSSAI mark. Say whether all ups match each other, and whether
they match the artwork and the first-approval label. If one up is damaged,
cropped or has different text or images, say which up (1-based, left to
right, top to bottom).

A white empty rectangle beside the words Batch No., Pkd. and M.R.P. is
the coding window. Those values are left blank on purpose so the press
can ink-jet them later. That white panel is design intent. Do not say
the composite is missing the white box if a close-up of an up shows that
white panel. Only flag it if the area is filled with ink where the
artwork has white.

Read Batch / Pkd / M.R.P. from the close-up images when they are present,
not from the small full-sheet view.

You are given close-ups of more than one up. Compare the SAME spot on those
close-ups before you call anything a defect. Photo grain, soft edges,
banding, vertical lines in a glow / sunburst, and compression marks usually
sit in the artwork image itself, so they repeat in the SAME place on every
up. That is how the supplied picture looks, not a damaged up, and it prints
the same on all of them — do not report it. Only name an up as damaged when
it differs from the other ups: text missing, wrong text, a cropped or
shifted element, or a mark that the other ups do not have in that place.

Return JSON only:
ups_count (number),
all_ups_same (boolean),
matches_artwork (boolean),
matches_approval (boolean),
damaged_up (number or 0),
note (string)

Do not write the words PASS, APPROVED, FAIL, or COMPLIANT.
"""

MISSING_CODING_PANEL_RE = re.compile(
    r"(?:white\s+)?(?:batch(?:[\s/-]+coding)?|coding)\s+"
    r"(?:box|panel|window|knock-?out).{0,160}"
    r"(?:missing|absent|gone|not\s+(?:present|found|visible|there))"
    r"|"
    r"(?:missing|absent|gone|not\s+(?:present|found|visible)).{0,80}"
    r"(?:white\s+)?(?:batch(?:[\s/-]+coding)?|coding)\s+"
    r"(?:box|panel|window|knock-?out)",
    re.IGNORECASE | re.DOTALL,
)
OTHER_COMPOSITE_DEFECT_RE = re.compile(
    r"\b(?:cropped|torn|missing (?:logo|bowl|fssai|word)|text differs|"
    r"different text|bowl missing|logo missing)\b",
    re.IGNORECASE,
)
CODING_PANEL_PRESENT_NOTE = (
    "The white Batch / Pkd / M.R.P. coding panel is present on every up. "
    "Blank values in that panel are the coding window, not a missing box."
)

PLATE_REVIEW_TIMEOUT_SEC = 90
PLATE_PREVIEW_WIDTH_PX = 720
COMPOSITE_PREVIEW_WIDTH_PX = 1400


@dataclass(frozen=True)
class PlateVisionNote:
    """Gemini note for one separation page."""

    page: int
    name: str
    matter_same: bool | None
    note: str
    uv_cutouts: bool | None
    text_on_plate: str = ""
    text_not_on_plate: str = ""
    images_note: str = ""


@dataclass(frozen=True)
class CompositeVisionNotes:
    """Gemini note for every up on the vendor composite."""

    ups_count: int | None
    all_ups_same: bool | None
    matches_artwork: bool | None
    matches_approval: bool | None
    damaged_up: int | None
    note: str


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


_STATUS_CACHE: dict[str, object] | None = None
GEMINI_PROBE_TIMEOUT_SEC = 15


def _get_gemini(url: str, timeout: int) -> bytes:
    """HTTP GET. Patch this in tests — do not call the network there."""
    request = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def probe_gemini() -> tuple[bool, str]:
    """Ask Google whether this key can list models. Does not send artwork."""
    key = read_gemini_api_key()
    if not key:
        return False, "No key in gemini-key.txt"
    try:
        models = list_gemini_models(key)
    except JobSpecError as error:
        return False, str(error)
    if not models:
        return True, "Google accepted the key (no Flash model listed yet)"
    picked = preferred_model_order(models)
    shown = picked[0] if picked else models[0]
    return True, f"Google accepted the key (will use {shown})"


def gemini_status(force: bool = False) -> dict[str, object]:
    """Cached Gemini key state for the banner and the desk. Never includes the key."""
    global _STATUS_CACHE
    if _STATUS_CACHE is not None and not force:
        return dict(_STATUS_CACHE)
    configured = gemini_configured()
    if not configured:
        payload: dict[str, object] = {
            "gemini": False,
            "gemini_ok": False,
            "gemini_detail": "No key in gemini-key.txt next to start-tool.bat",
        }
        _STATUS_CACHE = payload
        return dict(payload)
    ok, detail = probe_gemini()
    payload = {"gemini": True, "gemini_ok": ok, "gemini_detail": detail}
    _STATUS_CACHE = payload
    return dict(payload)


def gemini_banner_line() -> str:
    """One line for the black window after the desk starts."""
    status = gemini_status()
    if status["gemini_ok"]:
        return "Gemini: ON — Google accepted the key"
    if status["gemini"]:
        return "Gemini: KEY NOT ACCEPTED — " + str(status["gemini_detail"])
    return (
        "Gemini: OFF — paste the key in gemini-key.txt "
        "next to start-tool.bat, save, restart this window"
    )


def gemini_model_name() -> str:
    """Model id, overridable with PRINTSAHAJ_GEMINI_MODEL."""
    return os.environ.get(GEMINI_MODEL_ENV, DEFAULT_GEMINI_MODEL).strip() or (
        DEFAULT_GEMINI_MODEL
    )


def short_model_name(name: str) -> str:
    """Strip the ``models/`` prefix Google puts on listed model ids."""
    text = name.strip()
    if text.startswith("models/"):
        return text[len("models/") :]
    return text


def generate_content_url(
    model: str,
    key: str,
    version: str = "v1beta",
) -> str:
    """POST URL for one model. The key stays in the query, not in logs."""
    return (
        GEMINI_ENDPOINT.format(
            version=version,
            model=short_model_name(model),
        )
        + "?key="
        + urllib.parse.quote(key)
    )


def is_retryable_gemini_error(error: Exception) -> bool:
    """True when this model or API version is gone and the next one may work."""
    text = str(error).upper()
    return "HTTP 404" in text or "NOT_FOUND" in text


def models_from_list_payload(payload: dict[str, object]) -> list[str]:
    """Ids that accept generateContent, shortest name first."""
    found: list[str] = []
    raw = payload.get("models")
    if not isinstance(raw, list):
        return found
    for item in raw:
        if not isinstance(item, dict):
            continue
        methods = item.get("supportedGenerationMethods") or item.get(
            "supported_generation_methods"
        )
        if isinstance(methods, list) and "generateContent" not in methods:
            continue
        name = short_model_name(str(item.get("name") or ""))
        if name and name not in found:
            found.append(name)
    return found


def preferred_model_order(available: list[str]) -> list[str]:
    """Prefer current Flash models, then anything else that can generate."""
    override = os.environ.get(GEMINI_MODEL_ENV, "").strip()
    ordered: list[str] = []
    if override:
        ordered.append(short_model_name(override))
    for name in GEMINI_MODEL_CANDIDATES:
        if name not in ordered:
            ordered.append(name)
    for name in available:
        if name not in ordered and "flash" in name.lower() and "tts" not in name.lower():
            ordered.append(name)
    if available:
        return [name for name in ordered if name in available] or list(available)
    return ordered


def list_gemini_models(key: str) -> list[str]:
    """Ask Google which models this key can call."""
    url = GEMINI_MODELS_URL + "?key=" + urllib.parse.quote(key)
    try:
        raw = _get_gemini(url, GEMINI_PROBE_TIMEOUT_SEC)
    except urllib.error.HTTPError as error:
        raise JobSpecError(
            f"Gemini model list HTTP {error.code}"
        ) from error
    except urllib.error.URLError as error:
        raise JobSpecError(f"Could not reach Google for model list: {error}") from error
    try:
        payload = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as error:
        raise JobSpecError(f"Gemini model list was not JSON: {error}") from error
    if not isinstance(payload, dict):
        raise JobSpecError("Gemini model list was not an object")
    return models_from_list_payload(payload)


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
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")[:240]
        path = url.split("?", 1)[0]
        raise JobSpecError(
            f"Gemini HTTP {error.code} at {path}: {scrub_vision_text(raw)}"
        ) from error


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


def _vision_body(client_png: bytes, approval_png: bytes) -> bytes:
    """JSON body for a two-image compare. Artwork is the only payload."""
    return json.dumps(
        {
            "contents": [
                {
                    "parts": [
                        {"text": VISION_PROMPT + language_rule()},
                        {
                            "inlineData": {
                                "mimeType": "image/png",
                                "data": base64.b64encode(client_png).decode("ascii"),
                            }
                        },
                        {
                            "inlineData": {
                                "mimeType": "image/png",
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


def _generate_gemini_json(body: bytes, timeout: int) -> tuple[dict[str, object], str]:
    """POST generateContent, retrying Flash models on 404."""
    key = read_gemini_api_key()
    if not key:
        raise JobSpecError("No Gemini key")
    available: list[str] = []
    try:
        available = list_gemini_models(key)
    except JobSpecError:
        available = []
    models = preferred_model_order(available)
    last_error: JobSpecError | None = None
    for model in models:
        for version in GEMINI_API_VERSIONS:
            url = generate_content_url(model, key, version)
            try:
                raw = _post_gemini(url, body, timeout)
            except JobSpecError as error:
                last_error = error
                if not is_retryable_gemini_error(error):
                    raise
                continue
            except urllib.error.HTTPError as error:
                last_error = JobSpecError(
                    f"Gemini HTTP {error.code} at {url.split('?', 1)[0]}"
                )
                if error.code != 404:
                    raise last_error from error
                continue
            except urllib.error.URLError as error:
                raise JobSpecError(
                    f"Gemini request did not complete: {error}"
                ) from error
            return _parse_gemini_body(raw), model
    if last_error is not None:
        raise last_error
    raise JobSpecError("Gemini did not return a usable model for these pictures")


def compare_label_previews(
    client: Path,
    approval: Path,
) -> VisionNotes | None:
    """Send both previews to Gemini. None when no key is set."""
    if not read_gemini_api_key():
        return None
    client_png = render_preview_png(client, 1)
    approval_png = render_preview_png(approval, 1)
    payload, model = _generate_gemini_json(
        _vision_body(client_png, approval_png),
        GEMINI_TIMEOUT_SEC,
    )
    return notes_from_payload(payload, source=f"gemini:{model}")


def _multi_image_body(prompt: str, images: list[bytes]) -> bytes:
    parts: list[dict[str, object]] = [{"text": prompt}]
    for png in images:
        parts.append(
            {
                "inlineData": {
                    "mimeType": "image/png",
                    "data": base64.b64encode(png).decode("ascii"),
                }
            }
        )
    return json.dumps(
        {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0,
                "responseMimeType": "application/json",
            },
        }
    ).encode("utf-8")


def plate_notes_from_payload(
    payload: dict[str, object],
    page_numbers: list[int] | None = None,
) -> tuple[PlateVisionNote, ...]:
    """Parse the plates array from a Gemini JSON object.

    *page_numbers* is the real PDF page each plate image came from, in the
    order the images were sent. When given, it wins over Gemini's own
    self-reported ``page`` — Gemini only knows the order it was shown
    images in, not the true page number, which differs whenever a
    report-cover page was skipped before sending. Left out, this falls
    back to trusting the payload's own numbering (older behaviour).
    """
    raw = payload.get("plates")
    if not isinstance(raw, list):
        return ()
    notes: list[PlateVisionNote] = []
    for index, item in enumerate(raw, start=1):
        if not isinstance(item, dict):
            continue
        if page_numbers and index <= len(page_numbers):
            page = page_numbers[index - 1]
        else:
            page_raw = item.get("page", index)
            try:
                page = int(page_raw)  # type: ignore[arg-type]
            except (TypeError, ValueError):
                page = index
        notes.append(
            PlateVisionNote(
                page=page,
                name=scrub_vision_text(str(item.get("name") or "")),
                matter_same=_as_bool(item.get("matter_same")),
                note=scrub_vision_text(str(item.get("note") or "")),
                uv_cutouts=_as_bool(item.get("uv_cutouts")),
                text_on_plate=scrub_vision_text(str(item.get("text_on_plate") or "")),
                text_not_on_plate=scrub_vision_text(
                    str(item.get("text_not_on_plate") or "")
                ),
                images_note=scrub_vision_text(str(item.get("images_note") or "")),
            )
        )
    return tuple(notes)


def review_separation_plates(
    artwork: Path,
    separations: Path,
    page_numbers: list[int],
    approval: Path | None = None,
) -> tuple[PlateVisionNote, ...] | None:
    """Send artwork, first-approval and each real plate page to Gemini.

    *page_numbers* are the actual PDF pages that are plates (1-based, in
    file order) — a vendor's report-cover page, if one sits at page 1, is
    expected to already be excluded by the caller so it is never sent as
    if it were an ink plate.
    """
    if not read_gemini_api_key():
        return None
    if not page_numbers:
        raise JobSpecError("Separations file has no plate pages")
    images = [render_preview_png(artwork, 1, max_width_px=PLATE_PREVIEW_WIDTH_PX)]
    refs = (
        "Image 1 is the client artwork (one label). "
        "Images after that are separation plates in page order, one ink each."
    )
    if approval is not None:
        images.append(
            render_preview_png(approval, 1, max_width_px=PLATE_PREVIEW_WIDTH_PX)
        )
        refs = (
            "Image 1 is the client artwork (one label). "
            "Image 2 is the first-approval sheet — read the LABEL only, "
            "not the form table. Images after that are separation plates "
            "in page order, one ink each."
        )
    for page in page_numbers:
        images.append(
            render_preview_png(separations, page, max_width_px=PLATE_PREVIEW_WIDTH_PX)
        )
    payload, _model = _generate_gemini_json(
        _multi_image_body(PLATE_REVIEW_PROMPT.format(refs=refs) + language_rule(), images),
        PLATE_REVIEW_TIMEOUT_SEC,
    )
    return plate_notes_from_payload(payload, page_numbers)


def composite_notes_from_payload(payload: dict[str, object]) -> CompositeVisionNotes:
    """Parse the composite-ups object from a Gemini JSON reply."""
    damaged_raw = payload.get("damaged_up")
    damaged: int | None
    try:
        damaged = int(damaged_raw) if damaged_raw not in (None, "", 0, "0") else None
    except (TypeError, ValueError):
        damaged = None
    count_raw = payload.get("ups_count")
    try:
        ups_count = int(count_raw) if count_raw not in (None, "") else None
    except (TypeError, ValueError):
        ups_count = None
    return CompositeVisionNotes(
        ups_count=ups_count,
        all_ups_same=_as_bool(payload.get("all_ups_same")),
        matches_artwork=_as_bool(payload.get("matches_artwork")),
        matches_approval=_as_bool(payload.get("matches_approval")),
        damaged_up=damaged if damaged and damaged > 0 else None,
        note=scrub_vision_text(str(payload.get("note") or "")),
    )


def review_composite_ups(
    artwork: Path | None,
    approval: Path | None,
    composite: Path,
) -> CompositeVisionNotes | None:
    """Send artwork, first-approval and the composite to Gemini."""
    if not read_gemini_api_key():
        return None
    images: list[bytes] = []
    refs = (
        "One later image is the vendor composite with several labels (ups). "
        "Close-ups of individual ups may follow that sheet."
    )
    if artwork is not None:
        images.append(
            render_preview_png(artwork, 1, max_width_px=PLATE_PREVIEW_WIDTH_PX)
        )
        refs = "Image 1 is the client artwork. " + refs
    if approval is not None:
        images.append(
            render_preview_png(approval, 1, max_width_px=PLATE_PREVIEW_WIDTH_PX)
        )
        refs = (
            "One image is the first-approval sheet — read the LABEL only, "
            "not the form table. "
        ) + refs
    if not images:
        return None
    images.append(
        render_preview_png(composite, 1, max_width_px=COMPOSITE_PREVIEW_WIDTH_PX)
    )
    frames = list_label_frames(composite, None, None)
    if frames:
        closeups = [frames[0]]
        labels = ["the first up"]
        if len(frames) >= 3:
            closeups.append(frames[len(frames) // 2])
            labels.append("a middle up")
        if len(frames) > 1:
            closeups.append(frames[-1])
            labels.append("the last up")
        for frame in closeups:
            images.append(
                render_clip_png(
                    composite,
                    1,
                    frame,
                    max_width_px=CODING_PANEL_CLOSEUP_WIDTH_PX,
                )
            )
        refs += (
            " After the full composite, the next images are close-ups of "
            + ", then ".join(labels)
            + ". Compare the SAME spot on those close-ups. "
            "Read the Batch / Pkd / M.R.P. coding panel from the close-ups."
        )
    payload, _model = _generate_gemini_json(
        _multi_image_body(COMPOSITE_REVIEW_PROMPT.format(refs=refs) + language_rule(), images),
        PLATE_REVIEW_TIMEOUT_SEC,
    )
    return composite_notes_from_payload(payload)


def claims_missing_coding_panel(note: str) -> bool:
    """True when a note says the white Batch / Pkd / MRP box is gone."""
    return bool(MISSING_CODING_PANEL_RE.search(note or ""))


def correct_composite_notes(
    notes: CompositeVisionNotes,
    panel_on_composite: bool | None,
    panel_on_refs: bool | None = None,
) -> CompositeVisionNotes:
    """Drop a false 'missing white coding panel' claim when the panel is on the ups.

    Blank Batch / Pkd / M.R.P. values are design intent. A local pixmap
    check of each up is the source of truth for whether the white panel
    itself is present.
    """
    if panel_on_composite is not True:
        return notes
    if not claims_missing_coding_panel(notes.note):
        return notes
    if panel_on_refs is False:
        return notes
    if notes.damaged_up or notes.all_ups_same is False:
        return notes
    if OTHER_COMPOSITE_DEFECT_RE.search(notes.note or ""):
        return notes
    count = f"{notes.ups_count} ups match each other. " if notes.ups_count else ""
    return CompositeVisionNotes(
        ups_count=notes.ups_count,
        all_ups_same=True if notes.all_ups_same is not False else notes.all_ups_same,
        matches_artwork=True,
        matches_approval=True,
        damaged_up=None,
        note=count + CODING_PANEL_PRESENT_NOTE,
    )
