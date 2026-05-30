# SmartPick

SmartPick is a React application for managing shops, products, favorites and shopping reminders.

## Development

```bash
npm install
npm start
```

The frontend runs on port `3000`.

## Optional Backend

The app works offline with `localStorage` by default. To use the Express/SQLite backend, start it and provide an API URL:

```bash
npm run start:backend
```

Create `.env.development.local` with:

```text
REACT_APP_API_URL=http://localhost:5000
```

## Build

```bash
npm run build
```

The production build is configured for `/PROJECTS/SmartPick` through the `homepage` field in `package.json`.

## Docker

```bash
docker compose --env-file .env.docker.local up --build
```

The frontend is served by nginx at `http://localhost:3000`. The backend is available at `http://localhost:5000`, and SQLite data is stored in the `smartpick-data` Docker volume.

## Notes

Payment methods store only a label, card owner, expiry date and the last four digits. Full card numbers and CVV values must not be stored in this project.
