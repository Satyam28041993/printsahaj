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
