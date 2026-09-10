<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <WizardProgress
                v-if="wizardUuid"
                current="tarjeta"
                :done-keys="wizardDoneKeys"
                @skip="goNextStep"
                @finish="goExit"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 py-md-3 px-3 px-md-4 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Información General</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos
                            obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <form ref="cardFormRef" @submit.prevent="handleSubmit" class="row g-3" novalidate>

                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Empresa
                                Propietaria/Asignada</label>
                            <select ref="companySelect" v-model="formData.company_uuid" class="form-control w-100"
                                :class="{ 'is-invalid': validationErrors.company_uuid }">
                                <option value="">Seleccionar empresa</option>
                                <option v-for="opt in store.catalogs?.companies || []" :key="opt.uuid"
                                    :value="opt.uuid">
                                    {{ opt.business_name || opt.name || opt.company_name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block">{{
                                validationErrors.company_uuid }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Empresa
                                Afiliada</label>
                            <input type="text" autocomplete="off" class="form-control"
                                v-model="formData.affiliated_company" placeholder="Ingrese empresa afiliada"
                                :class="{ 'is-invalid': validationErrors.affiliated_company }" />
                            <div v-if="validationErrors.affiliated_company" class="invalid-feedback d-block">{{
                                validationErrors.affiliated_company }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Radio de
                                Acción</label>
                            <input type="text" autocomplete="off" class="form-control bg-light"
                                v-model="formData.area_of_coverage" placeholder="Ingrese radio de acción"
                                :readonly="true" :class="{ 'is-invalid': validationErrors.area_of_coverage }" />
                            <div v-if="validationErrors.area_of_coverage" class="invalid-feedback d-block">{{
                                validationErrors.area_of_coverage }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Modalidad de
                                Servicio</label>
                            <input type="text" autocomplete="off" class="form-control bg-light"
                                v-model="formData.service_type" placeholder="Ingrese modalidad de servicio"
                                :readonly="true" :class="{ 'is-invalid': validationErrors.service_type }" />
                            <div v-if="validationErrors.service_type" class="invalid-feedback d-block">{{
                                validationErrors.service_type }}</div>
                        </div>

                        <div class="col-12 mt-2">
                            <h6 class="text-muted fw-medium mb-3 pb-2 pt-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-calendar-alt me-2"></i>Vigencia y Detalles
                            </h6>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Modalidad de
                                Transporte</label>
                            <input type="text" autocomplete="off" class="form-control bg-light"
                                v-model="formData.transport_mode" placeholder="Ingrese modalidad de transporte"
                                :readonly="true" :class="{ 'is-invalid': validationErrors.transport_mode }" />
                            <div v-if="validationErrors.transport_mode" class="invalid-feedback d-block">{{
                                validationErrors.transport_mode }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Fecha de
                                Expedición</label>
                            <input type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.issue_date"
                                :class="{ 'is-invalid': validationErrors.issue_date }" />
                            <div v-if="validationErrors.issue_date" class="invalid-feedback d-block">{{
                                validationErrors.issue_date }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Fecha de
                                Expiración</label>
                            <input type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control"
                                v-model="formData.expiration_date"
                                :class="{ 'is-invalid': validationErrors.expiration_date }" />
                            <div v-if="validationErrors.expiration_date" class="invalid-feedback d-block">{{
                                validationErrors.expiration_date }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">N°
                                Tarjeta</label>
                            <input type="text" autocomplete="off" class="form-control"
                                v-model="formData.operating_card_number" placeholder="Ej: 12345678"
                                :class="{ 'is-invalid': validationErrors.operating_card_number }" />
                            <div v-if="validationErrors.operating_card_number" class="invalid-feedback d-block">{{
                                validationErrors.operating_card_number }}</div>
                        </div>

                        <div class="col-12 mt-2">
                            <h6 class="text-muted fw-medium mb-3 pb-2 pt-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-car-bus me-2"></i>Asignación de Vehículo
                            </h6>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Vehículo</label>
                            <select ref="vehicleSelect" v-model="formData.vehicle_uuid" class="form-control w-100" :disabled="!!wizardUuid"
                                :class="{ 'is-invalid': validationErrors.vehicle_uuid }">
                                <option value="">Seleccionar vehículo</option>
                                <option v-for="opt in uniqueVehicles" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.vehicle_license_plate }}
                                </option>
                            </select>
                            <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block">{{
                                validationErrors.vehicle_uuid }}</div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">N° Interno del
                                Vehículo</label>
                            <input type="text" autocomplete="off" class="form-control" id="internal_number"
                                v-model="formData.internal_number" placeholder="Ej: 001"
                                :class="{ 'is-invalid': validationErrors.internal_number }" />
                            <div v-if="validationErrors.internal_number" class="invalid-feedback d-block">{{
                                validationErrors.internal_number }}</div>
                            <div v-if="hasAgreements" class="text-warning small mb-0 mt-1 d-flex align-items-center gap-1">
                                <i class="fad fa-exclamation-triangle"></i>
                                <span>Vehículo con convenio. Auto-asignación inactiva.</span>
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Estado</label>
                            <select ref="statusSelect" v-model="formData.status" class="form-select w-100"
                                :class="{ 'is-invalid': validationErrors.status }">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                            <div v-if="validationErrors.status" class="invalid-feedback d-block">{{
                                validationErrors.status }}</div>
                        </div>

                        <div class="col-12 mt-4 pt-3 border-top">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body py-3">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-6"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    La tarjeta de operación es el documento que acredita la autorización legal para
                                    prestar el servicio de transporte público o privado especial.
                                </li>
                                <li>
                                    Es fundamental mantener actualizada la fecha de expiración para evitar sanciones por
                                    parte de las autoridades de tránsito y transporte.
                                </li>
                                <li>
                                    El área de cobertura determina si el vehículo puede operar solo a nivel municipal,
                                    departamental o nacional.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from '@/utils/toast.js';
import { useOperationCardsStore } from '../store/operationCards.store.js';
import { useVehiclesStore } from '@/features/vehicles/store/vehicles.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import { useNoAutocomplete } from '@/hooks/useNoAutocomplete.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import WizardProgress from '@/components/WizardProgress.vue';
import { useDocumentWizard } from '@/hooks/useDocumentWizard.js';

const route = useRoute();
const router = useRouter();
const store = useOperationCardsStore();
const vehiclesStore = useVehiclesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));


