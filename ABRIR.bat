@echo off
title Galaxia de Amor
cd /d "%~dp0"
where python >nul 2>nul && (
    python start_server.py
) || (
    where py >nul 2>nul && (
        py start_server.py
    ) || (
        echo.
        echo   No se encontro Python en este equipo.
        echo   Instalalo gratis desde: https://www.python.org/downloads/
        echo   (marca la casilla "Add Python to PATH" al instalar)
        echo.
        pause
    )
)
