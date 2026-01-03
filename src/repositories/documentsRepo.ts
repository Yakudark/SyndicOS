import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { documents } from '../db/schema';

export const documentsRepo = {
    getAll: async () => {
        return await db.select().from(documents).orderBy(desc(documents.createdAt)).execute();
    },

    getByCategory: async (category: string) => {
        return await db.select()
            .from(documents)
            .where(eq(documents.category, category))
            .orderBy(desc(documents.createdAt))
            .execute();
    },

    create: async (data: typeof documents.$inferInsert) => {
        return await db.insert(documents).values(data).execute();
    },

    delete: async (id: number) => {
        return await db.delete(documents).where(eq(documents.id, id)).execute();
    },

    update: async (id: number, data: Partial<typeof documents.$inferInsert>) => {
        return await db.update(documents).set(data).where(eq(documents.id, id)).execute();
    }
};
