import { google } from 'googleapis';
import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import open from 'open';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = 'http://localhost:3005/google/callback';

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/tasks.readonly',
    'https://www.googleapis.com/auth/youtube.readonly',
];

const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
});

console.log('\n=== Google OAuth - Calendar, Tasks & YouTube ===');
fs.writeFileSync('auth_link.txt', authUrl);
console.log('Auth URL written to auth_link.txt');
console.log('2. Authorize the app.');
console.log('3. You will be redirected to http://localhost:3005/google/callback?code=...');
console.log('4. Copy the "code" parameter from the URL.');
console.log('   (The page might show "Unable to connect", that is fine, just copy the code)');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('\nPaste the code here: ', async (code: string) => {
    try {
        const { tokens } = await oauth2.getToken(code.trim());
        const refresh = tokens.refresh_token;

        if (!refresh) {
            console.error('\nError: No refresh token returned. You might have already authorized the app. Go to https://myaccount.google.com/permissions and remove the app, then try again.');
        } else {
            const envPath = path.resolve(__dirname, '..', '.env');
            // Read existing env
            let envContent = fs.readFileSync(envPath, 'utf8');

            // Replace or append
            if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
                envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/, `GOOGLE_REFRESH_TOKEN=${refresh}`);
            } else {
                envContent += `\nGOOGLE_REFRESH_TOKEN=${refresh}\n`;
            }

            fs.writeFileSync(envPath, envContent);
            console.log('\n✓ Refresh token saved to .env');
        }
    } catch (e) {
        console.error('\nFailed to exchange code:', e);
    } finally {
        readline.close();
        process.exit(0);
    }
});
