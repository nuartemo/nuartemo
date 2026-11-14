import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { KeyList } from './KeyList';
import { createDemoSnapshot } from '../dev/fixtures';
vi.mock('./Dialog', () => ({
    Dialog: ({ children, title }: { children: ReactNode; title: string }) => (
        <section role="dialog" aria-label={title}>
            {children}
        </section>
    ),
}));
describe('transição entre detalhes e ações administrativas', () => {
    it.each(['Editar chave', 'Bloquear chave', 'Arquivar chave'])(
        'fecha os detalhes antes de abrir %s, preservando o acesso ao aviso de desfazer',
        async (label) => {
            const snapshot = createDemoSnapshot();
            const callbacks = {
                onEdit: vi.fn(),
                onBlock: vi.fn(),
                onArchive: vi.fn(),
            };
            render(
                <KeyList
                    snapshot={snapshot}
                    role="supervisor"
                    onOperate={vi.fn()}
                    onHistory={vi.fn()}
                    {...callbacks}
                />,
            );
            await userEvent.click(
                screen.getByRole('button', { name: 'Ver detalhes: Auditório' }),
            );
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            await userEvent.click(screen.getByRole('button', { name: label }));
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            const handler =
                label === 'Editar chave'
                    ? callbacks.onEdit
                    : label === 'Bloquear chave'
                      ? callbacks.onBlock
                      : callbacks.onArchive;
            expect(handler).toHaveBeenCalledWith(snapshot.keys[4]);
        },
    );
});
