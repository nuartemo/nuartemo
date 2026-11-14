import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../components/ThemeToggle';
import {
    applyTheme,
    initializeTheme,
    readTheme,
    themePreferenceKey,
} from './preference';
afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    applyTheme('light');
});
describe('preferência visual de tema', () => {
    it('inicia claro e anuncia a ação correspondente', () => {
        localStorage.clear();
        render(<ThemeToggle />);
        expect(
            screen.getByRole('button', { name: 'Ativar tema escuro' }),
        ).toHaveAttribute('aria-pressed', 'false');
        expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    });
    it('alterna por teclado, persiste e recupera o tema após remontar', async () => {
        const first = render(<ThemeToggle />);
        screen.getByRole('button', { name: 'Ativar tema escuro' }).focus();
        await userEvent.keyboard('{Enter}');
        expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
        expect(document.documentElement.style.colorScheme).toBe('dark');
        expect(localStorage.getItem(themePreferenceKey)).toBe('dark');
        first.unmount();
        render(<ThemeToggle />);
        expect(
            screen.getByRole('button', { name: 'Ativar tema claro' }),
        ).toHaveAttribute('aria-pressed', 'true');
        await userEvent.click(
            screen.getByRole('button', { name: 'Ativar tema claro' }),
        );
        expect(localStorage.getItem(themePreferenceKey)).toBe('light');
    });
    it.each(['supervisor', 'auto', '{"role":"admin"}', 'DARK', ''])(
        'ignora preferência inválida: %s',
        (value) => {
            localStorage.setItem(themePreferenceKey, value);
            expect(readTheme()).toBe('light');
        },
    );
    it('consulta somente a chave visual, sem ler cargos ou sessões', () => {
        const spy = vi.spyOn(Storage.prototype, 'getItem');
        readTheme();
        expect(spy.mock.calls).toEqual([[themePreferenceKey]]);
    });
    it('continua alternando se o armazenamento estiver indisponível', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('storage unavailable');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('storage unavailable');
        });
        render(<ThemeToggle />);
        fireEvent.click(
            screen.getByRole('button', { name: 'Ativar tema escuro' }),
        );
        expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });
    it('aplica o tema inicial sem deixar a classe transitória na página', () => {
        localStorage.setItem(themePreferenceKey, 'dark');
        initializeTheme();
        expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
        expect(document.documentElement).not.toHaveClass('theme-applying');
    });
    it('acompanha o tema visual na cor informada ao navegador', () => {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.append(meta);
        try {
            for (const [theme, color] of [
                ['dark', '#102219'],
                ['light', '#ffffff'],
            ] as const) {
                document.documentElement.style.setProperty(
                    '--mobile-chrome-bg',
                    color,
                );
                applyTheme(theme);
                expect(meta).toHaveAttribute('content', color);
            }
        } finally {
            meta.remove();
            document.documentElement.style.removeProperty('--mobile-chrome-bg');
        }
    });
});
