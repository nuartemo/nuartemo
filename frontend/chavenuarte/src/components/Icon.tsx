export type IconName =
    | 'overview'
    | 'brandKey'
    | 'keys'
    | 'movements'
    | 'team'
    | 'arrow'
    | 'arrowDown'
    | 'arrowUp'
    | 'search'
    | 'check'
    | 'clock'
    | 'shield'
    | 'menu'
    | 'close'
    | 'info'
    | 'location'
    | 'lock'
    | 'refresh'
    | 'settings'
    | 'calendar'
    | 'plus'
    | 'edit'
    | 'archive'
    | 'chevronLeft'
    | 'chevronRight'
    | 'sun'
    | 'moon';
const paths: Record<Exclude<IconName, 'brandKey' | 'keys'>, string> = {
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5 19 19 M5 19l1.5-1.5 M17.5 6.5 19 5',
    moon: 'M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10Z',
    overview: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    movements: 'M4 7h15m-4-4 4 4-4 4 M20 17H5m4-4-4 4 4 4',
    team: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
    arrow: 'M5 12h14 M13 6l6 6-6 6',
    arrowDown: 'M12 4v16 M6 14l6 6 6-6',
    arrowUp: 'M12 20V4 M6 10l6-6 6 6',
    search: 'M21 21l-5-5 M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15',
    check: 'm5 12 4 4L19 6',
    clock: 'M12 8v4l3 2 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20',
    shield: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7Z m-5 9 3 3 5-6',
    menu: 'M4 6h16 M4 12h16 M4 18h16',
    close: 'm6 6 12 12 M6 18 18 6',
    info: 'M12 11v6 M12 7h.01 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20',
    location:
        'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
    lock: 'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 15v2',
    refresh: 'M20 7v5h-5 M4 17v-5h5 M6 6a8 8 0 0 1 13 2 M18 18a8 8 0 0 1-13-2',
    settings:
        'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M10 2h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1Z',
    calendar: 'M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4 M8 14h2 M14 14h2 M8 18h2',
    plus: 'M12 5v14 M5 12h14',
    edit: 'm16 3 5 5-12 12H4v-5Z M13 6l5 5',
    archive: 'M3 3h18v5H3z M5 8v13h14V8 M10 12h4',
    chevronLeft: 'm15 5-7 7 7 7',
    chevronRight: 'm9 5 7 7-7 7',
};
export function Icon({
    name,
    className = '',
}: {
    name: IconName;
    className?: string;
}) {
    return (
        <svg
            className={`icon ${className}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {name === 'brandKey' || name === 'keys' ? (
                <use href="./chavenuarte-key.svg#chavenuarte-key" />
            ) : (
                <path d={paths[name]} />
            )}
        </svg>
    );
}
