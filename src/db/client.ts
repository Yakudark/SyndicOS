import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const expoDb = SQLite.openDatabaseSync('syndic.db');

export const db = drizzle(expoDb, { schema });

export const initializeDb = async () => {
    // Create tables if they don't exist
    try {
        expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY NOT NULL,
                display_name TEXT DEFAULT 'Agent',
                monthly_quota_minutes INTEGER DEFAULT 2100,
                theme_variant TEXT DEFAULT 'cyan'
            );
        `);

        expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                location TEXT,
                start_at INTEGER NOT NULL,
                end_at INTEGER NOT NULL
            );
        `);

        expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                meeting_id INTEGER,
                content TEXT NOT NULL,
                created_at INTEGER,
                FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
            );
        `);

        expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS time_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                date TEXT NOT NULL,
                start_time INTEGER NOT NULL,
                end_time INTEGER,
                minutes INTEGER DEFAULT 0,
                meeting_id INTEGER,
                FOREIGN KEY (meeting_id) REFERENCES meetings(id)
            );
        `);

        expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                uri TEXT NOT NULL,
                size INTEGER,
                created_at INTEGER
            );
        `);
    } catch (e) {
        console.error("Table creation failed", e);
    }

    // Basic setup: ensure core settings exist
    const settingsResult = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).execute();
    if (settingsResult.length === 0) {
        await db.insert(schema.settings).values({ id: 1 }).execute();
    }

    // Seed if empty
    const meetingsResult = await db.select({ count: sql`count(*)` }).from(schema.meetings).execute();
    if ((meetingsResult[0] as any).count === 0) {
        const { seedData } = await import('./seed');
        await seedData();
    }
};
