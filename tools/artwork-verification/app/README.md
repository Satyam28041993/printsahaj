# Artwork Verification app

Yeh PrintSahaj website nahi hai. Yeh tool ki screen hai.

- Computer / browser — Flutter web
- Phone — isi folder se Android APK

Hisab-kitab `../engine/` mein hai. App usse baat karti hai.

## Chalana

Pehle engine:

```bash
cd ../engine
.venv/bin/python -m printsahaj_verify --serve
```

Phir app:

```bash
flutter run -d chrome --dart-define=API_BASE=http://127.0.0.1:8765
```

Ya web build engine ke saath:

```bash
flutter build web
# engine --serve us build ko http://127.0.0.1:8765 par khol dega
```
