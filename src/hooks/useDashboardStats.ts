import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { meetings, notes } from '../db/schema';
import { meetingsRepo } from '../repositories/meetingsRepo';
import { notesRepo } from '../repositories/notesRepo';
import { useSettingsStore } from '../stores/useSettingsStore';

interface DashboardStats {
    upcomingMeetings: (typeof meetings.$inferSelect)[];
    recentNotes: (typeof notes.$inferSelect)[];
    totalMinutesMonth: number;
    dailyMinutes: { date: string; minutes: number }[];
    loading: boolean;
}

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>({
        upcomingMeetings: [],
        recentNotes: [],
        totalMinutesMonth: 0,
        dailyMinutes: [],
        loading: true,
    });

    const monthlyQuotaMinutes = useSettingsStore(
        state => state.monthlyQuotaMinutes
    );

    const refresh = async () => {
        setStats(s => ({ ...s, loading: true }));

        const now = dayjs();
        const startOfMonth = now.startOf('month');
        const endOfMonth = now.endOf('month');

        const [allMeetings, upcomingMeetings, notes] = await Promise.all([
            meetingsRepo.getAll(),
            meetingsRepo.getUpcoming(3),
            notesRepo.getRecent(3),
        ]);

        // 🔹 réunions du mois courant
        const meetingsMonth = allMeetings.filter(m => {
            const meetingDate = new Date(m.startAt);
            return (
                meetingDate >= startOfMonth.toDate() &&
                meetingDate <= endOfMonth.toDate()
            );
        });

        // Calcul du total des minutes
        const totalMinutesMonth = meetingsMonth.reduce((acc, m) => {
            const duration = dayjs(m.endAt).diff(dayjs(m.startAt), 'minute');
            return acc + duration;
        }, 0);

        // Groupement par jour pour le dailyMinutes (si besoin futur)
        const dailyMap = new Map();
        meetingsMonth.forEach(m => {
            const dayKey = dayjs(m.startAt).format('YYYY-MM-DD');
            const duration = dayjs(m.endAt).diff(dayjs(m.startAt), 'minute');
            dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + duration);
        });

        const dailyMinutes = Array.from(dailyMap.entries()).map(([date, minutes]) => ({
            date,
            minutes
        })).sort((a, b) => a.date.localeCompare(b.date));

        setStats({
            upcomingMeetings,
            recentNotes: notes,
            totalMinutesMonth,
            dailyMinutes,
            loading: false,
        });
    };

    useEffect(() => {
        refresh();
    }, [monthlyQuotaMinutes]);

    return { ...stats, refresh };
};
