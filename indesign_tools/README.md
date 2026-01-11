# InDesign Thesis Automation Tools

A comprehensive toolkit for automating thesis book finalization in Adobe InDesign.

## Directory Structure

```
indesign_tools/
├── run_script.ps1          # PowerShell script runner for Windows
├── api_reference.md        # ExtendScript API quick reference
├── progress_report.md      # Current session progress tracking
├── README.md               # This file
└── core/                   # Core automation scripts
    ├── document_info.jsx       # Extract document metadata
    ├── find_gaps.jsx           # Find empty frames & placeholders
    ├── citation_scanner.jsx    # Scan citations & footnotes
    ├── front_matter_generator.jsx  # TOC structure scanner
    ├── generate_toc.jsx        # Generate Table of Contents
    ├── list_of_figures.jsx     # Generate List of Figures/Tables
    ├── print_preflight.jsx     # Print readiness check
    ├── fix_overset.jsx         # Fix overset text issues
    └── visual_audit.jsx        # Check widows, orphans, gutter
```

## Quick Start

### Prerequisites
1. Adobe InDesign (CC 2018 or later recommended)
2. PowerShell (Windows)
3. Your thesis document open in InDesign

### Running Scripts

**Via PowerShell:**
```powershell
# Run any script
.\run_script.ps1 -ScriptPath ".\core\document_info.jsx"

# With specific document
.\run_script.ps1 -ScriptPath ".\core\find_gaps.jsx" -DocumentPath "C:\path\to\thesis.indd"
```

**Directly in InDesign:**
1. Open InDesign
2. Go to Window > Utilities > Scripts
3. Right-click on "User" folder
4. Click "Reveal in Explorer"
5. Copy desired .jsx files there
6. Double-click to run

## Script Descriptions

### Analysis Scripts

| Script | Purpose |
|--------|---------|
| `document_info.jsx` | Extracts comprehensive document info (pages, styles, fonts, colors) |
| `find_gaps.jsx` | Identifies empty frames, placeholder text, overset text, missing images |
| `citation_scanner.jsx` | Scans for citations, footnotes, bibliography; detects style inconsistencies |
| `visual_audit.jsx` | Checks for widows/orphans, gutter proximity issues, layout problems |
| `print_preflight.jsx` | Verifies print readiness: bleed, fonts, images, colors |

### Generation Scripts

| Script | Purpose |
|--------|---------|
| `front_matter_generator.jsx` | Scans document structure for front matter generation |
| `generate_toc.jsx` | Creates Table of Contents from paragraph styles |
| `list_of_figures.jsx` | Generates List of Figures and List of Tables |

### Fix Scripts

| Script | Purpose |
|--------|---------|
| `fix_overset.jsx` | Attempts to fix overset text via tracking, leading, frame expansion |

### Safety & Version Control

| Script | Purpose |
|--------|---------|
| `version_control.jsx` | Creates a timestamped snapshot of the active document in `_backups/` |

**Note:** The workflow automatically runs `version_control.jsx` before any major phase to ensure you can always revert changes.

## Workflow

### Recommended Order

1. **Document Analysis**
   - Run `document_info.jsx` → Understand document state
   - Run `find_gaps.jsx` → Identify what needs attention

2. **Content Verification**
   - Run `citation_scanner.jsx` → Verify citations
   - Review and fix any citation issues manually

3. **Front/Back Matter**
   - Run `front_matter_generator.jsx` → Scan structure
   - Run `generate_toc.jsx` → Build TOC
   - Run `list_of_figures.jsx` → Build figure/table lists

4. **Layout Fixes**
   - Run `fix_overset.jsx` → Auto-fix overset issues
   - Run `visual_audit.jsx` → Check for layout problems

5. **Final Check**
   - Run `print_preflight.jsx` → Verify print readiness
   - Address any remaining errors/warnings

## Output Format

All scripts return JSON for easy parsing:

```json
{
  "status": "PASS|WARNING|FAIL",
  "summary": { ... },
  "details": [ ... ],
  "errors": [ ... ]
}
```

## Customization

Most scripts have a `config` object at the top that can be modified:

```javascript
var config = {
    // Style names to look for
    tocStyles: [
        { styleName: "Chapter Title", level: 1 },
        { styleName: "Section Title", level: 2 }
    ],
    // Other settings...
};
```

Modify these to match your document's paragraph style names.

## Troubleshooting

### Script doesn't run
- Ensure InDesign is open with a document
- Check that the script path is correct
- Try running directly from InDesign Scripts panel

### COM object fails (Windows)
- Run PowerShell as Administrator
- Ensure InDesign is running before executing
- Check Windows Event Viewer for COM errors

### Missing styles
- Update the `config` object in scripts to match your document's style names
- Use `document_info.jsx` to see available styles

## API Reference

See `api_reference.md` for ExtendScript API quick reference.

## License

MIT - Use freely for thesis automation
