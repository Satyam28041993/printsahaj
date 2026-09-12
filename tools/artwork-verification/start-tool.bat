@echo off
setlocal
cd /d "%~dp0engine"

where python >nul 2>&1
if errorlevel 1 (
  echo Python nahi mila.
  echo https://www.python.org/downloads/ se Python 3.11+ install karo.
  echo Install ke time "Add python.exe to PATH" tick karna.
  pause
  exit /b 1
)

if not exist .venv (
  echo Pehli baar setup ho raha hai...
  python -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install -q -r requirements.txt
if errorlevel 1 (
  echo Packages install nahi hue.
  pause
  exit /b 1
)

echo.
echo Tool start ho raha hai. Browser khulega.
echo Band karne ke liye is window ko band karo.
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8765"
python -m printsahaj_verify --serve
if errorlevel 1 pause
