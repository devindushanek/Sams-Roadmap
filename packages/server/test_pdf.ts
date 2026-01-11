
import fs from 'fs';
import path from 'path';

// Mock the logic used in ingestion.ts
// @ts-ignore
const pdf = require('pdf-parse');

async function testPdf() {
    console.log('Testing pdf-parse import...');
    console.log('Type of pdf export:', typeof pdf);

    const parsePdf = typeof pdf === 'function' ? pdf : pdf.default;
    console.log('Type of parsePdf:', typeof parsePdf);

    if (typeof parsePdf !== 'function') {
        console.error('FAILED: pdf-parse is not a function');
        process.exit(1);
    }

    console.log('SUCCESS: pdf-parse is correctly identified as a function.');

    // Optional: Try to parse a dummy buffer
    try {
        const dummyBuffer = Buffer.from('%PDF-1.4\n%...');
        // We expect this might fail parsing but at least the function call should work
        await parsePdf(dummyBuffer).catch((e: any) => {
            console.log('Called function successfully (error expected on dummy buffer):', e.message);
        });
    } catch (e) {
        console.log('Error calling function:', e);
    }
}

testPdf();
