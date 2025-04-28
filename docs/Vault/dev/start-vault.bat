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
