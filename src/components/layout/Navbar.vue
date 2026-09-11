<template>
    <nav class="navbar navbar-light navbar-glass navbar-top navbar-expand">
        <button v-if="!hideSidebarToggle" class="btn navbar-toggler-humburger-icon navbar-toggler me-1 me-sm-3 d-xl-none" type="button"
            data-bs-toggle="collapse" data-bs-target="#navbarVerticalCollapse" aria-controls="navbarVerticalCollapse"
            aria-expanded="false" aria-label="Toggle Navigation">
            <span class="navbar-toggle-icon">
                <span class="toggle-line"></span>
            </span>
        </button>

        <router-link class="navbar-brand me-1 me-sm-3" :class="{ 'd-xl-none': !showBrand }" to="/dashboard">
            <div class="d-flex align-items-center">
                <img src="/noa.png" alt="NOA Transportes" width="40" class="me-2" style="height: auto; max-height: 45px;" />
                <NoaBadge size="22px" />
                <span v-if="showBrand" class="badge bg-primary bg-opacity-10 text-primary fw-bold ms-2 py-1 px-2 fs-11 d-none d-sm-inline-flex align-items-center gap-1">
                    <i class="fas fa-steering-wheel"></i> Portal Conductor
                </span>
            </div>
        </router-link>

        <ul class="navbar-nav navbar-nav-icons ms-auto flex-row align-items-center">
            <!-- Campana de Notificaciones (SSE) -->
            <li class="nav-item dropdown">
                <a class="nav-link px-0 fa-icon-wait"
                    :class="{ 'notification-indicator notification-indicator-primary': store.unreadCount > 0 }"
                    id="navbarDropdownNotification" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <span class="fas fa-bell" data-fa-transform="shrink-6" style="font-size: 33px;"></span>
                </a>
                <div class="dropdown-menu dropdown-caret dropdown-menu-end dropdown-menu-card dropdown-menu-notification dropdown-caret-bg"
                    aria-labelledby="navbarDropdownNotification">
                    <div class="card card-notification shadow-none" style="width: 20rem;">
                        <div class="card-header bg-light py-2">
                            <div class="row justify-content-between align-items-center">
                                <div class="col-auto">
                                    <h6 class="card-header-title mb-0 fw-bold">Notificaciones</h6>
                                </div>
                                <div class="col-auto ps-0 ps-sm-3">
                                    <a class="card-link fw-normal fs-11" href="#" @click.prevent="store.markAllAsRead"
                                        :class="{ 'pe-none text-muted opacity-50': store.unreadCount === 0 }">
                                        Marcar todo como leído
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="notification-list-container">
                            <div class="list-group list-group-flush fw-normal fs-10">
                                <template v-if="store.latestNotifications.length > 0">
                                    <div v-for="notification in store.latestNotifications.slice(0, 8)"
                                        :key="notification.uuid" class="list-group-item p-0">
                                        <router-link
                                            class="notification-item-link d-flex align-items-start p-3 border-bottom text-decoration-none"
                                            :class="{ 'unread-item': notification.status !== 'LEIDA' }"
                                            to="/notificaciones">
                                            <div class="avatar avatar-xl me-3 flex-shrink-0">
                                                <div class="avatar-name rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase fs-11"
                                                    :class="getAvatarClass(notification.type)">
                                                    <span>{{ getInitialsLabel(notification.type) }}</span>
                                                </div>
                                            </div>
                                            <div class="flex-grow-1 min-w-0">
                                                <div class="d-flex justify-content-between align-items-baseline mb-1">
                                                    <h6 class="mb-0 text-900 fs-11 fw-bold text-truncate pe-2"
                                                        style="max-width: 140px;">
                                                        {{ notification.title }}
                                                    </h6>
                                                    <span
                                                        class="fs-10 text-500 fw-normal flex-shrink-0 font-sans-serif">
                                                        {{ timeAgo(notification.created_at) }}
                                                    </span>
                                                </div>
                                                <p class="mb-0 text-700 fs-10 line-clamp-2" style="line-height: 1.4;">
                                                    {{ notification.message }}
                                                </p>
                                                <small v-if="notification.expiry_date"
                                                    class="text-danger fs-10 fw-medium mt-1 d-block">
                                                    <i class="fas fa-calendar-alt me-1"></i>Vence: {{
                                                        formatDate(notification.expiry_date) }}
                                                </small>
                                            </div>
                                        </router-link>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="p-4 text-center text-500">
                                        <i class="fad fa-bell-slash d-block fs-3 mb-2 text-300"></i>
                                        <p class="mb-0 fs-10 fw-medium">Sin alertas pendientes</p>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <div class="card-footer text-center border-top py-2 bg-light">
                            <router-link class="card-link d-block fs-11 fw-bold" to="/notificaciones">
                                Ver todas
                            </router-link>
                        </div>
                    </div>
                </div>
            </li>

            <!-- Perfil de usuario -->
            <li class="nav-item dropdown">
                <a class="nav-link pe-0 ps-2" id="navbarDropdownUser" role="button" data-bs-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="false" @click.prevent="toggleUserMenu">
                    <div class="avatar avatar-2xl">
                        <div class="avatar-name rounded-circle fs-10"><span>{{ userName }}</span></div>
                    </div>
                </a>
                <div class="dropdown-menu dropdown-caret dropdown-menu-end py-0" aria-labelledby="navbarDropdownUser">
                    <div class="bg-white dark__bg-1000 rounded-2 py-2">
                        <a class="dropdown-item fw-bold text-warning" href="#!">
                            <span class="fas fa-crown me-1"></span>
                            <span>{{ displayRoles }}</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <router-link class="dropdown-item" to="/profile">
                            <span class="fas fa-user me-1"></span> Perfil y cuenta
                        </router-link>
                        <router-link v-if="permissionsStore.can('system_configurations.index')" class="dropdown-item"
                            to="/settings/system-configuration">
                            <span class="fas fa-cog me-1"></span> Configuración
                        </router-link>
                        <router-link class="dropdown-item" :to="{ path: '/profile', query: { tab: 'security' } }">
                            <span class="fas fa-shield-alt me-1"></span> Seguridad 2FA
                        </router-link>
                        <router-link class="dropdown-item" to="/roles-permissions">
                            <span class="fas fa-user-shield me-1"></span> Roles y permisos
                        </router-link>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="#" :class="{ 'pe-none opacity-75': isLoggingOut }"
                            :aria-busy="isLoggingOut" @click.prevent="handleLogout">
                            <span v-if="isLoggingOut" class="spinner-border spinner-border-sm me-1" role="status"
                                aria-hidden="true"></span>
                            <span v-else class="fas fa-sign-out-alt me-1"></span> Cerrar sesión
                        </a>
                    </div>
                </div>
            </li>
        </ul>
    </nav>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useUserStore, useAuthStore, usePermissionsStore } from '@store'
