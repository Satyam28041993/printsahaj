# PrintVerify

This is not the PrintSahaj website. The website does **not** start this tool.

Opening `http://127.0.0.1:8765` in Chrome is not enough. That address only works while the Python server is running on this computer. Otherwise Chrome shows: **This site can’t be reached / refused to connect**.

## Windows

1. Install Python 3.11+ — tick **Add python.exe to PATH** during install, then restart the computer.
2. Double-click `start-artwork-verification.bat` at the repo root, **or** `tools\artwork-verification\start-tool.bat`
3. Leave the black window **open**
4. The browser opens after the server is ready — `http://127.0.0.1:8765`

If Chrome still says "can't be reached": the bat file did not start, the window was closed, or Python is not on PATH. Read the black window — the error is there.

## Linux / Mac

```bash
chmod +x start-tool.sh
./start-tool.sh
```

Then open http://127.0.0.1:8765
