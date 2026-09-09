import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import serviceDeliveryControlSheetService from '../services/serviceDeliveryControlSheet.service.js';
import { handleGlobalError } from '@/utils/error-handler.js';

/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-19
 * @module {Features.Fleet}
 * @resource {ServiceDeliveryControlSheet}
 */

export const useServiceDeliveryControlSheetStore = defineStore('serviceDeliveryControlSheet', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: {},
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
    }),

    getters: {
        filteredItems: (state) => state.items,
        paginatedItems: (state) => state.items,
    },

    actions: {
        /**
         * Ejecuta una acción asíncrona manejando estados de carga y errores.
         * @param {Function} action - Función asíncrona a ejecutar.
         * @param {string} errorMsg - Mensaje de error por defecto.
         * @returns {Promise<any>} Resultado de la acción.
         * @private
         */
        async _run(action, errorMsg) {
            this.loading = true;
            this.error = null;
            try { return await action(); }
            catch (error) {
                this.error = error.message || errorMsg;
                handleGlobalError(error, 'ServiceDeliveryControlSheetStore');
                throw error;
            } finally { this.loading = false; }
        },

        /**
         * Obtiene la lista de registros desde el servidor con paginación.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.list({
                    page: this.pagination.currentPage,
                    per_page: this.pagination.itemsPerPage,
                    search: this.search || undefined,
                });
                const p = response?.data ?? response;
                this.items = p.data ?? [];
                this.pagination.currentPage = p.current_page ?? 1;
                this.pagination.totalItems = p.total ?? 0;
                this.pagination.totalPages = p.last_page ?? 1;
                this.pagination.itemsPerPage = p.per_page ?? this.pagination.itemsPerPage;
            }, 'Error al cargar los datos');
        },

        /**
         * Carga los catálogos necesarios para los formularios.
         * @returns {Promise<Object>} Catálogos cargados.
         */
        async loadCatalogs() {
            // No usamos _run aquí para dar un feedback de 'warning' en lugar de 'error',
            // ya que la falla en la carga de catálogos puede no ser bloqueante.
            this.loading = true;
            try {
                const catalogs = await serviceDeliveryControlSheetService.getFormOptions();
                this.catalogs = catalogs;
                return catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario.', 'warning');
                // No relanzamos el error para no bloquear la renderización del formulario si los catálogos fallan
                return {};
            } finally {
                this.loading = false;
            }
        },
        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza un elemento localmente en el array de items.
         * @param {string} uuid - UUID del elemento.
         * @param {Object} patch - Datos parciales a fusionar.
         * @private
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Acciones posteriores a la creación exitosa.
         * @param {Object} response - Respuesta del servidor.
         * @returns {Object} El elemento creado.
         * @private
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea un nuevo registro.
         * @param {Object} data - Datos del formulario.
         * @returns {Promise<Object>} Registro creado.
         */
        createItem(data) {
            return this._run(
                () => serviceDeliveryControlSheetService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un registro existente.
         * @param {string} uuid - UUID del registro.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>} Registro actualizado.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Inicia un servicio.
         * @param {string} uuid - UUID del registro.
         * @param {Object} data - Datos de inicio.
         * @returns {Promise<Object>} Registro actualizado.
         */
        startService(uuid, data) {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.startService(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Servicio iniciado correctamente', 'success');
                return updated;
            }, 'Error al iniciar el servicio');
        },

        /**
         * Finaliza un servicio.
         * @param {string} uuid - UUID del registro.
         * @param {Object} data - Datos de finalización.
         * @returns {Promise<Object>} Registro actualizado.
         */
        closeService(uuid, data) {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.closeService(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Servicio finalizado correctamente', 'success');
                return updated;
            }, 'Error al finalizar el servicio');
        },

        /**
         * Elimina un registro.
         * @param {string} uuid - UUID del registro a eliminar.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await serviceDeliveryControlSheetService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene el perfil detallado de un registro.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<Object>} Datos del perfil.
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await serviceDeliveryControlSheetService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Carga un registro por su ID para edición o visualización.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<Object>} Datos del registro.
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await serviceDeliveryControlSheetService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },

        /**
         * Descarga y abre el PDF diario de un registro en una pestaña nueva.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<void>}
         */
        async downloadDailyPdf(uuid) {
            return this._run(async () => {
                await serviceDeliveryControlSheetService.downloadDailyPdf(uuid);
                await toast('¡Éxito!', 'PDF diario abierto correctamente', 'success');
            }, 'Error al descargar el PDF diario');
        },

        /**
         * Descarga y abre el PDF mensual consolidado en una pestaña nueva.
         * @param {Object} params - Parámetros: vehicle_uuid, year, month.
         * @returns {Promise<void>}
         */
        async downloadMonthlyPdf(params) {
            return this._run(async () => {
                await serviceDeliveryControlSheetService.downloadMonthlyPdf(params);
                await toast('¡Éxito!', 'PDF mensual abierto correctamente', 'success');
            }, 'Error al descargar el PDF mensual');
        },
    },
});