<template>
  <div v-if="hideSidebar">
    <router-view />
  </div>

  <div v-else class="d-flex flex-column flex-lg-row" style="min-height: 100vh; background: var(--z-bg);">
    <SideNavbar />

    <main class="flex-grow-1 p-3 p-lg-4 z-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import SideNavbar from "../src/components/SideNavbar.vue"

const route = useRoute()
const hideSidebar = computed(() => route.path === "/login" || route.path === "/register")
</script>

<style>
/* asegura que el fondo se pinte con la variable */
html, body { height: 100%; background: var(--z-bg); }
.z-main { background: transparent; }
</style>
