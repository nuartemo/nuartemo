// Civil timestamps belong to America/Fortaleza. UTC is used only for calendar
// arithmetic, never to reinterpret a date selected by a user as a UTC instant.
export function validTime(value: string): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
export function parseLocal(value: string): number {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
        value,
    );
    if (!match) return NaN;
    const [, year, month, day, hour, minute, second = '00'] = match;
    if (
        +year < 1900 ||
        +year > 2200 ||
        !validTime(`${hour}:${minute}`) ||
        +second > 59
    )
        return NaN;
    const time = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
    const date = new Date(time);
    return date.getUTCFullYear() === +year &&
        date.getUTCMonth() === +month - 1 &&
        date.getUTCDate() === +day
        ? time
        : NaN;
}
export function localNow(date = new Date()): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Fortaleza',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type: string) =>
        parts.find((part) => part.type === type)?.value;
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}
export function addMinutes(value: string, minutes: number): string {
    const time = parseLocal(value);
    if (!Number.isFinite(time)) return '';
    return new Date(time + minutes * 60_000).toISOString().slice(0, 19);
}
export function combineLocal(date: string, time: string): string {
    if (!validTime(time) || !Number.isFinite(parseLocal(`${date}T${time}`)))
        throw new Error(
            'Informe uma data válida e um horário entre 00:00 e 23:59.',
        );
    return `${date}T${time}`;
}
export function formatTime(value: string): string {
    return value.slice(11, 16);
}
export function formatDate(value: string): string {
    const time = parseLocal(`${value.slice(0, 10)}T00:00`);
    return Number.isFinite(time)
        ? new Intl.DateTimeFormat('pt-BR', {
              timeZone: 'UTC',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          }).format(time)
        : 'Data inválida';
}
export function formatDateTime(value: string): string {
    return `${formatDate(value)} às ${formatTime(value)}`;
}
