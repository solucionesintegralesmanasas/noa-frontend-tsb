<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header border-bottom border-200 px-0">
                    <div class="d-flex align-items-center gap-2 px-x1 py-3">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Información General</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <!-- SKELETON FORM -->
                    <div v-if="isViewLoading" role="status">
                        <div class="row g-2 g-md-3">
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" v-for="i in 4" :key="i">
                                <div class="skeleton-text mb-2" style="height: 16px; width: 100px;"></div>
                                <div class="skeleton-input"></div>
                            </div>
                        </div>
                    </div>

                    <form v-else @submit.prevent="handleSubmit" class="row g-3" novalidate>

                        <template v-if="formFuec && $can('fuec.create')" key="step-vehicle">
                            <div class="col-12">
                                <div class="alert alert-info border-0 d-flex align-items-center mb-0">
                                    <i class="fad fa-info-circle fs-4 me-3"></i>
                                    <div>
                                        <h6 class="mb-1">Paso 1: Selección de Vehículo</h6>
                                        <p class="mb-0 small">Seleccione la placa del vehículo al cual desea vincular
                                            este contrato ocasional para continuar.</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="mb-3 position-relative select2-validation-wrapper col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Vehículo
                                    Asignado</label>
                                <div class="d-flex gap-2">
                                    <div class="flex-grow-1">
                                        <PrimeSelect v-model="formData.vehicle_uuid" :options="store.catalogs.vehicles"
                                            option-value="uuid" option-label="vehicle_license_plate"
                                            placeholder="Seleccionar vehículo" filter filterPlaceholder="Buscar por placa..."
                                            showClear class="w-full"
                                            :class="{ 'p-invalid': validationErrors.vehicle_uuid }" />
                                        <div v-if="validationErrors.vehicle_uuid" class="text-danger small mt-1">
                                            {{ validationErrors.vehicle_uuid }}
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-primary flex-shrink-0"
                                        title="Consultar y continuar" :disabled="!formData.vehicle_uuid || submitting"
                                        @click="consultarVehiculo" style="height: 38px;">
                                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isFetchingVehicle }"></i>
                                        <span class="ms-2 d-none d-sm-inline">Continuar</span>
                                    </button>
                                </div>
                            </div>
                        </template>

                        <template v-else key="step-form">
                            <!-- Campos ocultos -->
                            <div style="display: none;">
                                <input type="hidden" v-model="formData.vehicle_uuid" />
                                <input type="hidden" v-model="formData.verification_code" />
                                <input type="hidden" v-model="formData.number_fuec" />
                                <input type="hidden" v-model="formData.request_number" />
                                <input type="hidden" v-model="formData.contract_number_display" />
                                <input type="hidden" v-model="formData.company_uuid" />
                                <input type="hidden" v-model="formData.contractor.company_uuid" />
                            </div>

                            <div class="col-12">
                                <h6 class="text-muted fw-medium mb-0 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-building me-2"></i>Datos del Contratante
                                </h6>
                            </div>

                            <div class="position-relative select2-validation-wrapper col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Número de
                                    Documento</label>
                                <div class="input-group">
                                    <input type="text" autocomplete="off" class="form-control" :class="{
                                        'is-invalid': validationErrors['contractor.document_number'],
                                        'is-valid': formData.contractor.document_number && !validationErrors['contractor.document_number']
                                    }" v-model="formData.contractor.document_number" placeholder="Ej: 901234567-8"
                                        @input="validateField('contractor.document_number', formData.contractor.document_number, 'Obligatorio')"
                                        @blur="validateField('contractor.document_number', formData.contractor.document_number, 'Obligatorio')"
                                        @change="consultarContratista" />
                                    <button class="btn btn-outline-primary" type="button" @click="consultarContratista"
                                        title="Buscar Contratante">
                                        <i class="fad fa-search"></i>
                                    </button>
                                </div>
                                <div v-if="validationErrors['contractor.document_number']"
                                    class="invalid-feedback d-block mt-1">
                                    {{ validationErrors['contractor.document_number'] }}
                                </div>
                            </div>

                            <div class="position-relative col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Tipo de
                                    Documento</label>
                                <PrimeSelect v-model="formData.contractor.document_type_uuid"
                                    :options="store.catalogs.documentTypes" option-value="uuid"
                                    :option-label="(opt) => opt.name + ' - ' + opt.prefix"
                                    placeholder="Seleccionar tipo" class="w-full"
                                    :class="{ 'p-invalid': validationErrors['contractor.document_type_uuid'] }" />
                                <div v-if="validationErrors['contractor.document_type_uuid']"
                                    class="text-danger small mt-1">
                                    {{ validationErrors['contractor.document_type_uuid'] }}
                                </div>
                            </div>
                            <!-- Fila 2: Ciudad Contratante | Objeto del Contrato -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Ciudad
                                    Contratante</label>
                                <input type="text" autocomplete="off" placeholder="Ej: Bogotá D.C." class="form-control"
                                    v-model="formData.contractor.contracting_party_city"
                                    :class="{ 'is-invalid': validationErrors['contractor.contracting_party_city'], 'is-valid': formData.contractor.contracting_party_city }"
                                    @blur="validateField('contractor.contracting_party_city', formData.contractor.contracting_party_city, 'Obligatorio')" />
                                <div v-if="validationErrors['contractor.contracting_party_city']"
                                    class="invalid-feedback d-block">Obligatorio</div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Número de
                                    Contrato</label>
                                <input type="text" autocomplete="off" class="form-control bg-light" :class="{
                                    'is-invalid': validationErrors['contractor.contract_number'],
                                    'is-valid': formData.contractor.contract_number && !validationErrors['contractor.contract_number']
                                }" v-model="formData.contractor.contract_number" placeholder="Generado aut."
                                    @input="validateField('contractor.contract_number', formData.contractor.contract_number, 'Obligatorio')"
                                    @blur="validateField('contractor.contract_number', formData.contractor.contract_number, 'Obligatorio')"
                                    readonly="true" />
                                <div v-if="validationErrors['contractor.contract_number']"
                                    class="invalid-feedback d-block">
                                    {{ validationErrors['contractor.contract_number'] }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Razón Social
                                    / Nombre</label>
                                <input type="text" autocomplete="off"
                                    placeholder="Nombre o razón social del contratante" class="form-control"
                                    v-model="formData.contractor.company_name"
                                    :class="{ 'is-invalid': validationErrors['contractor.company_name'], 'is-valid': formData.contractor.company_name }"
                                    @blur="validateField('contractor.company_name', formData.contractor.company_name, 'Obligatorio')" />
                                <div v-if="validationErrors['contractor.company_name']"
                                    class="invalid-feedback d-block">
                                    Obligatorio
                                </div>
                            </div>

                            <div class="position-relative col-12 col-sm-6 col-md-4 col-lg-6">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Objeto del
                                    Contrato</label>
                                <PrimeSelect v-model="formData.object_contract_uuid"
                                    :options="store.catalogs.objectsContracts" option-value="uuid" option-label="name"
                                    placeholder="Seleccionar objeto" class="w-full"
                                    :class="{ 'p-invalid': validationErrors['object_contract_uuid'] }" />
                                <div v-if="validationErrors['object_contract_uuid']" class="text-danger small mt-1">
                                    Obligatorio</div>
                            </div>

                            <div class="col-12 pt-2">
                                <h6 class="text-muted fw-medium mb-0 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-user-tie me-2"></i>Información del Responsable
                                </h6>
                            </div>

                            <!-- Fila 3: Nombre | Documento | Teléfono | Dirección -->
                            <div class="mb-3 col-12 col-sm-6 col-md-4 col-lg-4">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Nombre y
                                    Apellidos</label>
                                <input type="text" autocomplete="off" placeholder="Nombre completo del responsable"
                                    class="form-control" :class="{
                                        'is-invalid': validationErrors['contractor.responsible_name'],
                                        'is-valid': formData.contractor.responsible_name && !validationErrors['contractor.responsible_name']
                                    }" v-model="formData.contractor.responsible_name"
                                    @input="validateField('contractor.responsible_name', formData.contractor.responsible_name, 'Obligatorio')"
                                    @blur="validateField('contractor.responsible_name', formData.contractor.responsible_name, 'Obligatorio')" />
                                <div v-if="validationErrors['contractor.responsible_name']"
                                    class="invalid-feedback d-block">
                                    {{ validationErrors['contractor.responsible_name'] }}
                                </div>
                            </div>

                            <div class="mb-3 col-12 col-sm-6 col-md-4 col-lg-2">
                                <label class="form-label required fw-medium"
                                    style="font-size: 0.9rem;">Documento</label>
                                <input type="text" autocomplete="off" placeholder="Ej: 123456789" class="form-control"
                                    :class="{
                                        'is-invalid': validationErrors['contractor.responsible_document'],
                                        'is-valid': formData.contractor.responsible_document && !validationErrors['contractor.responsible_document']
                                    }" v-model="formData.contractor.responsible_document"
                                    @input="validateField('contractor.responsible_document', formData.contractor.responsible_document, 'Obligatorio')"
                                    @blur="validateField('contractor.responsible_document', formData.contractor.responsible_document, 'Obligatorio')" />
                                <div v-if="validationErrors['contractor.responsible_document']"
                                    class="invalid-feedback d-block">
                                    {{ validationErrors['contractor.responsible_document'] }}
                                </div>
                            </div>

                            <div class="mb-3 col-12 col-sm-6 col-md-4 col-lg-2">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Teléfono</label>
                                <input type="text" autocomplete="off" placeholder="Ej: 3001234567" class="form-control"
                                    :class="{
                                        'is-invalid': validationErrors['contractor.responsible_phone'],
                                        'is-valid': formData.contractor.responsible_phone && !validationErrors['contractor.responsible_phone']
                                    }" v-model="formData.contractor.responsible_phone"
                                    @input="validateField('contractor.responsible_phone', formData.contractor.responsible_phone, 'Obligatorio')"
                                    @blur="validateField('contractor.responsible_phone', formData.contractor.responsible_phone, 'Obligatorio')" />
                                <div v-if="validationErrors['contractor.responsible_phone']"
                                    class="invalid-feedback d-block">
                                    {{ validationErrors['contractor.responsible_phone'] }}
                                </div>
                            </div>

                            <div class="mb-3 col-12 col-sm-6 col-md-4 col-lg-4">
                                <label class="form-label required fw-medium"
                                    style="font-size: 0.9rem;">Dirección</label>
                                <input type="text" autocomplete="off" placeholder="Ej: Cra 50 #10-20"
                                    class="form-control" :class="{
                                        'is-invalid': validationErrors['contractor.responsible_address'],
                                        'is-valid': formData.contractor.responsible_address && !validationErrors['contractor.responsible_address']
                                    }" v-model="formData.contractor.responsible_address"
                                    @input="validateField('contractor.responsible_address', formData.contractor.responsible_address, 'Obligatorio')"
                                    @blur="validateField('contractor.responsible_address', formData.contractor.responsible_address, 'Obligatorio')" />
                                <div v-if="validationErrors['contractor.responsible_address']"
                                    class="invalid-feedback d-block">
                                    {{ validationErrors['contractor.responsible_address'] }}
                                </div>
                            </div>

                            <!-- ─── Sección: Vigencia y Ruta ─── -->
                            <div class="col-12 pt-2">
                                <h6 class="text-muted fw-medium mb-0 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-map-marked-alt me-2"></i>Vigencia y Ruta
                                </h6>
                            </div>

                            <!-- Fila 4: F. Inicio | F. Vencimiento | Consecutivo FUEC | Ciudad Origen -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Fecha de
                                    Inicio</label>
                                <input type="date" class="form-control" placeholder="YYYY-MM-DD" :class="{
                                    'is-invalid': validationErrors['effective_date'],
                                    'is-valid': formData.effective_date && !validationErrors['effective_date']
                                }" v-model="formData.effective_date"
                                    @input="validateField('effective_date', formData.effective_date, 'Obligatorio')"
                                    @blur="validateField('effective_date', formData.effective_date, 'Obligatorio')" />
                                <div v-if="validationErrors['effective_date']" class="invalid-feedback d-block">
                                    {{ validationErrors['effective_date'] }}
                                </div>
                            </div>

                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Fecha de
                                    Vencimiento</label>
                                <input type="date" class="form-control" placeholder="YYYY-MM-DD" :class="{
                                    'is-invalid': validationErrors['expiration_date'],
                                    'is-valid': formData.expiration_date && !validationErrors['expiration_date']
                                }" v-model="formData.expiration_date" :max="vehiclePaymentLimit"
                                    @input="validateField('expiration_date', formData.expiration_date, 'Obligatorio')"
                                    @blur="validateField('expiration_date', formData.expiration_date, 'Obligatorio')" />
                                <div v-if="validationErrors['expiration_date']" class="invalid-feedback d-block">
                                    {{ validationErrors['expiration_date'] }}
                                </div>
                            </div>

                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label fw-medium" style="font-size: 0.9rem;">Consecutivo
                                    FUEC</label>
                                <span class="form-control bg-light d-flex align-items-center" style="height: 38px;">{{
                                    formData.number_fuec }}</span>
                            </div>


                            <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">
                                    Origen</label>
                                <input type="text" autocomplete="off" class="form-control" :class="{
                                    'is-invalid': validationErrors['origin'],
                                    'is-valid': formData.origin && !validationErrors['origin']
                                }" v-model="formData.origin" placeholder="Ej: Bogotá D.C."
                                    @input="validateField('origin', formData.origin, 'Obligatorio')"
                                    @blur="validateField('origin', formData.origin, 'Obligatorio')" />
                                <div v-if="validationErrors['origin']" class="invalid-feedback d-block">
                                    {{ validationErrors['origin'] }}
                                </div>
                            </div>

                            <!-- Ciudad Destino: en lg completa la segunda fila de Vigencia/Ruta -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">
                                    Destino</label>
                                <input type="text" autocomplete="off" class="form-control" :class="{
                                    'is-invalid': validationErrors['destination'],
                                    'is-valid': formData.destination && !validationErrors['destination']
                                }" v-model="formData.destination" placeholder="Ej: Medellín"
                                    @input="validateField('destination', formData.destination, 'Obligatorio')"
                                    @blur="validateField('destination', formData.destination, 'Obligatorio')" />
                                <div v-if="validationErrors['destination']" class="invalid-feedback d-block">
                                    {{ validationErrors['destination'] }}
                                </div>
                            </div>

                            <!-- ─── Sección: Conductores Asignados ─── -->
                            <div class="col-12 pt-2">
                                <h6 class="text-muted fw-medium mb-0 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-steering-wheel me-2"></i>Conductores Asignados
                                </h6>
                            </div>

                            <!-- Fila 5: Conductor Principal | Secundario | Terciario -->
                            <div class="position-relative col-12 col-sm-6 col-md-4 col-lg-4">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;">Conductor
                                    Principal</label>
                                <PrimeSelect v-model="formData.main_conductor_uuid" :options="store.catalogs.drivers"
                                    option-value="uuid" :option-label="(d) => d.first_name + ' ' + d.last_name"
                                    placeholder="Seleccionar conductor" class="w-full"
                                    :class="{ 'p-invalid': validationErrors['main_conductor_uuid'] }" />
                                <div v-if="validationErrors['main_conductor_uuid']" class="text-danger small mt-1">
                                    {{ validationErrors['main_conductor_uuid'] }}
                                </div>
                            </div>

                            <div class="position-relative col-12 col-sm-6 col-md-4 col-lg-4">
                                <label class="form-label fw-medium" style="font-size: 0.9rem;">Conductor
                                    Secundario</label>
                                <PrimeSelect v-model="formData.secondary_conductor_uuid"
                                    :options="store.catalogs.drivers" option-value="uuid"
                                    :option-label="(d) => d.first_name + ' ' + d.last_name"
                                    placeholder="Seleccionar conductor (Opcional)" class="w-full" />
                            </div>

                            <div class="position-relative col-12 col-sm-6 col-md-4 col-lg-4">
                                <label class="form-label fw-medium" style="font-size: 0.9rem;">Conductor
                                    Terciario</label>
                                <PrimeSelect v-model="formData.tertiary_conductor_uuid"
                                    :options="store.catalogs.drivers" option-value="uuid"
                                    :option-label="(d) => d.first_name + ' ' + d.last_name"
                                    placeholder="Seleccionar conductor (Opcional)" class="w-full" />
                            </div>

                            <!-- ─── Sección: Lista de Pasajeros ─── -->
                            <div class="col-12 pt-2">
                                <div class="d-flex justify-content-between align-items-center pb-2 border-bottom">
                                    <h6 class="text-muted fw-medium mb-0" style="font-size: 0.9rem;">
                                        <i class="fad fa-users me-2"></i>Lista de Pasajeros
                                    </h6>
                                    <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3"
                                        @click="openPassengerModal">
                                        <i class="fas fa-plus me-1"></i> Agregar
                                    </button>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="table-responsive" v-if="passengers.length > 0">
                                    <table class="table table-sm table-hover border align-middle">
                                        <thead class="table-light">
                                            <tr>
                                                <th class="text-secondary fw-medium">Tipo Doc.</th>
                                                <th class="text-secondary fw-medium">Número</th>
                                                <th class="text-secondary fw-medium">Nombre y Apellido</th>
                                                <th class="text-center text-secondary fw-medium" style="width: 80px;">
                                                    Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(passenger, index) in passengers" :key="index">
                                                <td>{{ getDocumentTypeName(passenger.type_of_document_uuid) }}</td>
                                                <td>{{ passenger.document_number }}</td>
                                                <td class="fw-medium">{{ passenger.first_and_last_name }}</td>
                                                <td class="text-center">
                                                    <button type="button" class="btn btn-link text-danger p-0"
                                                        title="Eliminar" @click="removePassenger(index)">
                                                        <i class="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div v-else class="text-center p-4 bg-light rounded border border-dashed">
                                    <i class="fad fa-user-slash fs-3 text-muted mb-2"></i>
                                    <p class="text-muted mb-0 small">No hay pasajeros registrados. Use el botón
                                        superior para agregar.</p>
                                </div>
                            </div>

                            <!-- Botones: siempre col-12 -->
                            <div class="col-12">
                                <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode"
                                    @cancel="goToList" />
                            </div>
                        </template>
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
                                <li>El FUEC es obligatorio para el transporte de carga terrestre y debe acompañar la
                                    mercancía durante todo el trayecto.</li>
                                <li>Los conductores registrados deben tener sus licencias y certificados vigentes al
                                    momento de la expedición.</li>
                                <li>La fecha de vencimiento no puede ser anterior a la fecha de inicio de vigencia del
                                    documento.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFuecStore } from '../store/fuec.store.js';
