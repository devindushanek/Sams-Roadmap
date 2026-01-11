const Database = require('better-sqlite3');
const path = require('path');

// Create database in the server root directory (same level as src/ and dist/)
const dbPath = path.join(__dirname, '..', 'sqlite.db');
console.log(`Creating database at: ${dbPath}`);

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

console.log('✓ Database initialized successfully at:', dbPath);
db.close();
