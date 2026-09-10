<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">

            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Formulario de Control de Servicios</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <!-- SKELETON FORM -->
                    <div v-if="isViewLoading" role="status">
                        <div class="row g-3">
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="i in 8" :key="i">
                                <div class="skeleton-text mb-2" style="height: 16px; width: 100px;"></div>
                                <div class="skeleton-input"></div>
                            </div>
                        </div>
                    </div>

                    <form v-else @submit.prevent="handleSubmit" class="row g-3 form-layout" novalidate>

                        <!-- Campo oculto para usuarios no-superadmin -->
                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />

                        <!-- SECCIÓN 1: INFORMACIÓN DEL SERVICIO -->
                        <div class="col-12">
                            <hr class="my-2">
                            <h6 class="fw-medium text-primary"><i class="fad fa-info-circle me-1"></i>Información del
                                Servicio</h6>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-3" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa</label>
                            <select id="company_uuid" ref="companySelect" class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option v-for="opt in store.catalogs.companies" :key="opt.uuid" :value="opt.uuid">{{
                                    opt.business_name }}</option>
                            </select>
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block">{{
                                validationErrors.company_uuid }}</div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-6">
                            <label class="form-label required" for="project_uuid">Proyecto</label>
                            <select id="project_uuid" ref="projectSelect" class="form-control select2-input w-100">
                                <option value="">Seleccione el proyecto...</option>
                                <option v-for="opt in store.projects" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.project_name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.project_uuid" class="invalid-feedback d-block">{{
                                validationErrors.project_uuid }}</div>
                            <div v-if="proyectoSeleccionado" class="form-text text-muted small">
                                Vigencia: {{ formatFecha(proyectoSeleccionado.start_date) }} al
                                {{ formatFecha(proyectoSeleccionado.completion_date) }}.
                                Las fechas de la planilla deben estar dentro de este rango.
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-3">
                            <label class="form-label" for="official_name_and_surname">Responsable de servicio</label>
                            <input id="official_name_and_surname" v-model="formData.official_name_and_surname"
                                class="form-control"
                                :class="{ 'is-invalid': validationErrors.official_name_and_surname }" type="text"
                                placeholder="Se autocompleta al elegir el conductor" autocomplete="off" />
                            <div v-if="validationErrors.official_name_and_surname" class="invalid-feedback d-block">{{
                                validationErrors.official_name_and_surname }}</div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-3">
                            <label class="form-label required" for="type_of_control_sheet">Tipo de hoja de
                                control</label>
                            <select id="type_of_control_sheet" ref="typeSelect" class="form-control select2-input w-100">
                                <option value="DIRECTO_CON_LA_EMPRESA">Directo con la empresa</option>
                                <option value="SUBCONTRATADO">Subcontratado</option>
                                <option value="CON_VEHICULO_CONTRATADO">Con vehículo contratado</option>
                                <option value="EXTERNO_PLATAFORMA">Vehículo externo de plataforma</option>
                            </select>
                            <div v-if="validationErrors.type_of_control_sheet" class="invalid-feedback d-block">{{
                                validationErrors.type_of_control_sheet }}</div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-3">
                            <label class="form-label required" for="start_date">Fecha de inicio del servicio</label>
                            <input id="start_date" v-model="formData.start_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.start_date || validationErrors.service_date }"
                                type="date" autocomplete="off" :max="formData.end_date || undefined" />
                            <div v-if="validationErrors.start_date" class="invalid-feedback d-block">{{
                                validationErrors.start_date }}</div>
                            <div v-else-if="validationErrors.service_date" class="invalid-feedback d-block">{{
                                validationErrors.service_date }}</div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg-3">
                            <label class="form-label" for="end_date">Fecha de fin del servicio</label>
                            <input id="end_date" v-model="formData.end_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.end_date }" type="date" autocomplete="off"
                                :min="formData.start_date || undefined" />
                            <div v-if="validationErrors.end_date" class="invalid-feedback d-block">{{
                                validationErrors.end_date }}</div>
                            <div class="form-text text-muted small">Opcional. Si es igual a la fecha de inicio, es un
                                servicio de un solo día.</div>
                        </div>

                        <div v-if="diasServicio > 1" class="col-12">
                            <div class="alert alert-primary d-flex align-items-center gap-2 py-2 px-3 mb-0">
                                <i class="fad fa-calendar-alt text-primary"></i>
                                <span>Servicio programado para <strong>{{ diasServicio }} días</strong> (desde
                                    {{ formatFecha(formData.start_date) }} hasta {{ formatFecha(formData.end_date)
                                    }}). Se generará una planilla diaria por cada día automáticamente.</span>
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-lg-3">
                            <label class="form-label" for="statusSelect">Estado</label>
                            <select id="statusSelect" ref="statusSelect" class="form-control select2-input w-100">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                            <div v-if="validationErrors.is_active" class="invalid-feedback d-block">
                                {{ validationErrors.is_active }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-12 col-lg-12">
                            <label class="form-label" for="daily_route">Recorrido del servicio <span class="text-muted fw-normal">(opcional)</span></label>
                            <input id="daily_route" v-model="formData.daily_route" class="form-control"
                                :class="{ 'is-invalid': validationErrors.daily_route }" type="text"
                                placeholder="Ej: Recorrido Norte - Sur, entrega cliente X..." autocomplete="off" />
                            <div v-if="validationErrors.daily_route" class="invalid-feedback d-block">{{
                                validationErrors.daily_route }}</div>
                        </div>

                        <div class="col-12" v-if="!isEditMode">
                            <div class="alert alert-info d-flex align-items-center gap-2 py-2 px-3 mb-0 small">
                                <i class="fad fa-route text-primary"></i>
                                <span>Los recorridos de cada planilla diaria los registrará el conductor durante la operación (Control de Servicios). Una planilla diaria puede tener muchos recorridos.</span>
                            </div>
                        </div>

                        <!-- SECCIÓN 2: CONTROL DIRECTO CON LA EMPRESA -->
                        <template v-if="formData.type_of_control_sheet === 'DIRECTO_CON_LA_EMPRESA'">
                            <div class="col-12">
                                <hr class="my-2">
                                <h6 class="fw-medium text-primary"><i class="fad fa-file-contract me-1"></i>Control
                                    Directo con la Empresa
                                    <span v-if="formData.project_uuid" class="badge bg-info ms-2">Filtrado por proyecto</span>
                                </h6>
                            </div>
                            <div class="col-12 col-sm-6 col-xl-5">
                                <label class="form-label" for="fuec_uuid">FUEC asociado</label>
                                <select id="fuec_uuid" ref="fuecSelect" class="form-control select2-input w-100">
                                    <option value="">Seleccione...</option>
                                    <option v-for="opt in store.catalogs.fuecs" :key="opt.uuid" :value="opt.uuid">{{
                                        opt.fuec_number ?? opt.uuid }}</option>
                                </select>
                                <div v-if="validationErrors.fuec_uuid" class="invalid-feedback d-block">{{
                                    validationErrors.fuec_uuid }}</div>
                            </div>
                            <div class="col-12 col-sm-6 col-xl-3">
                                <label class="form-label required" for="vehicle_uuid">Vehículo</label>
                                <select id="vehicle_uuid" ref="vehicleSelect" class="form-control select2-input w-100">
                                    <option value="">Seleccione...</option>
                                    <option v-for="opt in vehiculosFiltrados" :key="opt.uuid" :value="opt.uuid">{{
                                        opt.vehicle_license_plate }}</option>
                                </select>
                                <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block">{{
                                    validationErrors.vehicle_uuid }}</div>
                            </div>

                            <div class="col-12 col-sm-6 col-xl-4">
                                <label class="form-label required" for="third_party_uuid">Conductor</label>
                                <select id="third_party_uuid" ref="driverSelect"
                                    class="form-control select2-input w-100">
                                    <option value="">Seleccione...</option>
                                    <option v-for="opt in conductoresFiltrados" :key="opt.uuid" :value="opt.uuid">{{
                                        opt.first_name }} {{ opt.last_name }}</option>
                                </select>
                                <div v-if="validationErrors.third_party_uuid" class="invalid-feedback d-block">{{
                                    validationErrors.third_party_uuid }}</div>
                                <div class="form-check form-switch mt-2" v-if="formData.project_uuid">
                                    <input class="form-check-input" type="checkbox" id="showAllDrivers" v-model="mostrarTodos">
                                    <label class="form-check-label small text-muted" for="showAllDrivers">Mostrar todos los conductores/vehículos (fuera del proyecto)</label>
                                </div>
                            </div>
                        </template>

                        <!-- SECCIÓN 2B: VEHÍCULO EXTERNO / SUBCONTRATADO (plataforma) -->
                        <template v-if="isExternalType">
                            <div class="col-12">
                                <hr class="my-2">
                                <h6 class="fw-medium text-primary"><i class="fad fa-truck me-1"></i>Vehículo externo / subcontratado
                                    <span class="badge bg-warning text-dark ms-2">{{ tipoLabel }}</span>
                                </h6>
                            </div>
                            <div class="col-12 col-sm-6 col-xl-3">
                                <label class="form-label required" for="vehicle_license_plate">Placa del vehículo</label>
                                <input id="vehicle_license_plate" v-model="formData.vehicle_license_plate" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.vehicle_license_plate }" type="text"
                                    placeholder="Ej: ABC123" autocomplete="off" style="text-transform: uppercase" />
                                <div v-if="validationErrors.vehicle_license_plate" class="invalid-feedback d-block">{{
                                    validationErrors.vehicle_license_plate }}</div>
                            </div>
                            <div class="col-12 col-sm-6 col-xl-4">
                                <label class="form-label required" for="driver_name_and_surname">Nombre del conductor</label>
                                <input id="driver_name_and_surname" v-model="formData.driver_name_and_surname" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.driver_name_and_surname }" type="text"
                                    placeholder="Nombre y apellido" autocomplete="off" />
                                <div v-if="validationErrors.driver_name_and_surname" class="invalid-feedback d-block">{{
                                    validationErrors.driver_name_and_surname }}</div>
                            </div>
                            <div class="col-12 col-sm-6 col-xl-2">
                                <label class="form-label" for="driver_license_number">Licencia</label>
                                <input id="driver_license_number" v-model="formData.driver_license_number" class="form-control" type="text"
                                    placeholder="N.º licencia" autocomplete="off" />
                            </div>
                            <div class="col-12 col-sm-6 col-xl-3">
                                <label class="form-label" for="vehicle_class_uuid">Clase de vehículo</label>
                                <select id="vehicle_class_uuid" ref="vehicleClassSelect" class="form-control select2-input w-100">
                                    <option value="">Seleccione...</option>
                                    <option v-for="opt in store.catalogs.vehicleClasses" :key="opt.uuid" :value="opt.uuid">{{
                                        opt.description ?? opt.class_code_class ?? opt.uuid }}</option>
                                </select>
                            </div>
                            <div class="col-12 col-sm-6 col-xl-5">
                                <label class="form-label" for="fuec_uuid_ext">FUEC asociado (opcional)</label>
                                <select id="fuec_uuid_ext" ref="fuecSelect" class="form-control select2-input w-100">
                                    <option value="">Seleccione...</option>
                                    <option v-for="opt in store.catalogs.fuecs" :key="opt.uuid" :value="opt.uuid">{{
                                        opt.fuec_number ?? opt.uuid }}</option>
                                </select>
                            </div>
                            <div class="col-12 col-sm-6 col-xl-4" v-if="formData.type_of_control_sheet === 'EXTERNO_PLATAFORMA'">
                                <label class="form-label" for="vehicle_uuid_ext">Vehículo de plataforma (si está registrado)</label>
                                <select id="vehicle_uuid_ext" ref="vehicleSelect" class="form-control select2-input w-100">
                                    <option value="">No está registrado / ingreso manual</option>
                                    <option v-for="opt in vehiculosFiltrados" :key="opt.uuid" :value="opt.uuid">{{
                                        opt.vehicle_license_plate }}</option>
                                </select>
                                <div class="form-text text-muted small">Si la placa ya existe en plataforma, selecciónela para trazabilidad.</div>
                            </div>
                        </template>

                        <!-- BOTONES -->
                        <div class="col-12 form-actions">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body py-3">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">Consejos para la hoja de control</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    La firma digital puede capturar automáticamente la geolocalización para
                                    garantizar la trazabilidad del servicio.
                                </li>
                                <li>
                                    El control de kilometraje es fundamental para el cálculo de mantenimiento preventivo
                                    de la flota vehicular.
                                </li>
                                <li>Verifica que la placa coincida exactamente con el vehículo físico.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { toast } from '@/utils/toast.js';
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-19
 * @module {Features.Fleet}
 * @resource {ServiceDeliveryControlSheet}
 */
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServiceDeliveryControlSheetStore } from '../store/serviceDeliveryControlSheet.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';

