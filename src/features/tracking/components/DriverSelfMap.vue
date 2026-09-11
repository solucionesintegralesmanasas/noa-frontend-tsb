<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useTrackingStore } from '../store/tracking.store';
import { useGeolocation } from '@/hooks/useGeolocation';

const props = defineProps({
    vehicles: {
        type: Array,
        default: () => [],
    },
    preferredVehicleUuid: {
        type: String,
        default: null,
    },
});

const trackingStore = useTrackingStore();

const geolocation = useGeolocation({ sendToServer: true, intervalMs: 10000 });

const selectedVehicleUuid = ref(props.preferredVehicleUuid || props.vehicles[0]?.uuid || null);
const sessionDuration = ref(0);
const errorMsg = ref('');

let autoStarted = false;
let map = null;
let markerInstance = null;
let polylineInstance = null;
let durationTimer = null;

const isTracking = computed(() => trackingStore.isTracking);
const session = computed(() => trackingStore.currentSession);

const hasVehicles = computed(() => props.vehicles && props.vehicles.length > 0);

const formattedDuration = computed(() => {
    const total = sessionDuration.value;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
});

const vehicleLabel = computed(() => {
    if (!selectedVehicleUuid.value) return 'Vehículo no asignado';
    const vehicle = props.vehicles.find((v) => v.uuid === selectedVehicleUuid.value);
    return vehicle ? `${vehicle.plate || 'SIN-PLACA'} · ${vehicle.brand || ''} ${vehicle.line || ''}`.trim() : 'Vehículo';
});

async function initAutoTracking() {
    if (autoStarted || trackingStore.isTracking) return;
    if (!selectedVehicleUuid.value) return;

    autoStarted = true;

    // 0) Capturar el punto exacto donde el conductor inicia sesión.
    // Si el GPS tarda o el permiso se deniega, se continúa igualmente.
    let firstPosition = null;
    try {
        firstPosition = await geolocation.getCurrentPosition();
    } catch (err) {
        console.warn('No se pudo obtener la primera posición inmediata:', err?.message);
    }

    // 1) Crear sesión de tracking (backend)
    const session = await trackingStore.startTracking({
        vehicle_uuid: selectedVehicleUuid.value,
    });

    // 2) Vincular contexto de envío con la sesión creada
    geolocation.setTrackingContext({
        sendToServer: true,
        sessionUuid: session?.uuid || null,
        vehicleUuid: selectedVehicleUuid.value,
    });

    // 3) Enviar de inmediato la primera ubicación (punto de inicio de sesión)
    if (firstPosition && firstPosition.coords) {
        const firstSpeed = firstPosition.coords.speed || 0;
        geolocation.sendImmediate({
            lat: firstPosition.coords.latitude,
            lng: firstPosition.coords.longitude,
            speed: Math.round(firstSpeed * 3.6),
            isMoving: firstSpeed > 0.2,
            accuracy: firstPosition.coords.accuracy ?? null,
        });
    }

    // 4) Iniciar el watch del GPS y el envío periódico
    geolocation.startTracking(
        () => {},
        (err) => {
            errorMsg.value = 'Error de GPS: ' + (err?.message || 'permiso denegado');
            autoStarted = false;
        }
    );

    sessionDuration.value = 0;
    if (durationTimer) clearInterval(durationTimer);
    durationTimer = setInterval(() => sessionDuration.value++, 1000);
}

