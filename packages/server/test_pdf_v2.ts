
import fs from 'fs';
import path from 'path';

const logFile = path.resolve(__dirname, 'test_v2_output.txt');
function log(msg: string) {
    fs.appendFileSync(logFile, msg + '\n');
}

async function test() {
    fs.writeFileSync(logFile, 'STARTING V2 TEST\n');
    try {
        // @ts-ignore
        const pdfModule = require('pdf-parse');
        log(`Module keys: ${Object.keys(pdfModule).join(', ')}`);

        const PDFParse = pdfModule.PDFParse;
        log(`PDFParse type: ${typeof PDFParse}`);

        if (typeof PDFParse === 'function') { // Class constructor is a function
            log('PDFParse is a function/class. Attempting instantiation...');
            // Create a dummy PDF buffer (minimal valid PDF header)
            // Actually, let's just try to instantiate with empty buffer and see if it throws specific error or works
            // Or better, use the file we found in D:\Reference\Structure if possible, or just a dummy buffer

            const dummyBuffer = Buffer.from('%PDF-1.7\n%EOF');

            try {
                const parser = new PDFParse({ data: dummyBuffer });
                log('Instantiation successful.');

                // We don't need to actually parse valid text to prove the library is loaded
                // But let's try
                // const text = await parser.getText();
                // log(`Text: ${text.text}`);
            } catch (e) {
                log(`Instantiation failed: ${e}`);
            }
        } else {
            log('PDFParse is NOT a function/class.');
        }

    } catch (e) {
        log(`CRITICAL ERROR: ${e}`);
    }
}

test();
