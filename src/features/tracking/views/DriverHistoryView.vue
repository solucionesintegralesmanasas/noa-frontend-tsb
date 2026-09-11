<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { useTrackingStore } from '../store/tracking.store';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const store = useTrackingStore();
const { loadLeaflet } = useGeolocation();
const toast = useToast();

const driverUuid = route.params.uuid;
const startDate = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
const endDate = ref(dayjs().format('YYYY-MM-DD'));

const loading = ref(false);
let map = null;
let polylineLayer = null;
let startMarker = null;
let endMarker = null;

const totalDistance = computed(() => {
    const history = store.driverHistory;
    if (history.length < 2) return 0;
    let distance = 0;
    for (let i = 1; i < history.length; i++) {
        distance += haversine(
            parseFloat(history[i - 1].latitude),
            parseFloat(history[i - 1].longitude),
            parseFloat(history[i].latitude),
            parseFloat(history[i].longitude)
        );
    }
    return (distance / 1000).toFixed(2);
});

const totalPoints = computed(() => store.driverHistory.length);

const duration = computed(() => {
    const history = store.driverHistory;
    if (!history.length) return '—';
    const first = dayjs(history[0].recorded_at);
    const last = dayjs(history[history.length - 1].recorded_at);
    const minutes = last.diff(first, 'minute');
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
});

const avgSpeed = computed(() => {
    const moving = store.driverHistory.filter((p) => parseFloat(p.speed) > 0);
    if (!moving.length) return 0;
    return (moving.reduce((a, p) => a + parseFloat(p.speed), 0) / moving.length).toFixed(1);
});

const maxSpeed = computed(() => {
    if (!store.driverHistory.length) return 0;
    return Math.max(...store.driverHistory.map((p) => parseFloat(p.speed))).toFixed(1);
});

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function loadHistory() {
    loading.value = true;
    await store.fetchDriverHistory(driverUuid, startDate.value, endDate.value);
    await store.fetchDriverStats(driverUuid);
    drawRoute();
    loading.value = false;
}

async function drawRoute() {
    if (!map) return;
    const L = window.L;
    if (!L) return;

    if (polylineLayer) map.removeLayer(polylineLayer);
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);

    const history = store.driverHistory;
    if (history.length < 2) return;

    const points = history.map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)]);

    polylineLayer = L.polyline(points, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
    }).addTo(map);

    startMarker = L.circleMarker(points[0], { radius: 8, color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }).addTo(map);
    endMarker = L.circleMarker(points[points.length - 1], { radius: 8, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }).addTo(map);

    map.fitBounds(L.latLngBounds(points).pad(0.1));
}

function goBack() {
    router.push({ name: 'tracking.map' });
}

watch([startDate, endDate], () => {
    if (startDate.value > endDate.value) {
        toast.error('La fecha de inicio no puede ser mayor que la de fin');
        return;
    }
    loadHistory();
});

onMounted(async () => {
    try {
        const L = await loadLeaflet();
        map = L.map('historyMap', { center: [4.710993, -74.072068], zoom: 13 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        await loadHistory();

        setTimeout(() => map?.invalidateSize(), 300);
    } catch (err) {
        console.error('Error inicializando mapa de historial:', err);
    }
});
</script>

<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Historial de Ruta</h1>
                <p class="text-sm text-gray-500" v-if="store.stats?.active_session">
                    Sesión activa iniciada: {{ dayjs(store.stats.active_session.started_at).format('DD/MM/YYYY HH:mm') }}
                </p>
            </div>

            <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                @click="goBack">
                <i class="pi pi-arrow-left mr-1"></i> Volver al mapa
            </button>
        </div>

        <div class="bg-white rounded-xl shadow p-4 mb-4">
            <div class="flex items-center gap-4 flex-wrap">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Desde</label>
                    <input type="date" v-model="startDate"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">Hasta</label>
                    <input type="date" v-model="endDate"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div class="ml-auto flex items-center gap-6 text-center">
                    <div>
                        <div class="text-2xl font-bold text-gray-800">{{ totalDistance }}</div>
                        <div class="text-xs text-gray-500">km recorridos</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-gray-800">{{ duration }}</div>
                        <div class="text-xs text-gray-500">duración</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-gray-800">{{ avgSpeed }}</div>
                        <div class="text-xs text-gray-500">km/h promedio</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-gray-800">{{ maxSpeed }}</div>
                        <div class="text-xs text-gray-500">km/h máx</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-gray-800">{{ totalPoints }}</div>
                        <div class="text-xs text-gray-500">puntos GPS</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow p-3">
            <div class="w-full h-[600px] rounded-lg relative">
                <div id="historyMap" class="w-full h-full absolute inset-0"></div>

                <div v-if="loading" class="absolute inset-0 bg-white/70 flex items-center justify-center z-[1000]">
                    <div class="text-center">
                        <i class="pi pi-spin pi-spinner text-3xl text-blue-600 block mx-auto"></i>
                        <span class="text-sm text-gray-600 mt-2 inline-block">Cargando historial...</span>
                    </div>
                </div>

                <div v-if="!loading && !store.driverHistory.length"
                    class="absolute inset-0 bg-white/70 flex items-center justify-center z-[1000]">
                    <div class="text-center text-gray-400">
                        <i class="pi pi-map text-3xl block mb-2"></i>
                        Sin puntos de ubicación en el rango seleccionado
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>