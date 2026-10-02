/**
 * Etiquetas de la línea de tiempo y de los tipos de trámite del expediente de
 * radicación. Vivían duplicadas en la vista de expediente y en el listado; el
 * backend sigue siendo la fuente de verdad de los pasos (RadicacionService).
 */

export const pasos = {
  CAPACIDAD_TRANSPORTADORA: 'Capacidad transportadora',
  CARTA_DE_ACEPTACION: 'Carta de aceptación',
  INCLUSION_DE_POLIZAS: 'Inclusión de pólizas RCC y RCE',
  TARJETA_DE_OPERACION: 'Tarjeta de operación',
  RENOVACION_TARJETA: 'Renovación de tarjeta',
  DESVINCULACION: 'Desvinculación',
  DESVINCULACION_MUTUO: 'Desvinculación por mutuo acuerdo',
  DESVINCULACION_UNILATERAL: 'Desvinculación unilateral',
};

export const pasosCortos = {
  CAPACIDAD_TRANSPORTADORA: 'Capacidad',
  CARTA_DE_ACEPTACION: 'Carta',
  INCLUSION_DE_POLIZAS: 'Pólizas',
  TARJETA_DE_OPERACION: 'Tarjeta',
  RENOVACION_TARJETA: 'Renovación',
  DESVINCULACION: 'Desvinculación',
  DESVINCULACION_MUTUO: 'Mutuo acuerdo',
  DESVINCULACION_UNILATERAL: 'Unilateral',
};

export const tipos = {
  NUEVO_VEHICULO: 'Vehículo nuevo',
  CAMBIO_DE_EMPRESA: 'Cambio de empresa',
  RENOVACION: 'Renovación',
  DESVINCULACION_MUTUO: 'Desvinculación mutuo acuerdo',
  DESVINCULACION_UNILATERAL: 'Desvinculación unilateral',
};

export const etiquetaPaso = (valor) => pasos[valor] ?? valor;
export const etiquetaPasoCorta = (valor) => pasosCortos[valor] ?? valor;
export const etiquetaTipo = (valor) => tipos[valor] ?? valor;

export const colorEstado = (estado) =>
  estado === 'COMPLETADO' ? 'bg-success' : estado === 'EN_PROCESO' ? 'bg-warning text-dark' : 'bg-secondary';

/**
 * El expediente se considera completado cuando el backend cerró el último paso.
 * En ese estado la línea de tiempo deja de mostrarse.
 */
export const expedienteCompletado = (expediente) => expediente?.global_status === 'COMPLETADO';