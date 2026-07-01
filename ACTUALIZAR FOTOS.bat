@echo off
title Actualizar fotos
cd /d "%~dp0"
echo.
echo   Incrustando las fotos de la carpeta img\ ...
echo.
where python >nul 2>nul && (
    python embed_fotos.py
) || (
    where py >nul 2>nul && (
        py embed_fotos.py
    ) || (
        echo   No se encontro Python. Instalalo desde https://www.python.org/downloads/
    )
)
echo.
pause
