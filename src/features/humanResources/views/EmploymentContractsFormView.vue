<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">

            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-file-contract text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-file-contract text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información del contrato laboral</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <form @submit.prevent="handleSubmit" class="row g-2 g-md-3" novalidate>

                        <!-- Empleado -->
                        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
                            <label class="form-label required" for="third_party_uuid">Empleado</label>
                            <select id="third_party_uuid" ref="thirdPartySelect" v-model="formData.third_party_uuid" class="form-control select2-input w-100" :class="{ 'is-invalid': validationErrors.third_party_uuid }">
                                <option value="">Seleccionar empleado...</option>
                                <option v-for="opt in store.catalogs?.thirdParties ?? []" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.document_number }} - {{ opt.first_name }} {{ opt.last_name }} {{ opt.trade_name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.third_party_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.third_party_uuid }}
                            </div>
                        </div>

                        <!-- Tipo de contrato -->
                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="contract_type">Tipo de Contrato</label>
                            <select id="contract_type" ref="contractTypeSelect" v-model="formData.contract_type" class="form-control select2-input w-100" :class="{ 'is-invalid': validationErrors.contract_type }">
                                <option value="TERMINO_FIJO">Término Fijo</option>
                                <option value="TERMINO_INDEFINIDO">Término Indefinido</option>
                                <option value="OBRA_LABOR">Obra o Labor</option>
                                <option value="PRESTACION_SERVICIOS">Prestación de Servicios</option>
                                <option value="APRENDIZAJE">Aprendizaje</option>
                            </select>
                            <div v-if="validationErrors.contract_type" class="invalid-feedback d-block">
                                {{ validationErrors.contract_type }}
                            </div>
                        </div>

                        <!-- Estado -->
                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="status">Estado</label>
                            <select id="status" ref="statusSelect" v-model="formData.status" class="form-control select2-input w-100" :class="{ 'is-invalid': validationErrors.status }">
                                <option value="ACTIVO">Activo</option>
                                <option value="SUSPENDIDO">Suspendido</option>
                                <option value="TERMINADO">Terminado</option>
                            </select>
                            <div v-if="validationErrors.status" class="invalid-feedback d-block">
                                {{ validationErrors.status }}
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-calendar-alt me-2"></i>Fechas y Condiciones
                            </h6>
                        </div>

                        <!-- Fecha Inicio -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="start_date">Fecha de inicio</label>
                            <input id="start_date" v-model="formData.start_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.start_date }" type="date" />
                            <div v-if="validationErrors.start_date" class="invalid-feedback d-block">
                                {{ validationErrors.start_date }}
                            </div>
                        </div>

                        <!-- Fecha Fin -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="end_date">Fecha de finalización</label>
                            <input id="end_date" v-model="formData.end_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.end_date }" type="date" />
                            <div v-if="validationErrors.end_date" class="invalid-feedback d-block">
                                {{ validationErrors.end_date }}
                            </div>
                        </div>

                        <!-- Salario Base -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="base_salary">Salario Base</label>
                            <input id="base_salary" v-model="formData.base_salary" class="form-control"
                                :class="{ 'is-invalid': validationErrors.base_salary }" type="number" min="0" step="0.01" />
                            <div v-if="validationErrors.base_salary" class="invalid-feedback d-block">
                                {{ validationErrors.base_salary }}
                            </div>
                        </div>

                        <!-- Horas Semanales -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="working_hours_per_week">Horas Semanales</label>
                            <input id="working_hours_per_week" v-model="formData.working_hours_per_week" class="form-control"
                                :class="{ 'is-invalid': validationErrors.working_hours_per_week }" type="number" min="1" max="168" />
                            <div v-if="validationErrors.working_hours_per_week" class="invalid-feedback d-block">
                                {{ validationErrors.working_hours_per_week }}
                            </div>
                        </div>

                        <!-- Naturaleza Salarial -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label" for="salary_type">Naturaleza Salarial</label>
                            <select id="salary_type" ref="salaryTypeSelect" v-model="formData.salary_type" class="form-control select2-input w-100" :class="{ 'is-invalid': validationErrors.salary_type }">
                                <option value="ORDINARIO">Ordinario</option>
                                <option value="INTEGRAL">Integral</option>
                            </select>
                            <div v-if="validationErrors.salary_type" class="invalid-feedback d-block">
                                {{ validationErrors.salary_type }}
                            </div>
                        </div>

                        <!-- Auxilio Transporte -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label" for="transport_subsidy_applies">¿Aplica auxilio de transporte?</label>
                            <select id="transport_subsidy_applies" ref="transportSelect" v-model="formData.transport_subsidy_applies" class="form-control select2-input w-100" :class="{ 'is-invalid': validationErrors.transport_subsidy_applies }">
                                <option value="0">No</option>
                                <option value="1">Sí</option>
                            </select>
                            <div v-if="validationErrors.transport_subsidy_applies" class="invalid-feedback d-block">
                                {{ validationErrors.transport_subsidy_applies }}
                            </div>
                        </div>

                        <!-- Motivo Terminación -->
                        <div class="col-12" v-if="formData.status === 'TERMINADO'">
                            <label class="form-label required" for="termination_reason">Motivo de Terminación</label>
                            <input id="termination_reason" v-model="formData.termination_reason" class="form-control"
                                :class="{ 'is-invalid': validationErrors.termination_reason }" type="text" />
                            <div v-if="validationErrors.termination_reason" class="invalid-feedback d-block">
                                {{ validationErrors.termination_reason }}
                            </div>
                        </div>

                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { toast } from '@/utils/toast.js';

