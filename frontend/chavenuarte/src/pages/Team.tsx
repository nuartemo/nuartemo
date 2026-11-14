import { useState } from 'react';
import { canManageMember, roleLabels } from '../permissions/access';
import { EmptyState } from '../components/States';
import { Icon } from '../components/Icon';
import { UserAvatar } from '../components/UserAvatar';
import { Dialog } from '../components/Dialog';
import { DateTimeFields } from '../components/DateTimeFields';
import { addMinutes, localNow, parseLocal } from '../services/date-time';
import { formatDateTime, memberStatus } from '../services/selectors';
import type {
    DashboardSnapshot,
    KeyService,
    Role,
    TeamMember,
} from '../types/domain';
const statusText = {
    active: 'Ativo',
    suspended: 'Suspenso',
    revoked: 'Sem vínculo',
};
export function Team({
    snapshot,
    service,
}: {
    snapshot: DashboardSnapshot;
    service: KeyService;
}) {
    const [query, setQuery] = useState('');
    const [role, setRole] = useState<Role | 'all'>('all');
    const [selected, setSelected] = useState<TeamMember | null>(null);
    const members = snapshot.team.filter(
        (member) =>
            `${member.name} ${member.registration}`
                .toLocaleLowerCase('pt-BR')
                .includes(query.toLocaleLowerCase('pt-BR')) &&
            (role === 'all' || member.role === role),
    );
    return (
        <>
            <section className="panel">
                <div className="catalog-toolbar">
                    <label className="search-field">
                        <Icon name="search" />
                        <span className="sr-only">
                            Buscar nome ou matrícula
                        </span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar nome ou matrícula"
                        />
                    </label>
                    <label>
                        <span className="sr-only">Filtrar por cargo</span>
                        <select
                            value={role}
                            onChange={(event) =>
                                setRole(event.target.value as Role | 'all')
                            }
                        >
                            <option value="all">Todos os cargos</option>
                            {Object.entries(roleLabels).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>
                </div>
                {members.length ? (
                    <ul className="team-list">
                        {members.map((member) => (
                            <li key={member.id}>
                                <UserAvatar user={member} />
                                <div className="team-person">
                                    <strong>{member.name}</strong>
                                    <span>
                                        {member.registration} ·{' '}
                                        {roleLabels[member.role]}
                                    </span>
                                    <span
                                        className={
                                            memberStatus(member) === 'suspended'
                                                ? 'text-danger'
                                                : 'muted-note'
                                        }
                                    >
                                        {statusText[memberStatus(member)]}
                                        {memberStatus(member) === 'suspended' &&
                                        member.suspendedUntil
                                            ? ` até ${formatDateTime(member.suspendedUntil)}`
                                            : ''}
                                    </span>
                                </div>
                                {canManageMember(
                                    snapshot.currentUser.role,
                                    member,
                                ) ? (
                                    <button
                                        className="button button-secondary"
                                        aria-label={`Gerenciar ${member.name}`}
                                        disabled={Boolean(
                                            snapshot.pendingChange,
                                        )}
                                        onClick={() => setSelected(member)}
                                    >
                                        Gerenciar
                                    </button>
                                ) : (
                                    <span className="muted-note protected-label">
                                        Acesso protegido
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState
                        title="Nenhuma pessoa encontrada"
                        description="Tente outro nome, matrícula ou cargo."
                    />
                )}
            </section>
            {selected && (
                <TeamEditor
                    member={selected}
                    snapshot={snapshot}
                    service={service}
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    );
}
function TeamEditor({
    member,
    snapshot,
    service,
    onClose,
}: {
    member: TeamMember;
    snapshot: DashboardSnapshot;
    service: KeyService;
    onClose: () => void;
}) {
    const [action, setAction] = useState('role');
    const [role, setRole] = useState<Role>(
        member.role === 'unauthorized' ? 'bolsista' : member.role,
    );
    const [until, setUntil] = useState(
        addMinutes(localNow(), 1440).slice(0, 16),
    );
    const [review, setReview] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const actor = snapshot.currentUser;
    const options =
        actor.role === 'supervisor'
            ? Object.entries(roleLabels)
            : Object.entries(roleLabels).filter(([value]) =>
                  ['bolsista', 'unauthorized'].includes(value),
              );
    const revoking =
        action === 'revoke' || (action === 'role' && role === 'unauthorized');
    const suspending = action.startsWith('suspend');
    const ranks: Record<Role, number> = {
        unauthorized: 0,
        bolsista: 1,
        admin: 2,
        supervisor: 3,
    };
    const demoting = action === 'role' && ranks[role] < ranks[member.role];
    return (
        <Dialog
            title={`Gerenciar acesso: ${member.name}`}
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
                        if (
                            action === 'suspend-temp' &&
                            (!Number.isFinite(parseLocal(until)) ||
                                parseLocal(until) <= parseLocal(localNow()))
                        )
                            throw new Error(
                                'Informe uma data e horário futuros para a reativação.',
                            );
                        if (!review) {
                            setReview(true);
                            return;
                        }
                        setPending(true);
                        await service.stageAdmin({
                            type: 'team-access',
                            userId: member.id,
                            role: revoking
                                ? 'unauthorized'
                                : suspending
                                  ? member.role
                                  : role,
                            status: revoking
                                ? 'revoked'
                                : suspending
                                  ? 'suspended'
                                  : action === 'reactivate'
                                    ? 'active'
                                    : member.status,
                            suspendedUntil:
                                action === 'suspend-temp' ? until : null,
                        });
                        onClose();
                    } catch (cause) {
                        setError(
                            cause instanceof Error
                                ? cause.message
                                : 'Não foi possível alterar o acesso.',
                        );
                        setPending(false);
                    }
                }}
            >
                <p className="muted-note">
                    {member.registration} · {roleLabels[member.role]}
                </p>
                {!review ? (
                    <>
                        <label>
                            Ação
                            <select
                                value={action}
                                onChange={(event) =>
                                    setAction(event.target.value)
                                }
                            >
                                <option value="role">Alterar cargo</option>
                                <option value="suspend-temp">
                                    Suspender temporariamente
                                </option>
                                <option value="suspend-permanent">
                                    Suspender por tempo indeterminado
                                </option>
                                <option value="revoke">
                                    Remover vínculo / permissão
                                </option>
                                {memberStatus(member) !== 'active' && (
                                    <option value="reactivate">
                                        Reativar acesso
                                    </option>
                                )}
                            </select>
                        </label>
                        {(action === 'role' || action === 'reactivate') && (
                            <label>
                                Cargo
                                <select
                                    value={role}
                                    onChange={(event) =>
                                        setRole(event.target.value as Role)
                                    }
                                >
                                    {options.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                        {action === 'suspend-temp' && (
                            <DateTimeFields
                                label="Reativação prevista"
                                value={until}
                                onChange={setUntil}
                                minDate={localNow().slice(0, 10)}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <h3>Confirmar alteração de acesso</h3>
                        <p>
                            {revoking
                                ? `Remover a permissão de ${member.name}?`
                                : suspending
                                  ? `Suspender o acesso de ${member.name}${action === 'suspend-temp' ? ` até ${formatDateTime(until)}` : ' por tempo indeterminado'}?`
                                  : `${action === 'reactivate' ? 'Reativar' : 'Alterar'} ${member.name} como ${roleLabels[role]}?`}
                        </p>
                        <p className="field-hint">
                            O identificador e o histórico de movimentações serão
                            preservados. Você terá 5 segundos para desfazer.
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
                        className="button button-secondary"
                        type="button"
                        disabled={pending}
                        onClick={() => (review ? setReview(false) : onClose())}
                    >
                        {review ? 'Editar dados' : 'Cancelar'}
                    </button>
                    <button
                        className={`button ${revoking || suspending || demoting ? 'button-danger' : 'button-primary'}`}
                        disabled={pending}
                        type="submit"
                    >
                        {pending
                            ? 'Aguarde…'
                            : review
                              ? 'Confirmar alteração'
                              : 'Continuar'}
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
