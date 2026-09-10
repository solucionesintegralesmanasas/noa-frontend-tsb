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

                <div class="card-body p-2 p-md-3 p-lg-4">
                    <form @submit.prevent="handleSubmit" class="row g-2 g-md-3" novalidate>

                        <!-- IDENTIDAD: foto + documento -->
                        <div class="col-12">
                            <div class="row g-2 g-md-3 align-items-center">
                                <div class="col-12 col-md-auto">
                                    <ProfilePhotoUploader :preview-src="filePreviews.photo" @change="onPhotoSelected" @remove="onPhotoRemoved" />
                                </div>
                                <div class="col-12 col-md">
                                    <div class="row g-2 g-md-3">
                                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                                            <label class="form-label required" for="person_type">Tipo de Persona</label>
                                            <select id="person_type" ref="personTypeSelect" class="form-control select2-input w-100">
                                                <option value="">Seleccione...</option>
                                                <option value="NATURAL">Natural</option>
                                                <option value="JURIDICA">Jurídica</option>
                                            </select>
                                            <div v-show="validationErrors.person_type" class="invalid-feedback d-block">
                                                {{ validationErrors.person_type }}
                                            </div>
                                        </div>

                                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                                            <label class="form-label required" for="document_type_uuid">Tipo de Documento</label>
                                            <select id="document_type_uuid" ref="docTypeSelect" class="form-control select2-input w-100">
                                                <option value="">Seleccione...</option>
                                                <option v-for="opt in store.catalogs.documentTypes" :key="opt.uuid" :value="opt.uuid">
                                                    {{ opt.name }}
                                                </option>
                                            </select>
                                            <div v-show="validationErrors.document_type_uuid" class="invalid-feedback d-block">
                                                {{ validationErrors.document_type_uuid }}
                                            </div>
                                        </div>

                                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                                            <label class="form-label required" for="document_number">Número de Documento</label>
                                            <input id="document_number" v-model="formData.document_number" class="form-control"
                                                :class="{ 'is-invalid': validationErrors.document_number }" type="text" autocomplete="off"
                                                placeholder="Ingresa el número de documento" />
                                            <div v-show="validationErrors.document_number" class="invalid-feedback d-block">
                                                {{ validationErrors.document_number }}
                                            </div>
                                        </div>

                                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                                            <label class="form-label" for="nit_check_digit">Dígito de Verificación</label>
                                            <input id="nit_check_digit" v-model="formData.nit_check_digit" class="form-control"
                                                :class="{ 'is-invalid': validationErrors.nit_check_digit }" type="text" autocomplete="off"
                                                :disabled="formData.person_type !== 'JURIDICA'"
                                                placeholder="Solo para personas jurídicas" />
                                            <div v-show="validationErrors.nit_check_digit" class="invalid-feedback d-block">
                                                {{ validationErrors.nit_check_digit }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- IDENTIFICACIÓN -->
                        <div class="col-12">
                            <h6 class="text-uppercase fw-bold text-secondary mb-3 mt-2 border-bottom pb-2">
                                <i class="fas fa-address-card me-2"></i>
                                Identificación
                            </h6>
                        </div>

                        <div class="col-12" v-if="formData.person_type !== 'JURIDICA'">
                            <div class="row g-2 g-md-3">
                                <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                    <label class="form-label required" for="first_name">Nombres</label>
                                    <input id="first_name" v-model="formData.first_name" class="form-control"
                                        :class="{ 'is-invalid': validationErrors.first_name }" type="text" autocomplete="off"
                                        placeholder="Nombres propios (personas naturales)" />
                                    <div v-show="validationErrors.first_name" class="invalid-feedback d-block">
                                        {{ validationErrors.first_name }}
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                    <label class="form-label required" for="last_name">Apellidos</label>
                                    <input id="last_name" v-model="formData.last_name" class="form-control"
                                        :class="{ 'is-invalid': validationErrors.last_name }" type="text" autocomplete="off"
                                        placeholder="Apellidos (personas naturales)" />
                                    <div v-show="validationErrors.last_name" class="invalid-feedback d-block">
                                        {{ validationErrors.last_name }}
                                    </div>
                                </div>
                                <div class="col-12 col-sm-12 col-md-4 col-lg-4">
                                    <label class="form-label" for="trade_name">Nombre Comercial</label>
                                    <input id="trade_name" v-model="formData.trade_name" class="form-control"
                                        :class="{ 'is-invalid': validationErrors.trade_name }" type="text" autocomplete="off"
                                        placeholder="Nombre comercial o razón social" />
                                    <div v-show="validationErrors.trade_name" class="invalid-feedback d-block">
                                        {{ validationErrors.trade_name }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12" v-if="formData.person_type === 'JURIDICA'">
                            <div class="row g-2 g-md-3">
                                <div class="col-12">
                                    <label class="form-label required" for="company_name">Razón Social</label>
                                    <input id="company_name" v-model="formData.company_name" class="form-control"
                                        :class="{ 'is-invalid': validationErrors.company_name }" type="text" autocomplete="off"
                                        placeholder="Razón social legal completa" />
                                    <div v-show="validationErrors.company_name" class="invalid-feedback d-block">
                                        {{ validationErrors.company_name }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- CONTACTO -->
                        <div class="col-12">
                            <h6 class="text-uppercase fw-bold text-secondary mb-3 mt-2 border-bottom pb-2">
                                <i class="fas fa-envelope me-2"></i>
                                Contacto
                            </h6>
                        </div>

                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="email">Correo Electrónico</label>
                            <input id="email" v-model="formData.email" class="form-control"
                                :class="{ 'is-invalid': validationErrors.email }" type="email" placeholder="correo@ejemplo.com" />
                            <div v-show="validationErrors.email" class="invalid-feedback d-block">
                                {{ validationErrors.email }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label" for="phone">Teléfono</label>
                            <input id="phone" v-model="formData.phone" class="form-control"
                                :class="{ 'is-invalid': validationErrors.phone }" type="text" autocomplete="off" placeholder="Teléfono de contacto" />
                            <div v-show="validationErrors.phone" class="invalid-feedback d-block">
                                {{ validationErrors.phone }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label" for="address">Dirección</label>
                            <input id="address" v-model="formData.address" class="form-control"
                                :class="{ 'is-invalid': validationErrors.address }" type="text" autocomplete="off"
                                placeholder="Dirección de residencia o establecimiento" />
                            <div v-show="validationErrors.address" class="invalid-feedback d-block">
                                {{ validationErrors.address }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="municipality_uuid">Municipio</label>
                            <select id="municipality_uuid" ref="municipalitySelect" class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option v-for="opt in store.catalogs.cities" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.name }}
                                </option>
                            </select>
                            <div v-show="validationErrors.municipality_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.municipality_uuid }}
                            </div>
                        </div>

                        <!-- DATOS BANCARIOS -->
                        <div class="col-12">
                            <h6 class="text-uppercase fw-bold text-secondary mb-3 mt-2 border-bottom pb-2">
                                <i class="fas fa-piggy-bank me-2"></i>
                                Datos Bancarios
                            </h6>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label" for="bank_account_number">Número de Cuenta Bancaria</label>
                            <input id="bank_account_number" v-model="formData.bank_account_number" class="form-control"
                                :class="{ 'is-invalid': validationErrors.bank_account_number }" type="text" autocomplete="off"
                                placeholder="Número de cuenta" />
                            <div v-show="validationErrors.bank_account_number" class="invalid-feedback d-block">
                                {{ validationErrors.bank_account_number }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label" for="bank_account_type">Tipo de Cuenta</label>
                            <select id="bank_account_type" ref="bankAccountTypeSelect" class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option value="AHORROS">Ahorros</option>
                                <option value="CORRIENTE">Corriente</option>
                                <option value="MONEDA_EXTRANJERA">Moneda Extranjera</option>
                            </select>
                            <div v-show="validationErrors.bank_account_type" class="invalid-feedback d-block">
                                {{ validationErrors.bank_account_type }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label" for="bank_name">Banco</label>
                            <input id="bank_name" v-model="formData.bank_name" class="form-control"
                                :class="{ 'is-invalid': validationErrors.bank_name }" type="text" autocomplete="off"
                                placeholder="Nombre de la entidad financiera" />
                            <div v-show="validationErrors.bank_name" class="invalid-feedback d-block">
                                {{ validationErrors.bank_name }}
                            </div>
                        </div>

                        <!-- FISCAL Y ACCESO -->
                        <div class="col-12">
                            <h6 class="text-uppercase fw-bold text-secondary mb-3 mt-2 border-bottom pb-2">
                                <i class="fas fa-key me-2"></i>
                                Fiscal y Acceso
                            </h6>
                        </div>

                        <div :class="bottomRowColClass">
                            <label class="form-label required" for="tax_regime">Régimen Tributario</label>
                            <select id="tax_regime" ref="taxRegimeSelect" class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option value="48">Régimen Común (48)</option>
                                <option value="49">Responsable de IVA (49)</option>
                                <option value="47">No Responsable de IVA (47)</option>
                                <option value="05">Gran Contribuyente (05)</option>
                                <option value="42">Autorretenedor (42)</option>
                            </select>
                            <div v-show="validationErrors.tax_regime" class="invalid-feedback d-block">
                                {{ validationErrors.tax_regime }}
                            </div>
                        </div>

                        <div :class="bottomRowColClass">
                            <label class="form-label required" for="tax_responsibility_uuid">Responsabilidad Fiscal</label>
                            <select id="tax_responsibility_uuid" ref="taxRespSelect" class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option v-for="opt in store.catalogs.taxResponsibilities" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.name }}
                                </option>
                            </select>
                            <div v-show="validationErrors.tax_responsibility_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.tax_responsibility_uuid }}
                            </div>
                        </div>

                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                        
                        <div :class="bottomRowColClass" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa</label>
                            <select id="company_uuid" ref="companySelect" class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option v-for="opt in store.catalogs.companies" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.business_name }}
                                </option>
                            </select>
                            <div v-show="validationErrors.company_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>

                            <div :class="bottomRowColClass">
                                <label class="form-label required" for="partyTypes">Tipo de Tercero</label>
                                <PrimeMultiSelect v-model="formData.partyTypes" :options="partyTypeOptions"
                                    option-value="value" option-label="label"
                                    :placeholder="isEmployeeSelected ? 'Empleado (solo)' : 'Seleccione tipo(s)'" class="w-100"
                                    :selectionLimit="isEmployeeSelected ? 1 : null" :maxSelectedLabels="isEmployeeSelected ? 1 : 3"
                                    :class="{'p-invalid': validationErrors.partyTypes}" />
                                <small v-if="isEmployeeSelected" class="text-info d-block mt-1" style="font-size:.72rem"><i class="fas fa-info-circle me-1"></i>Empleado solo puede tener el tipo Empleado.</small>
                                <div v-show="validationErrors.partyTypes" class="text-danger small mt-1">
                                    {{ validationErrors.partyTypes }}
                                </div>
                            </div>

                            <div :class="bottomRowColClass">
                                <label class="form-label" for="rbacRoles">Roles de Acceso</label>
                                <PrimeMultiSelect v-model="formData.rbacRoles" :options="filteredRbacRoleOptions"
                                    option-value="value" option-label="label"
                                    :placeholder="isEmployeeSelected ? 'Seleccione un único rol' : 'Seleccione rol(es) de usuario'" class="w-100"
                                    :selectionLimit="isEmployeeSelected ? 1 : null" :maxSelectedLabels="isEmployeeSelected ? 1 : 3"
                                    :class="{'p-invalid': validationErrors.rbacRoles}" />
                                <small v-if="isEmployeeSelected" class="text-info d-block mt-1" style="font-size:.72rem"><i class="fas fa-info-circle me-1"></i>Empleado solo puede tener un único rol (cualquiera, no ligado al tipo).</small>
                                <div v-show="validationErrors.rbacRoles" class="text-danger small mt-1">
                                    {{ validationErrors.rbacRoles }}
                                </div>
                            </div>

                        <div :class="bottomRowColClass">
                            <label class="form-label required" for="statusSelect">Estado</label>
                            <select id="statusSelect" ref="statusSelect" class="form-control select2-input w-100">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                            <div v-show="validationErrors.is_active" class="invalid-feedback d-block">
                                {{ validationErrors.is_active }}
                            </div>
                        </div>

                            <!-- INFORMACIÓN DE LICENCIA (Solo para Conductores en Creación) -->
                        <div class="col-12" v-show="formData.partyTypes && formData.partyTypes.includes('is_driver') && !isEditMode">
                            <h6 class="text-uppercase fw-bold text-secondary mb-3 mt-4 border-bottom pb-2">
                                <i class="fas fa-id-card me-2"></i>
                                Información de Licencia de Conducción y Afiliación
                            </h6>

                            <div class="col-12 mb-2" v-if="isOwnerDriver">
                                <div class="alert alert-success d-flex align-items-center py-2 px-3 mb-0 rounded-3 border-success border-opacity-25">
                                    <i class="fad fa-user-check fs-5 text-success me-2"></i>
                                    <div class="small">
                                        <strong>Modo Conductor Propietario:</strong> Este tercero se registrará simultáneamente como afiliado (propietario) y conductor. Su licencia quedará vinculada automáticamente a su propia cuenta de afiliado.
                                    </div>
                                </div>
                            </div>

                            <div class="row g-2 g-md-3">
                                <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                    <label class="form-label required" for="license_number">Número de Licencia</label>
                                    <input type="text" autocomplete="off" id="license_number" v-model="formData.license_number" class="form-control"
                                        :class="{ 'is-invalid': validationErrors.license_number }" placeholder="Número">
                                    <div v-show="validationErrors.license_number" class="invalid-feedback d-block">
                                        {{ validationErrors.license_number }}
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                    <label class="form-label required" for="license_category">Categoría</label>
                                    <select id="license_category" ref="licenseCategorySelect" class="form-control select2-input w-100">
                                        <option value="">Seleccione...</option>
                                        <option value="C1">C1</option>
                                        <option value="C2">C2</option>
                                        <option value="C3">C3</option>
                                    </select>
                                    <div v-show="validationErrors.license_category" class="invalid-feedback d-block">
                                        {{ validationErrors.license_category }}
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                    <label class="form-label required" for="license_issue_date">Fecha Expedición</label>
                                    <input type="date" id="license_issue_date" v-model="formData.license_issue_date"
                                        class="form-control" :class="{ 'is-invalid': validationErrors.license_issue_date }" placeholder="YYYY-MM-DD">
                                    <div v-show="validationErrors.license_issue_date" class="invalid-feedback d-block">
                                        {{ validationErrors.license_issue_date }}
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                    <label class="form-label required" for="license_expiration_date">Fecha Expiración</label>
                                    <input type="date" id="license_expiration_date" v-model="formData.license_expiration_date"
                                        class="form-control" :class="{ 'is-invalid': validationErrors.license_expiration_date }" placeholder="YYYY-MM-DD">
                                    <div v-show="validationErrors.license_expiration_date" class="invalid-feedback d-block">
                                        {{ validationErrors.license_expiration_date }}
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6 col-md-4 col-lg-4" v-if="!isOwnerDriver">
                                    <label class="form-label required" for="affiliate_uuid">Afiliado Asignado (Propietario)</label>
                                    <select id="affiliate_uuid" ref="affiliateSelect" class="form-control select2-input w-100">
                                        <option value="">Seleccione afiliado...</option>
                                        <option v-for="a in store.catalogs.affiliate" :key="a.uuid" :value="a.uuid">
                                            {{ a.document_number }} - {{ a.trade_name || a.company_name || a.first_name
                                                + ' ' + (a.last_name || '') }}
                                        </option>
                                    </select>
                                    <div v-show="validationErrors.affiliate_uuid" class="invalid-feedback d-block">
                                        {{ validationErrors.affiliate_uuid }}
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6 col-md-4 col-lg-4" v-else>
                                    <label class="form-label fw-medium text-success">Afiliado Asignado</label>
                                    <div class="d-flex align-items-center gap-2 p-2 border rounded bg-light" style="height: 38px;">
                                        <i class="fad fa-badge-check text-success"></i>
                                        <span class="small fw-semibold text-dark">Auto-afiliado (Él mismo)</span>
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                    <label class="form-label" for="license_restrictions">Restricciones</label>
                                    <input type="text" autocomplete="off" id="license_restrictions" v-model="formData.license_restrictions"
                                        class="form-control" :class="{ 'is-invalid': validationErrors.license_restrictions }"
                                        placeholder="Ej: Lentes, limitación auditiva...">
                                    <div v-show="validationErrors.license_restrictions" class="invalid-feedback d-block">
                                        {{ validationErrors.license_restrictions }}
                                    </div>
                                </div>
                                <div class="col-12 col-sm-12 col-md-12 col-lg-12">
                                    <label class="form-label required" for="license_status">Estado de Licencia</label>
                                    <select id="license_status" ref="licenseStatusSelect" class="form-control select2-input w-100">
                                        <option value="ACTIVA">Activa</option>
                                        <option value="SUSPENDIDA">Suspendida</option>
                                        <option value="VENCIDA">Vencida</option>
                                        <option value="CANCELADA">Cancelada</option>
                                    </select>
                                    <div v-show="validationErrors.license_status" class="invalid-feedback d-block">
                                        {{ validationErrors.license_status }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-2 p-md-3 p-lg-4">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    El Dígito de Verificación es obligatorio para personas jurídicas y se calcula
                                    algoritmicamente sobre el NIT.
                                </li>
                                <li>
                                    La selección correcta del Régimen Tributario y las Responsabilidades Fiscales es
                                    crucial para la generación válida de facturas electrónicas ante la DIAN.
                                </li>
                                <li>
                                    Un mismo tercero puede tener múltiples roles simultáneos (ej. ser cliente y
                                    proveedor a la vez), lo cual se gestiona mediante los checkboxes de roles.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Panel RUES flotante -->
        <RuesLookupPanel @select="mapRuesRegistroThirdParty" />
    </div>
</template>

<script setup>
import { toast } from '@/utils/toast.js';
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-14
 * @module {Features.ThirdParties}
 * @resource {ThirdParty}
 */

import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useThirdPartiesStore } from '../store/thirdParties.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import apiClient from '@/services/api/client.js';
import Swal from 'sweetalert2';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import ProfilePhotoUploader from '@/components/ProfilePhotoUploader.vue';
import RuesLookupPanel from '@/components/RuesLookupPanel.vue';

const route = useRoute();
const router = useRouter();
const store = useThirdPartiesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Tercero' : 'Registrar Tercero');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [ dynamicBreadcrumb.value, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);

const routeType = computed(() => {
    const path = route.path;
    if (path.includes('/cliente')) return 'is_customer';
    if (path.includes('/proveedor')) return 'is_supplier';
    if (path.includes('/empleado')) return 'is_employee';
    if (path.includes('/afiliado')) return 'is_affiliate';
    if (path.includes('/conductor')) return 'is_driver';
    return 'all';
});

const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario (inicializar campos del JSON de la Tarea 1)
const formData = reactive({
    is_active: '1',
    partyTypes: [],
    rbacRoles: [],
    roles: [],
    is_customer: '0',
    is_supplier: '0',
    is_employee: '0',
    is_affiliate: '0',
    is_driver: '0',
    is_others: '0',
    person_type: '',
    document_type_uuid: '',
    document_number: '',
    nit_check_digit: '',
    first_name: '',
    last_name: '',
    trade_name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    municipality_uuid: '',
    bank_account_number: '',
    bank_account_type: '',
    bank_name: '',
    tax_regime: '',
    tax_responsibility_uuid: '',
    company_uuid: '',
    license_number: null,
    license_category: null,
    license_issue_date: null,
    license_expiration_date: null,
    license_restrictions: null,
    license_status: 'ACTIVA',
    affiliate_uuid: null,
});

const filePreviews = reactive({});

// --- REFS PARA SELECT2 ---
const personTypeSelect = ref(null);
const docTypeSelect = ref(null);
const municipalitySelect = ref(null);
const bankAccountTypeSelect = ref(null);
const taxRegimeSelect = ref(null);
const taxRespSelect = ref(null);
const companySelect = ref(null);
const statusSelect = ref(null);
const licenseCategorySelect = ref(null);
const affiliateSelect = ref(null);
const licenseStatusSelect = ref(null);

const selectConfigs = computed(() => [
    { ref: personTypeSelect, field: 'person_type', placeholder: 'Seleccione...' },
    { ref: docTypeSelect, field: 'document_type_uuid', placeholder: 'Seleccione...' },
    { ref: municipalitySelect, field: 'municipality_uuid', placeholder: 'Seleccione...' },
    { ref: bankAccountTypeSelect, field: 'bank_account_type', placeholder: 'Seleccione...' },
    { ref: taxRegimeSelect, field: 'tax_regime', placeholder: 'Seleccione...' },
    { ref: taxRespSelect, field: 'tax_responsibility_uuid', placeholder: 'Seleccione...' },
    { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccione...' },
    { ref: statusSelect, field: 'is_active', placeholder: 'Seleccione...' },
    { ref: licenseCategorySelect, field: 'license_category', placeholder: 'Seleccione...' },
    { ref: affiliateSelect, field: 'affiliate_uuid', placeholder: 'Seleccione...' },
    { ref: licenseStatusSelect, field: 'license_status', placeholder: 'Seleccione...' }
]);

const { initSelect2, setValues: setSelect2Values, destroySelect2 } = useSelect2(formData, validationErrors);

const isOwnerDriver = computed(() => formData.partyTypes && formData.partyTypes.includes('is_affiliate') && formData.partyTypes.includes('is_driver'));

/**
 * Opciones del selector "Tipo de Tercero".
 * Son los tipos fijos de tercero (flags is_*) que determinan el perfil del
 * registro y su filtrado en los listados.
 */
const partyTypeOptions = [
    { value: 'is_customer', label: 'Cliente' },
    { value: 'is_supplier', label: 'Proveedor' },
    { value: 'is_employee', label: 'Empleado' },
    { value: 'is_affiliate', label: 'Afiliado' },
    { value: 'is_driver', label: 'Conductor' },
    { value: 'is_others', label: 'Otro' },
];

/**
 * Opciones del selector "Roles de Acceso".
 * Se cargan dinámicamente desde el backend (auth/roles/list): si se crea un rol
 * nuevo en el sistema, aparecerá automáticamente aquí.
 */
const rbacRoleOptions = computed(() =>
    (store.catalogs.roles || [])
        .map(r => r?.name)
        .filter(Boolean)
        .map(name => ({ value: name, label: name }))
);

// --- Regla: Empleado solo puede tener un único tipo y un único rol (tipo y rol son independientes) ---
const isEmployeeSelected = computed(() => formData.partyTypes?.includes('is_employee'));
const filteredRbacRoleOptions = computed(() => {
    // Mostrar TODOS los roles siempre, solo limitar selección a 1 cuando es empleado
    return rbacRoleOptions.value;
});

const bottomRowColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-6 col-md-3 col-lg-3'
        : 'col-12 col-sm-6 col-md-4 col-lg-4';
});

// Forzar regla: si se marca Empleado, solo puede quedar un tipo y un rol (cualquiera)
watch(isEmployeeSelected, (isEmp) => {
    if (isEmp) {
        if (formData.partyTypes.length > 1) formData.partyTypes = ['is_employee'];
        if (formData.rbacRoles.length > 1) formData.rbacRoles = [formData.rbacRoles[formData.rbacRoles.length - 1]];
    }
});
watch(() => formData.partyTypes, (val) => {
    if (val?.includes('is_employee') && val.length > 1) {
        formData.partyTypes = ['is_employee'];
    }
}, { deep: true });
watch(() => formData.rbacRoles, (val) => {
    if (isEmployeeSelected.value && val?.length > 1) {
        formData.rbacRoles = [val[val.length - 1]];
    }
});

// ─── RUES Lookup ─────────────────────────────────────────────────────────────
/**
 * Mapea el registro del RUES al formData para personas jurídicas.
 * Recibe el evento @select del RuesLookupPanel.
 * @param {Object} registro
 */
function mapRuesRegistroThirdParty(registro) {
    formData.person_type = 'JURIDICA';
    
    // Buscar tipo de documento NIT en el catálogo
    const nitDocType = store.catalogs.documentTypes?.find(d => 
        (d.code || '').toUpperCase() === 'NIT' || 
        (d.name || '').toUpperCase().includes('NIT')
    );
    if (nitDocType) {
        formData.document_type_uuid = nitDocType.uuid;
    }

    if (registro.nit) formData.document_number = registro.nit;
    if (registro.digito_verificacion) formData.nit_check_digit = registro.digito_verificacion;
    if (registro.razon_social) formData.company_name = registro.razon_social;
}

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    // Validar requeridos según el JSON
    if (!formData.company_uuid) validationErrors.company_uuid = 'Este campo es obligatorio';
    if (!formData.person_type) validationErrors.person_type = 'Este campo es obligatorio';
    if (!formData.document_type_uuid) validationErrors.document_type_uuid = 'Este campo es obligatorio';
    if (!formData.document_number) validationErrors.document_number = 'Este campo es obligatorio';

    if (formData.person_type === 'JURIDICA') {
        if (!formData.company_name) validationErrors.company_name = 'Este campo es obligatorio';

        // Limpiar campos que no aplican para enviarlos vacíos
        formData.first_name = null;
        formData.last_name = null;
        formData.trade_name = null;
    } else {
        if (!formData.first_name) validationErrors.first_name = 'Este campo es obligatorio';
        if (!formData.last_name) validationErrors.last_name = 'Este campo es obligatorio';

        // Limpiar campos que no aplican
        formData.company_name = null;
    }

    if (!formData.email) validationErrors.email = 'Este campo es obligatorio';
    if (!formData.municipality_uuid) validationErrors.municipality_uuid = 'Este campo es obligatorio';
    if (!formData.tax_regime) validationErrors.tax_regime = 'Este campo es obligatorio';
    if (!formData.tax_responsibility_uuid) validationErrors.tax_responsibility_uuid = 'Este campo es obligatorio';
    if (!formData.is_active) validationErrors.is_active = 'Este campo es obligatorio';
    if (!formData.partyTypes || formData.partyTypes.length === 0) validationErrors.partyTypes = 'Debe seleccionar al menos un tipo de tercero';

    // Regla: Empleado solo puede tener un único tipo y un único rol (independientes)
    if (isEmployeeSelected.value) {
        if (formData.partyTypes.length > 1) {
            validationErrors.partyTypes = 'Un empleado solo puede tener el tipo Empleado (sin combinar con otros).';
        }
        if (formData.rbacRoles && formData.rbacRoles.length > 1) {
            validationErrors.rbacRoles = 'Un empleado solo puede tener un único rol de acceso.';
        }
    }

    // Validar licencia si es conductor (solo al crear)
    if (formData.partyTypes && formData.partyTypes.includes('is_driver') && !isEditMode.value) {
        if (!isOwnerDriver.value && !formData.affiliate_uuid) {
            validationErrors.affiliate_uuid = 'Debe asignar el conductor a un afiliado';
        }
        if (!formData.license_number) validationErrors.license_number = 'El número de licencia es obligatorio';
        if (!formData.license_category) validationErrors.license_category = 'La categoría es obligatoria';
        if (!formData.license_issue_date) validationErrors.license_issue_date = 'La fecha de expedición es obligatoria';
        if (!formData.license_expiration_date) {
            validationErrors.license_expiration_date = 'La fecha de expiración es obligatoria';
        } else if (formData.license_issue_date && formData.license_expiration_date) {
            const issueDate = new Date(formData.license_issue_date);
            const expirationDate = new Date(formData.license_expiration_date);
            if (expirationDate <= issueDate) {
                validationErrors.license_expiration_date = 'La fecha de expiración debe ser posterior a la fecha de expedición';
            }
        }
        if (!formData.license_status) validationErrors.license_status = 'El estado de la licencia es obligatorio';
    } else if (!isEditMode.value) {
        // Limpiar para que no se envíen si no es conductor
        formData.affiliate_uuid = null;
        formData.license_number = null;
        formData.license_category = null;
        formData.license_issue_date = null;
        formData.license_expiration_date = null;
        formData.license_restrictions = null;
    }

    return Object.keys(validationErrors).length === 0;
};