import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmploymentContractsStore } from '../store/employmentContracts.store.js';
import { useSelect2 } from '@/hooks/useSelect2.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import { handleGlobalError } from '@/utils/error-handler.js';

// --- STORES Y ROUTER ---
const route = useRoute();
const router = useRouter();
const store = useEmploymentContractsStore();

// --- ESTADOS ---
const isEditMode = computed(() => route.params.id !== undefined);

const pageTitle = computed(() => isEditMode.value ? 'Actualizar Contrato Laboral' : 'Nuevo Contrato Laboral');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica la información del contrato laboral' : 'Completa los datos para crear un nuevo contrato laboral');
const breadcrumbs = computed(() => [ { label: 'Contratos Laborales', to: '/recursos-humanos/contratos-laborales/listas' }, { label: isEditMode.value ? 'Editar' : 'Nuevo' } ]);
const submitting = ref(false);
const validationErrors = reactive({});

const formData = reactive({
    third_party_uuid: '',
    contract_type: 'TERMINO_FIJO',
    start_date: '',
    end_date: '',
    base_salary: '',
    salary_type: 'ORDINARIO',
    transport_subsidy_applies: '0',
    working_hours_per_week: 48,
    status: 'ACTIVO',
    termination_reason: ''
});

// --- REFS PARA SELECT2 ---
const thirdPartySelect = ref(null);
const contractTypeSelect = ref(null);
const statusSelect = ref(null);
const salaryTypeSelect = ref(null);
const transportSelect = ref(null);

const selectConfigs = computed(() => [
    { ref: thirdPartySelect, field: 'third_party_uuid', placeholder: 'Seleccionar empleado' },
    { ref: contractTypeSelect, field: 'contract_type', placeholder: 'Seleccionar tipo' },
    { ref: statusSelect, field: 'status', placeholder: 'Seleccionar estado' },
    { ref: salaryTypeSelect, field: 'salary_type', placeholder: 'Seleccionar naturaleza' },
    { ref: transportSelect, field: 'transport_subsidy_applies', placeholder: 'Seleccionar' }
]);

const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2 } = useSelect2(formData, validationErrors);

const loadData = async () => {
    store.loading = true;
    try {
        if (!store.catalogs?.thirdParties) {
            const catalogs = await store.loadFormOptions();
            store.catalogs = catalogs;
        }

        if (isEditMode.value) {
            const contract = await store.fetchProfileById(route.params.id);
            if (contract) {
                Object.assign(formData, {
                    third_party_uuid: contract.third_party_uuid || '',
                    contract_type: contract.contract_type || 'TERMINO_FIJO',
                    start_date: contract.start_date ? contract.start_date.split('T')[0] : '',
                    end_date: contract.end_date ? contract.end_date.split('T')[0] : '',
                    base_salary: contract.base_salary || '',
                    salary_type: contract.salary_type || 'ORDINARIO',
                    transport_subsidy_applies: contract.transport_subsidy_applies ? '1' : '0',
                    working_hours_per_week: contract.working_hours_per_week || 48,
                    status: contract.status || 'ACTIVO',
                    termination_reason: contract.termination_reason || ''
                });
            }
        }
        await nextTick();
        initSelect2(selectConfigs.value);
        setSelect2Values(selectConfigs.value);
    } catch (error) {
        handleGlobalError(error);
        goBack();
    } finally {
        store.loading = false;
    }
};

const handleSubmit = async () => {
    submitting.value = true;
    Object.keys(validationErrors).forEach(k => delete validationErrors[k]);
    syncFromSelect2(selectConfigs.value);

    // Data to send
    const payload = { ...formData };
    payload.transport_subsidy_applies = payload.transport_subsidy_applies === '1';

    try {
        if (isEditMode.value) {
            await store.updateItem(route.params.id, payload);
            toast.success('Contrato laboral actualizado exitosamente.');
        } else {
            await store.createItem(payload);
            toast.success('Contrato laboral creado exitosamente.');
        }
        goBack();
    } catch (error) {
        if (error.response?.status === 422) {
            const errors = error.response.data.errors;
            for (const key in errors) {
                validationErrors[key] = errors[key][0];
            }
            toast.error('Por favor, revisa los errores en el formulario.');
        } else {
            handleGlobalError(error);
        }
    } finally {
        submitting.value = false;
    }
};

const goBack = () => {
    router.push({ name: 'employmentContracts.list' });
};

onMounted(() => {
    loadData();
});

onUnmounted(() => {
    destroySelect2(selectConfigs.value);
});
</script>
