@echo off
SETLOCAL

SET ROOT=%~dp0
SET FRONTEND=%ROOT%frontend
SET BACKEND=%ROOT%backend

echo Checking Python virtual environment...
IF NOT EXIST "%BACKEND%\.venv\Scripts\python.exe" (
    echo No .venv found. Creating virtual environment...
    python -m venv "%BACKEND%\.venv"
    IF ERRORLEVEL 1 (
        echo ERROR: Failed to create virtual environment. Is Python installed?
        pause
        exit /b 1
    )
    echo Installing dependencies from requirements.txt...
    "%BACKEND%\.venv\Scripts\pip.exe" install -r "%BACKEND%\requirements.txt"
    IF ERRORLEVEL 1 (
        echo ERROR: Failed to install dependencies.
        pause
        exit /b 1
    )
    echo Virtual environment ready.
) ELSE (
    echo Virtual environment found. Skipping setup.
)

echo Starting FastAPI backend https://localhost:8000 
start "FastAPI Backend" cmd /k "cd /d %BACKEND% && .venv\Scripts\python.exe -m uvicorn app.main:app --reload"

echo Checking Node dependencies...
IF NOT EXIST "%FRONTEND%\node_modules" (
    echo No node_modules found. Running npm install...
    cd /d "%FRONTEND%"
    npm install
    IF ERRORLEVEL 1 (
        echo ERROR: npm install failed. Is Node.js installed?
        pause
        exit /b 1
    )
    echo Node dependencies installed.
) ELSE (
    echo node_modules found. Skipping install.
)

echo Starting Node frontend https://localhost:5173
start "Node Frontend" cmd /k "cd /d %FRONTEND% && npm run dev"

echo.
echo Both services are starting in separate windows.
echo Close those windows to stop the services.
echo.
pause