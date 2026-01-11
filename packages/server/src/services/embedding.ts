
import { GoogleGenerativeAI } from '@google/generative-ai';
import ollama from 'ollama';

export class EmbeddingService {
    private genAI: GoogleGenerativeAI | null = null;
    private useOllama: boolean = true; // Default to Ollama for local privacy

    constructor() {
        if (process.env.GOOGLE_GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        }
    }

    async getEmbedding(text: string): Promise<number[]> {
        // Try Ollama first if enabled
        if (this.useOllama) {
            try {
                // Check if ollama is running/reachable by trying a lightweight call or just try embedding
                // We'll use 'nomic-embed-text' or 'mxbai-embed-large' or just 'llama3' if it supports it.
                // For now, let's assume 'nomic-embed-text' is the standard embedding model for ollama.
                // If not found, user might need to pull it.
                let model = 'nomic-embed-text';
                try {
                    const response = await (ollama as any).embeddings({
                        model,
                        prompt: text,
                    });
                    return response.embedding;
                } catch (e) {
                    // Fallback to configured model (e.g. llama3)
                    if (process.env.OLLAMA_MODEL) {
                        model = process.env.OLLAMA_MODEL;
                        console.log(`nomic-embed-text failed, trying ${model}...`);
                        const response = await (ollama as any).embeddings({
                            model,
                            prompt: text,
                        });
                        return response.embedding;
                    }
                    throw e;
                }
            } catch (error) {
                console.warn('Ollama embedding failed (ensure "nomic-embed-text" or OLLAMA_MODEL is pulled), falling back to Gemini...', error);
            }
        }

        // Fallback to Gemini
        if (this.genAI) {
            try {
                const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
                const result = await model.embedContent(text);
                const embedding = result.embedding;
                return embedding.values;
            } catch (error) {
                console.error('Gemini embedding failed:', error);
                throw error;
            }
        }

        throw new Error('No embedding provider available. Please install Ollama (and pull nomic-embed-text) or set GOOGLE_GEMINI_API_KEY in packages/server/.env');
    }
}

export const embeddingService = new EmbeddingService();