import { usePermissionsStore, useAuthStore } from '@store';
import { useSystemConfigurationStore } from '@/features/systemConfiguration/store/systemConfiguration.store.js';
import { useThirdPartiesStore } from '@/features/thirdParties/store/thirdParties.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import Swal from 'sweetalert2';
import { dateUtils } from '@utils/date.js';

const route = useRoute();
const router = useRouter();
const store = useFuecStore();
const permissionsStore = usePermissionsStore();
const systemConfigStore = useSystemConfigurationStore();
const thirdPartiesStore = useThirdPartiesStore();

const systemConfig = computed(() => systemConfigStore.config);

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
});

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Fuec' : 'Registrar Fuec');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [{ label: 'Fuec', to: '/extracto-de-contrato' }, { label: isEditMode.value ? 'Editar' : 'Nuevo' },]);

const isViewLoading = ref(true);
const isLoaded = ref(false);
const submitting = ref(false);
const validationErrors = reactive({});

const formFuec = ref(true);
const isFetchingVehicle = ref(false);
const vehiclePaymentLimit = ref('');

// Estado inicial del formulario
const formData = reactive({
    number_fuec: '',
    request_number: '',
    contract_number_display: '',
    verification_code: '',
    issue_date: '',
    effective_date: '',
    expiration_date: '',
    origin: '',
    destination: '',
    company_uuid: '',
    vehicle_uuid: '',
    object_contract_uuid: '',
    main_conductor_uuid: '',
    secondary_conductor_uuid: '',
    tertiary_conductor_uuid: '',
    status: 'ACTIVO',
    contractor: {
        company_uuid: '',
        document_type_uuid: '',
        document_number: '',
        company_name: '',
        address: '',
        telephone: '',
        contract_number: '',
        contracting_party_city: '',
        vehicle_uuid: '',
        responsible_name: '',
        responsible_document: '',
        responsible_phone: '',
        responsible_address: '',
        status: 1
    },
    passengers: []
});

