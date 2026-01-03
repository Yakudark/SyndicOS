import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { contacts } from '../db/schema';

export const contactsRepo = {
    getAll: async () => {
        return await db.select().from(contacts).execute();
    },

    getByType: async (type: string) => {
        return await db.select()
            .from(contacts)
            .where(eq(contacts.type, type))
            .execute();
    },

    create: async (data: typeof contacts.$inferInsert) => {
        return await db.insert(contacts).values(data).execute();
    },

    update: async (id: number, data: Partial<typeof contacts.$inferInsert>) => {
        return await db.update(contacts).set(data).where(eq(contacts.id, id)).execute();
    },

    delete: async (id: number) => {
        return await db.delete(contacts).where(eq(contacts.id, id)).execute();
    }
};