const isEditMode = computed(() => route.params.id !== undefined);

/** Modo asistente: creación encadenada tras registrar el vehículo (?wizard=<uuid>) */
const wizardUuid = computed(() => (!isEditMode.value && route.query.wizard) ? String(route.query.wizard) : null);
const { nextStepRoute, prevStepRoute, exitRoute, fetchExistingDocs, getSessionDone, markStepDone, clearSessionDone } = useDocumentWizard();
const wizardDoneKeys = ref([]);

const goExit = () => {
    clearSessionDone(wizardUuid.value);
    router.push(exitRoute(wizardUuid.value));
};
const goNextStep = () => router.push(nextStepRoute('tarjeta', wizardUuid.value, permissionsStore));

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Tarjeta de Operación' : 'Registrar Tarjeta de Operación');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [{ label: 'Tarjetas de Operación', to: '/tarjetas-de-operacion', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' },]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario (inicializar campos del JSON de la Tarea 1)
const formData = reactive({
    status: '1',
    area_of_coverage: 'NACIONAL',
    company_uuid: '',
    affiliated_company: '',
    service_type: 'PÚBLICO',
    transport_mode: 'TERRESTRE',
    issue_date: '',
    expiration_date: '',
    operating_card_number: '',
    vehicle_uuid: '',
    internal_number: ''
});

const hasAgreements = ref(false);

