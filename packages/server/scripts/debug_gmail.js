const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

async function testGmail() {
    console.log('Testing Gmail Service (JS)...');

    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        fs.writeFileSync('gmail_result.json', JSON.stringify({ error: 'Missing credentials' }));
        return;
    }

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        console.log('Listing messages...');
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 5,
        });

        const messages = response.data.messages || [];
        const result = {
            count: messages.length,
            messages: messages,
            firstEmail: null
        };

        if (messages.length > 0) {
            const msg = await gmail.users.messages.get({
                userId: 'me',
                id: messages[0].id,
                format: 'full',
            });

            const headers = msg.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value;
            result.firstEmail = { subject };
        }

        fs.writeFileSync('gmail_result.json', JSON.stringify(result, null, 2));

    } catch (error) {
        fs.writeFileSync('gmail_result.json', JSON.stringify({
            error: error.message,
            details: error.response ? error.response.data : null
        }, null, 2));
    }
}

testGmail();
