"""On-disk jobs for the desk app. Each job is a folder. No cloud."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from printsahaj_verify.files import (
    PRINTOUT_DIR_NAME,
    ROLE_STEMS,
    UPLOAD_SUFFIXES,
    find_role_file,
    role_candidate_names,
)
from printsahaj_verify.job_spec import JobSpecError, job_spec_to_dict, load_job_spec
from printsahaj_verify.remarks import load_remarks
from printsahaj_verify.run import JOB_FILE_NAME

SAFE_CODE = re.compile(r"[A-Za-z0-9._-]+")

DEFAULT_JOBS_ROOT = Path(__file__).resolve().parents[2] / "jobs"


def jobs_root(root: Path | None = None) -> Path:
    base = root or DEFAULT_JOBS_ROOT
    base.mkdir(parents=True, exist_ok=True)
    return base


def _safe_code(job_id: str) -> str:
    code = job_id.strip()
    if not code or not SAFE_CODE.fullmatch(code):
        raise JobSpecError(
            "Job code may only contain letters, numbers, dot, dash and underscore"
        )
    return code


def job_folder(job_id: str, root: Path | None = None) -> Path:
    return jobs_root(root) / _safe_code(job_id)


def list_jobs(root: Path | None = None) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for folder in sorted(jobs_root(root).iterdir()):
        if not folder.is_dir() or not (folder / JOB_FILE_NAME).is_file():
            continue
        spec = load_job_spec(folder / JOB_FILE_NAME)
        files = {role: find_role_file(folder, role) is not None for role in ROLE_STEMS}
        printouts = folder / PRINTOUT_DIR_NAME
        files["printout"] = printouts.is_dir() and any(printouts.iterdir())
        items.append(
            {
                "job_id": spec.job_id,
                "file_name": spec.file_name,
                "customer": spec.customer,
                "files": files,
            }
        )
    return items


def create_or_update_job(payload: dict[str, Any], root: Path | None = None) -> Path:
    """Write job.json. Existing files stay. Raises JobSpecError on bad input."""
    if "job_id" not in payload:
        raise JobSpecError("job_id is required")
    folder = job_folder(str(payload["job_id"]), root)
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / JOB_FILE_NAME
    if path.is_file():
        current = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(current, dict):
            raise JobSpecError("Existing job.json is not an object")
        current.update(payload)
        payload = current
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    # Validate after write so a bad payload cannot linger unread.
    spec = load_job_spec(path)
    path.write_text(
        json.dumps(job_spec_to_dict(spec), indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return folder


def _clear_role_files(folder: Path, role: str) -> None:
    for name in role_candidate_names(role):
        path = folder / name
        if path.is_file():
            path.unlink()


def save_upload(
    job_id: str, role: str, data: bytes, filename: str, root: Path | None = None
) -> Path:
    """Store one uploaded PDF or image under the job folder."""
    folder = job_folder(job_id, root)
    if not (folder / JOB_FILE_NAME).is_file():
        raise JobSpecError(f"Unknown job: {job_id}")
    if not data:
        raise JobSpecError("Uploaded file is empty")
    suffix = Path(filename).suffix.lower()
    if suffix not in UPLOAD_SUFFIXES:
        raise JobSpecError(
            "PDF, PNG, JPG ya WebP chahiye. "
            f"Yeh file nahi chali: {suffix or 'no extension'}"
        )
    if role == "printout":
        target_dir = folder / PRINTOUT_DIR_NAME
        target_dir.mkdir(exist_ok=True)
        stamp = len(list(target_dir.iterdir())) + 1
        target = target_dir / f"printout_{stamp}{suffix}"
        target.write_bytes(data)
        return target
    if role not in ROLE_STEMS:
        raise JobSpecError(f"Unknown file role: {role}")
    _clear_role_files(folder, role)
    target = folder / f"{role}{suffix}"
    target.write_bytes(data)
    return target


def resolve_slot_file(job_id: str, role: str, root: Path | None = None) -> Path:
    """Return the on-disk file for one upload slot. Missing files raise."""
    from printsahaj_verify.files import discover_job_files

    files = discover_job_files(job_folder(job_id, root))
    if role == "printout":
        if not files.printouts:
            raise FileNotFoundError("No printout uploaded")
        return files.printouts[-1]
    mapping = {
        "client_artwork": files.client_artwork,
        "approval": files.approval,
        "vendor_composite": files.vendor_composite,
        "separations": files.separations,
    }
    if role not in mapping:
        raise JobSpecError(f"Unknown file role: {role}")
    path = mapping[role]
    if path is None:
        raise FileNotFoundError(f"No file uploaded for {role}")
    return path


def job_snapshot(job_id: str, root: Path | None = None) -> dict[str, Any]:
    folder = job_folder(job_id, root)
    spec = load_job_spec(folder / JOB_FILE_NAME)
    from printsahaj_verify.files import discover_job_files
    from printsahaj_verify.reporting.json_report import files_to_dict, slots_to_dict

    files = discover_job_files(folder)
    return {
        "job": job_spec_to_dict(spec),
        "files": files_to_dict(files),
        "slots": slots_to_dict(files),
        "remarks": load_remarks(folder),
        "folder": str(folder),
    }