const passengers = computed(() => formData.passengers);

const _escapeHtml = (str) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

const openPassengerModal = () => {
    const documentTypesOptions = store.catalogs.documentTypes?.map(opt =>
        `<option value="${_escapeHtml(opt.uuid)}">${_escapeHtml(opt.name)}</option>`
    ).join('') || '';

    Swal.fire({
        title: 'Agregar Pasajero',
        html: `
            <div style="text-align: left; font-family: inherit;">
                <div class="mb-3">
                    <label class="form-label required fw-medium" style="font-size: 0.9rem; display: block; margin-bottom: .5rem;">Tipo de Documento</label>
                    <select id="swal-passenger-doc-type" class="form-select w-100">
                        <option value="">Seleccionar tipo</option>
                        ${documentTypesOptions}
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label required fw-medium" style="font-size: 0.9rem; display: block; margin-bottom: .5rem;">Número de Documento</label>
                    <input type="text" autocomplete="off" id="swal-passenger-doc-num" class="form-control" placeholder="Ej: 12345678" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #ced4da; padding: 0.375rem 0.75rem;" />
                </div>
                <div class="mb-3">
                    <label class="form-label required fw-medium" style="font-size: 0.9rem; display: block; margin-bottom: .5rem;">Nombre y Apellido</label>
                    <input type="text" autocomplete="off" id="swal-passenger-name" class="form-control" placeholder="Ej: Juan Pérez" style="width: 100%; height: 38px; border-radius: 6px; border: 1px solid #ced4da; padding: 0.375rem 0.75rem;" />
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        buttonsStyling: true,
        customClass: {
            confirmButton: 'btn btn-primary px-4 rounded-pill',
            cancelButton: 'btn btn-outline-secondary px-4 rounded-pill ms-2'
        },
        preConfirm: () => {
            const type_of_document_uuid = document.getElementById('swal-passenger-doc-type').value;
            const document_number = document.getElementById('swal-passenger-doc-num').value.trim();
            const first_and_last_name = document.getElementById('swal-passenger-name').value.trim();

            if (!type_of_document_uuid || !document_number || !first_and_last_name) {
                Swal.showValidationMessage('Por favor complete todos los campos obligatorios');
                return false;
            }

            return { type_of_document_uuid, document_number, first_and_last_name };
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            formData.passengers.push(result.value);
            Toast.fire({
                title: 'Pasajero agregado',
                icon: 'success'
            });
        }
    });
};

const removePassenger = (index) => {
    Swal.fire({
        title: '¿Eliminar pasajero?',
        text: 'Esta acción removerá al pasajero de la lista.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn btn-danger px-4 rounded-pill',
            cancelButton: 'btn btn-outline-secondary px-4 rounded-pill ms-2'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            formData.passengers.splice(index, 1);
            Toast.fire({
                title: 'Pasajero eliminado',
                icon: 'success'
            });
        }
    });
};

const getDocumentTypeName = (uuid) => {
    const type = store.catalogs.documentTypes?.find(t => t.uuid === uuid);
    return type ? type.name : 'Desconocido';
};

const isDateExpired = (dateStr) => {
    if (!dateStr) return false;
    return dateUtils.dayjs(dateStr).isBefore(dateUtils.dayjs(), 'day');
};

const driverLicenseExpirations = reactive({
    main_conductor_uuid: null,
    secondary_conductor_uuid: null,
    tertiary_conductor_uuid: null
});

const validateDriverLicenseExpired = async (conductorUuid, fieldName) => {
    if (!conductorUuid) {
        return false;
    }

    try {
        const data = await store.getIsDriverLicenseExpired(conductorUuid);

        if (data && data.is_expired) {
            if (isLoaded.value) {
                formData[fieldName] = '';
                driverLicenseExpirations[fieldName] = null;

                await Swal.fire({
                    title: 'Licencia Inválida',
                    text: data.message || 'El conductor seleccionado tiene la licencia vencida y no puede ser asignado.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn btn-danger px-4 rounded-pill'
                    }
                });
            } else {
                driverLicenseExpirations[fieldName] = data.expiration_date || null;
            }
            return false;
        }

        if (data) {
            driverLicenseExpirations[fieldName] = data.expiration_date || null;
        }
        return true;
    } catch (e) {
        console.warn('Error validando licencia', e);
        return false;
    }
};

const validateDriverSocialSecurity = async (conductorUuid, fieldName) => {
    if (!conductorUuid) {
        return false;
    }

    const requireSS = systemConfig.value ? (systemConfig.value.fuec_require_social_security === true || systemConfig.value.fuec_require_social_security === 1) : false;
    if (!requireSS) {
        return true;
    }

    try {
        const contributions = await thirdPartiesStore.fetchSocialSecurityContributions(conductorUuid);

        const dateStr = formData.effective_date || formData.issue_date || dateUtils.dayjs().format('YYYY-MM-DD');
        const expectedPeriod = dateUtils.dayjs(dateStr).startOf('month').format('YYYY-MM-DD');

        const hasValidContribution = contributions.some(c => {
            if (!c.billing_period) return false;
            const periodPart = c.billing_period.toString().substring(0, 10);
            const status = (c.status || '');
            return periodPart === expectedPeriod && (
                status === 'PAGADO Y FINALIZADO' || status === 'PAGADO Y EN CURSO'
            );
        });

        if (!hasValidContribution) {
            if (isLoaded.value) {
                formData[fieldName] = '';

                const periodDisplay = dateUtils.dayjs(expectedPeriod).format('MM/YYYY');
                await Swal.fire({
                    title: 'Seguridad Social Pendiente',
                    text: `El conductor seleccionado no cuenta con aportes de seguridad social pagados para el periodo del viaje (${periodDisplay}).`,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn btn-danger px-4 rounded-pill'
                    }
                });
            }
            return false;
        }

        return true;
    } catch (e) {
        console.warn('Error validando seguridad social del conductor', e);
        return false;
    }
};

watch(() => formData.main_conductor_uuid, async (newVal) => {
    if (newVal) {
        const ok = await validateDriverLicenseExpired(newVal, 'main_conductor_uuid');
        if (ok) {
            await validateDriverSocialSecurity(newVal, 'main_conductor_uuid');
        }
    } else {
        driverLicenseExpirations.main_conductor_uuid = null;
    }
});

watch(() => formData.secondary_conductor_uuid, async (newVal) => {
    if (newVal) {
        const ok = await validateDriverLicenseExpired(newVal, 'secondary_conductor_uuid');
        if (ok) {
            await validateDriverSocialSecurity(newVal, 'secondary_conductor_uuid');
        }
    } else {
        driverLicenseExpirations.secondary_conductor_uuid = null;
    }
});

watch(() => formData.tertiary_conductor_uuid, async (newVal) => {
    if (newVal) {
        const ok = await validateDriverLicenseExpired(newVal, 'tertiary_conductor_uuid');
        if (ok) {
            await validateDriverSocialSecurity(newVal, 'tertiary_conductor_uuid');
        }
    } else {
        driverLicenseExpirations.tertiary_conductor_uuid = null;
    }
});

watch([
    () => formData.expiration_date,
    () => driverLicenseExpirations.main_conductor_uuid,
    () => driverLicenseExpirations.secondary_conductor_uuid,
    () => driverLicenseExpirations.tertiary_conductor_uuid,
    () => formData.main_conductor_uuid,
    () => formData.secondary_conductor_uuid,
    () => formData.tertiary_conductor_uuid
], () => {
    // Si ya hay un error de "Obligatorio", no lo sobreescribimos
    if (validationErrors.expiration_date === 'Obligatorio') return;

    // Limpiamos el error anterior de fecha de vencimiento de licencia si existe
    if (validationErrors.expiration_date && validationErrors.expiration_date.includes('licencia')) {
        delete validationErrors.expiration_date;
    }

    validateLicensesExpiryDate();
});

const consultarVehiculo = async () => {
    if (!formData.vehicle_uuid) return;
    isFetchingVehicle.value = true;
    try {
        const { vehicle, adminCharges } = await store.fetchVehicleValidationData(formData.vehicle_uuid);

        if (!vehicle) {
            await Swal.fire({
                title: 'Error',
                text: 'No se encontraron datos para el vehículo seleccionado.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                customClass: {
                    confirmButton: 'btn btn-danger px-4 rounded-pill'
                }
            });
            return;
        }

        const validationErrorsList = [];
        const today = dateUtils.dayjs().startOf('day');
        let agreementLimit = null;

        // 1. Validar Convenio de Colaboración Empresarial
        const agreements = vehicle.business_collaboration_agreements || vehicle.businessCollaborationAgreements || [];
        if (agreements.length > 0) {
            const validAgreement = agreements.find(agreement => {
                return !dateUtils.dayjs(agreement.expiry_date).isBefore(today, 'day');
            });

            if (!validAgreement) {
                validationErrorsList.push('El vehículo tiene convenios registrados pero ninguno está vigente. No puede generar FUEC.');
            } else {
                agreementLimit = dateUtils.dayjs(validAgreement.expiry_date).format('YYYY-MM-DD');
            }
        }

        // 2. Validar cobros de administración del afiliado
        let calculatedLimit = null;
        if (vehicle.exact_payment === 1 || vehicle.exact_payment === true) {
            // Si el vehículo está exento de pago (exact_payment == 1), usamos el límite del convenio si existe
            calculatedLimit = agreementLimit;
        } else {
            const charges = adminCharges || [];
            if (charges.length > 0) {
                // Filtrar solo los cargos pagados y ordenarlos por fecha de vencimiento (next_payment_date) descendente
                const paidCharges = charges
                    .filter(c => c.status === 'PAGADO')
                    .sort((a, b) => {
                        const dateA = dateUtils.dayjs(a.next_payment_date);
                        const dateB = dateUtils.dayjs(b.next_payment_date);
                        return dateB.diff(dateA);
                    });

                if (paidCharges.length === 0) {
                    validationErrorsList.push('El vehículo no tiene cuotas de administración pagadas. No puede generar FUEC hasta registrar el primer pago.');
                } else {
                    const lastPaidCharge = paidCharges[0];
                    const nextPaymentLimit = dateUtils.dayjs(lastPaidCharge.next_payment_date).startOf('day');

                    if (nextPaymentLimit.isBefore(today, 'day')) {
                        validationErrorsList.push(`El último pago registrado cubría hasta el ${nextPaymentLimit.format('DD/MM/YYYY')}. Debe estar al día para generar el FUEC.`);
                    } else {
                        const adminLimit = nextPaymentLimit.format('YYYY-MM-DD');
                        // Si hay límite de convenio y de administración, usamos el más próximo
                        if (agreementLimit) {
                            calculatedLimit = dateUtils.dayjs(adminLimit).isBefore(dateUtils.dayjs(agreementLimit)) ? adminLimit : agreementLimit;
                        } else {
                            calculatedLimit = adminLimit;
                        }
                    }
                }
            } else {
                // Si no hay cobros pero hay convenio, usamos el límite del convenio
                if (agreementLimit) {
                    calculatedLimit = agreementLimit;
                } else {
                    validationErrorsList.push('No se encontraron registros de administración para este vehículo.');
                }
            }
        }

        // 3. Validar SOAT
        const docs = vehicle.vehicle_documents || vehicle.vehicleDocuments || [];
        const soatDocs = docs.filter(d => d.document_type && d.document_type.toUpperCase().includes('SOAT'));

        if (soatDocs.length === 0) {
            validationErrorsList.push('El vehículo no tiene un SOAT registrado.');
        } else {
            const validSoat = soatDocs.find(d => {
                const isStatusValid = d.status !== 'NO VIGENTE' && d.status !== 'INACTIVA';
                if (!isStatusValid) return false;
                if (!d.expiry_date) return true;
                const expiry = d.expiry_date.toString().substring(0, 10);
                return !dateUtils.dayjs(expiry, 'YYYY-MM-DD').isBefore(today, 'day');
            });

            if (!validSoat) {
                const latest = soatDocs.sort((a, b) => {
                    const dateA = a.expiry_date ? dateUtils.dayjs(a.expiry_date.toString().substring(0, 10), 'YYYY-MM-DD') : dateUtils.dayjs(0);
                    const dateB = b.expiry_date ? dateUtils.dayjs(b.expiry_date.toString().substring(0, 10), 'YYYY-MM-DD') : dateUtils.dayjs(0);
                    return dateB.diff(dateA);
                })[0];

                if (latest && latest.expiry_date) {
                    const expiry = latest.expiry_date.toString().substring(0, 10);
                    validationErrorsList.push(`El SOAT del vehículo se encuentra vencido desde el ${dateUtils.dayjs(expiry, 'YYYY-MM-DD').format('DD/MM/YYYY')}.`);
                } else {
                    validationErrorsList.push('El vehículo debe tener un SOAT vigente para poder generar el FUEC.');
                }
            }
        }

        // 4. Validar RTM (Revisión Técnico-Mecánica) con periodo de gracia de 2 años
        const registrationDate = vehicle.registration_date ? dateUtils.dayjs(vehicle.registration_date.toString().substring(0, 10), 'YYYY-MM-DD').startOf('day') : null;

        let isRtmExempt = false;
        if (registrationDate) {
            const rtmRequiredDate = registrationDate.clone().add(2, 'year');
            isRtmExempt = today.isBefore(rtmRequiredDate, 'day');
        }

        const rtmDocs = docs.filter(d => d.document_type && (d.document_type.toUpperCase().includes('RTM') || d.document_type.toUpperCase().includes('TECNICO MECANICA') || d.document_type.toUpperCase().includes('TÉCNICO MECÁNICA')));

        if (!isRtmExempt) {

            if (rtmDocs.length === 0) {
                if (registrationDate) {
                    validationErrorsList.push(`El vehículo tiene más de 2 años desde su matrícula (${registrationDate.format('DD/MM/YYYY')}) y no tiene una RTM registrada.`);
                } else {
                    validationErrorsList.push('No se encontró fecha de matrícula ni RTM registrada para el vehículo.');
                }
            } else {
                const validRtm = rtmDocs.find(d => {
                    const isStatusValid = d.status !== 'NO VIGENTE' && d.status !== 'INACTIVA';
                    if (!isStatusValid) return false;
                    if (!d.expiry_date) return true;
                    const expiry = d.expiry_date.toString().substring(0, 10);
                    return !dateUtils.dayjs(expiry, 'YYYY-MM-DD').isBefore(today, 'day');
                });

                if (!validRtm) {
                    const latest = rtmDocs.sort((a, b) => {
                        const dateA = a.expiry_date ? dateUtils.dayjs(a.expiry_date.toString().substring(0, 10), 'YYYY-MM-DD') : dateUtils.dayjs(0);
                        const dateB = b.expiry_date ? dateUtils.dayjs(b.expiry_date.toString().substring(0, 10), 'YYYY-MM-DD') : dateUtils.dayjs(0);
                        return dateB.diff(dateA);
                    })[0];

                    if (latest && latest.expiry_date) {
                        const expiry = latest.expiry_date.toString().substring(0, 10);
                        validationErrorsList.push(`La RTM del vehículo se encuentra vencida desde el ${dateUtils.dayjs(expiry, 'YYYY-MM-DD').format('DD/MM/YYYY')}.`);
                    } else {
                        validationErrorsList.push('El vehículo requiere una RTM vigente para operar.');
                    }
                }
            }
        }

        // 5. Validar Tarjeta de Operación
        const opCards = vehicle.operation_cards || vehicle.operationCards || [];
        const activeCard = opCards.find(card => {
            if (!card.expiration_date) return false;
            const expiry = card.expiration_date.toString().substring(0, 10);
            return !dateUtils.dayjs(expiry, 'YYYY-MM-DD').isBefore(today, 'day');
        });

        if (!activeCard) {
            if (opCards.length > 0) {
                const latest = opCards.sort((a, b) => {
                    const dateA = a.expiration_date ? dateUtils.dayjs(a.expiration_date.toString().substring(0, 10), 'YYYY-MM-DD') : dateUtils.dayjs(0);
                    const dateB = b.expiration_date ? dateUtils.dayjs(b.expiration_date.toString().substring(0, 10), 'YYYY-MM-DD') : dateUtils.dayjs(0);
                    return dateB.diff(dateA);
                })[0];
                if (latest && latest.expiration_date) {
                    const expiry = latest.expiration_date.toString().substring(0, 10);
                    validationErrorsList.push(`La tarjeta de operación se encuentra vencida desde el ${dateUtils.dayjs(expiry, 'YYYY-MM-DD').format('DD/MM/YYYY')}.`);
                } else {
                    validationErrorsList.push('El vehículo no tiene una tarjeta de operación vigente. Debe registrar una para continuar.');
                }
            } else {
                validationErrorsList.push('El vehículo no tiene una tarjeta de operación registrada. Debe registrar una para continuar.');
            }
        }

        // 6. Validar Seguros (RCE y RCC)
        const validRce = docs.find(d => {
            if (!d.document_type || !d.document_type.toUpperCase().includes('RCE')) return false;
            if (d.status === 'NO VIGENTE' || d.status === 'INACTIVA') return false;
            if (!d.expiry_date) return true;
            const expiry = d.expiry_date.toString().substring(0, 10);
            return !dateUtils.dayjs(expiry, 'YYYY-MM-DD').isBefore(today, 'day');
        });
        const validRcc = docs.find(d => {
            if (!d.document_type || !d.document_type.toUpperCase().includes('RCC')) return false;
            if (d.status === 'NO VIGENTE' || d.status === 'INACTIVA') return false;
            if (!d.expiry_date) return true;
            const expiry = d.expiry_date.toString().substring(0, 10);
            return !dateUtils.dayjs(expiry, 'YYYY-MM-DD').isBefore(today, 'day');
        });

        if (!validRce || !validRcc) {
            validationErrorsList.push('El vehículo debe tener vigentes los seguros de Responsabilidad Civil (RCE y RCC).');
        }

        // Limitar expiration_date del FUEC según vencimientos de documentos VIGENTES del vehículo
        const isDocValid = (d) => d.status !== 'NO VIGENTE' && d.status !== 'INACTIVA';
        const docLimits = [];
        // SOAT vigente más próximo a vencer
        const validSoatDocs = soatDocs.filter(d => d.expiry_date && isDocValid(d));
        if (validSoatDocs.length > 0) {
            const soatExpiries = validSoatDocs.map(d => d.expiry_date.toString().substring(0, 10)).sort();
            docLimits.push(soatExpiries[0]);
        }
        // RTM vigente más próxima a vencer
        if (!isRtmExempt) {
            const validRtmDocs = rtmDocs.filter(d => d.expiry_date && isDocValid(d));
            if (validRtmDocs.length > 0) {
                const rtmExpiries = validRtmDocs.map(d => d.expiry_date.toString().substring(0, 10)).sort();
                docLimits.push(rtmExpiries[0]);
            }
        }
        // Pólizas RCE y RCC vigentes más próximas a vencer
        if (validRce && validRce.expiry_date && isDocValid(validRce)) {
            docLimits.push(validRce.expiry_date.toString().substring(0, 10));
        }
        if (validRcc && validRcc.expiry_date && isDocValid(validRcc)) {
            docLimits.push(validRcc.expiry_date.toString().substring(0, 10));
        }

        // Calcular límite final: el mínimo entre admin/convenio y los documentos
        if (docLimits.length > 0) {
            docLimits.sort();
            const earliestDocLimit = docLimits[0];
            if (calculatedLimit) {
                calculatedLimit = dateUtils.dayjs(calculatedLimit).isBefore(dateUtils.dayjs(earliestDocLimit))
                    ? calculatedLimit : earliestDocLimit;
            } else {
                calculatedLimit = earliestDocLimit;
            }
        }

        // 7. Validar Inspección Preoperacional Diaria para hoy (si está configurada como obligatoria)
        const requireInspections = systemConfig.value ? (systemConfig.value.fuec_require_daily_inspections === true || systemConfig.value.fuec_require_daily_inspections === 1) : false;
        if (requireInspections) {
            const inspections = vehicle.vehicle_inspections || vehicle.vehicleInspections || [];
            const todayStr = today.format('YYYY-MM-DD');
            const hasTodayInspection = inspections.some(insp => {
                if (!insp.inspection_date) return false;
                // Extraer los primeros 10 caracteres (YYYY-MM-DD) para evitar desfases de zona horaria
                const datePart = insp.inspection_date.toString().substring(0, 10);
                return datePart === todayStr;
            });

            if (!hasTodayInspection) {
                validationErrorsList.push('No se puede crear el FUEC: el vehículo seleccionado no cuenta con una inspección preoperacional registrada para el día de hoy.');
            }
        }

        if (validationErrorsList.length > 0) {
            formData.vehicle_uuid = '';
            vehiclePaymentLimit.value = null;

            await Swal.fire({
                title: 'Vehículo no Apto',
                html: `
                    <div style="text-align: left; font-family: inherit; font-size: 0.95rem;">
                        <p>No se puede proceder debido a las siguientes inconsistencias en el vehículo:</p>
                        <ul style="padding-left: 20px; margin-top: 10px; margin-bottom: 15px;">
                            ${validationErrorsList.map(err => `<li style="margin-bottom: 8px; color: #dc3545;">${_escapeHtml(err)}</li>`).join('')}
                        </ul>
                        <p style="font-weight: 500;">Por favor solucione estos pendientes antes de generar la planilla FUEC.</p>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                customClass: {
                    confirmButton: 'btn btn-danger px-4 rounded-pill'
                }
            });
            return;
        }

        // El límite máximo del FUEC está regulado estrictamente por el pago de administración (next_payment_date) y convenio de colaboración
        vehiclePaymentLimit.value = calculatedLimit;

        // Procedemos con el paso 2
        formData.contractor.vehicle_uuid = formData.vehicle_uuid;
        formData.contractor.company_uuid = formData.company_uuid;

        // Limpiamos los datos del contratista para que siempre inicien vacíos
        Object.assign(formData.contractor, {
            uuid: '',
            company_uuid: formData.company_uuid,
            document_type_uuid: '',
            document_number: '',
            company_name: '',
            address: '',
            telephone: '',
            contracting_party_city: '',
            vehicle_uuid: formData.vehicle_uuid,
            responsible_name: '',
            responsible_document: '',
            responsible_phone: '',
            responsible_address: '',
            status: 1
        });

        // Si hay un consecutivo de contrato disponible, lo precargamos
        if (store.catalogs.nextContractNumber) {
            const formatted = store.catalogs.nextContractNumber.formatted || '';
            formData.contractor.contract_number = formatted;
            formData.contract_number_display = formatted;
        } else {
            formData.contractor.contract_number = '';
            formData.contract_number_display = '';
        }

        // Autoseleccionar conductor principal si el afiliado/propietario del vehículo es conductor
        const affiliateUuid = vehicle.third_party_uuid || vehicle.third_party?.uuid || vehicle.thirdParty?.uuid;
        if (affiliateUuid && store.catalogs.drivers) {
            const driverInCatalog = store.catalogs.drivers.find(d => d.uuid === affiliateUuid);
            if (driverInCatalog) {
                formData.main_conductor_uuid = driverInCatalog.uuid;
                Toast.fire({
                    title: 'Conductor propietario seleccionado automáticamente',
                    icon: 'info'
                });
            }
        }

        // Pasamos al paso 2
        formFuec.value = false;
    } catch (error) {
        console.error('Error al consultar vehículo:', error);
        await Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al validar la información del vehículo.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            customClass: {
                confirmButton: 'btn btn-danger px-4 rounded-pill'
            }
        });
    } finally {
        isFetchingVehicle.value = false;
    }
};


