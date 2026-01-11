import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMResponse } from './types';

export class GeminiProvider implements LLMProvider {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey?: string, modelName: string = 'gemini-1.5-flash') {
        // If an API key is provided, use it (personal Gemini). Otherwise rely on ADC (service account) for Vertex AI.
        this.genAI = new GoogleGenerativeAI(apiKey ?? '');
        this.model = this.genAI.getGenerativeModel({ model: modelName });
    }

    async generateContent(prompt: string): Promise<string> {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    async generate(prompt: string): Promise<LLMResponse> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                content: text,
            };
        } catch (error) {
            console.error('Gemini generation error:', error);
            throw error;
        }
    }

    async summarize(text: string): Promise<string> {
        const prompt = `Summarize the following text concisely:\n\n${text}`;
        const response = await this.generate(prompt);
        return response.content;
    }

    async generateTags(text: string): Promise<string[]> {
        const prompt = `Generate a list of 5 relevant tags for the following text. Return ONLY a comma-separated list of tags, no other text:\n\n${text}`;
        const response = await this.generate(prompt);
        return response.content.split(',').map(tag => tag.trim());
    }
}