// Deduplica los vehículos del catálogo por uuid (evita registros repetidos en el select)
const uniqueVehicles = computed(() => {
    const seen = new Set();
    return (store.catalogs?.vehicles || []).filter((v) => {
        const key = v?.uuid ?? v?.vehicle_license_plate;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
});

watch(() => formData.vehicle_uuid, async (newVal) => {
    if (!newVal) {
        hasAgreements.value = false;
        return;
    }
    try {
        const vehicle = await vehiclesStore.fetchProfileById(newVal);
        if (vehicle) {
            const agreements = vehicle.business_collaboration_agreements || vehicle.businessCollaborationAgreements;
            hasAgreements.value = Array.isArray(agreements) && agreements.length > 0;

            if (vehicle.internal_number) {
                formData.internal_number = vehicle.internal_number;
            } else {
                formData.internal_number = '';
            }
        }
    } catch (error) {
        console.error('Error al obtener detalles del vehículo:', error);
        hasAgreements.value = false;
    }
});

// Refs de Select2
const statusSelect = ref(null);
const companySelect = ref(null);
const vehicleSelect = ref(null);

const selectConfigs = computed(() => [
    { ref: statusSelect, field: 'status', placeholder: 'Seleccionar estado' },
    { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccionar empresa' },
    { ref: vehicleSelect, field: 'vehicle_uuid', placeholder: 'Seleccionar vehículo' },
]);

const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

// Sin sugerencias del navegador en el asistente (salvo N° interno)
const cardFormRef = ref(null);
useNoAutocomplete(cardFormRef, { except: ['internal_number'] });

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    // Validar requeridos según el JSON
    if (!formData.company_uuid) validationErrors.company_uuid = 'Este campo es obligatorio';
    if (!formData.vehicle_uuid) validationErrors.vehicle_uuid = 'Este campo es obligatorio';
    if (!formData.affiliated_company) validationErrors.affiliated_company = 'Este campo es obligatorio';
    if (!formData.area_of_coverage) validationErrors.area_of_coverage = 'Este campo es obligatorio';
    if (!formData.service_type) validationErrors.service_type = 'Este campo es obligatorio';
    if (!formData.transport_mode) validationErrors.transport_mode = 'Este campo es obligatorio';
    if (!formData.issue_date) validationErrors.issue_date = 'Este campo es obligatorio';
    if (!formData.expiration_date) validationErrors.expiration_date = 'Este campo es obligatorio';
    if (!formData.operating_card_number) validationErrors.operating_card_number = 'Este campo es obligatorio';
    if (!formData.status) validationErrors.status = 'Este campo es obligatorio';

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => {
    if (wizardUuid.value) {
        router.push(prevStepRoute('tarjeta', wizardUuid.value, permissionsStore));
    } else {
        router.push('/tarjetas-de-operacion');
    }
};

const handleSubmit = async () => {
    syncFromSelect2(selectConfigs.value);
    // En modo asistente el vehículo queda fijado al que originó el flujo
    if (wizardUuid.value) formData.vehicle_uuid = wizardUuid.value;

    if (!validateForm()) {
        applyAllValidations(selectConfigs.value);
        const firstError = document.querySelector('.is-invalid, .is-invalid-select2');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return toast('Atención', 'Revisa los campos obligatorios', 'warning');
    }

    try {
        submitting.value = true;
        let uuid = isEditMode.value ? route.params.id : null;

        if (isEditMode.value) {
            await store.updateItem(uuid, formData);
        } else {
            const newItem = await store.createItem(formData);
            uuid = newItem?.uuid || newItem?.id;
        }

        if (wizardUuid.value) {
            markStepDone(wizardUuid.value, 'tarjeta');
            goNextStep();
        } else {
            goBack();
        }
    } catch (error) {
        toast('Error', 'No se pudo procesar la solicitud', 'error');
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.loadFormOptions();
        if (!isSuperAdmin.value) {
            formData.company_uuid = userStore.company_uuid;
        }
        if (isEditMode.value) {
            const item = await store.fetchProfileById(route.params.id);
            if (item) {
                Object.assign(formData, item);
                if (formData.issue_date) formData.issue_date = String(formData.issue_date).slice(0, 10);
                if (formData.expiration_date) formData.expiration_date = String(formData.expiration_date).slice(0, 10);
                if (item.vehicle?.internal_number && !formData.internal_number) {
                    formData.internal_number = item.vehicle.internal_number;
                }
                formData.status = (item.status == 1 || item.status === true || item.status === '1') ? '1' : '0';
            }
        } else if (wizardUuid.value) {
            // Modo asistente: vehículo prefijado y pasos ya cargados para el progreso
            formData.vehicle_uuid = wizardUuid.value;
            // Progreso inmediato de sesión (checks secuenciales sin esperar al backend)
            wizardDoneKeys.value = getSessionDone(wizardUuid.value);
            try {
                const found = await fetchExistingDocs(wizardUuid.value);
                // El vehículo quedó guardado al entrar al asistente
                const done = new Set(['vehiculo', ...getSessionDone(wizardUuid.value)]);
                if (found.soat) done.add('soat');
                if (found.rce && found.rcc) done.add('poliza');
                if (found.rtm) done.add('tecnomecanica');
                if (found.tarjeta) done.add('tarjeta');
                wizardDoneKeys.value = [...done];
            } catch {
                wizardDoneKeys.value = getSessionDone(wizardUuid.value);
            }
        }
    } finally {
        setTimeout(async () => {
            isViewLoading.value = false;
            await nextTick();
            initSelect2(selectConfigs.value);
            setSelect2Values(selectConfigs.value);
        }, 400);
    }
});

onUnmounted(() => destroySelect2(selectConfigs.value));
</script>

<style scoped>
.required::after {
    content: " *";
    color: #dc3545;
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