// --- STORES Y ROUTER ---
const route = useRoute();
const router = useRouter();
const store = useServiceDeliveryControlSheetStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

// --- ESTADOS ---
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));
const isEditMode = computed(() => route.params.id !== undefined);
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Hoja de Control' : 'Registrar Hoja de Control');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [
    { label: 'Hojas de Control', to: '/planilla-de-control-de-prestacion-servicios' },
    { label: isEditMode.value ? 'Editar' : 'Nuevo' },
]);

const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// --- COMPUTADOS AUXILIARES ---
const diasServicio = computed(() => {
    if (!formData.start_date) return 1;
    if (!formData.end_date) return 1;
    const start = new Date(formData.start_date + 'T00:00:00');
    const end = new Date(formData.end_date + 'T00:00:00');
    if (end < start) return 1;
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return diffDays + 1;
});

const formatFecha = (fecha) => {
    if (!fecha) return '';
    const clean = String(fecha).slice(0, 10);
    const [y, m, d] = clean.split('-').map(Number);
    if (!y || !m || !d) return clean;
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

const formData = reactive({
    company_uuid: '',
    project_uuid: '',
    official_name_and_surname: '',
    service_date: '',
    start_date: '',
    end_date: '',
    daily_route: '',
    type_of_control_sheet: 'DIRECTO_CON_LA_EMPRESA',
    vehicle_uuid: '',
    third_party_uuid: '',
    fuec_uuid: '',
    vehicle_class_uuid: '',
    vehicle_license_plate: '',
    driver_name_and_surname: '',
    driver_license_number: '',
    is_active: '1',
});

const mostrarTodos = ref(false);

// --- REFS PARA SELECT2 ---
const statusSelect = ref(null);
const companySelect = ref(null);
const projectSelect = ref(null);
const typeSelect = ref(null);
const vehicleSelect = ref(null);
const driverSelect = ref(null);
const fuecSelect = ref(null);
const vehicleClassSelect = ref(null);

const selectConfigs = computed(() => [
    { ref: statusSelect, field: 'is_active', placeholder: 'Seleccionar...' },
    { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccionar...' },
    { ref: projectSelect, field: 'project_uuid', placeholder: 'Seleccione el proyecto...' },
    { ref: typeSelect, field: 'type_of_control_sheet', placeholder: 'Seleccionar...' },
    { ref: vehicleSelect, field: 'vehicle_uuid', placeholder: 'Seleccionar...' },
    { ref: driverSelect, field: 'third_party_uuid', placeholder: 'Seleccionar...' },
    { ref: fuecSelect, field: 'fuec_uuid', placeholder: 'Seleccionar...' },
    { ref: vehicleClassSelect, field: 'vehicle_class_uuid', placeholder: 'Seleccionar...' },
]);

// --- COMPUTADOS DE PROYECTO / TIPO / FILTRADO ---
const isExternalType = computed(() => ['SUBCONTRATADO', 'CON_VEHICULO_CONTRATADO', 'EXTERNO_PLATAFORMA'].includes(formData.type_of_control_sheet));
const tipoLabel = computed(() => ({
    SUBCONTRATADO: 'Subcontratado',
    CON_VEHICULO_CONTRATADO: 'Vehículo contratado',
    EXTERNO_PLATAFORMA: 'Externo de plataforma',
}[formData.type_of_control_sheet] || formData.type_of_control_sheet));

const proyectoSeleccionado = computed(() => {
    if (!formData.project_uuid) return null;
    const fromList = (store.projects || []).find(p => p.uuid === formData.project_uuid);
    if (fromList) return fromList;
    if (store.projectDetail && store.projectDetail.uuid === formData.project_uuid) return store.projectDetail;
    return null;
});

const asignacionesProyecto = computed(() => {
    const d = store.projectDetail;
    if (!d || d.uuid !== formData.project_uuid) return [];
    const todas = d.driverVehicleAssignments || d.driver_vehicle_assignments || d.assignments || [];
    const activas = todas.filter(a => a.is_active !== false && a.is_active !== 0);
    return activas.length ? activas : todas;
});

const vehiculosFiltrados = computed(() => {
    const all = store.catalogs.vehicles || [];
    if (!formData.project_uuid || mostrarTodos.value || !asignacionesProyecto.value.length) return all;
    const uuids = new Set(asignacionesProyecto.value.map(a => a.vehicle_uuid).filter(Boolean));
    const filtered = all.filter(v => uuids.has(v.uuid));
    return filtered.length ? filtered : all;
});

const conductoresFiltrados = computed(() => {
    const all = store.catalogs.drivers || [];
    if (!formData.project_uuid || mostrarTodos.value || !asignacionesProyecto.value.length) return all;
    const uuids = new Set(asignacionesProyecto.value.map(a => a.third_party_uuid).filter(Boolean));
    const filtered = all.filter(c => uuids.has(c.uuid));
    return filtered.length ? filtered : all;
});



// ─── Hook Select2 ─────────────────────────────────────────────────────────────
const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

// --- LOGICA DEL COMPONENTE ---

// Autocompletar nombre de conductor al seleccionar uno
watch(() => formData.third_party_uuid, (newUuid) => {
    if (newUuid && store.catalogs.drivers) {
        const selectedDriver = store.catalogs.drivers.find(d => d.uuid === newUuid);
        if (selectedDriver) {
            formData.official_name_and_surname = `${selectedDriver.first_name} ${selectedDriver.last_name}`;
        } else if (!isExternalType.value) {
            formData.official_name_and_surname = '';
        }
    } else if (!isExternalType.value) {
        formData.official_name_and_surname = '';
    }
});

// Al cambiar de empresa, recargar proyectos
watch(() => formData.company_uuid, async (newCompany) => {
    if (newCompany) {
        await store.loadProjects(newCompany);
        await nextTick();
        setSelect2Values(selectConfigs.value);
    } else {
        store.projects = [];
    }
});

// Al elegir proyecto: cargar asignaciones y sugerir fechas del proyecto
watch(() => formData.project_uuid, async (newProject) => {
    mostrarTodos.value = false;
    if (!newProject) {
        store.projectDetail = null;
        return;
    }
    const detail = await store.loadProjectDetail(newProject);
    const proj = detail || proyectoSeleccionado.value;
    if (proj) {
        const pStart = typeof proj.start_date === 'string' ? proj.start_date.slice(0, 10) : '';
        const pEnd = typeof proj.completion_date === 'string' ? proj.completion_date.slice(0, 10) : '';
        if (!isEditMode.value) {
            if (pStart && !formData.start_date) formData.start_date = pStart;
            if (pEnd && !formData.end_date) formData.end_date = pEnd;
        }
        // Si el conductor/vehículo actual no pertenece al proyecto, limpiarlos
        if (asignacionesProyecto.value.length && !mostrarTodos.value) {
            const vOk = asignacionesProyecto.value.some(a => a.vehicle_uuid === formData.vehicle_uuid);
            const cOk = asignacionesProyecto.value.some(a => a.third_party_uuid === formData.third_party_uuid);
            if (formData.vehicle_uuid && !vOk) formData.vehicle_uuid = '';
            if (formData.third_party_uuid && !cOk) formData.third_party_uuid = '';
            await nextTick();
            setSelect2Values(selectConfigs.value);
        }
    }
});

// Al cambiar a tipo externo, autocompletar responsable con conductor manual
watch(() => formData.driver_name_and_surname, (val) => {
    if (isExternalType.value && val && !formData.official_name_and_surname) {
        formData.official_name_and_surname = val;
    }
});

// Al cambiar el tipo de planilla, reinicializar selects del bloque correspondiente
watch(() => formData.type_of_control_sheet, async () => {
    await nextTick();
    try { destroySelect2(selectConfigs.value); } catch (e) {}
    initSelect2(selectConfigs.value);
    setSelect2Values(selectConfigs.value);
});


// --- VALIDACION Y SUBMIT ---
const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    const required = ['company_uuid', 'start_date', 'type_of_control_sheet'];
    // El proyecto es el punto de partida de toda planilla nueva
    if (!isEditMode.value) required.push('project_uuid');

    // Recorrido del servicio: opcional (el conductor registra los recorridos en la operación)

    required.forEach(field => {
        if (!formData[field]) validationErrors[field] = 'Este campo es obligatorio';
    });

    // Si start_date está presente pero service_date no (caso creación), sincronizar
    if (formData.start_date && !formData.service_date) {
        formData.service_date = formData.start_date;
    }

    // Validar rango de fechas: end_date debe ser >= start_date
    if (formData.start_date && formData.end_date) {
        const inicio = new Date(formData.start_date + 'T00:00:00');
        const fin = new Date(formData.end_date + 'T00:00:00');
        if (fin < inicio) {
            validationErrors.end_date = 'La fecha de fin no puede ser anterior a la de inicio';
        }
    }

    // Validar contenencia en el proyecto
    const proj = proyectoSeleccionado.value;
    if (proj && formData.project_uuid) {
        const pStart = typeof proj.start_date === 'string' ? proj.start_date.slice(0, 10) : null;
        const pEnd = typeof proj.completion_date === 'string' ? proj.completion_date.slice(0, 10) : null;
        if (pStart && formData.start_date && formData.start_date < pStart) {
            validationErrors.start_date = `La fecha de inicio no puede ser anterior al proyecto (${formatFecha(pStart)})`;
        }
        if (pEnd && formData.end_date && formData.end_date > pEnd) {
            validationErrors.end_date = `La fecha de fin no puede superar el proyecto (${formatFecha(pEnd)})`;
        }
    }

    if (formData.type_of_control_sheet === 'DIRECTO_CON_LA_EMPRESA') {
        ['vehicle_uuid', 'third_party_uuid'].forEach(field => {
            if (!formData[field]) validationErrors[field] = 'Este campo es obligatorio';
        });
    } else {
        if (!formData.vehicle_license_plate || !formData.vehicle_license_plate.trim()) {
            validationErrors.vehicle_license_plate = 'La placa es obligatoria para vehículo externo/subcontratado';
        }
        if (!formData.driver_name_and_surname || !formData.driver_name_and_surname.trim()) {
            validationErrors.driver_name_and_surname = 'El nombre del conductor es obligatorio';
        }
    }

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/planilla-de-control-de-prestacion-servicios');

const buildPayload = () => {
    // Los recorridos los registra el conductor en la operación diaria, no en este formulario.
    const payload = { ...formData };
    if (!payload.daily_route || !payload.daily_route.trim()) payload.daily_route = null;
    if (payload.vehicle_license_plate) payload.vehicle_license_plate = payload.vehicle_license_plate.toUpperCase().trim();
    return payload;
};

const handleSubmit = async () => {
    syncFromSelect2(selectConfigs.value);

    if (!validateForm()) {
        applyAllValidations(selectConfigs.value);
        const firstError = document.querySelector('.is-invalid, .is-invalid-select2');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return toast('Atención', 'Revisa los campos obligatorios', 'warning');
    }

    try {
        submitting.value = true;
        const payload = buildPayload();
        if (isEditMode.value) {
            await store.updateItem(route.params.id, payload);
        } else {
            await store.createItem(payload);
        }
        goBack();
    } catch (error) {
        const msg = error?.response?.data?.message || 'No se pudo procesar la solicitud';
        toast('Error', msg, 'error');
    } finally {
        submitting.value = false;
    }
};

// --- CICLO DE VIDA ---
onMounted(async () => {
    isViewLoading.value = true;
    try {
        if (!isSuperAdmin.value) {
            formData.company_uuid = userStore.company_uuid;
        }
        await store.loadFormOptions(formData.company_uuid || undefined);
        if (formData.company_uuid) {
            await store.loadProjects(formData.company_uuid);
        } else if (store.catalogs.projects?.length) {
            store.projects = store.catalogs.projects;
        }

        if (isEditMode.value) {
            const item = await store.fetchProfileById(route.params.id);
            if (item) {
                Object.assign(formData, item);
                if (!formData.type_of_control_sheet) formData.type_of_control_sheet = 'DIRECTO_CON_LA_EMPRESA';
                // Mapear controles hijos a campos planos para edición (API en snake_case)
                const internal = item.internal_control || item.internalControl || null;
                const sub = item.subcontracted_control || item.subcontractedControl || null;
                if (internal) {
                    formData.vehicle_uuid = internal.vehicle_uuid || formData.vehicle_uuid || '';
                    formData.third_party_uuid = internal.third_party_uuid || formData.third_party_uuid || '';
                    if (!formData.fuec_uuid) formData.fuec_uuid = internal.fuec_uuid || '';
                }
                if (sub) {
                    formData.vehicle_license_plate = sub.vehicle_license_plate || '';
                    formData.driver_name_and_surname = sub.driver_name_and_surname || '';
                    formData.driver_license_number = sub.driver_license_number || '';
                    formData.vehicle_class_uuid = sub.vehicle_class_uuid || '';
                }
                const norm = (v) => typeof v === 'string' && v.includes('T') ? v.slice(0, 10) : (v || '');
                formData.service_date = norm(formData.service_date);
                formData.start_date = norm(formData.start_date) || norm(item.service_date);
                formData.end_date = norm(formData.end_date) || formData.start_date;
                formData.is_active = (item.is_active == 1 || item.is_active === true || item.is_active === '1') ? '1' : '0';
                if (formData.company_uuid) await store.loadProjects(formData.company_uuid);
                if (formData.project_uuid) await store.loadProjectDetail(formData.project_uuid);
            }
        }
    } finally {
        setTimeout(async () => {
            isViewLoading.value = false;
            await nextTick();
            initSelect2(selectConfigs.value);
            setSelect2Values(selectConfigs.value);
        }, 300);
    }
});

onUnmounted(() => destroySelect2(selectConfigs.value));
</script>

<style scoped>
/* ===== DISTRIBUCIÓN RESPONSIVA DEL FORMULARIO ===== */
.form-layout {
    --form-gap: 1rem;
}

.form-layout>.col-12:has(> hr) {
    margin-top: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid #e9ecef;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, #f8fbff, #ffffff);
}

.form-layout>.col-12:has(> hr) h6 {
    margin-bottom: 0;
}

.form-layout>.col-12:has(> hr) hr {
    display: none;
}

.form-actions {
    margin-top: 0.25rem;
}

@media (max-width: 575.98px) {
    .card-body {
        padding: 1rem;
    }

    .form-layout {
        --bs-gutter-y: 0.9rem;
    }

    .form-actions :deep(.d-flex) {
        width: 100%;
    }
}

@media (min-width: 1200px) {
    .form-layout {
        --bs-gutter-x: 1.25rem;
        --bs-gutter-y: 1.1rem;
    }
}

/* ===== CARDS ===== */
.card {
    border-radius: 0.625rem !important;
    transition: box-shadow 150ms ease-in-out;
}

.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-header {
    border-radius: 0.625rem 0.625rem 0 0 !important;
    background: linear-gradient(135deg, #f8f9fa, #fff);
}


/* ===== VALIDACIONES (Nativas) ===== */
.required::after {
    content: " *";
    color: #dc3545;
    font-weight: 600;
}

.form-control.is-invalid,
.form-select.is-invalid {
    border-color: #dc3545 !important;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* ==================== SELECT2 VALIDATION ==================== */
:deep(.is-invalid-select2 .select2-selection) {
    border-color: #dc3545 !important;
}

:deep(.is-valid-select2 .select2-selection) {
    border-color: #198754 !important;
}

.invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875em;
    color: #dc3545;
}

/* ==================== SELECT2 UI FIXES ==================== */
:deep(.select2-container .select2-selection--single) {
    height: 38px;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0;
    box-shadow: none;
    outline: none;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

:deep(.select2-container .select2-selection--single:focus),
:deep(.select2-container--open .select2-selection--single) {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

:deep(.select2-container .select2-selection--single .select2-selection__rendered) {
    color: #212529;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    padding-left: 0.75rem;
    padding-right: 2rem;
}

:deep(.select2-container .select2-selection--single .select2-selection__arrow) {
    height: 36px;
    right: 8px;
}

:deep(.select2-dropdown) {
    border: 1px solid #86b7fe;
    border-radius: 0.25rem;
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
    font-size: 1rem;
}

/* ===== BOTONES ===== */
.btn {
    transition: all 150ms ease-in-out;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
}

.btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.btn-falcon-default {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #212529;
}

.bg-opacity-10 {
    --bs-bg-opacity: 0.1;
}

.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 15px, 0);
    }

    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}
</style>
