// src/hooks/useGeolocation.js
import { ref, onUnmounted } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

let leafletPromise = null;

export function useGeolocation() {
    const coords = ref({ latitude: null, longitude: null });
    const speed = ref(0);
    const isMoving = ref(false);
    const routeHistory = ref([]);
    const loading = ref(false);
    const error = ref(false);
    const errorMsg = ref('');

    let watchId = null;

    // Función para cargar dinámicamente Leaflet en demanda
    function loadLeaflet() {
        if (leafletPromise) {
            return leafletPromise;
        }

        leafletPromise = new Promise((resolve, reject) => {
            if (window.L) {
                resolve(window.L);
                return;
            }

            // Cargar CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            // Cargar JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve(window.L);
            script.onerror = (err) => {
                leafletPromise = null; // Permitir reintento si falla
                reject(err);
            };
            document.head.appendChild(script);
        });

        return leafletPromise;
    }

    async function startTracking(onUpdateCallback, onErrorCallback) {
        loading.value = true;
        error.value = false;

        const isNative = Capacitor.isNativePlatform();

        if (isNative) {
            try {
                // Solicitar permisos de GPS a nivel de sistema operativo nativo (Android / iOS)
                const permResult = await Geolocation.requestPermissions();
                if (permResult.location === 'denied') {
                    throw new Error('Permiso de ubicación denegado por el usuario.');
                }

                watchId = await Geolocation.watchPosition(
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    },
                    (position, err) => {
                        if (err) {
                            error.value = true;
                            errorMsg.value = err.message || 'Error al obtener posición GPS.';
                            loading.value = false;
                            if (onErrorCallback) onErrorCallback(err);
                            return;
                        }
                        handlePositionUpdate(position, onUpdateCallback);
                    }
                );
            } catch (err) {
                error.value = true;
                errorMsg.value = err.message || 'No se pudo iniciar el servicio de ubicación nativo.';
                loading.value = false;
                if (onErrorCallback) onErrorCallback(err);
            }
        } else {
            if (!navigator.geolocation) {
                error.value = true;
                errorMsg.value = 'Geolocalización no soportada por este navegador.';
                loading.value = false;
                if (onErrorCallback) onErrorCallback(new Error(errorMsg.value));
                return;
            }

            watchId = navigator.geolocation.watchPosition(
                (position) => handlePositionUpdate(position, onUpdateCallback),
                (err) => {
                    error.value = true;
                    errorMsg.value = 'Permiso de ubicación denegado o error de señal GPS.';
                    loading.value = false;
                    if (onErrorCallback) onErrorCallback(err);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    }

    function handlePositionUpdate(position, onUpdateCallback) {
        if (!position || !position.coords) return;

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Evitar duplicados idénticos
        if (coords.value.latitude === lat && coords.value.longitude === lng) {
            loading.value = false;
            return;
        }

        const currentSpeed = position.coords.speed || 0; // m/s

        coords.value.latitude = lat;
        coords.value.longitude = lng;
        speed.value = Math.round(currentSpeed * 3.6); // km/h
        isMoving.value = currentSpeed > 0.2;

        routeHistory.value.push([lat, lng]);
        loading.value = false;

        if (onUpdateCallback) {
            onUpdateCallback({ lat, lng, speed: speed.value, isMoving: isMoving.value });
        }
    }

    async function stopTracking() {
        if (watchId !== null) {
            if (Capacitor.isNativePlatform()) {
                try {
                    await Geolocation.clearWatch({ id: watchId });
                } catch (e) {
                    // Ignore clearWatch errors
                }
            } else {
                navigator.geolocation.clearWatch(watchId);
            }
            watchId = null;
        }
    }

    // Limpieza automática
    onUnmounted(() => {
        stopTracking();
    });

    return {
        coords,
        speed,
        isMoving,
        routeHistory,
        loading,
        error,
        errorMsg,
        loadLeaflet,
        startTracking,
        stopTracking
    };
}
