# InDesign ExtendScript API Reference

## Quick Reference for Thesis Automation

### Document Object Model (DOM) Basics

```javascript
// Get active document
var doc = app.activeDocument;

// Get all pages
var pages = doc.pages;

// Get specific page
var page = doc.pages[0]; // First page
var page = doc.pages.item("1"); // By name

// Get all page items on a page
var items = page.allPageItems;
```

### Text Frames

```javascript
// Create text frame
var frame = page.textFrames.add({
    geometricBounds: [top, left, bottom, right], // in points
    contents: "Text content"
});

// Check for overset
if (frame.overflows) {
    // Handle overset text
}

// Get parent story
var story = frame.parentStory;

// Apply paragraph style
var style = doc.paragraphStyles.itemByName("Body Text");
frame.parentStory.paragraphs.everyItem().appliedParagraphStyle = style;
```

### Styles

```javascript
// Paragraph styles
doc.allParagraphStyles // All styles including nested
doc.paragraphStyles // Top-level only

// Character styles
doc.allCharacterStyles
doc.characterStyles

// Apply style
paragraph.appliedParagraphStyle = style;
```

### Links and Images

```javascript
// All links
doc.links

// Check link status
link.status === LinkStatus.LINK_MISSING
link.status === LinkStatus.LINK_OUT_OF_DATE
link.status === LinkStatus.NORMAL

// Get image resolution
var graphic = link.parent;
var ppi = graphic.effectivePpi; // [horizontalPpi, verticalPpi]
```

### Footnotes and Endnotes

```javascript
// All footnotes
doc.footnotes

// Footnote content
footnote.contents

// Create footnote (requires insertion point)
var footnote = insertionPoint.footnotes.add();
footnote.texts[0].contents = "Footnote text";
```

### Document Preferences

```javascript
// Page dimensions
doc.documentPreferences.pageWidth
doc.documentPreferences.pageHeight

// Bleed
doc.documentPreferences.documentBleedTopOffset
doc.documentPreferences.documentBleedBottomOffset
doc.documentPreferences.documentBleedInsideOrLeftOffset
doc.documentPreferences.documentBleedOutsideOrRightOffset

// Facing pages
doc.documentPreferences.facingPages
```

### Master Spreads

```javascript
// All master spreads
doc.masterSpreads

// Apply master to page
page.appliedMaster = doc.masterSpreads.itemByName("A-Master");

// Remove master
page.appliedMaster = NothingEnum.NOTHING;
```

### Layers

```javascript
// All layers
doc.layers

// Layer properties
layer.visible
layer.locked
layer.name

// Unlock layer
layer.locked = false;
```

### Tables

```javascript
// Find tables in story
var tables = story.tables;

// Table properties
table.rows.length
table.columns.length
table.cells

// Cell content
cell.contents
```

### Find/Change

```javascript
// Find text
app.findTextPreferences = NothingEnum.NOTHING;
app.changeTextPreferences = NothingEnum.NOTHING;
app.findTextPreferences.findWhat = "search term";
var found = doc.findText();

// Change text
app.changeTextPreferences.changeTo = "replacement";
doc.changeText();
```

### Export

```javascript
// Export to PDF
doc.exportFile(ExportFormat.PDF_TYPE, File("path/to/output.pdf"));

// With preset
var preset = app.pdfExportPresets.itemByName("[Press Quality]");
app.pdfExportPreferences.pdfExportPresetToUse = preset;
```

### Script Execution via COM (Windows)

```powershell
# PowerShell COM automation
$indesign = New-Object -ComObject InDesign.Application
$indesign.DoScript($scriptContent, 1246973031) # idJavaScript
```

### Common Issues and Solutions

#### Overset Text
```javascript
// Check and fix
if (frame.overflows) {
    // Method 1: Reduce tracking
    frame.parentStory.paragraphs.everyItem().tracking = -10;
    
    // Method 2: Expand frame
    var bounds = frame.geometricBounds;
    bounds[2] += 12; // Expand bottom by 12pt
    frame.geometricBounds = bounds;
}
```

#### Missing Fonts
```javascript
// Find missing fonts
for (var i = 0; i < doc.fonts.length; i++) {
    if (doc.fonts[i].status === FontStatus.NOT_AVAILABLE) {
        // Log or substitute
    }
}
```

#### RGB to CMYK
```javascript
// Check color space
if (swatch.space === ColorSpace.RGB) {
    // Warning: convert to CMYK for print
}
```

---
*Last updated: Auto-generated*
*Source: http://www.indesignjs.de/extendscriptAPI/indesign-latest/*
