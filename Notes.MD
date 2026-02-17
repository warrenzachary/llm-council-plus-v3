Status: DEV_CHECKLIST.md and Notes.md created, document upload working, Gemma removed from council, Chairman label fixed.

# Consilium (LLM Council customization) Notes.md

Last updated: 2026-02-17  
Project: Consilium (based on Andrej Karpathy’s LLM Council)  
Primary active repo: llm-council-plus - v3  
Path: C:\Projects\02_Active\llm-council-plus - v3\

## 1) What Consilium is

Consilium is a local, multi-model “council” chat app that runs on a Windows 11 machine with:
- FastAPI backend (Uvicorn)
- React + Vite frontend
- Multi-stage orchestration:
  - Stage 1: council members answer in parallel
  - Stage 2: council members evaluate and rank each other
  - Stage 3: a chairman model synthesizes the final answer

Users can create multiple conversations. Each conversation can have uploaded documents. Later, web search and better retrieval can be added.

## 2) High-level goals (authoritative)

1) Local app runs reliably (backend + frontend dev server).
2) Users create conversations and chat with multiple models.
3) The council can use:
   - prior conversation context
   - uploaded documents per conversation
   - optional web search (future or optional)
4) Uploaded documents are stored per conversation and used in Stage 1 prompts.
5) Keep the workflow simple and stable first, then add retrieval, chunking, indexing, and UI polish.

## 3) Working principles for how we work together (Novice Coach Mode)

This project uses a novice-friendly workflow.

Rules:
- One step at a time. One action per instruction. User reports back after each action.
- Explicit file paths and exact commands.
- When copy/pasting multi-line text into code, keep indentation consistent. If needed, add indentation by pressing Space four times (or matching surrounding lines) before pasting.
- Prefer relying on Claude Code in Cursor for code changes, with ChatGPT guiding decisions and debugging steps.
- Do not assume the environment or folder layout from old prompts. Use the current project folder.
- When something fails, capture:
  - exact UI error
  - relevant backend terminal lines
  - relevant frontend console or network logs

Writing preferences:
- Avoid em dashes.

## 4) Current environment and how to run

OS:
- Windows 11

Editor:
- Cursor (primary)

Backend run (reliable):
- Open a terminal in Cursor in project root:
  C:\Projects\02_Active\llm-council-plus - v3
- Activate venv:
  .\.venv\Scripts\Activate.ps1
- Start backend:
  uv run python -m backend.main
- Backend listens on:
  http://0.0.0.0:8001

Frontend run:
- Terminal in:
  C:\Projects\02_Active\llm-council-plus - v3\frontend
- Install once per clone:
  npm install
- Start Vite dev server:
  npm run dev
- Frontend usually on:
  http://localhost:5173

Opening in Chrome (instead of a Cursor tab):
- Vite may open in an internal preview depending on Cursor settings.
- Manual reliable approach:
  Start-Process "chrome.exe" "http://localhost:5173/"

Note on Cursor terminals:
- Multiple terminals exist (backend, frontend, commands).
- Switching terminals:
  Use the “Switch Active Terminal” command (Command Palette) and select from the list.
- Avoid creating accidental extra split terminals by mis-clicking split controls.

## 5) Current backend behavior

Core endpoints (conceptually):
- GET /api/conversations
- POST /api/conversations
- GET /api/conversations/{conversation_id}
- DELETE /api/conversations/{conversation_id}
- POST /api/conversations/{conversation_id}/message/stream

The streaming endpoint drives:
- Stage 1: each council model answers
- Stage 2: ranking
- Stage 3: chairman synthesis

Conversation persistence:
- Uses storage module for conversation/message persistence.
- Maintains a condensed context_text from recent turns and summaries.

## 6) Document upload and storage (implemented)

Backend upload endpoint:
- POST /api/conversations/{conversation_id}/documents
- Saves uploaded files to:
  data/uploads/{conversation_id}/<filename>

The endpoint:
- Verifies conversation exists.
- Creates the directory if missing.
- Writes each file with a safe filename.

Document injection into Stage 1 (implemented):
- On message stream, backend loads documents for that conversation by reading from:
  data/uploads/{conversation_id}
- It currently reads files as text:
  - path.open("r", encoding="utf-8", errors="ignore")
  - caps read per file at 50,000 characters
- It concatenates file contents into documents_context and includes it in the Stage 1 prompt.

Important limitation:
- .docx is not plain text. The loader will not properly extract text from docx right now.

## 7) Frontend upload wiring (fixed)

Frontend upload behavior:
- Paperclip upload button posts files as FormData to:
  /api/conversations/{conversation.id}/documents
- Recent fix added better logging and better URL base handling.

Observed evidence:
- Chrome Console shows:
  Upload success: { conversationId: "...", response: {...} }
- Files appear on disk under:
  data/uploads/<conversationId>

Testing commands used:
- Verify saved uploads:
  Get-ChildItem "C:\Projects\02_Active\llm-council-plus - v3\data\uploads\<conversationId>" | Select-Object Name, Length, LastWriteTime

