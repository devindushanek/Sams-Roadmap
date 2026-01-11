import { db } from '../db';
import { tasks } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class WorkflowManager {
    async createTask(title: string, description: string, priority: number = 0) {
        const result = await db.insert(tasks).values({
            title,
            description,
            priority,
            status: 'pending',
        }).returning();
        return result[0];
    }

    async getNextPendingTask() {
        const pendingTasks = await db.select()
            .from(tasks)
            .where(eq(tasks.status, 'pending'))
            .orderBy(desc(tasks.priority), tasks.createdAt)
            .limit(1);

        return pendingTasks[0] || null;
    }

    async updateTaskStatus(id: number, status: 'pending' | 'in_progress' | 'completed' | 'failed', result?: string, error?: string) {
        await db.update(tasks)
            .set({
                status,
                result,
                error,
                // If completed or failed, we might want to set an endedAt timestamp in the future
            })
            .where(eq(tasks.id, id));
    }

    async getTask(id: number) {
        const result = await db.select().from(tasks).where(eq(tasks.id, id));
        return result[0];
    }
}

export const workflowManager = new WorkflowManager();
