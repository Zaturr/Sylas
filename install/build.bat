@echo off
REM Lanza el build de Sylas desde CMD o con doble clic.
REM Un .ps1 no es un .exe: hay que invocarlo con PowerShell.

cd /d "%~dp0\.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build.ps1"
exit /b %ERRORLEVEL%
