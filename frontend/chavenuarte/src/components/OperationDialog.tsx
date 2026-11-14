import { useEffect, useRef, useState } from 'react';
import { Dialog } from './Dialog';
import { DateTimeFields } from './DateTimeFields';
import { EmptyState } from './States';
import { addMinutes, localNow, parseLocal } from '../services/date-time';
import {
    formatDateTime,
    keyStatus,
    locationLabel,
} from '../services/selectors';
import type {
    DashboardSnapshot,
    KeyService,
    ReservationRequest,
} from '../types/domain';
export type OperationKind = 'withdrawal' | 'return' | 'schedule';
export function OperationDialog({
    kind,
    snapshot,
    service,
    keyId: initialKeyId,
    onComplete,
    onClose,
}: {
    kind: OperationKind;
    snapshot: DashboardSnapshot;
    service: KeyService;
    keyId?: number;
    onComplete: (snapshot: DashboardSnapshot, message: string) => void;
    onClose: () => void;
}) {
    const returning = kind === 'return';
    const candidates = snapshot.keys.filter((key) =>
        returning
            ? snapshot.reservations.some(
                  (item) =>
                      item.keyId === key.id && item.status === 'checked_out',
              )
            : key.active,
    );
    const [keyId, setKeyId] = useState(
        initialKeyId ??
            candidates.find((item) => keyStatus(item, snapshot) === 'available')
                ?.id ??
            candidates[0]?.id ??
            0,
    );
    const [mode, setMode] = useState<'now' | 'schedule'>(
        kind === 'schedule' ? 'schedule' : 'now',
    );
    const [startsAt, setStartsAt] = useState(
        addMinutes(localNow(), 60).slice(0, 16),
    );
    const [endsAt, setEndsAt] = useState(
        addMinutes(localNow(), 120).slice(0, 16),
    );
    const [purpose, setPurpose] = useState('');
    const [notes, setNotes] = useState('');
    const [review, setReview] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const controller = useRef<AbortController | null>(null);
    useEffect(() => () => controller.current?.abort(), []);
    const key = snapshot.keys.find((item) => item.id === keyId);
    const open = snapshot.reservations.find(
        (item) => item.keyId === keyId && item.status === 'checked_out',
    );
    const title = returning
        ? 'Devolver chave'
        : mode === 'schedule'
          ? 'Agendar retirada'
          : 'Retirar chave';
    function validate(): ReservationRequest {
        const from = mode === 'now' ? localNow() : startsAt;
        if (!key) throw new Error('Selecione uma chave.');
        if (
            !Number.isFinite(parseLocal(from)) ||
            !Number.isFinite(parseLocal(endsAt))
        )
            throw new Error(
                'Informe datas válidas e horários entre 00:00 e 23:59.',
            );
        if (parseLocal(endsAt) <= parseLocal(from))
            throw new Error('A devolução prevista deve ser depois do início.');
        if (mode === 'schedule' && parseLocal(from) < parseLocal(localNow()))
            throw new Error('Escolha um horário de início no futuro.');
        if (!purpose.trim())
            throw new Error('Informe a finalidade da retirada.');
        return {
            keyId,
            mode,
            startsAt: mode === 'schedule' ? startsAt : undefined,
            endsAt,
            purpose,
            notes,
        };
    }
    async function confirm() {
        setError('');
        setPending(true);
        controller.current = new AbortController();
        try {
            const result = returning
                ? await service.returnKey(
                      { reservationId: open?.id ?? -1, notes },
                      controller.current.signal,
                  )
                : await service.reserve(validate(), controller.current.signal);
            onComplete(
                result,
                returning
                    ? 'Devolução registrada.'
                    : mode === 'schedule'
                      ? 'Agendamento confirmado.'
                      : 'Retirada registrada.',
            );
        } catch (cause) {
            if (controller.current.signal.aborted) return;
            setError(
                cause instanceof Error
                    ? cause.message
                    : 'Não foi possível concluir.',
            );
            setPending(false);
        }
    }
    return (
        <Dialog title={title} onClose={onClose}>
            {!candidates.length ? (
                <EmptyState
                    title={
                        returning
                            ? 'Nenhuma devolução pendente'
                            : 'Nenhuma chave disponível'
                    }
                    description={
                        returning
                            ? 'Não há retiradas abertas para devolver.'
                            : 'Não há chaves ativas para movimentação.'
                    }
                />
            ) : (
                <form
                    className="dialog-body operation-form"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        setError('');
                        if (returning || review) {
                            void confirm();
                            return;
                        }
                        try {
                            validate();
                            setReview(true);
                        } catch (cause) {
                            setError(
                                cause instanceof Error
                                    ? cause.message
                                    : 'Confira os campos.',
                            );
                        }
                    }}
                >
                    {!returning && !review && (
                        <fieldset className="mode-picker">
                            <legend>Quando deseja retirar?</legend>
                            <label>
                                <input
                                    type="radio"
                                    name="operation-mode"
                                    checked={mode === 'now'}
                                    onChange={() => {
                                        setMode('now');
                                        setError('');
                                    }}
                                />
                                Retirar agora
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="operation-mode"
                                    checked={mode === 'schedule'}
                                    onChange={() => {
                                        setMode('schedule');
                                        setError('');
                                    }}
                                />
                                Agendar retirada
                            </label>
                        </fieldset>
                    )}
                    {!review && (
                        <label>
                            Chave e espaço
                            <select
                                aria-label="Chave e espaço"
                                value={keyId}
                                disabled={pending}
                                onChange={(event) => {
                                    setKeyId(Number(event.target.value));
                                    setError('');
                                }}
                            >
                                {candidates.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.code} · {item.name}
                                        {keyStatus(item, snapshot) === 'blocked'
                                            ? ' · Bloqueada'
                                            : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    {returning && open && (
                        <>
                            <dl className="summary-list">
                                <div>
                                    <dt>Responsável pela retirada</dt>
                                    <dd>
                                        {open.borrower} · {open.registration}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Retirada registrada</dt>
                                    <dd>
                                        {formatDateTime(open.checkedOutAt!)}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Devolução prevista</dt>
                                    <dd>{formatDateTime(open.endsAt)}</dd>
                                </div>
                                <div>
                                    <dt>Finalidade</dt>
                                    <dd>{open.purpose}</dd>
                                </div>
                            </dl>
                            <p className="field-hint">
                                O horário real da devolução será registrado ao
                                confirmar.
                            </p>
                            <label>
                                Observação final (opcional)
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    maxLength={1000}
                                />
                            </label>
                        </>
                    )}
                    {!returning && !review && (
                        <>
                            <p className="location-line">
                                {key && locationLabel(key, snapshot)}
                            </p>
                            <div className="field-grid">
                                <label>
                                    Operador
                                    <input
                                        readOnly
                                        value={snapshot.currentUser.name}
                                    />
                                </label>
                                <label>
                                    Matrícula
                                    <input
                                        readOnly
                                        value={
                                            snapshot.currentUser.registration
                                        }
                                    />
                                </label>
                            </div>
                            {mode === 'schedule' ? (
                                <DateTimeFields
                                    label="Início previsto"
                                    value={startsAt}
                                    onChange={setStartsAt}
                                    minDate={localNow().slice(0, 10)}
                                />
                            ) : (
                                <p className="field-hint">
                                    A retirada será registrada com o horário do
                                    sistema ao confirmar.
                                </p>
                            )}
                            <DateTimeFields
                                label="Devolução prevista"
                                value={endsAt}
                                onChange={setEndsAt}
                                minDate={localNow().slice(0, 10)}
                            />
                            <label>
                                Finalidade
                                <textarea
                                    rows={2}
                                    value={purpose}
                                    onChange={(event) =>
                                        setPurpose(event.target.value)
                                    }
                                    maxLength={500}
                                    placeholder="Ex.: ensaio de música"
                                />
                            </label>
                            <label>
                                Observações (opcional)
                                <textarea
                                    rows={2}
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    maxLength={1000}
                                />
                            </label>
                        </>
                    )}
                    {!returning && review && (
                        <>
                            <h3>Confira antes de confirmar</h3>
                            <dl className="summary-list">
                                <div>
                                    <dt>Chave</dt>
                                    <dd>
                                        {key?.code} · {key?.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Sala</dt>
                                    <dd>
                                        {key && locationLabel(key, snapshot)}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Operador</dt>
                                    <dd>
                                        {snapshot.currentUser.name} ·{' '}
                                        {snapshot.currentUser.registration}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Início</dt>
                                    <dd>
                                        {mode === 'now'
                                            ? 'Agora, com horário registrado pelo sistema'
                                            : formatDateTime(startsAt)}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Devolução prevista</dt>
                                    <dd>{formatDateTime(endsAt)}</dd>
                                </div>
                                <div>
                                    <dt>Finalidade</dt>
                                    <dd>{purpose}</dd>
                                </div>
                                {notes && (
                                    <div>
                                        <dt>Observações</dt>
                                        <dd>{notes}</dd>
                                    </div>
                                )}
                            </dl>
                            {mode === 'schedule' && (
                                <p className="field-hint">
                                    O agendamento reserva o período. A retirada
                                    física será registrada separadamente.
                                </p>
                            )}
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
                            onClick={() =>
                                review ? setReview(false) : onClose()
                            }
                        >
                            {review ? 'Editar dados' : 'Cancelar'}
                        </button>
                        <button
                            type="submit"
                            className="button button-primary"
                            disabled={
                                pending || Boolean(snapshot.pendingChange)
                            }
                        >
                            {pending
                                ? 'Registrando…'
                                : returning
                                  ? 'Confirmar devolução'
                                  : review
                                    ? mode === 'schedule'
                                        ? 'Confirmar agendamento'
                                        : 'Confirmar retirada'
                                    : 'Continuar'}
                        </button>
                    </div>
                </form>
            )}
        </Dialog>
    );
}
