import { desc, eq, like } from 'drizzle-orm';
import { db } from '../db/client';
import { notes } from '../db/schema';

export const notesRepo = {
    getByMeetingId: async (meetingId: number) => {
        return await db.select().from(notes)
            .where(eq(notes.meetingId, meetingId))
            .orderBy(desc(notes.createdAt))
            .execute();
    },

    getRecent: async (limit = 3) => {
        return await db.select().from(notes)
            .orderBy(desc(notes.createdAt))
            .limit(limit)
            .execute();
    },

    getAll: async () => {
        return await db.select().from(notes).orderBy(desc(notes.createdAt)).execute();
    },

    create: async (content: string, meetingId: number | null = null) => {
        return await db.insert(notes).values({
            meetingId,
            content,
            createdAt: new Date(),
        }).execute();
    },

    update: async (id: number, content: string) => {
        return await db.update(notes).set({ content }).where(eq(notes.id, id)).execute();
    },

    delete: async (id: number) => {
        return await db.delete(notes).where(eq(notes.id, id)).execute();
    },

    search: async (query: string) => {
        return await db.select().from(notes)
            .where(like(notes.content, `%${query}%`))
            .orderBy(desc(notes.createdAt))
            .execute();
    }
};
