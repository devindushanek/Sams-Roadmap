import { gmailService } from '../src/services/gmail';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function testGmail() {
    console.log('Testing Gmail Service...');
    try {
        const emails = await gmailService.listEmails(5);
        console.log(`Successfully fetched ${emails.length} emails.`);

        if (emails.length > 0) {
            console.log('First email:', {
                subject: emails[0].subject,
                from: emails[0].from,
                date: emails[0].date
            });
        } else {
            console.log('No emails found. Checking raw list...');
            // Access private gmail instance to debug raw list
            const service = gmailService as any;
            service.ensureInitialized();
            const response = await service.gmail.users.messages.list({
                userId: 'me',
                maxResults: 5,
            });
            console.log('Raw list response:', JSON.stringify(response.data, null, 2));
        }
    } catch (error) {
        console.error('Error testing Gmail:', error);
    }
}

testGmail();