import { getMediaUrl } from '@/utils/media.js'
import NoaBadge from '@/components/NoaBadge.vue'
import { useNotificationsStore } from '@/features/notifications/store/notifications.store.js'
import { useConfigStore } from '@store/modules/config.js'

const props = defineProps({
    hideSidebarToggle: {
        type: Boolean,
        default: false
    },
    showBrand: {
        type: Boolean,
        default: false
    }
})

const userStore = useUserStore()
const authStore = useAuthStore()
const permissionsStore = usePermissionsStore()
const configStore = useConfigStore()
const store = useNotificationsStore()
const isLoggingOut = ref(false)

onMounted(() => {
    store.connectSSE()
})

onUnmounted(() => {
    store.disconnectSSE()
})

const getAvatarClass = (type) => {
    switch (type) {
        case 'VEHICLE_DOCUMENT': return 'bg-subtle-info text-info'
        case 'OPERATION_CARD': return 'bg-subtle-warning text-warning'
        case 'DRIVER_LICENSE': return 'bg-subtle-success text-success'
        case 'FIRST_RTM': return 'bg-subtle-danger text-danger'
        case 'AGREEMENT': return 'bg-subtle-primary text-primary'
        case 'AFFILIATE_CHARGE': return 'bg-subtle-success text-success'
        case 'VEHICLE_INSPECTION_PENDING': return 'bg-subtle-danger text-danger'
        case 'SOCIAL_SECURITY_MORA': return 'bg-subtle-danger text-danger'
        default: return 'bg-subtle-secondary text-secondary'
    }
}