const consultarContratista = async () => {
    const docNumber = formData.contractor.document_number;
    if (!docNumber) return;

    isViewLoading.value = true;
    try {
        const contractors = await store.searchContractors(docNumber);
        const found = contractors.find(c => c.document_number === docNumber);

        if (found) {
            // Encontró un contratante existente!
            Object.assign(formData.contractor, {
                uuid: found.uuid,
                company_uuid: found.company_uuid,
                document_type_uuid: found.document_type_uuid,
                document_number: found.document_number,
                company_name: found.company_name,
                address: found.address,
                telephone: found.telephone,
                contract_number: found.contract_number,
                contracting_party_city: found.contracting_party_city,
                vehicle_uuid: found.vehicle_uuid || formData.vehicle_uuid,
                responsible_name: found.responsible_name,
                responsible_document: found.responsible_document,
                responsible_phone: found.responsible_phone,
                responsible_address: found.responsible_address,
                status: found.status ? 1 : 0
            });
            formData.contract_number_display = found.contract_number;

            Toast.fire({
                title: `Datos de ${found.company_name} cargados`,
                icon: 'success'
            });

        } else {
            Toast.fire({
                title: 'Contratante no registrado, ingrese los datos manualmente',
                icon: 'info'
            });
        }
    } catch (error) {
        console.error('Error al consultar contratista:', error);
    } finally {
        isViewLoading.value = false;
    }
};

