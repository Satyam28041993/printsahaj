# Artwork Verification

Yeh PrintSahaj **website nahi** hai. Website par sirf iska **link** hai.

## Kaam ka silsila

1. Client artwork aata hai — naam, code, PDF
2. First approval wala PDF (jo client ko mail par bheja)
3. Vendor ke do PDF
   - poora artwork (kitne label, cylinder, paper, colour)
   - colour separation
4. Sab match — report + remark
5. Print ke baad machine wali photo — abhi aankh se dekho aur remark likho
   (photo se automatic text/alignment/logo check is version mein nahi chalta)

Kabhi PASS / APPROVED / FAIL nahi likhta.

## Folder

```
engine/    hisab-kitab + local desk
app/       Flutter screen (web + kal Android APK)
samples/   test jobs
jobs/      live jobs (git nahi)
```

## Chalana

```bash
cd tools/artwork-verification/engine
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m printsahaj_verify --serve
```

Browser: http://127.0.0.1:8765

Pehli baar Flutter web build:

```bash
cd ../app
flutter build web
```

Phone APK kal: isi `app/` folder se `flutter build apk`.
