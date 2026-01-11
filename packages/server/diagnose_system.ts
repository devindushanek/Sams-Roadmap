
import fs from 'fs';
import path from 'path';
// @ts-ignore
import * as pdfImport from 'pdf-parse';

const logFile = path.resolve(__dirname, 'diagnostic_output.txt');

function log(msg: string) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function runDiagnosis() {
    try {
        // Clear log file
        fs.writeFileSync(logFile, 'STARTING DIAGNOSIS\n');

        // 1. Check PDF Import
        log('1. Checking PDF Import...');
        let pdf: any;
        try {
            // @ts-ignore
            const reqPdf = require('pdf-parse');
            pdf = typeof reqPdf === 'function' ? reqPdf : reqPdf.default;
            log(`   PDF Library Type: ${typeof pdf}`);
            if (typeof pdf !== 'function') throw new Error('PDF library is not a function');
            log('   PDF Import: SUCCESS');
        } catch (e) {
            log(`   PDF Import: FAILED - ${e}`);
        }

        // 2. Check Directory Access
        const targetDir = 'D:\\Reference\\Structure';
        log(`2. Checking Directory Access: ${targetDir}`);
        if (fs.existsSync(targetDir)) {
            log('   Directory exists: YES');
            const files = fs.readdirSync(targetDir);
            log(`   Files found: ${files.length}`);
            files.forEach(f => log(`    - ${f}`));

            // 3. Try to parse a PDF
            const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
            if (pdfFile) {
                log(`3. Testing PDF Parsing on: ${pdfFile}`);
                const pdfPath = path.join(targetDir, pdfFile);
                const buffer = fs.readFileSync(pdfPath);
                try {
                    const data = await pdf(buffer);
                    log(`   Parsed Text Length: ${data.text.length}`);
                    log(`   Preview: ${data.text.substring(0, 50)}...`);
                    log('   PDF Parsing: SUCCESS');
                } catch (e) {
                    log(`   PDF Parsing: FAILED - ${e}`);
                }
            } else {
                log('3. No PDF file found to test.');
            }

        } else {
            log('   Directory exists: NO');
        }

    } catch (err) {
        log(`CRITICAL ERROR: ${err}`);
    }
}

runDiagnosis();