const validateField = (field, value, msg) => {
    if (!value) {
        validationErrors[field] = msg;
    } else {
        delete validationErrors[field];
        if (field === 'expiration_date') {
            validateLicensesExpiryDate();
        }
    }
};



const validateLicensesExpiryDate = () => {
    if (!formData.expiration_date) return true;

    const fuecExpiryDate = dateUtils.dayjs(formData.expiration_date).format('YYYY-MM-DD');

    if (vehiclePaymentLimit.value) {
        const vehicleLimitDate = dateUtils.dayjs(vehiclePaymentLimit.value).format('YYYY-MM-DD');
        if (dateUtils.dayjs(fuecExpiryDate).isAfter(dateUtils.dayjs(vehicleLimitDate), 'day')) {
            validationErrors.expiration_date = `La fecha de vencimiento del FUEC no puede superar el límite del vehículo (${dateUtils.format(vehiclePaymentLimit.value, 'DD/MM/YYYY')})`;
            return false;
        }
    }

    if (formData.main_conductor_uuid && driverLicenseExpirations.main_conductor_uuid) {
        const mainConductorExpiryDate = dateUtils.dayjs(driverLicenseExpirations.main_conductor_uuid).format('YYYY-MM-DD');
        if (dateUtils.dayjs(fuecExpiryDate).isAfter(dateUtils.dayjs(mainConductorExpiryDate), 'day')) {
            validationErrors.expiration_date = `La fecha de vencimiento del FUEC no puede superar el vencimiento de la licencia del conductor principal (${dateUtils.format(driverLicenseExpirations.main_conductor_uuid, 'DD/MM/YYYY')})`;
            return false;
        }
    }

    if (formData.secondary_conductor_uuid && driverLicenseExpirations.secondary_conductor_uuid) {
        const secondaryConductorExpiryDate = dateUtils.dayjs(driverLicenseExpirations.secondary_conductor_uuid).format('YYYY-MM-DD');
        if (dateUtils.dayjs(fuecExpiryDate).isAfter(dateUtils.dayjs(secondaryConductorExpiryDate), 'day')) {
            validationErrors.expiration_date = `La fecha de vencimiento del FUEC no puede superar el vencimiento de la licencia del conductor secundario (${dateUtils.format(driverLicenseExpirations.secondary_conductor_uuid, 'DD/MM/YYYY')})`;
            return false;
        }
    }

    if (formData.tertiary_conductor_uuid && driverLicenseExpirations.tertiary_conductor_uuid) {
        const tertiaryConductorExpiryDate = dateUtils.dayjs(driverLicenseExpirations.tertiary_conductor_uuid).format('YYYY-MM-DD');
        if (dateUtils.dayjs(fuecExpiryDate).isAfter(dateUtils.dayjs(tertiaryConductorExpiryDate), 'day')) {
            validationErrors.expiration_date = `La fecha de vencimiento del FUEC no puede superar el vencimiento de la licencia del conductor terciario (${dateUtils.format(driverLicenseExpirations.tertiary_conductor_uuid, 'DD/MM/YYYY')})`;
            return false;
        }
    }

    return true;
};

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    // Autocompletar la fecha de expedición si está vacía
    if (!formData.issue_date) {
        formData.issue_date = new Date().toISOString().split('T')[0];
    }

    // Sincronizar teléfono y dirección del contratista con los del responsable
    if (formData.contractor.responsible_address) {
        formData.contractor.address = formData.contractor.responsible_address;
    }
    if (formData.contractor.responsible_phone) {
        formData.contractor.telephone = formData.contractor.responsible_phone;
    }

    if (!formData.effective_date) validationErrors.effective_date = 'Obligatorio';
    if (!formData.expiration_date) validationErrors.expiration_date = 'Obligatorio';
    if (!formData.origin) validationErrors.origin = 'Obligatorio';
    if (!formData.destination) validationErrors.destination = 'Obligatorio';
    if (!formData.vehicle_uuid) validationErrors.vehicle_uuid = 'Obligatorio';
    if (!formData.object_contract_uuid) validationErrors.object_contract_uuid = 'Obligatorio';
    if (!formData.main_conductor_uuid) validationErrors.main_conductor_uuid = 'Obligatorio';

    // Contratista Validations
    if (!formData.contractor.document_type_uuid) validationErrors['contractor.document_type_uuid'] = 'Obligatorio';
    if (!formData.contractor.document_number) validationErrors['contractor.document_number'] = 'Obligatorio';
    if (!formData.contractor.company_name) validationErrors['contractor.company_name'] = 'Obligatorio';
    if (!formData.contractor.contract_number) validationErrors['contractor.contract_number'] = 'Obligatorio';
    if (!formData.contractor.contracting_party_city) validationErrors['contractor.contracting_party_city'] = 'Obligatorio';
    if (!formData.contractor.responsible_name) validationErrors['contractor.responsible_name'] = 'Obligatorio';
    if (!formData.contractor.responsible_document) validationErrors['contractor.responsible_document'] = 'Obligatorio';
    if (!formData.contractor.responsible_phone) validationErrors['contractor.responsible_phone'] = 'Obligatorio';
    if (!formData.contractor.responsible_address) validationErrors['contractor.responsible_address'] = 'Obligatorio';

    // Passengers Validations
    formData.passengers.forEach((p, i) => {
        if (!p.type_of_document_uuid) validationErrors['passenger_' + i + '_type'] = 'Requerido';
        if (!p.document_number) validationErrors['passenger_' + i + '_doc'] = 'Requerido';
        if (!p.first_and_last_name) validationErrors['passenger_' + i + '_name'] = 'Requerido';
    });

    // Validar que la fecha de vencimiento del FUEC no supere la de las licencias
    validateLicensesExpiryDate();

    return Object.keys(validationErrors).length === 0;
};

