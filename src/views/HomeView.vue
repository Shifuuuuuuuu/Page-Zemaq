<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center p-3">
    <div class="z-card p-4" style="max-width: 520px; width: 100%;">
      <h1 class="h5 mb-2" style="color: var(--z-dark);">Sesión iniciada ✅</h1>
      <p class="z-muted mb-4">Bienvenido/a, {{ userName }}</p>

      <button class="btn btn-outline-dark w-100" @click="logout">Cerrar sesión</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"

const router = useRouter()
const userName = computed(() => auth.currentUser?.displayName || auth.currentUser?.email || "Usuario")

const logout = async () => {
  await signOut(auth)
  router.push("/login")
}
</script>
