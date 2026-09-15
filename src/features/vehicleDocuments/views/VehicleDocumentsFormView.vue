<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <WizardProgress
                v-if="wizardUuid"
                :current="route.params.documentType"
                :done-keys="wizardDoneKeys"
                @prev="goBack"
                @skip="goNextStep"
                @finish="goExit"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 py-md-3 px-3 px-md-4 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Información General</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos
                            obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-2 p-md-3 p-lg-4">
                    <form ref="docFormRef" @submit.prevent="handleSubmit" class="row g-3">

                        <!-- ==================== PÓLIZA - NUEVO ==================== -->
                        <template v-if="route.params.documentType === 'poliza' && !isEditMode">
                            <!-- SECCIÓN: DATOS DE PÓLIZAS -->
                            <div class="col-12">
                                <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-file-contract me-2"></i>Datos de pólizas
                                </h6>
                            </div>


                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-policy_number_rce">N° de Póliza
                                    RCE</label>
                                <input id="f-policy_number_rce" :aria-invalid="!!validationErrors['policy_number_rce']" :aria-describedby="validationErrors['policy_number_rce'] ? 'f-policy_number_rce-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese N° de póliza RCE"
                                    class="form-control" v-model="formData.policy_number_rce" required
                                    :class="fieldClass('policy_number_rce')"
                                    @blur="markAsTouched('policy_number_rce')" />
                                <div v-if="validationErrors.policy_number_rce" class="invalid-feedback d-block" id="f-policy_number_rce-error" role="alert">
                                    {{ validationErrors.policy_number_rce }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-policy_number_rcc">N° de Póliza
                                    RCC</label>
                                <input id="f-policy_number_rcc" :aria-invalid="!!validationErrors['policy_number_rcc']" :aria-describedby="validationErrors['policy_number_rcc'] ? 'f-policy_number_rcc-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese N° de póliza RCC"
                                    class="form-control" v-model="formData.policy_number_rcc" required
                                    :class="fieldClass('policy_number_rcc')"
                                    @blur="markAsTouched('policy_number_rcc')" />
                                <div v-if="validationErrors.policy_number_rcc" class="invalid-feedback d-block" id="f-policy_number_rcc-error" role="alert">
                                    {{ validationErrors.policy_number_rcc }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-taker">Tomador</label>
                                <input id="f-taker" :aria-invalid="!!validationErrors['taker']" :aria-describedby="validationErrors['taker'] ? 'f-taker-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese tomador" class="form-control"
                                    v-model="formData.taker" required :class="fieldClass('taker')"
                                    @blur="markAsTouched('taker')" />
                                <div v-if="validationErrors.taker" class="invalid-feedback d-block" id="f-taker-error" role="alert">
                                    {{ validationErrors.taker }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-issuing_entity">Entidad
                                    Emisora</label>
                                <input id="f-issuing_entity" :aria-invalid="!!validationErrors['issuing_entity']" :aria-describedby="validationErrors['issuing_entity'] ? 'f-issuing_entity-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese entidad emisora"
                                    class="form-control" v-model="formData.issuing_entity"
                                    :class="fieldClass('issuing_entity')" @blur="markAsTouched('issuing_entity')" />
                                <div v-if="validationErrors.issuing_entity" class="invalid-feedback d-block" id="f-issuing_entity-error" role="alert">
                                    {{ validationErrors.issuing_entity }}
                                </div>
                            </div>


                            <!-- SECCIÓN: FECHAS Y VEHÍCULO -->
                            <div class="col-12 mt-4">
                                <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-calendar-alt me-2"></i>Fechas y vehículo
                                </h6>
                            </div>


                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-issue_date">Fecha de
                                    Expedición</label>
                                <input id="f-issue_date" :aria-invalid="!!validationErrors['issue_date']" :aria-describedby="validationErrors['issue_date'] ? 'f-issue_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.issue_date"
                                    required :class="fieldClass('issue_date')" @blur="markAsTouched('issue_date')" />
                                <div v-if="validationErrors.issue_date" class="invalid-feedback d-block" id="f-issue_date-error" role="alert">
                                    {{ validationErrors.issue_date }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-effective_date">Fecha inicio
                                    de vigencia</label>
                                <input id="f-effective_date" :aria-invalid="!!validationErrors['effective_date']" :aria-describedby="validationErrors['effective_date'] ? 'f-effective_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control"
                                    v-model="formData.effective_date" required :class="fieldClass('effective_date')"
                                    @blur="markAsTouched('effective_date')" />
                                <div v-if="validationErrors.effective_date" class="invalid-feedback d-block" id="f-effective_date-error" role="alert">
                                    {{ validationErrors.effective_date }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-expiry_date">Fecha de
                                    Vencimiento</label>
                                <input id="f-expiry_date" :aria-invalid="!!validationErrors['expiry_date']" :aria-describedby="validationErrors['expiry_date'] ? 'f-expiry_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control"
                                    v-model="formData.expiry_date" required :class="fieldClass('expiry_date')"
                                    @blur="markAsTouched('expiry_date')" />
                                <div v-if="validationErrors.expiry_date" class="invalid-feedback d-block" id="f-expiry_date-error" role="alert">
                                    {{ validationErrors.expiry_date }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-vehicle_uuid">Vehículo</label>
                                <PrimeSelect :input-id="'f-vehicle_uuid'" v-model="formData.vehicle_uuid"
                                    :options="store.catalogs.vehicles" option-value="uuid" option-label="vehicle_license_plate"
                                    placeholder="Seleccionar vehículo" showClear filter class="w-100" :disabled="!!wizardUuid"
                                    :invalid="!!validationErrors['vehicle_uuid']" />
                                <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">
                                    {{ validationErrors.vehicle_uuid }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-company_uuid">Empresa</label>
                                <PrimeSelect :input-id="'f-company_uuid'" v-model="formData.company_uuid"
                                    :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                    placeholder="Seleccionar empresa" showClear filter class="w-100"
                                    :invalid="!!validationErrors['company_uuid']" />
                                <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                    {{ validationErrors.company_uuid }}
                                </div>
                            </div>
                            <input type="hidden" v-else v-model="formData.company_uuid" />

                        </template>

                        <!-- ==================== PÓLIZA - EDICIÓN ==================== -->
                        <template v-if="route.params.documentType === 'poliza' && isEditMode">
                            <!-- SECCIÓN: DATOS DE LAS PÓLIZAS -->
                            <div class="col-12">
                                <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-file-contract me-2"></i>Datos de las pólizas
                                </h6>
                            </div>

                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-policy_number_rce">N° de Póliza RCE</label>
                                <input id="f-policy_number_rce" :aria-invalid="!!validationErrors['policy_number_rce']" :aria-describedby="validationErrors['policy_number_rce'] ? 'f-policy_number_rce-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese N° de póliza RCE"
                                    class="form-control" v-model="formData.policy_number_rce" required
                                    :class="fieldClass('policy_number_rce')" @blur="markAsTouched('policy_number_rce')" />
                                <div v-if="validationErrors.policy_number_rce" class="invalid-feedback d-block" id="f-policy_number_rce-error" role="alert">
                                    {{ validationErrors.policy_number_rce }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-policy_number_rcc">N° de Póliza RCC</label>
                                <input id="f-policy_number_rcc" :aria-invalid="!!validationErrors['policy_number_rcc']" :aria-describedby="validationErrors['policy_number_rcc'] ? 'f-policy_number_rcc-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese N° de póliza RCC"
                                    class="form-control" v-model="formData.policy_number_rcc" required
                                    :class="fieldClass('policy_number_rcc')" @blur="markAsTouched('policy_number_rcc')" />
                                <div v-if="validationErrors.policy_number_rcc" class="invalid-feedback d-block" id="f-policy_number_rcc-error" role="alert">
                                    {{ validationErrors.policy_number_rcc }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-taker">Tomador</label>
                                <input id="f-taker" :aria-invalid="!!validationErrors['taker']" :aria-describedby="validationErrors['taker'] ? 'f-taker-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese tomador" class="form-control"
                                    v-model="formData.taker" required :class="fieldClass('taker')"
                                    @blur="markAsTouched('taker')" />
                                <div v-if="validationErrors.taker" class="invalid-feedback d-block" id="f-taker-error" role="alert">
                                    {{ validationErrors.taker }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-issuing_entity">Entidad
                                    Emisora</label>
                                <input id="f-issuing_entity" :aria-invalid="!!validationErrors['issuing_entity']" :aria-describedby="validationErrors['issuing_entity'] ? 'f-issuing_entity-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese entidad emisora"
                                    class="form-control" v-model="formData.issuing_entity"
                                    :class="fieldClass('issuing_entity')" @blur="markAsTouched('issuing_entity')" />
                                <div v-if="validationErrors.issuing_entity" class="invalid-feedback d-block" id="f-issuing_entity-error" role="alert">
                                    {{ validationErrors.issuing_entity }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-company_uuid">Empresa</label>
                                <PrimeSelect :input-id="'f-company_uuid'" v-model="formData.company_uuid"
                                    :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                    placeholder="Seleccionar empresa" showClear filter class="w-100"
                                    :invalid="!!validationErrors['company_uuid']" />
                                <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                    {{ validationErrors.company_uuid }}
                                </div>
                            </div>
                            <input type="hidden" v-else v-model="formData.company_uuid" />


                            <!-- SECCIÓN: FECHAS Y ESTADO -->
                            <div class="col-12 mt-4">
                                <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-calendar-check me-2"></i>Fechas y estado
                                </h6>
                            </div>


                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-issue_date">Fecha de
                                    Expedición</label>
                                <input id="f-issue_date" :aria-invalid="!!validationErrors['issue_date']" :aria-describedby="validationErrors['issue_date'] ? 'f-issue_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.issue_date"
                                    required :class="fieldClass('issue_date')" @blur="markAsTouched('issue_date')" />
                                <div v-if="validationErrors.issue_date" class="invalid-feedback d-block" id="f-issue_date-error" role="alert">
                                    {{ validationErrors.issue_date }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-effective_date">Fecha inicio
                                    de vigencia</label>
                                <input id="f-effective_date" :aria-invalid="!!validationErrors['effective_date']" :aria-describedby="validationErrors['effective_date'] ? 'f-effective_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control"
                                    v-model="formData.effective_date" required :class="fieldClass('effective_date')"
                                    @blur="markAsTouched('effective_date')" />
                                <div v-if="validationErrors.effective_date" class="invalid-feedback d-block" id="f-effective_date-error" role="alert">
                                    {{ validationErrors.effective_date }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-expiry_date">Fecha de
                                    Vencimiento</label>
                                <input id="f-expiry_date" :aria-invalid="!!validationErrors['expiry_date']" :aria-describedby="validationErrors['expiry_date'] ? 'f-expiry_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control"
                                    v-model="formData.expiry_date" required :class="fieldClass('expiry_date')"
                                    @blur="markAsTouched('expiry_date')" />
                                <div v-if="validationErrors.expiry_date" class="invalid-feedback d-block" id="f-expiry_date-error" role="alert">
                                    {{ validationErrors.expiry_date }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-status">Estado</label>
                                <PrimeSelect :input-id="'f-status'" v-model="formData.status"
                                    :options="[{ label: 'VIGENTE', value: 'VIGENTE' }, { label: 'NO VIGENTE', value: 'NO VIGENTE' }]"
                                    option-label="label" option-value="value" placeholder="Seleccione un estado" showClear filter class="w-100"
                                    :invalid="!!validationErrors['status']" />
                                <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">
                                    {{ validationErrors.status }}
                                </div>
                            </div>


                            <!-- SECCIÓN: VEHÍCULO -->
                            <div class="col-12 mt-4">
                                <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-car me-2"></i>Vehículo asociado
                                </h6>
                            </div>


                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-vehicle_uuid">Vehículo</label>
                                <PrimeSelect :input-id="'f-vehicle_uuid'" v-model="formData.vehicle_uuid"
                                    :options="store.catalogs.vehicles" option-value="uuid" option-label="vehicle_license_plate"
                                    placeholder="Seleccionar vehículo" showClear filter class="w-100" :disabled="!!wizardUuid"
                                    :invalid="!!validationErrors['vehicle_uuid']" />
                                <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">
                                    {{ validationErrors.vehicle_uuid }}
                                </div>
                            </div>

                        </template>

                        <!-- ==================== SOAT ==================== -->
                        <template v-if="route.params.documentType === 'soat'">
                            <!-- SECCIÓN: DATOS DEL SOAT -->
                            <div class="col-12">
                                <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-file-invoice me-2"></i>Datos del SOAT
                                </h6>
                            </div>


                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label fw-medium" style="font-size: 0.9rem;" for="f-policy_number">Número
                                    de SOAT</label>
                                <input id="f-policy_number" :aria-invalid="!!validationErrors['policy_number']" :aria-describedby="validationErrors['policy_number'] ? 'f-policy_number-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese número de SOAT"
                                    class="form-control" v-model="formData.policy_number" required
                                    :class="fieldClass('policy_number')" @blur="markAsTouched('policy_number')" />
                                <div v-if="validationErrors.policy_number" class="invalid-feedback d-block" id="f-policy_number-error" role="alert">
                                    {{ validationErrors.policy_number }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-issue_date">Fecha de
                                    Expedición</label>
                                <input id="f-issue_date" :aria-invalid="!!validationErrors['issue_date']" :aria-describedby="validationErrors['issue_date'] ? 'f-issue_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.issue_date"
                                    required :class="fieldClass('issue_date')" @blur="markAsTouched('issue_date')" />
                                <div v-if="validationErrors.issue_date" class="invalid-feedback d-block" id="f-issue_date-error" role="alert">
                                    {{ validationErrors.issue_date }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-effective_date">Fecha inicio
                                    de vigencia</label>
                                <input id="f-effective_date" :aria-invalid="!!validationErrors['effective_date']" :aria-describedby="validationErrors['effective_date'] ? 'f-effective_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control"
                                    v-model="formData.effective_date" required :class="fieldClass('effective_date')"
                                    @blur="markAsTouched('effective_date')" />
                                <div v-if="validationErrors.effective_date" class="invalid-feedback d-block" id="f-effective_date-error" role="alert">
                                    {{ validationErrors.effective_date }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-expiry_date">Fecha de
                                    Vencimiento</label>
                                <input id="f-expiry_date" :aria-invalid="!!validationErrors['expiry_date']" :aria-describedby="validationErrors['expiry_date'] ? 'f-expiry_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control"
                                    v-model="formData.expiry_date" required :class="fieldClass('expiry_date')"
                                    @blur="markAsTouched('expiry_date')" />
                                <div v-if="validationErrors.expiry_date" class="invalid-feedback d-block" id="f-expiry_date-error" role="alert">
                                    {{ validationErrors.expiry_date }}
                                </div>
                            </div>


                            <!-- SECCIÓN: ENTIDAD Y CONFIGURACIÓN -->
                            <div class="col-12 mt-4">
                                <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-building me-2"></i>Entidad y configuración
                                </h6>
                            </div>


                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-issuing_entity">Entidad
                                    Emisora</label>
                                <input id="f-issuing_entity" :aria-invalid="!!validationErrors['issuing_entity']" :aria-describedby="validationErrors['issuing_entity'] ? 'f-issuing_entity-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese entidad emisora"
                                    class="form-control" v-model="formData.issuing_entity"
                                    :class="fieldClass('issuing_entity')" @blur="markAsTouched('issuing_entity')" />
                                <div v-if="validationErrors.issuing_entity" class="invalid-feedback d-block" id="f-issuing_entity-error" role="alert">
                                    {{ validationErrors.issuing_entity }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-status">Estado</label>
                                <PrimeSelect :input-id="'f-status'" v-model="formData.status"
                                    :options="[{ label: 'VIGENTE', value: 'VIGENTE' }, { label: 'NO VIGENTE', value: 'NO VIGENTE' }]"
                                    option-label="label" option-value="value" placeholder="Seleccione un estado" showClear filter class="w-100"
                                    :invalid="!!validationErrors['status']" />
                                <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">
                                    {{ validationErrors.status }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-tariff_code">Código
                                    tarifa</label>
                                <input id="f-tariff_code" :aria-invalid="!!validationErrors['tariff_code']" :aria-describedby="validationErrors['tariff_code'] ? 'f-tariff_code-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese código tarifa"
                                    class="form-control" v-model="formData.tariff_code"
                                    :class="fieldClass('tariff_code')" @blur="markAsTouched('tariff_code')" />
                                <div v-if="validationErrors.tariff_code" class="invalid-feedback d-block" id="f-tariff_code-error" role="alert">
                                    {{ validationErrors.tariff_code }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-vehicle_uuid">Vehículo</label>
                                <PrimeSelect :input-id="'f-vehicle_uuid'" v-model="formData.vehicle_uuid"
                                    :options="store.catalogs.vehicles" option-value="uuid" option-label="vehicle_license_plate"
                                    placeholder="Seleccionar vehículo" showClear filter class="w-100" :disabled="!!wizardUuid"
                                    :invalid="!!validationErrors['vehicle_uuid']" />
                                <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">
                                    {{ validationErrors.vehicle_uuid }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-company_uuid">Empresa</label>
                                <PrimeSelect :input-id="'f-company_uuid'" v-model="formData.company_uuid"
                                    :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                    placeholder="Seleccionar empresa" showClear filter class="w-100"
                                    :invalid="!!validationErrors['company_uuid']" />
                                <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                    {{ validationErrors.company_uuid }}
                                </div>
                            </div>
                            <input type="hidden" v-else v-model="formData.company_uuid" />

                        </template>

                        <!-- ==================== TECNOMECÁNICA ==================== -->
                        <template v-if="route.params.documentType === 'tecnomecanica'">
                            <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;"
                                    for="f-policy_number">Número de tecnomecánica</label>
                                <input id="f-policy_number" :aria-invalid="!!validationErrors['policy_number']" :aria-describedby="validationErrors['policy_number'] ? 'f-policy_number-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese número de tecnomecánica"
                                    class="form-control" v-model="formData.policy_number" required
                                    :class="fieldClass('policy_number')" @blur="markAsTouched('policy_number')" />
                                <div v-if="validationErrors.policy_number" class="invalid-feedback d-block" id="f-policy_number-error" role="alert">
                                    {{ validationErrors.policy_number }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-issue_date">Fecha de
                                    Expedición</label>
                                <input id="f-issue_date" :aria-invalid="!!validationErrors['issue_date']" :aria-describedby="validationErrors['issue_date'] ? 'f-issue_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.issue_date"
                                    required :class="fieldClass('issue_date')" @blur="markAsTouched('issue_date')" />
                                <div v-if="validationErrors.issue_date" class="invalid-feedback d-block" id="f-issue_date-error" role="alert">
                                    {{ validationErrors.issue_date }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-expiry_date">Fecha de
                                    Vencimiento</label>
                                <input id="f-expiry_date" :aria-invalid="!!validationErrors['expiry_date']" :aria-describedby="validationErrors['expiry_date'] ? 'f-expiry_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control"
                                    v-model="formData.expiry_date" required :class="fieldClass('expiry_date')"
                                    @blur="markAsTouched('expiry_date')" />
                                <div v-if="validationErrors.expiry_date" class="invalid-feedback d-block" id="f-expiry_date-error" role="alert">
                                    {{ validationErrors.expiry_date }}
                                </div>
                            </div>


                            <!-- SECCIÓN: CDA Y ESTADO -->
                            <div class="col-12 mt-4">
                                <h6 class="text-muted fw-medium mb-3 pb-3 border-bottom" style="font-size: 0.9rem;">
                                    <i class="fad fa-industry me-2"></i>CDA y estado
                                </h6>
                            </div>


                            <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-issuing_entity">CDA expide
                                    RTM</label>
                                <input id="f-issuing_entity" :aria-invalid="!!validationErrors['issuing_entity']" :aria-describedby="validationErrors['issuing_entity'] ? 'f-issuing_entity-error' : undefined" type="text" autocomplete="off" placeholder="Ingrese CDA que expide RTM"
                                    class="form-control" v-model="formData.issuing_entity"
                                    :class="fieldClass('issuing_entity')" @blur="markAsTouched('issuing_entity')" />
                                <div v-if="validationErrors.issuing_entity" class="invalid-feedback d-block" id="f-issuing_entity-error" role="alert">
                                    {{ validationErrors.issuing_entity }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-company_uuid">Empresa</label>
                                <PrimeSelect :input-id="'f-company_uuid'" v-model="formData.company_uuid"
                                    :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                    placeholder="Seleccionar empresa" showClear filter class="w-100"
                                    :invalid="!!validationErrors['company_uuid']" />
                                <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                    {{ validationErrors.company_uuid }}
                                </div>
                            </div>
                            <input type="hidden" v-else v-model="formData.company_uuid" />
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-status">Estado</label>
                                <PrimeSelect :input-id="'f-status'" v-model="formData.status"
                                    :options="[{ label: 'Si', value: 'SI' }, { label: 'No', value: 'NO' }]"
                                    option-label="label" option-value="value" placeholder="Seleccione un estado" showClear filter class="w-100"
                                    :invalid="!!validationErrors['status']" />
                                <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">
                                    {{ validationErrors.status }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-vehicle_uuid">Vehículo</label>
                                <PrimeSelect :input-id="'f-vehicle_uuid'" v-model="formData.vehicle_uuid"
                                    :options="store.catalogs.vehicles" option-value="uuid" option-label="vehicle_license_plate"
                                    placeholder="Seleccionar vehículo" showClear filter class="w-100" :disabled="!!wizardUuid"
                                    :invalid="!!validationErrors['vehicle_uuid']" />
                                <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">
                                    {{ validationErrors.vehicle_uuid }}
                                </div>
                            </div>

                        </template>

                        <!-- BOTONES DE ACCIÓN -->
                        <div class="col-12 mt-4 pt-3 border-top">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode || esActualizacion" :wizard-mode="!!wizardUuid" @cancel="goBack" />
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
                                    El SOAT es obligatorio para todos los vehículos que circulan por vías públicas;
                                    asegúrate de que la fecha de vencimiento esté siempre actualizada para evitar
                                    multas.
                                </li>
                                <li>
                                    La Revisión Técnico-Mecánica (RTM) debe realizarse periódicamente según la
                                    antigüedad del vehículo; registrar correctamente la fecha de emisión ayuda a
                                    programar alertas de mantenimiento.
                                </li>
                                <li>
                                    Verifica que el número de póliza coincida exactamente con el documento físico
                                    emitido por la aseguradora para facilitar procesos de siniestro.
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
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVehicleDocumentsStore } from '../store/vehicleDocuments.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useNoAutocomplete } from '@/hooks/useNoAutocomplete.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import WizardProgress from '@/components/WizardProgress.vue';
import { useDocumentWizard } from '@/hooks/useDocumentWizard.js';
import vehicleDocumentsService from '../services/vehicleDocuments.service.js';

const route = useRoute();
const router = useRouter();
const store = useVehicleDocumentsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));

const isEditMode = computed(() => route.params.id !== undefined);

/** Modo asistente: creación encadenada tras registrar el vehículo (?wizard=<uuid>) */
const wizardUuid = computed(() => (route.query.wizard ? String(route.query.wizard) : null));
/** Origen al que volver al guardar/cancelar desde el menú de documentos (?retorno=<ruta>) */
const returnTo = computed(() => (route.query.retorno ? String(route.query.retorno) : null));
/** Registrar versión nueva aunque ya exista un documento (?nuevo=1) */
const isNuevo = computed(() => route.query.nuevo === '1');
const { nextStepRoute, prevStepRoute, exitRoute, fetchExistingDocs, getSessionDone, markStepDone, clearSessionDone, toDateInput } = useDocumentWizard();
const wizardDoneKeys = ref([]);
// UUID del documento precargado en el asistente (SOAT/RTM) para actualizar en vez de duplicar
const editingDocUuid = ref(null);
// El asistente actualiza un registro existente (precargado y sin flag de nuevo)
const esActualizacion = computed(() => !isEditMode.value && !!wizardUuid.value && !isNuevo.value &&
    (!!editingDocUuid.value || !!editingPolicyUuids.rce || !!editingPolicyUuids.rcc));

const goExit = () => {
    clearSessionDone(wizardUuid.value);
    router.push(returnTo.value || exitRoute(wizardUuid.value));
};
const goNextStep = () => router.push(nextStepRoute(route.params.documentType, wizardUuid.value, permissionsStore));

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [{ label: 'Documentos', to: getBackRoute(), }, { label: isEditMode.value ? 'Editar' : 'Nuevo' },]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

const getDocumentTypeTitle = (documentType) => {
    switch (documentType) {
        case 'soat': return 'Póliza SOAT';
        case 'tecnomecanica': return 'Revisión Técnico Mecánica (RTM)';
        case 'poliza': return 'Pólizas de Responsabilidad Civil (RCC y RCE)';
        default: return 'Documentos';
    }
};

const pageTitle = computed(() => {
    const base = getDocumentTypeTitle(route.params.documentType);
    if (isEditMode.value || esActualizacion.value) return `Actualizar ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
    return base;
});

const touchedFields = reactive({});
const markAsTouched = (field) => { touchedFields[field] = true; };
const fieldClass = (field) => {
    if (!touchedFields[field] && !submitting.value) return '';
    return validationErrors[field] ? 'is-invalid' : 'is-valid';
};

// UUIDs de las pólizas RCC y RCE al editar (para actualizar ambas)
const editingPolicyUuids = reactive({ rce: null, rcc: null });

// Estado inicial del formulario (inicializar campos del JSON de la Tarea 1)
const formData = reactive({
    policy_number_rce: '',
    policy_number_rcc: '',
    policy_number: '',
    taker: '',
    issuing_entity: '',
    issue_date: '',
    effective_date: '',
    expiry_date: '',
    vehicle_uuid: '',
    company_uuid: '',
    document_type: '',
    status: '',
    tariff_code: '',
    file: null,
});

// Sin sugerencias del navegador en el asistente
const docFormRef = ref(null);
const { scrub: scrubAutocomplete } = useNoAutocomplete(docFormRef);

// Foto del estado prístino para reiniciar entre pasos del asistente
const pristineCreateState = { ...formData };

const resetCreateState = () => {
    Object.assign(formData, pristineCreateState);
    Object.keys(validationErrors).forEach((key) => delete validationErrors[key]);
    Object.keys(touchedFields).forEach((key) => delete touchedFields[key]);
    editingDocUuid.value = null;
    editingPolicyUuids.rce = null;
    editingPolicyUuids.rcc = null;
    wizardDoneKeys.value = [];
};

const documentTypeFor = (type) => {
    if (type === 'poliza') return 'poliza';
    if (type === 'soat') return 'SOAT';
    if (type === 'tecnomecanica') return 'RTM';
    return type;
};

/** Recalcula los checks del stepper combinando sesión y backend; devuelve lo encontrado */
const refreshWizardDone = async () => {
    if (!wizardUuid.value) return null;
    wizardDoneKeys.value = getSessionDone(wizardUuid.value);
    try {
        const found = await fetchExistingDocs(wizardUuid.value);
        const done = new Set(['vehiculo', ...getSessionDone(wizardUuid.value)]);
        if (found.soat) done.add('soat');
        if (found.rce && found.rcc) done.add('poliza');
        if (found.rtm) done.add('tecnomecanica');
        if (found.tarjeta) done.add('tarjeta');
        wizardDoneKeys.value = [...done];
        return found;
    } catch {
        wizardDoneKeys.value = getSessionDone(wizardUuid.value);
        return null;
    }
};

/** Inicializa un paso de creación (montaje o cambio de tipo en el asistente) */
const initCreateStep = async () => {
    formData.document_type = documentTypeFor(route.params.documentType);
    if (!isSuperAdmin.value) formData.company_uuid = userStore.company_uuid;
    if (wizardUuid.value) {
        formData.vehicle_uuid = wizardUuid.value;
        const found = await refreshWizardDone();
        // Precarga el documento ya registrado (salvo registro de versión nueva)
        if (found && !isNuevo.value) preloadStepDoc(found);
    }
    await nextTick();
    scrubAutocomplete();
};

/**
 * Rellena el formulario con el documento existente del paso actual.
 * Al guardar se actualizará en vez de crear un duplicado.
 * @param {Object} found resultado de fetchExistingDocs
 */
const preloadStepDoc = (found) => {
    const step = route.params.documentType;
    if (step === 'soat' && found.soat) {
        const d = found.soat;
        editingDocUuid.value = d.uuid ?? null;
        Object.assign(formData, {
            policy_number: d.policy_number ?? '',
            issuing_entity: d.issuing_entity ?? '',
            issue_date: toDateInput(d.issue_date),
            effective_date: toDateInput(d.effective_date),
            expiry_date: toDateInput(d.expiry_date),
            status: d.status ?? 'VIGENTE',
            tariff_code: d.tariff_code ?? '',
            company_uuid: d.company_uuid || formData.company_uuid,
        });
    } else if (step === 'tecnomecanica' && found.rtm) {
        const d = found.rtm;
        editingDocUuid.value = d.uuid ?? null;
        Object.assign(formData, {
            policy_number: d.policy_number ?? '',
            issuing_entity: d.issuing_entity ?? '',
            issue_date: toDateInput(d.issue_date),
            expiry_date: toDateInput(d.expiry_date),
            status: d.status ?? 'SI',
            company_uuid: d.company_uuid || formData.company_uuid,
        });
    } else if (step === 'poliza' && (found.rce || found.rcc)) {
        const rce = found.rce, rcc = found.rcc, ref = rce ?? rcc;
        editingPolicyUuids.rce = rce?.uuid ?? null;
        editingPolicyUuids.rcc = rcc?.uuid ?? null;
        Object.assign(formData, {
            policy_number_rce: rce?.policy_number ?? '',
            policy_number_rcc: rcc?.policy_number ?? '',
            taker: ref?.taker ?? '',
            issuing_entity: ref?.issuing_entity ?? '',
            issue_date: toDateInput(ref?.issue_date),
            effective_date: toDateInput(ref?.effective_date),
            expiry_date: toDateInput(ref?.expiry_date),
            status: ref?.status ?? 'VIGENTE',
            company_uuid: ref?.company_uuid || formData.company_uuid,
        });
    }
};

// Al cambiar de tipo de documento dentro del asistente se reutiliza la vista:
// reiniciar estado en vez de conservar el paso anterior
watch(() => route.params.documentType, async (to, from) => {
    if (isEditMode.value || !wizardUuid.value || to === from) return;
    resetCreateState();
    await initCreateStep();
});

const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (route.params.documentType === 'poliza' && !isEditMode.value) {
        if (isEmpty(formData.policy_number_rce)) validationErrors.policy_number_rce = 'Obligatorio';
        if (isEmpty(formData.policy_number_rcc)) validationErrors.policy_number_rcc = 'Obligatorio';
        if (isEmpty(formData.taker)) validationErrors.taker = 'Obligatorio';
        if (isEmpty(formData.issuing_entity)) validationErrors.issuing_entity = 'Obligatorio';
        if (isEmpty(formData.issue_date)) validationErrors.issue_date = 'Obligatorio';
        if (isEmpty(formData.effective_date)) validationErrors.effective_date = 'Obligatorio';
        if (isEmpty(formData.expiry_date)) validationErrors.expiry_date = 'Obligatorio';
        if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Obligatorio';
    } else if (route.params.documentType === 'poliza' && isEditMode.value) {
        if (isEmpty(formData.policy_number_rce)) validationErrors.policy_number_rce = 'Obligatorio';
        if (isEmpty(formData.policy_number_rcc)) validationErrors.policy_number_rcc = 'Obligatorio';
        if (isEmpty(formData.taker)) validationErrors.taker = 'Obligatorio';
        if (isEmpty(formData.issuing_entity)) validationErrors.issuing_entity = 'Obligatorio';
        if (isEmpty(formData.issue_date)) validationErrors.issue_date = 'Obligatorio';
        if (isEmpty(formData.effective_date)) validationErrors.effective_date = 'Obligatorio';
        if (isEmpty(formData.expiry_date)) validationErrors.expiry_date = 'Obligatorio';
        if (isEmpty(formData.status)) validationErrors.status = 'Obligatorio';
        if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Obligatorio';
    } else if (route.params.documentType === 'soat') {
        if (isEmpty(formData.policy_number)) validationErrors.policy_number = 'Obligatorio';
        if (isEmpty(formData.issue_date)) validationErrors.issue_date = 'Obligatorio';
        if (isEmpty(formData.effective_date)) validationErrors.effective_date = 'Obligatorio';
        if (isEmpty(formData.expiry_date)) validationErrors.expiry_date = 'Obligatorio';
        if (isEmpty(formData.issuing_entity)) validationErrors.issuing_entity = 'Obligatorio';
        if (isEmpty(formData.status)) validationErrors.status = 'Obligatorio';
        if (isEmpty(formData.tariff_code)) validationErrors.tariff_code = 'Obligatorio';
        if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Obligatorio';
    } else if (route.params.documentType === 'tecnomecanica') {
        if (isEmpty(formData.policy_number)) validationErrors.policy_number = 'Obligatorio';
        if (isEmpty(formData.issue_date)) validationErrors.issue_date = 'Obligatorio';
        if (isEmpty(formData.expiry_date)) validationErrors.expiry_date = 'Obligatorio';
        if (isEmpty(formData.issuing_entity)) validationErrors.issuing_entity = 'Obligatorio';
        if (isEmpty(formData.status)) validationErrors.status = 'Obligatorio';
        if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Obligatorio';
    }

    if (isEmpty(formData.company_uuid)) validationErrors.company_uuid = 'Obligatorio';

    return Object.keys(validationErrors).length === 0;
};

const getBackRoute = () => {
    // Desde el menú de documentos: volver al origen (perfil) en vez del listado
    if (returnTo.value) return returnTo.value;
    if (wizardUuid.value) return prevStepRoute(route.params.documentType, wizardUuid.value, permissionsStore);
    const type = route.params.documentType;
    if (type) return `/vehiculos-documentos/${type}`;
    return '/vehiculos-documentos';
};

const goBack = () => router.push(getBackRoute());

const handleSubmit = async () => {
    // En modo asistente el vehículo queda fijado al que originó el flujo
    if (wizardUuid.value) formData.vehicle_uuid = wizardUuid.value;

    if (!validateForm()) {
        await nextTick();
        const firstError = document.querySelector('[aria-invalid="true"], .is-invalid');
        if (firstError) {
            if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(firstError.tagName)) firstError.setAttribute('tabindex', '-1');
            firstError.focus({ preventScroll: true });
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return toast('Atención', 'Revisa los campos obligatorios', 'warning');
    }

    try {
        submitting.value = true;
        let uuid = isEditMode.value ? route.params.id : null;

        if (isEditMode.value) {
            if (route.params.documentType === 'poliza') {
                // Actualizar ambas pólizas: RCE y RCC
                const updates = [];
                if (editingPolicyUuids.rce) {
                    updates.push(store.updateItem(editingPolicyUuids.rce, {
                        ...formData,
                        document_type: 'RCE',
                        policy_number: formData.policy_number_rce,
                    }));
                }
                if (editingPolicyUuids.rcc) {
                    updates.push(store.updateItem(editingPolicyUuids.rcc, {
                        ...formData,
                        document_type: 'RCC',
                        policy_number: formData.policy_number_rcc,
                    }));
                }
                await Promise.all(updates);
            } else {
                await store.updateItem(uuid, formData);
            }
        } else {
            if (route.params.documentType === 'poliza') {
                // Actualiza las existentes y crea solo la faltante (póliza parcial)
                const ops = [];
                const rcePayload = { ...formData, document_type: 'RCE', policy_number: formData.policy_number_rce };
                const rccPayload = { ...formData, document_type: 'RCC', policy_number: formData.policy_number_rcc };
                if (editingPolicyUuids.rce) ops.push(store.updateItem(editingPolicyUuids.rce, rcePayload));
                else if (formData.policy_number_rce) ops.push(store.createItem({ ...rcePayload, status: formData.status || 'VIGENTE' }));
                if (editingPolicyUuids.rcc) ops.push(store.updateItem(editingPolicyUuids.rcc, rccPayload));
                else if (formData.policy_number_rcc) ops.push(store.createItem({ ...rccPayload, status: formData.status || 'VIGENTE' }));
                await Promise.all(ops);
            } else if (editingDocUuid.value) {
                await store.updateItem(editingDocUuid.value, formData);
            } else if (route.params.documentType === 'soat') {
                formData.document_type = 'SOAT';
                await store.createItem(formData);
            } else if (route.params.documentType === 'tecnomecanica') {
                formData.document_type = 'RTM';
                await store.createItem(formData);
            } else {
                await store.createItem(formData);
            }
        }

        if (wizardUuid.value) {
            markStepDone(wizardUuid.value, route.params.documentType);
            // Desde el menú de documentos: salir del asistente y volver al origen con datos frescos
            if (returnTo.value) router.push(returnTo.value);
            else goNextStep();
        } else {
            goBack();
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
            if (route.params.documentType === 'poliza') {
                // Cargar la póliza actual (RCC o RCE) y las demás del mismo vehículo
                const item = await store.fetchProfileById(route.params.id);
                if (item) {
                    const vehicleUuid = item.vehicle_uuid;

                    const resp = await vehicleDocumentsService.getByVehicle(vehicleUuid);
                    const docs = resp?.data ?? resp ?? [];
                    const list = Array.isArray(docs) ? docs : (docs.data ?? []);

                    const rce = list.find(d => d.document_type === 'RCE');
                    const rcc = list.find(d => d.document_type === 'RCC');

                    editingPolicyUuids.rce = rce?.uuid ?? null;
                    editingPolicyUuids.rcc = rcc?.uuid ?? null;

                    Object.assign(formData, {
                        company_uuid: item.company_uuid || formData.company_uuid,
                        vehicle_uuid: vehicleUuid,
                        policy_number_rce: rce?.policy_number ?? '',
                        policy_number_rcc: rcc?.policy_number ?? '',
                        taker: rce?.taker ?? rcc?.taker ?? item.taker ?? '',
                        issuing_entity: rce?.issuing_entity ?? rcc?.issuing_entity ?? item.issuing_entity ?? '',
                        issue_date: (rce?.issue_date || item.issue_date) ? String(rce?.issue_date || item.issue_date).slice(0, 10) : '',
                        effective_date: (rce?.effective_date || item.effective_date) ? String(rce?.effective_date || item.effective_date).slice(0, 10) : '',
                        expiry_date: (rce?.expiry_date || item.expiry_date) ? String(rce?.expiry_date || item.expiry_date).slice(0, 10) : '',
                        status: rce?.status || item.status || 'VIGENTE',
                    });
                }
            } else if (route.params.documentType === 'soat') {
                const item = await store.fetchProfileById(route.params.id);
                if (item) {
                    Object.assign(formData, item);
                    if (formData.issue_date) formData.issue_date = String(formData.issue_date).slice(0, 10);
                    if (formData.effective_date) formData.effective_date = String(formData.effective_date).slice(0, 10);
                    if (formData.expiry_date) formData.expiry_date = String(formData.expiry_date).slice(0, 10);
                }
            } else if (route.params.documentType === 'tecnomecanica') {
                const item = await store.fetchProfileById(route.params.id);
                if (item) {
                    Object.assign(formData, item);
                    if (formData.issue_date) formData.issue_date = String(formData.issue_date).slice(0, 10);
                    if (formData.effective_date) formData.effective_date = String(formData.effective_date).slice(0, 10);
                    if (formData.expiry_date) formData.expiry_date = String(formData.expiry_date).slice(0, 10);
                }
            } else {
                const item = await store.fetchProfileById(route.params.id);
                if (item) {
                    Object.assign(formData, item);
                    if (formData.issue_date) formData.issue_date = String(formData.issue_date).slice(0, 10);
                    if (formData.effective_date) formData.effective_date = String(formData.effective_date).slice(0, 10);
                    if (formData.expiry_date) formData.expiry_date = String(formData.expiry_date).slice(0, 10);
                }
            }
        } else {
            await initCreateStep();
        }
        // En edición con asistente (desde el menú) también se pinta el progreso
        if (isEditMode.value) await refreshWizardDone();
    } finally {
        isViewLoading.value = false;
        await nextTick();
    }
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


.invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875em;
    color: #dc3545;
}

/* ==================== SELECT2 UI FIXES ==================== */





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