// Un vehículo particular no tiene pólizas RCC/RCE ni tarjeta de operación: el asistente
// solo le ofrece SOAT y tecnomecánica.
import { describe, expect, it } from 'vitest';
import { esVehiculoParticular, pasosAplicables, useDocumentWizard } from '../useDocumentWizard.js';

const permisos = { can: () => true };

describe('esVehiculoParticular', () => {
    it('reconoce el tipo de servicio sin importar mayúsculas', () => {
        expect(esVehiculoParticular({ type_of_service: 'PARTICULAR' })).toBe(true);
        expect(esVehiculoParticular({ type_of_service: 'particular' })).toBe(true);
        expect(esVehiculoParticular({ type_of_service: 'PUBLICO' })).toBe(false);
        expect(esVehiculoParticular(null)).toBe(false);
        expect(esVehiculoParticular(undefined)).toBe(false);
    });
});

describe('asistente de documentos por tipo de vehículo', () => {
    it('un público recorre todos los pasos', () => {
        expect(pasosAplicables({ particular: false }).map((s) => s.key))
            .toEqual(['vehiculo', 'soat', 'poliza', 'tecnomecanica', 'tarjeta']);
    });

    it('un particular salta pólizas y tarjeta', () => {
        expect(pasosAplicables({ particular: true }).map((s) => s.key))
            .toEqual(['vehiculo', 'soat', 'tecnomecanica']);
    });

    it('del SOAT pasa directo a tecnomecánica y de ahí al perfil', () => {
        const { nextStepRoute } = useDocumentWizard();
        const particular = { particular: true };

        expect(nextStepRoute('soat', 'v1', permisos, particular).path).toBe('/vehiculos-documentos/tecnomecanica/crear');
        expect(nextStepRoute('tecnomecanica', 'v1', permisos, particular).path).toBe('/vehiculos/perfil/v1');
    });

    it('un público sigue pasando por las pólizas', () => {
        const { nextStepRoute } = useDocumentWizard();

        expect(nextStepRoute('soat', 'v1', permisos, { particular: false }).path).toBe('/vehiculos-documentos/poliza/crear');
    });

    it('hacia atrás, desde tecnomecánica de un particular vuelve al SOAT', () => {
        const { prevStepRoute } = useDocumentWizard();

        expect(prevStepRoute('tecnomecanica', 'v1', permisos, { particular: true }).path).toBe('/vehiculos-documentos/soat/crear');
    });

    it('el primer paso tras crear el vehículo es el SOAT en ambos casos', () => {
        const { firstStep } = useDocumentWizard();

        expect(firstStep(permisos, { particular: true }).key).toBe('soat');
        expect(firstStep(permisos, { particular: false }).key).toBe('soat');
    });

    it('sin contexto se comporta como antes (compatibilidad)', () => {
        const { availableSteps } = useDocumentWizard();

        expect(availableSteps(permisos).map((s) => s.key)).toContain('tarjeta');
    });
});
