@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Artwork Verification

echo.
echo ========================================
echo  Artwork Verification
echo.
echo  Opening 127.0.0.1 in Chrome is not enough.
echo  This window must stay open first.
echo  The website does not start this tool.
echo ========================================
echo.

set "VPY=%~dp0engine\.venv\Scripts\python.exe"
set "REQ=%~dp0engine\requirements.txt"

call :find_python
if errorlevel 1 (
  echo Python was not found.
  echo.
  echo 1. Install Python 3.11+ from https://www.python.org/downloads/
  echo 2. Tick "Add python.exe to PATH" during install
  echo 3. Restart the computer
  echo 4. Double-click this file again
  echo.
  pause
  exit /b 1
)

if not exist "%VPY%" (
  echo First-time setup. This can take a minute or two...
  %PYCMD% -m venv "%~dp0engine\.venv"
  if errorlevel 1 (
    echo Could not create the virtualenv. Python 3.11+ is required.
    pause
    exit /b 1
  )
)

echo Checking packages...
"%VPY%" -m pip install -q -r "%REQ%"
if errorlevel 1 (
  echo Packages did not install.
  pause
  exit /b 1
)

echo.
echo Starting the tool. The browser opens after the server is ready.
echo Do not close this black window.
echo Close the window when you want to stop the tool.
echo Optional: put your Gemini key in gemini-key.txt in this same folder.
echo.

cd /d "%~dp0engine"
"%VPY%" -m printsahaj_verify --serve
echo.
echo The tool has stopped.
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
