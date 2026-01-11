import { llmFactory } from './llm/factory';
import { db } from '../db';
import { documents } from '../db/schema';
import { eq } from 'drizzle-orm';
import { LLMProvider } from './llm/types';

export class UnderstandingService {
    private llm: LLMProvider | null = null;

    private async getLLM(): Promise<LLMProvider> {
        if (!this.llm) {
            this.llm = await llmFactory.getProvider();
        }
        return this.llm;
    }

    async processDocument(documentId: number) {
        const doc = await db.select().from(documents).where(eq(documents.id, documentId)).get();

        if (!doc) {
            throw new Error(`Document ${documentId} not found`);
        }

        console.log(`Processing document ${documentId} with LLM...`);

        const llm = await this.getLLM();

        // Generate Summary
        const summary = await llm.summarize(doc.content);

        // Generate Tags
        const tags = await llm.generateTags(doc.content);

        // Update Document Metadata
        const currentMetadata = JSON.parse(doc.metadata || '{}');
        const updatedMetadata = {
            ...currentMetadata,
            summary,
            tags,
            processedAt: new Date().toISOString(),
        };

        await db.update(documents)
            .set({ metadata: JSON.stringify(updatedMetadata) })
            .where(eq(documents.id, documentId));

        console.log(`Document ${documentId} processed successfully.`);
        return { summary, tags };
    }
}

export const understandingService = new UnderstandingService();
