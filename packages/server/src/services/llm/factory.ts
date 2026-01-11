import { LLMProvider } from './types';
import { OllamaProvider } from './ollama';
import { GeminiProvider } from './gemini';

export class LLMFactory {
  async getProvider(): Promise<LLMProvider> {
    const providerType = process.env.LLM_PROVIDER || 'gemini';
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (providerType.toLowerCase() === 'gemini') {
      if (!apiKey) {
        console.warn('GOOGLE_API_KEY not found, falling back to Ollama (Gemma)');
        return new OllamaProvider();
      }
      return new GeminiProvider(apiKey, process.env.GEMINI_MODEL || 'gemini-1.5-flash');
    }

    if (providerType.toLowerCase() === 'ollama') {
      return new OllamaProvider(process.env.OLLAMA_MODEL || 'gemma2');
    }

    console.warn(`Unknown LLM provider: ${providerType}, defaulting to Ollama`);
    return new OllamaProvider();
  }
}

export const llmFactory = new LLMFactory();
