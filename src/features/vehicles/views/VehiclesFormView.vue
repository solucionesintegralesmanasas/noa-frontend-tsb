<template>
    <div class="row g-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <WizardProgress
                v-if="!isEditMode"
                current="vehiculo"
                :show-skip="false"
                :show-finish="false"
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

                <div class="card-body p-3 p-md-4">
                    <form @submit.prevent="handleSubmit" class="row g-3" novalidate>
                        <!-- Empresa / Hidden context -->
                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />

                        <!-- Placa del Vehículo -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Placa del
                                Vehículo</label>
                            <input type="text" autocomplete="off"
                                class="form-control text-uppercase fw-bold text-primary" :class="{
                                    'is-invalid': validationErrors.vehicle_license_plate,
                                    'is-valid': formData.vehicle_license_plate && !validationErrors.vehicle_license_plate
                                }" v-model="formData.vehicle_license_plate" placeholder="Ej: ABC123" maxlength="10"
                                @input="formData.vehicle_license_plate = $event.target.value.toUpperCase(); validateField('vehicle_license_plate', formData.vehicle_license_plate, 'La placa es obligatoria')"
                                @blur="validateField('vehicle_license_plate', formData.vehicle_license_plate, 'La placa es obligatoria')" />
                            <div v-if="validationErrors.vehicle_license_plate" class="invalid-feedback d-block">
                                {{ validationErrors.vehicle_license_plate }}
                            </div>
                        </div>

                        <!-- Licencia de Tránsito -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Licencia de
                                Tránsito</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.transit_license_number,
                                'is-valid': formData.transit_license_number && !validationErrors.transit_license_number
                            }" v-model="formData.transit_license_number" placeholder="Ej: TR-2026-001"
                                @input="validateField('transit_license_number', formData.transit_license_number, 'La licencia es obligatoria')"
                                @blur="validateField('transit_license_number', formData.transit_license_number, 'La licencia es obligatoria')" />
                            <div v-if="validationErrors.transit_license_number" class="invalid-feedback d-block">
                                {{ validationErrors.transit_license_number }}
                            </div>
                        </div>

                        <!-- Clase de Vehículo -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Clase de
                                Vehículo</label>
                            <select id="vehicle_class_uuid" ref="vehicleClassSelect" v-model="formData.vehicle_class_uuid"
                                class="form-control select2-input w-100">
                                <option value="">Seleccionar clase</option>
                                <option v-for="opt in store.catalogs.vehicleClasses" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.description }}
                                </option>
                            </select>
                            <div v-if="validationErrors.vehicle_class_uuid" class="invalid-feedback d-block">
                                <i class="fad fa-exclamation-circle me-1"></i>{{ validationErrors.vehicle_class_uuid }}
                            </div>
                        </div>

                        <!-- Modalidad de Servicio -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required" for="type_of_service">Modalidad de Servicio</label>
                            <select id="type_of_service" ref="typeOfServiceSelect" v-model="formData.type_of_service"
                                class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option value="PUBLICO">Público</option>
                                <option value="PARTICULAR">Particular</option>
                            </select>
                            <div v-if="validationErrors.type_of_service" class="invalid-feedback d-block">
                                {{ validationErrors.type_of_service }}
                            </div>
                        </div>

                        <!-- SECCIÓN: MARCA Y MODELO -->
                        <div class="col-12 mt-4">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-industry me-2"></i>Información general del vehículo
                            </h6>
                        </div>

                        <!-- Marca -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Marca</label>
                            <select id="brand_uuid" ref="brandSelect" v-model="formData.brand_uuid"
                                class="form-control select2-input w-100">
                                <option value="">Seleccionar marca</option>
                                <option v-for="opt in store.catalogs.brands" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.description }}
                                </option>
                            </select>
                            <div v-if="validationErrors.brand_uuid" class="invalid-feedback d-block">
                                <i class="fad fa-exclamation-circle me-1"></i>{{ validationErrors.brand_uuid }}
                            </div>
                        </div>

                        <!-- Línea -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Línea</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.line,
                                'is-valid': formData.line && !validationErrors.line
                            }" v-model="formData.line" placeholder="Ej: Hilux, D-Max"
                                @input="validateField('line', formData.line, 'La línea es obligatoria')"
                                @blur="validateField('line', formData.line, 'La línea es obligatoria')" />
                            <div v-if="validationErrors.line" class="invalid-feedback d-block">
                                {{ validationErrors.line }}
                            </div>
                        </div>

                        <!-- Modelo -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Modelo</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.model,
                                'is-valid': formData.model && !validationErrors.model
                            }" v-model="formData.model" placeholder="Ej: 2025"
                                @input="validateField('model', formData.model, 'El modelo es obligatorio')"
                                @blur="validateField('model', formData.model, 'El modelo es obligatorio')" />
                            <div v-if="validationErrors.model" class="invalid-feedback d-block">
                                {{ validationErrors.model }}
                            </div>
                        </div>

                        <!-- Color -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Color</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.color,
                                'is-valid': formData.color && !validationErrors.color
                            }" v-model="formData.color" placeholder="Ej: Blanco"
                                @input="validateField('color', formData.color, 'El color es obligatorio')"
                                @blur="validateField('color', formData.color, 'El color es obligatorio')" />
                            <div v-if="validationErrors.color" class="invalid-feedback d-block">
                                {{ validationErrors.color }}
                            </div>
                        </div>

                        <!-- Número de Serie -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;">Número de Serie</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.serial_number
                            }" v-model="formData.serial_number" placeholder="SER123456" />
                            <div v-if="validationErrors.serial_number" class="invalid-feedback d-block">
                                {{ validationErrors.serial_number }}
                            </div>
                        </div>

                        <!-- Número de Motor -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Número de
                                Motor</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.engine_number,
                                'is-valid': formData.engine_number && !validationErrors.engine_number
                            }" v-model="formData.engine_number" placeholder="ENG9876"
                                @input="validateField('engine_number', formData.engine_number, 'El número de motor es obligatorio')"
                                @blur="validateField('engine_number', formData.engine_number, 'El número de motor es obligatorio')" />
                            <div v-if="validationErrors.engine_number" class="invalid-feedback d-block">
                                {{ validationErrors.engine_number }}
                            </div>
                        </div>

                        <!-- Número de Chasis -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Número de
                                Chasis</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.chassis_number,
                                'is-valid': formData.chassis_number && !validationErrors.chassis_number
                            }" v-model="formData.chassis_number" placeholder="CHS123"
                                @input="validateField('chassis_number', formData.chassis_number, 'El chasis es obligatorio')"
                                @blur="validateField('chassis_number', formData.chassis_number, 'El chasis es obligatorio')" />
                            <div v-if="validationErrors.chassis_number" class="invalid-feedback d-block">
                                {{ validationErrors.chassis_number }}
                            </div>
                        </div>

                        <!-- Número VIN -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;">Número VIN</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.vin_number
                            }" v-model="formData.vin_number" placeholder="VIN123456" />
                            <div v-if="validationErrors.vin_number" class="invalid-feedback d-block">
                                {{ validationErrors.vin_number }}
                            </div>
                        </div>

                        <!-- Cilindraje -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Cilindraje</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.engine_displacement,
                                'is-valid': formData.engine_displacement && !validationErrors.engine_displacement
                            }" v-model="formData.engine_displacement" placeholder="Ej: 2400"
                                @input="validateField('engine_displacement', formData.engine_displacement, 'El cilindraje es obligatorio')"
                                @blur="validateField('engine_displacement', formData.engine_displacement, 'El cilindraje es obligatorio')" />
                            <div v-if="validationErrors.engine_displacement" class="invalid-feedback d-block">
                                {{ validationErrors.engine_displacement }}
                            </div>
                        </div>

                        <!-- Tipo de Carrocería -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Tipo de
                                Carrocería</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.body_type,
                                'is-valid': formData.body_type && !validationErrors.body_type
                            }" v-model="formData.body_type" placeholder="Ej: Sedán"
                                @input="validateField('body_type', formData.body_type, 'La carrocería es obligatoria')"
                                @blur="validateField('body_type', formData.body_type, 'La carrocería es obligatoria')" />
                            <div v-if="validationErrors.body_type" class="invalid-feedback d-block">
                                {{ validationErrors.body_type }}
                            </div>
                        </div>

                        <!-- Tipo de Combustible -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Tipo de
                                Combustible</label>
                            <select id="fuel_type" ref="fuelTypeSelect" v-model="formData.fuel_type"
                                class="form-control select2-input w-100">
                                <option value="">Seleccionar combustible</option>
                                <option value="GASOLINA">Gasolina</option>
                                <option value="DIESEL">Diésel</option>
                                <option value="GNV">GNV (Gas Natural Vehicular)</option>
                                <option value="GAS">Gas</option>
                                <option value="HIBRIDO">Híbrido</option>
                                <option value="ELECTRICO">Eléctrico</option>
                                <option value="OTRO">Otro</option>
                            </select>
                            <div v-if="validationErrors.fuel_type" class="invalid-feedback d-block">
                                <i class="fad fa-exclamation-circle me-1"></i>{{ validationErrors.fuel_type }}
                            </div>
                        </div>

                        <!-- Número de Puertas -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;">Número de Puertas</label>
                            <input type="number" autocomplete="off" placeholder="Ej: 4" class="form-control" v-model.number="formData.doors"
                                min="1" max="10" />
                        </div>

                        <!-- Fecha de Matriculación -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Fecha de
                                Matriculación</label>
                            <input type="date" class="form-control" placeholder="YYYY-MM-DD" :class="{
                                'is-invalid': validationErrors.registration_date,
                                'is-valid': formData.registration_date && !validationErrors.registration_date
                            }" v-model="formData.registration_date"
                                @input="validateField('registration_date', formData.registration_date, 'La fecha es obligatoria')"
                                @blur="validateField('registration_date', formData.registration_date, 'La fecha es obligatoria')" />
                            <div v-if="validationErrors.registration_date" class="invalid-feedback d-block">
                                {{ validationErrors.registration_date }}
                            </div>
                        </div>

                        <!-- Autoridad de Tránsito -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Autoridad de
                                Tránsito</label>
                            <input type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.transit_authority,
                                'is-valid': formData.transit_authority && !validationErrors.transit_authority
                            }" v-model="formData.transit_authority" placeholder="Ej: Secretaría de Tránsito"
                                @input="validateField('transit_authority', formData.transit_authority, 'La autoridad es obligatoria')"
                                @blur="validateField('transit_authority', formData.transit_authority, 'La autoridad es obligatoria')" />
                            <div v-if="validationErrors.transit_authority" class="invalid-feedback d-block">
                                {{ validationErrors.transit_authority }}
                            </div>
                        </div>

                        <!-- Sucursal de Operación -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label" for="branch_uuid">Sucursal de Operación</label>
                            <select id="branch_uuid" ref="branchSelect" v-model="formData.branch_uuid"
                                class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option v-for="opt in store.catalogs.branches" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.branch_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.branch_uuid }}
                            </div>
                        </div>

                        <!-- SECCIÓN: DATOS TÉCNICOS -->
                        <div class="col-12 mt-4">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-file-contract me-2"></i>Datos Técnicos del Vehículo
                            </h6>
                        </div>

                        <!-- Capacidad de Carga -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;">Capacidad de Carga
                                (kg)</label>
                            <input type="number" autocomplete="off" placeholder="Ej: 2000" class="form-control"
                                v-model.number="formData.load_capacity" min="0" />
                        </div>

                        <!-- Peso Bruto -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;">Peso Bruto (kg)</label>
                            <input type="number" autocomplete="off" placeholder="Ej: 3500" class="form-control"
                                v-model.number="formData.gross_vehicle_weight" min="0" />
                        </div>

                        <!-- Cap. Pasajeros -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;">Cap. Pasajeros</label>
                            <input type="number" autocomplete="off" placeholder="Ej: 5" class="form-control"
                                v-model.number="formData.passenger_capacity" min="0" />
                        </div>

                        <!-- Pasajeros Sentados -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;">Pasajeros
                                Sentados</label>
                            <input type="number" autocomplete="off" placeholder="Ej: 4" class="form-control" :class="{
                                'is-invalid': validationErrors.seated_passenger_capacity,
                                'is-valid': formData.seated_passenger_capacity !== null && formData.seated_passenger_capacity !== '' && !validationErrors.seated_passenger_capacity
                            }" v-model.number="formData.seated_passenger_capacity" min="0"
                                @input="validateField('seated_passenger_capacity', formData.seated_passenger_capacity, 'Los pasajeros sentados son obligatorios')"
                                @blur="validateField('seated_passenger_capacity', formData.seated_passenger_capacity, 'Los pasajeros sentados son obligatorios')" />
                            <div v-if="validationErrors.seated_passenger_capacity" class="invalid-feedback d-block">
                                {{ validationErrors.seated_passenger_capacity }}
                            </div>
                        </div>

                        <!-- Número de Ejes -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;">Número de Ejes</label>
                            <input type="number" autocomplete="off" placeholder="Ej: 2" class="form-control"
                                v-model.number="formData.number_of_axles" min="1" />
                        </div>

                        <!-- Número Interno (Móvil) -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label" for="internal_number">Número Interno (Móvil)</label>
                            <input id="internal_number" v-model="formData.internal_number" class="form-control"
                                :class="{ 'is-invalid': validationErrors.internal_number }" type="text"
                                autocomplete="off" placeholder="Ingresa el número interno" />
                            <div v-if="validationErrors.internal_number" class="invalid-feedback d-block">
                                {{ validationErrors.internal_number }}
                            </div>
                            <div v-if="hasAgreements" class="text-warning small mb-0 mt-1 d-flex align-items-center gap-1">
                                <i class="fad fa-exclamation-triangle"></i>
                                <span>Vehículo con convenio. Auto-asignación inactiva.</span>
                            </div>
                        </div>

                        <!-- Empresa Transporte -->
                        <div class="col-12 col-md-12 col-lg-6" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa Transporte</label>
                            <select id="company_uuid" ref="companySelect" v-model="formData.company_uuid"
                                class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option v-for="opt in store.catalogs.companies" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.business_name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>

                        <!-- Afiliado -->
                        <div :class="isSuperAdmin ? 'col-12 col-md-12 col-lg-6' : 'col-12 col-md-12 col-lg-4'">
                            <label class="form-label required" for="owner_third_party_uuid">Afiliado</label>
                            <select id="owner_third_party_uuid" ref="ownerThirdPartySelect" v-model="formData.third_party_uuid"
                                class="form-control select2-input w-100">
                                <option value="">Seleccione...</option>
                                <option v-for="opt in store.catalogs.thirdParties" :key="opt.uuid" :value="opt.uuid">
                                    {{ opt.company_name || opt.trade_name || [opt.first_name,
                                    opt.last_name].filter(Boolean).join(' ') || opt.document_number || 'Sin nombre' }}
                                </option>
                            </select>
                            <div v-if="validationErrors.third_party_uuid" class="invalid-feedback d-block">
                                {{ validationErrors.third_party_uuid }}
                            </div>
                        </div>

                        <!-- Estado Operativo -->
                        <div :class="isSuperAdmin ? 'col-12 col-md-6 col-lg-6' : 'col-12 col-md-6 col-lg-4'">
                            <label class="form-label required" for="statusSelect">Estado Operativo</label>
                            <select id="statusSelect" ref="statusSelect" v-model="formData.is_active"
                                class="form-control select2-input w-100">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                            <div v-if="validationErrors.is_active" class="invalid-feedback d-block">
                                {{ validationErrors.is_active }}
                            </div>
                        </div>

                        <!-- Pago Exacto -->
                        <div :class="isSuperAdmin ? 'col-12 col-md-6 col-lg-6' : 'col-12 col-md-6 col-lg-4'">
                            <label class="form-label" for="exact_payment">Pago Exacto</label>
                            <div class="form-check form-switch mt-2">
                                <input class="form-check-input" type="checkbox" id="exact_payment"
                                    v-model="formData.exact_payment" :true-value="1" :false-value="0" />
                                <label class="form-check-label" for="exact_payment">Activar cobro por pago
                                    exacto</label>
                            </div>
                        </div>

                        <!-- Responsable del Vehículo Header -->
                        <div
                            class="col-12 mt-5 d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                            <h6 class="fw-bold text-info mb-0">
                                <i class="fas fa-user-tie me-2"></i>Responsable del Vehículo
                            </h6>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="has_owner"
                                    v-model="formData.has_owner" :true-value="1" :false-value="0" />
                                <label class="form-check-label text-muted small" for="has_owner">¿Registrar
                                    Responsable?</label>
                            </div>
                        </div>

                        <!-- Sección Propietario / Responsable -->
                        <template v-if="formData.has_owner === 1">
                            <div class="col-12 mb-2">
                                <div class="alert alert-info py-2 d-flex align-items-center">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <small>Si el vehículo pertenece a un tercero registrado, puede seleccionarlo aquí o
                                        ingresar los datos manualmente.</small>
                                </div>
                            </div>

                            <!-- Propietario: Tipo de Documento -->
                            <div class="col-12 col-md-4 col-lg-3">
                                <label class="form-label"
                                    :class="{ 'required': formData.owner.document_type_uuid || formData.owner.document_number || formData.owner.owner_name }"
                                    for="owner_document_type_uuid">Tipo de Documento</label>
                                <select id="owner_document_type_uuid" ref="ownerDocumentTypeSelect" v-model="formData.owner.document_type_uuid"
                                    class="form-control select2-input w-100">
                                    <option value="">Seleccione...</option>
                                    <option v-for="opt in store.catalogs.typeOfDocuments" :key="opt.uuid"
                                        :value="opt.uuid">
                                        {{ opt.name }} ({{ opt.prefix }})
                                    </option>
                                </select>
                                <div v-if="validationErrors['owner.document_type_uuid']"
                                    class="invalid-feedback d-block">
                                    {{ validationErrors['owner.document_type_uuid'] }}
                                </div>
                            </div>

                            <!-- Propietario: Número de Documento -->
                            <div class="col-12 col-md-4 col-lg-3">
                                <label class="form-label"
                                    :class="{ 'required': formData.owner.document_type_uuid || formData.owner.document_number || formData.owner.owner_name }"
                                    for="owner_document_number">Número de Documento</label>
                                <input id="owner_document_number" v-model="formData.owner.document_number"
                                    class="form-control"
                                    :class="{ 'is-invalid': validationErrors['owner.document_number'] }" type="text"
                                    autocomplete="off" placeholder="Ingresa el número de documento" />
                                <div v-if="validationErrors['owner.document_number']" class="invalid-feedback d-block">
                                    {{ validationErrors['owner.document_number'] }}
                                </div>
                            </div>

                            <!-- Propietario: Dígito de Verificación -->
                            <div class="col-12 col-md-4 col-lg-2">
                                <label class="form-label" for="owner_verification_digit">Dígito de Verificación</label>
                                <input id="owner_verification_digit" v-model="formData.owner.verification_digit"
                                    class="form-control"
                                    :class="{ 'is-invalid': validationErrors['owner.verification_digit'] }" type="text"
                                    autocomplete="off" placeholder="Ingresa el dígito de verificación" maxlength="1" />
                                <div v-if="validationErrors['owner.verification_digit']"
                                    class="invalid-feedback d-block">
                                    {{ validationErrors['owner.verification_digit'] }}
                                </div>
                            </div>

                            <!-- Propietario: Nombre / Razón Social -->
                            <div class="col-12 col-md-12 col-lg-4">
                                <label class="form-label"
                                    :class="{ 'required': formData.owner.document_type_uuid || formData.owner.document_number || formData.owner.owner_name }"
                                    for="owner_name">Nombre / Razón Social del Propietario</label>
                                <input id="owner_name" v-model="formData.owner.owner_name" class="form-control"
                                    :class="{ 'is-invalid': validationErrors['owner.owner_name'] }" type="text"
                                    autocomplete="off"
                                    placeholder="Ingresa el nombre completo o razón social del propietario" />
                                <div v-if="validationErrors['owner.owner_name']" class="invalid-feedback d-block">
                                    {{ validationErrors['owner.owner_name'] }}
                                </div>
                            </div>
                        </template>

                        <!-- Acciones del Formulario -->
                        <div class="col-12 mt-4">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 mt-md-4 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-3 p-md-4">
                    <div class="d-flex flex-column flex-sm-row align-items-start gap-3 g-2 g-md-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0 mb-2 mb-sm-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    La placa y el número de VIN son identificadores únicos críticos; asegúrate de
                                    verificarlos con los documentos oficiales del vehículo antes de registrarlos.
                                </li>
                                <li>
                                    El tipo de servicio (Público/Particular) determina los requisitos legales y de
                                    seguros aplicables al vehículo en el sistema.
                                </li>
                                <li>
                                    Mantener actualizada la fecha de registro y la autoridad de tránsito es vital para
                                    cumplir con las normativas locales de movilidad.
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
import { useVehiclesStore } from '../store/vehicles.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import { useDocumentWizard } from '@/hooks/useDocumentWizard.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import WizardProgress from '@/components/WizardProgress.vue';

