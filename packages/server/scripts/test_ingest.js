const fetch = require('node-fetch');
const path = require('path');

async function testIngest() {
    const filePath = path.resolve('c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/test_ingest.txt');
    console.log(`Testing ingestion for: ${filePath}`);

    try {
        const response = await fetch('http://localhost:3005/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath })
        });

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testIngest();
