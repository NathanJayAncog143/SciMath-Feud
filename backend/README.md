# SciMath Feud Local Backend

Local Node/MySQL backend for the SciMath-Feud project.

## Setup

```powershell
cd backend
npm install
```

The backend reads `backend/.env`. It is configured to use the same local MySQL user as the sibling project:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=scimath_db
DB_PASSWORD=scimath_db
DB_NAME=scimath
```

## Database

Load the tables, seed data, and stored procedures:

```powershell
C:\wamp64\bin\mysql\mysql8.4.7\bin\mysql.exe -u scimath_db -pscimath_db -e "source C:/Users/NATHAN JAY/Documents/SciMath-Feud/backend/scimath-feud.sql"
```

This creates `sf_*` tables inside the existing `scimath` database so it does not overwrite the sibling project's `questions`, `answers`, or `game_state` tables.

## Run

```powershell
npm run dev
```

The server listens on `http://localhost:3001`.

Useful checks:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
Invoke-RestMethod http://localhost:3001/api/game-sets/DEMO001
```
