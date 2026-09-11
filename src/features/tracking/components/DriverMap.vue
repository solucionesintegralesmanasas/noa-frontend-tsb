<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useTrackingStore } from '../store/tracking.store';
import { useGeolocation } from '@/hooks/useGeolocation';

const props = defineProps({
    showGeofences: { type: Boolean, default: true },
    interactive: { type: Boolean, default: true },
});

const emit = defineEmits(['driver-selected']);

const store = useTrackingStore();
const { loadLeaflet } = useGeolocation();

let map = null;
let markers = {};
let geofenceLayers = [];
let polylineLayer = null;

const DEFAULT_CENTER = [4.710993, -74.072068];
const DEFAULT_ZOOM = 12;

const driverIcon = (isMoving) => `
    <div style="background:${isMoving ? '#22c55e' : '#f59e0b'};width:30px;height:30px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:bold;">🚙</div>
`;

function setupMap(L) {
    map = L.map('trackingMap', {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    if (store.selectedDriver?.history) {
        drawHistory(L, store.selectedDriver.history);
    }

    if (props.showGeofences) {
        drawAllGeofences();
    }
}

function clearGeofences() {
    if (!map) return;
    geofenceLayers.forEach((layer) => map.removeLayer(layer));
    geofenceLayers = [];
}

function drawAllGeofences() {
    if (!map || !window.L) return;
    clearGeofences();
    store.geofences
        .filter((gf) => gf.is_active !== false)
        .forEach((gf) => drawGeofence(window.L, gf));
}

watch(
    () => props.showGeofences,
    (show) => {
        if (!map) return;
        if (show) {
            drawAllGeofences();
        } else {
            clearGeofences();
        }
    }
);

watch(
    () => store.activeDrivers,
    () => {
        updateMap();
    }
);

function drawDriver(L, driver) {
    if (!driver?.latitude && !driver?.last_location?.latitude) {
        return;
    }

    const lat = driver.latitude ?? driver.last_location?.latitude;
    const lng = driver.longitude ?? driver.last_location?.longitude;
    const isMoving = driver.is_moving ?? driver.last_location?.is_moving ?? false;

    if (markers[driver.third_party_uuid]) {
        markers[driver.third_party_uuid].setLatLng([lat, lng]);
        markers[driver.third_party_uuid].setIcon(L.divIcon({ html: driverIcon(isMoving), className: '' }));
        markers[driver.third_party_uuid].bindPopup(buildPopup(driver));
        return;
    }

    const marker = L.marker([lat, lng], {
        icon: L.divIcon({ html: driverIcon(isMoving), className: '' }),
    }).addTo(map);

    marker.bindPopup(buildPopup(driver));
    marker.on('click', () => {
        store.selectDriver(driver);
        emit('driver-selected', driver);
    });

    markers[driver.third_party_uuid] = marker;
}

function buildPopup(driver) {
    const name = driver.driver?.first_name || driver.first_name || 'Conductor';
    const lastName = driver.driver?.last_name || driver.last_name || '';
    const plate = driver.vehicle?.vehicle_license_plate || driver.vehicle_license_plate || 'Sin vehículo';
    const speed = driver.speed ?? driver.last_location?.speed ?? 0;

    return `
        <div style="min-width:180px">
            <strong>${name} ${lastName}</strong><br>
            <span style="font-size:12px;color:#666">${plate}</span><br>
            <span style="font-size:12px;font-weight:bold;color:${speed > 0 ? '#22c55e' : '#666'}">
                ${Math.round(speed)} km/h
            </span>
        </div>
    `;
}

function drawGeofence(L, geofence) {
    let layer = null;

    if (geofence.type === 'circle') {
        layer = L.circle([geofence.center_lat, geofence.center_lng], {
            radius: geofence.radius_meters,
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            weight: 2,
        }).addTo(map);
        layer.bindPopup(`<strong>${geofence.name}</strong><br>Zona circular · ${geofence.radius_meters} m`);
    } else if (geofence.type === 'polygon') {
        const points = (geofence.polygon_points || []).map((p) => [p.lat ?? p[0], p.lng ?? p[1]]);
        layer = L.polygon(points, {
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            weight: 2,
        }).addTo(map);
        layer.bindPopup(`<strong>${geofence.name}</strong><br>Zona poligonal`);
    }

    if (layer) {
        geofenceLayers.push(layer);
    }
}

function drawHistory(L, history) {
    if (polylineLayer) {
        map.removeLayer(polylineLayer);
    }
    if (!history || history.length < 2) return;

    const points = history.map((point) => [point.latitude, point.longitude]);
    polylineLayer = L.polyline(points, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
    }).addTo(map);

    const first = points[0];
    const last = points[points.length - 1];
    L.marker(first, { icon: L.divIcon({ html: '🟢', className: '', iconSize: [20, 20] }) }).addTo(map);
    L.marker(last, { icon: L.divIcon({ html: '🔴', className: '', iconSize: [20, 20] }) }).addTo(map);

    map.fitBounds(L.latLngBounds(points).pad(0.1));
}

let hasFittedDrivers = false;

function fitDrivers() {
    if (!map || !window.L) return;
    const points = store.activeDrivers
        .map((d) => [d.latitude ?? d.last_location?.latitude, d.longitude ?? d.last_location?.longitude])
        .filter(([lat, lng]) => lat != null && lng != null);
    if (!points.length) return;
    if (points.length === 1) {
        map.setView(points[0], 15);
    } else {
        map.fitBounds(window.L.latLngBounds(points).pad(0.15));
    }
    hasFittedDrivers = true;
}

function updateMap() {
    if (!map) return;
    const L = window.L;
    if (!L) return;

    // Actualizar conductores
    store.activeDrivers.forEach((driver) => drawDriver(L, driver));

    if (store.activeDrivers.length && !hasFittedDrivers) {
        fitDrivers();
    }

    // Actualizar selección/historial
    if (store.selectedDriver?.history) {
        drawHistory(L, store.selectedDriver.history);
    }
}

let intervalId = null;

onMounted(async () => {
    try {
        const L = await loadLeaflet();
        setupMap(L);
        updateMap();

        intervalId = setInterval(updateMap, 10000);

        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 300);
    } catch (err) {
        console.error('Error inicializando mapa:', err);
    }
});

onBeforeUnmount(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
    if (map) {
        map.remove();
        map = null;
    }
});
</script>

<template>
    <div class="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200">
        <div id="trackingMap" class="w-full h-full" style="min-height: 400px;"></div>

        <div class="absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow px-3 py-2 text-sm">
            <span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            En movimiento
            <span class="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1 ml-3"></span>
            Detenido
        </div>
    </div>
</template>