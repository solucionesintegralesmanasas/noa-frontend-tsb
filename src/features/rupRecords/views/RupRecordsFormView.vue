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
              <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos
              obligatorios
            </span>
          </div>
        </div>

        <div class="card-body">
          <form @submit.prevent="handleSubmit" class="row g-3" novalidate>
            <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
              <label class="form-label required" for="company_uuid">Empresa</label>
              <select ref="companySelect" v-model="formData.company_uuid" class="form-control select2-input w-100"
                :class="{ 'is-invalid': validationErrors.company_uuid }">
                <option value="">Seleccione...</option>
                <option v-for="opt in store.catalogs.companies" :key="opt.uuid" :value="opt.uuid">{{ opt.business_name
                }}</option>
              </select>
              <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block">{{
                validationErrors.company_uuid }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label class="form-label required" for="registration_number">Número de Inscripción</label>
              <input id="registration_number" v-model="formData.registration_number" class="form-control"
                :class="{ 'is-invalid': validationErrors.registration_number }" type="text" autocomplete="off"
                placeholder="Ingresa el número de inscripción" />
              <div v-if="validationErrors.registration_number" class="invalid-feedback d-block">{{
                validationErrors.registration_number }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label class="form-label" for="issue_date">Fecha de Expedición</label>
              <input id="issue_date" v-model="formData.issue_date" class="form-control"
                :class="{ 'is-invalid': validationErrors.issue_date }" type="date" />
              <div v-if="validationErrors.issue_date" class="invalid-feedback d-block">{{ validationErrors.issue_date }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label class="form-label" for="expiration_date">Fecha de Vencimiento</label>
              <input id="expiration_date" v-model="formData.expiration_date" class="form-control"
                :class="{ 'is-invalid': validationErrors.expiration_date }" type="date" />
              <div v-if="validationErrors.expiration_date" class="invalid-feedback d-block">{{ validationErrors.expiration_date
              }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label class="form-label" for="legal_capacity_score">Capacidad Jurídica</label>
              <input id="legal_capacity_score" v-model="formData.legal_capacity_score" class="form-control"
                :class="{ 'is-invalid': validationErrors.legal_capacity_score }" type="number" step="0.01"
                placeholder="0.00" autocomplete="off" />
              <div v-if="validationErrors.legal_capacity_score" class="invalid-feedback d-block">{{
                validationErrors.legal_capacity_score }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label class="form-label" for="financial_capacity_score">Capacidad Financiera</label>
              <input id="financial_capacity_score" v-model="formData.financial_capacity_score" class="form-control"
                :class="{ 'is-invalid': validationErrors.financial_capacity_score }" type="number" step="0.01"
                placeholder="0.00" autocomplete="off" />
              <div v-if="validationErrors.financial_capacity_score" class="invalid-feedback d-block">{{
                validationErrors.financial_capacity_score }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label class="form-label" for="organizational_capacity_score">Capacidad Organizacional</label>
              <input id="organizational_capacity_score" v-model="formData.organizational_capacity_score"
                class="form-control" :class="{ 'is-invalid': validationErrors.organizational_capacity_score }"
                type="number" step="0.01" placeholder="0.00" autocomplete="off" />
              <div v-if="validationErrors.organizational_capacity_score" class="invalid-feedback d-block">{{
                validationErrors.organizational_capacity_score }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label class="form-label" for="contracting_capacity_score">Capacidad Contratación</label>
              <input id="contracting_capacity_score" v-model="formData.contracting_capacity_score" class="form-control"
                :class="{ 'is-invalid': validationErrors.contracting_capacity_score }" type="number" step="0.01"
                placeholder="0.00" autocomplete="off" />
              <div v-if="validationErrors.contracting_capacity_score" class="invalid-feedback d-block">{{
                validationErrors.contracting_capacity_score }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label class="form-label" for="rup_certificate_path">Certificado RUP (Archivo)</label>
              <input id="rup_certificate_path" type="file" class="form-control" accept=".pdf,.jpg,.png"
                @change="e => onFileChange(e, 'rup_certificate_path')" />
              <div v-if="filePreviews.rup_certificate_path" class="mt-2">
                <a :href="filePreviews.rup_certificate_path" target="_blank" class="btn btn-sm btn-outline-primary">
                  <i class="fad fa-file-pdf me-1"></i> Ver archivo actual
                </a>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label class="form-label required" for="statusSelect">Estado</label>
              <select ref="statusSelect" v-model="formData.status" class="form-control select2-input w-100"
                :class="{ 'is-invalid': validationErrors.status }">
                <option value="VIGENTE">Vigente</option>
                <option value="VENCIDO">Vencido</option>
                <option value="RENOVADO">Renovado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="NO_INSCRITO">No Inscrito</option>
              </select>
              <div v-if="validationErrors.status" class="invalid-feedback d-block">
                {{ validationErrors.status }}
              </div>
            </div>

            <div class="col-12">
              <label class="form-label" for="remarks">Observaciones</label>
              <textarea id="remarks" v-model="formData.remarks" class="form-control"
                :class="{ 'is-invalid': validationErrors.remarks }" rows="3"
                placeholder="Ingrese observaciones adicionales..."></textarea>
              <div v-if="validationErrors.remarks" class="invalid-feedback d-block">{{ validationErrors.remarks }}</div>
            </div>

            <div class="col-12">
              <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
            </div>
            </form>
        </div>
      </div>

      <div class="card border-0 shadow-sm mt-3 mt-md-4 fade-in-up" style="animation-delay: 0.2s;">
        <div class="card-body py-3">
          <div class="d-flex align-items-start gap-3">
            <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
              <i class="fad fa-lightbulb text-primary fs-5"></i>
            </div>
            <div>
              <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
              <ul class="text-muted small mb-0 ps-3">
                <li>
                  El estado "VIGENTE" indica que el registro está activo y habilitado para participar en procesos de
                  contratación pública.
                </li>
                <li>
                  Las capacidades jurídica, financiera y organizacional son índices calculados que determinan la
                  solvencia del proponente.
                </li>
                <li>
                  Es obligatorio mantener actualizada la fecha de vencimiento para evitar la suspensión automática del
                  registro.
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
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRupRecordsStore } from '../store/rupRecords.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useRupRecordsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));


const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Registro RUP' : 'Crear Registro RUP');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [ { label: 'Registros RUP', to: '/empresas/registro-unico-de-proponentes', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario
const formData = reactive({
  company_uuid: '',
  registration_number: '',
  issue_date: '',
  expiration_date: '',
  legal_capacity_score: null,
  financial_capacity_score: null,
  organizational_capacity_score: null,
  contracting_capacity_score: null,
  rup_certificate_path: null,
  status: 'VIGENTE',
  remarks: '',
});

const filePreviews = reactive({});

// Refs de Select2
const statusSelect = ref(null);
const companySelect = ref(null);

const selectConfigs = computed(() => [
  { ref: statusSelect, field: 'status', placeholder: 'Seleccionar estado' },
  { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccionar empresa' },
]);

const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

const validateForm = () => {
  Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

  if (!formData.company_uuid) validationErrors.company_uuid = 'Este campo es obligatorio';
  if (!formData.registration_number) validationErrors.registration_number = 'Este campo es obligatorio';
  if (!formData.status) validationErrors.status = 'Este campo es obligatorio';

  return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/empresas/registro-unico-de-proponentes');

const onFileChange = (event, field) => {
  const file = event.target.files[0];
  if (file) {
    formData[field] = file;
    // Si es edición y hay un archivo nuevo, mostramos preview local si es imagen, o icono si es PDF
    if (file.type.startsWith('image/')) {
      filePreviews[field] = URL.createObjectURL(file);
    } else {
      filePreviews[field] = '#'; // Placeholder para indicar que hay archivo seleccionado
    }
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
        // Normalizar fechas si vienen en formato ISO largo para input type="date"
        if (formData.issue_date) formData.issue_date = formData.issue_date.split(/T| /)[0];
        if (formData.expiration_date) formData.expiration_date = formData.expiration_date.split(/T| /)[0];

        if (item.rup_certificate_path) {
          filePreviews.rup_certificate_path = item.rup_certificate_path;
        }
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
  height: 44px;
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
  height: 42px;
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