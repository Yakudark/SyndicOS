import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { meetings, notes, settings, timeEntries } from '../db/schema';

export const settingsRepo = {
    get: async () => {
        const results = await db.select().from(settings).where(eq(settings.id, 1)).execute();
        return results[0];
    },

    update: async (data: Partial<typeof settings.$inferInsert>) => {
        return await db.update(settings).set(data).where(eq(settings.id, 1)).execute();
    },

    resetAll: async () => {
        await db.delete(meetings).execute();
        await db.delete(timeEntries).execute();
        await db.delete(notes).execute();
    }
};
