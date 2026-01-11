import { googleService } from '../src/services/google';
import dotenv from 'dotenv';
import path from 'path';

console.log('--- Debug Script Start ---');
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

// Attempt to load .env manually to see if it works here
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('GOOGLE_CLIENT_ID in process.env:', process.env.GOOGLE_CLIENT_ID);

console.log('Calling googleService.getAuthUrl()...');
try {
    const url = googleService.getAuthUrl();
    console.log('Generated URL:', url);
    if (url.includes('client_id=')) {
        console.log('SUCCESS: client_id is present in the URL.');
    } else {
        console.error('FAILURE: client_id is MISSING from the URL.');
    }
} catch (e) {
    console.error('Error calling getAuthUrl:', e);
}
console.log('--- Debug Script End ---');
