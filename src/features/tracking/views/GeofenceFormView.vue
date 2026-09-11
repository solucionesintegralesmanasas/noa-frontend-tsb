<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTrackingStore } from '../store/tracking.store';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const store = useTrackingStore();
const { loadLeaflet } = useGeolocation();
const toast = useToast();

const isEdit = computed(() => route.name === 'tracking.geofences.edit');
const geofenceUuid = route.params.id;

const editing = ref(false);
const loading = ref(false);
const saving = ref(false);
let map = null;
let drawnLayer = null;
let circleLayer = null;

const form = ref({
    name: '',
    description: '',
    type: 'circle',
    center_lat: null,
    center_lng: null,
    radius_meters: 500,
    polygon_points: [],
    alert_on_enter: true,
    alert_on_exit: true,
    max_speed_kmh: null,
    is_active: true,
});

const validationErrors = ref({});

const computedPolygonCoords = computed(() =>
    form.value.polygon_points.map((p) => [p.lat, p.lng])
);

async function setupMap() {
    const L = await loadLeaflet();
    map = L.map('geofenceMap', { center: [4.710993, -74.072068], zoom: 13 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    map.on('click', (e) => {
        if (form.value.type === 'polygon') {
            addPolygonPoint(e.latlng.lat, e.latlng.lng);
        } else {
            form.value.center_lat = e.latlng.lat;
            form.value.center_lng = e.latlng.lng;
            redrawCircle();
        }
    });

    if (form.value.center_lat) {
        map.setView([form.value.center_lat, form.value.center_lng], 14);
        redrawCircle();
    }

    setTimeout(() => map?.invalidateSize(), 300);
}

function redrawCircle() {
    if (!map || !window.L) return;
    if (circleLayer) map.removeLayer(circleLayer);
    if (drawnLayer) map.removeLayer(drawnLayer);

    if (form.value.center_lat && form.value.center_lng && form.value.radius_meters) {
        circleLayer = window.L.circle([form.value.center_lat, form.value.center_lng], {
            radius: form.value.radius_meters,
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
        }).addTo(map);
    }
}

function addPolygonPoint(lat, lng) {
    form.value.polygon_points.push({ lat, lng });
    redrawPolygon();
}

function redrawPolygon() {
    if (!map || !window.L) return;
    if (drawnLayer) map.removeLayer(drawnLayer);
    if (circleLayer) map.removeLayer(circleLayer);

    if (form.value.polygon_points.length >= 3) {
        const coords = computedPolygonCoords.value;
        drawnLayer = window.L.polygon(coords, {
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.2,
        }).addTo(map);
    }
}

function removePolygonPoint(index) {
    form.value.polygon_points.splice(index, 1);
    redrawPolygon();
}

function resetDrawing() {
    if (drawnLayer && map) map.removeLayer(drawnLayer);
    if (circleLayer && map) map.removeLayer(circleLayer);
    form.value.polygon_points = [];
    redrawCircle();
}

async function loadGeofence() {
    if (!isEdit.value) return;

    editing.value = true;
    loading.value = true;
    try {
        const response = await store.fetchGeofence ? null : null;
        const { getGeofence } = await import('../services/tracking.service');
        const { data } = await getGeofence(geofenceUuid);
        const geofence = data?.data || data;
        if (geofence) {
            form.value = {
                name: geofence.name || '',
                description: geofence.description || '',
                type: geofence.type || 'circle',
                center_lat: geofence.center_lat ? parseFloat(geofence.center_lat) : null,
                center_lng: geofence.center_lng ? parseFloat(geofence.center_lng) : null,
                radius_meters: geofence.radius_meters || 500,
                polygon_points: (geofence.polygon_points || []).map((p) => ({
                    lat: parseFloat(p.lat ?? p[0]),
                    lng: parseFloat(p.lng ?? p[1]),
                })),
                alert_on_enter: !!geofence.alert_on_enter,
                alert_on_exit: !!geofence.alert_on_exit,
                max_speed_kmh: geofence.max_speed_kmh || null,
                is_active: !!geofence.is_active,
            };

            if (map && form.value.center_lat) {
                map.setView([form.value.center_lat, form.value.center_lng], 14);
                redrawCircle();
                redrawPolygon();
            }
        }
    } catch (err) {
        toast.error('Error cargando la geocerca');
    } finally {
        loading.value = false;
    }
}

function validate() {
    validationErrors.value = {};
    const errors = {};

    if (!form.value.name.trim()) errors.name = 'El nombre es obligatorio';

    if (form.value.type === 'circle') {
        if (form.value.center_lat === null || form.value.center_lng === null) {
            errors.center = 'Haz clic en el mapa para seleccionar el centro de la zona';
        }
        if (!form.value.radius_meters || form.value.radius_meters < 10) {
            errors.radius_meters = 'El radio debe ser al menos 10 metros';
        }
    }

    if (form.value.type === 'polygon' && form.value.polygon_points.length < 3) {
        errors.polygon_points = 'Agrega al menos 3 puntos en el mapa';
    }

    validationErrors.value = errors;
    return Object.keys(errors).length === 0;
}

async function save() {
    if (!validate()) {
        toast.error('Revisa los campos del formulario');
        return;
    }

    saving.value = true;
    try {
        const payload = {
            geofence: {
                name: form.value.name.trim(),
                description: form.value.description || null,
                type: form.value.type,
                center_lat: form.value.type === 'circle' ? form.value.center_lat : null,
                center_lng: form.value.type === 'circle' ? form.value.center_lng : null,
                radius_meters: form.value.type === 'circle' ? form.value.radius_meters : null,
                polygon_points: form.value.type === 'polygon' ? form.value.polygon_points : null,
                alert_on_enter: form.value.alert_on_enter,
                alert_on_exit: form.value.alert_on_exit,
                max_speed_kmh: form.value.max_speed_kmh || null,
                is_active: form.value.is_active,
            },
        };

        if (isEdit.value) {
            await store.updateGeofence(geofenceUuid, payload);
            toast.success('Geocerca actualizada exitosamente');
        } else {
            await store.createGeofence(payload);
            toast.success('Geocerca creada exitosamente');
        }

        router.push({ name: 'tracking.geofences.list' });
    } catch (err) {
        toast.error('Error al guardar la geocerca');
    } finally {
        saving.value = false;
    }
}

function cancel() {
    router.push({ name: 'tracking.geofences.list' });
}

onMounted(async () => {
    try {
        await setupMap();
        await loadGeofence();
    } catch (err) {
        console.error('Error inicializando formulario:', err);
    }
});
</script>

<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">
                    {{ isEdit ? 'Editar Geocerca' : 'Nueva Geocerca' }}
                </h1>
                <p class="text-sm text-gray-500">Define zonas geográficas para monitoreo</p>
            </div>

            <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                @click="cancel">
                <i class="pi pi-arrow-left mr-1"></i> Volver
            </button>
        </div>

        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 lg:col-span-4 bg-white rounded-xl shadow p-5">
                <form @submit.prevent="save" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input v-model="form.name" type="text"
                            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :class="validationErrors.name ? 'border-red-400' : 'border-gray-300'"
                            placeholder="Ej: Terminal de transportes" />
                        <p v-if="validationErrors.name" class="text-xs text-red-500 mt-1">{{ validationErrors.name }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea v-model="form.description" rows="2"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de zona</label>
                        <div class="flex gap-3">
                            <button type="button"
                                class="flex-1 px-3 py-2 text-sm rounded-lg border transition"
                                :class="form.type === 'circle' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
                                @click="redrawCircle(); form.center_lat = null; form.center_lng = null; form.polygon_points = []; form.type = 'circle'">
                                <i class="pi pi-circle mr-1"></i> Círculo
                            </button>
                            <button type="button"
                                class="flex-1 px-3 py-2 text-sm rounded-lg border transition"
                                :class="form.type === 'polygon' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
                                @click="resetDrawing(); form.type = 'polygon'">
                                <i class="pi pi-ellipsis-h mr-1"></i> Polígono
                            </button>
                        </div>
                    </div>

                    <div v-if="form.type === 'circle'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Radio (metros) *</label>
                        <input v-model.number="form.radius_meters" type="number" min="10" max="50000"
                            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :class="validationErrors.radius_meters ? 'border-red-400' : 'border-gray-300'" />
                        <p v-if="validationErrors.radius_meters" class="text-xs text-red-500 mt-1">{{ validationErrors.radius_meters }}</p>
                        <div class="mt-2 px-3 py-2 bg-gray-50 rounded text-xs text-gray-500">
                            Haz clic en el mapa para ubicar el centro de la zona.
                        </div>
                    </div>

                    <div v-if="form.type === 'polygon'">
                        <div class="px-3 py-2 bg-gray-50 rounded text-xs text-gray-500">
                            Haz clic en el mapa para agregar puntos del polígono.
                            <div v-if="form.polygon_points.length" class="mt-2">
                                <div v-for="(point, index) in form.polygon_points" :key="index"
                                    class="flex items-center justify-between py-1">
                                    <span>{{ point.lat.toFixed(6) }}, {{ point.lng.toFixed(6) }}</span>
                                    <button type="button" class="text-red-500 hover:text-red-700" @click="removePolygonPoint(index)">
                                        <i class="pi pi-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p v-if="validationErrors.polygon_points" class="text-xs text-red-500 mt-1">
                            {{ validationErrors.polygon_points }}
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Velocidad máx (km/h)</label>
                            <input v-model.number="form.max_speed_kmh" type="number" min="1" max="200"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input v-model="form.alert_on_enter" type="checkbox" class="w-4 h-4 text-blue-600 rounded" />
                            Alertar al ingresar a la zona
                        </label>
                        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input v-model="form.alert_on_exit" type="checkbox" class="w-4 h-4 text-red-600 rounded" />
                            Alertar al salir de la zona
                        </label>
                        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input v-model="form.is_active" type="checkbox" class="w-4 h-4 text-green-600 rounded" />
                            Zona activa
                        </label>
                    </div>

                    <div class="flex gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" :disabled="saving"
                            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                            :class="{ 'animate-pulse': saving }">
                            <i class="pi pi-save mr-1"></i>
                            {{ saving ? 'Guardando...' : 'Guardar' }}
                        </button>
                        <button type="button"
                            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                            @click="cancel">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>

            <div class="col-span-12 lg:col-span-8 bg-white rounded-xl shadow p-3 relative">
                <div v-if="loading"
                    class="absolute inset-0 bg-white/70 flex items-center justify-center z-[1000]">
                    <i class="pi pi-spin pi-spinner text-3xl text-blue-600"></i>
                </div>
                <div id="geofenceMap" class="w-full h-[600px] rounded-lg"></div>
            </div>
        </div>
    </div>
</template>