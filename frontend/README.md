# SciMath Feud Frontend

React/Vite frontend for the SciMath Feud game.

## Run

```powershell
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and calls the local backend at `http://localhost:3001` by default.

To point it somewhere else, set:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Build

```powershell
npm run build
```
