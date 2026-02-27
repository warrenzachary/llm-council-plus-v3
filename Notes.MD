Checkpoint: 2026-02-24. Branch cc/autonomous-20260217. Worklog in WORKLOG_CLAUDE.md. MVP checklist complete except visual polish (deferred).

# Consilium (LLM Council customization) Notes.md

Last updated: 2026-02-18
Project: Consilium (based on Andrej Karpathy’s LLM Council)
Primary active repo: llm-council-plus - v3
Path: C:\Projects\02_Active\llm-council-plus - v3\

## 1) What Consilium is

Consilium is a local, multi-model “council” chat app that runs on Windows 11 with:
- FastAPI backend (Uvicorn)
- React + Vite frontend
- Multi-stage orchestration:
  - Stage 1: council members answer in parallel
  - Stage 2: council members evaluate and rank each other
  - Stage 3: a chairman model synthesizes the final answer

Users can create multiple conversations. Each conversation can have uploaded documents. Web search and stronger retrieval can be added later.

## 2) High-level goals (authoritative)

1) Local app runs reliably (backend + frontend dev server).
2) Users create conversations and chat with multiple models.
3) The council can use:
   - prior conversation context
   - uploaded documents per conversation
   - optional web search (future or optional)
4) Uploaded documents are stored per conversation and used in prompts.
5) Keep the workflow simple and stable first, then add retrieval, chunking, indexing, and UI polish.

## 3) Working principles (Novice Coach Mode)

Rules:
- One step at a time. One action per instruction. User reports back after each action.
- Explicit file paths and exact commands.
- When copy/pasting multi-line text into code, keep indentation consistent. If needed, indent by pressing Space four times (or match surrounding lines) before pasting.
- Prefer relying on Claude Code in Cursor for code changes, with ChatGPT guiding decisions and debugging steps.
- Do not assume environment or folder layout from older prompts. Use the current project folder.
- When something fails, capture:
  - exact UI error
  - relevant backend terminal lines
  - relevant frontend console or network logs

Writing preference:
- Avoid em dashes.

## 4) Current environment and how to run

OS:
- Windows 11

Editor:
- Cursor (primary)

Backend run (project root terminal):
- Folder:
  C:\Projects\02_Active\llm-council-plus - v3
- Activate venv:
  .\.venv\Scripts\Activate.ps1
- Start backend:
  uv run python -m backend.main
- Backend listens on:
  http://0.0.0.0:8001

Frontend run (frontend terminal):
- Folder:
  C:\Projects\02_Active\llm-council-plus - v3\frontend
- Install once per clone:
  npm install
- Start Vite dev server:
  npm run dev
- Frontend usually on:
  http://localhost:5173

Chrome open:
- Start-Process "chrome.exe" "http://localhost:5173/"

Terminal naming:
- Backend terminal: project root directory
- Frontend terminal: frontend directory
- Commands terminal: one-off checks
When referencing a terminal, always identify by its working directory.

## 5) Current backend behavior

Core endpoints (conceptually):
- GET /api/conversations
- POST /api/conversations
- GET /api/conversations/{conversation_id}
- DELETE /api/conversations/{conversation_id}
- POST /api/conversations/{conversation_id}/message/stream
- GET /api/conversations/{conversation_id}/documents

The streaming endpoint drives:
- Stage 1 member answers
- Stage 2 ranking
- Stage 3 chairman synthesis (when using full mode)

Conversation persistence:
- Uses storage module for conversation and message persistence.
- Maintains a condensed context_text from recent turns and summaries.

## 6) Document upload and storage (implemented)

Backend upload endpoint:
- POST /api/conversations/{conversation_id}/documents
- Saves uploaded files to:
  data/uploads/{conversation_id}\<filename>

Backend documents list endpoint:
- GET /api/conversations/{conversation_id}/documents
- Returns a file list with at least filename and size.

Document parsing and injection:
- Document text extraction is implemented for:
  - PDF
  - PPTX
  - XLSX
  - DOCX
- There is a 50,000 character cap (observed on XLSX extraction), which is expected behavior.

Validated extraction diagnostic:
- A safe extraction diagnostic was run (no content printed) confirming non-zero extracted text for PDF, PPTX, XLSX, and DOCX.
- Multi-file upload E2E test confirmed ingestion and summarization across these types.

## 7) Frontend upload and file display (implemented)

Frontend upload behavior:
- Paperclip upload button posts files as FormData to:
  /api/conversations/{conversation.id}/documents

