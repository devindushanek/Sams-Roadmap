import { google, gmail_v1 } from 'googleapis';
import { googleService } from './google';

export interface EmailMessage {
    id: string;
    threadId: string;
    snippet: string;
    subject: string;
    from: string;
    to: string;
    date: Date;
    isRead: boolean;
    body?: string;
}

export class GmailService {
    private gmail: gmail_v1.Gmail | null = null;

    private ensureInitialized() {
        if (this.gmail) return;

        googleService.ensureInitialized();
        const oauth2Client = googleService['oauth2Client'];

        if (oauth2Client) {
            this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
            console.log('Gmail Service initialized');
        }
    }

    async listEmails(maxResults: number = 10): Promise<EmailMessage[]> {
        this.ensureInitialized();
        if (!this.gmail) return [];

        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults: maxResults,
                // q: 'category:primary', // Removed to show all emails
            });

            const messages = response.data.messages || [];
            if (messages.length === 0) return [];

            // Fetch details for each message
            const emailPromises = messages.map(msg => this.getEmailDetails(msg.id!));
            const emails = await Promise.all(emailPromises);

            return emails.filter(Boolean) as EmailMessage[];
        } catch (error) {
            console.error('Error listing emails:', error);
            return [];
        }
    }

    async getEmailDetails(messageId: string): Promise<EmailMessage | null> {
        this.ensureInitialized();
        if (!this.gmail) return null;

        try {
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full',
            });

            const msg = response.data;
            const headers = msg.payload?.headers || [];

            const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
            const from = headers.find(h => h.name === 'From')?.value || '';
            const to = headers.find(h => h.name === 'To')?.value || '';
            const dateStr = headers.find(h => h.name === 'Date')?.value || '';

            // Determine if read
            const isRead = !msg.labelIds?.includes('UNREAD');

            // Extract body (simplified)
            let body = '';
            if (msg.payload?.body?.data) {
                body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
            } else if (msg.payload?.parts) {
                // Try to find text/plain part
                const textPart = msg.payload.parts.find(p => p.mimeType === 'text/plain');
                if (textPart?.body?.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                }
            }

            return {
                id: msg.id!,
                threadId: msg.threadId!,
                snippet: msg.snippet || '',
                subject,
                from,
                to,
                date: new Date(dateStr),
                isRead,
                body
            };
        } catch (error) {
            console.error(`Error fetching email ${messageId}:`, error);
            return null;
        }
    }

    async modifyMessage(messageId: string, addLabels: string[], removeLabels: string[]): Promise<boolean> {
        this.ensureInitialized();
        if (!this.gmail) return false;

        try {
            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    addLabelIds: addLabels,
                    removeLabelIds: removeLabels
                }
            });
            return true;
        } catch (error) {
            console.error(`Error modifying message ${messageId}:`, error);
            return false;
        }
    }

    async trashMessage(messageId: string): Promise<boolean> {
        this.ensureInitialized();
        if (!this.gmail) return false;

        try {
            await this.gmail.users.messages.trash({
                userId: 'me',
                id: messageId
            });
            return true;
        } catch (error) {
            console.error(`Error trashing message ${messageId}:`, error);
            return false;
        }
    }

    async listSentEmails(maxResults: number = 5): Promise<EmailMessage[]> {
        this.ensureInitialized();
        if (!this.gmail) return [];

        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults: maxResults,
                labelIds: ['SENT']
            });

            const messages = response.data.messages || [];
            if (messages.length === 0) return [];

            const emailPromises = messages.map(msg => this.getEmailDetails(msg.id!));
            const emails = await Promise.all(emailPromises);

            return emails.filter(Boolean) as EmailMessage[];
        } catch (error) {
            console.error('Error listing sent emails:', error);
            return [];
        }
    }

    async createDraft(to: string, subject: string, body: string): Promise<string | null> {
        this.ensureInitialized();
        if (!this.gmail) return null;

        try {
            const message = [
                `To: ${to}`,
                `Subject: ${subject}`,
                '',
                body
            ].join('\n');

            const encodedMessage = Buffer.from(message).toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            const response = await this.gmail.users.drafts.create({
                userId: 'me',
                requestBody: {
                    message: {
                        raw: encodedMessage
                    }
                }
            });

            return response.data.id || null;
        } catch (error) {
            console.error('Error creating draft:', error);
            return null;
        }
    }
}

export const gmailService = new GmailService();
