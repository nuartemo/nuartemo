import { useLayoutEffect, useState } from 'react';
import { applyTheme, persistTheme, readTheme } from '../theme/preference';
import { Icon } from './Icon';

export function ThemeToggle() {
    const [theme, setTheme] = useState(readTheme);
    useLayoutEffect(() => applyTheme(theme), [theme]);
    const label = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
    return (
        <button
            type="button"
            className="icon-button theme-toggle"
            aria-label={label}
            title={label}
            aria-pressed={theme === 'dark'}
            onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark';
                persistTheme(next);
                setTheme(next);
            }}
        >
            <Icon key={theme} name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
    );
}
