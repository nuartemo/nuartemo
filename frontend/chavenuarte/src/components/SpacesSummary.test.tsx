import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createDemoSnapshot } from '../dev/fixtures';
import { SpacesSummary } from './SpacesSummary';
describe('Nossos espaços', () => {
    it('deriva os valores do estado e não trata reserva futura como retirada', async () => {
        const snapshot = createDemoSnapshot();
        const explore = vi.fn();
        render(<SpacesSummary snapshot={snapshot} onExplore={explore} />);
        const meter = screen.getByRole('meter', {
            name: 'Disponibilidade de chaves',
        });
        expect(meter).toHaveAttribute('aria-valuenow', '5');
        expect(meter).toHaveAttribute('aria-valuemax', '7');
        expect(meter).toHaveAttribute(
            'aria-valuetext',
            '5 de 7 chaves ativas disponíveis',
        );
        await userEvent.click(
            screen.getByRole('button', { name: 'Explorar espaços' }),
        );
        expect(explore).toHaveBeenCalledOnce();
    });
    it('recalcula ao arquivar e bloquear, sem alterar as regras de estado', () => {
        const snapshot = createDemoSnapshot();
        snapshot.keys[1].active = false;
        snapshot.keys[3].block = {
            kind: 'permanent',
            reason: 'Manutenção',
            startsAt: null,
            endsAt: null,
        };
        render(<SpacesSummary snapshot={snapshot} onExplore={vi.fn()} />);
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '3');
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuemax', '6');
        expect(screen.getByText('Bloqueadas')).toBeInTheDocument();
    });
    it('trata o estado vazio sem divisões inválidas ou valores inacessíveis', () => {
        const snapshot = createDemoSnapshot();
        snapshot.keys = [];
        snapshot.reservations = [];
        render(<SpacesSummary snapshot={snapshot} onExplore={vi.fn()} />);
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuemax', '1');
        expect(screen.getByRole('meter')).toHaveAttribute(
            'aria-valuetext',
            '0 de 0 chaves ativas disponíveis',
        );
        expect(document.querySelector('.availability-available')).toHaveStyle({
            width: '0%',
        });
    });
});
