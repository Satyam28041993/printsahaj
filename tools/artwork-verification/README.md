# Artwork Verification

Yeh PrintSahaj **website nahi** hai.

PrintSahaj website par kai tools aayenge. Yeh unme se **pehla tool** hai.
Website par iska sirf **link** hoga. Tool ka saara kaam is folder mein hai.

```
artwork-verification/
  engine/    pehla version — computer par chalta hai
  app/       kal yahan phone app / web app aayegi
  samples/   test jobs (asli customer files yahan rakhna, git mein nahi)
```

Kal Flutter se phone app ya web app banani ho to `app/` mein banao.
Hisab-kitab wala dimaag `engine/` mein rahega — website ke code se mix mat karna.

## Abhi kya chalta hai

Computer par folder do, tool batata hai:

- Job sheet par kitni plates likhi hain
- Plate file mein kitne pages hain
- Donon match nahi kiye to dikhata hai

PASS / APPROVED / FAIL nahi likhta. Sirf jo mila, woh likhta hai.

## Kaise chalao

```bash
cd tools/artwork-verification/engine
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m printsahaj_verify ../samples/kalonji
```

Kalonji folder mein `job.json` hai. Asli PDFs abhi daalni hain.

## Website

PrintSahaj site par Tools → Artwork Verification.
App banne ke baad wahi button app kholega.
