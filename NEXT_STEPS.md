# Next Steps — ConsiliumAI

Last updated: 2026-02-26

---

## Immediate: Warren tests installer, then sends to Bruce

All fixes and features are built into the current installer. Steps:

1. **Kill any running ConsiliumAI** (Claude Code can do this)
2. **Uninstall current version** — Windows Settings → Apps → ConsiliumAI → Uninstall
3. **Run new installer** — `installer/ConsiliumAI_Setup.exe`
4. **Confirm:**
   - Browser opens after ~6 seconds
   - App loads at http://localhost:8001
   - Settings → Council Config shows tier badges on model dropdowns
   - No error dialog
5. **Send Bruce the link:**
   - https://github.com/warrenzachary/llm-council-plus-v3/raw/cc/autonomous-20260217/installer/ConsiliumAI_Setup.exe
   - Ask him to uninstall first, then reinstall
   - Use the email draft from this session (already has instructions)

**If app fails to start → check log at:** `%APPDATA%\ConsiliumAI\consilium.log`

---

## What's in the current installer (last build: 2026-02-26, commit 135a294)

- Fix: uvicorn crash on first launch (stdout/stderr redirect to log file)
- Fix: browser opens after 6s delay (was 2s — too fast on some machines)
- Feat: model recommendation tier badges in Council Config dropdowns
  - ⭐ Best Quality / 💰 Good Value / ⚠️ Limited / ○ Unrated
  - Different tiers for council member vs chairman roles
  - "⭐ Recommended only" filter toggle on each dropdown
  - Perplexity Sonar models included

---

## After Bruce is confirmed working

- Walk Bruce through first-time setup (council config, API key) — manual walkthrough
- Visual polish pass (deferred multiple sessions, still not blocking)
- Monitor for any issues from Bruce's usage

---

## Reference

- Download link: https://github.com/warrenzachary/llm-council-plus-v3/raw/cc/autonomous-20260217/installer/ConsiliumAI_Setup.exe
- Branch: cc/autonomous-20260217
- Last installer commit: 135a294
- Model recommendations file: frontend/src/data/modelRecommendations.js
- Shareable CSV: Model Recommendations.csv (project root)