Uploaded files display:
- UI shows a compact uploaded file indicator bar (paperclip, filename, size).
- The UI refreshes this list on conversation change and after upload.

## 8) Execution modes in UI

Execution mode options in the UI:
- Chat Only: lite mode, no chairman step, per-model responses only.
- Chat + Ranking: runs member responses plus ranking output.
- Full Deliberation: runs the full Stage 1 + Stage 2 + Stage 3 pipeline including chairman synthesis.

## 9) Current model configuration and roles

Important role rule:
- Chairman is not a council member.
- Chairman runs after Stage 1 and Stage 2, synthesizes final answer.

Current configuration being used:
- Chairman: openai/gpt-4.1
- Council (4):
  - anthropic/claude-opus-4.1
  - x-ai/grok-4
  - google/gemini-2.5-pro
  - openai/o4-mini

## 10) Key debugging outcomes and lessons learned

A) OpenRouter environment variable issues:
- OPENROUTER_API_KEY can be empty in a terminal session.
- The app uses settings first, then falls back to env var.
- “API key is valid” in Settings is the reliable check for the running app.

B) Document visibility bug in chairman synthesis (resolved):
- Symptom:
  - Chairman sometimes claimed “no files attached” even when members summarized docs correctly and the backend documents endpoint listed files.
- Root causes:
  1) Stage 3 prompt template missing {documents_context_block}
  2) Chairman model choice caused identity and role conflicts when using a search-grounded model
- Fixes applied:
  - Inserted {documents_context_block} into Stage 3 prompt immediately after {search_context_block}
  - Changed Chairman to openai/gpt-4.1 to avoid role-rebel behavior
- Validations:
  - Full Deliberation multi-file test: Chairman listed all filenames and summarized each.
  - Regression retest: new conversation, single PDF upload, Full Deliberation: Chairman listed exactly one filename correctly.
  - Chat Only: member models also listed the correct attached filename.

If this ever reappears:
1) Confirm Stage 3 prompt still includes {documents_context_block} after saving.
2) Add minimal backend logging (no content) showing documents_context length at Stage 3 call time.
3) Confirm the UI is in Full Deliberation when expecting Stage 3.

## 11) Open issues (active)

1) Prompt entry UI overlap
- The prompt entry window can overlap the bottom of the chairman response, blocking last lines.
- Needs layout or padding fix so the response content is fully visible above the input.

2) Prompt truncation for large documents (50,000 character cap)
- Risk: summaries and quotes can miss content beyond the cap.
- Later improvements:
  - chunking strategy
  - chunk selection by keyword
  - eventual retrieval and citations

3) Model provider stability and error handling
- Models can fail occasionally.
- Desired behavior:
  - continue with remaining models
  - show clear per-model error detail in UI
  - optionally auto-disable persistently failing models

4) Possible duplicate model queries (investigate later)
- In some logs, each model appeared to be called twice.
- Could be UI double-send, dev-mode behavior, or retries.
- Confirm normal flow is one call per model per user prompt.

5) Web search integration
- Optional. Not the current focus.

## 12) Parking lot (future enhancements)

Documents and retrieval:
- Expand documents endpoint to include timestamps.
- Add per-message toggle: “Use uploaded docs”.
- Add chunking and retrieval:
  - embeddings
  - vector store
  - citations pointing to file and chunk

Model configuration and UX:
- UI for configuring:
  - council members list
  - chairman model
  - execution mode defaults
- Better labeling and status:
  - show which models ran
  - show which failed and why
  - show timings per stage and per model
- Dynamic model recommendation updates:
  - Currently, tier assignments (Best Quality / Good Value / Limited) are hardcoded in frontend/src/data/modelRecommendations.js and require a manual code update when new models are released.
  - Future: fetch tier assignments from a remote source (e.g. a maintained JSON file or API endpoint) so recommendations stay current without a code deploy.
  - Alternative: add an in-app button ("Refresh Model Ratings") that pulls the latest recommendations from a hosted config file.

Reliability and observability:
- Improve logging:
  - uploads saved path and bytes
  - which files loaded and how many characters included
  - stage-level trace ids to link frontend request to backend logs

Packaging:
- Longer term: rename folders to consilium/, consolidate versions, reduce drift from upstream.
- Document which files differ from upstream LLM Council.
- One-click Windows installer using Inno Setup: bundles Python, Node.js, and the app into a single .exe. No black windows, no steps for non-technical users. Replaces SETUP.bat flow entirely.

