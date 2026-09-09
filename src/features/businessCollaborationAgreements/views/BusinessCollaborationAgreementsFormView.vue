<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Información General</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <form @submit.prevent="handleSubmit" class="row g-3" novalidate>

                        <!-- Campo oculto empresa (no superadmin) -->
                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />

                        <!-- Empresa (solo superadmin) -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa</label>
                            <select ref="companySelect" v-model="formData.company_uuid" class="form-control select2-input w-100"
                                :class="{ 'is-invalid': validationErrors.company_uuid }">
                                <option value="">Seleccione...</option>
                                <option v-for="opt in store.catalogs.companies" :key="opt.uuid" :value="opt.uuid">{{
                                    opt.business_name }}</option>
                            </select>
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>

                        <!-- Vehículo -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="vehicle_uuid">Vehículo</label>
                            <select ref="vehicleSelect" v-model="formData.vehicle_uuid" class="form-control select2-input w-100"
                                :class="{ 'is-invalid': validationErrors.vehicle_uuid }">
                                <option value="">Seleccione...</option>
                                <option v-for="opt in store.catalogs.vehicles" :key="opt.uuid" :value="opt.uuid">{{
                                    opt.vehicle_license_plate }}</option>
                            </select>
                            <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.vehicle_uuid }}
                            </div>
                        </div>

                        <!-- Número de Resolución (Opcional) -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="resolution_number">Número de Resolución</label>
                            <input id="resolution_number" v-model="formData.resolution_number" class="form-control"
                                :class="{ 'is-invalid': validationErrors.resolution_number }" type="text" autocomplete="off"
                                placeholder="Opcional" />
                            <div v-if="validationErrors.resolution_number" class="invalid-feedback d-block">
                                {{ validationErrors.resolution_number }}
                            </div>
                        </div>

                        <!-- ID Interno del Acuerdo (Automático 4 dígitos) -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label d-flex align-items-center justify-content-between" for="agreement_internal_id">
                                <span>ID Interno del Acuerdo</span>
                                <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25" style="font-size: 0.65rem;">Automático (4 dígitos)</span>
                            </label>
                            <input id="agreement_internal_id" v-model="formData.agreement_internal_id"
                                class="form-control font-monospace" :class="{ 'is-invalid': validationErrors.agreement_internal_id }"
                                type="text" maxlength="4" autocomplete="off" placeholder="Ej: 0001 (Automático)" />
                            <div v-if="validationErrors.agreement_internal_id" class="invalid-feedback d-block">
                                {{ validationErrors.agreement_internal_id }}
                            </div>
                        </div>

                        <!-- NIT Entidad Contratante -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="contracting_entity_nit">NIT Entidad
                                Contratante</label>
                            <input id="contracting_entity_nit" v-model="formData.contracting_entity_nit"
                                class="form-control" :class="{ 'is-invalid': validationErrors.contracting_entity_nit }"
                                type="text" autocomplete="off" placeholder="Ingresa el NIT" />
                            <div v-if="validationErrors.contracting_entity_nit" class="invalid-feedback d-block">
                                {{ validationErrors.contracting_entity_nit }}
                            </div>
                        </div>

                        <!-- Nombre Entidad Contratante -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="contracting_entity_name">Nombre Entidad
                                Contratante</label>
                            <input id="contracting_entity_name" v-model="formData.contracting_entity_name"
                                class="form-control" :class="{ 'is-invalid': validationErrors.contracting_entity_name }"
                                type="text" autocomplete="off" placeholder="Ingresa el nombre de la entidad" />
                            <div v-if="validationErrors.contracting_entity_name" class="invalid-feedback d-block">
                                {{ validationErrors.contracting_entity_name }}
                            </div>
                        </div>

                        <!-- Fecha de Inicio de Vigencia -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="effective_date">Fecha de Inicio de Vigencia</label>
                            <input id="effective_date" v-model="formData.effective_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.effective_date }" type="date" />
                            <div v-if="validationErrors.effective_date" class="invalid-feedback d-block">
                                {{ validationErrors.effective_date }}
                            </div>
                        </div>

                        <!-- Fecha de Expiración -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="expiry_date">Fecha de Expiración</label>
                            <input id="expiry_date" v-model="formData.expiry_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.expiry_date }" type="date" />
                            <div v-if="validationErrors.expiry_date" class="invalid-feedback d-block">
                                {{ validationErrors.expiry_date }}
                            </div>
                        </div>

                        <!-- Nombre del Representante -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="rep_name">Nombre del Representante</label>
                            <input id="rep_name" v-model="formData.rep_name" class="form-control"
                                :class="{ 'is-invalid': validationErrors.rep_name }" type="text" autocomplete="off"
                                placeholder="Ingresa el nombre del representante" />
                            <div v-if="validationErrors.rep_name" class="invalid-feedback d-block">
                                {{ validationErrors.rep_name }}
                            </div>
                        </div>

                        <!-- Documento del Representante -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="rep_document_id">Documento del Representante</label>
                            <input id="rep_document_id" v-model="formData.rep_document_id" class="form-control"
                                :class="{ 'is-invalid': validationErrors.rep_document_id }" type="text" autocomplete="off"
                                placeholder="Ingresa el documento" />
                            <div v-if="validationErrors.rep_document_id" class="invalid-feedback d-block">
                                {{ validationErrors.rep_document_id }}
                            </div>
                        </div>

                        <!-- Modalidad de Transporte -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="transport_modality">Modalidad de Transporte</label>
                            <select ref="transportModalitySelect" v-model="formData.transport_modality" class="form-control select2-input w-100"
                                :class="{ 'is-invalid': validationErrors.transport_modality }">
                                <option value="">Seleccione...</option>
                                <option value="CARGA">Carga</option>
                                <option value="ESPECIAL">Especial</option>
                                <option value="PASAJEROS">Pasajeros</option>
                                <option value="MIXTO">Mixto</option>
                            </select>
                            <div v-if="validationErrors.transport_modality" class="invalid-feedback d-block">
                                {{ validationErrors.transport_modality }}
                            </div>
                        </div>

                        <!-- Capacidad Máxima de Flota -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="max_fleet_capacity">Capacidad Máxima de Flota</label>
                            <input id="max_fleet_capacity" v-model.number="formData.max_fleet_capacity"
                                class="form-control" :class="{ 'is-invalid': validationErrors.max_fleet_capacity }"
                                type="number" autocomplete="off" placeholder="Ingresa la capacidad máxima" />
                            <div v-if="validationErrors.max_fleet_capacity" class="invalid-feedback d-block">
                                {{ validationErrors.max_fleet_capacity }}
                            </div>
                        </div>

                        <!-- Estado -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="statusSelect">Estado</label>
                            <select ref="statusSelect" v-model="formData.status" class="form-control select2-input w-100"
                                :class="{ 'is-invalid': validationErrors.status }">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                            <div v-if="validationErrors.status" class="invalid-feedback d-block">
                                {{ validationErrors.status }}
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>

                    </form>
                </div>
            </div>

            <!-- Card informativa -->
            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body py-3">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    Los convenios de colaboración empresarial permiten formalizar alianzas
                                    estratégicas para la operación conjunta de flotas o servicios.
                                </li>
                                <li>
                                    Es crucial verificar que la fecha de expiración del convenio esté alineada
                                    con los contratos vigentes de los vehículos asociados.
                                </li>
                                <li>
                                    La modalidad de transporte definida en el convenio determina las restricciones
                                    legales y operativas aplicables a la flota vinculada.
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
import { toast } from '@/utils/toast.js';
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBusinessCollaborationAgreementsStore } from '../store/businessCollaborationAgreements.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useBusinessCollaborationAgreementsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));


