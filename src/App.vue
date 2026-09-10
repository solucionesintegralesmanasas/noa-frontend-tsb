<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import DashboardLayout from '@/components/DashboardLayout.vue';
import { useNotificationsStore } from '@/features/notifications/store/notifications.store.js';
import { useConfigStore } from '@/store/modules/config.js';
import Noatspinner from '@/components/Noatspinner.vue';
import NavProgressBar from '@/components/NavProgressBar.vue';
import { useAuthStore } from '@/store/modules/auth.js';

const route = useRoute();
const notificationsStore = useNotificationsStore();
const configStore = useConfigStore();

const layoutComponent = computed(() => {
  if (route.meta?.layout === 'dashboard') {
    return DashboardLayout;
  }
  return null;
});

onMounted(() => {
  notificationsStore.startExpiryAlertInterval();
});

onUnmounted(() => {
  notificationsStore.stopExpiryAlertInterval();
});

/* ─── Auto-sync notificaciones tras guardar formularios ─── */
const FORM_ROUTES = ['/crear', '/editar', '/nuevo'];

watch(() => route.path, (newPath, oldPath) => {
  // Apagar el spinner global al llegar a /login (post-logout) o al dashboard (post-login)
  if (newPath === '/login' || newPath === '/dashboard') {
    configStore.setLoading(false);
    if (newPath === '/login') return;
  }

  const fromForm = FORM_ROUTES.some(seg => oldPath?.includes(seg));
  const toNonForm = !FORM_ROUTES.some(seg => newPath?.includes(seg));

  if (fromForm && toNonForm) {
    setTimeout(() => {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated) {
            notificationsStore.requestSync();
        }
    }, 800);
  }
});

const getAvatarClass = (type) => {
    switch (type) {
        case 'VEHICLE_DOCUMENT': return 'bg-subtle-info text-info'
        case 'OPERATION_CARD': return 'bg-subtle-warning text-warning'
        case 'DRIVER_LICENSE': return 'bg-subtle-success text-success'
        case 'FIRST_RTM': return 'bg-subtle-danger text-danger'
        case 'AGREEMENT': return 'bg-subtle-primary text-primary'
        case 'AFFILIATE_CHARGE': return 'bg-subtle-success text-success'
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
        case 'SOCIAL_SECURITY_MORA': return 'SS'
        default: return 'AL'
    }
}
</script>

<template>
  <!-- Barra de progreso de navegación entre rutas (NProgress-style) -->
  <NavProgressBar />

  <Transition name="fade">
    <Noatspinner v-if="configStore.isAppLoading" :message="configStore.loadingMessage" />
  </Transition>

  <component :is="layoutComponent" v-if="layoutComponent">
    <router-view />
  </component>
  <router-view v-else />

  <!-- Contenedor flotante de Alertas que vencen Hoy (tipo Facebook) -->
  <div class="expiry-toasts-container">
    <TransitionGroup name="toast-fade">
      <div v-for="toast in notificationsStore.activeExpiryToasts" :key="toast.id" 
        class="expiry-toast-item shadow-lg p-3 rounded bg-white border d-flex align-items-start mb-2">
        <div class="toast-avatar me-3">
          <div class="avatar avatar-xl">
            <div class="avatar-name rounded-circle d-flex align-items-center justify-content-center fw-bold fs-11"
              :class="getAvatarClass(toast.type)">
              <span>{{ getInitialsLabel(toast.type) }}</span>
            </div>
          </div>
        </div>
        <div class="toast-body flex-grow-1 min-w-0">
          <div class="d-flex justify-content-between align-items-baseline mb-1">
            <h6 class="toast-title mb-0 fs-11 text-900 fw-bold text-truncate pe-2">
              {{ toast.title }}
            </h6>
            <span class="fs-10 text-danger fw-bold flex-shrink-0 animate-pulse">
              ¡VENCE HOY!
            </span>
          </div>
          <p class="toast-message mb-0 text-700 fs-10" style="line-height: 1.4;">
            {{ toast.message }}
          </p>
          <small class="text-500 fs-11 mt-1 d-block">
            <i class="far fa-clock me-1"></i>{{ toast.created_at }}
          </small>
        </div>
        <button type="button" class="btn-close ms-2 fs-11 text-500 flex-shrink-0" aria-label="Close" 
          @click="notificationsStore.dismissExpiryToast(toast.id)"></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
/* Contenedor Flotante en la esquina inferior derecha */
.expiry-toasts-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1080;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 320px;
  width: calc(100% - 40px);
  pointer-events: none; /* Dejar pasar clics si es transparente */
}

.expiry-toast-item {
  pointer-events: auto; /* Permitir interacciones dentro del toast */
  background-color: #ffffff;
  border-left: 4px solid var(--bs-danger) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.dark .expiry-toast-item {
  background-color: #1b1e22 !important;
  border-color: #2c3238 !important;
  border-left-color: var(--bs-danger) !important;
}

/* Animaciones y Transiciones de Vue */
.toast-fade-enter-active {
  animation: toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-fade-leave-active {
  position: absolute;
  width: 100%;
  transition: all 0.3s ease;
}
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

@keyframes toast-slide-in {
  0% {
    opacity: 0;
    transform: translateX(120px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ────────────────────────────────────────────────────────
   SweetAlert2 Thin Toast Styles (Custom)
──────────────────────────────────────────────────────── */
.toast-thin {
    padding: 0.5rem 0.9rem !important;
    min-height: auto !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, .12) !important;
}

.toast-thin .swal2-title {
    font-size: 0.85rem !important;
    font-weight: 500 !important;
    margin: 0 !important;
    padding: 0 0.4rem !important;
}

.toast-thin .swal2-icon {
    width: 1.6rem !important;
    height: 1.6rem !important;
    margin: 0 0.3rem 0 0 !important;
}

.toast-thin .swal2-icon .swal2-icon-content {
    font-size: 1rem !important;
}

.toast-thin .swal2-html-container {
    margin: 0 !important;
}

.toast-thin-bar {
    height: 2px !important;
}

@keyframes toastSlideIn {
    from {
        transform: translateX(40px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes toastSlideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(40px);
        opacity: 0;
    }
}

.toast-slide-in {
    animation: toastSlideIn .25s ease-out;
}

.toast-slide-out {
    animation: toastSlideOut .2s ease-in;
}
</style>
