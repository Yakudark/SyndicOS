import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { tasks } from '../db/schema';

export const tasksRepo = {
    getAll: async () => {
        return await db.select().from(tasks).orderBy(desc(tasks.createdAt)).execute();
    },

    getPending: async () => {
        return await db.select().from(tasks).where(eq(tasks.status, 'TODO')).orderBy(desc(tasks.createdAt)).execute();
    },

    create: async (data: typeof tasks.$inferInsert) => {
        return await db.insert(tasks).values(data).execute();
    },

    update: async (id: number, data: Partial<typeof tasks.$inferInsert>) => {
        return await db.update(tasks).set(data).where(eq(tasks.id, id)).execute();
    },

    delete: async (id: number) => {
        return await db.delete(tasks).where(eq(tasks.id, id)).execute();
    },

    toggleStatus: async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'TODO' ? 'DONE' : 'TODO';
        return await db.update(tasks).set({ status: newStatus }).where(eq(tasks.id, id)).execute();
    }
};
