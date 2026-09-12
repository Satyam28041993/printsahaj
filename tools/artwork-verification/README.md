# Artwork Verification

Yeh PrintSahaj website nahi hai. Website is tool ko **start nahi** karti.

Chrome mein `http://127.0.0.1:8765` kholna kaafi nahi. Woh address tabhi chalta hai jab is computer par Python server chal raha ho. Uske bina Chrome likhega: **This site can’t be reached / refused to connect**.

## Windows par chalana

1. Python 3.11+ install karo — install ke time **Add python.exe to PATH** tick karo. Phir computer restart karo.
2. Repo root par `start-artwork-verification.bat` double-click, **ya** `tools\artwork-verification\start-tool.bat` double-click
3. Kali window **kholi rehne do**
4. Server ready hone ke baad browser khulega — `http://127.0.0.1:8765`

Agar Chrome phir bhi "can't be reached" bole: bat file nahi chali, window band ho gayi, ya Python PATH mein nahi hai. Kali window padho — wahan error likha hoga.

## Linux / Mac

```bash
chmod +x start-tool.sh
./start-tool.sh
```

Phir browser mein http://127.0.0.1:8765
