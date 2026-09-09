<template>
  <Sidebar />
  <div class="content">
    <Navbar />
    <slot>
      <router-view />
    </slot>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'

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
