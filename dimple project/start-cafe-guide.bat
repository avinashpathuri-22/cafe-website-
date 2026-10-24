@echo off
setlocal
cd /d "%~dp0"
where java >nul 2>nul
if errorlevel 1 (
  echo Java 17 or newer is required. Install a JDK, then run this file again.
  pause
  exit /b 1
)
set JAVA_VERSION=
for /f "tokens=3" %%V in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%~V
for /f "tokens=1 delims=." %%M in ("%JAVA_VERSION%") do set JAVA_MAJOR=%%M
if not defined JAVA_MAJOR (
  echo Java could not start. Install a JDK 17 or newer and check JAVA_HOME.
  pause
  exit /b 1
)
if %JAVA_MAJOR% LSS 17 (
  echo Java 17 or newer is required. Detected Java %JAVA_VERSION%.
  pause
  exit /b 1
)
echo Starting Cafe Guide. Keep this window open, then visit http://localhost:8080.
call mvnw.cmd spring-boot:run
if errorlevel 1 pause
