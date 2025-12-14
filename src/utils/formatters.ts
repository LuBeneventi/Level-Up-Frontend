// level-up-gaming-frontend/src/utils/formatters.ts

/**
 * Formatadores reutilizables para la aplicación
 */

// Formateador de moneda CLP
export const CLP_FORMATTER = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
});

/**
 * Formatea un número a moneda CLP
 * @param amount Cantidad a formatear
 * @returns String con formato de moneda CLP
 */
export const formatClp = (amount: number): string => {
    return CLP_FORMATTER.format(amount);
};

/**
 * Formatea una fecha a formato local (es-CL)
 * @param date Fecha a formatear
 * @returns String con fecha formateada
 */
export const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CL');
};

/**
 * Formatea una fecha y hora a formato local (es-CL)
 * @param date Fecha y hora a formatear
 * @returns String con fecha y hora formateadas
 */
export const formatDateTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('es-CL');
};

export default {
    CLP_FORMATTER,
    formatClp,
    formatDate,
    formatDateTime,
};
