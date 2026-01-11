
import { ingestDirectory } from './src/services/ingestion';
import { db } from './src/db';
import { documents } from './src/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const logFile = path.resolve(__dirname, 'verification_result.txt');
function log(msg: string) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function verifyIngestion() {
    fs.writeFileSync(logFile, 'STARTING VERIFICATION\n');

    // Initialize DB Schema
    log('Initializing database schema...');
    const sqlite = new Database('sqlite.db');
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            metadata TEXT,
            created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
    `);
    log('Database schema initialized.');

    const targetPath = 'D:\\Reference\\Structure';
    log(`Starting verification for: ${targetPath}`);

    try {
        // 1. Run Ingestion
        log('Running ingestDirectory...');
        const results = await ingestDirectory(targetPath);
        log(`Ingestion complete. Files processed: ${results.length}`);

        if (results.length === 0) {
            log('FAILED: No files were ingested.');
            process.exit(1);
        }

        // 2. Verify Database
        log('Verifying database records...');
        // Check for a specific known PDF file from the logs
        const knownFile = 'Designing Structure_Final.pdf';
        const allDocs = await db.select().from(documents);
        const foundDoc = allDocs.find(d => {
            const meta = JSON.parse(d.metadata as string);
            return meta.filename === knownFile;
        });

        if (foundDoc) {
            log(`SUCCESS: Found "${knownFile}" in database.`);
            log(`Document ID: ${foundDoc.id}`);
            log(`Content Preview: ${foundDoc.content.substring(0, 100)}...`);
        } else {
            log(`FAILED: Could not find "${knownFile}" in database.`);
            log(`Files in DB: ${allDocs.map(d => JSON.parse(d.metadata as string).filename).join(', ')}`);
            process.exit(1);
        }

    } catch (error) {
        log(`Verification failed with error: ${error}`);
        process.exit(1);
    }
}

verifyIngestion();
