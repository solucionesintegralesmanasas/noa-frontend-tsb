// Parseo flexible de fechas pegadas desde páginas del gobierno.
import { describe, expect, it } from 'vitest';
import { parsearFechaFlexible } from '../../utils/date.js';

describe('parsearFechaFlexible', () => {
    it('acepta dd/mm/aaaa', () => {
        expect(parsearFechaFlexible('14/09/2026')).toBe('2026-09-14');
    });

    it('acepta variantes de separador y dígitos', () => {
        expect(parsearFechaFlexible('14-09-2026')).toBe('2026-09-14');
        expect(parsearFechaFlexible('14.09.2026')).toBe('2026-09-14');
        expect(parsearFechaFlexible('4/9/2026')).toBe('2026-09-04');
    });

    it('acepta ISO y recorta espacios', () => {
        expect(parsearFechaFlexible('2026-09-14')).toBe('2026-09-14');
        expect(parsearFechaFlexible('  14/09/2026  ')).toBe('2026-09-14');
    });

    it('rechaza fechas imposibles y vacíos', () => {
        expect(parsearFechaFlexible('32/13/2026')).toBeNull();
        expect(parsearFechaFlexible('no-fecha')).toBeNull();
        expect(parsearFechaFlexible('')).toBeNull();
        expect(parsearFechaFlexible(null)).toBeNull();
    });
});
