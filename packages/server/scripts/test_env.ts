import dotenv from 'dotenv';
import path from 'path';

console.log('__dirname:', __dirname);
const p1 = path.resolve(__dirname, '../../.env');
console.log('Path 1:', p1);

const result1 = dotenv.config({ path: p1 });
console.log('Result 1 error:', result1.error);
console.log('GOOGLE_CLIENT_ID:', !!process.env.GOOGLE_CLIENT_ID);

const result2 = dotenv.config();
console.log('Result 2 error:', result2.error);
console.log('GOOGLE_CLIENT_ID after default:', !!process.env.GOOGLE_CLIENT_ID);
