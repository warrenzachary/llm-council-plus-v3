# Claude Code Work Log

Repo: llm-council-plus - v3
Format: Append-only. Each entry records one logically grouped change or decision.

---

## 2026-02-25 -- Branch: cc/autonomous-20260217

### Entry | Windows Installer (PyInstaller + Inno Setup)

**Goal:** Package ConsiliumAI as a standalone Windows installer so non-technical users can install with one click — no Python, Node.js, or terminal required.

**Changes:**
- `backend/config.py` — Added `_get_data_base()` / `DATA_BASE`; `DATA_DIR` now resolves to `%APPDATA%\ConsiliumAI\data\conversations` when frozen
- `backend/settings.py` — Added `_get_settings_file()`; `SETTINGS_FILE` resolves to `%APPDATA%\ConsiliumAI\data\settings.json` when frozen
- `backend/main.py` — Added static file serving (StaticFiles mount + SPA catch-all); `ensure_data_dirs` startup event creates data dirs on first run; renamed `GET /` health check to `GET /api/health`; added `FileResponse`, `StaticFiles`, `sys`, `Path` imports
- `launcher.py` (new) — PyInstaller entry point: port-in-use check, 2s delayed browser open, direct `from backend.main import app` import for uvicorn
- `consilium.spec` (new) — PyInstaller spec; one-folder build; `console=False`; bundles `frontend/dist/` and all backend providers
- `installer/consilium_setup.iss` (new) — Inno Setup script; per-user install to `%LOCALAPPDATA%\Programs\ConsiliumAI`; desktop shortcut; uninstaller
- `consilium.ico` — Regenerated as owl (replacing tree icon at user request)
- `SETUP.bat` — Updated inline PowerShell icon generation from tree to owl
- `PARTNER_SETUP.md` — Completely rewritten for installer flow; added firewall prompt note; removed SETUP.bat/GitHub instructions

**Output:** `installer/ConsiliumAI_Setup.exe` (~29MB), tested and working on dev machine.

**Key decisions:**
- Frontend built to static files and served by FastAPI — eliminates Node.js runtime requirement
- Data written to `%APPDATA%` not install dir (install dir may be read-only)
- Launcher uses direct import not string ref (string ref breaks in frozen bundle)
- `uv run pyinstaller` required (not system pyinstaller) to pick up project's Python 3.10 env

---

## 2026-02-17 -- Branch: cc/autonomous-20260217

### Entry 1 | council.py bug fix
- **Commit:** a8d59bd
- **Files:** backend/council.py
- **What:** Fixed `documents_context_block` shadowing bug in `stage3_synthesize_final`. The variable was set inside `if search_context:`, then unconditionally reset to `""`, then set again. Simplified to one init + one conditional. Also removed spurious blank lines before `calculate_aggregate_rankings` docstring.
- **Follow-up:** None.

