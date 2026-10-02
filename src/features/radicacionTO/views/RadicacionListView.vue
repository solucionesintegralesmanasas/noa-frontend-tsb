<template>
  <div class="row gx-3">
    <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
      <BasePageHeader
        title="Radicación de tarjeta de operación"
        subtitle="Gestione y consulte los trámites de vinculación vehicular con su línea de tiempo"
        icon="fad fa-id-card text-primary"
        :breadcrumbs="[{ label: 'Radicación' }]"
        :show-back="false"
      />

      <!-- ══════════════ Listado de expedientes ══════════════ -->
      <div class="card border-0 shadow-sm mt-3">
        <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center gap-2">
          <span class="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style="width:32px;height:32px;" aria-hidden="true">
            <i class="fad fa-list text-primary"></i>
          </span>
          <h2 class="h6 mb-0 fw-semibold">Trámites por vehículo</h2>
          <button
            class="btn btn-sm btn-outline-primary ms-auto d-inline-flex align-items-center gap-1"
            :disabled="cargandoExp"
            @click="cargarExpedientes"
            aria-label="Actualizar listado de trámites"
          >
            <i class="fas" :class="cargandoExp ? 'fa-spinner fa-spin' : 'fa-rotate-right'" aria-hidden="true"></i>
            Actualizar
          </button>
        </div>

        <div class="card-body p-0">
          <!-- Cargando -->
          <div v-if="cargandoExp" class="p-4 text-center text-muted">
            <i class="fas fa-spinner fa-spin me-2" aria-hidden="true"></i>
            <span role="status">Cargando trámites…</span>
          </div>

          <!-- Vacío -->
          <div v-else-if="expedientes.length === 0" class="p-5 text-center text-muted">
            <i class="fad fa-folder-open fa-2x mb-3 d-block text-secondary" aria-hidden="true"></i>
            <p class="mb-1 fw-medium">Aún no hay trámites registrados</p>
            <p class="noa-helper mb-0">Complete el formulario de abajo para crear el primero.</p>
          </div>

          <!-- Tabla -->
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="ps-4">Código</th>
                  <th scope="col">Vehículo</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Avance</th>
                  <th scope="col">Estado de pasos</th>
                  <th scope="col" class="text-end pe-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in expedientes" :key="e.uuid">
                  <td class="ps-4">
                    <span class="fw-medium text-dark">{{ e.procedure_code }}</span>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border fw-normal px-2">
                      <i class="fas fa-car-side me-1 text-muted" aria-hidden="true"></i>
                      {{ e.vehicle?.vehicle_license_plate ?? '—' }}
                    </span>
                  </td>
                  <td>
                    <span class="text-muted small">{{ etiquetaTipo(e.link_type) }}</span>
                  </td>
                  <td>
                    <span class="badge bg-primary rounded-pill px-2">{{ e.avance }}</span>
                  </td>
                  <td>
                    <template v-if="expedienteCompletado(e)">
                      <span class="badge bg-success rounded-pill px-3">
                        <i class="fas fa-check me-1" aria-hidden="true"></i>Completado
                      </span>
                    </template>
                    <template v-else>
                      <div class="d-flex flex-wrap gap-1 mb-1">
                        <span
                          v-for="p in e.linea_tiempo"
                          :key="p.paso"
                          class="badge rounded-pill"
                          :class="{
                            'bg-success': p.estado === 'COMPLETADO',
                            'bg-warning text-dark': p.estado === 'EN_PROCESO',
                            'bg-secondary bg-opacity-50 text-secondary-emphasis': !['COMPLETADO','EN_PROCESO'].includes(p.estado),
                          }"
                          :title="etiquetaPaso(p.paso) + ': ' + p.estado"
                        >{{ etiquetaPasoCorta(p.paso) }}</span>
                      </div>
                      <span class="noa-meta text-muted">{{ textoActual(e) }}</span>
                    </template>
                  </td>
                  <td class="text-end pe-4">
                    <router-link
                      class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                      :to="`/radicacion/${e.uuid}`"
                    >
                      <i class="fas fa-eye" aria-hidden="true"></i>
                      Ver expediente
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ══════════════ Formulario: Nuevo trámite ══════════════ -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-header bg-white py-3 px-4 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <span class="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style="width:32px;height:32px;" aria-hidden="true">
              <i class="fad fa-plus text-success"></i>
            </span>
            <h2 class="h6 mb-0 fw-semibold">Nuevo trámite</h2>
            <span class="badge bg-secondary bg-opacity-10 text-secondary ms-2 fw-normal rounded-pill">
              <i class="fas fa-asterisk me-1 obligatorio-icon" aria-hidden="true"></i>
              Campos obligatorios
            </span>
          </div>
        </div>

        <div class="card-body px-4 py-4">
          <form ref="formRef" @submit.prevent="crear" novalidate>
            <!-- Sección 1: Identificación -->
            <div class="mb-4">
              <p class="noa-section-label text-muted mb-3 border-bottom pb-2">
                <i class="fas fa-tag me-1" aria-hidden="true"></i>Identificación del trámite
              </p>
              <div class="row g-3">
                <div class="col-12 col-sm-6 col-md-4">
                  <label class="form-label required noa-label" for="f-tipo">Tipo de trámite</label>
                  <PrimeSelect
                    :input-id="'f-tipo'"
                    v-model="form.link_type"
                    :options="tipos"
                    option-label="label"
                    option-value="value"
                    placeholder="Seleccione el tipo"
                    class="w-100"
                    :invalid="!!errores.link_type"
                  />
                  <div v-if="errores.link_type" class="invalid-feedback d-block" id="f-tipo-error" role="alert">
                    {{ errores.link_type }}
                  </div>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                  <label class="form-label required noa-label" for="f-codigo">Código del trámite</label>
                  <input
                    id="f-codigo"
                    type="text"
                    autocomplete="off"
                    class="form-control"
                    v-model="form.procedure_code"
                    placeholder="Ej. TO-2026-001"
                    :class="{ 'is-invalid': errores.procedure_code }"
                    :aria-invalid="!!errores.procedure_code"
                    :aria-describedby="errores.procedure_code ? 'f-codigo-error' : undefined"
                  />
                  <div v-if="errores.procedure_code" class="invalid-feedback d-block" id="f-codigo-error" role="alert">
                    {{ errores.procedure_code }}
                  </div>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                  <label class="form-label required noa-label" for="f-fecha">Fecha de creación</label>
                  <DateInput
                    id="f-fecha"
                    v-model="form.date_of_creation"
                    class="form-control"
                    placeholder="dd/mm/aaaa"
                    autocomplete="off"
                    :class="{ 'is-invalid': errores.date_of_creation }"
                    :aria-invalid="!!errores.date_of_creation"
                    :aria-describedby="errores.date_of_creation ? 'f-fecha-error' : undefined"
                  />
                  <div v-if="errores.date_of_creation" class="invalid-feedback d-block" id="f-fecha-error" role="alert">
                    {{ errores.date_of_creation }}
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label noa-label" for="f-asunto">Asunto</label>
                  <input
                    id="f-asunto"
                    type="text"
                    autocomplete="off"
                    class="form-control"
                    v-model="form.subject"
                    placeholder="Radicación de tarjeta de operación"
                  />
                  <div class="form-text">Opcional. Se usa como referencia interna del expediente.</div>
                </div>
              </div>
            </div>

            <!-- Sección 2: Vehículo y ubicación -->
            <div class="mb-4">
              <p class="noa-section-label text-muted mb-3 border-bottom pb-2">
                <i class="fas fa-truck me-1" aria-hidden="true"></i>Vehículo y ubicación
              </p>
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <label class="form-label required noa-label" for="f-vehiculo">Vehículo</label>
                  <PrimeSelect
                    :input-id="'f-vehiculo'"
                    v-model="form.vehicle_uuid"
                    :options="vehiculos"
                    option-label="label"
                    option-value="value"
                    placeholder="Buscar por placa"
                    showClear
                    filter
                    :loading="cargandoListas"
                    class="w-100"
                    :invalid="!!errores.vehicle_uuid"
                  />
                  <div v-if="errores.vehicle_uuid" class="invalid-feedback d-block" id="f-vehiculo-error" role="alert">
                    {{ errores.vehicle_uuid }}
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label required noa-label" for="f-ciudad">Ciudad de radicación</label>
                  <PrimeSelect
                    :input-id="'f-ciudad'"
                    v-model="form.city_uuid"
                    :options="ciudades"
                    option-label="label"
                    option-value="value"
                    placeholder="Seleccione la ciudad"
                    showClear
                    filter
                    :loading="cargandoListas"
                    class="w-100"
                    :invalid="!!errores.city_uuid"
                  />
                  <div v-if="errores.city_uuid" class="invalid-feedback d-block" id="f-ciudad-error" role="alert">
                    {{ errores.city_uuid }}
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label required noa-label" for="f-director">Dirección territorial</label>
                  <PrimeSelect
                    :input-id="'f-director'"
                    v-model="form.territorial_director_uuid"
                    :options="directores"
                    option-label="label"
                    option-value="value"
                    placeholder="Seleccione la dirección territorial"
                    showClear
                    filter
                    :loading="cargandoListas"
                    class="w-100"
                    :invalid="!!errores.territorial_director_uuid"
                  />
                  <div v-if="errores.territorial_director_uuid" class="invalid-feedback d-block" id="f-director-error" role="alert">
                    {{ errores.territorial_director_uuid }}
                  </div>
                  <div v-if="directorSugerido" class="form-text">
                    <i class="fas fa-circle-info me-1" aria-hidden="true"></i>
                    Dirección por defecto de la empresa: <strong>{{ directorSugerido }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="pt-3 border-top">
              <BaseFormActions
                :submitting="cargando"
                :is-edit-mode="false"
                submit-label="Crear expediente e iniciar trámite"
                cancel-label="Limpiar formulario"
                cancel-icon="fas fa-eraser"
                @cancel="limpiar"
              />
            </div>
          </form>

          <!-- Confirmación de creación -->
          <div v-if="creado" class="alert alert-success mt-4 d-flex align-items-center gap-2" role="alert">
            <i class="fas fa-circle-check fa-lg" aria-hidden="true"></i>
            <div>
              Expediente <strong>{{ creado.expediente.procedure_code }}</strong> creado correctamente.
              <router-link :to="`/radicacion/${creado.expediente.uuid}`" class="alert-link ms-1">
                Ir al expediente →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import PrimeSelect from '@/components/form/PrimeSelect.vue';
import DateInput from '@/components/form/DateInput.vue';
import service, { mensajeDeError } from '../services/radicacion.service.js';
import vehiclesService from '@/features/vehicles/services/vehicles.service.js';
import systemConfigurationService from '@/features/systemConfiguration/services/systemConfiguration.service.js';
import { useUserStore } from '@store';
import { toast } from '@/utils/toast.js';
import { logger } from '@/utils/logger.js';
import {
  etiquetaPaso,
  etiquetaPasoCorta,
  etiquetaTipo,
  expedienteCompletado,
} from '../utils/pasosRadicacion.js';

const tipos = [
  { label: 'Vehículo nuevo', value: 'NUEVO_VEHICULO' },
  { label: 'Cambio de empresa', value: 'CAMBIO_DE_EMPRESA' },
  { label: 'Renovación de tarjeta', value: 'RENOVACION' },
  { label: 'Desvinculación por mutuo acuerdo', value: 'DESVINCULACION_MUTUO' },
  { label: 'Desvinculación unilateral', value: 'DESVINCULACION_UNILATERAL' },
];
const textoActual = (e) => {
  const actual = (e.linea_tiempo ?? []).find((p) => p.estado === 'EN_PROCESO') ?? (e.linea_tiempo ?? []).find((p) => p.estado !== 'COMPLETADO');
  return actual ? `Va en: ${etiquetaPaso(actual.paso)} (${actual.estado})` : 'Trámite completado';
};
const formRef = ref(null);
const form = reactive({ link_type: 'CAMBIO_DE_EMPRESA', vehicle_uuid: '', procedure_code: '', date_of_creation: new Date().toISOString().slice(0, 10), subject: 'Radicación de tarjeta de operación', city_uuid: '', territorial_director_uuid: '' });
const errores = reactive({});
const cargando = ref(false);
const cargandoListas = ref(true);
const cargandoExp = ref(false);
const creado = ref(null);
const vehiculos = ref([]);
const ciudades = ref([]);
const directores = ref([]);
const directorSugerido = ref('');
const expedientes = ref([]);
const esVacio = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

async function cargarExpedientes() {
  cargandoExp.value = true;
  try {
    const r = await service.expedientes({ per_page: 50 });
    const pag = r.data?.data ?? r.data ?? {};
    expedientes.value = pag.data ?? pag ?? [];
  } catch (e) { logger.warn('No se cargaron expedientes'); }
  finally { cargandoExp.value = false; }
}
async function cargarListas() {
  cargandoListas.value = true;
  try {
    const v = await vehiclesService.list({ per_page: 100 });
    const items = v.data?.data?.data ?? v.data?.data ?? v.data ?? [];
    const vistos = new Set();
    vehiculos.value = (Array.isArray(items) ? items : []).filter((x) => {
      const k = x?.uuid ?? x?.vehicle_license_plate;
      if (!k || vistos.has(k)) return false;
      vistos.add(k);
      return true;
    }).map((x) => ({ label: `${x.vehicle_license_plate ?? 'Sin placa'} — ${x.line ?? ''}`, value: x.uuid }));
  } catch (e) { logger.warn('No se cargaron vehículos'); }
  try { ciudades.value = await service.listarCiudades(); } catch { ciudades.value = []; }
  try { directores.value = await service.listarDirectores(); } catch { directores.value = []; }
  try {
    const userStore = useUserStore();
    if (userStore.company_uuid) {
      const cfg = await systemConfigurationService.getByCompany(userStore.company_uuid);
      const data = cfg.data?.data ?? cfg.data ?? {};
      if (data.default_territorial_director_uuid && !form.territorial_director_uuid) form.territorial_director_uuid = data.default_territorial_director_uuid;
      directorSugerido.value = data.default_territorial_director_name || '';
    }
  } catch (e) { logger.warn('No se cargó la dirección territorial por defecto'); }
  finally { cargandoListas.value = false; }
}
function limpiar() {
  Object.assign(form, { link_type: 'CAMBIO_DE_EMPRESA', vehicle_uuid: '', procedure_code: '', date_of_creation: new Date().toISOString().slice(0, 10), subject: 'Radicación de tarjeta de operación', city_uuid: '', territorial_director_uuid: '' });
  Object.keys(errores).forEach((k) => delete errores[k]);
  creado.value = null;
}
async function enfocarPrimerError() {
  await nextTick();
  const el = document.querySelector('[aria-invalid="true"], .is-invalid');
  if (el) {
    if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(el.tagName)) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
async function crear() {
  Object.keys(errores).forEach((k) => delete errores[k]);
  if (esVacio(form.link_type)) errores.link_type = 'Seleccione el tipo de trámite.';
  if (esVacio(form.vehicle_uuid)) errores.vehicle_uuid = 'Seleccione el vehículo.';
  if (esVacio(form.procedure_code)) errores.procedure_code = 'El código es obligatorio.';
  if (esVacio(form.date_of_creation)) errores.date_of_creation = 'La fecha es obligatoria.';
  if (esVacio(form.city_uuid)) errores.city_uuid = 'Seleccione la ciudad.';
  if (esVacio(form.territorial_director_uuid)) errores.territorial_director_uuid = 'Seleccione la dirección territorial.';
  if (Object.keys(errores).length > 0) {
    await enfocarPrimerError();
    toast('Revise los datos del formulario', '', 'warning');
    return;
  }
  cargando.value = true;
  try {
    const r = await service.crearExpediente({ ...form });
    creado.value = r.data?.data ?? r.data;
    toast('Expediente creado', '', 'success');
    cargarExpedientes();
  } catch (e) {
    Object.assign(errores, e.response?.data?.errors ?? e.response?.data?.error?.details ?? {});
    await enfocarPrimerError();
    toast('Revise los datos del formulario', mensajeDeError(e), 'error');
  } finally { cargando.value = false; }
}
onMounted(async () => { await cargarListas(); await cargarExpedientes(); });
</script>

<style scoped>
.required::after { content: " *"; color: #dc3545; }

/* ── Tipografía unificada ── */
.noa-label         { font-size: 0.85rem; font-weight: 600; }
.noa-helper        { font-size: 0.8rem; }
.noa-section-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.noa-meta          { font-size: 0.78rem; }
.noa-badge-xs      { font-size: 0.72rem; font-weight: 700; }
.obligatorio-icon  { font-size: 0.55rem; }
</style>
