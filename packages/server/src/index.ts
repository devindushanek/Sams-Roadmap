import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import express from 'express';
import cors from 'cors';
import { ingestFile, ingestDirectory } from './services/ingestion';
import { db } from './db';
import { documents, tasks } from './db/schema';
import ollama from 'ollama';
import { vectorStore } from './services/vectorStore';

import { taskExecutor } from './services/executor';
import { workflowManager } from './services/workflow';

import path from 'path';

// Load .env explicitly
const envPath = path.resolve(__dirname, '../.env');
console.log(`Loading .env from ${envPath}`);
dotenv.config({ path: envPath });
// Fallback
dotenv.config();

process.on('uncaughtException', (err) => {
    fs.writeFileSync('error.log', `Uncaught Exception: ${err}\n`);
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    fs.writeFileSync('error.log', `Unhandled Rejection: ${reason}\n`);
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

console.log('Starting server...');
console.log('SERVER VERSION 2.0 - DEBUGGING ACTIVE');

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

import { googleRouter } from './routes/google';
app.use('/google', googleRouter);

import { systemRouter } from './routes/system';
app.use('/system', systemRouter);

import socialRouter from './routes/social';
app.use('/social', socialRouter);

import { gmailRouter } from './routes/gmail';
app.use('/gmail', gmailRouter);


app.get('/', (req, res) => {
    res.send('Antigravity Server is running');
});

app.get('/debug/env', (req, res) => {
    res.json({
        cwd: process.cwd(),
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing',
        envPath: process.env.ENV_PATH || 'N/A'
    });
});

app.post('/ingest', async (req, res) => {
    // Support both filePath (new) and path (old) to be robust
    const filePath = req.body.filePath || req.body.path;
    const type = req.body.type;

    try {
        console.log('Ingest request body:', req.body);

        if (!filePath) {
            throw new Error(`Missing filePath. Received body: ${JSON.stringify(req.body)}, Content-Type: ${req.headers['content-type']}`);
        }

        if (type === 'directory') {
            console.log(`Ingesting directory: ${filePath}`);
            const results = await ingestDirectory(filePath);
            res.json({
                success: true,
                count: results.length,
                results,
                debug: {
                    receivedPath: filePath,
                    receivedBody: req.body,
                    cwd: process.cwd()
                }
            });
        } else {
            const result = await ingestFile(filePath);
            res.json({ success: true, result });
        }
    } catch (error: any) {
        console.error('Ingestion error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            debug: {
                receivedBody: req.body,
                headers: req.headers
            }
        });
    }
});

app.get('/documents', async (req, res) => {
    try {
        const docs = await db.select().from(documents);
        res.json({ success: true, documents: docs });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Task Executor
try {
    taskExecutor.start();
} catch (e) {
    console.error('Failed to start task executor:', e);
}

app.get('/tasks', async (req, res) => {
    try {
        const allTasks = await db.select().from(tasks).orderBy(tasks.createdAt);
        res.json({ success: true, tasks: allTasks });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.post('/chat', async (req, res) => {
    const { message, history } = req.body;
    try {
        // 1. Retrieve relevant context
        const contextDocs = await vectorStore.search(message, 5);
        const context = contextDocs.map((d: any) => `[Source: ${d.metadata.filename || d.id}]\n${d.content}`).join('\n\n');

        // 2. Generate Response
        let responseText = '';

        // Try Ollama
        try {
            const systemPrompt = `You are an intelligent assistant with access to the user's knowledge base. 
            Use the following context to answer the user's question. 
            If the answer is not in the context, say so, but you can use your general knowledge to help if appropriate.
            Always cite your sources using [Source: filename].
            
            Context:
            ${context}`;

            const response = await (ollama as any).chat({
                model: process.env.OLLAMA_MODEL || 'llama3',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...history || [],
                    { role: 'user', content: message }
                ]
            });
            responseText = response.message.content;
        } catch (e) {
            console.warn('Ollama chat failed, trying Gemini...', e);
            // Fallback to Gemini
            if (process.env.GOOGLE_GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-pro" });

                const prompt = `Context: ${context}\n\nUser: ${message}`;
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
            } else {
                throw new Error('No LLM provider available.');
            }
        }

        res.json({
            success: true,
            response: responseText,
            sources: contextDocs.map((d: any) => ({
                id: d.id,
                filename: d.metadata.filename,
                score: d.score
            }))
        });

    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Diagnostic endpoint to check which LLM provider is configured
app.get('/model-info', (req, res) => {
    const hasServiceAccount = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const hasApiKey = !!process.env.GOOGLE_GEMINI_API_KEY;
    const provider = hasServiceAccount ? 'Vertex AI (Service Account)' :
        hasApiKey ? 'Gemini API (Personal Key)' :
            'Ollama (Local)';

    res.json({
        success: true,
        provider,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        hasServiceAccount,
        hasApiKey,
        project: process.env.GOOGLE_CLOUD_PROJECT || 'N/A',
        location: process.env.GOOGLE_CLOUD_LOCATION || 'N/A'
    });
});



console.log('Attempting to start server on port ' + port);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

setInterval(() => { }, 1000); // Keep process alive