### Entry 2 | Declare new dependencies
- **Commit:** b74cddf
- **Files:** pyproject.toml
- **What:** Added pypdf, python-pptx, openpyxl, python-docx, python-multipart to dependencies list.
- **Follow-up:** Requires `uv sync` (not yet run -- needs Warren's approval).

### Entry 3 | main.py cleanup + new endpoint + Stage 3 fix
- **Commit:** 21bb937
- **Files:** backend/main.py
- **What:**
  - Deleted ~50 lines of unreachable dead code after upload endpoint return
  - Removed duplicate imports (List, File, UploadFile)
  - Added `GET /api/conversations/{id}/documents` returning `{files: [{filename, size}]}`
  - Passed `documents_context` to `stage3_synthesize_final` so Chairman sees uploaded docs
- **Follow-up:** None.

### Entry 4 | Frontend uploaded files display
- **Commit:** 25bde77
- **Files:** frontend/src/api.js, frontend/src/components/ChatInterface.jsx, frontend/src/components/ChatInterface.css
- **What:**
  - Added `api.getDocuments(conversationId)` method
  - Added `uploadedFiles` state in ChatInterface, fetches on conversation change and after upload
  - Renders compact file indicator bar (paperclip + filename + size) between input row and execution mode toggle
  - CSS uses muted white text, small font, consistent with Midnight Glass theme
- **Follow-up:** None.

### Entry 5 | WORKLOG created
- **Commit:** bf650bf
- **Files:** WORKLOG_CLAUDE.md
- **What:** Initial work log with audit trail of session changes.
- **Follow-up:** File was cleared by Warren; rewritten with running-log format (this version).

---

## Pending manual steps (for Warren)

1. **Install deps** (project root terminal): `uv sync`
2. **Test backend** (project root terminal): `uv run python -m backend.main`
3. **Test frontend** (frontend terminal): `npm run dev`
4. **E2E test:** Upload PDF/PPTX/XLSX, verify file bar + summaries work

## 2026-02-17 (Warren) | End of night status
- Ran: uv sync; backend started OK; frontend started OK.
- Next: browser E2E upload test (pdf/pptx/xlsx) + verify file bar + summaries.

---

## 2026-02-18 -- Branch: cc/autonomous-20260217

### Entry 6 | Diagnostic: doc_loader extraction test
- **Commit:** None (read-only diagnostic)
- **Files touched:** None
- **Command:** `uv run python -c "..."` calling `backend.doc_loader.extract_text` on each file in `data/uploads/52f88d8c-...`
- **Results:**
  | File | Type | Chars extracted |
  |------|------|-----------------|
  | Pilates Consumer Snapshot vwzm_2.pptx | PPTX | 2,393 |
  | Pilates Instructor Questionnaire (Responses).xlsx | XLSX | 50,000 (hit cap) |
  | Pilates Response to HL vF.pdf | PDF | 7,943 |
  | Prep Team.docx | DOCX | 1,003 |
- **Outcome:** All four extractors (pypdf, python-pptx, openpyxl, python-docx) working. No errors. XLSX truncation cap functioning correctly.
- **Follow-up:** Proceed with browser E2E test (upload + council summarization).
### Entry 7 | E2E validation: Stage 3 Chairman sees uploaded docs
- **Commit:** None (runtime validation)
- **Files touched:** None
- **Config:** Chairman=openai/gpt-4.1; Council=anthropic/claude-opus-4.1, x-ai/grok-4, google/gemini-2.5-pro, openai/o4-mini
- **Test prompt:** "List the filenames you see attached to this conversation, and for each one, give one sentence on what it is about."
- **Observed filenames returned by Chairman:**
  - Pilates Consumer Snapshot vwzm_2.pptx
  - Pilates Instructor Questionnaire (Responses).xlsx
  - Pilates Response to HL vF.pdf
  - Prep Team.docx
- **Outcome:** PASS. Chairman correctly listed attached filenames and summarized each. No "no files attached" behavior observed.
- **Follow-up:** Add minimal safe logging of documents_context length at Stage 3 call only if this issue reappears.
- **Regression retest:** New conversation + single PDF upload (full mode). Chairman listed exactly 1 filename: "Pilates Response to HL vF.pdf". PASS.
---

## 2026-02-19 -- Branch: cc/autonomous-20260217

### Entry 8 (Warren) | Black formatter setup
- Installed Black in project venv (.venv) for consistent Python formatting.
- Set per-folder Cursor settings to use Black as the default Python formatter and enable format on save.
- Formatting initially failed due to an indentation error in backend/conversation.py (IndentationError). Fixed indentation, then Black formatting worked.

### Entry 9 | UI: Replace paperclip emoji with labeled "Attach" button
- **Commit:** None yet (applied by Warren)
- **Files:** frontend/src/components/ChatInterface.jsx
- **What:** Replaced the small paperclip emoji (`📎`) upload control with a clearly labeled "Attach" button. Verified visible in UI.
- **Why:** The emoji-only control was easy to miss for new users. A labeled button improves discoverability for the MVP demo.
- **Follow-up:** None.

### Entry 10 | Add MVP Demo Checklist to Notes.MD
- **Commit:** None yet
- **Files:** Notes.MD
- **What:** Added section 15 "MVP Demo Checklist" with 10 completed items (core functionality confirmed working) and 5 open items needed before sharing with colleagues. Renumbered Claude Code Operating Procedure to section 14 (unchanged, just shifted down).
- **Follow-up:** Work through the "Open before sharing" items.

### Entry 11 | CSS fix: increase messages-area bottom padding
- **Commit:** None yet
- **Files:** frontend/src/components/ChatInterface.css
- **What:** Changed `.messages-area` padding-bottom from 120px to 180px (line 145). The floating input capsule (position: absolute, bottom: 30px) is ~140-160px tall with the files bar and mode toggle, so 120px was not enough clearance. 180px ensures the last line of content is visible above the input.
- **Follow-up:** Verify in browser that chairman response bottom text is no longer obscured.

### Entry 12 | Bug fix: conversation context leak across conversations
- **Commit:** None yet
- **Files:** backend/main.py
- **What:** Replaced module-level singleton `conversation_manager = ConversationManager(max_turns=12)` with a per-conversation dict `conversation_managers: dict[str, ConversationManager] = {}`. The message handler now calls `conversation_managers.setdefault(conversation_id, ConversationManager(max_turns=12))` to get or create the correct manager. The delete endpoint now calls `conversation_managers.pop(conversation_id, None)` to clean up. Four references updated total.
- **Why:** The singleton accumulated turns from ALL conversations into one shared state. Creating conversation B after conversation A would inject A's context into B's prompts, causing hallucinated cross-talk.
- **Follow-up:** Browser validation: create conversation A (ask about filenames), create conversation B (ask about Super Bowl), confirm no cross-contamination.

---

## 2026-02-24 -- Branch: cc/autonomous-20260217

### Entry 14 | Feedback feature (Report Bug / Request Feature)
- **Commit:** None yet
- **Files:** backend/settings.py, backend/main.py, frontend/src/api.js, frontend/src/components/FeedbackModal.jsx (new), frontend/src/components/FeedbackModal.css (new), frontend/src/components/Sidebar.jsx, frontend/src/components/Sidebar.css, frontend/src/App.jsx, frontend/src/components/Settings.jsx
- **What:**
  - Backend: Added `github_feedback_repo` + `github_feedback_token` fields to Settings. Added `POST /api/feedback` endpoint that creates GitHub Issues via the GitHub API. Included context table (mode, models, chairman, search) in issue body.
  - Frontend api.js: Added `submitFeedback()` method.
  - FeedbackModal: New modal component with bug/feature type toggle, description textarea, collapsible auto-captured context panel, success state (links to created issue), error display.
  - Sidebar: Added `🐛 Report Bug` / `✨ Request Feature` footer buttons that open the modal.
  - App.jsx: Owns `feedbackOpen` / `feedbackType` state, builds context object, renders FeedbackModal.
  - Settings: Added "Feedback" nav section where Warren can enter his GitHub PAT (save immediately via `api.updateSettings`).
- **Why:** Gives users a one-click way to file issues directly to GitHub, with context auto-captured. Auditable and triggers GitHub email notifications for Warren.
- **Follow-up:** Warren needs to create a GitHub PAT with `public_repo` scope and enter it in Settings > Feedback.

---

## 2026-02-26 -- Branch: cc/autonomous-20260217

### Entry 15 | Fix: uvicorn crash in frozen exe (console=False)
- **Commit:** c39e4f0
- **Files:** launcher.py, installer/ConsiliumAI_Setup.exe
- **What:** Added stdout/stderr redirect to `%APPDATA%\ConsiliumAI\consilium.log` in launcher.py before uvicorn starts. PyInstaller's `console=False` sets sys.stdout/stderr to None; uvicorn's logging formatter calls `.isatty()` on startup and crashes with `AttributeError: 'NoneType' object has no attribute 'isatty'`. Redirecting to a log file fixes the crash and provides a debug log on partner machines.
- **Why:** Bruce (partner) reported the crash via screenshot on first install.
- **Follow-up:** Warren to test new installer locally, then confirm with Bruce. See NEXT_STEPS.md.

---

### Entry 13 | One-click launcher for non-technical colleague
- **Commit:** None yet
- **Files:** SETUP.bat, start_consilium.ps1
- **What:**
  - `SETUP.bat`: One-time setup wizard. Checks for Python, Node.js (opens download pages with step-by-step instructions if missing). Installs uv automatically. Runs `uv sync` and `npm install`. Generates `consilium.ico` (green tree, drawn via PowerShell GDI+, no external files needed). Creates `ConsiliumAI.lnk` on the user's desktop pointing to `start_consilium.ps1`.
  - `start_consilium.ps1`: Silent daily launcher. Checks if backend (port 8001) and frontend (port 5173) are already running. If both up, just opens the browser. If not, starts backend via uv (hidden window), polls localhost:8001 until ready (up to 30s), starts frontend via cmd /c npm run dev (hidden window), waits 5s for Vite, opens browser. Shows a friendly error dialog if the backend fails to start.
- **Why:** Colleague is non-technical and on a separate machine. Goal is double-click → browser opens, treated like a website.
- **Follow-up:** Warren to test SETUP.bat on a clean machine or a test account.
