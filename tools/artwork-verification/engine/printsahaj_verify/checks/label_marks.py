"""Look for batch number and MRP on the label.

PDF text is searched first. A PNG has no text layer. When Gemini notes
are present they answer whether the words sit on the label artwork.
Missing marks use the operator wording.
"""

from __future__ import annotations

from printsahaj_verify.extract import DocumentText
from printsahaj_verify.models import Certainty, CheckResult, Finding
from printsahaj_verify.vision import VisionNotes

CHECK_ID = "label_marks"
CHECK_TITLE = "Batch and MRP"

NO_BATCH = "No batch number written on label"
NO_MRP = "No MRP written on label"
IMAGE_UNREAD = (
    "The uploaded file is an image, so batch and MRP were not read from pixels. "
    "Set PRINTSAHAJ_GEMINI_API_KEY to read the label, or open both previews "
    "side by side."
)


def _has_batch(text: str) -> bool:
    upper = text.upper()
    return "BATCH" in upper or "B.NO" in upper or "B/NO" in upper


def _has_mrp(text: str) -> bool:
    return "MRP" in text.upper()


def check_label_marks(
    client_doc: DocumentText | None,
    approval_doc: DocumentText | None,
    client_is_image: bool,
    approval_is_image: bool,
    notes: VisionNotes | None = None,
) -> CheckResult:
    """Search PDF text, then Gemini notes, for BATCH and MRP on the label."""
    readable = ""
    sources: list[str] = []
    if client_doc is not None:
        readable += client_doc.full_text + "\n"
        sources.append(client_doc.path.name)
    if approval_doc is not None:
        readable += approval_doc.full_text + "\n"
        sources.append(approval_doc.path.name)

    unread: list[str] = []
    if client_is_image:
        unread.append("client artwork image")
    if approval_is_image:
        unread.append("first approval image")

    pdf_batch = _has_batch(readable)
    pdf_mrp = _has_mrp(readable)

    if notes is not None:
        return _from_notes(notes, pdf_batch, pdf_mrp, sources, unread)

    if not readable.strip() and unread:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=IMAGE_UNREAD,
            observations={
                "has_batch": "unread",
                "has_mrp": "unread",
                "unread": ", ".join(unread),
            },
        )
    if not readable.strip():
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="No PDF text to search for batch number or MRP",
            observations={"has_batch": "unread", "has_mrp": "unread"},
        )

    # An image has no text layer. Missing PDF tokens are not proof the
    # printed label omitted batch/MRP — those words may sit only in pixels.
    if unread:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason=IMAGE_UNREAD,
            observations={
                "has_batch": "yes" if pdf_batch else "unread",
                "has_mrp": "yes" if pdf_mrp else "unread",
                "sources": ", ".join(sources) if sources else "none",
                "unread": ", ".join(unread),
            },
        )

    findings: list[Finding] = []
    extra = f" Searched: {', '.join(sources)}."
    if not pdf_batch:
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=NO_BATCH + extra,
                certainty=Certainty.DETERMINISTIC,
                expected="BATCH written on the label",
                found="BATCH not in readable text",
                location="First approval / client artwork text",
            )
        )
    if not pdf_mrp:
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=NO_MRP + extra,
                certainty=Certainty.DETERMINISTIC,
                expected="MRP written on the label",
                found="MRP not in readable text",
                location="First approval / client artwork text",
            )
        )
    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations={
            "has_batch": "yes" if pdf_batch else "no",
            "has_mrp": "yes" if pdf_mrp else "no",
            "sources": ", ".join(sources) if sources else "none",
            "unread": ", ".join(unread) if unread else "none",
        },
    )


def _from_notes(
    notes: VisionNotes,
    pdf_batch: bool,
    pdf_mrp: bool,
    sources: list[str],
    unread: list[str],
) -> CheckResult:
    """Gemini answers for the label artwork. PDF hits are extra context."""
    findings: list[Finding] = []
    batch_on = notes.batch_on_label
    mrp_on = notes.mrp_on_label
    if batch_on is False:
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=NO_BATCH
                + (f" {notes.batch_note}" if notes.batch_note else ""),
                certainty=Certainty.DETERMINISTIC,
                expected="Batch number written on the label",
                found=notes.batch_note or "not on the label artwork",
                location="Label artwork (Gemini)",
            )
        )
    if mrp_on is False:
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=NO_MRP + (f" {notes.mrp_note}" if notes.mrp_note else ""),
                certainty=Certainty.DETERMINISTIC,
                expected="MRP written on the label",
                found=notes.mrp_note or "not on the label artwork",
                location="Label artwork (Gemini)",
            )
        )
    batch_flag = "yes" if batch_on is True else "no" if batch_on is False else (
        "yes" if pdf_batch else "unread"
    )
    mrp_flag = "yes" if mrp_on is True else "no" if mrp_on is False else (
        "yes" if pdf_mrp else "unread"
    )
    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations={
            "has_batch": batch_flag,
            "has_mrp": mrp_flag,
            "batch_note": notes.batch_note or "none",
            "mrp_note": notes.mrp_note or "none",
            "pdf_batch": "yes" if pdf_batch else "no",
            "pdf_mrp": "yes" if pdf_mrp else "no",
            "sources": ", ".join(sources) if sources else "none",
            "unread": ", ".join(unread) if unread else "none",
            "source": notes.source,
        },
    )