const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Convenio de Colaboración' : 'Registrar Convenio de Colaboración');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [ { label: 'Convenios de Colaboración', to: '/convenios-colaboracion' }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario
const formData = reactive({
    status: '1',
    max_fleet_capacity: 0,
    company_uuid: '',
    vehicle_uuid: '',
    resolution_number: '',
    agreement_internal_id: '',
    contracting_entity_nit: '',
    contracting_entity_name: '',
    effective_date: '',
    expiry_date: '',
    rep_name: '',
    rep_document_id: '',
    transport_modality: '',
});

const filePreviews = reactive({});

// Refs de Select2
const statusSelect = ref(null);
const companySelect = ref(null);
const vehicleSelect = ref(null);
const transportModalitySelect = ref(null);

const selectConfigs = computed(() => [
    { ref: statusSelect, field: 'status', placeholder: 'Seleccionar estado' },
    { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccionar empresa' },
    { ref: vehicleSelect, field: 'vehicle_uuid', placeholder: 'Seleccionar vehículo' },
    { ref: transportModalitySelect, field: 'transport_modality', placeholder: 'Seleccionar modalidad' },
]);

const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    // Validar requeridos
    if (!formData.company_uuid) validationErrors.company_uuid = 'Este campo es obligatorio';
    if (!formData.vehicle_uuid) validationErrors.vehicle_uuid = 'Este campo es obligatorio';
    // resolution_number y agreement_internal_id son opcionales / automáticos
    if (!formData.contracting_entity_nit) validationErrors.contracting_entity_nit = 'Este campo es obligatorio';
    if (!formData.contracting_entity_name) validationErrors.contracting_entity_name = 'Este campo es obligatorio';
    if (!formData.effective_date) validationErrors.effective_date = 'Este campo es obligatorio';
    if (!formData.expiry_date) validationErrors.expiry_date = 'Este campo es obligatorio';
    if (!formData.rep_name) validationErrors.rep_name = 'Este campo es obligatorio';
    if (!formData.rep_document_id) validationErrors.rep_document_id = 'Este campo es obligatorio';
    if (!formData.transport_modality) validationErrors.transport_modality = 'Este campo es obligatorio';
    if (!formData.status) validationErrors.status = 'Este campo es obligatorio';

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/convenios-colaboracion');

const onFileChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
        formData[field] = file;
        filePreviews[field] = URL.createObjectURL(file);
    }
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
        let uuid = isEditMode.value ? route.params.id : null;

        if (isEditMode.value) {
            await store.updateItem(uuid, formData);
        } else {
            const newItem = await store.createItem(formData);
            uuid = newItem?.uuid || newItem?.id;
        }

        goBack();
    } catch (error) {
        toast('Error', 'No se pudo procesar la solicitud', 'error');
    } finally {
        submitting.value = false;
    }
};

watch(() => formData.company_uuid, async (newVal) => {
    if (!isEditMode.value && newVal) {
        formData.agreement_internal_id = await store.fetchNextConsecutive(newVal);
    }
});

onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.loadFormOptions();
        if (!isSuperAdmin.value) {
            formData.company_uuid = userStore.company_uuid;
        }
        if (isEditMode.value) {
            const item = await store.getItem(route.params.id);
            if (item) {
                Object.assign(formData, item);
                formData.status = (item.status == 1 || item.status === true || item.status === '1') ? '1' : '0';
            }
        } else {
            formData.agreement_internal_id = await store.fetchNextConsecutive(formData.company_uuid);
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

/* ===== FORM LABELS ===== */
.form-label {
    font-size: 0.825rem;
    font-weight: 500;
    line-height: 1.25;
    margin-bottom: 0.3rem;
    display: inline-block;
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
