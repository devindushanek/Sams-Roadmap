
import { db } from '../db';
import { documents } from '../db/schema';
import { embeddingService } from './embedding';
import { eq, isNull } from 'drizzle-orm';

interface ScoredDocument {
    id: number;
    content: string;
    metadata: any;
    score: number;
}

export class VectorStore {
    private vectors: Map<number, number[]> = new Map();

    async initialize() {
        console.log('Initializing VectorStore...');
        const docs = await db.select().from(documents);

        let embeddedCount = 0;
        for (const doc of docs) {
            if (doc.embedding) {
                try {
                    this.vectors.set(doc.id, JSON.parse(doc.embedding));
                    embeddedCount++;
                } catch (e) {
                    console.error(`Failed to parse embedding for doc ${doc.id}`);
                }
            } else {
                // Generate embedding if missing (background process)
                // Add delay to avoid rate limits (TEMPORARILY DISABLED FOR INITIAL PROCESSING)
                // await new Promise(resolve => setTimeout(resolve, 5000));
                await this.generateEmbeddingForDoc(doc).catch(console.error);
            }
        }
        console.log(`VectorStore initialized with ${embeddedCount} embeddings.`);
    }

    private async generateEmbeddingForDoc(doc: any) {
        try {
            console.log(`Generating embedding for doc ${doc.id}...`);
            const embedding = await embeddingService.getEmbedding(doc.content);

            // Save to DB
            await db.update(documents)
                .set({ embedding: JSON.stringify(embedding) })
                .where(eq(documents.id, doc.id));

            // Update in-memory store
            this.vectors.set(doc.id, embedding);
            console.log(`Embedding generated for doc ${doc.id}`);
        } catch (error) {
            console.error(`Failed to generate embedding for doc ${doc.id}:`, error);
        }
    }

    async addDocument(docId: number, content: string) {
        // Trigger embedding generation
        const doc = { id: docId, content };
        await this.generateEmbeddingForDoc(doc);
    }

    async search(query: string, limit: number = 5): Promise<ScoredDocument[]> {
        const queryEmbedding = await embeddingService.getEmbedding(query);
        const results: ScoredDocument[] = [];

        // Calculate cosine similarity for all docs
        // Note: For large datasets, use a real vector DB (pgvector, chroma, etc.)
        // For < 10k docs, this is fast enough in Node.js
        for (const [docId, vector] of this.vectors.entries()) {
            const score = this.cosineSimilarity(queryEmbedding, vector);
            if (score > 0.3) { // Minimum relevance threshold
                // Fetch doc details (lazy load would be better but this is fine)
                // We need to fetch content to return it
                // Optimization: Cache content or fetch only top K after sorting
                results.push({ id: docId, score, content: '', metadata: {} });
            }
        }

        // Sort by score desc
        results.sort((a, b) => b.score - a.score);
        const topResults = results.slice(0, limit);

        // Hydrate with content
        const hydratedResults: ScoredDocument[] = [];
        for (const res of topResults) {
            const doc = await db.select().from(documents).where(eq(documents.id, res.id)).get();
            if (doc) {
                hydratedResults.push({
                    ...res,
                    content: doc.content,
                    metadata: doc.metadata ? JSON.parse(doc.metadata) : {}
                });
            }
        }

        return hydratedResults;
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

export const vectorStore = new VectorStore();