const route = useRoute();
const router = useRouter();
const store = useVehiclesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Vehicles' : 'Registrar Vehicles');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [{ label: 'Vehicles', to: '/vehiculos', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' },]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

const hasAgreements = computed(() => {
    const agreements = formData.business_collaboration_agreements || formData.businessCollaborationAgreements;
    return Array.isArray(agreements) && agreements.length > 0;
});

const formData = reactive({
    business_collaboration_agreements: [],
    is_active: '1',
    company_uuid: '',
    branch_uuid: '',
    third_party_uuid: '',
    exact_payment: 0,
    has_owner: 0,
    doors: 0,
    load_capacity: 0,
    gross_vehicle_weight: 0,
    passenger_capacity: 0,
    seated_passenger_capacity: 0,
    number_of_axles: 0,
    vehicle_license_plate: '',
    transit_license_number: '',
    vehicle_class_uuid: '',
    type_of_service: '',
    brand_uuid: '',
    line: '',
    model: '',
    color: '',
    serial_number: '',
    engine_number: '',
    chassis_number: '',
    vin_number: '',
    engine_displacement: '',
    body_type: '',
    fuel_type: '',
    registration_date: '',
    transit_authority: '',
    internal_number: '',

    owner: {
        third_party_uuid: '',
        document_type_uuid: '',
        owner_name: '',
        document_number: '',
        verification_digit: ''
    }
});

