# Next Steps — ConsiliumAI

Last updated: 2026-02-26

---

## Immediate: Validate the installer fix for Bruce

Bruce got an error on first install:
> "Failed to execute script 'launcher' due to unhandled exception: Unable to configure formatter 'default'"

**Root cause:** PyInstaller's `console=False` sets `sys.stdout/stderr` to `None`. Uvicorn crashes calling `.isatty()` on startup.

**Fix applied:** `launcher.py` now redirects stdout/stderr to `%APPDATA%\ConsiliumAI\consilium.log` before uvicorn starts. Committed (c39e4f0) and pushed.

### Steps to validate before sending to Bruce:

1. **Uninstall current version**
   - Windows Settings → Apps → ConsiliumAI → Uninstall

2. **Run the new installer**
   - `installer/ConsiliumAI_Setup.exe` (already rebuilt and in the repo)
   - Or download from the same link you sent Bruce

3. **Confirm it works**
   - Browser should open automatically after ~10 seconds
   - App should load at http://localhost:8001
   - No error dialog

4. **If it works → tell Bruce to reinstall**
   - Same download link: https://github.com/warrenzachary/llm-council-plus-v3/raw/cc/autonomous-20260217/installer/ConsiliumAI_Setup.exe
   - He should uninstall first (Windows Settings → Apps → ConsiliumAI → Uninstall), then run the new installer

5. **If it fails → check the log**
   - Log file is at: `%APPDATA%\ConsiliumAI\consilium.log`
   - Share the contents with Claude Code to diagnose

---

## After Bruce is up and running

- Visual polish pass (deferred multiple sessions, still not blocking)
- Any issues that come up from Bruce's usage

---

## Reference

- Download link for Bruce: https://github.com/warrenzachary/llm-council-plus-v3/raw/cc/autonomous-20260217/installer/ConsiliumAI_Setup.exe
- Branch: cc/autonomous-20260217
- Last commit: c39e4f0
