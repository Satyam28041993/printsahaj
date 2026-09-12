# Artwork Verification app

This is not the PrintSahaj website. This is the tool screen.

- Computer / browser — Flutter web
- Phone — Android APK from this folder

The checks live in `../engine/`. The app talks to that engine.

## Run

Start the engine first:

```bash
cd ../engine
.venv/bin/python -m printsahaj_verify --serve
```

Then the app:

```bash
flutter run -d chrome --dart-define=API_BASE=http://127.0.0.1:8765
```

Or a web build served with the engine:

```bash
flutter build web
# engine --serve will open that build at http://127.0.0.1:8765
```
