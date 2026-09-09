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
                        <h5 class="mb-0 fw-medium">Información General</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos
                            obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                                                                                <form @submit.prevent="handleSubmit" class="row g-3" novalidate>

                        
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="fiscal_year">Año Gravable</label>
                                <input id="fiscal_year" v-model="formData.fiscal_year" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.fiscal_year }" type="number"
                                    placeholder="Ingresa el año gravable" />
                                <div v-if="validationErrors.fiscal_year" class="invalid-feedback d-block">
                                    {{ validationErrors.fiscal_year }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="gross_assets">Patrimonio Bruto</label>
                                <input id="gross_assets" v-model="formData.gross_assets" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.gross_assets }" type="number" step="0.01"
                                    placeholder="Ingresa el patrimonio bruto" />
                                <div v-if="validationErrors.gross_assets" class="invalid-feedback d-block">
                                    {{ validationErrors.gross_assets }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="net_assets">Patrimonio Líquido</label>
                                <input id="net_assets" v-model="formData.net_assets" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.net_assets }" type="number" step="0.01"
                                    placeholder="Ingresa el patrimonio líquido" />
                                <div v-if="validationErrors.net_assets" class="invalid-feedback d-block">
                                    {{ validationErrors.net_assets }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="total_gross_income">Total Ingresos Brutos</label>
                                <input id="total_gross_income" v-model="formData.total_gross_income"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.total_gross_income }"
                                    type="number" step="0.01" placeholder="Ingresa el total de ingresos brutos" />
                                <div v-if="validationErrors.total_gross_income" class="invalid-feedback d-block">
                                    {{ validationErrors.total_gross_income }}
                                </div>
                            </div>
                        

                        
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="ordinary_net_income">Renta Líquida Ordinaria</label>
                                <input id="ordinary_net_income" v-model="formData.ordinary_net_income"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.ordinary_net_income }"
                                    type="number" step="0.01" placeholder="Ingresa la renta líquida ordinaria" />
                                <div v-if="validationErrors.ordinary_net_income" class="invalid-feedback d-block">
                                    {{ validationErrors.ordinary_net_income }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="pre_tax_net_profit">Utilidad Neta Antes de
                                    Impuestos</label>
                                <input id="pre_tax_net_profit" v-model="formData.pre_tax_net_profit"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.pre_tax_net_profit }"
                                    type="number" step="0.01"
                                    placeholder="Ingresa la utilidad neta antes de impuestos" />
                                <div v-if="validationErrors.pre_tax_net_profit" class="invalid-feedback d-block">
                                    {{ validationErrors.pre_tax_net_profit }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="total_operating_non_operating_income">Total Ingresos
                                    Operacionales y No Operacionales</label>
                                <input id="total_operating_non_operating_income"
                                    v-model="formData.total_operating_non_operating_income" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.total_operating_non_operating_income }"
                                    type="number" step="0.01"
                                    placeholder="Ingresa el total de ingresos operacionales y no operacionales" />
                                <div v-if="validationErrors.total_operating_non_operating_income"
                                    class="invalid-feedback d-block">
                                    {{ validationErrors.total_operating_non_operating_income }}
                                </div>
                            </div>
                        

                        
                            <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                                <label class="form-label required" for="company_uuid">Empresa</label>
                                <select ref="companySelect" v-model="formData.company_uuid" class="form-control select2-input w-100"
                                    :class="{ 'is-invalid': validationErrors.company_uuid }">
                                    <option value="">Seleccione...</option>
                                    <option v-for="opt in store.catalogs.companies" :key="opt.uuid" :value="opt.uuid">
                                        {{ opt.business_name }}
                                    </option>
                                </select>
                                <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block">
                                    {{ validationErrors.company_uuid }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="statusSelect">Estado</label>
                                <select ref="statusSelect" v-model="formData.status" class="form-control select2-input w-100"
                                    :class="{ 'is-invalid': validationErrors.status }">
                                    <option value="BORRADOR">Borrador</option>
                                    <option value="PRESENTADO">Presentado</option>
                                </select>
                                <div v-if="validationErrors.status" class="invalid-feedback d-block">
                                    {{ validationErrors.status }}
                                </div>
                            </div>
                        

                        
                            <div class="col-12">
                                <label class="form-label" for="remarks">Observaciones Generales</label>
                                <textarea id="remarks" v-model="formData.remarks" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.remarks }" rows="3"
                                    placeholder="Ingresa observaciones generales"></textarea>
                                <div v-if="validationErrors.remarks" class="invalid-feedback d-block">
                                    {{ validationErrors.remarks }}
                                </div>
                            </div>
                        

                        <div class="col-12">
                        <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" /><!-- BOTONES -->
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
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    Las declaraciones de renta son obligatorias para todas las empresas en Colombia,
                                    según el
                                    <strong>Estatuto Tributario (Artículo 594 y siguientes)</strong>.
                                </li>
                                <li>
                                    El <strong>patrimonio bruto</strong> incluye todos los activos de la empresa,
                                    mientras que el
                                    <strong>patrimonio líquido</strong> es el resultado de restar los pasivos al
                                    patrimonio bruto.
                                </li>
                                <li>
                                    La <strong>renta líquida ordinaria</strong> es la base gravable para el cálculo del
                                    impuesto de renta.
                                </li>
                                <li>
                                    Asegúrate de verificar que los valores ingresados estén en <strong>pesos colombianos
                                        (COP)</strong>.
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
/**
 * @fileoverview Vista de formulario para declaraciones de renta.
 * @module views/TaxDeclarationsFormView
 */

import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaxDeclarationsStore } from '../store/taxDeclarations.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useTaxDeclarationsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));


const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Declaración de Renta' : 'Registrar Declaración de Renta');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos de la declaración de renta en el sistema' : 'Completa los datos para crear una nueva declaración de renta');
const breadcrumbs = computed(() => [ { label: 'Declaraciones de Renta', to: '/declaraciones-de-renta', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario
const formData = reactive({
    company_uuid: '',
    fiscal_year: '',
    gross_assets: '',
    net_assets: '',
    total_gross_income: '',
    ordinary_net_income: '',
    pre_tax_net_profit: '',
    total_operating_non_operating_income: '',
    remarks: '',
    status: 'BORRADOR',
});

// Refs de Select2
const companySelect = ref(null);
const statusSelect = ref(null);

const selectConfigs = computed(() => [
    { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccionar empresa' },
    { ref: statusSelect, field: 'status', placeholder: 'Seleccionar estado' },
]);

const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

/**
 * Valida el formulario.
 * @returns {boolean} Verdadero si el formulario es válido.
 */
const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (!formData.company_uuid) validationErrors.company_uuid = 'La empresa es obligatoria';
    if (!formData.fiscal_year) validationErrors.fiscal_year = 'El año gravable es obligatorio';
    if (!formData.status) validationErrors.status = 'El estado es obligatorio';

    return Object.keys(validationErrors).length === 0;
};

/**
 * Navega hacia atrás.
 */
const goBack = () => router.push('/empresas/declaraciones-de-renta');

/**
 * Maneja el envío del formulario.
 */
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
