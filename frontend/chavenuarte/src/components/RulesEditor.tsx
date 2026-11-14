import { DateTimeFields } from './DateTimeFields';
import type { AccessRules, KeyBlock, TeamMember } from '../types/domain';
import { addMinutes, localNow } from '../services/date-time';
import { weekdayLabels } from '../services/rules';
const days = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
];
export function RulesEditor({
    rules,
    onChange,
    members,
}: {
    rules: AccessRules;
    onChange: (rules: AccessRules) => void;
    members: TeamMember[];
}) {
    return (
        <div className="rules-editor">
            <fieldset>
                <legend>Dias autorizados</legend>
                <div className="weekday-picker">
                    {weekdayLabels.map((day, index) => (
                        <label key={day}>
                            <input
                                aria-label={days[index]}
                                type="checkbox"
                                checked={rules.weekdays.includes(index)}
                                onChange={(event) =>
                                    onChange({
                                        ...rules,
                                        weekdays: event.target.checked
                                            ? [...rules.weekdays, index].sort()
                                            : rules.weekdays.filter(
                                                  (value) => value !== index,
                                              ),
                                    })
                                }
                            />
                            {day}
                        </label>
                    ))}
                </div>
            </fieldset>
            <fieldset>
                <legend>Horários para iniciar a retirada</legend>
                <p className="field-hint">
                    Sem faixas, qualquer horário é permitido.
                </p>
                {rules.windows.map((window, index) => (
                    <div className="rule-window" key={index}>
                        <label>
                            Início
                            <input
                                aria-label={`Faixa ${index + 1}: início`}
                                inputMode="numeric"
                                placeholder="08:00"
                                maxLength={5}
                                value={window.start}
                                onChange={(event) =>
                                    onChange({
                                        ...rules,
                                        windows: rules.windows.map((item, i) =>
                                            i === index
                                                ? {
                                                      ...item,
                                                      start: event.target.value,
                                                  }
                                                : item,
                                        ),
                                    })
                                }
                            />
                        </label>
                        <label>
                            Fim
                            <input
                                aria-label={`Faixa ${index + 1}: fim`}
                                inputMode="numeric"
                                placeholder="18:00"
                                maxLength={5}
                                value={window.end}
                                onChange={(event) =>
                                    onChange({
                                        ...rules,
                                        windows: rules.windows.map((item, i) =>
                                            i === index
                                                ? {
                                                      ...item,
                                                      end: event.target.value,
                                                  }
                                                : item,
                                        ),
                                    })
                                }
                            />
                        </label>
                        <button
                            className="button button-danger-quiet"
                            type="button"
                            aria-label={`Remover faixa ${index + 1}`}
                            onClick={() =>
                                onChange({
                                    ...rules,
                                    windows: rules.windows.filter(
                                        (_, i) => i !== index,
                                    ),
                                })
                            }
                        >
                            Remover
                        </button>
                    </div>
                ))}
                <button
                    className="text-button"
                    type="button"
                    onClick={() =>
                        onChange({
                            ...rules,
                            windows: [
                                ...rules.windows,
                                { start: '08:00', end: '18:00' },
                            ],
                        })
                    }
                >
                    Adicionar faixa horária
                </button>
            </fieldset>
            <label>
                Duração máxima (minutos)
                <input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="Sem limite específico"
                    value={rules.maxDurationMinutes ?? ''}
                    onChange={(event) =>
                        onChange({
                            ...rules,
                            maxDurationMinutes:
                                event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                        })
                    }
                />
            </label>
            <fieldset>
                <legend>Pessoas autorizadas</legend>
                <p className="field-hint">
                    Nenhuma seleção libera todas as pessoas com acesso ao
                    painel. Marque para restringir.
                </p>
                <div className="member-checklist">
                    {members
                        .filter((member) => member.role !== 'unauthorized')
                        .map((member) => (
                            <label key={member.id}>
                                <input
                                    type="checkbox"
                                    checked={rules.allowedMemberIds.includes(
                                        member.id,
                                    )}
                                    onChange={(event) =>
                                        onChange({
                                            ...rules,
                                            allowedMemberIds: event.target
                                                .checked
                                                ? [
                                                      ...rules.allowedMemberIds,
                                                      member.id,
                                                  ]
                                                : rules.allowedMemberIds.filter(
                                                      (id) => id !== member.id,
                                                  ),
                                        })
                                    }
                                />
                                <span>
                                    {member.name}
                                    <small>{member.registration}</small>
                                </span>
                            </label>
                        ))}
                </div>
            </fieldset>
        </div>
    );
}
export function BlockEditor({
    block,
    onChange,
}: {
    block: KeyBlock | null;
    onChange: (block: KeyBlock | null) => void;
}) {
    return (
        <div className="block-editor">
            <label>
                Bloqueio da chave
                <select
                    value={block?.kind ?? 'none'}
                    onChange={(event) =>
                        onChange(
                            event.target.value === 'none'
                                ? null
                                : {
                                      kind: event.target
                                          .value as KeyBlock['kind'],
                                      reason: block?.reason ?? '',
                                      startsAt: localNow().slice(0, 16),
                                      endsAt: addMinutes(localNow(), 60).slice(
                                          0,
                                          16,
                                      ),
                                  },
                        )
                    }
                >
                    <option value="none">Sem bloqueio</option>
                    <option value="temporary">Temporário</option>
                    <option value="permanent">Permanente</option>
                </select>
            </label>
            {block && (
                <>
                    <p className="field-hint">
                        O bloqueio impede retiradas e agendamentos que coincidam
                        com o período. Não cancela os registros existentes.
                    </p>
                    {block.kind === 'temporary' && (
                        <>
                            <DateTimeFields
                                label="Início do bloqueio"
                                value={block.startsAt ?? ''}
                                onChange={(startsAt) =>
                                    onChange({ ...block, startsAt })
                                }
                            />
                            <DateTimeFields
                                label="Fim do bloqueio"
                                value={block.endsAt ?? ''}
                                onChange={(endsAt) =>
                                    onChange({ ...block, endsAt })
                                }
                            />
                        </>
                    )}
                    <label>
                        Motivo do bloqueio
                        <textarea
                            rows={2}
                            value={block.reason}
                            onChange={(event) =>
                                onChange({
                                    ...block,
                                    reason: event.target.value,
                                })
                            }
                            maxLength={500}
                        />
                    </label>
                </>
            )}
        </div>
    );
}
