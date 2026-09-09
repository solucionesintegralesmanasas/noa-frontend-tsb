<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-university text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información Bancaria</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos
                            obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <form @submit.prevent="handleSubmit" class="row g-3" novalidate>
                        <!-- Empresa (FK - Select2) -->

                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa</label>
                            <select id="company_uuid" ref="companySelect" v-model="formData.company_uuid"
                                class="form-control select2-input w-100"
                                :class="{ 'is-invalid': validationErrors.company_uuid }">
                                <option value="">Seleccione una empresa...</option>
                                <option v-for="opt in store.catalogs.companies" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.business_name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                            <label class="form-label" for="bank_name">Nombre del Banco</label>
                            <input id="bank_name" v-model="formData.bank_name" class="form-control"
                                :class="{ 'is-invalid': validationErrors.bank_name }" type="text" autocomplete="off"
                                maxlength="100" placeholder="Ej: Bancolombia, BBVA, etc." />
                            <div v-if="validationErrors.bank_name" class="invalid-feedback d-block">
                                {{ validationErrors.bank_name }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="branch_office">Sucursal</label>
                            <input id="branch_office" v-model="formData.branch_office" class="form-control"
                                :class="{ 'is-invalid': validationErrors.branch_office }" type="text" autocomplete="off"
                                maxlength="100" placeholder="Ej: Sucursal Centro" />
                            <div v-if="validationErrors.branch_office" class="invalid-feedback d-block">
                                {{ validationErrors.branch_office }}
                            </div>
                        </div>



                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="accountTypeSelect">Tipo de Cuenta</label>
                            <select id="accountTypeSelect" ref="accountTypeSelect" v-model="formData.account_type"
                                class="form-control select2-input w-100"
                                :class="{ 'is-invalid': validationErrors.account_type }">
                                <option value="">Seleccione un tipo...</option>
                                <option value="ahorros">Ahorros</option>
                                <option value="corriente">Corriente</option>
                                <option value="fiduciaria">Fiduciaria</option>
                                <option value="nomina">Nómina</option>
                            </select>
                            <div v-if="validationErrors.account_type" class="invalid-feedback d-block">
                                {{ validationErrors.account_type }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="account_number">Número de Cuenta</label>
                            <input id="account_number" v-model="formData.account_number" class="form-control"
                                :class="{ 'is-invalid': validationErrors.account_number }" type="text"
                                autocomplete="off" maxlength="50" placeholder="Ej: 12345678901" />
                            <div v-if="validationErrors.account_number" class="invalid-feedback d-block">
                                {{ validationErrors.account_number }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                            <label class="form-label" for="account_holder">Titular de la Cuenta</label>
                            <input id="account_holder" v-model="formData.account_holder" class="form-control"
                                :class="{ 'is-invalid': validationErrors.account_holder }" type="text"
                                autocomplete="off" maxlength="255" placeholder="Nombre completo del titular" />
                            <div v-if="validationErrors.account_holder" class="invalid-feedback d-block">
                                {{ validationErrors.account_holder }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="statusSelect">Estado</label>
                            <select id="statusSelect" ref="statusSelect" v-model="formData.is_active"
                                class="form-control select2-input w-100"
                                :class="{ 'is-invalid': validationErrors.is_active }">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                            <div v-if="validationErrors.is_active" class="invalid-feedback d-block">
                                {{ validationErrors.is_active }}
                            </div>
                        </div>

                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                            <!-- BOTONES -->
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
                            <p class="text-muted small mb-0">
                                La información bancaria es crítica para procesos de pago y
                                facturación electrónica. Asegúrate de verificar los datos antes
                                de guardar. Solo las cuentas activas pueden ser utilizadas en
                                transacciones.
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
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBankDetailsStore } from '../store/bankDetails.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useBankDetailsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para evitar expresiones complejas multi-línea en el template */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Datos Bancarios' : 'Registrar Datos Bancarios');
const pageSubtitle = computed(() => isEditMode.value
    ? 'Modifica la información bancaria de la empresa'
    : 'Completa los datos para registrar una nueva cuenta bancaria'
);
const breadcrumbs = computed(() => [
    { label: 'Datos Bancarios', to: 'empresas/datos-bancarios' },
    { label: isEditMode.value ? 'Editar' : 'Nuevo' },
]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

const formData = reactive({
    company_uuid: '',
    bank_name: '',
    branch_office: '',
    account_type: '',
    account_number: '',
    account_holder: '',
    is_active: '1',
});

const companySelect = ref(null);
const accountTypeSelect = ref(null);
const statusSelect = ref(null);

const selectConfigs = computed(() => [
    { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccione una empresa...' },
    { ref: accountTypeSelect, field: 'account_type', placeholder: 'Seleccione un tipo...' },
    { ref: statusSelect, field: 'is_active', placeholder: 'Seleccionar estado' },
]);

const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (!formData.company_uuid || formData.company_uuid === '') {
        validationErrors.company_uuid = 'Debe seleccionar una empresa';
    }

    if (!formData.account_number || formData.account_number.trim() === '') {
        validationErrors.account_number = 'El número de cuenta es obligatorio';
    } else if (formData.account_number.length > 50) {
        validationErrors.account_number = 'El número de cuenta no puede exceder 50 caracteres';
    }

    if (formData.bank_name && formData.bank_name.length > 100) {
        validationErrors.bank_name = 'El nombre del banco no puede exceder 100 caracteres';
    }

    if (formData.branch_office && formData.branch_office.length > 100) {
        validationErrors.branch_office = 'La sucursal no puede exceder 100 caracteres';
    }

    if (formData.account_holder && formData.account_holder.length > 255) {
        validationErrors.account_holder = 'El titular no puede exceder 255 caracteres';
    }

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/empresas/datos-bancarios');

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
            bank_name: formData.bank_name?.trim() || null,
            branch_office: formData.branch_office?.trim() || null,
            account_type: formData.account_type || null,
            account_number: formData.account_number.trim(),
            account_holder: formData.account_holder?.trim() || null,
            is_active: formData.is_active === '1' || formData.is_active === 1 || formData.is_active === true,
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
                formData.bank_name = item.bank_name || '';
                formData.branch_office = item.branch_office || '';
                formData.account_type = item.account_type || '';
                formData.account_number = item.account_number || '';
                formData.account_holder = item.account_holder || '';
                formData.is_active = (item.is_active == 1 || item.is_active === true || item.is_active === '1') ? '1' : '0';
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
