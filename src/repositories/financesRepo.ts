import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { finances } from '../db/schema';

export const financesRepo = {
    getAll: async () => {
        return await db.select().from(finances).orderBy(desc(finances.date)).execute();
    },

    create: async (data: typeof finances.$inferInsert) => {
        return await db.insert(finances).values(data).execute();
    },

    delete: async (id: number) => {
        return await db.delete(finances).where(eq(finances.id, id)).execute();
    },

    getStats: async () => {
        // Calculate total income and expense
        const all = await db.select().from(finances).execute();
        let totalIncome = 0;
        let totalExpense = 0;

        all.forEach(item => {
            if (item.type === 'INCOME') {
                totalIncome += item.amount;
            } else {
                totalExpense += item.amount;
            }
        });

        return {
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense
        };
    }
};