## 8) Current model configuration and roles

Council members (Stage 1):
- anthropic/claude-opus-4.5
- openai/gpt-5
- x-ai/grok-4
(Gemma was removed due to repeated provider errors.)

Chairman (Stage 3):
- perplexity/sonar-pro

Important clarification:
- Chairman is not a council member.
- Chairman runs after Stage 1 and Stage 2, synthesizes final answer.

UI label fix completed:
- Changed label from:
  "Chairman's Verdict"
  to:
  "Chairman (Synthesis Model)"
This avoids confusion that the chairman name is the verdict.

## 9) Key debugging outcomes and lessons learned

A) OpenRouter environment variable was empty in terminal:
- OPENROUTER_API_KEY was not set in the terminal session (key_length 0).
- Direct terminal scripts that relied on OPENROUTER_API_KEY failed.
- The app itself uses settings first (settings.openrouter_api_key) then falls back to env var.

B) OpenRouter key is valid in app settings UI:
- The Settings page confirmed: "API key is valid."
- This is the reliable key source for the running app.

C) Model-specific failures:
- google/gemma-3n-e4b-it repeatedly failed with:
  "Bad request ... Provider returned error"
- Removing Gemma removed red error cards and stabilized runs.

D) Intermittent earlier error:
- [Errno 11001] getaddrinfo failed appeared earlier.
- Later runs showed stable access to https://openrouter.ai.
- Treat as a possible intermittent network / DNS / environment fluke.

E) Vite esbuild issue (older v2 fix, useful to remember):
- Windows Vite error: spawn UNKNOWN
- Fix: uninstall and reinstall esbuild
  npm uninstall esbuild
  npm install esbuild --save-dev
- If needed: delete node_modules and reinstall.

## 10) Open issues (active)

1) Document loader does not parse .docx
- Symptom: docx uploaded, but council cannot summarize it accurately.
- Current loader reads as plain text.
- Needed: docx extraction via python-docx or a converter.

2) Prompt truncation for documents (50,000 character cap per file)
- Risk: summaries and quotes may miss content after the cap.
- Needed: better chunking strategy.
  Examples:
  - first chunk + last chunk
  - chunk selection by keyword
  - later, embedding retrieval

3) Model provider stability and error handling
- Gemma was removed, but other models can fail occasionally.
- Needed: graceful behavior when one model fails:
  - continue with remaining models
  - show clear error details in UI for the failed model only
  - optionally auto-disable persistently failing models

4) Possible duplicate model queries
- In some logs, each model appeared to be called twice.
- Could be UI double-send, dev-mode behavior, or retries.
- Needed: confirm whether Stage 1 is invoked once per message in normal flow.

5) Web search integration is optional and not the current focus
- Keep as a future enhancement, not required for doc upload stability.

## 11) Parking lot (future enhancements)

Documents and retrieval:
- Add document list endpoint:
  GET /api/conversations/{id}/documents
  returns filenames, sizes, timestamps
- Show uploaded doc list in UI, per conversation.
- Add a per-message toggle:
  "Use uploaded docs"
- Add doc chunking and retrieval:
  - embeddings
  - vector store
  - citations pointing to file and chunk

Model configuration and UX:
- UI for configuring:
  - council members list
  - chairman model
  - stage execution mode
- Better labeling and status:
  - show which models ran
  - show which failed and why
  - show timings per stage and per model

Reliability:
- Improve logging:
  - log uploads saved path and bytes
  - log document loader: which files loaded, how many characters included
- Add request ids to link frontend request to backend logs.

Packaging:
- Longer term: rename folders to consilium/, consolidate v2 and v3, reduce drift from upstream.
- Document which files differ from upstream LLM Council.

## 12) Current “known good” end-to-end test

Goal: prove upload and usage works.

1) Create new conversation.
2) Upload a .txt file (not docx).
3) Confirm Chrome console shows Upload success with conversationId.
4) Confirm file exists in:
   data/uploads/<conversationId>/
5) Ask:
   “Summarize the uploaded <filename>. Start with one short direct quote from the file.”
6) Expect:
   - council members respond
   - chairman synthesizes
   - the quote appears in the first sentence

## 13) Notes about what changed recently

- Frontend upload wiring now posts to the correct endpoint and logs upload success.
- UI label updated to reduce chairman confusion.
- Gemma removed from council due to repeated provider errors.
- Debug prints were temporarily added in backend/openrouter.py during investigation.
  These should be removed or gated behind a debug flag later.

## 14) Where we were at the end of this session

State:
- Upload works and files persist per conversation.
- Council runs with Claude Opus, GPT-5, Grok.
- Chairman runs with Sonar Pro.
- Doc usage confirmed for .txt files.
- Docx parsing not implemented yet.

Next most valuable step:
- Implement docx parsing in the document loader so uploaded Word docs can be summarized and cited accurately.