const filePreviews = reactive({});

// Refs de Select2
const statusSelect = ref(null);
const companySelect = ref(null);
const typeOfServiceSelect = ref(null);
const vehicleClassSelect = ref(null);
const brandSelect = ref(null);
const fuelTypeSelect = ref(null);
const branchSelect = ref(null);
const ownerThirdPartySelect = ref(null);
const ownerDocumentTypeSelect = ref(null);

const selectConfigs = computed(() => [
    { ref: statusSelect, field: 'is_active', placeholder: 'Seleccionar estado' },
    { ref: companySelect, field: 'company_uuid', placeholder: 'Seleccionar empresa' },
    { ref: typeOfServiceSelect, field: 'type_of_service', placeholder: 'Seleccionar tipo de servicio' },
    { ref: vehicleClassSelect, field: 'vehicle_class_uuid', placeholder: 'Seleccionar clase de vehículo' },
    { ref: brandSelect, field: 'brand_uuid', placeholder: 'Seleccionar marca' },
    { ref: fuelTypeSelect, field: 'fuel_type', placeholder: 'Seleccionar tipo de combustible' },
    { ref: branchSelect, field: 'branch_uuid', placeholder: 'Seleccionar sucursal' },
    { ref: ownerThirdPartySelect, field: 'third_party_uuid', placeholder: 'Seleccionar afiliado' },
    { ref: ownerDocumentTypeSelect, field: 'owner.document_type_uuid', placeholder: 'Seleccionar tipo de documento' },
]);

