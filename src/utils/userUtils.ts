// src/utils/userUtils.ts

import CHILEAN_REGIONS_DATA from '../data/chile_regions.json';

// Extrae solo los nombres de las regiones para un uso más sencillo en selects
export const CHILEAN_REGIONS: string[] = CHILEAN_REGIONS_DATA.map(region => region.region);

/**
 * Obtiene una lista de comunas para una región dada.
 * @param regionName El nombre de la región.
 * @returns Un array de nombres de comunas.
 */
export const getCommunesByRegionName = (regionName: string): string[] => {
    const region = CHILEAN_REGIONS_DATA.find(r => r.region === regionName);
    if (!region) {
        return [];
    }
    // Aplanar el array de provincias para obtener todas las comunas
    return region.provincias.flatMap(provincia => provincia.comunas);
};

/**
 * Valida un RUT chileno.
 * @param rut El RUT a validar (ej. "12.345.678-K" o "12345678K").
 * @returns true si el RUT es válido, false en caso contrario.
 */
export const validateRut = (rut: string): boolean => {
    if (!rut || typeof rut !== 'string') {
        return false;
    }

    // Limpiar el RUT de puntos y guiones
    const cleanedRut = rut.replace(/\./g, '').replace('-', '');

    // Validar formato básico (8 o 9 dígitos + dígito verificador)
    if (!/^\d{7,8}[0-9Kk]$/.test(cleanedRut)) {
        return false;
    }

    const body = cleanedRut.slice(0, -1);
    let dv = cleanedRut.slice(-1).toUpperCase();

    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * multiplier;
        multiplier++;
        if (multiplier > 7) {
            multiplier = 2;
        }
    }

    const calculatedDv = 11 - (sum % 11);
    let expectedDv: string;

    if (calculatedDv === 11) {
        expectedDv = '0';
    } else if (calculatedDv === 10) {
        expectedDv = 'K';
    } else {
        expectedDv = calculatedDv.toString();
    }

    return expectedDv === dv;
};
