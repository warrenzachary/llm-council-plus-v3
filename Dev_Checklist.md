# Consilium Dev Checklist (Quick Runbook)

Project: llm-council-plus - v3  
Path: C:\Projects\02_Active\llm-council-plus - v3\

## Start Backend

From project root:

```powershell
.\.venv\Scripts\Activate.ps1
uv run python -m backend.main
```
Confirm Uvicorn shows it is running on http://0.0.0.0:8001

## Start Frontend
From frontend folder:
```
npm run dev
```
Confirm Vite shows http://localhost:5173

Open in Chrome:

- Go to http://localhost:5173

