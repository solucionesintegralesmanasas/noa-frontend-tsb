import { BaseService } from '@services/api/base.service.js';

/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-19
 * @module {Features.Fleet}
 * @resource {ServiceDeliveryControlSheet}
 */
class ServiceDeliveryControlSheetService extends BaseService {
    constructor() {
        super({
            resourcePath: '/control-sheets/service-delivery-control-sheets',
            metadata: { module: 'serviceDeliveryControlSheet', service: 'serviceDeliveryControlSheet' },
        });
    }

    /**
     * Obtiene el listado paginado de registros.
     * @param {Object} params - Parámetros de búsqueda y paginación.
     * @returns {Promise<Object>} Respuesta con los datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene un registro específico por su UUID.
     * @param {string} uuid - Identificador único del registro.
     * @returns {Promise<Object>} Datos del registro.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea un nuevo registro.
     * @param {Object} data - Datos del formulario.
     * @returns {Promise<Object>} Registro creado.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un registro existente (soporta multipart para archivos).
     * @param {string} uuid - Identificador único del registro.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Registro actualizado.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina un registro por su UUID.
     * @param {string} uuid - Identificador único del registro.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Obtiene el perfil/detalle completo de un registro.
     * @param {string} uuid - Identificador único del registro.
     * @returns {Promise<Object>} Datos detallados.
     */
    getProfile(uuid) { return this.get(uuid); }

    /**
     * Sube un archivo específico asociado al registro.
     * @param {string} uuid - Identificador del registro.
     * @param {string} field - Nombre del campo de archivo.
     * @param {File} file - Archivo a subir.
     * @returns {Promise<Object>} Resultado de la subida.
     * @private
     */
    _uploadFile(uuid, field, file) {
        const form = new FormData();
        form.append(field, file);
        return this._multipart('POST', `/${uuid}/${field}`, form);
    }

    /**
     * Obtiene el listado completo (no paginado) de hojas de control.
     * @returns {Promise<Array>} Lista de registros.
     */
    listAll() { return this._request('GET', '/list'); }

    /**
     * Obtiene las opciones de los catálogos relacionados (Empresas, Vehículos, Conductores).
     * @returns {Promise<Object>} Objeto con los arreglos de opciones.
     */
    async getFormOptions() {
        const fetchSafe = async (url) => {
            try {
                const res = await this._getInstance().get(url);
                return res.data?.data ?? res.data ?? [];
            } catch (err) {
                console.warn(`Error cargando catálogo: ${url}`, err.message);
                return [];
            }
        };

        const [companies, vehicles, drivers, vehicleClasses, fuecs] = await Promise.all([
            fetchSafe('administration/companies/list'),
            fetchSafe('fleet-management/vehicles/list'),
            fetchSafe('third-parties/list?type=is_driver'),
            fetchSafe('catalogs/vehicle-classes/list'),
            fetchSafe('contract-extract/fuecs/list'),
        ]);

        return {
            companies,
            vehicles,
            drivers,
            vehicleClasses,
            fuecs,
        };
    }

    /**
     * Inicia un servicio (Marca la planilla como en curso)
     * @param {string} uuid - Identificador de la planilla
     * @param {Object} data - Datos de inicio (hora, km, combustible, etc)
     * @returns {Promise<Object>}
     */
    startService(uuid, data) {
        return this._request('POST', `/${uuid}/start`, { data });
    }

    /**
     * Cierra o finaliza un servicio
     * @param {string} uuid - Identificador de la planilla
     * @param {Object} data - Datos de cierre (hora, km, firmas, etc)
     * @returns {Promise<Object>}
     */
    closeService(uuid, data) {
        return this._request('POST', `/${uuid}/close`, { data });
    }

    /**
     * Descarga el PDF diario de un registro.
     * @param {string} uuid - Identificador único del registro.
     */
    downloadDailyPdf(uuid) {
        return this._downloadPdf(`/${uuid}/pdf`);
    }

    /**
     * Descarga el PDF mensual consolidado de un vehículo.
     * @param {Object} params - Parámetros: vehicle_uuid, year, month.
     */
    downloadMonthlyPdf(params) {
        const queryParams = new URLSearchParams(params).toString();
        const queryStr = queryParams ? `?${queryParams}` : '';
        return this._downloadPdf(`/monthly/pdf${queryStr}`);
    }
}

export default new ServiceDeliveryControlSheetService();