<script setup>
import { computed } from 'vue';

const props = defineProps({
    driver: { type: Object, required: true },
});

const emit = defineEmits(['open-history', 'show-location']);

const driverName = computed(() => {
    const d = props.driver;
    const tp = d.driver || d.third_party || {};
    const name = tp.first_name || d.first_name || 'Conductor';
    const lastName = tp.last_name || d.last_name || '';
    return `${name} ${lastName}`.trim();
});

const documentNumber = computed(() => props.driver.driver?.document_number || props.driver.document_number || '—');

const plate = computed(() => {
    const v = props.driver.vehicle || {};
    return v.vehicle_license_plate || props.driver.vehicle_license_plate || 'Sin vehículo';
});

const speed = computed(() => Math.round(props.driver.speed ?? props.driver.last_location?.speed ?? 0));

const isMoving = computed(() => props.driver.is_moving ?? props.driver.last_location?.is_moving ?? false);

const lastSeen = computed(() => {
    const date = props.driver.recorded_at || props.driver.last_location?.recorded_at;
    if (!date) return 'Desconocido';
    return new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(date));
});
</script>

<template>
    <div class="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        @click="emit('show-location', driver)">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                {{ driverName.charAt(0).toUpperCase() }}
            </div>
            <div>
                <div class="font-semibold text-gray-800">{{ driverName }}</div>
                <div class="text-xs text-gray-500">{{ plate }} · {{ documentNumber }}</div>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-700">{{ speed }} km/h</span>
            <span class="text-xs text-gray-400">{{ lastSeen }}</span>
            <span class="inline-block w-2.5 h-2.5 rounded-full"
                :class="isMoving ? 'bg-green-500' : 'bg-amber-500'"></span>

            <button class="ml-1 p-1.5 rounded hover:bg-gray-200 text-gray-500" title="Ver historial"
                @click.stop="emit('open-history', driver)">
                <i class="pi pi-history text-sm"></i>
            </button>
        </div>
    </div>
</template>