export function formatTime(minutes: number): string {
    return `${Math.floor((minutes / 60) % 24)
        .toFixed(0)
        .padStart(2, "0")}:${(minutes % 60).toFixed(0).padStart(2, "0")}`;
}

export function timeToMinute(time: string): number {
    return Math.floor(Date.parse(`1970-01-01T${time}:00Z`) / 60000);
}