const generateVerificationCode = async (fuecData) => {
    try {
        const entityId = fuecData?.uuid || crypto.randomUUID?.() || Date.now().toString();
        // Base única con UUID, número FUEC, timestamp y random
        const timestamp = Date.now();
        const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase();
        const base = `${entityId}|${fuecData?.number_fuec || ''}|${timestamp}|${random}|${import.meta.env.VUE_APP_VERIFICATION_SALT || 'default-salt'}`;

        // Generar hash SHA-256
        const encoder = new TextEncoder();
        const data = encoder.encode(base);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        // Convertir hash a hexadecimal
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Retornar los primeros 16 caracteres en mayúsculas
        return hashHex.substring(0, 16).toUpperCase();
    } catch (e) {
        // Fallback seguro
        const fallbackId = fuecData?.uuid || Date.now().toString(36);
        return fallbackId.replace(/-/g, '').substring(0, 12).toUpperCase();
    }
};


const goBack = () => router.push('/extracto-de-contrato');
const goToList = goBack;

const handleSubmit = async () => {
    if (!validateForm()) {
        const firstError = document.querySelector('.is-invalid, .is-invalid-select2, .text-danger');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return Swal.fire({
            title: 'Atención',
            text: 'Revisa los campos obligatorios',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            customClass: {
                confirmButton: 'btn btn-warning px-4 rounded-pill'
            }
        });
    }

    // Validar seguridad social de los conductores antes de enviar si es requerido
    const requireSS = systemConfig.value ? (systemConfig.value.fuec_require_social_security === true || systemConfig.value.fuec_require_social_security === 1) : false;
    if (requireSS) {
        if (formData.main_conductor_uuid) {
            const ok = await validateDriverSocialSecurity(formData.main_conductor_uuid, 'main_conductor_uuid');
            if (!ok) return;
        }
        if (formData.secondary_conductor_uuid) {
            const ok = await validateDriverSocialSecurity(formData.secondary_conductor_uuid, 'secondary_conductor_uuid');
            if (!ok) return;
        }
        if (formData.tertiary_conductor_uuid) {
            const ok = await validateDriverSocialSecurity(formData.tertiary_conductor_uuid, 'tertiary_conductor_uuid');
            if (!ok) return;
        }
    }

    try {
        submitting.value = true;
        let uuid = isEditMode.value ? route.params.id : null;

        const payload = {
            number_fuec: formData.number_fuec,
            request_number: formData.request_number,
            contract_number_display: formData.contract_number_display,
            verification_code: formData.verification_code,
            issue_date: formData.issue_date,
            effective_date: formData.effective_date,
            expiration_date: formData.expiration_date,
            origin_route: formData.origin,
            destination_route: formData.destination,
            company_uuid: formData.company_uuid,
            vehicle_uuid: formData.vehicle_uuid,
            object_contract_uuid: formData.object_contract_uuid,
            main_conductor_uuid: formData.main_conductor_uuid,
            secondary_conductor_uuid: formData.secondary_conductor_uuid || null,
            tertiary_conductor_uuid: formData.tertiary_conductor_uuid || null,
            status: formData.status,
            contractor: {
                uuid: formData.contractor.uuid || null,
                document_type_uuid: formData.contractor.document_type_uuid,
                document_number: formData.contractor.document_number,
                company_name: formData.contractor.company_name,
                address: formData.contractor.address,
                telephone: formData.contractor.telephone,
                contract_number: formData.contractor.contract_number,
                contracting_party_city: formData.contractor.contracting_party_city,
                vehicle_uuid: formData.contractor.vehicle_uuid || formData.vehicle_uuid,
                responsible_name: formData.contractor.responsible_name,
                responsible_document: formData.contractor.responsible_document,
                responsible_phone: formData.contractor.responsible_phone,
                responsible_address: formData.contractor.responsible_address,
                status: formData.contractor.status
            },
            passengers: formData.passengers
        };

        if (isEditMode.value) {
            await store.updateItem(uuid, payload);
        } else {
            const newItem = await store.createItem(payload);
            uuid = newItem?.uuid || newItem?.id;
        }

        if (uuid) {
            Swal.fire({
                title: 'Generando PDF...',
                text: 'Por favor espere mientras el servidor prepara el documento.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await store.downloadPdf(uuid);

                Swal.close();
                await Swal.fire({
                    icon: 'success',
                    title: '¡Guardado con éxito!',
                    text: 'El FUEC ha sido guardado y el PDF se ha abierto en el navegador.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (pdfError) {
                console.error(pdfError);
                Swal.close();
                await Swal.fire({
                    icon: 'warning',
                    title: 'Guardado',
                    text: 'El FUEC se guardó, pero hubo un error al abrir el PDF desde el servidor.',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn btn-warning px-4 rounded-pill'
                    }
                });
            }
        }

        goBack();
    } catch (error) {
        console.error(error);
        const errMsg = error.response?.data?.message || 'No se pudo procesar la solicitud';
        Swal.fire({
            title: 'Error',
            text: errMsg,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            customClass: {
                confirmButton: 'btn btn-danger px-4 rounded-pill'
            }
        });
    } finally {
        submitting.value = false;
    }
};

watch(
    () => [formData.company_uuid, formData.contractor.uuid, formData.contractor.contract_number],
    async ([companyUuid, contractorUuid, contractNumber]) => {
        if (isEditMode.value) return;

        if (!companyUuid) {
            formData.number_fuec = '';
            formData.request_number = '';
            formData.verification_code = '';
            return;
        }
        try {
            const previewNum = await store.getPreviewFuecNumber(
                companyUuid,
                contractorUuid || null,
                contractNumber || null
            );
            formData.request_number = previewNum;
            formData.number_fuec = previewNum && previewNum.length >= 4 ? previewNum.slice(-4) : previewNum;
            if (previewNum) {
                formData.verification_code = await generateVerificationCode({ uuid: null, request_number: previewNum });
            } else {
                formData.verification_code = '';
            }
        } catch (error) {
            console.error('Error fetching preview FUEC number:', error);
            formData.number_fuec = '';
            formData.request_number = '';
            formData.verification_code = '';
        }
    },
    { immediate: true }
);

onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.loadFormOptions();
        if (isEditMode.value) {
            const item = await store.fetchProfileById(route.params.id);
            if (item) {
                Object.assign(formData, item);
                if (item.origin_route) formData.origin = item.origin_route;
                if (item.destination_route) formData.destination = item.destination_route;
                if (item.contractor) {
                    Object.assign(formData.contractor, item.contractor);
                }
                if (item.passengers && Array.isArray(item.passengers)) {
                    formData.passengers = item.passengers.map(p => ({ ...p }));
                }
                if (!formData.verification_code && item.uuid) {
                    formData.verification_code = await generateVerificationCode(item);
                }
                formFuec.value = false; // Ya no mostramos paso 1
            }
        } else {
            const authStore = useAuthStore();
            let companyUuid = authStore.currentTenant?.id;
            if (!companyUuid && store.catalogs.companies && store.catalogs.companies.length > 0) {
                companyUuid = store.catalogs.companies[0].uuid;
            }
            formData.company_uuid = companyUuid || '';
            formData.contractor.company_uuid = companyUuid || '';

            if (store.catalogs.nextContractNumber) {
                const formatted = store.catalogs.nextContractNumber.formatted || '';
                formData.contractor.contract_number = formatted;
                formData.contract_number_display = formatted;
            }

            // Si el catálogo de vehículos tiene un solo vehículo disponible (ej: afiliado/conductor), auto-seleccionarlo
            if (!formData.vehicle_uuid && store.catalogs.vehicles && store.catalogs.vehicles.length === 1) {
                formData.vehicle_uuid = store.catalogs.vehicles[0].uuid;
            }
        }

        // Cargar configuración de sistema para la empresa activa
        if (formData.company_uuid) {
            try {
                await systemConfigStore.fetchByCompany(formData.company_uuid);
            } catch (err) {
                console.warn('No se pudo cargar la configuración de sistema para la validación local.', err);
            }
        }

        console.log('Valor del campo "Consecutivo FUEC" (number_fuec):', formData.number_fuec);
    } finally {
        setTimeout(() => {
            isViewLoading.value = false;
            isLoaded.value = true;
        }, 400);
    }
});
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