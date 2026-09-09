<template>
    <!-- ════ WRAPPER ══════════════════════════════════════════════ -->
    <div class="pct-root">

        <!-- ════ HEADER ══════════════════════════════════════════════ -->
        <header class="pct-header">
            <div class="pct-logo">🚌</div>
            <h1 class="pct-title">
                Planilla de Control
                <span>Prestación de Servicios de Transporte</span>
            </h1>
            <div class="pct-header-right">
                <div class="pct-badge-date">{{ clockStr }}</div>
            </div>
        </header>

        <!-- ════ STEPPER ══════════════════════════════════════════════ -->
        <div class="pct-stepper">
            <div v-for="s in steps" :key="s.n" class="pct-step"
                :class="{ active: currentStep === s.n, done: currentStep > s.n }">
                <div class="pct-step-circle">
                    <span v-if="currentStep > s.n">✓</span>
                    <span v-else>{{ s.n }}</span>
                </div>
                <div class="pct-step-label">{{ s.label }}</div>
            </div>
        </div>

        <!-- ════ MAIN ══════════════════════════════════════════════ -->
        <div class="pct-main" v-if="!isViewLoading">

            <!-- ── STEP 1: SELECCIÓN ─────────────────────────────────── -->
            <template v-if="currentStep === 1">

                <div class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">🚗</div>
                        <h2>Selección servicio asignado</h2>
                        <span class="pct-tag pct-tag-req">Requerido</span>
                    </div>
                    <div class="pct-card-body">
                        <div class="pct-field">
                            <label class="form-label" for="servicioId">Servicio</label>
                            <select id="servicioId" ref="servicioSelect" v-model="formData.servicioId" class="form-control select2-input w-100">
                                <option value="">— Seleccione un servicio —</option>
                                <option v-for="s in serviciosCatalogo" :key="s.uuid" :value="s.uuid">
                                    {{ s.daily_route }} · {{ s.type_of_control_sheet === 'DIRECTO_CON_LA_EMPRESA' ?
                                        'Directo' : 'Subcontratado' }}
                                </option>
                            </select>
                            <div v-if="validationErrors.servicioId" class="invalid-feedback d-block">
                                {{ validationErrors.servicioId }}
                            </div>
                        </div>
                        <template v-if="servicioSeleccionado">
                            <div class="pct-divider"><span>Detalle del Servicio</span></div>
                            <div class="pct-info-box">
                                <div class="pct-info-item">
                                    <label>Código</label>
                                    <div class="pct-info-value">{{ servicioSeleccionado.uuid?.slice(0, 8) }}…</div>
                                </div>
                                <div class="pct-info-item">
                                    <label>Tipo</label>
                                    <div class="pct-info-value">{{ servicioSeleccionado.type_of_control_sheet ===
                                        'DIRECTO_CON_LA_EMPRESA' ? 'Directo con la empresa' : 'Subcontratado' }}</div>
                                </div>
                                <div class="pct-info-item">
                                    <label>Ruta diaria</label>
                                    <div class="pct-info-value">{{ servicioSeleccionado.daily_route }}</div>
                                </div>
                                <div class="pct-info-item">
                                    <label>Vehículo</label>
                                    <div class="pct-info-value">{{ servicioSeleccionado.vehicle_license_plate || '—' }}
                                    </div>
                                </div>
                                <div class="pct-info-item">
                                    <label>Conductor</label>
                                    <div class="pct-info-value">{{ servicioSeleccionado.driver_name || '—' }}</div>
                                </div>
                                <div class="pct-info-item">
                                    <label>Fecha del servicio</label>
                                    <div class="pct-info-value pct-accent">{{
                                        servicioSeleccionado.service_date || '—' }}</div>
                                </div>
                                <div v-if="servicioDias > 1" class="pct-info-item" style="grid-column: 1 / -1;">
                                    <label>Duración del servicio</label>
                                    <div class="pct-info-value">
                                        <span class="badge rounded-pill"
                                            style="background: var(--accent-light); color: var(--accent); border: 1px solid var(--accent-dim); padding: 3px 10px; font-size: 11px;">
                                            <i class="fad fa-calendar-alt me-1"></i>
                                            {{ servicioDias }} planillas diarias ({{ servicioSeleccionado.start_date }}
                                            → {{ servicioSeleccionado.end_date }})
                                        </span>
                                    </div>
                                </div>
                                <div class="pct-info-item">
                                    <label>Funcionario</label>
                                    <div class="pct-info-value">{{ servicioSeleccionado.official_name_and_surname || '—'
                                    }}</div>
                                </div>
                                <div class="pct-info-item">
                                    <label>Estado</label>
                                    <div class="pct-info-value"
                                        :class="servicioSeleccionado.is_active == 1 || servicioSeleccionado.is_active === true ? 'pct-accent' : 'pct-inactive'">
                                        {{ servicioSeleccionado.is_active == 1 || servicioSeleccionado.is_active ===
                                            true ? 'Activo' : 'Inactivo' }}
                                    </div>
                                </div>
                            </div>

                            <template v-if="esMultiDia">
                                <div class="pct-divider"><span>Planillas Diarias</span></div>
                                <div class="pct-dias-box">
                                    <div v-for="p in planillasDiarias" :key="p.uuid" class="pct-dia-row">
                                        <span class="pct-dia-fecha">{{ formatFecha(p.service_date) }}</span>
                                        <span class="pct-dia-flag"
                                            :class="p.is_active == 1 || p.is_active === true ? 'pct-dia-abierto' : 'pct-dia-cerrado'">
                                            <i :class="p.is_active == 1 || p.is_active === true
                                                ? 'fad fa-check-circle me-1'
                                                : 'fad fa-circle me-1'" style="font-size:10px;" />
                                            {{ p.is_active == 1 || p.is_active === true ? 'Abierto' : 'Cerrado' }}
                                        </span>
                                    </div>
                                </div>
                            </template>
                        </template>
                    </div>
                </div>
                <button class="pct-btn pct-btn-primary" @click="goStep2">
                    ▶ Continuar al Inicio de Servicio
                </button>
            </template>

            <!-- ── STEP 2: INICIO ─────────────────────────────────────── -->
            <template v-if="currentStep === 2">

                <div class="pct-alert pct-alert-info">
                    <span class="pct-alert-icon">ℹ️</span>
                    <div>Verifique la hora y el kilometraje antes de iniciar. Este registro quedará en la planilla
                        oficial.</div>
                </div>

                <div class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">⏱️</div>
                        <h2>Registro de Inicio</h2>
                        <span class="pct-tag pct-tag-req">Requerido</span>
                    </div>
                    <div class="pct-card-body">
                        <div class="pct-row2">
                            <div class="pct-field">
                                <label>Hora de Inicio</label>
                                <input v-model="formData.start_time" type="time" step="60" />
                            </div>
                            <div class="pct-field">
                                <label>Kilometraje Inicial</label>
                                <input v-model="formData.starting_kilometer" type="number" placeholder="000000" min="0" />
                            </div>
                        </div>
                        <div class="pct-row2">
                            <div class="pct-field">
                                <label>Combustible en Galones</label>
                                <input v-model="formData.start_fuel_level" type="number" placeholder="100" min="0" />
                            </div>
                            <div class="pct-field">
                                <label class="form-label" for="fuec_uuid">N.° Planilla / FUEC</label>
                                <select id="fuec_uuid" ref="fuecSelect" v-model="formData.fuec_uuid" class="form-control select2-input w-100">
                                    <option value="">Seleccione</option>
                                    <option v-for="item in fuecsCatalogo" :key="item.uuid" :value="item.uuid">
                                        {{ item.sheet_number || item.fuec_number }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pct-btn-group">
                    <button class="pct-btn pct-btn-ghost" @click="goStep(1)">← Volver</button>
                    <button class="pct-btn pct-btn-green" :disabled="submitting" @click="iniciarServicio">
                        <i v-if="submitting" class="fas fa-spinner fa-spin me-2"></i>
                        🟢 Iniciar Servicio
                    </button>
                </div>
            </template>

            <!-- ── STEP 3: EN CURSO ───────────────────────────────────── -->
            <template v-if="currentStep === 3">

                <div class="pct-alert pct-alert-success">
                    <span class="pct-alert-icon">✅</span>
                    <div>Servicio iniciado a las {{ formData.start_time }} · Km inicial: {{ formData.starting_kilometer }}</div>
                </div>

                <div class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">🛣️</div>
                        <h2>Servicio en Curso</h2>
                        <div style="margin-left:auto">
                            <span class="pct-status-pill pct-status-active">
                                <span class="pct-dot pct-pulse" />En Ruta
                            </span>
                        </div>
                    </div>
                    <div class="pct-card-body">
                        <div class="pct-timer-display">
                            <div class="pct-timer-label">Tiempo Transcurrido</div>
                            <div class="pct-timer-value">{{ timerStr }}</div>
                        </div>
                        <div class="pct-divider"><span>Resumen de Inicio</span></div>
                        <div class="pct-info-box">
                            <div class="pct-info-item">
                                <label>Conductor</label>
                                <div class="pct-info-value">
                                    {{ conductorSeleccionadoNombre || '—' }}
                                </div>
                            </div>
                            <div class="pct-info-item">
                                <label>Vehículo</label>
                                <div class="pct-info-value">
                                    {{ vehiculoSeleccionadoPlaca || '—' }}
                                </div>
                            </div>
                            <div class="pct-info-item">
                                <label>Hora Inicio</label>
                                <div class="pct-info-value pct-accent">{{ formData.start_time }}</div>
                            </div>
                            <div class="pct-info-item">
                                <label>Km Inicial</label>
                                <div class="pct-info-value">{{ Number(formData.starting_kilometer).toLocaleString('es-CO')
                                }} km</div>
                            </div>
                        </div>
                        <div class="pct-divider"><span>Novedades en Ruta</span></div>
                        <div class="pct-field">
                            <label>Registrar novedad intermedia (opcional)</label>
                            <textarea v-model="formData.route_novelty" placeholder="Demora, desvío, incidente…" />
                        </div>
                    </div>
                </div>

                <!-- Planilla repuesto -->
                <div class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">🔄</div>
                        <h2>Planilla de Repuesto</h2>
                        <span class="pct-tag pct-tag-opt">Acción</span>
                    </div>
                    <div class="pct-card-body">
                        <p class="pct-text-muted" style="margin-bottom:12px;font-size:12px">
                            Si la planilla original se dañó, extravió o requiere reemplazo, solicite una planilla de
                            repuesto a despacho.
                        </p>
                        <button class="pct-btn pct-btn-outline" @click="openModalRepuesto">
                            🔄 Solicitar Planilla de Repuesto
                        </button>
                    </div>
                </div>

                <button class="pct-btn pct-btn-red" @click="goStep4">
                    ⛔ Finalizar Servicio
                </button>
            </template>

            <!-- ── STEP 4: FINALIZACIÓN ───────────────────────────────── -->
            <template v-if="currentStep === 4">

                <div class="pct-alert pct-alert-warn">
                    <span class="pct-alert-icon">⚠️</span>
                    <div>Diligencie los datos de cierre. La hora y el kilometraje final son obligatorios.</div>
                </div>

                <div class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">🏁</div>
                        <h2>Datos de Finalización</h2>
                        <span class="pct-tag pct-tag-req">Requerido</span>
                    </div>
                    <div class="pct-card-body">
                        <div class="pct-row2">
                            <div class="pct-field">
                                <label>Hora de Finalización</label>
                                <input v-model="formData.end_time" type="time" step="60" />
                            </div>
                            <div class="pct-field">
                                <label>Kilometraje Final</label>
                                <input v-model="formData.ending_kilometer" type="number" placeholder="000000" min="0" />
                            </div>
                        </div>
                        <div class="pct-row2">
                            <div class="pct-field">
                                <label>Numero de peajes</label>
                                <input v-model="formData.number_of_tolls" type="number" placeholder="0" min="0" max="100" />
                            </div>
                            <div class="pct-field">
                                <label>Valor total peajes</label>
                                <input v-model="formData.total_toll_value" type="number" placeholder="0" min="0" />
                            </div>
                        </div>
                        <div class="pct-field">
                            <label>Novedades al Cierre</label>
                            <textarea v-model="formData.end_novelty"
                                placeholder="Sin novedad / descripción de novedades al terminar…" />
                        </div>
                    </div>
                </div>

                <div class="pct-btn-group">
                    <button class="pct-btn pct-btn-ghost" @click="goStep(3)">← Volver</button>
                    <button class="pct-btn pct-btn-primary" @click="goStep5">Continuar a Firmas →</button>
                </div>
            </template>

            <!-- ── STEP 5: FIRMAS ─────────────────────────────────────── -->
            <template v-if="currentStep === 5">

                <div class="pct-alert pct-alert-success">
                    <span class="pct-alert-icon">✅</span>
                    <div>
                        Servicio completado: {{ resumen.duracion }} · {{ resumen.kmTotal }} km recorridos.
                    </div>
                </div>

                <!-- Resumen -->
                <div class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">📊</div>
                        <h2>Resumen del Servicio</h2>
                    </div>
                    <div class="pct-card-body" style="padding:0">
                        <table class="pct-summary-table">
                            <tr v-for="row in resumenRows" :key="row.label">
                                <td>{{ row.label }}</td>
                                <td>{{ row.value }}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Firma Funcionario -->
                <div class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">🖊️</div>
                        <h2>Firma del Funcionario</h2>
                        <span class="pct-tag pct-tag-req">Requerido</span>
                    </div>
                    <div class="pct-card-body">
                        <div class="pct-field">
                            <label>Nombre del Funcionario</label>
                            <input v-model="firma.funcionarioNombre" type="text" placeholder="Nombre completo" />
                        </div>
                        <div class="pct-field">
                            <label>Firma</label>
                            <div class="pct-firma-wrap">
                                <canvas ref="canvasFuncionarioRef" width="640" height="130" />
                                <div class="pct-firma-hint" :style="{ opacity: firmaFuncionarioVacia ? 1 : 0 }">
                                    ✍️ Firme aquí
                                </div>
                            </div>
                            <button class="pct-firma-clear" @click="clearFirma('funcionario')">Borrar firma</button>
                        </div>
                    </div>
                </div>

                <!-- Firma Conductor -->
                <div class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">🚘</div>
                        <h2>Firma del Conductor</h2>
                        <span class="pct-tag pct-tag-req">Requerido</span>
                    </div>
                    <div class="pct-card-body">
                        <div class="pct-field">
                            <label>Nombre del Conductor</label>
                            <input v-model="firma.conductorNombre" type="text"
                                placeholder="Nombre completo del conductor" />
                        </div>
                        <div class="pct-field">
                            <label>Firma</label>
                            <div class="pct-firma-wrap">
                                <canvas ref="canvasConductorRef" width="640" height="130" />
                                <div class="pct-firma-hint" :style="{ opacity: firmaConductorVacia ? 1 : 0 }">
                                    ✍️ Firme aquí
                                </div>
                            </div>
                            <button class="pct-firma-clear" @click="clearFirma('conductor')">Borrar firma</button>
                        </div>
                    </div>
                </div>

                <!-- Planilla de repuesto también aquí -->
                <div class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">🔄</div>
                        <h2>Planilla de Repuesto</h2>
                        <span class="pct-tag pct-tag-opt">Acción</span>
                    </div>
                    <div class="pct-card-body">
                        <p class="pct-text-muted" style="margin-bottom:12px;font-size:12px">
                            Si necesita una planilla de repuesto antes de guardar, solicítela aquí.
                        </p>
                        <button class="pct-btn pct-btn-outline" @click="openModalRepuesto">
                            🔄 Solicitar Planilla de Repuesto
                        </button>
                    </div>
                </div>

                <!-- Avance de planillas diarias (multi-día) -->
                <div v-if="esMultiDia" class="pct-card">
                    <div class="pct-card-head">
                        <div class="pct-card-icon">📅</div>
                        <h2>Planillas Diarias del Servicio</h2>
                        <span class="pct-tag pct-tag-opt">{{ planillasPendientes.length }} pendiente(s)</span>
                    </div>
                    <div class="pct-card-body" style="padding:0">
                        <table class="pct-summary-table">
                            <tr v-for="p in planillasDiarias" :key="p.uuid"
                                :class="planillaActiva && planillaActiva.uuid === p.uuid ? 'pct-dia-activo' : ''">
                                <td>{{ formatFecha(p.service_date) }}</td>
                                <td>
                                    <span class="pct-dia-flag"
                                        :class="p.is_active == 1 || p.is_active === true ? 'pct-dia-abierto' : 'pct-dia-cerrado'">
                                        <i :class="p.is_active == 1 || p.is_active === true
                                            ? 'fad fa-check-circle me-1'
                                            : 'fad fa-circle me-1'" style="font-size:10px;" />
                                        {{ p.is_active == 1 || p.is_active === true ? 'Abierto' : 'Cerrado' }}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div v-if="esMultiDia" class="pct-alert pct-alert-info">
                    <span class="pct-alert-icon">ℹ️</span>
                    <div>
                        Firmando la planilla del <strong>{{ planillaActiva ? formatFecha(planillaActiva.service_date) : '—' }}</strong>.
                        Al guardar, el sistema avanzará automáticamente a la siguiente planilla diaria pendiente.
                    </div>
                </div>

                <button class="pct-btn pct-btn-green" :disabled="submitting" @click="guardarPlanilla">
                    <i v-if="submitting" class="fas fa-spinner fa-spin me-2"></i>
                    💾 {{ esMultiDia
                        ? `Guardar Planilla del Día (${planillaActiva ? formatFecha(planillaActiva.service_date) : '—'})`
                        : 'Guardar Planilla Completa' }}
                </button>
            </template>

            <!-- ── DONE ───────────────────────────────────────────────── -->
            <template v-if="currentStep === 6">
                <div class="pct-card pct-card-done">
                    <div style="font-size:52px;margin-bottom:12px">✅</div>
                    <h2 style="font-size:18px;font-weight:700;margin-bottom:8px">Planilla Guardada</h2>
                    <p class="pct-text-muted" style="margin-bottom:20px;font-size:13px">
                        La planilla de control ha sido registrada exitosamente en el sistema.
                    </p>
                    <span class="pct-status-pill pct-status-done">🗂️ Planilla Completa</span>
                    <div style="margin-top:20px">
                        <button class="pct-btn pct-btn-primary" @click="reiniciar">＋ Nueva Planilla</button>
                    </div>
                </div>
            </template>

        </div><!-- /.pct-main -->

        <!-- Loader -->
        <div v-if="isViewLoading" class="pct-main d-flex justify-content-center align-items-center" style="min-height: 400px;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>

        <!-- ════ MODAL PLANILLA REPUESTO ════════════════════════════ -->
        <teleport to="body">
            <div v-if="modal.repuesto" class="pct-modal-bg" @click.self="modal.repuesto = false">
                <div class="pct-modal">
                    <div class="pct-modal-title">🔄 Solicitud de Planilla de Repuesto</div>

                    <div class="pct-field">
                        <label>Motivo de la Solicitud</label>
                        <select v-model="repuesto.motivo">
                            <option value="">— Seleccione motivo —</option>
                            <option>Planilla original dañada (agua / rotura)</option>
                            <option>Planilla extraviada en ruta</option>
                            <option>Error de diligenciamiento</option>
                            <option>Planilla no entregada por despacho</option>
                            <option>Otro motivo</option>
                        </select>
                    </div>
                    <div class="pct-field">
                        <label>Descripción del Motivo</label>
                        <textarea v-model="repuesto.descripcion" placeholder="Explique brevemente la situación…" />
                    </div>
                    <div class="pct-row2">
                        <div class="pct-field">
                            <label>Solicitado por</label>
                            <input v-model="repuesto.solicitante" type="text" placeholder="Nombre del solicitante" />
                        </div>
                        <div class="pct-field">
                            <label>Hora de Solicitud</label>
                            <input :value="repuesto.hora" type="time" readonly />
                        </div>
                    </div>

                    <div class="pct-btn-group" style="margin-top:8px">
                        <button class="pct-btn pct-btn-ghost" @click="modal.repuesto = false">Cancelar</button>
                        <button class="pct-btn pct-btn-outline" @click="enviarRepuesto">📤 Enviar Solicitud</button>
                    </div>
                </div>
            </div>

            <!-- Modal confirmación -->
            <div v-if="modal.repuestoOk" class="pct-modal-bg" @click.self="modal.repuestoOk = false">
                <div class="pct-modal" style="text-align:center">
                    <div style="font-size:44px;margin-bottom:12px">📋</div>
                    <div class="pct-modal-title" style="justify-content:center">Solicitud Enviada</div>
                    <p class="pct-text-muted" style="font-size:13px;margin-bottom:6px">
                        La solicitud de planilla de repuesto ha sido enviada a despacho.
                    </p>
                    <p class="pct-text-muted" style="font-size:12px;margin-bottom:20px">
                        Ref. Solicitud: {{ repuesto.ref }}
                    </p>
                    <button class="pct-btn pct-btn-primary" @click="modal.repuestoOk = false">Entendido</button>
                </div>
            </div>
        </teleport>

    </div><!-- /.pct-root -->
</template>

<script setup>
import { toast } from '@/utils/toast.js';
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-19
 * @module {Features.Fleet}
 * @resource {ServiceDeliveryControlSheet}
 */

import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServiceDeliveryControlSheetStore } from '../store/serviceDeliveryControlSheet.store.js';
import serviceDeliveryControlSheetService from '../services/serviceDeliveryControlSheet.service.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSelect2 } from '@/hooks/useSelect2.js';

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

