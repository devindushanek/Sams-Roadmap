import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', 'sqlite.db');
console.log(`Opening database at ${dbPath}`);
const db = new Database(dbPath);

const queries = [
    `CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        metadata TEXT,
        embedding TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority INTEGER DEFAULT 0,
        result TEXT,
        plan TEXT,
        error TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        definition TEXT NOT NULL,
        trigger TEXT,
        active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS social_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        platform_post_id TEXT NOT NULL,
        author_id TEXT,
        author_name TEXT,
        author_avatar TEXT,
        title TEXT,
        description TEXT,
        content TEXT,
        media TEXT,
        url TEXT,
        posted_at INTEGER,
        fetched_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        engagement TEXT,
        is_saved INTEGER DEFAULT 0,
        saved_at INTEGER,
        tags TEXT,
        category TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS social_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL UNIQUE,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at INTEGER,
        scope TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS curated_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        account_id TEXT NOT NULL,
        account_name TEXT NOT NULL,
        account_avatar TEXT,
        category TEXT,
        priority INTEGER DEFAULT 3,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )`
];

console.log('Running manual migration...');

for (const query of queries) {
    try {
        db.prepare(query).run();
        console.log('Executed query successfully');
    } catch (error) {
        console.error('Error executing query:', error);
        console.error('Query:', query);
    }
}

console.log('Migration complete.');
db.close();
