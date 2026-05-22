@echo off

REM Sprawdzenie, czy istnieje nowa wersja obrazu z repozytorium (opcjonalne)
docker-compose pull

REM Zatrzymanie kontenerów, jeśli są uruchomione
docker-compose down

REM Uruchomienie istniejącego obrazu bez jego przebudowywania, jeśli nie ma zmian
docker-compose up -d --no-recreate

REM Otwarcie aplikacji w domyślnej przeglądarce
start "" "http://localhost:3000"

pause

@REM @echo off
@REM setlocal

@REM REM --- Szybsze buildy (BuildKit) ---
@REM set DOCKER_BUILDKIT=1
@REM set COMPOSE_DOCKER_CLI_BUILD=1

@REM REM 1) Pobierz tylko obrazy z rejestru (dotyczy m.in. mongo)
@REM docker compose pull mongo

@REM REM 2) Zbuduj obraz aplikacji (korzysta z cache warstw)
@REM docker compose build --pull app

@REM REM 3) Uruchom stack; poczekaj na HEALTHCHECK (Compose v2)
@REM docker compose up -d --wait || docker compose up -d

@REM REM 4) Otwórz aplikację w przeglądarce
@REM start "" "http://localhost:3000"

@REM REM 5) Zainicjuj uruchomienie MongoDB Compass przez URI
@REM start "" "mongodb://localhost:27017/dbvault"

@REM pause

