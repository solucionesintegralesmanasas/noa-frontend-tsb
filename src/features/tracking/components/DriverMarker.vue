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

const initials = computed(() => {
    const name = driverName.value.trim();
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
});

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
    <div class="d-flex align-items-center justify-content-between gap-2 px-2 py-2 border-bottom border-light cursor-pointer item-hover"
        @click="emit('show-location', driver)">
        <div class="d-flex align-items-center gap-2 min-w-0">
            <span class="avatar avatar-sm rounded-circle bg-primary bg-opacity-10 text-primary fw-bold"
                style="width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;">
                {{ initials }}
            </span>
            <div class="min-w-0">
                <div class="fw-semibold text-dark text-truncate" style="font-size: 0.85rem;">{{ driverName }}</div>
                <div class="text-muted text-truncate" style="font-size: 0.72rem;">
                    {{ plate }} <span class="mx-1">·</span> {{ documentNumber }}
                </div>
            </div>
        </div>

        <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="badge rounded-pill badge-subtle fw-semibold" style="font-size: 0.72rem;"
                :class="isMoving ? 'badge-subtle-success' : 'badge-subtle-warning'">
                {{ speed }} km/h
            </span>
            <span class="text-muted d-none d-xl-inline" style="font-size: 0.7rem;">{{ lastSeen }}</span>
            <span class="status-dot" :class="isMoving ? 'status-dot-moving' : 'status-dot-stopped'"></span>

            <button class="btn btn-sm btn-falcon-default p-0 px-1" title="Ver historial"
                @click.stop="emit('open-history', driver)">
                <i class="fad fa-route text-primary" style="font-size: 12px;"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.item-hover {
    transition: background-color 0.15s ease-in-out;
}

.item-hover:hover {
    background-color: #f8f9fa;
}

.min-w-0 {
    min-width: 0;
}

.badge-subtle-success {
    background: rgba(25, 135, 84, .1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, .2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, .1);
    color: #c07f00;
    border: 1px solid rgba(255, 193, 7, .3);
}

.status-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
}

.status-dot-moving {
    background: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, .2);
}

.status-dot-stopped {
    background: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, .2);
}

:deep(.btn-falcon-default) {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #212529;
}
</style>