const dynamicBreadcrumb = computed(() => {
    const path = route.path;
    if (path.includes('/cliente')) return { label: 'Clientes', to: '/terceros/clientes' };
    if (path.includes('/proveedor')) return { label: 'Proveedores', to: '/terceros/proveedores' };
    if (path.includes('/empleado')) return { label: 'Empleados', to: '/terceros/empleados' };
    if (path.includes('/afiliado')) return { label: 'Afiliados', to: '/terceros/afiliados' };
    if (path.includes('/conductor')) return { label: 'Conductores', to: '/terceros/conductores' };
    return { label: 'Terceros', to: '/terceros' };
});

const goBack = () => router.push(dynamicBreadcrumb.value.to);

const revokePreview = () => {
    if (filePreviews.photo?.startsWith('blob:')) URL.revokeObjectURL(filePreviews.photo);
};

const onPhotoSelected = (file) => {
    revokePreview();
    formData.photo = file;
    filePreviews.photo = URL.createObjectURL(file);
};

const onPhotoRemoved = () => {
    revokePreview();
    formData.photo = null;
    filePreviews.photo = '';
};

const handleSubmit = async () => {
    const activePartyTypes = formData.partyTypes || [];

    // Los flags de tipo de tercero se derivan del selector "Tipo de Tercero".
    const hasType = (...values) => values.some(v => activePartyTypes.includes(v));

    formData.is_customer = hasType('is_customer') ? '1' : '0';
    formData.is_supplier = hasType('is_supplier') ? '1' : '0';
    formData.is_employee = hasType('is_employee') ? '1' : '0';
    formData.is_affiliate = hasType('is_affiliate') ? '1' : '0';
    formData.is_driver = hasType('is_driver') ? '1' : '0';
    formData.is_others = hasType('is_others') ? '1' : '0';

    // El array `roles` que se envía al backend son los roles RBAC del usuario vinculado.
    formData.roles = [...new Set(formData.rbacRoles || [])];

    if (!validateForm()) {
        const firstError = document.querySelector('.is-invalid');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return toast('Atención', 'Revisa los campos obligatorios', 'warning');
    }

    if (isOwnerDriver.value) {
        formData.affiliate_uuid = null;
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

        // Subida de archivos tipo "file" por separado
        if (formData.photo instanceof File) {
            await store.uploadPhoto(uuid, formData.photo);
        }

        goBack();
    } catch (error) {
        if (error.response && error.response.status === 422) {
            const backendErrors = error.response.data?.error?.details || error.response.data?.errors || {};
            let hasErrors = false;

            const formatValidationMsg = (msg) => {
                if (!msg) return 'Campo inválido';
                const dict = {
                    'validation.required': 'Este campo es obligatorio.',
                    'validation.max.string': 'El texto ingresado supera el límite máximo de caracteres permitidos.',
                    'validation.min.string': 'El texto ingresado es demasiado corto.',
                    'validation.email': 'Ingrese un correo electrónico válido.',
                    'validation.unique': 'Ya existe un tercero registrado con este documento para la empresa seleccionada.',
                    'validation.numeric': 'Este campo debe contener únicamente números.',
                    'validation.date': 'Debe ingresar una fecha válida.',
                };
                return dict[msg] || msg;
            };

            if (Array.isArray(backendErrors)) {
                for (const detail of backendErrors) {
                    if (detail.field && detail.messages && detail.messages.length > 0) {
                        validationErrors[detail.field] = formatValidationMsg(detail.messages[0]);
                        hasErrors = true;
                    }
                }
            } else {
                for (const [field, messages] of Object.entries(backendErrors)) {
                    if (messages && messages.length > 0) {
                        const rawMsg = Array.isArray(messages) ? messages[0] : messages;
                        validationErrors[field] = formatValidationMsg(rawMsg);
                        hasErrors = true;
                    }
                }
            }

            if (hasErrors) {
                const firstError = document.querySelector('.is-invalid');
                if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                toast('Atención', 'Hay errores de validación. Por favor revisa los campos señalados en el formulario.', 'warning');
                return;
            }
        }

        const errorMsg = error.response?.data?.message || error.response?.data?.error?.message || 'No se pudo procesar la solicitud';
        Swal.fire('Error', errorMsg, 'error');
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

                // Tipo de tercero: reconstruir los flags activos para el selector.
                const partyTypes = [];
                if (item.is_customer == 1) partyTypes.push('is_customer');
                if (item.is_supplier == 1) partyTypes.push('is_supplier');
                if (item.is_employee == 1) partyTypes.push('is_employee');
                if (item.is_affiliate == 1) partyTypes.push('is_affiliate');
                if (item.is_driver == 1) partyTypes.push('is_driver');
                if (item.is_others == 1) partyTypes.push('is_others');
                formData.partyTypes = partyTypes;

                // Roles de acceso RBAC que vienen del perfil (p. ej. ADMIN_EMPRESA).
                formData.rbacRoles = Array.isArray(item.roles)
                    ? item.roles.filter(r => r && !r.startsWith('is_'))
                    : [];

                formData.is_active = (item.is_active == 1 || item.is_active === true || item.is_active === '1') ? '1' : '0';
                
                if (item.photo_url || item.logo_url) {
                    filePreviews.photo = item.photo_url || item.logo_url;
                }
            }
        } else {
            // Si es nuevo y venimos de una ruta específica, preseleccionar el tipo de tercero
            if (routeType.value !== 'all') {
                formData.partyTypes = [routeType.value];
            }
        }
    } catch (error) {
        toast('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
        setTimeout(async () => {
            isViewLoading.value = false;
            initSelect2(selectConfigs.value);
            setSelect2Values(selectConfigs.value);
            if (!isEditMode.value && routeType.value !== 'all' && formData.partyTypes.length === 0) {
                formData.partyTypes = [routeType.value];
            }
        }, 400);
    }
});

onUnmounted(() => {
    destroySelect2();
});
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