async function setupMap() {
    try {
        const L = await geolocation.loadLeaflet();
        if (!document.getElementById('driverSelfMap')) return;

        map = L.map('driverSelfMap', {
            center: [4.710993, -74.072068],
            zoom: 14,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 300);
    } catch (err) {
        console.error('Error inicializando mapa del conductor:', err);
    }
}

watch(
    () => geolocation.coords.value,
    (pos) => {
        if (!map || !pos || pos.latitude === null || pos.longitude === null) return;
        const L = window.L;
        if (!L) return;

        const lat = pos.latitude;
        const lng = pos.longitude;

        if (!markerInstance) {
            markerInstance = L.marker([lat, lng], { zIndexOffset: 1000 }).addTo(map);
            markerInstance.bindPopup('<strong>Tu ubicación en vivo</strong>');
        } else {
            markerInstance.setLatLng([lat, lng]);
        }

        if (polylineInstance) {
            polylineInstance.setLatLngs(geolocation.routeHistory.value);
        } else if (geolocation.routeHistory.value.length > 1) {
            polylineInstance = L.polyline(geolocation.routeHistory.value, {
                color: '#2c7be5',
                weight: 5,
                opacity: 0.7,
            }).addTo(map);
        }

        map.panTo([lat, lng]);
    },
    { deep: true }
);

watch(
    () => [props.vehicles, props.preferredVehicleUuid],
    () => {
        if (!selectedVehicleUuid.value) {
            const fallback = props.preferredVehicleUuid || props.vehicles[0]?.uuid || null;
            if (fallback) selectedVehicleUuid.value = fallback;
        }
        initAutoTracking();
    },
    { immediate: true }
);

onMounted(() => {
    setupMap();
});

onBeforeUnmount(() => {
    if (durationTimer) clearInterval(durationTimer);
    geolocation.stopTracking();
    if (trackingStore.isTracking) {
        trackingStore.stopTracking();
    }
    if (map) {
        map.remove();
        map = null;
    }
});
</script>

<template>
    <div class="card border-0 shadow-sm self-tracking-map overflow-hidden h-100">
        <div class="card-header bg-light d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 px-3">
            <div class="d-flex align-items-center gap-2">
                <h6 class="mb-0 fw-bold text-900 fs-14">Mi Ubicación en Vivo</h6>
                <span class="badge rounded-pill bg-danger text-white d-inline-flex align-items-center gap-1">
                    <span class="pulse-indicator-live bg-white"></span>
                    LIVE
                </span>
                <span v-if="vehicleLabel" class="badge bg-subtle-secondary text-dark fw-semibold">
                    <i class="fas fa-car me-1"></i>{{ vehicleLabel }}
                </span>
            </div>
            <div v-if="isTracking" class="d-flex align-items-center gap-3 fs-11 text-700">
                <span class="d-inline-flex align-items-center gap-1 text-success">
                    <i class="fas fa-satellite"></i>
                    {{ geolocation.speed.value }} km/h
                </span>
                <span class="d-inline-flex align-items-center gap-1 text-primary">
                    <i class="far fa-clock"></i>
                    {{ formattedDuration }}
                </span>
            </div>
        </div>

        <div class="card-body p-0 position-relative" style="min-height: 380px;">
            <div id="driverSelfMap" class="w-100" style="height: 380px; z-index: 0;"></div>

            <!-- Overlay informativo -->
            <div class="position-absolute bottom-0 start-0 p-2 w-100 d-flex justify-content-between align-items-end pointer-events-none">
                <div class="bg-white bg-opacity-90 rounded-2 shadow-sm px-2 py-1 fs-11 text-700">
                    <span v-if="geolocation.coords.value.latitude !== null" class="d-inline-flex align-items-center gap-1 text-primary">
                        <i class="fas fa-map-marker-alt"></i>
                        {{ Number(geolocation.coords.value.latitude).toFixed(6) }}, {{ Number(geolocation.coords.value.longitude).toFixed(6) }}
                    </span>
                    <span v-else class="text-muted">
                        <i class="fas fa-spinner fa-spin me-1"></i>Esperando señal GPS…
                    </span>
                </div>
                <div v-if="isTracking" class="bg-white bg-opacity-90 rounded-2 shadow-sm px-2 py-1 fs-11 fw-bold"
                    :class="geolocation.isMoving.value ? 'text-warning' : 'text-secondary'">
                    {{ geolocation.isMoving.value ? 'En ruta' : 'Detenido' }}
                </div>
            </div>

            <!-- Estado de error -->
            <div v-if="errorMsg" class="position-absolute top-2 start-0 end-0 mx-3">
                <div class="alert alert-danger py-1 px-2 fs-11 mb-0 text-center shadow-sm">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ errorMsg }}
                </div>
            </div>
        </div>

        <div v-if="!isTracking" class="card-footer bg-white py-2 px-3 fs-11 text-muted d-flex align-items-center justify-content-between">
            <span>
                <i class="fas fa-circle-notch fa-spin text-primary me-1"></i>
                Inicializando rastreo GPS automático…
            </span>
            <button v-if="hasVehicles" class="btn btn-sm btn-link p-0 text-primary fs-11" data-bs-toggle="collapse" data-bs-target="#selfMapVehiclePicker" type="button">
                Cambiar vehículo
            </button>
        </div>
    </div>
</template>

<style scoped>
.self-tracking-map {
    border-left: 5px solid #00d27a !important;
    border-radius: 12px;
}

.pulse-indicator-live {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
    animation: pulse-live 1.4s ease-out infinite;
}

@keyframes pulse-live {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
    70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}
</style>