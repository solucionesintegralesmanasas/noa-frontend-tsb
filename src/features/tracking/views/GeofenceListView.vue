<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useTrackingStore } from '../store/tracking.store';
import { useToast } from 'vue-toastification';

const router = useRouter();
const store = useTrackingStore();
const toast = useToast();

const loading = ref(false);
const search = ref('');

const filteredGeofences = computed(() => {
    if (!search.value.trim()) return store.geofences;
    return store.geofences.filter((g) =>
        g.name.toLowerCase().includes(search.value.toLowerCase())
    );
});

function goToCreate() {
    router.push({ name: 'tracking.geofences.create' });
}

function goToEdit(geofence) {
    router.push({ name: 'tracking.geofences.edit', params: { id: geofence.uuid } });
}

async function confirmDelete(geofence) {
    const result = await Swal.fire({
        title: '¿Eliminar geocerca?',
        text: `La geocerca "${geofence.name}" será eliminada permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
        try {
            await store.deleteGeofence(geofence.uuid);
            toast.success('Geocerca eliminada exitosamente');
        } catch (err) {
            toast.error('Error al eliminar la geocerca');
        }
    }
}

onMounted(async () => {
    loading.value = true;
    await store.fetchGeofences();
    loading.value = false;
});
</script>

<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Geocercas</h1>
                <p class="text-sm text-gray-500">Zonas geográficas para alertas de conductores</p>
            </div>

            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                @click="goToCreate">
                <i class="pi pi-plus"></i> Nueva Geocerca
            </button>
        </div>

        <div class="bg-white rounded-xl shadow overflow-hidden">
            <div class="p-3 border-b border-gray-200">
                <input v-model="search" type="text" placeholder="Buscar geocerca por nombre..."
                    class="w-full md:w-96 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-50 text-left text-gray-600">
                            <th class="px-4 py-3 font-medium">Nombre</th>
                            <th class="px-4 py-3 font-medium">Tipo</th>
                            <th class="px-4 py-3 font-medium">Radio / Puntos</th>
                            <th class="px-4 py-3 font-medium">Alertas</th>
                            <th class="px-4 py-3 font-medium">Vel. Máx</th>
                            <th class="px-4 py-3 font-medium">Estado</th>
                            <th class="px-4 py-3 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="geofence in filteredGeofences" :key="geofence.uuid"
                            class="border-t border-gray-100 hover:bg-gray-50">
                            <td class="px-4 py-3 font-semibold text-gray-800">
                                {{ geofence.name }}
                                <div class="text-xs text-gray-400 font-normal">{{ geofence.description }}</div>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 text-xs font-medium rounded"
                                    :class="geofence.type === 'circle' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                                    {{ geofence.type === 'circle' ? 'Círculo' : 'Polígono' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-gray-600">
                                <template v-if="geofence.type === 'circle'">
                                    {{ geofence.radius_meters }} m
                                </template>
                                <template v-else>
                                    {{ (geofence.polygon_points || []).length }} puntos
                                </template>
                            </td>
                            <td class="px-4 py-3">
                                <span class="text-xs">
                                    <span v-if="geofence.alert_on_enter" class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded mr-1">Entrada</span>
                                    <span v-if="geofence.alert_on_exit" class="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">Salida</span>
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                {{ geofence.max_speed_kmh ? geofence.max_speed_kmh + ' km/h' : '—' }}
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 text-xs font-medium rounded"
                                    :class="geofence.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                                    {{ geofence.is_active ? 'Activa' : 'Inactiva' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-right whitespace-nowrap">
                                <button class="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Editar"
                                    @click="goToEdit(geofence)">
                                    <i class="pi pi-pencil"></i>
                                </button>
                                <button class="p-1.5 rounded hover:bg-red-50 text-red-500 ml-1" title="Eliminar"
                                    @click="confirmDelete(geofence)">
                                    <i class="pi pi-trash"></i>
                                </button>
                            </td>
                        </tr>

                        <tr v-if="!filteredGeofences.length && !loading">
                            <td colspan="7" class="px-4 py-10 text-center text-gray-400">
                                <i class="pi pi-map-marker text-3xl block mb-2"></i>
                                No hay geocercas registradas
                            </td>
                        </tr>

                        <tr v-if="loading">
                            <td colspan="7" class="px-4 py-10 text-center text-gray-400">
                                <i class="pi pi-spin pi-spinner text-2xl"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>