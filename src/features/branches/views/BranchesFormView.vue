<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">

            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-map-signs text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-map-signs text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información de la sucursal</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <form @submit.prevent="handleSubmit" class="row g-2 g-md-3" novalidate>

                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />

                        <div class="col-12 col-sm-6 col-md-4 col-lg-4" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa</label>
                            <select id="company_uuid" ref="companySelect" class="form-control select2-input w-100">
                                <option value="">Seleccionar empresa...</option>
                                <option v-for="opt in store.catalogs.companies" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.business_name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>

                        <div :class="nameColClass">
                            <label class="form-label required" for="name">Nombre de la sucursal</label>
                            <input id="name" v-model="formData.name" class="form-control"
                                :class="{ 'is-invalid': validationErrors.name }" type="text" autocomplete="off"
                                placeholder="Ej: Sucursal Norte, Oficina Principal..." />
                            <div v-if="validationErrors.name" class="invalid-feedback d-block">
                                {{ validationErrors.name }}
                            </div>
                        </div>

                        <div :class="isPrimaryColClass">
                            <label class="form-label required" for="is_primary">¿Sede principal?</label>
                            <select id="is_primary" ref="isPrimarySelect" class="form-control select2-input w-100">
                                <option value="0">No</option>
                                <option value="1">Sí</option>
                            </select>
                            <div v-if="validationErrors.is_primary" class="invalid-feedback d-block">
                                {{ validationErrors.is_primary }}
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-map-marker-alt me-2"></i>Ubicación y Estado
                            </h6>
                        </div>

                        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
                            <label class="form-label required" for="address">Dirección</label>
                            <input id="address" v-model="formData.address" class="form-control"
                                :class="{ 'is-invalid': validationErrors.address }" type="text" autocomplete="off"
                                placeholder="Ej: Calle 45 # 12-34" />
                            <div v-if="validationErrors.address" class="invalid-feedback d-block">
                                {{ validationErrors.address }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="municipality_uuid">Municipio</label>
                            <select id="municipality_uuid" ref="municipalitySelect" class="form-control select2-input w-100">
                                <option value="">Seleccionar municipio...</option>
                                <option v-for="opt in store.catalogs.municipalities" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.municipality_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.municipality_uuid }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="status">Estado</label>
                            <select id="status" ref="statusSelect" class="form-control select2-input w-100">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                            <div v-if="validationErrors.status" class="invalid-feedback d-block">
                                {{ validationErrors.status }}
                            </div>
                        </div>

                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <p class="text-muted small mb-0">
                                Las sucursales permiten organizar la operación y segmentar la flota por zonas
                                geográficas.
                                Asegúrate de marcar una como sede principal para los reportes consolidados.
                            </p>
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
 * @created_at 2026-06-14
 * @module {Features.Administrations}
 * @resource {Branch}
 */

import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBranchesStore } from '../store/branches.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';

// --- STORES Y ROUTER ---
const route = useRoute();
const router = useRouter();
const store = useBranchesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

// --- ESTADOS ---
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Sucursal' : 'Nueva Sucursal');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica la información y ubicación de la sucursal' : 'Completa los datos para dar de alta una nueva sucursal');
const breadcrumbs = computed(() => [ { label: 'Sucursales', to: '/empresas/sucursales/listas-sucursal' }, { label: isEditMode.value ? 'Editar' : 'Nueva' } ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

/** Clases responsivas dinámicas para columnas */
const nameColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-6 col-md-5 col-lg-5'
        : 'col-12 col-sm-8 col-md-8 col-lg-9';
});

const isPrimaryColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-12 col-md-3 col-lg-3'
        : 'col-12 col-sm-4 col-md-4 col-lg-3';
});

const formData = reactive({
    company_uuid: '',
    name: '',
    address: '',
    municipality_uuid: '',
    is_primary: '0',
    status: '1',
});

// --- REFS PARA SELECT2 ---
const companySelect = ref(null);
const municipalitySelect = ref(null);
const isPrimarySelect = ref(null);
const statusSelect = ref(null);

const selectConfigs = computed(() => [
    { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccionar empresa' },
    { ref: municipalitySelect, field: 'municipality_uuid', placeholder: 'Seleccionar municipio' },
    { ref: isPrimarySelect, field: 'is_primary', placeholder: 'Seleccionar opción' },
    { ref: statusSelect, field: 'status', placeholder: 'Seleccionar estado' },
]);

// ─── Hook Select2 ─────────────────────────────────────────────────────────────
const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

const setSelect2ValuesTrigger = () => setSelect2Values(selectConfigs.value);
const initSelect2Trigger = () => initSelect2(selectConfigs.value);

// --- VALIDACION Y SUBMIT ---
const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    const requiredFields = ['name', 'address', 'municipality_uuid'];
    if (isSuperAdmin.value) {
        requiredFields.push('company_uuid');
    }

    requiredFields.forEach(field => {
        if (!formData[field]) validationErrors[field] = 'Este campo es obligatorio';
    });

    if (formData.status === '' || formData.status === null || formData.status === undefined) {
        validationErrors.status = 'El estado es obligatorio';
    }

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/empresas/sucursales/listas-sucursal');

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

// --- CICLO DE VIDA ---
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
                formData.is_primary = (item.is_primary == 1 || item.is_primary === true || item.is_primary === '1') ? '1' : '0';
                formData.status = (item.status == 1 || item.status === true || item.status === '1') ? '1' : '0';
            }
        }
    } finally {
        setTimeout(async () => {
            isViewLoading.value = false;
            await nextTick();
            initSelect2Trigger();
            setSelect2ValuesTrigger();
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
