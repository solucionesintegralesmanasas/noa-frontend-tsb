<template>
  <Sidebar v-if="!shouldHideSidebar" />
  <div class="content" :class="{ 'no-sidebar-content': shouldHideSidebar }">
    <Navbar :hide-sidebar-toggle="shouldHideSidebar" :show-brand="shouldHideSidebar" />
    <slot>
      <router-view />
    </slot>
    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionsStore } from '@store'
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'

const route = useRoute()
const permissionsStore = usePermissionsStore()

const isConductorRole = computed(() => {
  return permissionsStore.hasRole('CONDUCTOR')
})

const isConductorDashboard = computed(() => {
  if (route.query.view === 'admin') return false
  if (route.path.includes('/dashboard/conductor')) return true
  if (route.query.view === 'conductor') return true
  return route.path === '/dashboard' && isConductorRole.value
})

const shouldHideSidebar = computed(() => {
  return Boolean(route.meta?.hideSidebar) || isConductorDashboard.value
})

onMounted(() => {
  var isFluid = true
  if (isFluid) {
    var container = document.querySelector('[data-layout]')
    if (container) {
      container.classList.remove('container')
      container.classList.add('container-fluid')
    }
  }

  var navbarVertical = document.querySelector('.navbar-vertical')
  var navbarTopVertical = document.querySelector('.content .navbar-top')
  var navbarTop = document.querySelector('[data-layout] .navbar-top:not([data-double-top-nav')
  var navbarDoubleTop = document.querySelector('[data-double-top-nav]')
  var navbarTopCombo = document.querySelector('.content [data-navbar-top="combo"]')

  if (navbarVertical) navbarVertical.removeAttribute('style')
  if (navbarTopVertical) navbarTopVertical.removeAttribute('style')

  if (window.bootstrap?.Tooltip) {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      new window.bootstrap.Tooltip(el)
    })
  }

  if (typeof window.falconTheme?.init === 'function') {
    window.falconTheme.init()
  }

  const observer = new MutationObserver(() => {
    const newTheme = document.documentElement.getAttribute('data-bs-theme') || 'light'
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }))
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme']
  })
})
</script>

<style scoped>
.no-sidebar-content {
  margin-left: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

@media (min-width: 768px) {
  .no-sidebar-content {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
}
</style>