const { initSelect2, setValues: setSelect2Values, syncFromSelect2, destroySelect2, applyAllValidations } = useSelect2(formData, validationErrors);

const validateField = (field, value, message) => {
    if (value === null || value === undefined || String(value).trim() === '') {
        validationErrors[field] = message;
    } else {
        delete validationErrors[field];
    }
};

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    // Validar requeridos según el JSON
    if (!formData.company_uuid) validationErrors.company_uuid = 'Este campo es obligatorio';
    if (!formData.vehicle_license_plate) validationErrors.vehicle_license_plate = 'Este campo es obligatorio';
    if (!formData.transit_license_number) validationErrors.transit_license_number = 'Este campo es obligatorio';
    if (!formData.type_of_service) validationErrors.type_of_service = 'Este campo es obligatorio';
    if (!formData.vehicle_class_uuid) validationErrors.vehicle_class_uuid = 'Este campo es obligatorio';
    if (!formData.brand_uuid) validationErrors.brand_uuid = 'Este campo es obligatorio';
    if (!formData.line) validationErrors.line = 'Este campo es obligatorio';
    if (!formData.model) validationErrors.model = 'Este campo es obligatorio';
    if (!formData.color) validationErrors.color = 'Este campo es obligatorio';
    if (!formData.engine_number) validationErrors.engine_number = 'Este campo es obligatorio';
    if (!formData.chassis_number) validationErrors.chassis_number = 'Este campo es obligatorio';
    if (!formData.engine_displacement) validationErrors.engine_displacement = 'Este campo es obligatorio';
    if (!formData.body_type) validationErrors.body_type = 'Este campo es obligatorio';
    if (!formData.fuel_type) validationErrors.fuel_type = 'Este campo es obligatorio';
    if (!formData.registration_date) validationErrors.registration_date = 'Este campo es obligatorio';
    if (!formData.transit_authority) validationErrors.transit_authority = 'Este campo es obligatorio';
    if (formData.doors === '' || formData.doors === null || formData.doors === undefined) validationErrors.doors = 'Este campo es obligatorio';
    if (formData.load_capacity === '' || formData.load_capacity === null || formData.load_capacity === undefined) validationErrors.load_capacity = 'Este campo es obligatorio';
    if (formData.gross_vehicle_weight === '' || formData.gross_vehicle_weight === null || formData.gross_vehicle_weight === undefined) validationErrors.gross_vehicle_weight = 'Este campo es obligatorio';
    if (formData.passenger_capacity === '' || formData.passenger_capacity === null || formData.passenger_capacity === undefined) validationErrors.passenger_capacity = 'Este campo es obligatorio';
    if (formData.seated_passenger_capacity === '' || formData.seated_passenger_capacity === null || formData.seated_passenger_capacity === undefined) validationErrors.seated_passenger_capacity = 'Este campo es obligatorio';
    if (formData.number_of_axles === '' || formData.number_of_axles === null || formData.number_of_axles === undefined) validationErrors.number_of_axles = 'Este campo es obligatorio';
    if (!formData.third_party_uuid) validationErrors.third_party_uuid = 'Este campo es obligatorio';
    if (!formData.is_active) validationErrors.is_active = 'Este campo es obligatorio';

    // Validación condicional del propietario
    const { owner, has_owner } = formData;
    if (has_owner === 1) {
        if (!owner.third_party_uuid) {
            if (!owner.document_type_uuid) validationErrors['owner.document_type_uuid'] = 'Este campo es obligatorio';
            if (!owner.document_number) validationErrors['owner.document_number'] = 'Este campo es obligatorio';
            if (!owner.owner_name) validationErrors['owner.owner_name'] = 'Este campo es obligatorio';
        }
    }

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/vehiculos');

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

        const payload = { ...formData };
        payload.exact_payment = (formData.exact_payment == 1 || formData.exact_payment === true || formData.exact_payment === '1') ? 1 : 0;
        if (!payload.has_owner) {
            delete payload.owner;
        }
        delete payload.has_owner;

        if (isEditMode.value) {
            await store.updateItem(uuid, payload);
            goBack();
        } else {
            const newItem = await store.createItem(payload);
            uuid = newItem?.uuid || newItem?.id;
            // Tras crear, encadenar el asistente de documentos (si hay pasos permitidos)
            if (uuid) {
                const { firstStep, stepRoute } = useDocumentWizard();
                const step = firstStep(permissionsStore);
                if (!step) {
                    goBack();
                } else {
                    router.push(stepRoute(step.key, uuid));
                    return;
                }
            } else {
                goBack();
            }
        }
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
                formData.branch_uuid = item.branch?.uuid || item.branch_uuid || '';
                formData.third_party_uuid = item.third_party_uuid || '';
                formData.is_active = (item.is_active == 1 || item.is_active === true || item.is_active === '1') ? '1' : '0';
                formData.exact_payment = (item.exact_payment == 1 || item.exact_payment === true || item.exact_payment === '1') ? 1 : 0;

                if (item.owners && item.owners.length > 0) {
                    const firstOwner = item.owners[0];
                    formData.has_owner = 1;
                    formData.owner = {
                        third_party_uuid: firstOwner.third_party_uuid || '',
                        document_type_uuid: firstOwner.document_type_uuid || '',
                        owner_name: firstOwner.owner_name || '',
                        document_number: firstOwner.document_number || '',
                        verification_digit: firstOwner.verification_digit || ''
                    };
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

/* ==================== TOUCH-FRIENDLY & NATIVAS ==================== */

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
    /* Actualizado para ser touch-friendly */
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
    /* Alineación ajustada a la nueva altura táctil */
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