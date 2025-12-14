import { describe, it, expect } from 'vitest';
import { validateRut } from '../../src/utils/userUtils';

describe('Lógica de Validación de RUT - validateRut', () => {

    // --- Casos Válidos ---
    it('1. debe validar un RUT correcto con puntos y guion', () => {
        expect(validateRut('20.779.780-4')).toBe(true);
    });

    it('2. debe validar un RUT correcto sin formato', () => {
        expect(validateRut('207797804')).toBe(true);
    });

    it('3. debe validar un RUT correcto con dígito verificador K (mayúscula)', () => {
        expect(validateRut('19.815.993-K')).toBe(true);
    });

    it('4. debe validar un RUT correcto con dígito verificador k (minúscula)', () => {
        expect(validateRut('19.815.993-k')).toBe(true);
    });

    it('5. debe validar un RUT correcto con dígito verificador 0', () => {
        expect(validateRut('81.743.995-0')).toBe(true);
    });

    // --- Casos Inválidos ---
    it('6. debe rechazar un RUT con dígito verificador incorrecto', () => {
        expect(validateRut('19.815.993-6')).toBe(false);
    });

    it('7. debe rechazar un RUT demasiado corto', () => {
        expect(validateRut('123-4')).toBe(false);
    });

    it('8. debe rechazar un RUT con caracteres no válidos', () => {
        expect(validateRut('19.815.ABC-5')).toBe(false);
    });

    it('9. debe rechazar un input vacío o nulo', () => {
        expect(validateRut('')).toBe(false);
    });


    // Función auxiliar idéntica al algoritmo del código original
    const calculateDv = (body: string): string => {
        let sum = 0;
        let multiplier = 2;

        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i], 10) * multiplier;
            multiplier++;

            if (multiplier > 7) multiplier = 2;
        }

        const calc = 11 - (sum % 11);

        if (calc === 11) return '0';
        if (calc === 10) return 'K';
        return calc.toString();
    };
    describe('Cálculo del Dígito Verificador - Algoritmo interno', () => {

    const tests = [
        { body: '19815993', dv: 'K' },
        { body: '15111111', dv: '4' },
        { body: '14222222', dv: '1' },
        { body: '1234567',  dv: '4' },
        { body: '20000000', dv: '5' },
        { body: '11111111', dv: '1' },
        { body: '00000001', dv: '9' },
        { body: '00000000', dv: '0' },
    ];

    tests.forEach(({ body, dv }) => {
        it(`DV de ${body} debe ser ${dv}`, () => {
            expect(calculateDv(body)).toBe(dv);
        });
    });
});
});
