/**
 * Utilidad para el manejo de fechas
 * Ubicación: src/utils/date.js
 */

import dayjs from "dayjs";
// Plugins para tener la misma funcionalidad de moment
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import "dayjs/locale/es.js";
import "dayjs/locale/en-gb.js";

dayjs.extend(customParseFormat);

export const dateUtils = {
    /**
     * Cambia el locale globalmente
     */
    setLocale: (locale) => {
        if (!locale) return;
        const dayjsLocale = locale === 'en' ? 'en-gb' : 'es';
        dayjs.locale(dayjsLocale);
    },

    /**
     * Formatea fecha al estándar del ERP
     */
    format: (date, formatStr = "DD/MM/YYYY") => {
        if (!date) return "-";
        const m = dayjs(date);
        return m.isValid() ? m.format(formatStr) : "-";
    },

    /**
     * Fecha actual formateada
     */
    now: (formatStr = "DD/MM/YYYY") => dayjs().format(formatStr),

    /**
     * Instancia base (Mantenemos el nombre 'moment' para que nada se rompa en otras vistas)
     */
    moment: (...args) => dayjs(...args),

    /**
     * Instancia base (Nombre correcto)
     */
    dayjs: (...args) => dayjs(...args),
};

/**
 * Parsea un texto pegado o escrito a ISO (YYYY-MM-DD).
 * Acepta los formatos de las páginas del gobierno y el ISO del input nativo.
 * Devuelve null si no es una fecha válida.
 * @param {string|null|undefined} texto
 * @returns {string|null}
 */
export function parsearFechaFlexible(texto) {
    if (texto === null || texto === undefined) return null;
    const limpio = String(texto).trim();
    if (!limpio) return null;
    const formatos = [
        'DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'D-M-YYYY',
        'DD.MM.YYYY', 'D.M.YYYY', 'YYYY-MM-DD',
    ];
    const m = dayjs(limpio, formatos, true);
    return m.isValid() ? m.format('YYYY-MM-DD') : null;
}

export default dateUtils;