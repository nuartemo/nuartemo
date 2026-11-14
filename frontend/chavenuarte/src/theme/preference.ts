export type Theme = 'light' | 'dark';
export const themePreferenceKey = 'chavenuarte.theme';

export function readTheme(): Theme {
    try {
        return localStorage.getItem(themePreferenceKey) === 'dark'
            ? 'dark'
            : 'light';
    } catch {
        return 'light';
    }
}

export function applyTheme(theme: Theme): void {
    const root = document.documentElement;
    // Swap text and surfaces together, avoiding low-contrast intermediate frames.
    root.classList.add('theme-applying');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const browserColor = getComputedStyle(root)
        .getPropertyValue('--mobile-chrome-bg')
        .trim();
    const browserTheme = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]',
    );
    if (browserTheme && browserColor) {
        browserTheme.content = browserColor;
    }
    void root.offsetWidth;
    root.classList.remove('theme-applying');
}

export function persistTheme(theme: Theme): void {
    try {
        localStorage.setItem(themePreferenceKey, theme);
    } catch {
        // The current session remains usable if browser storage is unavailable.
    }
}

export function initializeTheme(): void {
    applyTheme(readTheme());
}
