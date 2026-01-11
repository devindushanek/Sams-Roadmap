const fs = require('fs');
const path = 'src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

// Indices are 0-based, so line N is index N-1.

// 1. Extract Mockups (Lines 653-852)
// Index 652 to 851 (inclusive)
// slice(start, end) where end is exclusive -> 652, 852
const mockups = lines.slice(652, 852);

const log = (msg) => fs.appendFileSync('refactor.log', msg + '\\n');
log('Extracted ' + mockups.length + ' lines of mockups.');
log('First line: ' + mockups[0]);
log('Last line: ' + mockups[mockups.length - 1]);

// 2. Identify deletion range (Lines 651-900)
// Index 650 to 899 (inclusive)
// splice(start, deleteCount)
// deleteCount = 899 - 650 + 1 = 250
const deleteStart = 650;
const deleteCount = 250;

log('Deleting lines ' + (deleteStart + 1) + ' to ' + (deleteStart + deleteCount));
log('Line to delete start: ' + lines[deleteStart]);
log('Line to delete end: ' + lines[deleteStart + deleteCount - 1]);

lines.splice(deleteStart, deleteCount);

// 3. Find insertion point (const EditorView =)
const editorViewIndex = lines.findIndex(l => l.includes('const EditorView ='));
log('Found EditorView at line ' + (editorViewIndex + 1));

if (editorViewIndex === -1) {
    log('Could not find EditorView!');
    process.exit(1);
}

// 4. Insert Mockups
// Insert before EditorView
lines.splice(editorViewIndex, 0, ...mockups);
lines.splice(editorViewIndex, 0, ""); // Add a blank line

// 5. Write back
fs.writeFileSync(path, lines.join('\\n'));
log('Done!');
