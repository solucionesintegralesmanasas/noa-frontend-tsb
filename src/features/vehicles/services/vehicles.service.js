import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de vehículos.
 * Extiende BaseService para manejar peticiones HTTP estandarizadas.
 */
class VehiclesService extends BaseService {
    constructor() {
        super({
            resourcePath: 'fleet-management/vehicles',
            metadata: { module: 'vehicles', service: 'vehicles' },
        });
    }

    /**
     * Obtiene un vehículo por su UUID.
     * @param {string} uuid - UUID del vehículo.
     * @returns {Promise<Object>} Datos del vehículo.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea un nuevo vehículo.
     * @param {Object} data - Datos del vehículo a crear.
     * @returns {Promise<Object>} Vehículo creado.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un vehículo existente.
     * @param {string} uuid - UUID del vehículo.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Vehículo actualizado.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina un vehículo.
     * @param {string} uuid - UUID del vehículo.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Obtiene el perfil detallado de un vehículo.
     * @param {string} uuid - UUID del vehículo.
     * @returns {Promise<Object>} Perfil del vehículo.
     */
    getProfile(uuid) { return this._request('GET', `/${uuid}/profile`); }

    /**
     * Descarga la ficha técnica del vehículo en formato PDF.
     * @param {string} uuid - UUID del vehículo.
     * @returns {Promise<void>}
     */
    async downloadTechnicalSheet(uuid) {
        return this._downloadPdf(`/${uuid}/technical-sheet/pdf`, 'Ficha_Tecnica.pdf');
    }

    /**
     * Descarga la hoja de vida del vehículo en formato PDF.
     * @param {string} uuid - UUID del vehículo.
     * @returns {Promise<void>}
     */
    async downloadVehicleHistory(uuid) {
        return this._downloadPdf(`/${uuid}/history/pdf`, 'Hoja_de_Vida_Vehiculo.pdf');
    }

    /**
     * Descarga el historial de mantenimientos en formato PDF.
     * @param {string} uuid - UUID del vehículo.
     * @returns {Promise<void>}
     */
    async downloadMaintenanceHistory(uuid) {
        return this._downloadPdf(`/${uuid}/maintenance-history/pdf`, 'Historial_Mantenimiento.pdf');
    }

    /**
     * Descarga el acta de entrega del vehículo en formato PDF.
     * @param {string} uuid - UUID del vehículo.
     * @returns {Promise<void>}
     */
    async downloadHandoverRecord(uuid) {
        return this._downloadPdf(`/${uuid}/handover-record/pdf`, 'Acta_Entrega.pdf');
    }

    /**
     * Obtiene las opciones para los selects del formulario (catálogos).
     * @returns {Promise<Object>} Objeto con los catálogos cargados.
     */
    async getFormOptions() {
        const fetchSafe = async (url) => {
            try {
                const { isAfiliado, thirdPartyUuid } = this._getUserContext();
                const params = {};
                if (isAfiliado && thirdPartyUuid) {
                    params.third_party_uuid = thirdPartyUuid;
                }
                const instance = this._getInstance();
                const res = await instance.get(url, { params });
                const data = res.data;
                return data?.data ?? data ?? [];
            } catch (err) {
                console.warn(`Error cargando catálogo: ${url}`, err.message);
                return [];
            }
        };

        const { companyUuid } = this._getUserContext();

        const [companies, vehicleClasses, brands, branches, thirdParties, typeOfDocuments] = await Promise.all([
            fetchSafe(`administration/companies/list?companyUuid=${companyUuid || ''}`),
            fetchSafe('catalogs/vehicle-classes/list'),
            fetchSafe('catalogs/brands/list'),
            fetchSafe(`administration/branches/list?company_uuid=${companyUuid || ''}`),
            fetchSafe(`third-parties/list?type=is_affiliate&companyUuid=${companyUuid || ''}`),
            fetchSafe('catalogs/type-of-documents/list'),
        ]);

        return {
            companies,
            vehicleClasses,
            brands,
            branches,
            thirdParties,
            typeOfDocuments,
        };
    }
}

export default new VehiclesService();