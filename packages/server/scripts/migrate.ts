import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../sqlite.db');
console.log(`Migrating database at: ${dbPath}`);

const db = new Database(dbPath);

// Documents Table
db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        metadata TEXT,
        embedding TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
`);

// Check if embedding column exists, if not add it
try {
    const columns = db.pragma('table_info(documents)');
    const hasEmbedding = columns.some((col: any) => col.name === 'embedding');
    if (!hasEmbedding) {
        console.log('Adding missing embedding column to documents table...');
        db.exec('ALTER TABLE documents ADD COLUMN embedding TEXT');
    }
} catch (e) {
    console.error('Error checking/altering documents table:', e);
}

// Tasks Table
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

// Workflows Table
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

console.log('Migration complete.');
