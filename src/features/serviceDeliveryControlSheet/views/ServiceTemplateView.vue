<template>
    <div class="service-template-view fade-in">
        <!-- ═══════════════════════════════════════════════════════════
             1. HEADER DE PÁGINA (ESTÁNDAR DEL SISTEMA)
        ═══════════════════════════════════════════════════════════ -->
        <div class="row gx-2 gx-md-3">
            <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
                <BasePageHeader
                    title="Control Operativo de Servicio"
                    subtitle="Planilla de Control y Prestación de Servicios de Transporte (PCP)"
                    icon="fad fa-clipboard-list-check text-primary"
                    :breadcrumbs="breadcrumbs"
                    :show-back="true"
                    @back="goBack"
                >
                    <template #actions>
                        <div class="d-none d-md-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border">
                            <i class="fad fa-clock text-primary"></i>
                            <span class="fs-12 fw-bold text-700 font-monospace">{{ clockStr }}</span>
                        </div>
                        <button class="btn btn-falcon-default btn-sm px-3 rounded-pill" type="button" @click="goBack" title="Regresar al listado">
                            <i class="fad fa-arrow-left me-1"></i>
                            <span>Regresar</span>
                        </button>
                    </template>
                </BasePageHeader>

                <!-- ═══════════════════════════════════════════════════════
                     2. STEPPER INTERACTIVO DE PROCESO
                ═══════════════════════════════════════════════════════ -->
                <div class="card border-0 shadow-sm mb-4 stepper-card overflow-hidden">
                    <div class="card-body p-2 p-md-3">
                        <div class="stepper-track">
                            <div
                                v-for="s in steps"
                                :key="s.n"
                                class="stepper-item"
                                :class="{
                                    'active': currentStep === s.n,
                                    'done': currentStep > s.n,
                                    'clickable': currentStep > s.n
                                }"
                                @click="handleStepClick(s.n)"
                            >
                                <div class="step-indicator">
                                    <i v-if="currentStep > s.n" class="fas fa-check"></i>
                                    <i v-else :class="s.icon"></i>
                                </div>
                                <div class="step-content d-none d-sm-block">
                                    <span class="step-number">Paso 0{{ s.n }}</span>
                                    <h6 class="step-label mb-0">{{ s.label }}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ═══════════════════════════════════════════════════════
                     3. CONTENEDOR PRINCIPAL (PASOS 1 AL 6)
                ═══════════════════════════════════════════════════════ -->
                <div v-if="!isViewLoading">

                    <!-- ───────────────────────────────────────────────────
                         PASO 1: SELECCIÓN DEL SERVICIO ASIGNADO
                    ─────────────────────────────────────────────────── -->
                    <div v-if="currentStep === 1" class="fade-in">
                        <div class="card border-0 shadow-sm mb-3 fade-in-up">
                            <div class="card-header bg-light py-2 px-3 border-bottom">
                                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="fad fa-steering-wheel text-primary"></i>
                                        <h6 class="mb-0 fw-semibold text-dark">Selección del Servicio Asignado</h6>
                                    </div>
                                    <span class="badge bg-primary bg-opacity-10 text-primary">
                                        <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Paso requerido
                                    </span>
                                </div>
                            </div>

                            <div class="card-body p-3 p-md-4">
                                <div class="row g-3">
                                    <!-- Filtro de Proyecto -->
                                    <div class="col-12 col-md-5">
                                        <label class="form-label fw-medium text-700" style="font-size: 0.9rem;" for="proyectoFiltro">
                                            <i class="fad fa-folder text-primary me-1"></i> Filtrar por Proyecto
                                        </label>
                                        <select id="proyectoFiltro" v-model="proyectoFiltro" class="form-select">
                                            <option value="">— Todos los proyectos —</option>
                                            <option v-for="p in proyectosList" :key="p.uuid" :value="p.uuid">
                                                {{ p.project_name }}
                                            </option>
                                        </select>
                                    </div>

                                    <!-- Selector de Servicio -->
                                    <div class="col-12 col-md-7">
                                        <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;" for="servicioId">
                                            <i class="fad fa-bus-alt text-primary me-1"></i> Planilla / Servicio Asignado
                                        </label>
                                        <select
                                            id="servicioId"
                                            ref="servicioSelect"
                                            v-model="formData.servicioId"
                                            class="form-control select2-input w-100"
                                        >
                                            <option value="">— Seleccione un servicio —</option>
                                            <option v-for="s in serviciosFiltrados" :key="s.uuid" :value="s.uuid">
                                                {{ s.daily_route || recorridosTextoDe(s) }} · {{ tipoCorto(s.type_of_control_sheet) }}{{ s.project?.project_name ? ' · ' + s.project.project_name : '' }}
                                            </option>
                                        </select>
                                        <div v-if="validationErrors.servicioId" class="invalid-feedback d-block mt-1">
                                            {{ validationErrors.servicioId }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Detalle del Servicio Seleccionado -->
                                <div v-if="servicioSeleccionado" class="mt-4 service-preview-box rounded-3 border p-3 p-md-4 bg-light bg-opacity-50">
                                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="badge bg-primary px-3 py-1 text-uppercase fw-bold fs-11">
                                                {{ tipoLargo(servicioSeleccionado.type_of_control_sheet) }}
                                            </span>
                                            <span
                                                class="badge rounded-pill px-2.5 py-1"
                                                :class="servicioSeleccionado.is_active == 1 || servicioSeleccionado.is_active === true ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'"
                                            >
                                                <i class="fas fa-circle me-1" style="font-size: 7px;"></i>
                                                {{ servicioSeleccionado.is_active == 1 || servicioSeleccionado.is_active === true ? 'Servicio Activo' : 'Inactivo' }}
                                            </span>
                                        </div>
                                        <span class="text-muted fs-11 font-monospace">
                                            UUID: {{ servicioSeleccionado.uuid?.slice(0, 13) }}…
                                        </span>
                                    </div>

                                    <div class="row g-3">
                                        <!-- Vehículo con estilo placa colombiana -->
                                        <div class="col-12 col-sm-6 col-lg-3">
                                            <div class="bg-white rounded-3 p-3 border h-100 shadow-sm">
                                                <small class="text-muted d-block fw-semibold mb-2 text-uppercase fs-10">Vehículo Asignado</small>
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="colombia-plate-badge shadow-sm">
                                                        <div class="plate-country">COLOMBIA</div>
                                                        <div class="plate-code">{{ servicioSeleccionado.vehicle_license_plate || 'SIN-PLACA' }}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Conductor Asignado -->
                                        <div class="col-12 col-sm-6 col-lg-3">
                                            <div class="bg-white rounded-3 p-3 border h-100 shadow-sm">
                                                <small class="text-muted d-block fw-semibold mb-1 text-uppercase fs-10">Conductor</small>
                                                <div class="d-flex align-items-center gap-2 mt-1">
                                                    <div class="avatar-circle bg-primary bg-opacity-10 text-primary fw-bold">
                                                        <i class="fad fa-user-tie"></i>
                                                    </div>
                                                    <span class="fw-bold text-dark fs-13 text-truncate" :title="conductorSeleccionadoNombre">
                                                        {{ conductorSeleccionadoNombre }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Proyecto -->
                                        <div class="col-12 col-sm-6 col-lg-3">
                                            <div class="bg-white rounded-3 p-3 border h-100 shadow-sm">
                                                <small class="text-muted d-block fw-semibold mb-1 text-uppercase fs-10">Proyecto Vinculado</small>
                                                <div class="fw-bold text-primary fs-13 mt-1 d-flex align-items-center gap-1.5">
                                                    <i class="fad fa-briefcase"></i>
                                                    <span>{{ servicioSeleccionado.project?.project_name || 'Sin proyecto asignado' }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Fecha del Servicio -->
                                        <div class="col-12 col-sm-6 col-lg-3">
                                            <div class="bg-white rounded-3 p-3 border h-100 shadow-sm">
                                                <small class="text-muted d-block fw-semibold mb-1 text-uppercase fs-10">Fecha de Operación</small>
                                                <div class="fw-bold text-dark fs-13 mt-1 d-flex align-items-center gap-1.5">
                                                    <i class="fad fa-calendar-star text-success"></i>
                                                    <span>{{ formatFecha(servicioSeleccionado.service_date) }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Recorridos / Rutas -->
                                        <div class="col-12">
                                            <div class="bg-white rounded-3 p-3 border shadow-sm">
                                                <div class="d-flex align-items-center justify-content-between mb-2">
                                                    <small class="text-muted fw-semibold text-uppercase fs-10">
                                                        Recorridos Programados ({{ recorridosServicio.length }})
                                                    </small>
                                                    <span v-if="servicioDias > 1" class="badge bg-info bg-opacity-10 text-info rounded-pill px-2.5 py-1 fs-11">
                                                        <i class="fad fa-calendar-alt me-1"></i> Multi-día: {{ servicioDias }} días ({{ servicioSeleccionado.start_date }} al {{ servicioSeleccionado.end_date }})
                                                    </span>
                                                </div>
                                                <p class="mb-0 fw-medium text-dark fs-13">
                                                    <i class="fad fa-route text-muted me-1.5"></i>
                                                    {{ recorridosTextoDe(servicioSeleccionado) || servicioSeleccionado.daily_route || 'Sin rutas registradas' }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Desglose Multi-día si aplica -->
                                    <div v-if="esMultiDia" class="mt-3 bg-white rounded-3 p-3 border shadow-sm">
                                        <h6 class="fw-bold text-dark mb-2 fs-12 text-uppercase tracking-wider">
                                            <i class="fad fa-calendar-check text-primary me-1"></i> Control de Planillas Diarias del Servicio
                                        </h6>
                                        <div class="row g-2">
                                            <div v-for="p in planillasDiarias" :key="p.uuid" class="col-12 col-md-6 col-lg-4">
                                                <div class="p-2 rounded border d-flex align-items-center justify-content-between bg-light">
                                                    <span class="fs-12 fw-semibold">{{ formatFecha(p.service_date) }}</span>
                                                    <span
                                                        class="badge rounded-pill px-2 py-0.5 fs-10"
                                                        :class="p.is_active == 1 || p.is_active === true ? 'bg-success text-white' : 'bg-secondary bg-opacity-25 text-muted'"
                                                    >
                                                        <i class="fas fa-circle me-1" style="font-size: 6px;"></i>
                                                        {{ p.is_active == 1 || p.is_active === true ? 'Pendiente / Abierto' : 'Cerrado' }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer de navegación -->
                            <div class="card-footer bg-white py-3 px-3 px-md-4 border-top text-end">
                                <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-semibold d-inline-flex align-items-center gap-2" @click="goStep2">
                                    <span>Continuar al Inicio de Servicio</span>
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ───────────────────────────────────────────────────
                         PASO 2: REGISTRO DE INICIO DE SERVICIO
                    ─────────────────────────────────────────────────── -->
                    <div v-if="currentStep === 2" class="fade-in">
                        <!-- Alerta guía -->
                        <div class="alert alert-info bg-info bg-opacity-10 border-0 shadow-sm d-flex align-items-center gap-3 mb-3 rounded-3 text-dark">
                            <div class="alert-icon-box bg-info bg-opacity-20 text-info rounded-circle p-2 fs-4">
                                <i class="fad fa-info-circle"></i>
                            </div>
                            <div>
                                <h6 class="alert-heading mb-0 fw-bold text-dark">Verificación de Salida</h6>
                                <p class="mb-0 fs-12 text-700">
                                    Comprueba cuidadosamente la hora de salida y el kilometraje antes de pulsar Iniciar. Estos datos quedarán certificados en la planilla.
                                </p>
                            </div>
                        </div>

                        <div class="card border-0 shadow-sm mb-3 fade-in-up">
                            <div class="card-header bg-light py-2 px-3 border-bottom">
                                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="fad fa-tachometer-alt text-primary"></i>
                                        <h6 class="mb-0 fw-semibold text-dark">Datos de Salida e Inicio</h6>
                                    </div>
                                    <span class="badge bg-primary bg-opacity-10 text-primary">
                                        <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
                                    </span>
                                </div>
                            </div>

                            <div class="card-body p-3 p-md-4">
                                <div class="row g-3">
                                    <!-- Hora de Inicio -->
                                    <div class="col-12 col-sm-6 col-md-3">
                                        <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">
                                             <i class="fad fa-clock text-primary me-1"></i> Hora de Salida
                                        </label>
                                        <input v-model="formData.start_time" type="time" step="60" class="form-control font-monospace" />
                                    </div>

                                    <!-- Kilometraje Inicial -->
                                    <div class="col-12 col-sm-6 col-md-3">
                                        <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">
                                            <i class="fad fa-tachometer-alt text-primary me-1"></i> Kilometraje Inicial
                                        </label>
                                        <div class="input-group">
                                            <input
                                                v-model="formData.starting_kilometer"
                                                type="number"
                                                placeholder="Ej. 125430"
                                                min="0"
                                                class="form-control font-monospace"
                                            />
                                            <span class="input-group-text bg-light text-muted fs-12">km</span>
                                        </div>
                                    </div>

                                    <!-- Nivel de Combustible -->
                                    <div class="col-12 col-sm-6 col-md-3">
                                        <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">
                                            <i class="fad fa-gas-pump text-primary me-1"></i> Combustible Inicial
                                        </label>
                                        <div class="input-group">
                                            <input
                                                v-model="formData.start_fuel_level"
                                                type="number"
                                                placeholder="100"
                                                min="0"
                                                class="form-control"
                                            />
                                            <span class="input-group-text bg-light text-muted fs-12">Gal</span>
                                        </div>
                                    </div>

                                    <!-- N.° Planilla / FUEC -->
                                    <div class="col-12 col-sm-6 col-md-3">
                                        <label class="form-label fw-medium text-700" style="font-size: 0.9rem;" for="fuec_uuid">
                                            <i class="fad fa-file-certificate text-primary me-1"></i> N.° Planilla / FUEC
                                        </label>
                                        <select
                                            id="fuec_uuid"
                                            ref="fuecSelect"
                                            v-model="formData.fuec_uuid"
                                            class="form-control select2-input w-100"
                                        >
                                            <option value="">Seleccione FUEC</option>
                                            <option v-for="item in fuecsCatalogo" :key="item.uuid" :value="item.uuid">
                                                {{ item.sheet_number || item.fuec_number }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Recorridos del Servicio si no están predefinidos -->
                        <div v-if="!tieneRutaDefinida" class="card border-0 shadow-sm mb-3 fade-in-up">
                            <div class="card-header bg-warning bg-opacity-10 py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fad fa-route text-warning"></i>
                                    <h6 class="mb-0 fw-semibold text-dark">Registro de Recorridos del Día</h6>
                                </div>
                                <button class="btn btn-outline-primary btn-sm rounded-pill fw-semibold px-3" @click="agregarRecorridoDia">
                                    <i class="fas fa-plus me-1"></i> Agregar Tramo
                                </button>
                            </div>

                            <div class="card-body p-3 p-md-4">
                                <div v-for="(r, idx) in recorridosDia" :key="idx" class="d-flex align-items-center gap-2 mb-2 py-1">
                                    <span class="badge bg-primary bg-opacity-10 text-primary rounded-circle fs-11 flex-shrink-0" style="width: 28px; height: 28px; display: grid; place-items: center;">
                                        {{ idx + 1 }}
                                    </span>
                                    <div class="row g-2 flex-fill">
                                        <div class="col-6 col-md-6">
                                            <input v-model="r.origin" type="text" class="form-control form-control-sm" placeholder="Origen del tramo" />
                                        </div>
                                        <div class="col-6 col-md-6">
                                            <input v-model="r.destination" type="text" class="form-control form-control-sm" placeholder="Destino del tramo" />
                                        </div>
                                    </div>
                                    <button class="btn btn-link text-danger p-1 flex-shrink-0" @click="quitarRecorridoDia(idx)" title="Quitar recorrido">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>

                                <div class="mt-3 text-end">
                                    <button class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold" :disabled="guardandoRecorridos" @click="guardarRecorridosDia">
                                        <i class="fas" :class="guardandoRecorridos ? 'fa-spinner fa-spin' : 'fa-save me-1'"></i>
                                        {{ guardandoRecorridos ? 'Guardando...' : 'Guardar Recorridos' }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Si la ruta ya está definida -->
                        <div v-else class="alert alert-success border-0 shadow-sm d-flex align-items-center gap-2 mb-3 rounded-3 py-2 px-3">
                            <i class="fad fa-check-circle fs-5 text-success"></i>
                            <span class="fs-12 fw-medium text-800">
                                <strong>Ruta Confirmada:</strong> {{ recorridosTextoDe(planillaActiva || servicioSeleccionado) }}
                            </span>
                        </div>

                        <!-- Inspección preoperacional obligatoria (una sola vez al día por vehículo) -->
                        <div class="card border-0 shadow-sm mb-3 fade-in-up">
                            <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fad fa-clipboard-check text-primary"></i>
                                    <h6 class="mb-0 fw-semibold text-dark">Inspección Preoperacional del Día</h6>
                                </div>
                                <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="verificarInspeccionDia(true)" :disabled="inspeccionDia.verificando">
                                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': inspeccionDia.verificando }"></i> Verificar
                                </button>
                            </div>
                            <div class="card-body p-3 p-md-4">
                                <div v-if="!planillaVehiculoUuid" class="alert alert-info border-0 shadow-sm d-flex align-items-center gap-2 mb-0 rounded-3 py-2 px-3">
                                    <i class="fad fa-info-circle fs-5 text-info"></i>
                                    <span class="fs-12 fw-medium">Vehículo externo sin registro en plataforma: la inspección se verifica manualmente antes de iniciar.</span>
                                </div>
                                <div v-else-if="inspeccionDia.verificando || !inspeccionDia.checked" class="alert alert-info border-0 shadow-sm d-flex align-items-center gap-2 mb-0 rounded-3 py-2 px-3">
                                    <span class="spinner-border spinner-border-sm text-primary"></span>
                                    <span class="fs-12 fw-medium">Verificando inspección del día…</span>
                                </div>
                                <div v-else-if="inspeccionDia.exists" class="alert alert-success border-0 shadow-sm d-flex align-items-center gap-2 mb-0 rounded-3 py-2 px-3">
                                    <i class="fad fa-check-circle fs-5 text-success"></i>
                                    <span class="fs-12 fw-medium">Inspección del día registrada ✓ ({{ inspeccionDia.fecha }}). Solo se exige una vez al día.</span>
                                </div>
                                <div v-else class="alert alert-warning border-0 shadow-sm mb-0 rounded-3 py-2 px-3">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="fad fa-exclamation-triangle fs-5 text-warning"></i>
                                        <span class="fs-12 fw-medium">Sin inspección de este vehículo el día de hoy ({{ hoyInspeccion || '—' }}). Debe registrarse una sola vez al día antes de iniciar.</span>
                                    </div>
                                    <div class="d-flex flex-wrap gap-2 mt-2">
                                        <router-link :to="inspeccionCrearLink" class="btn btn-warning btn-sm rounded-pill px-3 fw-semibold">
                                            <i class="fas fa-clipboard-check me-1"></i> Realizar inspección ahora
                                        </router-link>
                                        <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="verificarInspeccionDia(true)" :disabled="inspeccionDia.verificando">
                                            Verificar de nuevo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer acciones -->
                        <div class="d-flex align-items-center justify-content-between gap-2 mt-4">
                            <button class="btn btn-outline-secondary rounded-pill px-3 fw-semibold" @click="goStep(1)">
                                <i class="fas fa-arrow-left me-1"></i> Volver
                            </button>
                            <button class="btn btn-success rounded-pill px-4 shadow-sm fw-bold d-inline-flex align-items-center gap-2" :disabled="submitting" @click="iniciarServicio">
                                <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                                <i v-else class="fas fa-play-circle"></i>
                                <span>Iniciar Servicio Ahora</span>
                            </button>
                        </div>
                    </div>

                    <!-- ───────────────────────────────────────────────────
                         PASO 3: SERVICIO EN CURSO (EN RUTA)
                    ─────────────────────────────────────────────────── -->
                    <div v-if="currentStep === 3" class="fade-in">
                        <!-- Banner Cockpit Activo con Fondo de Card Falcon -->
                        <div class="card border-0 shadow-sm mb-4 overflow-hidden position-relative">
                            <!-- Fondo decorativo Falcon (bg-card) -->
                            <div class="bg-holder d-none d-lg-block bg-card"
                                style="background-image: url(/assets/img/icons/spot-illustrations/corner-4.png);" />
                            <div class="card-body p-3 p-md-4 position-relative">
                                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="badge bg-success bg-opacity-10 text-success px-3 py-1.5 fw-bold rounded-pill text-uppercase d-flex align-items-center gap-2 fs-11">
                                            <span class="pulse-indicator bg-success"></span>
                                            Servicio en Curso · En Ruta
                                        </span>
                                        <span class="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 fs-11 font-monospace">
                                            Salida: {{ formData.start_time }}
                                        </span>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="colombia-plate-badge shadow-sm">
                                            <div class="plate-country">COLOMBIA</div>
                                            <div class="plate-code">{{ vehiculoSeleccionadoPlaca }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Display del Cronómetro Central -->
                                <div class="row align-items-center my-3">
                                    <div class="col-12 col-md-6 text-center text-md-start">
                                        <small class="text-700 text-uppercase fw-semibold fs-11 tracking-wider d-block mb-1">
                                            Tiempo Transcurrido en Operación
                                        </small>
                                        <div class="odometer-timer font-monospace fw-bolder text-primary">
                                            {{ timerStr }}
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-6 mt-3 mt-md-0">
                                        <div class="row g-2">
                                            <div class="col-6">
                                                <div class="py-1 px-2">
                                                    <small class="text-700 d-block fs-11 text-uppercase fw-semibold mb-1">Km Inicial</small>
                                                    <span class="fw-bold fs-14 font-monospace text-dark">{{ Number(formData.starting_kilometer).toLocaleString('es-CO') }} km</span>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="py-1 px-2">
                                                    <small class="text-700 d-block fs-11 text-uppercase fw-semibold mb-1">Conductor</small>
                                                    <span class="fw-bold fs-13 text-truncate d-block text-dark" :title="conductorSeleccionadoNombre">{{ conductorSeleccionadoNombre }}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="py-1 px-2">
                                                    <small class="text-700 d-block fs-11 text-uppercase fw-semibold mb-1">Proyecto</small>
                                                    <span class="fw-bold fs-13 text-truncate d-block text-dark">{{ servicioSeleccionado?.project?.project_name || '—' }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Recorridos y Novedades -->
                        <div class="row g-3 mb-4">
                            <!-- Recorridos del día -->
                            <div class="col-12 col-lg-7">
                                <div class="card border-0 shadow-sm h-100 fade-in-up">
                                    <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fad fa-route text-primary"></i>
                                            <h6 class="mb-0 fw-semibold text-dark">Recorridos de la Planilla ({{ recorridosDia.length }})</h6>
                                        </div>
                                        <button class="btn btn-outline-primary btn-sm rounded-pill py-0.5 px-3 fs-11 fw-semibold" @click="agregarRecorridoDia">
                                            <i class="fas fa-plus me-1"></i> Agregar Tramo
                                        </button>
                                    </div>
                                    <div class="card-body p-3">
                                        <div v-if="!recorridosDia.length" class="alert alert-warning bg-warning bg-opacity-10 border-0 text-dark p-2.5 fs-12 mb-2 d-flex align-items-center gap-2 rounded-3">
                                            <i class="fad fa-exclamation-triangle text-warning"></i>
                                            <span>Sin recorridos detallados. Agregue los tramos ejecutados hoy.</span>
                                        </div>

                                        <div v-for="(r, idx) in recorridosDia" :key="idx" class="d-flex align-items-center gap-2 mb-2 py-1">
                                            <span class="badge bg-primary bg-opacity-10 text-primary rounded-circle fs-11 flex-shrink-0" style="width: 28px; height: 28px; display: grid; place-items: center;">{{ idx + 1 }}</span>
                                            <div class="row g-2 flex-fill">
                                                <div class="col-6 col-sm-6">
                                                    <input v-model="r.origin" type="text" class="form-control form-control-sm" placeholder="Origen del tramo" />
                                                </div>
                                                <div class="col-6 col-sm-6">
                                                    <input v-model="r.destination" type="text" class="form-control form-control-sm" placeholder="Destino del tramo" />
                                                </div>
                                            </div>
                                            <button class="btn btn-link text-danger p-1 flex-shrink-0" @click="quitarRecorridoDia(idx)" title="Eliminar">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>

                                        <div class="text-end mt-2">
                                            <button class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold" :disabled="guardandoRecorridos" @click="guardarRecorridosDia">
                                                <i class="fas" :class="guardandoRecorridos ? 'fa-spinner fa-spin' : 'fa-save me-1'"></i>
                                                {{ guardandoRecorridos ? 'Guardando...' : 'Guardar Recorridos' }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Novedades y Repuesto -->
                            <div class="col-12 col-lg-5">
                                <div class="card border-0 shadow-sm h-100 fade-in-up">
                                    <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fad fa-clipboard-notes text-primary"></i>
                                            <h6 class="mb-0 fw-semibold text-dark">Novedades y Soporte</h6>
                                        </div>
                                        <button class="btn btn-outline-secondary btn-sm rounded-pill py-0.5 px-3 fs-11" @click="openModalRepuesto">
                                            <i class="fad fa-sync-alt me-1"></i> Planilla Repuesto
                                        </button>
                                    </div>
                                    <div class="card-body p-3 d-flex flex-column justify-content-between">
                                        <div>
                                            <label class="form-label fw-medium text-muted small mb-1">
                                                Registrar Novedad en Ruta (opcional)
                                            </label>
                                            <textarea
                                                v-model="formData.route_novelty"
                                                rows="3"
                                                class="form-control fs-13"
                                                placeholder="Desvíos, congestión, demoras, incidentes en carretera..."
                                            ></textarea>
                                        </div>
                                        <div class="mt-3 p-2.5 rounded-3 bg-primary bg-opacity-10 text-primary fs-11 border border-primary border-opacity-10">
                                            <i class="fad fa-info-circle me-1"></i> Si experimentas daños físicos en la planilla de papel, puedes solicitar una planilla de repuesto oficial a despacho.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Botón para Finalizar Servicio -->
                        <div class="card border-0 shadow-sm bg-white p-3 rounded-3 text-end">
                            <button class="btn btn-danger rounded-pill px-4 shadow-sm fw-bold d-inline-flex align-items-center gap-2" @click="goStep4">
                                <i class="fas fa-flag-checkered"></i>
                                <span>Finalizar Servicio y Registrar Cierre</span>
                            </button>
                        </div>
                    </div>

                    <!-- ───────────────────────────────────────────────────
                         PASO 4: FINALIZACIÓN Y DATOS DE CIERRE
                    ─────────────────────────────────────────────────── -->
                    <div v-if="currentStep === 4" class="fade-in">
                        <div class="alert alert-warning bg-warning bg-opacity-10 border-0 text-dark shadow-sm d-flex align-items-center gap-3 mb-3 rounded-3">
                            <div class="alert-icon-box bg-warning bg-opacity-20 text-warning rounded-circle p-2 fs-4">
                                <i class="fad fa-exclamation-circle"></i>
                            </div>
                            <div>
                                <h6 class="alert-heading mb-0 fw-bold text-dark">Diligenciamiento de Cierre</h6>
                                <p class="mb-0 fs-12 text-700">
                                    La hora de fin y el kilometraje final son estrictamente obligatorios para calcular la liquidación del recorrido.
                                </p>
                            </div>
                        </div>

                        <div v-if="rutasMulti" class="mb-3">
                            <div class="alert alert-info bg-info bg-opacity-10 text-dark border-0 shadow-sm d-flex align-items-center gap-2 mb-3 rounded-3 py-2 px-3">
                                <i class="fad fa-route text-info fs-5"></i>
                                <span class="fs-12">
                                    Este servicio tiene <strong>{{ recorridosPlanillaActiva.length }} recorridos</strong>. Ciérrelos de a uno: seleccione el recorrido que va a certificar, diligencie su cierre y pase a firmarlo.
                                </span>
                            </div>

                            <div v-if="todosRecorridosCerrados" class="alert alert-success bg-success bg-opacity-10 text-dark border-0 shadow-sm d-flex align-items-center gap-2 mb-3 rounded-3 py-2 px-3">
                                <i class="fad fa-check-circle text-success fs-5"></i>
                                <span class="fs-12">
                                    Todos los recorridos del día están cerrados y firmados individualmente. Continúe a <strong>Firmas y Certificación</strong> para legalizar la planilla completa.
                                </span>
                            </div>

                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <button
                                    v-for="(r, i) in recorridosPlanillaActiva"
                                    :key="i"
                                    type="button"
                                    class="btn rounded-pill px-3 d-inline-flex align-items-center gap-2 shadow-sm"
                                    :class="recorridoEstaCerrado(i) ? 'btn-success' : (recorridoSeleccionado === i ? 'btn-primary' : 'btn-outline-primary')"
                                    :disabled="recorridoEstaCerrado(i)"
                                    @click="seleccionarRecorrido(i)"
                                >
                                    <i :class="recorridoEstaCerrado(i) ? 'fas fa-check-circle' : 'fas fa-route'"></i>
                                    <span class="fw-semibold">{{ i + 1 }}. {{ r.origin || '—' }} → {{ r.destination || '—' }}</span>
                                    <span class="badge bg-dark bg-opacity-10 fs-10" :class="recorridoEstaCerrado(i) ? 'text-white' : 'text-dark'">
                                        {{ recorridoEstaCerrado(i) ? 'Cerrado ✓' : 'Por cerrar' }}
                                    </span>
                                </button>
                            </div>

                            <div v-if="!todosRecorridosCerrados" class="card border-0 shadow-sm fade-in-up" :key="recorridoSeleccionado">
                                <div class="card-header bg-light py-2 px-3 border-bottom">
                                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fad fa-flag-checkered text-primary"></i>
                                            <h6 class="mb-0 fw-semibold text-dark">Cierre — Recorrido {{ recorridoSeleccionado + 1 }}</h6>
                                        </div>
                                        <span class="badge bg-primary bg-opacity-10 text-primary">
                                            {{ recorridosPlanillaActiva[recorridoSeleccionado]?.origin || '—' }} → {{ recorridosPlanillaActiva[recorridoSeleccionado]?.destination || '—' }}
                                        </span>
                                    </div>
                                </div>
                                <div class="card-body p-3 p-md-4">
                                    <div class="row g-3">
                                        <div class="col-12 col-sm-6 col-md-3">
                                            <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">
                                                <i class="fad fa-clock text-primary me-1"></i> Hora de Finalización
                                            </label>
                                            <input v-model="cierresRecorridos[recorridoSeleccionado].end_time" type="time" step="60" class="form-control font-monospace" />
                                        </div>

                                        <div class="col-12 col-sm-6 col-md-3">
                                            <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">
                                                <i class="fad fa-tachometer-alt text-primary me-1"></i> Kilometraje Final
                                            </label>
                                            <div class="input-group">
                                                <input
                                                    v-model="cierresRecorridos[recorridoSeleccionado].ending_kilometer"
                                                    type="number"
                                                    placeholder="Ej. 125680"
                                                    min="0"
                                                    class="form-control font-monospace"
                                                />
                                                <span class="input-group-text bg-light text-muted fs-12">km</span>
                                            </div>
                                        </div>

                                        <div class="col-12 col-sm-6 col-md-3">
                                            <label class="form-label fw-medium text-muted" style="font-size: 0.9rem;">
                                                <i class="fad fa-road text-success me-1"></i> Recorrido Estimado
                                            </label>
                                            <div class="p-2 rounded bg-light border text-center h-75 d-flex align-items-center justify-content-center">
                                                <span class="fw-bold fs-14 text-primary font-monospace">
                                                    {{ Math.max(0, (Number(cierresRecorridos[recorridoSeleccionado].ending_kilometer || 0) - Number(formData.starting_kilometer || 0))) }} km
                                                </span>
                                            </div>
                                        </div>

                                        <div class="col-12 col-sm-6 col-md-3">
                                            <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">
                                                <i class="fad fa-ticket-alt text-primary me-1"></i> N.° de Peajes
                                            </label>
                                            <input v-model="cierresRecorridos[recorridoSeleccionado].number_of_tolls" type="number" placeholder="0" min="0" max="50" class="form-control" />
                                        </div>

                                        <div class="col-12 col-sm-6 col-md-4">
                                            <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">
                                                <i class="fad fa-dollar-sign text-success me-1"></i> Valor Total Peajes
                                            </label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-light text-muted">$</span>
                                                <input v-model="cierresRecorridos[recorridoSeleccionado].total_toll_value" type="number" placeholder="0" min="0" class="form-control" />
                                            </div>
                                        </div>

                                        <div class="col-12 col-md-8">
                                            <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">
                                                <i class="fad fa-comment-alt-lines text-primary me-1"></i> Novedades al Cierre
                                            </label>
                                            <input v-model="cierresRecorridos[recorridoSeleccionado].end_novelty" type="text" class="form-control" placeholder="Sin novedad / reporte de entrega a satisfacción..." />
                                        </div>
                                    </div>

                                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-3 border-top">
                                        <span class="fs-12 text-muted">
                                            <i class="fad fa-info-circle me-1"></i>
                                            Al guardar se certificará <strong>solo este recorrido</strong>. Los pendientes pueden cerrarse después; la planilla se legaliza cuando todos estén cerrados.
                                        </span>
                                        <button class="btn btn-success rounded-pill px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-2" :disabled="submitting" @click="goStep5">
                                            <i class="fas fa-file-signature"></i>
                                            <span>Firmar y Cerrar Recorrido {{ recorridoSeleccionado + 1 }}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else class="card border-0 shadow-sm mb-3 fade-in-up">
                            <div class="card-header bg-light py-2 px-3 border-bottom">
                                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="fad fa-flag-checkered text-primary"></i>
                                        <h6 class="mb-0 fw-semibold text-dark">Parámetros de Llegada y Gastos</h6>
                                    </div>
                                    <span class="badge bg-primary bg-opacity-10 text-primary">
                                        <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
                                    </span>
                                </div>
                            </div>

                            <div class="card-body p-3 p-md-4">
                                <div class="row g-3">
                                    <!-- Hora de Finalización -->
                                    <div class="col-12 col-sm-6 col-md-3">
                                        <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">
                                            <i class="fad fa-clock text-primary me-1"></i> Hora de Finalización
                                        </label>
                                        <input v-model="formData.end_time" type="time" step="60" class="form-control font-monospace" />
                                    </div>

                                    <!-- Kilometraje Final -->
                                    <div class="col-12 col-sm-6 col-md-3">
                                        <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">
                                            <i class="fad fa-tachometer-alt text-primary me-1"></i> Kilometraje Final
                                        </label>
                                        <div class="input-group">
                                            <input
                                                v-model="formData.ending_kilometer"
                                                type="number"
                                                placeholder="Ej. 125680"
                                                min="0"
                                                class="form-control font-monospace"
                                            />
                                            <span class="input-group-text bg-light text-muted fs-12">km</span>
                                        </div>
                                    </div>

                                    <!-- Cálculo de Km en Tiempo Real -->
                                    <div class="col-12 col-sm-6 col-md-3">
                                        <label class="form-label fw-medium text-muted" style="font-size: 0.9rem;">
                                            <i class="fad fa-road text-success me-1"></i> Recorrido Estimado
                                        </label>
                                        <div class="p-2 rounded bg-light border text-center h-75 d-flex align-items-center justify-content-center">
                                            <span class="fw-bold fs-14 text-primary font-monospace">
                                                {{ Math.max(0, (Number(formData.ending_kilometer || 0) - Number(formData.starting_kilometer || 0))) }} km
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Peajes -->
                                    <div class="col-12 col-sm-6 col-md-3">
                                        <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">
                                            <i class="fad fa-ticket-alt text-primary me-1"></i> N.° de Peajes
                                        </label>
                                        <input v-model="formData.number_of_tolls" type="number" placeholder="0" min="0" max="50" class="form-control" />
                                    </div>

                                    <!-- Valor Total Peajes -->
                                    <div class="col-12 col-sm-6 col-md-4">
                                        <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">
                                            <i class="fad fa-dollar-sign text-success me-1"></i> Valor Total Peajes
                                        </label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-light text-muted">$</span>
                                            <input v-model="formData.total_toll_value" type="number" placeholder="0" min="0" class="form-control" />
                                        </div>
                                    </div>

                                    <!-- Novedades de Cierre -->
                                    <div class="col-12 col-md-8">
                                        <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">
                                            <i class="fad fa-comment-alt-lines text-primary me-1"></i> Novedades al Cierre
                                        </label>
                                        <input v-model="formData.end_novelty" type="text" class="form-control" placeholder="Sin novedad / reporte de entrega a satisfacción..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex align-items-center justify-content-between gap-2 mt-4">
                            <button class="btn btn-outline-secondary rounded-pill px-3 fw-semibold" @click="goStep(3)">
                                <i class="fas fa-arrow-left me-1"></i> Volver a En Ruta
                            </button>
                            <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-inline-flex align-items-center gap-2" @click="goStep5">
                                <span>Continuar a Firmas y Certificación</span>
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- ───────────────────────────────────────────────────
                         PASO 5: RESUMEN Y FIRMAS DIGITALES
                    ─────────────────────────────────────────────────── -->
                    <div v-if="currentStep === 5" class="fade-in">
                        <!-- KPI Card Resumen -->
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fad fa-analytics text-primary"></i>
                                    <h6 class="mb-0 fw-semibold text-dark">Resumen de Liquidación del Servicio</h6>
                                </div>
                                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1">
                                    Completado: {{ resumen.duracion }}
                                </span>
                            </div>
                            <div class="card-body p-3 p-md-4">
                                <div class="row g-3">
                                    <div class="col-6 col-md-3">
                                        <div class="bg-light p-3 rounded-3 border text-center">
                                            <small class="text-700 d-block text-uppercase fs-10 fw-semibold">Distancia Recorrida</small>
                                            <span class="fw-bolder fs-4 text-primary font-monospace">{{ resumen.kmTotal }}</span>
                                            <span class="text-700 fs-11 ms-1">km</span>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div class="bg-light p-3 rounded-3 border text-center">
                                            <small class="text-700 d-block text-uppercase fs-10 fw-semibold">Tiempo Operativo</small>
                                            <span class="fw-bolder fs-4 text-success font-monospace">{{ resumen.duracion }}</span>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div class="bg-light p-3 rounded-3 border text-center">
                                            <small class="text-700 d-block text-uppercase fs-10 fw-semibold">Odómetro Salida → Fin</small>
                                            <span class="fw-bold fs-13 font-monospace d-block text-truncate text-dark">
                                                {{ formData.starting_kilometer }} → {{ rutasMulti ? (cierreDe(recorridosPlanillaActiva.length - 1).ending_kilometer || formData.ending_kilometer) : formData.ending_kilometer }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div class="bg-light p-3 rounded-3 border text-center">
                                            <small class="text-700 d-block text-uppercase fs-10 fw-semibold">Vehículo</small>
                                            <span class="fw-bold fs-14 text-dark d-block text-truncate">{{ vehiculoSeleccionadoPlaca }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Firmas Digitales -->
                        <div v-if="rutasMulti" class="row g-3 mb-4">
                            <div v-if="todosRecorridosCerrados" class="col-12">
                                <div class="alert alert-success bg-success bg-opacity-10 text-dark border-0 shadow-sm d-flex align-items-center gap-2 mb-3 rounded-3 py-2 px-3">
                                    <i class="fad fa-check-circle text-success fs-5"></i>
                                    <span class="fs-12">
                                        Todos los recorridos del día quedaron cerrados y firmados individualmente. Solo resta <strong>certificar la planilla</strong> con el botón verde.
                                    </span>
                                </div>
                            </div>
                            <div v-else class="col-12">
                                <div class="alert alert-warning bg-warning bg-opacity-10 text-dark border-0 shadow-sm d-flex align-items-center gap-2 mb-3 rounded-3 py-2 px-3">
                                    <i class="fad fa-file-signature text-warning fs-5"></i>
                                    <span class="fs-12">
                                        Va a firmar el cierre del <strong>recorrido {{ recorridoSeleccionado + 1 }}</strong>
                                        ({{ recorridosPlanillaActiva[recorridoSeleccionado]?.origin || '—' }} → {{ recorridosPlanillaActiva[recorridoSeleccionado]?.destination || '—' }}).
                                        Estas firmas certifican únicamente ese recorrido; los pendientes se firmarán enseguida.
                                    </span>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12 col-xl-6">
                                        <FirmaPad
                                            rol="funcionario"
                                            titulo="Firma del Funcionario / Cliente"
                                            placeholder-nombre="Nombre de quien recibe el servicio"
                                            v-model:nombre="firmasRecorridos[recorridoSeleccionado].funcionarioNombre"
                                            :ref="(el) => registrarPadRecorrido(recorridoSeleccionado, 'funcionario', el)"
                                            accent="#2c7be5"
                                        />
                                    </div>
                                    <div class="col-12 col-xl-6">
                                        <FirmaPad
                                            rol="conductor"
                                            titulo="Firma del Conductor"
                                            placeholder-nombre="Nombre completo del conductor"
                                            v-model:nombre="firmasRecorridos[recorridoSeleccionado].conductorNombre"
                                            :ref="(el) => registrarPadRecorrido(recorridoSeleccionado, 'conductor', el)"
                                            accent="#00a651"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else class="row g-3 mb-4">
                            <!-- Firma Funcionario -->
                            <div class="col-12 col-md-6">
                                <div class="card border-0 shadow-sm h-100 signature-card">
                                    <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fad fa-user-check text-primary"></i>
                                            <h6 class="mb-0 fw-semibold text-dark">Firma del Funcionario / Cliente</h6>
                                        </div>
                                        <span class="badge bg-primary bg-opacity-10 text-primary">Requerido</span>
                                    </div>
                                    <div class="card-body p-3">
                                        <div class="mb-3">
                                            <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">Nombre Completo</label>
                                            <input v-model="firma.funcionarioNombre" type="text" class="form-control" placeholder="Nombre de quien recibe el servicio" />
                                        </div>

                                        <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">Trazo de Firma</label>
                                        <div class="signature-pad-wrapper rounded border bg-white position-relative">
                                            <canvas ref="canvasFuncionarioRef" width="500" height="150" class="w-100 signature-canvas"></canvas>
                                            <div v-if="firmaFuncionarioVacia" class="signature-hint position-absolute top-50 start-50 translate-middle text-muted fs-12 pointer-events-none">
                                                <i class="fad fa-pen-alt me-1"></i> Firme aquí (táctil o mouse)
                                            </div>
                                        </div>
                                        <div class="text-end mt-2">
                                            <button type="button" class="btn btn-link text-danger btn-sm p-0 fs-11 text-decoration-none" @click="clearFirma('funcionario')">
                                                <i class="fas fa-trash-alt me-1"></i> Borrar y reintentar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Firma Conductor -->
                            <div class="col-12 col-md-6">
                                <div class="card border-0 shadow-sm h-100 signature-card">
                                    <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fad fa-steering-wheel text-success"></i>
                                            <h6 class="mb-0 fw-semibold text-dark">Firma del Conductor</h6>
                                        </div>
                                        <span class="badge bg-success bg-opacity-10 text-success">Requerido</span>
                                    </div>
                                    <div class="card-body p-3">
                                        <div class="mb-3">
                                            <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">Nombre del Conductor</label>
                                            <input v-model="firma.conductorNombre" type="text" class="form-control" placeholder="Nombre completo del conductor" />
                                        </div>

                                        <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">Trazo de Firma</label>
                                        <div class="signature-pad-wrapper rounded border bg-white position-relative">
                                            <canvas ref="canvasConductorRef" width="500" height="150" class="w-100 signature-canvas"></canvas>
                                            <div v-if="firmaConductorVacia" class="signature-hint position-absolute top-50 start-50 translate-middle text-muted fs-12 pointer-events-none">
                                                <i class="fad fa-pen-alt me-1"></i> Firme aquí (táctil o mouse)
                                            </div>
                                        </div>
                                        <div class="text-end mt-2">
                                            <button type="button" class="btn btn-link text-danger btn-sm p-0 fs-11 text-decoration-none" @click="clearFirma('conductor')">
                                                <i class="fas fa-trash-alt me-1"></i> Borrar y reintentar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Indicador si es multi-día -->
                        <div v-if="esMultiDia" class="alert alert-info bg-info bg-opacity-10 text-dark border-0 shadow-sm d-flex align-items-center gap-2 mb-3 rounded-3 py-2 px-3">
                            <i class="fad fa-calendar-alt text-info fs-5"></i>
                            <span class="fs-12">
                                Guardando planilla del día <strong>{{ planillaActiva ? formatFecha(planillaActiva.service_date) : '—' }}</strong>. Al completar, avanzará automáticamente a la siguiente planilla diaria pendiente.
                            </span>
                        </div>

                        <!-- Acciones -->
                        <div class="d-flex align-items-center justify-content-between gap-2 mt-4">
                            <button class="btn btn-outline-secondary rounded-pill px-3 fw-semibold" @click="goStep(4)">
                                <i class="fas fa-arrow-left me-1"></i> Volver a Métricas
                            </button>
                            <button class="btn btn-success rounded-pill px-4 shadow-sm fw-bold d-inline-flex align-items-center gap-2" :disabled="submitting" @click="rutasMulti ? (todosRecorridosCerrados ? guardarPlanilla : guardarCierreRecorrido) : guardarPlanilla">
                                <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                                <i v-else-if="rutasMulti" :class="todosRecorridosCerrados ? 'fas fa-check-circle' : 'fas fa-file-signature'"></i>
                                <i v-else class="fas fa-check-circle"></i>
                                <span v-if="rutasMulti && !todosRecorridosCerrados">Guardar Cierre del Recorrido {{ recorridoSeleccionado + 1 }}</span>
                                <span v-else>{{ esMultiDia ? `Guardar Planilla del Día (${planillaActiva ? formatFecha(planillaActiva.service_date) : ''})` : 'Guardar y Certificar Planilla' }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- ───────────────────────────────────────────────────
                         PASO 6: FINALIZADO CON ÉXITO
                    ─────────────────────────────────────────────────── -->
                    <div v-if="currentStep === 6" class="fade-in">
                        <div class="card border-0 shadow-sm text-center py-5 px-3 rounded-4">
                            <div class="avatar-shape bg-success bg-opacity-10 text-success rounded-circle p-4 mx-auto mb-3" style="width: 80px; height: 80px; display: grid; place-items: center;">
                                <i class="fad fa-badge-check fs-1"></i>
                            </div>
                            <h4 class="fw-bold text-900 mb-1">¡Planilla Registrada con Éxito!</h4>
                            <p class="text-muted fs-13 mb-4 mx-auto" style="max-width: 480px;">
                                La planilla de control de prestación de servicios ha sido legalizada, firmada y almacenada correctamente en el sistema.
                            </p>

                            <div class="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                                <button class="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm" @click="reiniciar">
                                    <i class="fas fa-plus me-1.5"></i> Registrar Nueva Planilla
                                </button>
                                <router-link to="/planilla-de-control-de-prestacion-servicios" class="btn btn-outline-secondary rounded-pill px-4 fw-semibold">
                                    <i class="fas fa-list me-1.5"></i> Ver Listado de Planillas
                                </router-link>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Skeleton / Loader -->
                <div v-else class="d-flex flex-column align-items-center justify-content-center py-5" style="min-height: 400px;">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <span class="text-muted fw-semibold fs-13">Cargando datos del servicio...</span>
                </div>

            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════
             MODAL: SOLICITUD DE PLANILLA DE REPUESTO
        ═══════════════════════════════════════════════════════════ -->
        <teleport to="body">
            <!-- Modal Formulario -->
            <div v-if="modal.repuesto" class="modal-backdrop-custom d-flex align-items-center justify-content-center" @click.self="modal.repuesto = false">
                <div class="modal-dialog-custom bg-white rounded-3 shadow-lg border p-4 w-100 fade-in" style="max-width: 520px;">
                    <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fad fa-sync-alt text-primary fs-5"></i>
                            <h6 class="modal-title mb-0 fw-semibold text-dark">Solicitud de Planilla de Repuesto</h6>
                        </div>
                        <button type="button" class="btn-close" @click="modal.repuesto = false"></button>
                    </div>

                    <div class="row g-3 mb-4">
                        <div class="col-12">
                            <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">Motivo de la Solicitud</label>
                            <select v-model="repuesto.motivo" class="form-select">
                                <option value="">— Seleccione el motivo —</option>
                                <option>Planilla original dañada (agua / rotura)</option>
                                <option>Planilla extraviada en ruta</option>
                                <option>Error de diligenciamiento</option>
                                <option>Planilla no entregada por despacho</option>
                                <option>Otro motivo</option>
                            </select>
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">Descripción Detallada</label>
                            <textarea v-model="repuesto.descripcion" rows="3" class="form-control fs-13" placeholder="Explique brevemente lo ocurrido..."></textarea>
                        </div>

                        <div class="col-12 col-sm-6">
                            <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">Solicitado por</label>
                            <input v-model="repuesto.solicitante" type="text" class="form-control" placeholder="Nombre completo" />
                        </div>

                        <div class="col-12 col-sm-6">
                            <label class="form-label fw-medium text-700" style="font-size: 0.9rem;">Hora de Solicitud</label>
                            <input :value="repuesto.hora" type="time" readonly class="form-control bg-light" />
                        </div>
                    </div>

                    <div class="d-flex align-items-center justify-content-end gap-2">
                        <button class="btn btn-outline-secondary btn-sm px-3 rounded-pill" @click="modal.repuesto = false">Cancelar</button>
                        <button class="btn btn-primary btn-sm px-4 fw-semibold rounded-pill" @click="enviarRepuesto">
                            <i class="fad fa-paper-plane me-1"></i> Enviar Solicitud a Despacho
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal Éxito Envío -->
            <div v-if="modal.repuestoOk" class="modal-backdrop-custom d-flex align-items-center justify-content-center" @click.self="modal.repuestoOk = false">
                <div class="modal-dialog-custom bg-white rounded-4 shadow-lg border p-4 text-center w-100 fade-in" style="max-width: 440px;">
                    <div class="icon-shape bg-success bg-opacity-10 text-success rounded-circle p-3 mx-auto mb-3" style="width: 60px; height: 60px; display: grid; place-items: center;">
                        <i class="fad fa-check-circle fs-3"></i>
                    </div>
                    <h5 class="fw-bold text-900 mb-1">Solicitud Enviada a Despacho</h5>
                    <p class="text-muted fs-13 mb-3">
                        Se ha generado el requerimiento formal para la asignación de una planilla de repuesto.
                    </p>
                    <div class="badge bg-light text-dark border p-2 mb-4 font-monospace fs-12 d-inline-block">
                        Radicado: {{ repuesto.ref }}
                    </div>
                    <div>
                        <button class="btn btn-primary w-100 fw-semibold rounded-pill" @click="modal.repuestoOk = false">Entendido</button>
                    </div>
                </div>
            </div>
        </teleport>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from '@/utils/toast.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import { useServiceDeliveryControlSheetStore } from '../store/serviceDeliveryControlSheet.store.js';
import serviceDeliveryControlSheetService from '../services/serviceDeliveryControlSheet.service.js';
import vehicleInspectionsService from '../../vehicleInspections/services/vehicleInspections.service.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';
import FirmaPad from '../components/FirmaPad.vue';

// --- STORES Y ROUTER ---
const route = useRoute();
const router = useRouter();
const store = useServiceDeliveryControlSheetStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

// --- ESTADOS ---
const isSuperAdmin = computed(() => permissionsStore.roles?.includes('SUPERADMIN'));
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});
const currentStep = ref(1);

const breadcrumbs = [
    { label: 'Hojas de Control', to: '/planilla-de-control-de-prestacion-servicios' },
    { label: 'Control Operativo', active: true }
];

const steps = [
    { n: 1, label: 'Selección', icon: 'fad fa-search' },
    { n: 2, label: 'Inicio', icon: 'fad fa-play-circle' },
    { n: 3, label: 'En Ruta', icon: 'fad fa-route' },
    { n: 4, label: 'Finalizar', icon: 'fad fa-flag-checkered' },
    { n: 5, label: 'Firmas', icon: 'fad fa-file-signature' },
];

const formData = reactive({
    servicioId: '',
    start_time: '',
    starting_kilometer: '',
    start_fuel_level: '',
    fuec_uuid: '',
    route_novelty: '',
    end_time: '',
    ending_kilometer: '',
    number_of_tolls: 0,
    total_toll_value: 0,
    end_novelty: '',
});

const firma = reactive({
    funcionarioNombre: '',
    conductorNombre: '',
});

// Cierre y firmas por recorrido: solo se activan cuando la planilla tiene
// más de un recorrido en el día; con un solo recorrido se mantiene el
// flujo normal (diligenciamiento único, firmas únicas).
const rutasMulti = computed(() => recorridosPlanillaActiva.value.length > 1);
const cierresRecorridos = ref([]);
const firmasRecorridos = ref([]);
const firmaPadsRecorridos = ref({});

const cierreDe = (i) => cierresRecorridos.value[i] || {};

// Cierre parcial: cada recorrido se puede cerrar y firmar por separado.
// Los recorridos ya cerrados se marcan con ✓ y la planilla queda en curso
// hasta certificar el último, momento en el que se completa el cierre total.
const cerradosRecorridos = ref([]);
const recorridoSeleccionado = ref(0);

const recorridoEstaCerrado = (i) => !!cerradosRecorridos.value[i];

const pendientesRecorridos = computed(() => {
    const rutas = recorridosPlanillaActiva.value;
    return rutas.map((_, i) => i).filter(i => !recorridoEstaCerrado(i));
});

const todosRecorridosCerrados = computed(() => {
    const rutas = recorridosPlanillaActiva.value;
    return rutas.length > 0 && cerradosRecorridos.value.length === rutas.length && cerradosRecorridos.value.every(Boolean);
});

const seleccionarRecorrido = (i) => {
    if (recorridoEstaCerrado(i)) return;
    recorridoSeleccionado.value = i;
};

const inicializarCierresPorRecorrido = () => {
    const rutas = recorridosPlanillaActiva.value;
    const ahora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
    cierresRecorridos.value = rutas.map(r => ({
        end_time: r.end_time ? String(r.end_time).substring(0, 5) : '',
        ending_kilometer: r.ending_kilometer ?? '',
        number_of_tolls: r.number_of_tolls || 0,
        total_toll_value: r.total_toll_value || 0,
        end_novelty: r.end_novelty || '',
    }));
    cerradosRecorridos.value = rutas.map(r => !!r.end_time);
    firmasRecorridos.value = rutas.map(() => ({
        funcionarioNombre: servicioSeleccionado.value?.official_name_and_surname || userStore.user?.full_name || '',
        conductorNombre: conductorSeleccionadoNombre.value,
    }));
    firmaPadsRecorridos.value = {};
    const primerPendiente = cerradosRecorridos.value.findIndex(c => !c);
    recorridoSeleccionado.value = primerPendiente === -1 ? (rutas.length - 1) : Math.max(primerPendiente, 0);
    if (rutasMulti.value && rutas.length > 1) {
        cierresRecorridos.value.forEach((c, i) => {
            if (!c.end_time && !cerradosRecorridos.value[i]) c.end_time = ahora;
        });
    }
};

const registrarPadRecorrido = (i, rol, el) => {
    if (el) firmaPadsRecorridos.value[`${i}-${rol}`] = el;
};

const modal = reactive({
    repuesto: false,
    repuestoOk: false,
});

const repuesto = reactive({
    motivo: '',
    descripcion: '',
    solicitante: '',
    hora: '',
    ref: '',
});

const serviciosCatalogo = ref([]);
const fuecsCatalogo = ref([]);
const proyectosList = ref([]);
const proyectoFiltro = ref('');

// --- COMPUTADOS ---
const servicioSeleccionado = computed(() => {
    return serviciosCatalogo.value.find(s => s.uuid === formData.servicioId) || null;
});

const serviciosFiltrados = computed(() => {
    if (!proyectoFiltro.value) return serviciosCatalogo.value;
    return serviciosCatalogo.value.filter(s => (s.project_uuid || s.project?.uuid) === proyectoFiltro.value);
});

const tipoCorto = (t) => ({
    DIRECTO_CON_LA_EMPRESA: 'Directo',
    SUBCONTRATADO: 'Subcontratado',
    CON_VEHICULO_CONTRATADO: 'Veh. contratado',
    EXTERNO_PLATAFORMA: 'Externo',
}[t] || t || '—');

const tipoLargo = (t) => ({
    DIRECTO_CON_LA_EMPRESA: 'Directo con la empresa',
    SUBCONTRATADO: 'Subcontratado',
    CON_VEHICULO_CONTRATADO: 'Con vehículo contratado',
    EXTERNO_PLATAFORMA: 'Vehículo externo de plataforma',
}[t] || t || '—');

const recorridosTextoDe = (s) => {
    if (!s) return '';
    if (Array.isArray(s.routes) && s.routes.length) {
        return s.routes.map(r => `${r.origin || ''} - ${r.destination || ''}`.trim().replace(/^- | -$/g, '')).filter(Boolean).join(' · ');
    }
    return s.daily_route || '';
};

const recorridosServicio = computed(() => servicioSeleccionado.value?.routes || []);
const recorridosPlanillaActiva = computed(() => planillaActiva.value?.routes || []);

// Vehículo y conductor de la planilla activa (para la inspección del día).
const planillaVehiculoUuid = computed(() =>
    planillaActiva.value?.internal_control?.vehicle_uuid
    || servicioSeleccionado.value?.internal_control?.vehicle_uuid
    || ''
);
const planillaConductorUuid = computed(() =>
    planillaActiva.value?.internal_control?.third_party_uuid
    || servicioSeleccionado.value?.internal_control?.third_party_uuid
    || userStore.uuid_driver
    || userStore.third_party_uuid
    || ''
);

// Inspección preoperacional: obligatoria una sola vez al día (fecha real de operación).
// Se valida contra la fecha de HOY, no contra la fecha del servicio, para no
// volver a exigirla cuando el conductor ya la registró el mismo día calendario.
const inspeccionDia = ref({ checked: false, exists: false, uuid: null, fecha: '', verificando: false });

const obtenerFechaHoy = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const hoyInspeccion = computed(obtenerFechaHoy);

const verificarInspeccionDia = async (manual = false) => {
    const vUuid = planillaVehiculoUuid.value;
    if (!vUuid) {
        inspeccionDia.value = { checked: true, exists: null, uuid: null, fecha: hoyInspeccion.value, verificando: false };
        return true;
    }
    inspeccionDia.value.verificando = true;
    try {
        const res = await vehicleInspectionsService.checkToday(vUuid, hoyInspeccion.value, userStore.company_uuid);
        inspeccionDia.value = {
            checked: true,
            exists: !!res.exists,
            uuid: res.inspection?.uuid || null,
            fecha: hoyInspeccion.value,
            verificando: false,
        };
        return !!res.exists;
    } catch (e) {
        inspeccionDia.value = { checked: false, exists: false, uuid: null, fecha: '', verificando: false };
        if (manual) toast('Error', 'No se pudo verificar la inspección', 'error');
        return false;
    }
};

const inspeccionCrearLink = computed(() => {
    const q = new URLSearchParams({
        vehicle_uuid: planillaVehiculoUuid.value || '',
        inspection_date: hoyInspeccion.value || '',
        driver_uuid: planillaConductorUuid.value || '',
        return_to: '/planilla-de-control-de-prestacion-servicios/control-de-servicios',
    });
    return `/inspeccion-vehiculos/crear?${q.toString()}`;
});

// Indica si la planilla activa ya tiene ruta definida
const tieneRutaDefinida = computed(() => {
    if ((planillaActiva.value?.routes || []).length) return true;
    const legacy = (planillaActiva.value?.daily_route || servicioSeleccionado.value?.daily_route || '').trim();
    return !!legacy;
});

// Recorridos del día: editables en vivo
const recorridosDia = ref([]);
const guardandoRecorridos = ref(false);

const normalizarRecorridos = (list) => {
    if (!Array.isArray(list)) return [];
    return list
        .map(r => ({
            origin: r?.origin || '',
            destination: r?.destination || '',
        }))
        .filter(r => r.origin || r.destination);
};

const agregarRecorridoDia = () => {
    recorridosDia.value.push({ origin: '', destination: '' });
};

const quitarRecorridoDia = (idx) => {
    recorridosDia.value.splice(idx, 1);
};

const guardarRecorridosDia = async () => {
    const uuid = planillaActivaUuid.value;
    if (!uuid) return toast('Atención', 'Seleccione primero el servicio del día', 'warning');
    const validos = normalizarRecorridos(recorridosDia.value);
    if (!validos.length) return toast('Atención', 'Agregue al menos un recorrido con origen y destino', 'warning');
    guardandoRecorridos.value = true;
    try {
        const updated = await store.updateItem(uuid, { routes: validos });
        const saved = updated?.routes || validos;
        const aplicar = (nodo) => {
            if (nodo && nodo.uuid === uuid) nodo.routes = saved.map(r => ({ ...r }));
        };
        serviciosCatalogo.value.forEach(s => {
            aplicar(s);
            (s.children || []).forEach(aplicar);
        });
        recorridosDia.value = normalizarRecorridos(saved);
        persistirProgreso();
        toast('¡Éxito!', `Se guardaron ${recorridosDia.value.length} recorrido(s) del día`, 'success');
    } catch (err) {
        toast('Error', err?.response?.data?.message || 'No se pudieron guardar los recorridos', 'error');
    } finally {
        guardandoRecorridos.value = false;
    }
};

// Planillas multi-día
const planillaIndex = ref(0);

const planillasDiarias = computed(() => {
    const s = servicioSeleccionado.value;
    if (!s) return [];
    return Array.isArray(s.children) ? s.children.filter(c => c && c.uuid) : [];
});

const esMultiDia = computed(() => planillasDiarias.value.length > 0);

const planillasPendientes = computed(() => {
    return planillasDiarias.value.filter(p => p.is_active == 1 || p.is_active === true);
});

const planillaActiva = computed(() => {
    const s = servicioSeleccionado.value;
    if (!s) return null;
    if (!esMultiDia.value) return s;
    const pend = planillasPendientes.value;
    if (pend.length === 0) return null;
    const idx = Math.min(planillaIndex.value, pend.length - 1);
    return pend[idx];
});

const planillaActivaUuid = computed(() => planillaActiva.value?.uuid || '');

const servicioDias = computed(() => {
    const s = servicioSeleccionado.value;
    if (!s) return 1;
    if (!s.start_date || !s.end_date || s.end_date === s.start_date) return 1;
    const start = new Date(String(s.start_date).substring(0, 10) + 'T00:00:00');
    const end = new Date(String(s.end_date).substring(0, 10) + 'T00:00:00');
    if (isNaN(start) || isNaN(end) || end < start) return 1;
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
});

const conductorSeleccionadoNombre = computed(() => {
    return servicioSeleccionado.value?.driver_name || servicioSeleccionado.value?.driver_name_and_surname || '—';
});

const vehiculoSeleccionadoPlaca = computed(() => {
    return servicioSeleccionado.value?.vehicle_license_plate || '—';
});

const resumen = reactive({
    duracion: '00:00',
    kmTotal: 0,
});

// --- RELOJ Y TEMPORIZADOR ---
const clockStr = ref('');
const timerStr = ref('00:00:00');
let clockInterval = null;
let timerInterval = null;
let startTimeSeconds = 0;

const updateClock = () => {
    const now = new Date();
    clockStr.value = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    const [h, m] = (formData.start_time || '00:00').split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0);
    startTimeSeconds = Math.floor(start.getTime() / 1000);

    timerInterval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - startTimeSeconds;
        if (diff < 0) {
            timerStr.value = '00:00:00';
            return;
        }
        const hrs = Math.floor(diff / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        const secs = diff % 60;
        timerStr.value = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
};

// --- SELECT2 ---
const servicioSelect = ref(null);
const fuecSelect = ref(null);

const { initSelect2, destroySelect2, setValues: setSelect2Values } = useSelect2(formData, validationErrors);

const selectConfigs = [
    { ref: servicioSelect, field: 'servicioId', placeholder: '— Seleccione un servicio —' },
    { ref: fuecSelect, field: 'fuec_uuid', placeholder: 'Seleccione FUEC' },
];

const formatFecha = (fecha) => {
    if (!fecha) return '—';
    const parts = String(fecha).substring(0, 10).split('-');
    if (parts.length !== 3) return fecha;
    const [y, m, d] = parts.map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

const cargarDatosPlanilla = (p) => {
    if (!p) return;
    formData.start_time = p.start_time ? p.start_time.substring(0, 5) : '';
    formData.starting_kilometer = p.starting_kilometer ?? '';
    formData.end_time = p.end_time ? p.end_time.substring(0, 5) : '';
    formData.ending_kilometer = p.ending_kilometer ?? '';
    formData.number_of_tolls = p.number_of_tolls || 0;
    formData.total_toll_value = p.total_toll_value || 0;
    formData.route_novelty = p.route_novelty || '';
    formData.end_novelty = p.end_novelty || '';
    formData.fuec_uuid = p.internal_control?.fuec_uuid || p.subcontracted_control?.fuec_uuid || '';
};

const marcarPlanillaCerrada = (uuid) => {
    const s = servicioSeleccionado.value;
    if (!s) return;
    const hijos = Array.isArray(s.children) ? s.children : [];
    const idx = hijos.findIndex(c => c.uuid === uuid);
    if (idx !== -1) hijos[idx] = { ...hijos[idx], is_active: false };
};

// --- PERSISTENCIA ANTE RECARGAS ---
// Si la planilla está iniciada (en ruta), recargar la página no la reinicia ni
// la cierra: al ingresar de nuevo se retoma en el paso 3. Solo se limpia al
// guardar/cerrar definitivamente o al pulsar Nueva Planilla.
const PROGRESO_KEY = 'pct-servicio-en-curso';

const persistirProgreso = () => {
    try {
        if (!formData.servicioId) return;
        localStorage.setItem(PROGRESO_KEY, JSON.stringify({
            servicioId: formData.servicioId,
            planillaUuid: planillaActivaUuid.value,
            currentStep: currentStep.value,
            start_time: formData.start_time,
            starting_kilometer: formData.starting_kilometer,
            start_fuel_level: formData.start_fuel_level,
            fuec_uuid: formData.fuec_uuid,
            route_novelty: formData.route_novelty,
            end_time: formData.end_time,
            ending_kilometer: formData.ending_kilometer,
            number_of_tolls: formData.number_of_tolls,
            total_toll_value: formData.total_toll_value,
            end_novelty: formData.end_novelty,
            savedAt: Date.now(),
        }));
    } catch (e) { /* almacenamiento no disponible */ }
};

const leerProgreso = () => {
    try {
        const raw = localStorage.getItem(PROGRESO_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
};

const limpiarProgreso = () => {
    try { localStorage.removeItem(PROGRESO_KEY); } catch (e) {}
};

const restaurarProgreso = async () => {
    const prog = leerProgreso();
    const queryId = route.query.service_uuid || route.query.id;
    const targetId = queryId || prog?.servicioId;
    if (!targetId) return;
    const existe = serviciosCatalogo.value.find(s => s.uuid === targetId);
    if (!existe) {
        if (!queryId) limpiarProgreso();
        return;
    }
    if (queryId && prog && prog.servicioId !== queryId) limpiarProgreso();
    formData.servicioId = targetId;
    await nextTick();
    await nextTick();
    setSelect2Values([selectConfigs[0]]);
    const activa = planillaActiva.value;
    if (!activa) return;
    const enRuta = (activa.is_active == 1 || activa.is_active === true) && !!activa.start_time && !activa.end_time;
    if (!enRuta) {
        // Pendiente sin iniciar: queda seleccionado en el paso 1. Sin pendientes: limpiar.
        const pendientes = esMultiDia.value ? planillasPendientes.value.length : ((existe.is_active == 1 || existe.is_active === true) ? 1 : 0);
        if (!pendientes) limpiarProgreso();
        return;
    }
    // En ruta: retomar datos y paso.
    cargarDatosPlanilla(activa);
    if (prog && prog.planillaUuid === activa.uuid) {
        if (prog.route_novelty) formData.route_novelty = prog.route_novelty;
        if (prog.end_time) {
            formData.end_time = prog.end_time;
            formData.ending_kilometer = prog.ending_kilometer ?? '';
            formData.number_of_tolls = prog.number_of_tolls ?? 0;
            formData.total_toll_value = prog.total_toll_value ?? 0;
            formData.end_novelty = prog.end_novelty || '';
        }
    }
    if (prog && prog.currentStep >= 4 && formData.end_time) {
        goStep(4);
    } else {
        if (currentStep.value !== 3) goStep(3);
        startTimer();
    }
    persistirProgreso();
};


// --- NAVEGACIÓN ---
const goBack = () => {
    router.back();
};

const goStep = (n) => {
    if (n === 4 && rutasMulti.value && cierresRecorridos.value.length !== recorridosPlanillaActiva.value.length) {
        inicializarCierresPorRecorrido();
    }
    currentStep.value = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (n === 5) {
        nextTick(() => {
            initCanvas('funcionario');
            initCanvas('conductor');
        });
    }
};

const handleStepClick = (n) => {
    if (currentStep.value > n) {
        goStep(n);
    }
};

const goStep2 = () => {
    if (!formData.servicioId) {
        validationErrors.servicioId = 'Debe seleccionar un servicio';
        return;
    }
    delete validationErrors.servicioId;
    if (!formData.start_time) {
        const now = new Date();
        formData.start_time = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    goStep(2);
    nextTick(() => {
        initSelect2([selectConfigs[1]]);
    });
};

const iniciarServicio = async () => {
    if (!formData.start_time || !formData.starting_kilometer) {
        return toast('Atención', 'La hora de inicio y el kilometraje son obligatorios.', 'warning');
    }
    // Inspección preoperacional obligatoria (una sola vez al día por vehículo).
    if (planillaVehiculoUuid.value) {
        if (!inspeccionDia.value.checked) await verificarInspeccionDia();
        if (!inspeccionDia.value.exists) {
            return toast('Atención', 'Registre primero la inspección preoperacional del día para este vehículo (se exige una sola vez al día).', 'warning');
        }
    }
    if (!tieneRutaDefinida.value) {
        const enEditor = normalizarRecorridos(recorridosDia.value).length;
        if (!enEditor) {
            return toast('Atención', 'Este servicio no tiene ruta definida. Registre y guarde al menos un recorrido antes de iniciar.', 'warning');
        }
        return toast('Atención', 'Tiene recorridos sin guardar. Pulse «Guardar recorridos» antes de iniciar el servicio.', 'warning');
    }
    try {
        submitting.value = true;
        await store.startService(planillaActivaUuid.value, {
            start_time: formData.start_time,
            starting_kilometer: formData.starting_kilometer,
            start_fuel_level: formData.start_fuel_level,
            fuec_uuid: formData.fuec_uuid
        });
        goStep(3);
        startTimer();
        persistirProgreso();
    } catch (err) {
        console.error(err);
        toast('Error', 'No se pudo iniciar el servicio', 'error');
    } finally {
        submitting.value = false;
    }
};

const goStep4 = () => {
    const guardados = (planillaActiva.value?.routes || []).length;
    const legacy = (planillaActiva.value?.daily_route || servicioSeleccionado.value?.daily_route || '').trim();
    const enEditor = normalizarRecorridos(recorridosDia.value).length;
    if (!guardados && !legacy && !enEditor) {
        return toast('Atención', 'Registre y guarde al menos un recorrido del día antes de finalizar.', 'warning');
    }
    if (enEditor && enEditor !== guardados) {
        return toast('Atención', 'Tiene recorridos sin guardar. Pulse «Guardar recorridos del día» antes de finalizar.', 'warning');
    }
    if (!rutasMulti.value && !formData.end_time) {
        const now = new Date();
        formData.end_time = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    if (rutasMulti.value) {
        const pend = pendientesRecorridos.value;
        if (pend.length === 0) {
            // Todos los recorridos ya cerrados: se va directo a certificar la planilla.
            goStep(5);
            persistirProgreso();
            return;
        }
        if (!pend.includes(recorridoSeleccionado.value)) {
            recorridoSeleccionado.value = pend[0];
        }
    }

    goStep(4);
    persistirProgreso();
};

const calcularResumen = (endTime) => {
    const [h1, m1] = formData.start_time.split(':').map(Number);
    const [h2, m2] = String(endTime).split(':').map(Number);
    let diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMin < 0) diffMin += 1440;
    resumen.duracion = `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
    resumen.duracionFormatted = `${String(Math.floor(diffMin / 60)).padStart(2, '0')}:${String(diffMin % 60).padStart(2, '0')}:00`;
};

const goStep5 = () => {
    if (rutasMulti.value) {
        const i = recorridoSeleccionado.value;

        if (todosRecorridosCerrados.value) {
            // Solo queda certificar la planilla completa.
            const ultimo = cierresRecorridos.value[cierresRecorridos.value.length - 1] || {};
            calcularResumen(ultimo.end_time || formData.end_time);
            resumen.kmTotal = Math.max(0, Number(ultimo.ending_kilometer) - Number(formData.starting_kilometer));
            goStep(5);
            persistirProgreso();
            return;
        }

        const c = cierresRecorridos.value[i] || {};
        if (!c.end_time || !c.ending_kilometer) {
            return toast('Atención', `El recorrido ${i + 1} requiere hora de fin y kilometraje final.`, 'warning');
        }

        calcularResumen(c.end_time);
        resumen.kmTotal = Math.max(0, Number(c.ending_kilometer) - Number(formData.starting_kilometer));

        const fr = firmasRecorridos.value[i] || {};
        if (!fr.funcionarioNombre) fr.funcionarioNombre = servicioSeleccionado.value?.official_name_and_surname || userStore.user?.full_name || '';
        if (!fr.conductorNombre) fr.conductorNombre = conductorSeleccionadoNombre.value;

        goStep(5);
        persistirProgreso();
        return;
    }
    if (!formData.end_time || !formData.ending_kilometer) {
        return toast('Atención', 'La hora de fin y el kilometraje final son obligatorios.', 'warning');
    }

    calcularResumen(formData.end_time);
    resumen.kmTotal = Math.max(0, Number(formData.ending_kilometer) - Number(formData.starting_kilometer));

    if (!firma.funcionarioNombre) firma.funcionarioNombre = servicioSeleccionado.value?.official_name_and_surname || '';
    if (!firma.conductorNombre) firma.conductorNombre = conductorSeleccionadoNombre.value;

    goStep(5);
    persistirProgreso();
};

// --- FIRMAS (CANVAS) ---
const canvasFuncionarioRef = ref(null);
const canvasConductorRef = ref(null);
const firmaFuncionarioVacia = ref(true);
const firmaConductorVacia = ref(true);

const initCanvas = (type) => {
    const canvas = type === 'funcionario' ? canvasFuncionarioRef.value : canvasConductorRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let drawing = false;

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const start = (e) => {
        drawing = true;
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (type === 'funcionario') firmaFuncionarioVacia.value = false;
        else firmaConductorVacia.value = false;
    };

    const move = (e) => {
        if (!drawing) return;
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const stop = () => {
        drawing = false;
    };

    canvas.onmousedown = start;
    canvas.onmousemove = move;
    window.addEventListener('mouseup', stop);
    canvas.ontouchstart = (e) => { e.preventDefault(); start(e); };
    canvas.ontouchmove = (e) => { e.preventDefault(); move(e); };
    canvas.ontouchend = stop;
};

const clearFirma = (type) => {
    const canvas = type === 'funcionario' ? canvasFuncionarioRef.value : canvasConductorRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (type === 'funcionario') firmaFuncionarioVacia.value = true;
    else firmaConductorVacia.value = true;
};

// --- ACCIONES ---
const openModalRepuesto = () => {
    repuesto.motivo = '';
    repuesto.descripcion = '';
    repuesto.solicitante = userStore.user?.full_name || '';
    repuesto.hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
    modal.repuesto = true;
};

const enviarRepuesto = () => {
    if (!repuesto.motivo) return toast('Error', 'Debe seleccionar un motivo', 'error');
    repuesto.ref = 'REP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    modal.repuesto = false;
    modal.repuestoOk = true;
};

const guardarPlanilla = async () => {
    if (!planillaActivaUuid.value) {
        return toast('Atención', 'No hay una planilla activa seleccionada.', 'warning');
    }

    // Múltiples recorridos: cierre por recorrido. Cada recorrido se certifica
    // por separado (persistido en BD vía /close-route) hasta completar todos;
    // solo entonces se certifica la planilla en su totalidad.
    if (rutasMulti.value) {
        if (!todosRecorridosCerrados.value) {
            return toast('Atención', `Primero cierre y firme el recorrido ${recorridoSeleccionado.value + 1}.`, 'warning');
        }
        try {
            submitting.value = true;
            await cerrarPlanillaGlobalMulti();
        } catch (err) {
            console.error(err);
            toast('Error', 'No se pudo guardar la planilla.', 'error');
        } finally {
            submitting.value = false;
        }
        return;
    }

    if (firmaFuncionarioVacia.value || firmaConductorVacia.value) {
        return toast('Falta Firma', 'Ambas firmas digitales son requeridas para certificar la planilla.', 'warning');
    }

    try {
        submitting.value = true;
        const fFirma = canvasFuncionarioRef.value.toDataURL('image/png');
        const cFirma = canvasConductorRef.value.toDataURL('image/png');

        const payload = {
            ...formData,
            servicioId: planillaActivaUuid.value,
            funcionario_signature: fFirma,
            conductor_signature: cFirma,
            funcionario_name: firma.funcionarioNombre,
            conductor_name: firma.conductorNombre,
            total_hours: resumen.duracionFormatted,
            status: 'COMPLETED'
        };

        await store.closeService(planillaActivaUuid.value, payload);
        marcarPlanillaCerrada(planillaActivaUuid.value);

        continuarTrasGuardar();
    } catch (err) {
        console.error(err);
        toast('Error', 'No se pudo guardar la planilla.', 'error');
    } finally {
        submitting.value = false;
    }
};

const actualizarRutaLocal = (i, c) => {
    const uuid = planillaActivaUuid.value;
    const aplicar = (nodo) => {
        if (!nodo || nodo.uuid !== uuid || !Array.isArray(nodo.routes)) return;
        const r = nodo.routes[i];
        if (!r) return;
        r.end_time = c.end_time || r.end_time;
        r.ending_kilometer = c.ending_kilometer !== '' && c.ending_kilometer !== null ? c.ending_kilometer : r.ending_kilometer;
        r.number_of_tolls = c.number_of_tolls ?? r.number_of_tolls;
        r.total_toll_value = c.total_toll_value ?? r.total_toll_value;
        r.end_novelty = c.end_novelty || r.end_novelty;
    };
    serviciosCatalogo.value.forEach(s => {
        aplicar(s);
        (s.children || []).forEach(aplicar);
    });
};

/**
 * Guarda el cierre y las firmas de UN solo recorrido seleccionado.
 * La planilla continúa en curso hasta cerrar el último recorrido, que entonces
 * dispara la certificación global (closeService).
 */
const guardarCierreRecorrido = async () => {
    const rutas = recorridosPlanillaActiva.value;
    const i = recorridoSeleccionado.value;
    if (i < 0 || i >= rutas.length) return;

    const c = cierresRecorridos.value[i] || {};
    if (!c.end_time || c.ending_kilometer === '' || c.ending_kilometer === null) {
        return toast('Atención', `El recorrido ${i + 1} requiere hora de fin y kilometraje final.`, 'warning');
    }

    const pf = firmaPadsRecorridos.value[`${i}-funcionario`];
    const pc = firmaPadsRecorridos.value[`${i}-conductor`];
    if (!pf || pf.estaVacio() || !pc || pc.estaVacio()) {
        return toast('Falta Firma', `El recorrido ${i + 1} requiere ambas firmas digitales para certificar.`, 'warning');
    }

    try {
        submitting.value = true;
        const ruta = rutas[i];
        const fr = firmasRecorridos.value[i] || {};
        await store.closeRoute(planillaActivaUuid.value, {
            route_uuid: ruta.uuid || '',
            route_index: i,
            end_time: c.end_time,
            ending_kilometer: c.ending_kilometer,
            number_of_tolls: c.number_of_tolls || 0,
            total_toll_value: c.total_toll_value || 0,
            end_novelty: c.end_novelty || '',
            funcionario_name: fr.funcionarioNombre || '',
            conductor_name: fr.conductorNombre || '',
            funcionario_signature: pf.getDataUrl(),
            conductor_signature: pc.getDataUrl(),
        });

        cerradosRecorridos.value[i] = true;
        actualizarRutaLocal(i, c);

        const pend = pendientesRecorridos.value;
        if (pend.length === 0) {
            // Todos los recorridos quedaron cerrados: completar y certificar la planilla.
            await cerrarPlanillaGlobalMulti();
            return;
        }

        recorridoSeleccionado.value = pend[0];
        toast('¡Éxito!', `Recorrido ${i + 1} cerrado. Quedan ${pend.length} recorrido(s) por cerrar.`, 'success');
        goStep(3);
        persistirProgreso();
    } catch (err) {
        console.error(err);
        toast('Error', 'No se pudo guardar el cierre del recorrido.', 'error');
    } finally {
        submitting.value = false;
    }
};

/**
 * Cierra la planilla completa cuando todos los recorridos quedaron cerrados y
 * firmados individualmente. El payload global NO reenvía firmas por ruta (ya
 * fueron persistidas en cada /close-route) para no duplicar registros.
 */
const cerrarPlanillaGlobalMulti = async () => {
    const ultimo = cierresRecorridos.value[cierresRecorridos.value.length - 1] || {};
    const payload = {
        ...formData,
        servicioId: planillaActivaUuid.value,
        end_time: ultimo.end_time || formData.end_time,
        ending_kilometer: ultimo.ending_kilometer || formData.ending_kilometer,
        number_of_tolls: cierresRecorridos.value.reduce((acc, c) => acc + (Number(c.number_of_tolls) || 0), 0),
        total_toll_value: cierresRecorridos.value.reduce((acc, c) => acc + (Number(c.total_toll_value) || 0), 0),
        total_hours: resumen.duracionFormatted,
        status: 'COMPLETED',
    };
    await store.closeService(planillaActivaUuid.value, payload);
    marcarPlanillaCerrada(planillaActivaUuid.value);
    continuarTrasGuardar();
};

const continuarTrasGuardar = () => {
    const restantes = planillasPendientes.value;
    if (esMultiDia.value && restantes.length > 0) {
        toast('¡Éxito!', `Planilla diaria guardada. Quedan ${restantes.length} planilla(s) pendiente(s).`, 'success');

        formData.start_time = '';
        formData.starting_kilometer = formData.ending_kilometer || formData.starting_kilometer;
        formData.end_time = '';
        formData.ending_kilometer = '';
        formData.number_of_tolls = 0;
        formData.total_toll_value = 0;
        formData.end_novelty = '';
        formData.route_novelty = '';
        planillaIndex.value = 0;

        clearFirma('funcionario');
        clearFirma('conductor');
        firma.funcionarioNombre = '';
        firma.conductorNombre = '';

        cierresRecorridos.value = [];
        firmasRecorridos.value = [];
        firmaPadsRecorridos.value = {};

        goStep(2);
        persistirProgreso();
        nextTick(() => {
            initCanvas('funcionario');
            initCanvas('conductor');
        });
        return;
    }

    limpiarProgreso();
    cierresRecorridos.value = [];
    cerradosRecorridos.value = [];
    recorridoSeleccionado.value = 0;
    firmasRecorridos.value = [];
    firmaPadsRecorridos.value = {};
    goStep(6);
};

const reiniciar = () => {
    limpiarProgreso();
    Object.assign(formData, {
        servicioId: '',
        start_time: '',
        starting_kilometer: '',
        start_fuel_level: '',
        fuec_uuid: '',
        route_novelty: '',
        end_time: '',
        ending_kilometer: '',
        number_of_tolls: 0,
        total_toll_value: 0,
        end_novelty: '',
    });
    Object.assign(firma, {
        funcionarioNombre: '',
        conductorNombre: '',
    });
    cierresRecorridos.value = [];
    cerradosRecorridos.value = [];
    recorridoSeleccionado.value = 0;
    firmasRecorridos.value = [];
    firmaPadsRecorridos.value = {};
    planillaIndex.value = 0;
    currentStep.value = 1;
    if (timerInterval) clearInterval(timerInterval);
    timerStr.value = '00:00:00';
    nextTick(() => {
        setSelect2Values([selectConfigs[0]]);
    });
};

// --- CICLO DE VIDA ---
onMounted(async () => {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    try {
        isViewLoading.value = true;
        const resServ = await serviceDeliveryControlSheetService.listAll();
        const listServ = resServ?.data?.data ?? resServ?.data ?? resServ ?? [];
        const validList = Array.isArray(listServ) ? listServ : [];
        serviciosCatalogo.value = validList.filter(s => s.is_active == 1 || s.is_active === true);

        const catalogs = await store.loadFormOptions();
        fuecsCatalogo.value = catalogs.fuecs || [];
        try {
            const { useUserStore } = await import('@store');
            const userStore = useUserStore();
            if (userStore.company_uuid) await store.loadProjects(userStore.company_uuid);
            proyectosList.value = store.projects || catalogs.projects || [];
        } catch (e) {
            proyectosList.value = catalogs.projects || [];
        }

        await nextTick();
        initSelect2([selectConfigs[0]]);
        setSelect2Values([selectConfigs[0]]);

        // Retomar servicio en curso (recarga o reingreso): paso 3 si sigue en ruta.
        await restaurarProgreso();
    } catch (err) {
        console.error(err);
    } finally {
        isViewLoading.value = false;
    }
});

onUnmounted(() => {
    if (clockInterval) clearInterval(clockInterval);
    if (timerInterval) clearInterval(timerInterval);
    destroySelect2(selectConfigs);
});

watch(() => formData.servicioId, (newVal) => {
    inspeccionDia.value = { checked: false, exists: false, uuid: null, fecha: '', verificando: false };
    if (!newVal) {
        reiniciar();
        return;
    }

    const s = servicioSeleccionado.value;
    if (!s) return;

    planillaIndex.value = 0;

    if (esMultiDia.value && planillasPendientes.value.length === 0) {
        goStep(6);
        return;
    }

    cargarDatosPlanilla(planillaActiva.value || s);

    const activa = planillaActiva.value || s;
    if (activa.start_time) {
        goStep(3);
        startTimer();
    } else if (!esMultiDia.value && activa.end_time && activa.ending_kilometer) {
        goStep(6);
    }
});

watch(proyectoFiltro, (nuevo) => {
    if (!nuevo) return;
    const actual = serviciosCatalogo.value.find(s => s.uuid === formData.servicioId);
    const pertenece = actual && ((actual.project_uuid || actual.project?.uuid) === nuevo);
    if (formData.servicioId && !pertenece) {
        formData.servicioId = '';
        planillaIndex.value = 0;
        nextTick(() => setSelect2Values([selectConfigs[0]]));
    }
});

watch(planillaActivaUuid, (uuid) => {
    cierresRecorridos.value = [];
    cerradosRecorridos.value = [];
    recorridoSeleccionado.value = 0;
    if (!uuid) {
        recorridosDia.value = [];
        return;
    }
    recorridosDia.value = normalizarRecorridos(planillaActiva.value?.routes || []);
});

// Al entrar al paso 2 se verifica la inspección del día (una sola vez al día).
watch(currentStep, (n) => {
    if (n === 2 && formData.servicioId) verificarInspeccionDia();
});
</script>

<style scoped>
/* ─── TIPOGRAFÍA & BASE ─────────────────────────────────────── */
.service-template-view {
    font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #344050;
}

h1, h2, h3, h4, h5, h6,
.modal-title,
.step-label,
.step-number {
    font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* ─── GENERALES & ANIMACIONES ───────────────────────────────── */
.fade-in {
    animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.font-monospace {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
}

.fs-10 { font-size: 0.65rem !important; }
.fs-11 { font-size: 0.75rem !important; }
.fs-12 { font-size: 0.8125rem !important; }
.fs-13 { font-size: 0.875rem !important; }
.fs-14 { font-size: 0.9375rem !important; }
.fs-15 { font-size: 1.05rem !important; }

/* ─── STEPPER FALCON ────────────────────────────────────────── */
.stepper-card {
    background: #ffffff;
    border-radius: 0.5rem;
}

.stepper-track {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    gap: 0.5rem;
}

.stepper-track::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 40px;
    right: 40px;
    height: 3px;
    background: #edf2f9;
    z-index: 0;
}

.stepper-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    z-index: 1;
    background: #ffffff;
    padding: 0 0.5rem;
    cursor: default;
    transition: all 0.2s ease;
}

.stepper-item.clickable {
    cursor: pointer;
}

.stepper-item.clickable:hover .step-indicator {
    transform: scale(1.08);
}

.step-indicator {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #edf2f9;
    color: #748194;
    border: 2px solid #d8e2ef;
    display: grid;
    place-items: center;
    font-size: 0.9rem;
    font-weight: 700;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.stepper-item.active .step-indicator {
    background: #2c7be5;
    color: #ffffff;
    border-color: #1a68d1;
    box-shadow: 0 0 0 4px rgba(44, 123, 229, 0.2);
}

.stepper-item.done .step-indicator {
    background: #00d27a;
    color: #ffffff;
    border-color: #00b86b;
}

.step-number {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #9da9bb;
    display: block;
    line-height: 1;
    margin-bottom: 2px;
}

.step-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #5e6e82;
}

.stepper-item.active .step-label {
    color: #12263f;
    font-weight: 700;
}

.stepper-item.done .step-label {
    color: #00d27a;
}

/* ─── PLACA ESTILO COLOMBIANO ───────────────────────────────── */
.colombia-plate-badge {
    background: #facc15;
    color: #0b1727;
    border: 2px solid #12263f;
    border-radius: 6px;
    padding: 2px 8px;
    font-family: 'Arial Black', Impact, sans-serif;
    text-align: center;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    min-width: 100px;
    line-height: 1;
}

.plate-country {
    font-size: 7px;
    letter-spacing: 2px;
    font-weight: 800;
    text-transform: uppercase;
    color: #4d5969;
    margin-bottom: 2px;
}

.plate-code {
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 1.5px;
}

/* ─── COCKPIT EN RUTA ───────────────────────────────────────── */
.odometer-timer {
    font-size: 3.25rem;
    letter-spacing: 2px;
    color: #2c7be5;
    line-height: 1;
}

.pulse-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    animation: pulseGlow 1.5s infinite;
}

@keyframes pulseGlow {
    0% { transform: scale(0.95); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 8px rgba(0, 210, 122, 0.6); }
    100% { transform: scale(0.95); opacity: 0.6; }
}

/* ─── AVATAR / ICON SHAPES ──────────────────────────────────── */
.avatar-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 14px;
}

.icon-shape {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
}

/* ─── FIRMAS Y CANVAS ───────────────────────────────────────── */
.signature-card {
    background: #ffffff;
    border-radius: 0.5rem;
}

.signature-pad-wrapper {
    background: #fafafa;
    border: 1.5px dashed #d8e2ef !important;
    overflow: hidden;
    cursor: crosshair;
}

.signature-pad-wrapper:hover {
    border-color: #2c7be5 !important;
}

.signature-canvas {
    display: block;
    height: 140px;
    touch-action: none;
}

.signature-hint {
    user-select: none;
    pointer-events: none;
}

/* ─── MODAL CUSTOM ─────────────────────────────────────────── */
.modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background: rgba(11, 23, 39, 0.55);
    z-index: 1055;
    backdrop-filter: blur(4px);
    padding: 1rem;
}

.modal-dialog-custom {
    animation: modalSlide 0.2s ease-out;
}

@keyframes modalSlide {
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* ─── SELECT2 FIXES DENTRO DE VISTA ─────────────────────────── */
:deep(.select2-container .select2-selection--single) {
    height: 42px !important;
    border: 1px solid #d8e2ef !important;
    border-radius: 0.375rem !important;
    display: flex !important;
    align-items: center !important;
}

:deep(.select2-container--open .select2-selection--single) {
    border-color: #2c7be5 !important;
    box-shadow: 0 0 0 3px rgba(44, 123, 229, 0.2) !important;
}

:deep(.is-invalid-select2 .select2-selection) {
    border-color: #e63757 !important;
}
</style>
