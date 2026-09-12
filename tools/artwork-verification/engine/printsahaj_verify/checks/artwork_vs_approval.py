"""Client artwork versus the first-approval PDF they were sent."""

from __future__ import annotations

from printsahaj_verify.extract import DocumentText
from printsahaj_verify.models import Certainty, CheckResult, Finding

CHECK_ID = "artwork_vs_approval"
CHECK_TITLE = "Client artwork vs first approval"


def check_artwork_vs_approval(
    client: DocumentText | None,
    approval: DocumentText | None,
) -> CheckResult:
    """Text that changed between what the client sent and what was approved."""
    if client is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="Client artwork PDF not found",
        )
    if approval is None:
        return CheckResult(
            check_id=CHECK_ID,
            title=CHECK_TITLE,
            not_run_reason="First approval PDF not found",
        )

    client_tokens = set(client.all_tokens)
    approval_tokens = set(approval.all_tokens)
    only_client = sorted(client_tokens - approval_tokens)
    only_approval = sorted(approval_tokens - client_tokens)

    findings: list[Finding] = []
    if only_client:
        sample = ", ".join(only_client[:15])
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=(
                    f"{len(only_client)} text token(s) are on the client artwork "
                    f"but not on the first approval PDF. Examples: {sample}."
                ),
                certainty=Certainty.ADVISORY,
                expected="same wording on both files",
                found=f"{len(only_client)} token(s) only on client artwork",
                location="Client artwork vs first approval PDF",
            )
        )
    if only_approval:
        sample = ", ".join(only_approval[:15])
        findings.append(
            Finding(
                check_id=CHECK_ID,
                summary=(
                    f"{len(only_approval)} text token(s) are on the first approval "
                    f"PDF but not on the client artwork. Examples: {sample}."
                ),
                certainty=Certainty.ADVISORY,
                expected="same wording on both files",
                found=f"{len(only_approval)} token(s) only on approval PDF",
                location="First approval PDF vs client artwork",
            )
        )

    return CheckResult(
        check_id=CHECK_ID,
        title=CHECK_TITLE,
        findings=findings,
        observations={
            "client_tokens": str(len(client_tokens)),
            "approval_tokens": str(len(approval_tokens)),
        },
    )
