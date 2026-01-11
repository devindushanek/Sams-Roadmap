import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading from multiple possible locations to be safe
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // If running from dist/services or src/services
dotenv.config(); // Fallback to default

console.log('DEBUG: GoogleService initializing...');
console.log('DEBUG: CWD:', process.cwd());
console.log('DEBUG: GOOGLE_CLIENT_ID present:', !!process.env.GOOGLE_CLIENT_ID);

export class GoogleService {
    private oauth2Client!: OAuth2Client;
    private calendar: any;
    private tasks: any;
    private isAuthenticated: boolean = false;

    constructor() {
        // Lazy initialization
    }

    public ensureInitialized() {
        if (this.oauth2Client) return;

        const possiblePaths = [
            path.resolve(process.cwd(), '.env'),
            path.resolve(process.cwd(), 'packages/server/.env'),
            path.resolve(__dirname, '../../.env'),
            path.resolve(__dirname, '../../../.env')
        ];

        console.log('DEBUG: Attempting to load .env from:', possiblePaths);

        for (const p of possiblePaths) {
            if (process.env.GOOGLE_CLIENT_ID) break; // Already loaded
            const result = dotenv.config({ path: p });
            if (!result.error && result.parsed) {
                console.log(`DEBUG: Successfully loaded .env from ${p}`);
            }
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = 'http://localhost:3005/google/callback';

        console.log('DEBUG: ensureInitialized called');
        console.log('DEBUG: CWD:', process.cwd());
        console.log('DEBUG: GOOGLE_CLIENT_ID:', clientId ? clientId.substring(0, 10) + '...' : 'undefined');
        console.log('DEBUG: GOOGLE_CLIENT_SECRET:', clientSecret ? '******' : 'undefined');

        if (!clientId || !clientSecret) {
            console.warn('Google Client ID or Secret missing. Google integration disabled.');
            this.oauth2Client = new google.auth.OAuth2(); // Dummy
            return;
        }

        this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
        if (refreshToken) {
            this.oauth2Client.setCredentials({ refresh_token: refreshToken });
            this.isAuthenticated = true;
            this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            this.tasks = google.tasks({ version: 'v1', auth: this.oauth2Client });
            console.log('Google Service initialized with Refresh Token.');
        } else {
            console.warn('Google Refresh Token missing. Run scripts/get_google_refresh_token.ts to authenticate.');
        }
    }

    async getUpcomingEvents(maxResults: number = 10) {
        this.ensureInitialized();
        if (!this.isAuthenticated) return [];
        try {
            const res = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });
            return res.data.items;
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            return [];
        }
    }

    async getTasks(maxResults: number = 10) {
        this.ensureInitialized();
        if (!this.isAuthenticated) return [];
        try {
            // First get the default task list
            const taskLists = await this.tasks.tasklists.list({ maxResults: 1 });
            if (!taskLists.data.items || taskLists.data.items.length === 0) return [];

            const taskListId = taskLists.data.items[0].id;
            const res = await this.tasks.tasks.list({
                tasklist: taskListId,
                showCompleted: false,
                maxResults: maxResults,
            });
            return res.data.items;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    }

    getAuthUrl() {
        this.ensureInitialized();
        const scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/tasks.readonly',
            'https://www.googleapis.com/auth/youtube.readonly', // For YouTube subscriptions feed
        ];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    async handleCallback(code: string) {
        this.ensureInitialized();
        const { tokens } = await this.oauth2Client.getToken(code);
        const refreshToken = tokens.refresh_token;

        if (refreshToken) {
            this.oauth2Client.setCredentials({ refresh_token: refreshToken });
            this.isAuthenticated = true;
            this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            this.tasks = google.tasks({ version: 'v1', auth: this.oauth2Client });

            // Save to .env
            const envPath = path.resolve(process.cwd(), '.env');
            let envContent = fs.readFileSync(envPath, 'utf8');

            if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
                envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/, `GOOGLE_REFRESH_TOKEN=${refreshToken}`);
            } else {
                envContent += `\nGOOGLE_REFRESH_TOKEN=${refreshToken}\n`;
            }

            fs.writeFileSync(envPath, envContent);
            console.log('Successfully authenticated and saved refresh token.');
            return true;
        }
        return false;
    }

    isAuth() {
        this.ensureInitialized();
        return this.isAuthenticated;
    }
}

export const googleService = new GoogleService();
