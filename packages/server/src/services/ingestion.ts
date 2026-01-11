import fs from 'fs/promises';
import path from 'path';
// @ts-ignore
const pdf = require('pdf-parse');
import { db } from '../db';
import { documents } from '../db/schema';
import { understandingService } from './understanding';

export async function ingestFile(filePath: string) {
    try {
        const absolutePath = path.resolve(filePath);
        const stats = await fs.stat(absolutePath);
        const extension = path.extname(filePath).toLowerCase();
        let content = '';

        if (extension === '.pdf') {
            const dataBuffer = await fs.readFile(absolutePath);

            // Handle pdf-parse v2.4.5+ (Class based) vs v1.x (Function based)
            let PDFParseClass = pdf.PDFParse;
            if (!PDFParseClass && pdf.default && pdf.default.PDFParse) {
                PDFParseClass = pdf.default.PDFParse;
            }

            if (typeof PDFParseClass === 'function') {
                // v2.x API
                const parser = new PDFParseClass({ data: dataBuffer });
                const result = await parser.getText();
                content = result.text;
            } else {
                // Fallback to v1.x API
                const parsePdf = typeof pdf === 'function' ? pdf : pdf.default;
                if (typeof parsePdf !== 'function') {
                    throw new Error(`pdf-parse library not loaded correctly. Keys: ${Object.keys(pdf).join(', ')}`);
                }
                const data = await parsePdf(dataBuffer);
                content = data.text;
            }
        } else {
            content = await fs.readFile(absolutePath, 'utf-8');
        }

        const metadata = {
            filename: path.basename(filePath),
            path: absolutePath,
            size: stats.size,
            extension: extension,
        };

        const result = await db.insert(documents).values({
            content,
            metadata: JSON.stringify(metadata),
        }).returning();

        // Trigger async understanding process
        console.log(`Triggering understanding for doc ${result[0].id}`);
        understandingService.processDocument(result[0].id).catch(err =>
            console.error(`Error processing document ${result[0].id}:`, err)
        );

        console.log(`Ingested file: ${filePath}`);
        return result[0];
    } catch (error) {
        console.error(`Error ingesting file ${filePath}:`, error);
        throw error;
    }
}

export async function ingestDirectory(dirPath: string) {
    const results: any[] = [];
    // Hardcode path to ensure we can find it
    const logPath = 'c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/ingestion_debug.log';
    await fs.writeFile(logPath, `Starting ingestion for: ${dirPath}\n`);

    async function log(message: string) {
        await fs.appendFile(logPath, message + '\n');
    }

    async function traverse(currentPath: string) {
        try {
            await log(`Scanning: ${currentPath}`);
            const files = await fs.readdir(currentPath);

            for (const file of files) {
                const fullPath = path.join(currentPath, file);
                try {
                    const stats = await fs.stat(fullPath);

                    if (stats.isDirectory()) {
                        if (file !== 'node_modules' && !file.startsWith('.')) {
                            await traverse(fullPath);
                        } else {
                            await log(`Skipping directory: ${file}`);
                        }
                    } else if (stats.isFile()) {
                        const ext = path.extname(file).toLowerCase();
                        await log(`Found file: ${file} (${ext})`);
                        if (['.md', '.txt', '.ts', '.tsx', '.js', '.jsx', '.json', '.pdf'].includes(ext)) {
                            try {
                                results.push(await ingestFile(fullPath));
                                await log(`Ingested: ${file}`);
                            } catch (e) {
                                await log(`Failed to ingest ${fullPath}: ${e}`);
                                console.error(`Failed to ingest ${fullPath}`, e);
                            }
                        } else {
                            await log(`Skipping extension: ${ext}`);
                        }
                    }
                } catch (statErr) {
                    await log(`Stat error for ${fullPath}: ${statErr}`);
                }
            }
        } catch (err) {
            await log(`Error scanning ${currentPath}: ${err}`);
        }
    }

    await traverse(dirPath);
    await log(`Ingestion complete. Found ${results.length} files.`);
    return results;
}
