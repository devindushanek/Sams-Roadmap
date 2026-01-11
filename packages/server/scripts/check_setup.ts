import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

console.log('--- Glyph Google Integration Diagnostic ---');

// 1. Check .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    console.log('✅ .env file found at:', envPath);
    dotenv.config({ path: envPath });
} else {
    console.error('❌ .env file NOT found at:', envPath);
    process.exit(1);
}

// 2. Check Variables
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientId) {
    console.log('✅ GOOGLE_CLIENT_ID found:', clientId.substring(0, 15) + '...');
} else {
    console.error('❌ GOOGLE_CLIENT_ID is MISSING in .env');
}

if (clientSecret) {
    console.log('✅ GOOGLE_CLIENT_SECRET found.');
} else {
    console.error('❌ GOOGLE_CLIENT_SECRET is MISSING in .env');
}

// 3. Generate URL
if (clientId && clientSecret) {
    try {
        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            'http://localhost:3000/oauth2callback'
        );

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/tasks.readonly'],
            prompt: 'consent'
        });

        console.log('\nGenerated Auth URL:');
        console.log(url);

        if (url.includes(`client_id=${clientId}`)) {
            console.log('\n✅ URL contains correct client_id.');
        } else {
            console.error('\n❌ URL is MISSING client_id!');
        }
    } catch (e) {
        console.error('❌ Error generating URL:', e);
    }
}

console.log('\n--- End Diagnostic ---');
