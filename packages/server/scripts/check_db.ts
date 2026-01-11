import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', 'sqlite.db');
console.log(`Checking database at ${dbPath}`);
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.map((t: any) => t.name));

const requiredTables = ['tasks', 'social_posts', 'social_tokens'];
const missing = requiredTables.filter(t => !tables.some((row: any) => row.name === t));

if (missing.length > 0) {
    console.error('MISSING TABLES:', missing);
} else {
    console.log('ALL REQUIRED TABLES PRESENT.');
}
