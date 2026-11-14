import { useState } from 'react';
import { Icon } from '../components/Icon';
import { KeyList } from '../components/KeyList';
import { BlockDialog, KeyEditorDialog } from '../components/KeyEditorDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { can } from '../permissions/access';
import type {
    DashboardSnapshot,
    Key,
    KeyService,
    KeyStatus,
    Role,
} from '../types/domain';
import type { OperationKind } from '../components/OperationDialog';
export function Catalog({
    snapshot,
    role,
    service,
    onOperate,
    onHistory,
}: {
    snapshot: DashboardSnapshot;
    role: Role;
    service: KeyService;
    onOperate: (kind: OperationKind, keyId?: number) => void;
    onHistory: (keyId: number) => void;
}) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<KeyStatus | 'all'>('all');
    const [editor, setEditor] = useState<Key | true | null>(null);
    const [block, setBlock] = useState<Key | null>(null);
    const [confirm, setConfirm] = useState<{
        key: Key;
        kind: 'archive' | 'unblock';
    } | null>(null);
    return (
        <>
            <section className="panel">
                <div className="catalog-toolbar">
                    <label className="search-field">
                        <Icon name="search" />
                        <span className="sr-only">Buscar chave ou espaço</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar chave, código ou sala"
                        />
                    </label>
                    <label className="filter-field">
                        <span className="sr-only">
                            Filtrar por disponibilidade
                        </span>
                        <select
                            value={filter}
                            onChange={(event) =>
                                setFilter(
                                    event.target.value as KeyStatus | 'all',
                                )
                            }
                        >
                            <option value="all">Todas as situações</option>
                            <option value="available">Disponíveis</option>
                            <option value="in_use">Em uso</option>
                            <option value="blocked">Bloqueadas</option>
                            {can(role, 'manageKeys') && (
                                <option value="inactive">Arquivadas</option>
                            )}
                        </select>
                    </label>
                    {can(role, 'manageKeys') && (
                        <button
                            className="button button-secondary"
                            disabled={Boolean(snapshot.pendingChange)}
                            onClick={() => setEditor(true)}
                        >
                            <Icon name="plus" />
                            Nova chave
                        </button>
                    )}
                </div>
                <KeyList
                    snapshot={snapshot}
                    role={role}
                    query={query}
                    filter={filter}
                    onOperate={onOperate}
                    onHistory={onHistory}
                    onEdit={setEditor}
                    onBlock={(key) =>
                        key.block
                            ? setConfirm({ key, kind: 'unblock' })
                            : setBlock(key)
                    }
                    onArchive={(key) => setConfirm({ key, kind: 'archive' })}
                />
            </section>
            {editor && (
                <KeyEditorDialog
                    snapshot={snapshot}
                    service={service}
                    item={editor === true ? undefined : editor}
                    onClose={() => setEditor(null)}
                />
            )}
            {block && (
                <BlockDialog
                    item={block}
                    service={service}
                    onClose={() => setBlock(null)}
                />
            )}
            {confirm && (
                <ConfirmDialog
                    title={
                        confirm.kind === 'archive'
                            ? 'Arquivar chave'
                            : 'Desbloquear chave'
                    }
                    description={
                        confirm.kind === 'archive'
                            ? `${confirm.key.code} · ${confirm.key.name} sairá da lista de chaves ativas. O histórico será preservado. Você terá 5 segundos para desfazer.`
                            : `As retiradas de ${confirm.key.name} voltarão a seguir as regras de acesso. Você terá 5 segundos para desfazer.`
                    }
                    confirmLabel={
                        confirm.kind === 'archive'
                            ? 'Confirmar arquivamento'
                            : 'Confirmar desbloqueio'
                    }
                    danger={confirm.kind === 'archive'}
                    onClose={() => setConfirm(null)}
                    onConfirm={async () => {
                        await service.stageAdmin(
                            confirm.kind === 'archive'
                                ? { type: 'archive-key', keyId: confirm.key.id }
                                : {
                                      type: 'set-key-block',
                                      keyId: confirm.key.id,
                                      block: null,
                                  },
                        );
                    }}
                />
            )}
        </>
    );
}
