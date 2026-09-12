"""Are these files even the same job? Mixed jobs make every other check noise."""

from __future__ import annotations

from pathlib import Path

from printsahaj_verify.extract import DocumentText
from printsahaj_verify.files import is_named_role_file
from printsahaj_verify.job_codes import job_codes_in_text
from printsahaj_verify.job_spec import JobSpec
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "job_identity"
CHECK_TITLE = "Same job?"

NOISE_WORDS: frozenset[str] = frozenset(
    {
        "LABEL",
        "SIZE",
        "FILE",
        "NAME",
        "CUSTOMER",
        "MATERIAL",
        "PRINT",
        "TYPE",
        "FLEXO",
        "COLOURS",
        "COLORS",
        "COLOUR",
        "COLOR",
        "PLATE",
        "PAPER",
        "YELLOW",
        "MAGENTA",
        "CYAN",
        "BLACK",
        "WHITE",
        "GOLD",
        "VARNISH",
        "LAMINATION",
        "GRAPHICS",
        "MUMBAI",
        "BUILDING",
        "ESTATE",
        "INDUSTRIAL",
        "TABLETS",
        "BATCH",
    }
)


def _tokens(text: str) -> set[str]:
    words = set()
    for raw in text.upper().replace("_", " ").replace("-", " ").split():
        token = "".join(char for char in raw if char.isalnum())
        if len(token) >= 4 and token not in NOISE_WORDS and not token.isdigit():
            words.add(token)
    return words


def check_job_identity(
    job: JobSpec,
    paths: list[Path],
    documents: list[DocumentText],
) -> CheckResult:
    """Flag when a file belongs to another CGM job or another product."""
    findings: list[Finding] = []
    codes: dict[str, str] = {}
    for path in paths:
        for code in job_codes_in_text(path.name):
            codes.setdefault(code, path.name)
    for document in documents:
        for code in job_codes_in_text(document.full_text):
            codes.setdefault(code, document.path.name)

    job_code = job.job_id.strip().upper()
    foreign = {code: name for code, name in codes.items() if code != job_code}
    if foreign:
        shown = ", ".join(f"{code} ({name})" for code, name in sorted(foreign.items()))
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=f"A file belongs to another job: {shown}. This job is {job.job_id}.",
                certainty=Certainty.DETERMINISTIC,
                expected=job.job_id,
                found=shown,
                location="Filename / vendor header",
            )
        )

    job_tokens = _tokens(f"{job.file_name} {job.customer} {job.job_id}")
    file_tokens: set[str] = set()
    for document in documents:
        file_tokens |= _tokens(document.full_text)
    for path in paths:
        if is_named_role_file(path):
            continue
        file_tokens |= _tokens(path.stem)

    if job_tokens and file_tokens and not (job_tokens & file_tokens):
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=(
                    "Product names on the files and the job sheet do not match. "
                    "A file from another job may have been uploaded."
                ),
                certainty=Certainty.DETERMINISTIC,
                expected=" / ".join(sorted(job_tokens)[:6]),
                found=" / ".join(sorted(file_tokens)[:8]),
                location="Job sheet vs uploaded file names / text",
            )
        )

    docs_with_text = [document for document in documents if document.full_text.strip()]
    if len(docs_with_text) >= 2:
        first = _tokens(docs_with_text[0].full_text)
        second = _tokens(docs_with_text[1].full_text)
        if first and second and not (first & second):
            findings.append(
                Finding(
                    check_id=CHECK_ID,
                    summary=(
                        f"{docs_with_text[0].path.name} and "
                        f"{docs_with_text[1].path.name} look like different products."
                    ),
                    certainty=Certainty.DETERMINISTIC,
                    expected="same product on both files",
                    found="no shared product words",
                    location="Approval vs vendor text",
                )
            )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations={
            "codes": ", ".join(sorted(codes)) if codes else "none",
            "job_code": job.job_id,
        },
    )
