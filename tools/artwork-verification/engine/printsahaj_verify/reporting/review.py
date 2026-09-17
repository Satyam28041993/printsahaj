"""Point-wise review for one step. Green tick / red cross / compare by eye.

Never writes PASS, APPROVED, FAIL, or COMPLIANT.
A tick means this check did not flag a problem. It is not a sign-off.
"""

from __future__ import annotations

from printsahaj_verify.models import Certainty, CheckResult
from printsahaj_verify.reporting.checklist import (
    STATE_CLEAR,
    STATE_ISSUE,
    STATE_JUDGE,
    STATE_WAIT,
)
from printsahaj_verify.reporting.terminal import FORBIDDEN_VERDICT_WORDS
from printsahaj_verify.stages import STAGE_ORDER, STAGE_TITLES

STATE_EYE = "eye"

EYE_DETAIL = "Not checked automatically. Compare the two previews by eye."

APPROVAL_NOT_CHECKED = (
    "Colour shade / accuracy",
    "Exact millimetre alignment of every element",
    "MRP and batch printed values (only whether they appear on the label)",
    "Trap, overprint and aesthetics",
)

VENDOR_NOT_CHECKED = (
    "Colour shade on each plate",
    "Trap and overprint intent",
    "Printed Batch / Pkd / MRP values (the white coding panel is left blank on purpose)",
)

PRINT_NOT_CHECKED = (
    "Automatic match of the print photo to the PDFs",
    "Barcode ISO grade",
    "Colour shade on the printed roll",
)


def _item(
    item_id: str,
    title: str,
    state: str,
    detail: str,
    text_block: str = "",
) -> dict[str, str]:
    """One review row. *text_block* is long matter the desk keeps behind a
    scroll box in the detail view, so the main screen stays readable."""
    return {
        "id": item_id,
        "title": title,
        "state": state,
        "detail": detail,
        "text_block": text_block,
    }


def _from_check(
    result: CheckResult | None,
    item_id: str,
    title: str,
    ok_detail: str,
) -> dict[str, str]:
    if result is None:
        return _item(item_id, title, STATE_WAIT, "Check did not run")
    if not result.ran:
        return _item(
            item_id,
            title,
            STATE_WAIT,
            result.not_run_reason or "Check did not run",
        )
    certain = [item for item in result.findings if item.certainty is Certainty.DETERMINISTIC]
    advisory = [item for item in result.findings if item.certainty is Certainty.ADVISORY]
    if certain:
        extra = f" (+{len(certain) - 1})" if len(certain) > 1 else ""
        return _item(item_id, title, STATE_ISSUE, certain[0].summary + extra)
    if advisory:
        extra = f" (+{len(advisory) - 1})" if len(advisory) > 1 else ""
        return _item(item_id, title, STATE_JUDGE, advisory[0].summary + extra)
    return _item(item_id, title, STATE_CLEAR, ok_detail)


def _mentioned(
    observations: dict[str, str],
    key: str,
    item_id: str,
    title: str,
    ok_template: str,
    missing: str,
    result: CheckResult | None,
) -> dict[str, str]:
    if result is None or not result.ran:
        return _item(
            item_id,
            title,
            STATE_WAIT,
            result.not_run_reason if result else "Vendor header was not read",
        )
    value = observations.get(key, "")
    if value and value != "none":
        return _item(item_id, title, STATE_CLEAR, ok_template.format(value=value))
    return _item(item_id, title, STATE_ISSUE, missing)


def _layout_item(
    result: CheckResult | None,
    key: str,
    item_id: str,
    title: str,
    ok_detail: str,
) -> dict[str, str]:
    if result is None:
        return _item(item_id, title, STATE_WAIT, "Check did not run")
    obs = result.observations
    flag = obs.get(key, "unread")
    note = obs.get(f"{key}_note", "")
    if flag == "match":
        return _item(item_id, title, STATE_CLEAR, note or ok_detail)
    if flag == "mismatch":
        needle = "logo" if key == "logo" else "product image"
        hits = [item for item in result.findings if needle in item.summary.lower()]
        detail = hits[0].summary if hits else (note or "Place does not look the same.")
        return _item(item_id, title, STATE_JUDGE, detail)
    if not result.ran:
        return _item(item_id, title, STATE_WAIT, result.not_run_reason or EYE_DETAIL)
    return _item(item_id, title, STATE_WAIT, EYE_DETAIL)


