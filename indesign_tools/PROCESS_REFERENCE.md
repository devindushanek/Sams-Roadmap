# InDesign Thesis Automation: Process Reference & State Log

**Project:** Thesis Book Finalization  
**Last Updated:** 2026-01-08  
**Status:** 🟡 Setup & Initialization

---

## 1. Critical Context for New Agents
**If you are a new agent picking up this task, READ THIS FIRST.**

*   **Goal:** Finalize layout, citations, and front/back matter for a thesis book in InDesign.
*   **Method:** We use local ExtendScript (.jsx) files executed via PowerShell and COM automation.
*   **Key Constraint:** InDesign **MUST** be running with the thesis document open for any script to work.
*   **Safety:** Always run the `version_control.jsx` script before making changes.

## 2. File Locations
*   **Workspace Root:** `c:\Users\devin\Documents\Professional\DevLabs\AI Agent Workspace`
*   **Toolbox:** `indesign_tools\` (Contains all .jsx scripts)
*   **Document Path:** `C:\Users\devin\Desktop\Thesis recent\Thesis Book 2025-07-02.indd`
*   **Scripts Path:** `C:\Users\devin\AppData\Roaming\Adobe\InDesign\Version 20.0\en_US\Scripts\Scripts Panel`
*   **Workflows:** `.agent\workflows\indesign-thesis.md`
*   **Backups:** `[Document_Path]\_backups\` (Created automatically)

## 3. Automation State

### Current Phase: Phase 1 - Document Analysis
*   [x] Infrastructure Setup
*   [x] Connection Verified
*   [x] Initial Document Scan
*   [x] Safety Snapshot Created
*   [x] Gap Analysis
*   [x] Citation Scan
*   [ ] **Visual Audit** (Pending User Run)

### Next Actions Required
1.  **User Action:** Run `visual_audit.jsx` in InDesign.
2.  **User Action:** Confirm to agent.
3.  Agent will generate "Unfinished Areas" report.

## 4. Version Control Log
*Track all automated snapshots here.*

| Timestamp | Snapshot Name | Triggered By | Notes |
|-----------|---------------|--------------|-------|
| | | | |

## 5. Script Inventory & Status

| Script | Status | Last Verified | Notes |
|--------|--------|---------------|-------|
| `core\document_info.jsx` | ⚠️ Untested | | Extracts doc metadata |
| `core\version_control.jsx` | ⚠️ Untested | | Creates backups |
| `core\find_gaps.jsx` | ⚠️ Untested | | Finds empty frames |
| `core\citation_scanner.jsx` | ⚠️ Untested | | Checks citations |
| `core\fix_overset.jsx` | ⚠️ Untested | | Fixes text overflow |
| `core\print_preflight.jsx` | ⚠️ Untested | | Checks bleed/fonts |

## 6. Known Issues / Gaps
*   **InDesign COM Connection:** The PowerShell runner returns exit code 1 if InDesign is not running.
    *   *Fix:* Ensure InDesign is open before running scripts.
*   **Document Path:** We do not yet have the absolute path to the specific thesis `.indd` file.

---

## 7. Handover Instructions
To resume work:
1.  Read this file to check the last status.
2.  Check `indesign_tools\progress_report.md` for detailed task tracking.
3.  Verify InDesign is running.
4.  Continue with the next unchecked item in "Next Actions Required".
