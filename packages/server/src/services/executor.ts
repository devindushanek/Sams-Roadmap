import { workflowManager } from './workflow';
import { llmOrchestrator } from './orchestrator';
import { logger } from './logger';

export class TaskExecutor {
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('Task Executor started');

        this.intervalId = setInterval(async () => {
            await this.processNextTask();
        }, 5000); // Poll every 5 seconds
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('Task Executor stopped');
    }

    private async processNextTask() {
        try {
            const task = await workflowManager.getNextPendingTask();
            if (!task) return;

            console.log(`Processing task: ${task.title}`);
            logger.info(`Processing task: ${task.title}`);
            await workflowManager.updateTaskStatus(task.id, 'in_progress');

            try {
                // 1. Plan
                const plan = await llmOrchestrator.planTask(task.title, task.description || '');
                console.log('Plan generated:', plan);
                logger.info(`Plan generated for task ${task.id}`);

                // 2. Execute (Sequential)
                const results = [];
                for (const step of plan) {
                    logger.info(`Executing step ${step.id}: ${step.description}`);
                    const result = await llmOrchestrator.executeStep(step);
                    results.push(result);
                }

                // 3. Complete
                await workflowManager.updateTaskStatus(task.id, 'completed', JSON.stringify(results));
                console.log(`Task ${task.id} completed`);
                logger.info(`Task ${task.id} completed successfully`);

            } catch (error: any) {
                console.error(`Task ${task.id} failed:`, error);
                logger.error(`Task ${task.id} failed: ${error.message}`);
                await workflowManager.updateTaskStatus(task.id, 'failed', undefined, error.message);
            }

        } catch (error) {
            console.error('Error in task execution loop:', error);
        }
    }
}

export const taskExecutor = new TaskExecutor();
