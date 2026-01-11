import { LLMProvider, LLMResponse } from './types';

export class OllamaProvider implements LLMProvider {
  constructor(model: string = 'gemma2') { }

  async generateContent(prompt: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async generate(prompt: string): Promise<LLMResponse> {
    throw new Error('Ollama provider is currently disabled. Please use Google Gemini.');
  }

  async summarize(text: string): Promise<string> {
    throw new Error('Ollama provider is currently disabled. Please use Google Gemini.');
  }

  async generateTags(text: string): Promise<string[]> {
    throw new Error('Ollama provider is currently disabled. Please use Google Gemini.');
  }
}