const getInitialsLabel = (type) => {
    switch (type) {
        case 'VEHICLE_DOCUMENT': return 'DV'
        case 'OPERATION_CARD': return 'TO'
        case 'DRIVER_LICENSE': return 'LC'
        case 'FIRST_RTM': return 'RT'
        case 'AGREEMENT': return 'CO'
        case 'AFFILIATE_CHARGE': return 'CA'
        case 'VEHICLE_INSPECTION_PENDING': return 'IP'
        case 'SOCIAL_SECURITY_MORA': return 'SS'
        default: return 'AL'
    }
}

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return dateStr
        return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
    } catch {
        return dateStr
    }
}

const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    try {
        // Soporta formatos 'YYYY-MM-DD HH:mm:ss' o ISO
        const cleanStr = dateStr.replace(' ', 'T')
        const past = new Date(cleanStr)
        const now = new Date()
        const diffMs = now.getTime() - past.getTime()
        if (diffMs < 0) return 'Ahora'

        const diffSecs = Math.floor(diffMs / 1000)
        const diffMins = Math.floor(diffSecs / 60)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffSecs < 60) {
            return `${diffSecs}s`
        } else if (diffMins < 60) {
            const remainingSecs = diffSecs % 60
            return remainingSecs > 0 ? `${diffMins}m ${remainingSecs}s` : `${diffMins}m`
        } else if (diffHours < 24) {
            const remainingMins = diffMins % 60
            return remainingMins > 0 ? `${diffHours}h ${remainingMins}m` : `${diffHours}h`
        } else {
            return `${diffDays}d`
        }
    } catch {
        return ''
    }
}

const getInitials = (fullName) => {
    if (!fullName) return 'US'
    const parts = fullName.trim().split(/\s+/)
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
}

const userName = computed(() => {
    const rawName = userStore.fullName || permissionsStore.user?.name || 'Usuario'
    return getInitials(rawName)
})

const userAvatar = computed(() => getMediaUrl(userStore.avatar, null))
const companyLogo = computed(() => getMediaUrl(userStore.logo))

const displayRoles = computed(() => {
    if (!permissionsStore.roles || permissionsStore.roles.length === 0) {
        return authStore.currentTenant?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Usuario'
    }
    return permissionsStore.roles.map(r => r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(' | ')
})

function toggleUserMenu() { }

async function handleLogout() {
    if (isLoggingOut.value) return

    isLoggingOut.value = true

    // Activar la barra de navegación no invasiva en el top
    configStore.startNavigation()

    try {
        await authStore.logout({ redirect: true })
    } catch (error) {
        isLoggingOut.value = false
        configStore.endNavigation()
        console.error('Error during logout:', error)
    }
}
</script>

<style scoped>
.notification-list-container {
    max-height: 290px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--bs-primary-rgb), 0.2) transparent;
}

.notification-list-container::-webkit-scrollbar {
    width: 6px;
}

.notification-list-container::-webkit-scrollbar-track {
    background: transparent;
}

.notification-list-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}

.dark .notification-list-container::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.15);
}

.notification-item-link {
    transition: background-color 0.2s ease, border-left 0.2s ease;
    border-left: 3px solid transparent;
}

.notification-item-link:hover {
    background-color: var(--bs-gray-100);
}

.dark .notification-item-link:hover {
    background-color: var(--bs-gray-900);
}

.unread-item {
    background-color: rgba(var(--bs-primary-rgb), 0.05);
    border-left: 3px solid var(--bs-primary);
}

.unread-item:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.09);
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