## 13) Known good end-to-end tests

A) Multi-file E2E doc ingestion and summarization
1) Create new conversation.
2) Upload a PDF, PPTX, XLSX, and DOCX.
3) Verify backend sees these via:
   GET /api/conversations/{conversation_id}/documents
4) Ask:
   “List the filenames you see attached to this conversation, and for each one, give one sentence on what it is about.”
5) Expect:
   - members respond
   - chairman lists filenames and summarizes each
   - no “no files attached” behavior

B) Regression: single file
1) New conversation.
2) Upload single PDF.
3) Full Deliberation.
4) Ask:
   “List the filenames you see attached to this conversation.”
5) Expect Chairman lists exactly one filename.

## 15) MVP Demo Checklist

Goal: shareable state where a colleague can try Consilium with real documents.

Core functionality:
- [x] Multi-model council answers in parallel (Stage 1)
- [x] Peer ranking (Stage 2)
- [x] Chairman synthesis (Stage 3)
- [x] Execution mode toggle (Chat Only / Chat + Ranking / Full Deliberation)
- [x] Conversation persistence (create, list, delete, multi-turn context)
- [x] Document upload (PDF, DOCX, PPTX, XLSX, TXT)
- [x] Document text extraction with 50k char cap
- [x] Chairman sees uploaded documents (Stage 3 passthrough fix)
- [x] Uploaded files indicator bar in UI
- [x] Labeled "Attach" button (replaces hard-to-find paperclip emoji)
- [x] Feedback: Report Bug / Request Feature -- files GitHub Issues with auto-captured context, verified 2026-02-24

Open before sharing:
- [x] Fix prompt entry overlap blocking bottom of chairman response -- CSS padding-bottom 180px, browser verified 2026-02-24
- [x] Graceful per-model error display when a provider fails -- already implemented (Stage1.jsx error badge + message, council.py error passthrough)
- [ ] Quick visual polish pass (spacing, loading states, empty states) -- deferred, not blocking ship
- [x] Confirm no duplicate model calls -- not a real issue; StrictMode only double-runs effects, not button-click handlers; !isLoading guard prevents double-send
- [x] Write a short README or onboarding note for a first-time colleague -- SETUP.bat + start_consilium.ps1 (one-click install + desktop launcher)
- [x] Feedback channel for users -- GitHub Issues via sidebar buttons, token stored locally

## 14) Claude Code Operating Procedure (Claude Safe Autonomy Canon reference)

Use the Claude Safe Autonomy Canon:
- Repo scoped
- Avoid secrets (.env*, data/settings.json, *.pem, etc.)
- Small commits
- Maintain WORKLOG_CLAUDE.md
- Do not push unless explicitly told which remote
- Keep .claude/ ignored

Autonomy tiers (standing rules)

A) Pre-approved edits (Claude may do without asking each time):
- Append-only updates to WORKLOG_CLAUDE.md
- Non-functional UI copy changes (text labels, tooltips) that do not affect behavior
- CSS-only tweaks (styling changes) that do not change logic
- Adding safe, no-content logging statements that do not print secrets or document contents

B) Requires explicit approval as a batch (not per edit):
- Any dependency install/change (uv/pip/npm)
- Any file create/delete/rename/move
- Any changes touching secrets or config (env files, settings files, keys)
- Any changes to backend request/response logic, orchestration, or storage
- Any git actions (commit/push/checkout/reset/rebase/merge)
- Any command that touches network or credentials outside normal app runtime
- Any destructive command or force flags

Tier B workflow (standing):
1) Before making any Tier B edits, show a compact diff preview:
   - List each file to be changed
   - For each file, show only the changed lines with 2 to 5 lines of surrounding context
   - Provide a short, plain-English summary of what each change does
2) Group all related Tier B changes into a single batch whenever possible.
3) Do not apply Tier B edits until I explicitly approve the batch after seeing the diff preview.
4) After I approve a Tier B batch, apply all edits in that batch, then stop.

Cursor approval reality (standing)

Cursor’s mode controls approval prompts, not just our autonomy tiers.

- Ask Before Edits mode will always trigger per-file approval dialogs, even for Tier A items.
- To maximize efficiency while keeping threshold security:
  1) Use Ask Before Edits for investigation and for Tier B diff previews.
  2) Claude must show a Tier B batch diff first.
  3) After I approve the batch, switch to Edit Automatically to apply the whole approved batch without repeated dialogs.
  4) After the batch is applied, switch back to Ask Before Edits.
