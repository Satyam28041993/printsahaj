# Engine

The checks live here. The screen is the Flutter `app/` or `static/desk.html`.

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m printsahaj_verify --serve
.venv/bin/python -m printsahaj_verify ../samples/kalonji
```

Older probe (what is in the file, no check):

```bash
.venv/bin/python probe.py ../samples/kalonji
```

Tests:

```bash
.venv/bin/python -m unittest discover -s tests
```

## Cloud Run deployment

The same server runs on Cloud Run behind a login. Four environment variables
decide how it behaves; none of them are set for a local run, which is why the
desktop tool still opens with no sign-in.

| Variable | Set it to | What it does |
| --- | --- | --- |
| `PRINTSAHAJ_REQUIRE_AUTH` | `1` | Every `/api/` call except `/api/health` needs a Firebase ID token. |
| `PRINTSAHAJ_ALLOWED_EMAILS` | `a@x.com,b@x.com` | Addresses cleared to use the desk. **Empty refuses everyone** — a valid token alone only proves the caller has some account in the Firebase project. |
| `PRINTSAHAJ_JOBS_ROOT` | `/mnt/jobs` | Where jobs are written. On Cloud Run this is the mounted `printsahaj-artwork-jobs` bucket. |
| `PORT` | set by Cloud Run | Port to listen on. Defaults to 8765. |

The deploy workflow sets the first two, reading the address list from the
`DESK_ALLOWED_EMAILS` repository secret. The rest live on the service.

The image copies `rule_packs/` alongside the package — the compliance packs are
loaded at runtime and every check raises without them.
