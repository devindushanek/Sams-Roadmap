export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface LLMProvider {
  generate(prompt: string): Promise<LLMResponse>;
  generateContent(prompt: string): Promise<string>;
  summarize(text: string): Promise<string>;
  generateTags(text: string): Promise<string[]>;
}
