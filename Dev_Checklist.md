# Consilium Dev Checklist (Quick Runbook)

Project: llm-council-plus - v3
Path: C:\Projects\02_Active\llm-council-plus - v3\

## Terminals (Cursor)
- Backend terminal: C:\Projects\02_Active\llm-council-plus - v3
- Frontend terminal: C:\Projects\02_Active\llm-council-plus - v3\frontend
- Commands terminal: one-off checks

## Start Backend (project root terminal)

```powershell
.\.venv\Scripts\Activate.ps1
uv run python -m backend.main
Confirm Uvicorn is running on:

http://0.0.0.0:8001

Start Frontend (frontend terminal)
npm run dev
Confirm Vite is running on:

http://localhost:5173

Open in Chrome:

http://localhost:5173

Quick health checks
A) Backend is responding
In browser:

http://localhost:8001/api/conversations

B) Document upload path exists
Uploaded docs are saved under:

data\uploads<conversation_id>\

C) Backend sees uploaded docs for a conversation
Call:

GET /api/conversations/<conversation_id>/documents

Expected:

list of files with filename and size

D) Full pipeline is enabled when expecting a Chairman response
In the UI, set Execution mode to:

Full Deliberation

(If set to Chat Only, there will be no Chairman step.)

When something fails, capture this info before debugging
Exact UI error text or screenshot

Backend terminal lines around the error

Frontend browser console errors

Network tab: failing request URL + status code + response body (if safe)


If you want, the next improvement after this is adding one “known good” E2E prompt (the filename listing prompt) into the checklist, but I kept the runbook tight.