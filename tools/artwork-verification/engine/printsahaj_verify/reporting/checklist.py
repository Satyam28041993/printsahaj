"""Short checklist for the desk. Not a long findings dump.

Never writes PASS, APPROVED, FAIL, or COMPLIANT.
"""

from __future__ import annotations

from printsahaj_verify.models import Certainty, CheckResult
from printsahaj_verify.reporting.terminal import FORBIDDEN_VERDICT_WORDS
from printsahaj_verify.stages import STAGE_CHECKS, STAGE_ORDER, STAGE_TITLES

STATE_CLEAR = "clear"
STATE_ISSUE = "issue"
STATE_JUDGE = "judge"
STATE_WAIT = "wait"

OVERALL_LABELS: dict[str, str] = {
    STATE_CLEAR: "No issues found",
    STATE_ISSUE: "Issue found",
    STATE_JUDGE: "Needs a look",
    STATE_WAIT: "Not finished yet",
}


def _state_for(result: CheckResult) -> str:
    if not result.ran:
        return STATE_WAIT
    certain = [item for item in result.findings if item.certainty is Certainty.DETERMINISTIC]
    if certain:
        return STATE_ISSUE
    if result.findings:
        return STATE_JUDGE
    return STATE_CLEAR


def _detail(result: CheckResult) -> str:
    if not result.ran:
        return result.not_run_reason or "Check did not run"
    certain = [item for item in result.findings if item.certainty is Certainty.DETERMINISTIC]
    advisory = [item for item in result.findings if item.certainty is Certainty.ADVISORY]
    if certain:
        item = certain[0]
        extra = f" (+{len(certain) - 1})" if len(certain) > 1 else ""
        return f"{item.summary}{extra}"
    if advisory:
        item = advisory[0]
        extra = f" (+{len(advisory) - 1})" if len(advisory) > 1 else ""
        return f"{item.summary}{extra}"
    return "Nothing flagged on this check"


def build_checklist(
    results: list[CheckResult],
    stages_checked: list[str],
) -> dict[str, object]:
    """Group checks into the three steps. One short row per check."""
    by_id = {result.check_id: result for result in results}
    stages: list[dict[str, object]] = []
    overall = STATE_CLEAR
    checked = set(stages_checked)

    for stage_id in STAGE_ORDER:
        items: list[dict[str, str]] = []
        if stage_id not in checked:
            overall = STATE_WAIT if overall == STATE_CLEAR else overall
            stages.append(
                {
                    "stage_id": stage_id,
                    "title": STAGE_TITLES[stage_id],
                    "checked": False,
                    "state": STATE_WAIT,
                    "items": items,
                }
            )
            continue
        stage_state = STATE_CLEAR
        for check_id in STAGE_CHECKS[stage_id]:
            result = by_id.get(check_id)
            if result is None:
                continue
            state = _state_for(result)
            if state == STATE_ISSUE:
                stage_state = STATE_ISSUE
            elif state == STATE_JUDGE and stage_state == STATE_CLEAR:
                stage_state = STATE_JUDGE
            elif state == STATE_WAIT and stage_state == STATE_CLEAR:
                stage_state = STATE_WAIT
            items.append(
                {
                    "check_id": check_id,
                    "title": result.title,
                    "state": state,
                    "detail": _detail(result),
                }
            )
        if stage_state == STATE_ISSUE:
            overall = STATE_ISSUE
        elif stage_state == STATE_JUDGE and overall == STATE_CLEAR:
            overall = STATE_JUDGE
        stages.append(
            {
                "stage_id": stage_id,
                "title": STAGE_TITLES[stage_id],
                "checked": True,
                "state": stage_state,
                "items": items,
            }
        )

    payload = {
        "overall": overall,
        "overall_label": OVERALL_LABELS[overall],
        "stages": stages,
        "stages_checked": list(stages_checked),
    }
    blob = str(payload).upper()
    for word in FORBIDDEN_VERDICT_WORDS:
        if word in blob:
            raise RuntimeError(f"Checklist produced a forbidden verdict word: {word}")
    return payload
