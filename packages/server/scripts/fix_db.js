const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../sqlite.db');
console.log(`Reparing database at: ${dbPath}`);

const db = new Database(dbPath);

console.log('1. Creating/Verifying "tasks" table...');
db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority INTEGER DEFAULT 0,
        result TEXT,
        plan TEXT,
        error TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
`);

console.log('2. Creating/Verifying "documents" table...');
db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        metadata TEXT,
        embedding TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
`);

// Double check embedding column
try {
    const columns = db.pragma('table_info(documents)');
    const hasEmbedding = columns.some((col) => col.name === 'embedding');
    if (!hasEmbedding) {
        console.log('  - Adding missing "embedding" column to documents table...');
        db.exec('ALTER TABLE documents ADD COLUMN embedding TEXT');
    } else {
        console.log('  - "embedding" column exists.');
    }
} catch (e) {
    console.error('  - Error checking documents table:', e);
}

console.log('3. Creating/Verifying "workflows" table...');
db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        definition TEXT NOT NULL,
        trigger TEXT,
        active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
`);

console.log('Database repair complete.');