def _mark_item(
    result: CheckResult | None,
    key: str,
    item_id: str,
    title: str,
    missing: str,
    seen: str,
) -> dict[str, str]:
    if result is None:
        return _item(item_id, title, STATE_WAIT, "Check did not run")
    flag = result.observations.get(key, "unread")
    if flag == "no":
        hits = [item for item in result.findings if missing.lower() in item.summary.lower()]
        return _item(item_id, title, STATE_ISSUE, hits[0].summary if hits else missing)
    if flag == "yes":
        note = result.observations.get(f"{key.replace('has_', '')}_note", "")
        return _item(item_id, title, STATE_CLEAR, note or seen)
    if not result.ran:
        return _item(item_id, title, STATE_WAIT, result.not_run_reason or EYE_DETAIL)
    return _item(item_id, title, STATE_WAIT, EYE_DETAIL)


def _approval_items(by_id: dict[str, CheckResult]) -> list[dict[str, str]]:
    sheet = by_id.get("approval_sheet")
    artwork = by_id.get("artwork_vs_approval")
    layout = by_id.get("visual_layout")
    marks = by_id.get("label_marks")
    obs = sheet.observations if sheet else {}
    colour = obs.get("colour_declaration", "none")
    return [
        _from_check(
            sheet,
            "colour_line",
            "Colour / plate line on the approval sheet",
            f"Colour line read: {colour}.",
        ),
        _mentioned(
            obs,
            "label_mm",
            "label_size",
            "Label size / numbers on the approval sheet",
            "Label size read: {value} mm.",
            "No label size (for example 57 x 95 mm) could be read.",
            sheet,
        ),
        _from_check(
            artwork,
            "wording",
            "Wording on client artwork vs first approval",
            "No wording difference was flagged between the two files.",
        ),
        _layout_item(
            layout,
            "alignment",
            "alignment",
            "Image alignment",
            "The main product photo sits in the same middle place on both labels.",
        ),
        _layout_item(
            layout,
            "logo",
            "logo",
            "Logo",
            "The logo sits in the same place on both labels.",
        ),
        _mark_item(
            marks,
            "has_batch",
            "batch",
            "Batch number",
            "No batch number written on label",
            "The word BATCH was read. The printed value was not verified.",
        ),
        _mark_item(
            marks,
            "has_mrp",
            "mrp",
            "MRP",
            "No MRP written on label",
            "The word MRP was read. The printed value was not verified.",
        ),
    ]


def _vendor_items(by_id: dict[str, CheckResult]) -> list[dict[str, str]]:
    plates = by_id.get("plate_count")
    colours = by_id.get("colour_names")
    geometry = by_id.get("geometry")
    headers = by_id.get("headers")
    wording = by_id.get("text_completeness")
    plate_look = by_id.get("plate_review")
    composite_look = by_id.get("composite_matter")
    obs = geometry.observations if geometry else {}
    plate_obs = plates.observations if plates else {}
    pages = plate_obs.get("separation_pages", "?")
    declared = plate_obs.get("declared_units") or obs.get("header_col", "?")
    colour_obs = colours.observations if colours else {}
    missing = colour_obs.get("missing_colours", "none")
    ups_detail = obs.get("ups_written", "")
    if obs.get("ups_source") == "punch_frames" and ups_detail:
        ups_detail = f"{ups_detail} green punch frames on the composite"
    elif obs.get("ups_across") and obs.get("ups_around"):
        ups_detail = (
            f"{ups_detail} (across {obs['ups_across']} × around {obs['ups_around']})"
            if ups_detail
            else f"across {obs['ups_across']} × around {obs['ups_around']}"
        )
    label_detail = obs.get("label_written", "")
    approval_mm = obs.get("approval_label_mm", "")
    if label_detail and approval_mm and obs.get("label_matches_approval") == "yes":
        label_item = _item(
            "label",
            "Label size vs first approval",
            STATE_CLEAR,
            f"Vendor {label_detail} matches first-approval {approval_mm}.",
        )
    elif label_detail and obs.get("label_matches_approval") == "no":
        label_item = _item(
            "label",
            "Label size vs first approval",
            STATE_ISSUE,
            f"Vendor {label_detail} does not match first-approval {approval_mm}.",
        )
    elif label_detail:
        label_item = _item(
            "label",
            "Label size vs first approval",
            STATE_CLEAR,
            f"Label size is written: {label_detail}. First-approval size was not read.",
        )
    else:
        label_item = _mentioned(
            obs,
            "label_written",
            "label",
            "Label size vs first approval",
            "Label size is written: {value}.",
            "Label size was not read on the vendor composite.",
            geometry,
        )
    colour_ok = (
        "Declared inks were found on the SEP set. "
        "Each plate row below is the matter check."
    )
    if missing and missing != "none":
        colour_item = _from_check(
            colours,
            "sep_colours",
            "Separation colours",
            colour_ok,
        )
    else:
        colour_item = _from_check(
            colours,
            "sep_colours",
            "Separation colours",
            colour_ok,
        )
    wording_items: list[dict[str, str]] = []
    if wording is not None and wording.ran:
        wording_items.append(
            _from_check(
                wording,
                "wording_on_plates",
                "Wording on plates vs first approval",
                "First-approval label words were found on the plate set.",
            )
        )
    return [
        _from_check(
            plates,
            "plates",
            "Separation plates",
            f"{pages} SEP pages for {declared} units.",
        ),
        _mentioned(
            obs,
            "cylinder_written",
            "cylinder",
            "Cylinder (CLY) in mm and teeth",
            "Cylinder: {value}.",
            "Cylinder (CLY) was not read on the vendor composite.",
            geometry,
        ),
        _mentioned(
            obs,
            "paper_written",
            "paper",
            "Paper size is written",
            "Paper size is written: {value}.",
            "Paper size was not read on the vendor composite.",
            geometry,
        ),
        _mentioned(
            {"ups_written": ups_detail} if ups_detail else obs,
            "ups_written",
            "ups",
            "How many ups",
            "Counted {value}.",
            "Ups were not read. Look for green punch lines around each label on the composite.",
            geometry,
        ),
        _composite_matter_item(composite_look, ups_detail),
        label_item,
        colour_item,
        *_plate_matter_items(plate_look),
        _from_check(
            headers,
            "header_col",
            "Col: on vendor headers",
            f"Col: {obs.get('header_col', 'read')} is consistent on the vendor files.",
        ),
        *wording_items,
    ]


