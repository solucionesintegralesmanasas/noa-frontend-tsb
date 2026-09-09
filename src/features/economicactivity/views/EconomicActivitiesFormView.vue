<template>
    <div class="row g-2 g-md-3">
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
                        <h5 class="mb-0 fw-medium">Información General</h5>
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
                                <option value="">Seleccione una empresa...</option>
                                <option v-for="opt in store.catalogs.companies" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.business_name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>
                        
                        <div :class="activityCodeColClass">
                            <label class="form-label required" for="activity_code">
                                Código de Actividad (CIIU Rev. 4 A.C.)
                            </label>
                            <select id="activity_code" ref="activityCodeSelect" class="form-control select2-input w-100">
                                <option value="">Seleccione una actividad...</option>
                                <option v-for="opt in store.catalogs.economicActivities" :key="opt.id || opt.code"
                                    :value="opt.code">
                                    {{ opt.code }} — {{ opt.description }}
                                </option>
                            </select>
                            <div v-if="validationErrors.activity_code" class="invalid-feedback d-block">
                                {{ validationErrors.activity_code }}
                            </div>
                        </div>
                        
                        <div :class="isMainActivityColClass">
                            <label class="form-label" for="mainActivitySelect">
                                ¿Es actividad principal?
                            </label>
                            <select id="mainActivitySelect" ref="mainActivitySelect" class="form-control select2-input w-100">
                                <option value="0">No — Actividad secundaria</option>
                                <option value="1">Sí — Actividad principal</option>
                            </select>
                            <div v-if="validationErrors.is_main_activity" class="invalid-feedback d-block">
                                {{ validationErrors.is_main_activity }}
                            </div>
                        </div>

                        <!-- Descripción de la Actividad -->
                        <div class="col-12">
                            <label class="form-label" for="activity_description">
                                Descripción de la Actividad
                            </label>
                            <textarea id="activity_description" v-model="formData.activity_description"
                                class="form-control" :class="{ 'is-invalid': validationErrors.activity_description }"
                                rows="3" maxlength="255"
                                placeholder="Describe detalladamente la actividad económica..."></textarea>
                            <div v-if="validationErrors.activity_description" class="invalid-feedback d-block">
                                {{ validationErrors.activity_description }}
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
                                Los códigos de actividad económica se rigen por la clasificación
                                CIIU Rev. 4 A.C. Cada empresa puede tener múltiples actividades,
                                pero solo una puede ser marcada como principal para efectos
                                fiscales y estadísticos.
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
 * @resource {EconomicActivity}
 */

import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEconomicActivitiesStore } from '../store/economicActivities.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useEconomicActivitiesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Actividad Económica' : 'Registrar Actividad Económica');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos de la actividad económica en el sistema' : 'Completa los datos para registrar una nueva actividad económica');
const breadcrumbs = computed(() => [ { label: 'EconomicActivities', to: '/empresas/actividades-economicas/listas-actividades-economicas', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

/** Clases responsivas dinámicas para columnas */
const activityCodeColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-6 col-md-5 col-lg-5'
        : 'col-12 col-sm-8 col-md-8 col-lg-9';
});

const isMainActivityColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-12 col-md-3 col-lg-3'
        : 'col-12 col-sm-4 col-md-4 col-lg-3';
});

const formData = reactive({
    company_uuid: '',
    activity_code: '',
    activity_description: '',
    is_main_activity: '0',
});

const companySelect = ref(null);
const activityCodeSelect = ref(null);
const mainActivitySelect = ref(null);

const selectConfigs = computed(() => [
    { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccione una empresa...' },
    { ref: activityCodeSelect, field: 'activity_code', placeholder: 'Seleccione un código CIIU...' },
    { ref: mainActivitySelect, field: 'is_main_activity', placeholder: 'Seleccionar opción' },
]);

watch(() => formData.activity_code, (newVal) => {
    if (newVal) {
        const found = store.catalogs.economicActivities?.find(item => item.code === newVal);
        if (found) {
            formData.activity_description = found.description || '';
        }
    }
});

const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (!formData.company_uuid || formData.company_uuid === '') {
        validationErrors.company_uuid = 'Debe seleccionar una empresa';
    }

    if (!formData.activity_code || formData.activity_code.trim() === '') {
        validationErrors.activity_code = 'El código de actividad es obligatorio';
    } else if (formData.activity_code.length > 20) {
        validationErrors.activity_code = 'El código no puede exceder 20 caracteres';
    }

    if (formData.activity_description && formData.activity_description.length > 255) {
        validationErrors.activity_description = 'La descripción no puede exceder 255 caracteres';
    }

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/empresas/actividades-economicas/listas-actividades-economicas');

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

        const payload = {
            company_uuid: formData.company_uuid,
            activity_code: formData.activity_code.trim(),
            activity_description: formData.activity_description?.trim() || null,
            is_main_activity: formData.is_main_activity === '1' || formData.is_main_activity === 1 || formData.is_main_activity === true,
        };

        if (isEditMode.value) {
            await store.updateItem(uuid, payload);
        } else {
            const newItem = await store.createItem(payload);
            uuid = newItem?.uuid || newItem?.id;
        }

        goBack();
    } catch (error) {
        console.error(error);
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
                formData.company_uuid = item.company_uuid || '';
                formData.activity_code = item.activity_code || '';
                formData.activity_description = item.activity_description || '';
                formData.is_main_activity = (item.is_main_activity == 1 || item.is_main_activity === true || item.is_main_activity === '1') ? '1' : '0';
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
