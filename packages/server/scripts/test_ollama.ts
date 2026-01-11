import ollama from 'ollama';

async function test() {
    console.log('Testing Ollama connection...');
    try {
        const model = 'llama3';
        console.log(`Generating embedding with model: ${model}`);
        const response = await ollama.embeddings({
            model: model,
            prompt: 'Hello world',
        });
        console.log('Success! Embedding generated.');
        console.log('Vector length:', response.embedding.length);
    } catch (error: any) {
        console.error('Ollama test failed:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

test();