def _composite_matter_item(
    result: CheckResult | None,
    ups_detail: str,
) -> dict[str, str]:
    title = "All ups vs artwork and first approval"
    if result is None or not result.ran:
        return _item(
            "ups_matter",
            title,
            STATE_WAIT,
            result.not_run_reason if result else "Composite matter was not read.",
        )
    obs = result.observations
    count = obs.get("counted_ups") or ups_detail or "?"
    note = obs.get("note", "")
    if note == "none":
        note = ""
    ok = (
        obs.get("all_ups_same") == "yes"
        and obs.get("matches_artwork") != "no"
        and obs.get("matches_approval") != "no"
    )
    if result.findings:
        certain = [item for item in result.findings if item.certainty is Certainty.DETERMINISTIC]
        advisory = [item for item in result.findings if item.certainty is Certainty.ADVISORY]
        hit = (certain or advisory)[0]
        return _item(
            "ups_matter",
            title,
            STATE_ISSUE if certain else STATE_JUDGE,
            hit.summary,
        )
    if ok:
        return _item(
            "ups_matter",
            title,
            STATE_CLEAR,
            note
            or (
                f"{count} ups: wording and images look the same on every label, "
                "and match the client artwork and the first-approval label."
            ),
        )
    return _item(
        "ups_matter",
        title,
        STATE_WAIT,
        note or "Gemini did not finish reading every up.",
    )


def _plate_matter_items(result: CheckResult | None) -> list[dict[str, str]]:
    if result is None or not result.ran:
        return [
            _item(
                "plate_matter",
                "Plate matter vs artwork",
                STATE_WAIT,
                result.not_run_reason if result else "Plate matter was not read.",
            )
        ]
    try:
        count = int(result.observations.get("plate_count") or "0")
    except ValueError:
        count = 0
    if count < 1:
        return [
            _item(
                "plate_matter",
                "Plate matter vs artwork",
                STATE_WAIT,
                "No separation pages to review.",
            )
        ]
    items: list[dict[str, str]] = []
    for page in range(1, count + 1):
        name = result.observations.get(f"plate_{page}_name", "unnamed")
        flag = result.observations.get(f"plate_{page}_same", "unread")
        note = result.observations.get(f"plate_{page}_note", "")
        title = f"Plate {page} {name}"
        summary = _plate_summary(result.observations, page, note)
        block = _plate_text_block(result.observations, page)
        if flag == "match":
            items.append(
                _item(
                    f"plate_{page}",
                    title,
                    STATE_CLEAR,
                    f"Everything on this plate matches the artwork. {summary}",
                    block,
                )
            )
        elif flag == "mismatch":
            items.append(
                _item(
                    f"plate_{page}",
                    title,
                    STATE_JUDGE,
                    f"Something on this plate does not match the artwork. {summary}",
                    block,
                )
            )
        else:
            items.append(
                _item(
                    f"plate_{page}",
                    title,
                    STATE_WAIT,
                    summary or result.observations.get("vision") or "This plate was not read.",
                    block,
                )
            )
    return items


