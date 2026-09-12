@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Artwork Verification

echo.
echo ========================================
echo  Artwork Verification
echo.
echo  Chrome mein 127.0.0.1 kholna kaafi nahi.
echo  Pehle YE window chalni chahiye.
echo  Website yeh tool start nahi karti.
echo ========================================
echo.

set "VPY=%~dp0engine\.venv\Scripts\python.exe"
set "REQ=%~dp0engine\requirements.txt"

call :find_python
if errorlevel 1 (
  echo Python nahi mila.
  echo.
  echo 1. https://www.python.org/downloads/ se Python 3.11+ install karo
  echo 2. Install ke time "Add python.exe to PATH" tick karo
  echo 3. Computer restart karo
  echo 4. Phir is file par double-click karo
  echo.
  pause
  exit /b 1
)

if not exist "%VPY%" (
  echo Pehli baar setup ho raha hai. 1-2 minute lag sakte hain...
  %PYCMD% -m venv "%~dp0engine\.venv"
  if errorlevel 1 (
    echo venv nahi bana. Python 3.11+ chahiye.
    pause
    exit /b 1
  )
)

echo Packages check ho rahe hain...
"%VPY%" -m pip install -q -r "%REQ%"
if errorlevel 1 (
  echo Packages install nahi hue.
  pause
  exit /b 1
)

echo.
echo Tool start ho raha hai. Server ready hone ke baad browser khulega.
echo Is kali window ko BAND MAT KARNA.
echo Band karne ke liye window close karo.
echo.

cd /d "%~dp0engine"
"%VPY%" -m printsahaj_verify --serve
echo.
echo Tool band ho gaya.
pause
exit /b %ERRORLEVEL%

:find_python
set PYCMD=
py -3 -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>&1
if not errorlevel 1 (
  set "PYCMD=py -3"
  exit /b 0
)
python -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>&1
if not errorlevel 1 (
  set "PYCMD=python"
  exit /b 0
)
python3 -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>&1
if not errorlevel 1 (
  set "PYCMD=python3"
  exit /b 0
)
exit /b 1
