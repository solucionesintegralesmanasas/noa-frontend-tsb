<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import DriverMap from '../components/DriverMap.vue';
import DriverMarker from '../components/DriverMarker.vue';
import { useTrackingStore } from '../store/tracking.store';
import { usePermissions } from '@/store/modules/permissions';
import { useToast } from 'vue-toastification';

const router = useRouter();
const store = useTrackingStore();
const permissions = usePermissions();
const toast = useToast();

const canViewHistory = ref(false);
const canViewGeofences = ref(false);

const searchTerm = ref('');
const loadingDrivers = ref(false);

const filteredDrivers = computed(() => {
    if (!searchTerm.value.trim()) return store.activeDrivers;
    const term = searchTerm.value.toLowerCase();
    return store.activeDrivers.filter((d) => {
        const name = `${d.driver?.first_name || ''} ${d.driver?.last_name || ''}`.toLowerCase();
        const plate = d.vehicle?.vehicle_license_plate || '';
        const doc = d.driver?.document_number || '';
        return name.includes(term) || plate.includes(term) || doc.includes(term);
    });
});

const stats = computed(() => ({
    active: store.activeDrivers.filter((d) => d.is_moving || d.last_location?.is_moving).length,
    stopped: store.activeDrivers.filter((d) => !d.is_moving && !(d.last_location?.is_moving)).length,
    total: store.activeDrivers.length,
    alerts: store.alerts.filter((a) => !a.is_read).length,
}));

let refreshInterval = null;

function refreshDrivers() {
    loadingDrivers.value = true;
    store.fetchActiveDrivers().finally(() => {
        loadingDrivers.value = false;
    });
}

function openHistory(driver) {
    const uuid = driver.third_party_uuid || driver.driver?.uuid;
    if (uuid) {
        router.push({ name: 'tracking.history', params: { uuid } });
    }
}

function showLocation(driver) {
    store.selectDriver(driver);
}

function goToGeofences() {
    router.push({ name: 'tracking.geofences.list' });
}

function markAllRead() {
    store.alerts.filter((a) => !a.is_read).forEach((a) => store.markAlertRead(a.uuid));
    toast.success('Alertas marcadas como leídas');
}

onMounted(async () => {
    canViewHistory.value = permissions.hasPermission('locations.history');
    canViewGeofences.value = permissions.hasPermission('locations.geofences');

    refreshDrivers();
    store.fetchAlerts({ only_unread: true, per_page: 20 });
    store.fetchGeofences();

    refreshInterval = setInterval(refreshDrivers, 10000);
});

onBeforeUnmount(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});
</script>

<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Rastreo de Conductores</h1>
                <p class="text-sm text-gray-500">Monitoreo en tiempo real de la flota</p>
            </div>

            <div class="flex gap-2">
                <button v-if="canViewGeofences"
                    class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium flex items-center gap-2"
                    @click="goToGeofences">
                    <i class="pi pi-map-marker"></i> Geocercas
                </button>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                    @click="refreshDrivers">
                    <i class="pi pi-refresh" :class="{ 'animate-spin': loadingDrivers }"></i> Actualizar
                </button>
            </div>
        </div>

        <div class="grid grid-cols-4 gap-3 mb-4">
            <div class="bg-white rounded-xl shadow p-4">
                <div class="text-3xl font-bold text-gray-800">{{ stats.total }}</div>
                <div class="text-xs text-gray-500 mt-1">Conductores en línea</div>
            </div>
            <div class="bg-white rounded-xl shadow p-4">
                <div class="text-3xl font-bold text-green-600">{{ stats.active }}</div>
                <div class="text-xs text-gray-500 mt-1">En movimiento</div>
            </div>
            <div class="bg-white rounded-xl shadow p-4">
                <div class="text-3xl font-bold text-amber-500">{{ stats.stopped }}</div>
                <div class="text-xs text-gray-500 mt-1">Detenidos</div>
            </div>
            <div class="bg-white rounded-xl shadow p-4">
                <div class="text-3xl font-bold text-red-500">{{ stats.alerts }}</div>
                <div class="text-xs text-gray-500 mt-1">Alertas sin leer</div>
            </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 lg:col-span-3 bg-white rounded-xl shadow overflow-hidden">
                <div class="p-3 border-b border-gray-200">
                    <input v-model="searchTerm" type="text" placeholder="Buscar conductor, placa, documento..."
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div class="max-h-[600px] overflow-y-auto">
                    <DriverMarker v-for="driver in filteredDrivers" :key="driver.third_party_uuid" :driver="driver"
                        @open-history="openHistory" @show-location="showLocation" />

                    <div v-if="!filteredDrivers.length && !loadingDrivers"
                        class="p-6 text-center text-gray-400 text-sm">
                        <i class="pi pi-inbox text-3xl block mb-2"></i>
                        No hay conductores reportando ubicación
                    </div>

                    <div v-if="loadingDrivers" class="p-6 text-center text-gray-400">
                        <i class="pi pi-spin pi-spinner text-2xl"></i>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-9 bg-white rounded-xl shadow p-3">
                <DriverMap @driver-selected="showLocation" />

                <div v-if="store.alerts.length" class="mt-3 border-t border-gray-100 pt-3">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="font-semibold text-sm text-gray-700">Últimas alertas</h3>
                        <button class="text-xs text-blue-600 hover:underline" @click="markAllRead">Marcar todas como leídas</button>
                    </div>
                    <div class="space-y-1 max-h-32 overflow-y-auto">
                        <div v-for="alert in store.alerts.slice(0, 5)" :key="alert.uuid"
                            class="flex items-center justify-between text-xs p-2 rounded bg-slate-50">
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 rounded text-white text-[10px] font-semibold"
                                    :class="{
                                        'bg-red-500': alert.alert_type.includes('speed') || alert.alert_type.includes('exit'),
                                        'bg-green-500': alert.alert_type === 'geofence_enter',
                                        'bg-amber-500': alert.alert_type === 'idle',
                                    }">
                                    {{ alert.alert_type }}
                                </span>
                                <span>{{ alert.message }}</span>
                            </div>
                            <button class="text-gray-400 hover:text-gray-600"
                                @click="store.markAlertRead(alert.uuid)">
                                <i class="pi pi-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>