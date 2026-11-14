import { describe, expect, it } from 'vitest';
import {
    addMinutes,
    combineLocal,
    formatDate,
    localNow,
    parseLocal,
    validTime,
} from './date-time';
describe('datas civis e horários', () => {
    it.each(['00:00', '09:42', '16:00', '23:59'])('aceita %s', (time) =>
        expect(validTime(time)).toBe(true),
    );
    it.each(['15:99', '24:00', '16:60', '-1:30', '9:00', '12:3', '12:30:00'])(
        'recusa %s',
        (time) => expect(validTime(time)).toBe(false),
    );
    it.each([
        '2026-02-30T16:00',
        '2026-13-01T16:00',
        '2026-02-29T16:00',
        '2026-00-10T16:00',
        '2026-11-14T15:99',
    ])('recusa data impossível %s', (value) =>
        expect(Number.isNaN(parseLocal(value))).toBe(true),
    );
    it('aceita anos bissextos e cruza meia-noite sem mudar o dia selecionado por conversão UTC', () => {
        expect(Number.isFinite(parseLocal('2028-02-29T16:00'))).toBe(true);
        expect(addMinutes('2026-11-14T23:30', 60)).toBe('2026-11-15T00:30:00');
        expect(formatDate('2026-11-14T00:15')).toBe('14/11/2026');
    });
    it('utiliza Fortaleza independentemente do fuso do navegador', () => {
        expect(localNow(new Date('2026-11-15T01:30:45Z'))).toBe(
            '2026-11-14T22:30:45',
        );
        expect(combineLocal('2026-11-15', '16:00')).toBe('2026-11-15T16:00');
        expect(() => combineLocal('2026-11-15', '15:99')).toThrow('horário');
    });
});
