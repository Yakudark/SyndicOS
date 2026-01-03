import dayjs from 'dayjs';
import { db } from './client';
import { meetings, settings } from './schema';

export const seedData = async () => {
    // Reset settings to default
    await db.update(settings).set({
        displayName: 'Neo',
        monthlyQuotaMinutes: 2100, // 35h
        themeVariant: 'cyan'
    }).where(require('drizzle-orm').eq(settings.id, 1)).execute();

    // Sample meetings
    const now = dayjs();
    await db.insert(meetings).values([
        {
            title: 'Briefing Syndicat',
            description: 'Réunion de routine sur les protocoles néon.',
            location: 'Secteur 7',
            startAt: now.add(1, 'day').set('hour', 10).set('minute', 0).toDate(),
            endAt: now.add(1, 'day').set('hour', 11).set('minute', 30).toDate(),
        },
        {
            title: 'Intervention Matrix',
            description: 'Débogage du sous-système de pointage.',
            location: 'Mainframe',
            startAt: now.add(3, 'day').set('hour', 14).set('minute', 0).toDate(),
            endAt: now.add(3, 'day').set('hour', 16).set('minute', 0).toDate(),
        }
    ]).execute();
};
