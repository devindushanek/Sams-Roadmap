declare module 'ollama' {
    export class Ollama {
        chat(options: { model: string; messages: { role: string; content: string }[] }): Promise<{ message: { content: string }; prompt_eval_count?: number; eval_count?: number }>;
    }
}
