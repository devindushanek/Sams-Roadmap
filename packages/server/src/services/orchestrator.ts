import { llmFactory } from './llm/factory';

interface PlanStep {
    id: number;
    description: string;
    tool: string;
    arguments: any;
}

export class LLMOrchestrator {
    async planTask(taskTitle: string, taskDescription: string): Promise<PlanStep[]> {
        const llm = await llmFactory.getProvider();

        const prompt = `
        You are an autonomous agent planning a task.
        Task: ${taskTitle}
        Description: ${taskDescription}
        
        Available Tools:
        - read_file(path): Read file content
        - write_file(path, content): Create or overwrite file
        - run_command(command): Execute shell command
        
        Create a step-by-step plan to accomplish this task.
        Return ONLY a JSON array of steps, where each step has:
        - id: number
        - description: string
        - tool: string (one of the available tools)
        - arguments: object (arguments for the tool)
        `;

        const response = await llm.generateContent(prompt);

        try {
            // Extract JSON from response (handling potential markdown code blocks)
            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No JSON plan found in response');
        } catch (error) {
            console.error('Failed to parse plan:', error);
            throw new Error('Failed to generate valid plan');
        }
    }

    async executeStep(step: PlanStep): Promise<string> {
        // Placeholder for actual tool execution logic
        // In a real implementation, this would map tools to actual function calls
        console.log(`Executing step ${step.id}: ${step.description}`);
        return `Executed ${step.tool}`;
    }
}

export const llmOrchestrator = new LLMOrchestrator();
