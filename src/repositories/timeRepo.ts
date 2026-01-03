import dayjs from 'dayjs';
import { and, eq, gte, isNull, lte, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { timeEntries } from '../db/schema';

export const timeRepo = {
    getAll: async () => {
        return await db.select().from(timeEntries).orderBy(sql`${timeEntries.startTime} DESC`).execute();
    },

    getActiveSession: async () => {
        const results = await db.select()
            .from(timeEntries)
            .where(isNull(timeEntries.endTime))
            .execute();
        return results[0];
    },

    startSession: async (meetingId?: number) => {
        const now = new Date();
        return await db.insert(timeEntries).values({
            date: dayjs(now).format('YYYY-MM-DD'),
            startTime: now,
            meetingId: meetingId || null,
        }).execute();
    },

    stopSession: async (id: number) => {
        const now = new Date();
        const session = await db.select().from(timeEntries).where(eq(timeEntries.id, id)).execute();
        if (session.length > 0) {
            const startTime = dayjs(session[0].startTime);
            const endTime = dayjs(now);
            const minutes = endTime.diff(startTime, 'minute');

            return await db.update(timeEntries)
                .set({ endTime: now, minutes })
                .where(eq(timeEntries.id, id))
                .execute();
        }
    },

    delete: async (id: number) => {
        return await db.delete(timeEntries).where(eq(timeEntries.id, id)).execute();
    },

    getMonthStats: async (month: string) => { // month format YYYY-MM
        const startOfMonth = dayjs(month).startOf('month').format('YYYY-MM-DD');
        const endOfMonth = dayjs(month).endOf('month').format('YYYY-MM-DD');

        const results = await db.select({
            totalMinutes: sql<number>`sum(${timeEntries.minutes})`,
        })
            .from(timeEntries)
            .where(and(
                gte(timeEntries.date, startOfMonth),
                lte(timeEntries.date, endOfMonth)
            ))
            .execute();

        return results[0]?.totalMinutes || 0;
    },

    getDailyMinutesForMonth: async (month: string) => {
        const startOfMonth = dayjs(month).startOf('month').format('YYYY-MM-DD');
        const endOfMonth = dayjs(month).endOf('month').format('YYYY-MM-DD');

        return await db.select({
            date: timeEntries.date,
            minutes: sql<number>`sum(${timeEntries.minutes})`
        })
            .from(timeEntries)
            .where(and(
                gte(timeEntries.date, startOfMonth),
                lte(timeEntries.date, endOfMonth)
            ))
            .groupBy(timeEntries.date)
            .execute();
    }
};
