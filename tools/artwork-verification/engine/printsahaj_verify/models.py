"""Structured result types.

Checks return these. They never print. A reporter turns them into text, so the
same result can later be rendered as a terminal report, a PDF, or an API
response without touching check logic.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class Certainty(Enum):
    """How sure the machine is about a finding.

    The distinction is a product rule, not a detail: a plate count mismatch is
    arithmetic and cannot be wrong, while "the same text sits on two plates"
    might be a deliberate overprint. These must never be presented alike.
    """

    #: Arithmetic or structural. The machine is certain.
    DETERMINISTIC = "deterministic"
    #: The machine noticed something a human should judge.
    ADVISORY = "advisory"


@dataclass(frozen=True)
class Finding:
    """One thing worth a human's attention.

    A finding is never a verdict. It states what was compared, what was found,
    and where to look — the person signing off decides what it means.
    """

    #: Stable identifier for the check that produced this, e.g. "plate_count".
    check_id: str
    #: One line, in the language a pre-press operator would use.
    summary: str
    certainty: Certainty
    #: What the job spec led us to expect.
    expected: str | None = None
    #: What the files actually contained.
    found: str | None = None
    #: Where in the job to go and look.
    location: str | None = None


@dataclass(frozen=True)
class CheckResult:
    """The outcome of running one check over one job.

    There is deliberately no pass/fail flag. A check reports what it compared
    and what it found; an empty `findings` list means nothing was flagged, which
    is not the same thing as approval.
    """

    check_id: str
    #: Human-readable name of what this check compared.
    title: str
    findings: list[Finding] = field(default_factory=list)
    #: Values the check established along the way, shown as context in reports.
    observations: dict[str, str] = field(default_factory=dict)
    #: Set when the check could not run — a missing file, an unreadable header.
    #: Never silently skipped: an unrun check is stated as unrun.
    not_run_reason: str | None = None

    @property
    def ran(self) -> bool:
        """True when the check completed, whether or not it flagged anything."""
        return self.not_run_reason is None
