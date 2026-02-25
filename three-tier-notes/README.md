# three-tier-notes

Simple 3-tier Notes app:
- Frontend: React + Vite (served by Nginx)
- Backend: Node.js + Express + MongoDB driver
- Database: MongoDB

## Prerequisites
- Docker with Docker Compose

## Run with Docker
```bash
docker compose up --build
```

Then open: http://localhost:8080

Backend API is available at: http://localhost:3000

## Environment configuration
Backend env vars:
- `MONGO_URI` (required)
- `DB_NAME` (default `notesdb`)
- `PORT` (default `3000`)

Frontend env var:
- `VITE_API_BASE` (default `http://localhost:3000`)

## API Endpoints
- `GET /health` -> `{ "ok": true }`
- `GET /notes` -> `[]`
- `POST /notes` with body `{ "text": "..." }` -> created note
- `DELETE /notes/:id` -> `{ "ok": true }`

## Curl examples
```bash
curl http://localhost:3000/health

curl http://localhost:3000/notes

curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"text":"My first note"}'

curl -X DELETE http://localhost:3000/notes/<NOTE_ID>
```

## Optional: run without Docker
### Backend
```bash
cd backend
npm install
MONGO_URI='mongodb://root:rootpass@localhost:27017/?authSource=admin' DB_NAME=notesdb npm start
```

### Frontend
```bash
cd frontend
npm install
VITE_API_BASE='http://localhost:3000' npm run dev -- --host
```

Open Vite dev URL shown in terminal.
