import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { keySymbolUrl } from '../panel-assets';
import { Brand } from './Brand';
it('compartilha a geometria da chave do cabeçalho legado com o favicon da V2', () => {
    const svg = readFileSync('public/chavenuarte-key.svg', 'utf8');
    expect(svg).toContain('M2.586 17.414A2 2 0 0 0 2 18.828');
    expect(svg).toContain('id="chavenuarte-key"');
    expect(svg).toContain('rx="5" fill="#24724f"');
    expect(svg).toContain('color="#ffffff"');
    render(<Brand />);
    expect(
        screen
            .getByRole('link', { name: 'ChaveNUARTE — Visão geral' })
            .querySelector('use'),
    ).toHaveAttribute('href', `${keySymbolUrl}#chavenuarte-key`);
});
