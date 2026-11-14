import type { AccessRules, KeyBlock } from '../types/domain';
import { parseLocal, validTime } from './date-time';
export const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export function unrestrictedRules(): AccessRules {
    return {
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        windows: [],
        maxDurationMinutes: null,
        allowedMemberIds: [],
    };
}
export function validateRules(rules: AccessRules): void {
    if (
        !rules.weekdays.length ||
        rules.weekdays.some(
            (day) => !Number.isInteger(day) || day < 0 || day > 6,
        )
    )
        throw new Error('Selecione ao menos um dia da semana válido.');
    for (const window of rules.windows) {
        if (
            !validTime(window.start) ||
            !validTime(window.end) ||
            window.start >= window.end
        )
            throw new Error(
                'Confira as faixas horárias. Use HH:MM e início antes do fim.',
            );
    }
    if (
        rules.maxDurationMinutes !== null &&
        (!Number.isInteger(rules.maxDurationMinutes) ||
            rules.maxDurationMinutes < 1)
    )
        throw new Error(
            'A duração máxima deve ser um número inteiro de minutos maior que zero.',
        );
    if (rules.allowedMemberIds.some((id) => !Number.isInteger(id) || id < 1))
        throw new Error('Selecione pessoas válidas para a restrição.');
}
export function validateBlock(block: KeyBlock | null, now: string): void {
    if (!block) return;
    if (!block.reason.trim()) throw new Error('Informe o motivo do bloqueio.');
    if (block.kind === 'temporary') {
        const start = parseLocal(block.startsAt ?? ''),
            end = parseLocal(block.endsAt ?? '');
        if (
            !Number.isFinite(start) ||
            !Number.isFinite(end) ||
            end <= start ||
            end <= parseLocal(now)
        )
            throw new Error(
                'O bloqueio temporário precisa de início válido e fim futuro, depois do início.',
            );
    }
}
export function enforceRules(
    rules: AccessRules,
    start: string,
    end: string,
    memberId: number,
): void {
    validateRules(rules);
    const from = parseLocal(start),
        to = parseLocal(end);
    if (
        rules.allowedMemberIds.length &&
        !rules.allowedMemberIds.includes(memberId)
    )
        throw new Error('Esta chave não está liberada para sua matrícula.');
    if (
        rules.maxDurationMinutes !== null &&
        to - from > rules.maxDurationMinutes * 60_000
    )
        throw new Error(
            `A duração máxima permitida é de ${rules.maxDurationMinutes} minutos.`,
        );
    if (to - from >= 7 * 86_400_000 && new Set(rules.weekdays).size < 7)
        throw new Error('O período inclui um dia não autorizado.');
    for (
        let day = Math.floor(from / 86_400_000) * 86_400_000;
        day < to && day < from + 8 * 86_400_000;
        day += 86_400_000
    ) {
        if (!rules.weekdays.includes(new Date(day).getUTCDay()))
            throw new Error('O período inclui um dia não autorizado.');
    }
    const time = start.slice(11, 16);
    if (
        rules.windows.length &&
        !rules.windows.some(
            (window) => window.start <= time && time <= window.end,
        )
    )
        throw new Error(
            'O início da retirada está fora dos horários autorizados.',
        );
}
export function rulesSummary(rules: AccessRules): string[] {
    const summary: string[] = [];
    if (new Set(rules.weekdays).size < 7)
        summary.push(
            `Dias: ${rules.weekdays.map((day) => weekdayLabels[day]).join(', ')}`,
        );
    if (rules.windows.length)
        summary.push(
            `Início da retirada: ${rules.windows.map((window) => `${window.start}–${window.end}`).join(', ')}`,
        );
    if (rules.maxDurationMinutes !== null)
        summary.push(`Até ${rules.maxDurationMinutes} minutos`);
    if (rules.allowedMemberIds.length)
        summary.push(
            `Acesso limitado a ${rules.allowedMemberIds.length} pessoa(s)`,
        );
    return summary;
}
