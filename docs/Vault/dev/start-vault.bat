@echo off
setlocal

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker is not available in PATH.
  pause
  exit /b 1
)

docker compose version >nul 2>nul
if errorlevel 1 (
  echo Docker Compose v2 is not available.
  pause
  exit /b 1
)

set DOCKER_BUILDKIT=1
set COMPOSE_DOCKER_CLI_BUILD=1

docker compose pull mongo
docker compose build app
docker compose up -d --wait
if errorlevel 1 docker compose up -d

start "" "http://localhost:3000"

pause
