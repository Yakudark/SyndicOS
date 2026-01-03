export const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
};

export const formatDuration = (start: Date, end: Date) => {
    const diff = Math.abs(end.getTime() - start.getTime());
    const minutes = Math.floor(diff / (1000 * 60));
    return formatMinutes(minutes);
};