const steps = [
    { n: 1, label: 'Selección' },
    { n: 2, label: 'Inicio' },
    { n: 3, label: 'En Curso' },
    { n: 4, label: 'Finalizar' },
    { n: 5, label: 'Firmas' },
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

// --- COMPUTADOS ---
const servicioSeleccionado = computed(() => {
    return serviciosCatalogo.value.find(s => s.uuid === formData.servicioId) || null;
});

// Índice de la planilla diaria en proceso (para servicios multi-día).
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

const resumenRows = computed(() => [
    { label: 'Servicio', value: servicioSeleccionado.value?.daily_route || '—' },
    { label: 'Vehículo', value: vehiculoSeleccionadoPlaca.value },
    { label: 'Inicio', value: `${formData.start_time} (Km ${formData.starting_kilometer})` },
    { label: 'Fin', value: `${formData.end_time} (Km ${formData.ending_kilometer})` },
    { label: 'Recorrido', value: `${resumen.kmTotal} km` },
    { label: 'Duración', value: resumen.duracion },
]);

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
    const [h, m] = formData.start_time.split(':').map(Number);
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

// --- UTILIDADES DE PLANILLAS DIARIAS ---
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

// --- NAVEGACIÓN ---
const goStep = (n) => {
    currentStep.value = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (n === 5) {
        nextTick(() => {
            initCanvas('funcionario');
            initCanvas('conductor');
        });
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
    } catch (err) {
        console.error(err);
    } finally {
        submitting.value = false;
    }
};

const goStep4 = () => {
    if (!formData.end_time) {
        const now = new Date();
        formData.end_time = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    goStep(4);
};

const goStep5 = () => {
    if (!formData.end_time || !formData.ending_kilometer) {
        return toast('Atención', 'La hora de fin y el kilometraje final son obligatorios.', 'warning');
    }

    const [h1, m1] = formData.start_time.split(':').map(Number);
    const [h2, m2] = formData.end_time.split(':').map(Number);
    let diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMin < 0) diffMin += 1440;
    resumen.duracion = `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
    resumen.duracionFormatted = `${String(Math.floor(diffMin / 60)).padStart(2, '0')}:${String(diffMin % 60).padStart(2, '0')}:00`;
    resumen.kmTotal = Number(formData.ending_kilometer) - Number(formData.starting_kilometer);

    if (!firma.funcionarioNombre) firma.funcionarioNombre = servicioSeleccionado.value?.official_name_and_surname || '';
    if (!firma.conductorNombre) firma.conductorNombre = conductorSeleccionadoNombre.value;

    goStep(5);
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
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
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
    repuesto.ref = 'REQ-' + Math.random().toString(36).substring(7).toUpperCase();
    modal.repuesto = false;
    modal.repuestoOk = true;
};

const guardarPlanilla = async () => {
    if (firmaFuncionarioVacia.value || firmaConductorVacia.value) {
        return toast('Falta Firma', 'Ambas firmas son obligatorias para guardar la planilla.', 'warning');
    }

    if (!planillaActivaUuid.value) {
        return toast('Atención', 'No hay una planilla activa para guardar.', 'warning');
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

        const restantes = planillasPendientes.value;
        if (esMultiDia.value && restantes.length > 0) {
            await toast('¡Éxito!', `Planilla del día guardada. Quedan ${restantes.length} planilla(s) pendiente(s).`, 'success');

            // Preparar el siguiente día (continúa el recorrido con el km final del día anterior)
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

            goStep(2);
            nextTick(() => {
                initCanvas('funcionario');
                initCanvas('conductor');
            });
            return;
        }

        goStep(6);
    } catch (err) {
        console.error(err);
    } finally {
        submitting.value = false;
    }
};

const reiniciar = () => {
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

        await nextTick();
        initSelect2([selectConfigs[0]]);
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
    if (!newVal) {
        reiniciar();
        return;
    }

    const s = servicioSeleccionado.value;
    if (!s) return;

    planillaIndex.value = 0;

    // Servicio multi-día con todas las planillas diarias completadas.
    if (esMultiDia.value && planillasPendientes.value.length === 0) {
        goStep(6);
        return;
    }

    cargarDatosPlanilla(planillaActiva.value || s);

    const activa = planillaActiva.value || s;
    if (activa.start_time) {
        // Planilla iniciada pero no finalizada → retomar en curso.
        goStep(3);
        startTimer();
    } else if (!esMultiDia.value && activa.end_time && activa.ending_kilometer) {
        // Servicio de un solo día ya finalizado.
        goStep(6);
    }
    // En cualquier otro caso permanece en el Paso 1 para revisar la selección
    // y las planillas diarias antes de continuar.
});
</script>

<style scoped>
/* ─── TOKENS ──────────────────────────────────────────────── */
.pct-root {
    --bg: #f1f5f9;
    --surface: #ffffff;
    --surface-2: #f8fafc;
    --border: #e2e8f0;
    --border-dark: #cbd5e1;
    --accent: #1d4ed8;
    --accent-light: #eff6ff;
    --accent-dim: #bfdbfe;
    --green: #16a34a;
    --green-light: #f0fdf4;
    --green-dim: #bbf7d0;
    --red: #dc2626;
    --red-light: #fef2f2;
    --red-dim: #fecaca;
    --amber: #d97706;
    --amber-light: #fffbeb;
    --amber-dim: #fde68a;
    --text: #0f172a;
    --text-muted: #64748b;
    --text-dim: #94a3b8;
    --radius: 8px;
    --radius-lg: 14px;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, .08), 0 1px 2px rgba(0, 0, 0, .05);
    --shadow: 0 4px 6px rgba(0, 0, 0, .07), 0 2px 4px rgba(0, 0, 0, .05);
    --font-ui: 'Segoe UI', system-ui, sans-serif;
    --font-mono: 'Cascadia Code', 'Fira Code', monospace;

    background: var(--bg);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: 14px;
    min-height: 100vh;
    padding-bottom: 60px;
}

/* ─── HEADER ──────────────────────────────────────────────── */
.pct-header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 13px 22px;
    display: flex;
    align-items: center;
    gap: 13px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-sm);
}

.pct-logo {
    width: 36px;
    height: 36px;
    background: var(--accent);
    border-radius: 9px;
    display: grid;
    place-items: center;
    font-size: 18px;
    flex-shrink: 0;
}

.pct-title {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;
    color: var(--text);
}

.pct-title span {
    display: block;
    font-size: 11px;
    font-weight: 400;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: .05em;
}

.pct-header-right {
    margin-left: auto;
}

.pct-badge-date {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 11px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
}

/* ─── STEPPER ─────────────────────────────────────────────── */
.pct-stepper {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 22px 22px 0;
    max-width: 720px;
    margin: 0 auto;
}

.pct-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    flex: 1;
    position: relative;
}

.pct-step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 13px;
    left: calc(50% + 14px);
    right: calc(-50% + 14px);
    height: 2px;
    background: var(--border);
    transition: background .4s;
}

.pct-step.done:not(:last-child)::after {
    background: var(--accent);
}

.pct-step-circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--border-dark);
    background: var(--surface);
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-dim);
    transition: all .25s;
    position: relative;
    z-index: 1;
}

.pct-step.active .pct-step-circle {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
    box-shadow: 0 0 0 3px var(--accent-dim);
}

.pct-step.done .pct-step-circle {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
}

.pct-step-label {
    font-size: 9px;
    font-weight: 700;
    color: var(--text-dim);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: .05em;
    white-space: nowrap;
}

.pct-step.active .pct-step-label {
    color: var(--accent);
}

.pct-step.done .pct-step-label {
    color: var(--text-muted);
}

/* ─── MAIN ────────────────────────────────────────────────── */
.pct-main {
    max-width: 720px;
    margin: 20px auto;
    padding: 0 16px;
}

/* ─── CARDS ───────────────────────────────────────────────── */
.pct-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: 14px;
    box-shadow: var(--shadow-sm);
    animation: pct-fadeUp .25s ease both;
}

@keyframes pct-fadeUp {
    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.pct-card-done {
    text-align: center;
    padding: 40px 28px;
}

.pct-card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
}

.pct-card-icon {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: var(--accent-light);
    border: 1px solid var(--accent-dim);
    display: grid;
    place-items: center;
    font-size: 13px;
}

.pct-card-head h2 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
}

.pct-tag {
    margin-left: auto;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: .05em;
}

.pct-tag-req {
    background: var(--accent-light);
    color: var(--accent);
    border: 1px solid var(--accent-dim);
}

.pct-tag-opt {
    background: var(--surface);
    color: var(--text-muted);
    border: 1px solid var(--border-dark);
}

.pct-card-body {
    padding: 16px;
}

/* ─── FORM ────────────────────────────────────────────────── */
.pct-field {
    margin-bottom: 13px;
}

.pct-field:last-child {
    margin-bottom: 0;
}

.pct-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-bottom: 5px;
}

.pct-field input,
.pct-field select,
.pct-field textarea {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border-dark);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: 13px;
    padding: 8px 11px;
    outline: none;
    appearance: none;
    transition: border-color .2s, box-shadow .2s;
}

.pct-field input:focus,
.pct-field select:focus,
.pct-field textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
}

.pct-field input[readonly] {
    background: var(--surface-2);
    color: var(--text-muted);
}

.pct-field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 11px center;
    padding-right: 30px;
    cursor: pointer;
}

.pct-field textarea {
    resize: vertical;
    min-height: 66px;
}

.pct-row2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

@media(max-width:500px) {
    .pct-row2 {
        grid-template-columns: 1fr;
    }
}

/* ─── INFO BOX ────────────────────────────────────────────── */
.pct-info-box {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: var(--radius);
    padding: 11px 14px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
    margin-bottom: 13px;
}

.pct-info-item label {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-bottom: 2px;
    display: block;
}

.pct-info-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
}

.pct-accent {
    color: var(--accent) !important;
}

.pct-inactive {
    color: var(--text-muted) !important;
}

@media(max-width:420px) {
    .pct-info-box {
        grid-template-columns: 1fr;
    }
}

/* ─── TIMER ───────────────────────────────────────────────── */
.pct-timer-display {
    text-align: center;
    padding: 18px 10px;
}

.pct-timer-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 6px;
}

.pct-timer-value {
    font-family: var(--font-mono);
    font-size: 40px;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: .04em;
    line-height: 1;
}

/* ─── BUTTONS ─────────────────────────────────────────────── */
.pct-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: var(--radius);
    border: none;
    cursor: pointer;
    transition: all .18s;
    letter-spacing: .01em;
    width: 100%;
}

.pct-btn-primary {
    background: var(--accent);
    color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .15);
}

.pct-btn-primary:hover {
    background: #1e40af;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(29, 78, 216, .3);
}

.pct-btn-green {
    background: var(--green);
    color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .12);
}

.pct-btn-green:hover {
    background: #15803d;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(22, 163, 74, .3);
}

.pct-btn-red {
    background: var(--red);
    color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .12);
}

.pct-btn-red:hover {
    background: #b91c1c;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(220, 38, 38, .3);
}

.pct-btn-ghost {
    background: var(--surface-2);
    color: var(--text-muted);
    border: 1px solid var(--border-dark);
}

.pct-btn-ghost:hover {
    color: var(--text);
    border-color: var(--text-muted);
}

.pct-btn-outline {
    background: var(--accent-light);
    color: var(--accent);
    border: 1px solid var(--accent-dim);
}

.pct-btn-outline:hover {
    background: #dbeafe;
}

.pct-btn-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

@media(max-width:420px) {
    .pct-btn-group {
        grid-template-columns: 1fr;
    }
}

/* ─── STATUS PILLS ────────────────────────────────────────── */
.pct-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 11px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .05em;
}

.pct-status-active {
    background: var(--green-light);
    border: 1px solid var(--green-dim);
    color: var(--green);
}

.pct-status-done {
    background: var(--accent-light);
    border: 1px solid var(--accent-dim);
    color: var(--accent);
}

.pct-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
}

.pct-pulse {
    animation: pct-pulse 1.4s ease-in-out infinite;
}

@keyframes pct-pulse {

    0%,
    100% {
        opacity: 1
    }

    50% {
        opacity: .3
    }
}

/* ─── ALERTS ──────────────────────────────────────────────── */
.pct-alert {
    border-radius: var(--radius);
    padding: 11px 13px;
    font-size: 12px;
    line-height: 1.5;
    margin-bottom: 14px;
    display: flex;
    gap: 9px;
    align-items: flex-start;
}

.pct-alert-icon {
    font-size: 15px;
    flex-shrink: 0;
    line-height: 1.1;
}

.pct-alert-success {
    background: var(--green-light);
    border: 1px solid var(--green-dim);
    color: var(--green);
}

.pct-alert-warn {
    background: var(--amber-light);
    border: 1px solid var(--amber-dim);
    color: var(--amber);
}

.pct-alert-info {
    background: var(--accent-light);
    border: 1px solid var(--accent-dim);
    color: var(--accent);
}

/* ─── DIVIDER ─────────────────────────────────────────────── */
.pct-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 4px 0 12px;
}

.pct-divider::before,
.pct-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
}

.pct-divider span {
    font-size: 10px;
    color: var(--text-dim);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    white-space: nowrap;
}

/* ─── SUMMARY TABLE ───────────────────────────────────────── */
.pct-summary-table {
    width: 100%;
    border-collapse: collapse;
}

.pct-summary-table td {
    padding: 8px 14px;
    font-size: 12px;
    border-bottom: 1px solid var(--border);
}

.pct-summary-table tr:last-child td {
    border-bottom: none;
}

.pct-summary-table td:first-child {
    color: var(--text-muted);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: .05em;
    width: 42%;
    background: var(--surface-2);
}

.pct-summary-table td:last-child {
    color: var(--text);
    font-weight: 500;
}

/* ─── FIRMA ───────────────────────────────────────────────── */
.pct-firma-wrap {
    border: 1.5px dashed var(--border-dark);
    border-radius: var(--radius);
    background: #fafafa;
    overflow: hidden;
    position: relative;
}

.pct-firma-wrap canvas {
    display: block;
    width: 100%;
    height: 120px;
    cursor: crosshair;
    touch-action: none;
}

.pct-firma-hint {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--text-dim);
    font-size: 12px;
    pointer-events: none;
    transition: opacity .2s;
}

.pct-firma-clear {
    margin-top: 5px;
    font-size: 11px;
    color: var(--text-muted);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
    font-family: var(--font-ui);
    padding: 0;
    width: auto;
}

.pct-firma-clear:hover {
    color: var(--red);
}

/* ─── MODAL ───────────────────────────────────────────────── */
.pct-modal-bg {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, .4);
    z-index: 200;
    display: grid;
    place-items: center;
    backdrop-filter: blur(3px);
    animation: pct-fadeIn .18s;
}

@keyframes pct-fadeIn {
    from {
        opacity: 0
    }

    to {
        opacity: 1
    }
}

.pct-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    width: min(480px, calc(100vw - 28px));
    padding: 22px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
    animation: pct-slideUp .22s ease;
    max-height: 90vh;
    overflow-y: auto;
}

@keyframes pct-slideUp {
    from {
        transform: translateY(16px);
        opacity: 0
    }

    to {
        transform: translateY(0);
        opacity: 1
    }
}

.pct-modal-title {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text);
}

/* ─── UTILS ───────────────────────────────────────────────── */
.pct-text-muted {
    color: var(--text-muted);
}

/* ==================== SELECT2 UI FIXES ==================== */
:deep(.select2-container .select2-selection--single) {
    height: 38px !important;
    border: 1px solid var(--border-dark) !important;
    border-radius: var(--radius) !important;
    background-color: var(--surface) !important;
    display: flex !important;
    align-items: center !important;
}

:deep(.select2-container--open .select2-selection--single) {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent-dim) !important;
}

:deep(.select2-container .select2-selection--single .select2-selection__rendered) {
    color: var(--text) !important;
    font-size: 13px !important;
    padding-left: 11px !important;
}

:deep(.is-invalid-select2 .select2-selection) {
    border-color: var(--red) !important;
}

/* ─── PLANILLAS DIARIAS ────────────────────────────────────── */
.pct-dias-box {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 14px;
    margin-bottom: 13px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.pct-dia-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 4px;
    border-bottom: 1px dashed var(--border);
}

.pct-dia-row:last-child {
    border-bottom: none;
}

.pct-dia-fecha {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
}

.pct-dia-flag {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 999px;
    white-space: nowrap;
}

.pct-dia-abierto {
    background: var(--green-light);
    color: var(--green);
    border: 1px solid var(--green-dim);
}

.pct-dia-cerrado {
    background: var(--surface);
    color: var(--text-muted);
    border: 1px solid var(--border-dark);
}

.pct-summary-table tr.pct-dia-activo {
    background: var(--accent-light);
}

.pct-summary-table tr.pct-dia-activo td {
    color: var(--accent);
    font-weight: 700;
}
</style>
