<template>
    <div class="row gx-2 gx-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">

            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-building text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-2 px-md-3 border-bottom">
                    <div class="d-flex flex-wrap align-items-center gap-2">
                        <i class="fad fa-clipboard-list text-primary"></i>
                        <h6 class="mb-0 fw-semibold text-dark">Información de la empresa</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-0 ms-sm-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-2 p-md-3 p-lg-4">
                    <form @submit.prevent="handleSubmit" class="row g-2 g-md-3" novalidate>

                        <div class="col-12">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-id-card me-2"></i>Datos legales e Identificación
                            </h6>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Tipo de persona</label>
                            <select class="form-control w-100" ref="tipoPersonaSelect">
                                <option value="">Seleccionar tipo</option>
                                <option value="PERSONA JURIDICA">Jurídica</option>
                                <option value="PERSONA NATURAL">Natural</option>
                            </select>
                            <div v-if="validationErrors.person_type" class="invalid-feedback d-block">
                                {{ validationErrors.person_type }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Sector (Naturaleza)</label>
                            <select class="form-control w-100" ref="typeOfCompanySelect">
                                <option value="">Seleccionar</option>
                                <option value="PRIVADO">Privado</option>
                                <option value="PUBLICO">Público</option>
                            </select>
                            <div v-if="validationErrors.type_of_company" class="invalid-feedback d-block">
                                {{ validationErrors.type_of_company }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Tipo de documento</label>
                            <select class="form-control w-100" ref="documentTypeSelectUuid">
                                <option value="">Seleccionar tipo</option>
                                <option v-for="doc in store.catalogs.documentTypes" :key="doc.uuid" :value="doc.uuid">
                                    {{ doc.prefix }} - {{ doc.name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.document_type_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.document_type_uuid }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label">Estructura Legal</label>
                            <select class="form-control w-100" ref="legalStructureSelect">
                                <option value="">Seleccionar estructura</option>
                                <option value="SOCIEDAD POR ACCIONES SIMPLIFICADA - SAS">SAS</option>
                                <option value="SOCIEDAD DE RESPONSABILIDAD LIMITADA - LTDA">LTDA</option>
                                <option value="SOCIEDAD POR ACCIONES - SPA">SPA</option>
                                <option value="SOCIEDAD ANONIMA - SA">SA</option>
                                <option value="UNIÓN TEMPORAL - UT">UT</option>
                                <option value="ENTIDAD SIN ÁNIMO DE LUCRO - ESAL">ESAL</option>
                            </select>
                        </div>


                        <div class="col-9 col-sm-9 col-md-8 col-lg-3">
                            <label class="form-label required">Número de documento</label>
                            <input type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.document_number }"
                                v-model="formData.document_number" placeholder="Ej: 900123456" />
                            <div v-if="validationErrors.document_number" class="invalid-feedback d-block">
                                {{ validationErrors.document_number }}
                            </div>
                        </div>

                        <div class="col-3 col-sm-3 col-md-4 col-lg-2">
                            <label class="form-label">Dígito</label>
                            <input type="text" autocomplete="off" class="form-control" v-model="formData.verification_digit" maxlength="1"
                                placeholder="0" />
                        </div>

                        <div class="col-12 col-sm-12 col-md-12 col-lg-7">
                            <label class="form-label required">Razón social legal completa</label>
                            <input type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.business_name }"
                                v-model="formData.business_name" placeholder="Razón social completa" />
                            <div v-if="validationErrors.business_name" class="invalid-feedback d-block">
                                {{ validationErrors.business_name }}
                            </div>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label">Nombre comercial (Marca)</label>
                            <input type="text" autocomplete="off" class="form-control" v-model="formData.trade_name"
                                placeholder="Nombre de la marca" />
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label">Sector Económico</label>
                            <input type="text" autocomplete="off" class="form-control" v-model="formData.economic_sector"
                                placeholder="Sector económico" />
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label">Matrícula Mercantil</label>
                            <input type="text" autocomplete="off" class="form-control" v-model="formData.commercial_registration"
                                placeholder="Ej: 12345678" />
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label">N° Empleados</label>
                            <input type="text" autocomplete="off" class="form-control" v-model="formData.approximate_number_of_employees"
                                placeholder="Ej: 1-50" />
                        </div>



                        <div class="col-12 mt-3 mt-md-4">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-map-marker-alt me-2"></i>Ubicación y Tributación
                            </h6>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Municipio</label>
                            <select class="form-control w-100" ref="municipioSelect">
                                <option value="">Seleccionar municipio</option>
                                <option v-for="mun in store.catalogs.municipalities" :key="mun.uuid" :value="mun.uuid">
                                    {{ mun.name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.municipality_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.municipality_uuid }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-12 col-md-12 col-lg-6">
                            <label class="form-label required">Dirección</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{ 'is-invalid': validationErrors.address }"
                                v-model="formData.address" placeholder="Dirección completa" />
                            <div v-if="validationErrors.address" class="invalid-feedback d-block">
                                {{ validationErrors.address }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label">Código postal</label>
                            <input type="text" autocomplete="off" class="form-control" v-model="formData.postal_code" placeholder="C.P." />
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Teléfono</label>
                            <input type="tel" class="form-control" :class="{ 'is-invalid': validationErrors.phone }"
                                v-model="formData.phone" placeholder="Teléfono" />
                            <div v-if="validationErrors.phone" class="invalid-feedback d-block">
                                {{ validationErrors.phone }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-5">
                            <label class="form-label required">Correo electrónico</label>
                            <input type="email" class="form-control" :class="{ 'is-invalid': validationErrors.email }"
                                v-model="formData.email" placeholder="correo@empresa.com" />
                            <div v-if="validationErrors.email" class="invalid-feedback d-block">
                                {{ validationErrors.email }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-12 col-md-12 col-lg-4">
                            <label class="form-label required">Página Web</label>
                            <input type="url" class="form-control" :class="{ 'is-invalid': validationErrors.web_page }"
                                v-model="formData.web_page" placeholder="https://www.empresa.com" />
                            <div v-if="validationErrors.web_page" class="invalid-feedback d-block">
                                {{ validationErrors.web_page }}
                            </div>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Régimen Fiscal</label>
                            <select class="form-control w-100" ref="taxRegimeSelect">
                                <option value="">Seleccionar régimen</option>
                                <option v-for="res in store.catalogs.taxRegimes" :key="res.uuid" :value="res.uuid">
                                    {{ res.name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.tax_regime_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.tax_regime_uuid }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Moneda</label>
                            <select class="form-control w-100" ref="monedaSelect">
                                <option value="COP">COP - Peso colombiano</option>
                                <option value="USD">USD - Dólar americano</option>
                            </select>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">País</label>
                            <select class="form-control w-100" ref="paisSelect">
                                <option value="CO">Colombia</option>
                                <option value="US">Estados Unidos</option>
                            </select>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Estado</label>
                            <select class="form-control w-100" ref="statusSelect">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                        </div>


                        <div class="col-12 mt-3 mt-md-4">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-user-tie me-2"></i>Representante Legal y Firma
                            </h6>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Tipo Doc. Representante</label>
                            <select class="form-control w-100" ref="legalRepresentativeDocumenttype">
                                <option value="">Seleccionar tipo</option>
                                <option v-for="doc in store.catalogs.documentTypes" :key="doc.uuid" :value="doc.prefix">
                                    {{ doc.name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.legal_representative_document_type"
                                class="invalid-feedback d-block">
                                {{ validationErrors.legal_representative_document_type }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Núm. Doc. Representante</label>
                            <input type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.legal_representative_document_number }"
                                v-model="formData.legal_representative_document_number" placeholder="Ej: 123456789" />
                            <div v-if="validationErrors.legal_representative_document_number" class="invalid-feedback d-block">
                                {{ validationErrors.legal_representative_document_number }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label">Fecha Exp. Documento</label>
                            <input type="date" class="form-control"
                                v-model="formData.legal_representative_document_issue_date" placeholder="YYYY-MM-DD" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label">Nacionalidad Representante</label>
                            <input type="text" autocomplete="off" class="form-control" v-model="formData.legal_representative_nationality"
                                placeholder="Ej: Colombiana" />
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Nombres del representante</label>
                            <input type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.legal_representative_name }"
                                v-model="formData.legal_representative_name" placeholder="Nombres del representante" />
                            <div v-if="validationErrors.legal_representative_name" class="invalid-feedback d-block">
                                {{ validationErrors.legal_representative_name }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required">Apellidos del representante</label>
                            <input type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.legal_representative_last_name }"
                                v-model="formData.legal_representative_last_name" placeholder="Apellidos del representante" />
                            <div v-if="validationErrors.legal_representative_last_name" class="invalid-feedback d-block">
                                {{ validationErrors.legal_representative_last_name }}
                            </div>
                        </div>



                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label">Firma del representante</label>
                            <div class="d-flex flex-column gap-2 p-2 border rounded-3 bg-light">
                                <div v-if="filePreviews.signature" class="preview-box text-center">
                                    <img :src="filePreviews.signature" class="img-thumbnail img-fluid" style="max-height: 60px;">
                                </div>
                                <input type="file" class="form-control form-control-sm"
                                    @change="onFileChange($event, 'signature')" accept="image/*" />
                            </div>
                        </div>

                        <div class="text-center col-12 col-sm-6 col-md-6 col-lg-3">
                            <div class="d-flex flex-column align-items-center">
                                <div class="position-relative">
                                    <img :src="filePreviews.logo || '/assets/img/team/default.png'"
                                        class="rounded-3 border shadow-sm bg-white img-fluid"
                                        style="width: 100px; height: 100px; object-fit: contain;">
                                    <label for="logoInput"
                                        class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-1"
                                        style="transform: translate(50%, 50%); width: 32px; height: 32px;">
                                        <i class="fas fa-camera"></i>
                                    </label>
                                </div>
                                <input type="file" id="logoInput" class="d-none" @change="onFileChange($event, 'logo')"
                                    accept="image/*" />
                                <span class="fs-10 text-muted mt-3">Logo de la empresa</span>
                            </div>
                        </div>

                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-2 mt-md-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-2 p-md-3 p-lg-4">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <p class="text-muted small mb-0">
                                La información aquí registrada será la base para la generación de documentos legales,
                                contratos y facturación electrónica. Verifica que el NIT sea correcto.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Panel RUES flotante -->
    <RuesLookupPanel @select="mapRuesRegistro" />
</template>

<script setup>
import { toast } from '@/utils/toast.js';
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-14
 * @module {Features.Companies}
 * @resource {Company}
 */
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCompaniesStore } from '../store/companies.store.js';
import { usePermissionsStore } from '@store';
import { useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import RuesLookupPanel from '@/components/RuesLookupPanel.vue';

// --- STORES Y ROUTER ---
const route = useRoute();
const router = useRouter();
const store = useCompaniesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

// --- ESTADOS ---
const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar empresa' : 'Nueva empresa');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica la información legal y tributaria de la empresa' : 'Completa los datos para dar de alta una nueva entidad');
const breadcrumbs = computed(() => [ { label: 'Empresas', to: '/empresa/listas-empresa' }, { label: isEditMode.value ? 'Editar' : 'Nueva' } ]);

const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

const formData = reactive({
    person_type: '',
    type_of_company: '',
    document_type_uuid: '',
    document_number: '',
    verification_digit: '',
    business_name: '',
    trade_name: '',
    economic_sector: '',
    legal_structure: '',
    commercial_registration: '',
    approximate_number_of_employees: '',
    municipality_uuid: '',
    address: '',
    postal_code: '',
    phone: '',
    email: '',
    currency_code: 'COP',
    country_code: 'CO',
    tax_regime_uuid: '',
    legal_representative_name: '',
    legal_representative_last_name: '',
    legal_representative_document_type: '',
    legal_representative_document_number: '',
    legal_representative_nationality: '',
    legal_representative_document_issue_date: '',
    is_active: '1',
    web_page: '',
    logo: null,
    signature: null,
});

const filePreviews = reactive({ logo: null, signature: null });

// --- REFS PARA SELECT2 ---
const tipoPersonaSelect = ref(null);
const typeOfCompanySelect = ref(null);
const documentTypeSelectUuid = ref(null);
const municipioSelect = ref(null);
const monedaSelect = ref(null);
const paisSelect = ref(null);
const taxRegimeSelect = ref(null);
const legalRepresentativeDocumenttype = ref(null);
const statusSelect = ref(null);
const legalStructureSelect = ref(null);

const selectConfigs = computed(() => [
    { ref: tipoPersonaSelect, field: 'person_type', placeholder: 'Seleccionar tipo' },
    { ref: typeOfCompanySelect, field: 'type_of_company', placeholder: 'Seleccionar naturaleza' },
    { ref: documentTypeSelectUuid, field: 'document_type_uuid', placeholder: 'Seleccionar tipo' },
    { ref: municipioSelect, field: 'municipality_uuid', placeholder: 'Seleccionar municipio' },
    { ref: taxRegimeSelect, field: 'tax_regime_uuid', placeholder: 'Seleccionar régimen' },
    { ref: monedaSelect, field: 'currency_code', placeholder: 'Seleccionar moneda' },
    { ref: paisSelect, field: 'country_code', placeholder: 'Seleccionar país' },
    { ref: legalRepresentativeDocumenttype, field: 'legal_representative_document_type', placeholder: 'Seleccionar tipo' },
    { ref: statusSelect, field: 'is_active', placeholder: 'Seleccionar estado' },
    { ref: legalStructureSelect, field: 'legal_structure', placeholder: 'Seleccionar estructura' },
]);

// --- FUNCIONES ---
const can = (action, subject) => permissionsStore.can(action, subject);

const onFileChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
        formData[field] = file;
        filePreviews[field] = URL.createObjectURL(file);
    }
};

const goBack = () => {
    if (can('companies.index')) {
        router.push('/empresa/listas-empresa');
    } else {
        router.push(`/empresa/perfil/${userStore.company_uuid}`);
    }
};

// ─── Hook Select2 ─────────────────────────────────────────────────────────────
const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

const setSelect2ValuesTrigger = () => setSelect2Values(selectConfigs.value);
const initSelect2Trigger = () => initSelect2(selectConfigs.value);

// ─── RUES Lookup ─────────────────────────────────────────────────────────────
/**
 * Mapea el registro del RUES al formData al recibir el evento @select del panel.
 * @param {Object} registro
 */
function mapRuesRegistro(registro) {
    if (registro.nit) formData.document_number = registro.nit;
    if (registro.digito_verificacion) formData.verification_digit = registro.digito_verificacion;
    if (registro.razon_social) formData.business_name = registro.razon_social;
    if (registro.matricula) formData.commercial_registration = registro.matricula;

    if (registro.representante_legal) {
        const partes = registro.representante_legal.trim().split(' ');
        if (partes.length >= 2) {
            formData.legal_representative_last_name = partes.slice(0, Math.ceil(partes.length / 2)).join(' ');
            formData.legal_representative_name = partes.slice(Math.ceil(partes.length / 2)).join(' ');
        }
    }
    if (registro.num_identificacion_representante_legal) {
        formData.legal_representative_document_number = registro.num_identificacion_representante_legal;
    }

    nextTick(() => setSelect2ValuesTrigger());
}

// --- VALIDACION Y SUBMIT ---
const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);
    const required = [
        'person_type', 'type_of_company', 'document_type_uuid', 'document_number', 'business_name',
        'municipality_uuid', 'address', 'phone', 'email', 'tax_regime_uuid', 'web_page',
        'legal_representative_name', 'legal_representative_last_name', 'legal_representative_document_type', 'legal_representative_document_number'
    ];
    required.forEach(field => {
        if (!formData[field]) validationErrors[field] = 'Este campo es obligatorio';
    });
    return Object.keys(validationErrors).length === 0;
};

const handleSubmit = async () => {
    // Sincronizar Select2 → formData antes de validar
    syncFromSelect2(selectConfigs.value);

    if (!validateForm()) {
        applyAllValidations(selectConfigs.value);
        const firstError = document.querySelector('.is-invalid, .is-invalid-select2');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return toast('Atención', 'Revisa los campos obligatorios', 'warning');
    }

    try {
        submitting.value = true;
        let companyUuid = isEditMode.value ? route.params.id : null;

        if (isEditMode.value) {
            await store.updateItem(companyUuid, formData);
        } else {
            const newItem = await store.createItem(formData);
            companyUuid = newItem?.uuid || newItem?.id;
        }

        if (formData.logo instanceof File) {
            await store.uploadLogo(companyUuid, formData.logo);
        }
        if (formData.signature instanceof File) {
            await store.uploadSignature(companyUuid, formData.signature);
        }

        submitting.value = false;
        goBack();
    } catch (error) {
        submitting.value = false;
        toast('Error', 'No se pudo procesar la solicitud', 'error');
    }
};

// --- CICLO DE VIDA ---
onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.loadFormOptions();
        if (isEditMode.value) {
            const response = await store.fetchProfileById(route.params.id);
            const company = response?.data?.data || response?.data || response;
            if (company) {
                Object.assign(formData, company);
                if (formData.legal_representative_document_issue_date) {
                    formData.legal_representative_document_issue_date = formData.legal_representative_document_issue_date.split(' ')[0];
                }
                formData.is_active = (company.is_active == 1 || company.is_active === true || company.is_active === '1') ? '1' : '0';
                filePreviews.logo = company.logo_url;
                filePreviews.signature = company.signature_url;
            }
        }
    } catch (e) {

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