NO_TEXT_PHRASES = ("no body copy", "no type", "no text", "none")
NO_WRITING_ON_PLATE = (
    "No writing on this plate. This ink only prints the photo / colour."
)


def _plate_has_writing(text_on: str) -> bool:
    """False when Gemini used the English sentinel for a photo-only ink."""
    cleaned = text_on.lower().strip(" .")
    return bool(cleaned) and cleaned not in NO_TEXT_PHRASES


def _plate_summary(observations: dict[str, str], page: int, note: str) -> str:
    """One plain line for the main screen. The matter itself goes in the block."""
    text_on = observations.get(f"plate_{page}_text", "").strip()
    images = observations.get(f"plate_{page}_images", "").strip()
    if _plate_has_writing(text_on):
        line = "This plate prints text. Open See details to read all of it."
    elif images:
        line = f"No text on this plate. It prints only: {images}"
    else:
        line = "No text on this plate."
    if note:
        line = f"{line} {note}"
    return line


def _plate_text_block(observations: dict[str, str], page: int) -> str:
    """Every word the plate carries, for the scroll box in the detail view."""
    parts: list[str] = []
    text_on = observations.get(f"plate_{page}_text", "").strip()
    text_not = observations.get(f"plate_{page}_text_not", "").strip()
    images = observations.get(f"plate_{page}_images", "").strip()
    if _plate_has_writing(text_on):
        parts.append(f"Text printed on this plate:\n{text_on}")
    elif text_on or images:
        parts.append(NO_WRITING_ON_PLATE)
    if text_not:
        parts.append(f"Printed on other plates, not this one:\n{text_not}")
    if images:
        parts.append(f"Pictures on this plate:\n{images}")
    return "\n\n".join(parts)


def _print_items(by_id: dict[str, CheckResult]) -> list[dict[str, str]]:
    printout = by_id.get("printout")
    present = (
        printout is not None
        and bool((printout.observations or {}).get("printout_files"))
    )
    if present:
        files = printout.observations.get("printout_files", "")
        uploaded = _item(
            "photo",
            "Print photo uploaded",
            STATE_CLEAR,
            f"Stored: {files}.",
        )
    else:
        uploaded = _from_check(
            printout,
            "photo",
            "Print photo uploaded",
            "Print photo is stored.",
        )
    return [
        uploaded,
        _item(
            "print_text",
            "Text on the print",
            STATE_EYE,
            "Automatic match is not run. Compare the photo to the approval by eye.",
        ),
        _item(
            "print_align",
            "Alignment on the print",
            STATE_EYE,
            "Automatic match is not run. Compare the photo to the approval by eye.",
        ),
        _item(
            "print_logo",
            "Logo on the print",
            STATE_EYE,
            "Automatic match is not run. Compare the photo to the approval by eye.",
        ),
    ]


_BUILDERS = {
    "approval": (_approval_items, APPROVAL_NOT_CHECKED),
    "vendor": (_vendor_items, VENDOR_NOT_CHECKED),
    "print": (_print_items, PRINT_NOT_CHECKED),
}


def _stage_state(items: list[dict[str, str]]) -> str:
    states = [item["state"] for item in items]
    if STATE_ISSUE in states:
        return STATE_ISSUE
    if STATE_JUDGE in states:
        return STATE_JUDGE
    if STATE_WAIT in states or STATE_EYE in states:
        return STATE_WAIT
    return STATE_CLEAR


def build_review(
    results: list[CheckResult],
    stages_checked: list[str],
) -> dict[str, object]:
    """Point-wise review per step. Ticks are not a sign-off."""
    by_id = {result.check_id: result for result in results}
    checked = set(stages_checked)
    stages: list[dict[str, object]] = []
    for stage_id in STAGE_ORDER:
        builder, not_checked = _BUILDERS[stage_id]
        if stage_id not in checked:
            stages.append(
                {
                    "stage_id": stage_id,
                    "title": STAGE_TITLES[stage_id],
                    "checked": False,
                    "state": STATE_WAIT,
                    "items": [],
                    "not_checked": list(not_checked),
                }
            )
            continue
        items = builder(by_id)
        stages.append(
            {
                "stage_id": stage_id,
                "title": STAGE_TITLES[stage_id],
                "checked": True,
                "state": _stage_state(items),
                "items": items,
                "not_checked": list(not_checked),
            }
        )
    payload = {
        "stages": stages,
        "stages_checked": list(stages_checked),
    }
    blob = str(payload).upper()
    for word in FORBIDDEN_VERDICT_WORDS:
        if word in blob:
            raise RuntimeError(f"Review produced a forbidden verdict word: {word}")
    return payload
