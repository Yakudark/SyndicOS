import dayjs from 'dayjs';
import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { db } from '../db/client';
import { meetings } from '../db/schema';

const computeDurationMinutes = (startAt: Date, endAt: Date) => {
    return dayjs(endAt).diff(dayjs(startAt), 'minute');
};

export const meetingsRepo = {
    getAll: async () => {
        return await db.select().from(meetings).orderBy(asc(meetings.startAt)).execute();
    },

    getById: async (id: number) => {
        const results = await db.select().from(meetings).where(eq(meetings.id, id)).execute();
        return results[0];
    },

    getUpcoming: async (limit = 3) => {
        return await db.select()
            .from(meetings)
            .where(gte(meetings.startAt, new Date()))
            .orderBy(asc(meetings.startAt))
            .limit(limit)
            .execute();
    },

    create: async (data: typeof meetings.$inferInsert) => {
        if (!data.startAt || !data.endAt) {
            throw new Error('startAt et endAt sont requis');
        }

        return await db.insert(meetings).values(data).execute();
    },


    update: async (id: number, data: any) => {
        let payload = { ...data };

        if (data.startAt && data.endAt) {
            payload.durationMinutes = dayjs(data.endAt).diff(
                dayjs(data.startAt),
                'minute'
            );
        }

        return await db
            .update(meetings)
            .set(payload)
            .where(eq(meetings.id, id))
            .execute();
    },


    delete: async (id: number) => {
        return await db.delete(meetings).where(eq(meetings.id, id)).execute();
    },

    getByRange: async (start: Date, end: Date) => {
        return await db.select()
            .from(meetings)
            .where(and(
                gte(meetings.startAt, start),
                lte(meetings.startAt, end)
            ))
            .orderBy(asc(meetings.startAt))
            .execute();
    }

};
