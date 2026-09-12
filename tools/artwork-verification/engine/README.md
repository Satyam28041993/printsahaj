# Engine

Hisab-kitab yahin hai. Screen Flutter `app/` mein hai.

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m printsahaj_verify --serve
.venv/bin/python -m printsahaj_verify ../samples/kalonji
```

Purana probe (file ke andar kya hai, check nahi):

```bash
.venv/bin/python probe.py ../samples/kalonji
```

Tests:

```bash
.venv/bin/python -m unittest discover -s tests
```
