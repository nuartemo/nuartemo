import { useState } from 'react';
import type {
    DashboardSnapshot,
    Key,
    KeyBlock,
    KeyDraft,
    KeyService,
} from '../types/domain';
import { Dialog } from './Dialog';
import { BlockEditor, RulesEditor } from './RulesEditor';
import { formatDateTime, localNow } from '../services/date-time';
import {
    rulesSummary,
    unrestrictedRules,
    validateBlock,
    validateRules,
} from '../services/rules';
export function KeyEditorDialog({
    snapshot,
    service,
    item,
    onClose,
}: {
    snapshot: DashboardSnapshot;
    service: KeyService;
    item?: Key;
    onClose: () => void;
}) {
    const [draft, setDraft] = useState<KeyDraft>(() =>
        item
            ? {
                  code: item.code,
                  name: item.name,
                  description: item.description,
                  spaceId: item.spaceId,
                  rules: structuredClone(item.rules),
                  block: structuredClone(item.block),
              }
            : {
                  code: '',
                  name: '',
                  description: '',
                  spaceId: null,
                  rules: unrestrictedRules(),
                  block: null,
              },
    );
    const [review, setReview] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    return (
        <Dialog
            title={item ? 'Editar chave' : 'Criar chave'}
            onClose={() => {
                if (!pending) onClose();
            }}
        >
            <form
                className="dialog-body"
                noValidate
                onSubmit={async (event) => {
                    event.preventDefault();
                    setError('');
                    try {
                        if (!draft.code.trim() || !draft.name.trim())
                            throw new Error(
                                'Informe o código e o nome da chave.',
                            );
                        validateRules(draft.rules);
                        validateBlock(draft.block, localNow());
                        if (!review) {
                            setReview(true);
                            return;
                        }
                        setPending(true);
                        await service.stageAdmin({
                            type: 'save-key',
                            keyId: item?.id,
                            value: draft,
                        });
                        onClose();
                    } catch (cause) {
                        setError(
                            cause instanceof Error
                                ? cause.message
                                : 'Não foi possível salvar.',
                        );
                        setPending(false);
                    }
                }}
            >
                {!review ? (
                    <>
                        <div className="field-grid">
                            <label>
                                Código
                                <input
                                    value={draft.code}
                                    maxLength={30}
                                    onChange={(event) =>
                                        setDraft({
                                            ...draft,
                                            code: event.target.value,
                                        })
                                    }
                                    placeholder="CH-09"
                                />
                            </label>
                            <label>
                                Nome da chave
                                <input
                                    value={draft.name}
                                    maxLength={120}
                                    onChange={(event) =>
                                        setDraft({
                                            ...draft,
                                            name: event.target.value,
                                        })
                                    }
                                    placeholder="Chave da sala"
                                />
                            </label>
                        </div>
                        <label>
                            Sala / espaço
                            <select
                                value={
                                    draft.newSpace
                                        ? 'new'
                                        : (draft.spaceId ?? '')
                                }
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        spaceId:
                                            event.target.value &&
                                            event.target.value !== 'new'
                                                ? Number(event.target.value)
                                                : null,
                                        newSpace:
                                            event.target.value === 'new'
                                                ? {
                                                      name: '',
                                                      block: '',
                                                      room: '',
                                                  }
                                                : undefined,
                                    })
                                }
                            >
                                <option value="">Sem sala associada</option>
                                {snapshot.spaces.map((space) => (
                                    <option key={space.id} value={space.id}>
                                        {space.name} · {space.block}
                                    </option>
                                ))}
                                <option value="new">
                                    Adicionar outro espaço…
                                </option>
                            </select>
                        </label>
                        {draft.newSpace && (
                            <>
                                <label>
                                    Nome do espaço
                                    <input
                                        value={draft.newSpace.name}
                                        onChange={(event) =>
                                            setDraft({
                                                ...draft,
                                                newSpace: {
                                                    ...draft.newSpace!,
                                                    name: event.target.value,
                                                },
                                            })
                                        }
                                    />
                                </label>
                                <div className="field-grid">
                                    <label>
                                        Bloco
                                        <input
                                            value={draft.newSpace.block}
                                            onChange={(event) =>
                                                setDraft({
                                                    ...draft,
                                                    newSpace: {
                                                        ...draft.newSpace!,
                                                        block: event.target
                                                            .value,
                                                    },
                                                })
                                            }
                                        />
                                    </label>
                                    <label>
                                        Sala / andar
                                        <input
                                            value={draft.newSpace.room}
                                            onChange={(event) =>
                                                setDraft({
                                                    ...draft,
                                                    newSpace: {
                                                        ...draft.newSpace!,
                                                        room: event.target
                                                            .value,
                                                    },
                                                })
                                            }
                                        />
                                    </label>
                                </div>
                            </>
                        )}
                        <label>
                            Descrição (opcional)
                            <textarea
                                rows={2}
                                maxLength={1000}
                                value={draft.description}
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        description: event.target.value,
                                    })
                                }
                            />
                        </label>
                        <details className="advanced-settings">
                            <summary>Configurações avançadas</summary>
                            <p className="field-hint">
                                Uma chave nova segue as regras globais.
                                Acrescente restrições apenas se precisar.
                            </p>
                            <RulesEditor
                                rules={draft.rules}
                                onChange={(rules) =>
                                    setDraft({ ...draft, rules })
                                }
                                members={snapshot.team}
                            />
                            <h3>Bloqueio</h3>
                            <BlockEditor
                                block={draft.block}
                                onChange={(block) =>
                                    setDraft({ ...draft, block })
                                }
                            />
                        </details>
                    </>
                ) : (
                    <>
                        <h3>Confira a chave</h3>
                        <dl className="summary-list">
                            <div>
                                <dt>Código</dt>
                                <dd>{draft.code}</dd>
                            </div>
                            <div>
                                <dt>Nome</dt>
                                <dd>{draft.name}</dd>
                            </div>
                            <div>
                                <dt>Sala</dt>
                                <dd>
                                    {draft.newSpace?.name ??
                                        snapshot.spaces.find(
                                            (space) =>
                                                space.id === draft.spaceId,
                                        )?.name ??
                                        'Sem sala associada'}
                                </dd>
                            </div>
                            <div>
                                <dt>Descrição</dt>
                                <dd>{draft.description || '—'}</dd>
                            </div>
                            <div>
                                <dt>Regras específicas</dt>
                                <dd>
                                    {rulesSummary(draft.rules).join(' · ') ||
                                        'Sem restrições específicas'}
                                </dd>
                            </div>
                            <div>
                                <dt>Bloqueio</dt>
                                <dd>
                                    {draft.block
                                        ? `${draft.block.kind === 'permanent' ? 'Permanente' : 'Temporário'}: ${draft.block.reason}`
                                        : 'Sem bloqueio'}
                                    {draft.block?.kind === 'temporary' && (
                                        <small>
                                            {formatDateTime(
                                                draft.block.startsAt!,
                                            )}{' '}
                                            —{' '}
                                            {formatDateTime(
                                                draft.block.endsAt!,
                                            )}
                                        </small>
                                    )}
                                </dd>
                            </div>
                        </dl>
                        <p className="field-hint">
                            Você poderá desfazer a alteração por até 5 segundos.
                        </p>
                    </>
                )}
                {error && (
                    <p role="alert" className="form-error">
                        {error}
                    </p>
                )}
                <div className="dialog-actions">
                    <button
                        type="button"
                        className="button button-secondary"
                        disabled={pending}
                        onClick={() => (review ? setReview(false) : onClose())}
                    >
                        {review ? 'Editar dados' : 'Cancelar'}
                    </button>
                    <button
                        type="submit"
                        disabled={pending}
                        className="button button-primary"
                    >
                        {pending
                            ? 'Salvando…'
                            : review
                              ? item
                                  ? 'Confirmar edição'
                                  : 'Confirmar criação'
                              : 'Continuar'}
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
export function BlockDialog({
    item,
    service,
    onClose,
}: {
    item: Key;
    service: KeyService;
    onClose: () => void;
}) {
    const [block, setBlock] = useState<KeyBlock | null>({
        kind: 'permanent',
        reason: '',
        startsAt: null,
        endsAt: null,
    });
    const [review, setReview] = useState(false);
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);
    return (
        <Dialog
            title={`Bloquear ${item.code}`}
            onClose={() => {
                if (!pending) onClose();
            }}
        >
            <form
                noValidate
                className="dialog-body"
                onSubmit={async (event) => {
                    event.preventDefault();
                    setError('');
                    try {
                        if (!block)
                            throw new Error('Selecione um tipo de bloqueio.');
                        validateBlock(block, localNow());
                        if (!review) {
                            setReview(true);
                            return;
                        }
                        setPending(true);
                        await service.stageAdmin({
                            type: 'set-key-block',
                            keyId: item.id,
                            block,
                        });
                        onClose();
                    } catch (cause) {
                        setError(
                            cause instanceof Error
                                ? cause.message
                                : 'Não foi possível bloquear.',
                        );
                        setPending(false);
                    }
                }}
            >
                <p>{item.name}</p>
                {!review ? (
                    <BlockEditor block={block} onChange={setBlock} />
                ) : (
                    <>
                        <p>
                            Bloquear esta chave{' '}
                            {block?.kind === 'permanent'
                                ? 'por tempo indeterminado'
                                : 'no período informado'}
                            ?
                        </p>
                        <p>
                            <strong>Motivo:</strong> {block?.reason}
                        </p>
                        {block?.kind === 'temporary' && (
                            <p>
                                {formatDateTime(block.startsAt!)} —{' '}
                                {formatDateTime(block.endsAt!)}
                            </p>
                        )}
                        <p className="field-hint">
                            Os registros serão preservados. Você terá 5 segundos
                            para desfazer.
                        </p>
                    </>
                )}
                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}
                <div className="dialog-actions">
                    <button
                        type="button"
                        className="button button-secondary"
                        disabled={pending}
                        onClick={() => (review ? setReview(false) : onClose())}
                    >
                        {review ? 'Editar dados' : 'Cancelar'}
                    </button>
                    <button
                        className="button button-danger"
                        type="submit"
                        disabled={pending}
                    >
                        {pending
                            ? 'Aguarde…'
                            : review
                              ? 'Confirmar bloqueio'
                              : 'Continuar'}
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
