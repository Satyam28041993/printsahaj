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
    "Logo and image alignment (automatic)",
    "MRP and batch values (only whether the words were read)",
    "Trap, overprint and aesthetics",
)

VENDOR_NOT_CHECKED = (
    "Colour shade on each plate",
    "Whether the written ups layout is the intended one",
    "Trap and overprint intent",
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
) -> dict[str, str]:
    return {
        "id": item_id,
        "title": title,
        "state": state,
        "detail": detail,
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


def _approval_items(by_id: dict[str, CheckResult]) -> list[dict[str, str]]:
    identity = by_id.get("job_identity")
    sheet = by_id.get("approval_sheet")
    artwork = by_id.get("artwork_vs_approval")
    obs = sheet.observations if sheet else {}
    colour = obs.get("colour_declaration", "none")
    label = obs.get("label_mm", "none")
    items = [
        _from_check(
            identity,
            "same_job",
            "Same job on the uploaded files",
            "No other job code or product mismatch was flagged.",
        ),
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
            "No wording difference was flagged between the two PDFs.",
        ),
        _item("alignment", "Image alignment", STATE_EYE, EYE_DETAIL),
        _item("logo", "Logo", STATE_EYE, EYE_DETAIL),
    ]
    if sheet and sheet.ran and obs.get("has_batch") == "yes":
        items.append(
            _item(
                "batch",
                "Batch number",
                STATE_WAIT,
                "The word BATCH was read on the approval sheet. "
                "The printed value was not verified.",
            )
        )
    else:
        items.append(
            _item(
                "batch",
                "Batch number",
                STATE_EYE,
                "Batch number was not verified. Compare the two previews by eye.",
            )
        )
    if sheet and sheet.ran and obs.get("has_mrp") == "yes":
        items.append(
            _item(
                "mrp",
                "MRP",
                STATE_WAIT,
                "The word MRP was read on the approval sheet. "
                "The printed value was not verified.",
            )
        )
    else:
        items.append(
            _item(
                "mrp",
                "MRP",
                STATE_EYE,
                "MRP was not verified. Compare the two previews by eye.",
            )
        )
    return items


def _vendor_items(by_id: dict[str, CheckResult]) -> list[dict[str, str]]:
    identity = by_id.get("job_identity")
    plates = by_id.get("plate_count")
    colours = by_id.get("colour_names")
    geometry = by_id.get("geometry")
    headers = by_id.get("headers")
    wording = by_id.get("text_completeness")
    obs = geometry.observations if geometry else {}
    plate_obs = plates.observations if plates else {}
    pages = plate_obs.get("separation_pages", "?")
    declared = plate_obs.get("declared_units") or obs.get("header_col", "?")
    colour_obs = colours.observations if colours else {}
    matched = colour_obs.get("matched_colours", "none")
    ups_detail = obs.get("ups_written", "")
    if obs.get("ups_across") and obs.get("ups_around"):
        ups_detail = (
            f"{ups_detail} (across {obs['ups_across']} × around {obs['ups_around']})"
            if ups_detail
            else f"across {obs['ups_across']} × around {obs['ups_around']}"
        )
    return [
        _from_check(
            identity,
            "same_job",
            "Same job on vendor files",
            "Vendor files match this job code.",
        ),
        _from_check(
            plates,
            "plates",
            "Separation plates",
            f"Plate count matches: {pages} SEP pages for {declared} units.",
        ),
        _mentioned(
            obs,
            "cylinder_written",
            "cylinder",
            "Cylinder (CLY) is written",
            "Cylinder is written: {value}.",
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
            "Ups are written",
            "Ups are written: {value}.",
            "Ups were not read on the vendor composite.",
            geometry,
        ),
        _mentioned(
            obs,
            "label_written",
            "label",
            "Label size is written",
            "Label size is written: {value}.",
            "Label size was not read on the vendor composite.",
            geometry,
        ),
        _from_check(
            colours,
            "sep_colours",
            "Separation colours",
            f"Declared colours were found on the SEP set ({matched}).",
        ),
        _from_check(
            headers,
            "header_col",
            "Col: on vendor headers",
            f"Col: {obs.get('header_col', 'read')} is consistent on the vendor files.",
        ),
        _from_check(
            wording,
            "wording_on_plates",
            "Wording on plates vs approval",
            "No missing approval wording was flagged on the plates.",
        ),
    ]


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
