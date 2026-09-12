# Kalonji — pehla test job

Job `CGM2026-27-1326`, DAILY KALONJI 100ML LABEL.

Job sheet kehta hai **6 COL + VARNISH** (7 units). Plate file mein **6 pages**.
Varnish plate nahi hai.

Isse pakadna chahiye. Jo change yeh miss kare, woh galat hai.

## Is folder mein

| File | Kya hai |
|---|---|
| `job.json` | Job sheet, type karke (git mein hai) |
| `job-sheet.pdf` | Asli sheet — tum daalo, git nahi lega |
| `separations.pdf` | 6 pages — tum daalo |
| `composite.pdf` | Vendor proof — tum daalo |

## Chalana

`tools/artwork-verification/engine` se:

```bash
.venv/bin/python -m printsahaj_verify ../samples/kalonji
```

PDFs customer ki files hain. Public repo mein nahi jaati.
