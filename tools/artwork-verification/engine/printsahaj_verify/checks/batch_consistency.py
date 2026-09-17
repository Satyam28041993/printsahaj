"""Batch number and manufacturing date: one value, everywhere it is printed.

Two separate Gemini calls look at this field — one at the composite's ups,
one at the plate that carries the fine print. Each can sound reasonable on
its own and still contradict the other, because each is giving an opinion
("does this match?") rather than reporting the value. This check is the one
place that settles it: it compares the values themselves, so the answer is
arithmetic, not opinion, and a mismatch is a certain finding rather than an
advisory one.
"""

from __future__ import annotations

from printsahaj_verify.models import Certainty, CheckResult, Finding
from printsahaj_verify.vision import CompositeVisionNotes, PlateVisionNote, VisionNotes

CHECK_ID = "batch_consistency"
CHECK_TITLE = "Batch number and manufacturing date"

NOT_READ = (
    "No batch number or date was read from the plates or the composite, so "
    "there was nothing to compare with the artwork."
)

#: What each source is called in a sentence a press operator would read.
SOURCE_LABELS = {
    "plate": "separation plate",
    "composite": "vendor composite",
}
FIELD_LABELS = {
    "batch": "Batch number",
    "date": "Manufacturing date",
}


def _clean(value: str) -> str:
    """Trim and upper-case so spacing or case alone is not a mismatch."""
    return " ".join(value.split()).upper()


def _first_value(values: tuple[str, ...]) -> str:
    """The first non-blank value. Blank means the field is not on that ink."""
    for value in values:
        cleaned = _clean(value)
        if cleaned:
            return cleaned
    return ""


def check_batch_consistency(
    reference: VisionNotes | None,
    plate_notes: tuple[PlateVisionNote, ...] | None = None,
    composite_notes: CompositeVisionNotes | None = None,
) -> CheckResult:
    """Compare the batch number and date read from each file against the artwork."""
    if reference is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=(
                "The client artwork and first-approval sheet were not read, "
                "so there is no value to compare against."
            ),
        )

    found: dict[tuple[str, str], str] = {}
    reference_values = {
        "batch": _clean(reference.batch_text),
        "date": _clean(reference.mfg_date_text),
    }
    plate_values = {
        "batch": _first_value(tuple(note.batch_text for note in plate_notes or ())),
        "date": _first_value(tuple(note.mfg_date_text for note in plate_notes or ())),
    }
    composite_values = {
        "batch": _clean(composite_notes.batch_text) if composite_notes else "",
        "date": _clean(composite_notes.mfg_date_text) if composite_notes else "",
    }
    for field in ("batch", "date"):
        found[(field, "plate")] = plate_values[field]
        found[(field, "composite")] = composite_values[field]

    observations: dict[str, str] = {}
    findings: list[Finding] = []

    for field in ("batch", "date"):
        expected = reference_values[field]
        if expected:
            observations[f"{field}_artwork"] = expected
        for source in ("plate", "composite"):
            actual = found[(field, source)]
            if not actual:
                continue
            observations[f"{field}_{source}"] = actual
            if not expected:
                # Printed on the production file but blank on the artwork. That
                # is the coding window working as intended, not a mismatch.
                continue
            if actual == expected:
                continue
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"{FIELD_LABELS[field]} does not match. The client "
                        f"artwork / first approval reads {expected}, but the "
                        f"{SOURCE_LABELS[source]} prints {actual}."
                    ),
                    certainty=Certainty.DETERMINISTIC,
                    expected=expected,
                    found=actual,
                    location=(
                        f"{SOURCE_LABELS[source].capitalize()} vs client "
                        "artwork / first approval"
                    ),
                )
            )

    if not observations:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=NOT_READ,
        )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations=observations,
    )
