<template>
  <div class="z-nav-shell">
    <header class="d-lg-none sticky-top z-topbar border-bottom">
      <div class="container-fluid py-2 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <img :src="logo" class="z-logo-sm" alt="Zemaq" />
          <div class="fw-semibold z-text">Zemaq</div>
        </div>

        <button class="btn z-btn text-white" type="button" @click="openOffcanvas">
          <i class="bi bi-list fs-5"></i>
        </button>
      </div>
    </header>
    <div
      class="offcanvas offcanvas-start z-offcanvas d-lg-none"
      tabindex="-1"
      id="zSide"
      ref="offcanvasEl"
      aria-labelledby="zSideLabel"
    >
      <div class="offcanvas-header border-bottom">
        <div class="d-flex align-items-center gap-2">
          <img :src="logo" class="z-logo-sm" alt="Zemaq" />
          <div>
            <div class="fw-bold z-text" id="zSideLabel">Zemaq</div>
            <div class="small z-muted">Menu</div>
          </div>
        </div>

        <button type="button" class="btn-close" @click="closeOffcanvas" aria-label="Close"></button>
      </div>

      <div class="offcanvas-body d-flex flex-column">
        <nav class="d-flex flex-column gap-1">
          <RouterLink
            v-for="it in items"
            :key="it.to"
            :to="it.to"
            class="z-nav-item"
            :class="{ active: route.path === it.to }"
            @click="closeOffcanvas"
          >
            <i class="bi me-2" :class="it.icon"></i>
            <span class="flex-grow-1">{{ it.label }}</span>
            <i class="bi bi-chevron-right small opacity-50"></i>
          </RouterLink>
        </nav>

        <div class="mt-auto pt-3 border-top">
          <button
            type="button"
            class="z-user z-user-btn p-3 w-100 text-start"
            @click="goPerfil(true)"
            title="Ver mi perfil"
          >
            <div class="d-flex align-items-center gap-2">
              <div class="z-avatar"><i class="bi bi-person-fill"></i></div>
              <div class="min-w-0">
                <div class="fw-semibold text-truncate z-text">
                  {{ user?.displayName || user?.email || "Usuario" }}
                </div>
                <div class="small z-muted text-truncate">{{ user?.email || "" }}</div>
              </div>
              <i class="bi bi-chevron-right ms-auto opacity-50"></i>
            </div>
          </button>

          <div class="z-footer-actions mt-2">
            <button class="btn z-icon-btn" @click="openSettings(true)" title="Configuración">
              <i class="bi bi-gear fs-5"></i>
            </button>
            <button class="btn z-icon-btn" @click="logout" title="Cerrar sesión">
              <i class="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <aside class="z-sidenav d-none d-lg-flex">
      <div class="z-side-inner d-flex flex-column">
        <div class="p-3 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <img :src="logo" class="z-logo" alt="Zemaq" />
            <div>
              <div class="fw-bold z-text">Zemaq</div>
              <div class="small z-muted">Menu</div>
            </div>
          </div>
        </div>

        <div class="p-2">
          <nav class="d-flex flex-column gap-1">
            <RouterLink
              v-for="it in items"
              :key="it.to"
              :to="it.to"
              class="z-nav-item"
              :class="{ active: route.path === it.to }"
            >
              <i class="bi me-2" :class="it.icon"></i>
              <span class="flex-grow-1">{{ it.label }}</span>
              <i class="bi bi-chevron-right small opacity-50"></i>
            </RouterLink>
          </nav>
        </div>

        <div class="mt-auto p-3 border-top">
          <button
            type="button"
            class="z-user z-user-btn p-3 w-100 text-start"
            @click="goPerfil(false)"
            title="Ver mi perfil"
          >
            <div class="d-flex align-items-center gap-2">
              <div class="z-avatar"><i class="bi bi-person-fill"></i></div>
              <div class="min-w-0">
                <div class="fw-semibold text-truncate z-text">
                  {{ user?.displayName || user?.email || "Usuario" }}
                </div>
                <div class="small z-muted text-truncate">{{ user?.email || "" }}</div>
              </div>
            </div>
          </button>

          <div class="z-footer-actions mt-2">
            <button class="btn z-icon-btn" @click="openSettings(false)" title="Configuración">
              <i class="bi bi-gear fs-5"></i>
            </button>
            <button class="btn z-icon-btn" @click="logout" title="Cerrar sesión">
              <i class="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>

          <div class="small z-muted mt-2 text-center">Personaliza tu experiencia</div>
        </div>
      </div>
    </aside>

    <div class="modal fade" id="zSettings" tabindex="-1" ref="settingsEl" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content z-modal">
          <div class="modal-header">
            <h5 class="modal-title z-text">Configuración</h5>
            <button type="button" class="btn-close" @click="closeSettings"></button>
          </div>

          <div class="modal-body">
            <div class="mb-3">
              <div class="fw-semibold mb-2 z-text">Fondo de la app</div>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-for="b in bgPresets"
                  :key="b.value"
                  class="z-bg-chip"
                  type="button"
                  :class="{ active: prefs.bg === b.value }"
                  @click="setBg(b.value)"
                >
                  <span class="z-bg-dot" :style="{ background: b.value }"></span>
                  <span>{{ b.label }}</span>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <div class="fw-semibold mb-2 z-text">Color del menú</div>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-for="s in sidePresets"
                  :key="s.value"
                  class="z-bg-chip"
                  type="button"
                  :class="{ active: prefs.sideBg === s.value }"
                  @click="setSideBg(s.value)"
                >
                  <span class="z-bg-dot" :style="{ background: s.value }"></span>
                  <span>{{ s.label }}</span>
                </button>
              </div>
            </div>

            <hr />

            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary w-50" @click="resetPrefs" type="button">
                Restaurar
              </button>
              <button class="btn z-btn text-white fw-semibold w-50" @click="closeSettings" type="button">
                Listo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRoute, useRouter, RouterLink } from "vue-router"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"
import logo from "../assets/img/zemaq-logo.png"
import { Offcanvas, Modal } from "bootstrap"

const route = useRoute()
const router = useRouter()

const offcanvasEl = ref(null)
const settingsEl = ref(null)

let offcanvasInstance = null
let settingsInstance = null


const items = [
  { label: "Inicio", to: "/home", icon: "bi-house" },
  { label: "Certificados", to: "/certificados", icon: "bi-award" },
  { label: "Gestor de Certificados", to: "/gestor-certificados", icon: "bi-book" },
]


const user = ref(null)
let unsubAuth = null


const goPerfil = (fromMobile = false) => {
  if (fromMobile) closeOffcanvas()
  if (route.path !== "/perfil") router.push("/perfil")
}


const BG_DEFAULT = "#f7fbfb"
const SIDEBG_DEFAULT = "rgba(255,255,255,.88)"

const prefs = ref({
  bg: BG_DEFAULT,
  sideBg: SIDEBG_DEFAULT,
  dark: false,
})

const bgPresets = [
  { label: "Claro", value: "#f7fbfb" },
  { label: "Gris suave", value: "#f4f5f7" },
  { label: "Verde suave", value: "#eef7f4" },
]

const sidePresets = [
  { label: "Claro", value: "rgba(255,255,255,.88)" },
  { label: "Gris suave", value: "rgba(244,245,247,.92)" },
  { label: "Verde suave", value: "rgba(238,247,244,.92)" },
]

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem("zemaq_prefs")
    if (!raw) return
    prefs.value = { ...prefs.value, ...JSON.parse(raw) }
  } catch {}
}
const savePrefs = () => localStorage.setItem("zemaq_prefs", JSON.stringify(prefs.value))

const applyPrefs = () => {
  const root = document.documentElement
  root.style.setProperty("--z-bg", prefs.value.dark ? "#0b1220" : prefs.value.bg)
  root.style.setProperty("--z-side-bg", prefs.value.dark ? "#0f172a" : prefs.value.sideBg)
  root.style.setProperty("--z-text", prefs.value.dark ? "#ffffff" : "#231F20")
  root.style.setProperty("--z-muted", prefs.value.dark ? "rgba(255,255,255,.70)" : "rgba(35,31,32,.60)")
  root.style.setProperty("--z-border", prefs.value.dark ? "rgba(255,255,255,.14)" : "rgba(35,31,32,.10)")
  document.body.classList.toggle("z-dark", !!prefs.value.dark)
  savePrefs()
}

const setBg = (b) => { prefs.value.bg = b; applyPrefs() }
const setSideBg = (b) => { prefs.value.sideBg = b; applyPrefs() }

const resetPrefs = () => {
  prefs.value = { bg: BG_DEFAULT, sideBg: SIDEBG_DEFAULT, dark: false }
  applyPrefs()
}


const cleanupOffcanvas = () => {
  document.querySelectorAll(".offcanvas-backdrop").forEach((b) => b.remove())
  document.body.style.overflow = ""
}

const openOffcanvas = () => offcanvasInstance?.show()
const closeOffcanvas = () => offcanvasInstance?.hide()

const openSettings = (fromMobile = false) => {
  if (fromMobile && offcanvasEl.value) {
    const el = offcanvasEl.value
    const handler = () => {
      el.removeEventListener("hidden.bs.offcanvas", handler)
      cleanupOffcanvas()
      settingsInstance?.show()
    }
    el.addEventListener("hidden.bs.offcanvas", handler)
    closeOffcanvas()
    return
  }
  settingsInstance?.show()
}
const closeSettings = () => settingsInstance?.hide()

watch(() => route.path, () => closeOffcanvas())

const logout = async () => {
  closeOffcanvas()
  await signOut(auth)
  router.push("/login")
}

onMounted(async () => {
  unsubAuth = onAuthStateChanged(auth, (u) => {
    user.value = u
  })

  loadPrefs()
  applyPrefs()

  await nextTick()

  if (offcanvasEl.value) {
    offcanvasInstance = Offcanvas.getOrCreateInstance(offcanvasEl.value, { backdrop: true, scroll: false })
    offcanvasEl.value.addEventListener("hidden.bs.offcanvas", cleanupOffcanvas)
  }

  if (settingsEl.value) {
    settingsInstance = Modal.getOrCreateInstance(settingsEl.value, { backdrop: true, keyboard: true })
  }

  cleanupOffcanvas()
})

onBeforeUnmount(() => {
  offcanvasEl.value?.removeEventListener("hidden.bs.offcanvas", cleanupOffcanvas)
  offcanvasInstance?.dispose()
  settingsInstance?.dispose()
  unsubAuth?.()
})
</script>

<style scoped>
.z-text{ color: var(--z-text); }
:global(.z-muted){ color: var(--z-muted) !important; }

:global(.z-btn){
  background: #00A6A6 !important;
  border-color: #00A6A6 !important;
}

.z-nav-shell{ width: 100%; flex: 0 0 auto; }
@media (min-width: 992px){ .z-nav-shell{ width: auto; } }

.z-sidenav { width: 280px; height: 100vh; position: sticky; top: 0; padding: 12px; }
.z-side-inner {
  width: 100%;
  border-radius: 18px;
  background: var(--z-side-bg);
  border: 1px solid var(--z-border);
  box-shadow: 0 18px 55px rgba(35,31,32,.10);
  overflow: hidden;
}

.z-topbar{
  background: var(--z-side-bg);
  backdrop-filter: blur(10px);
}

.z-logo{ width: 44px; height: 44px; object-fit: contain; }
.z-logo-sm{ width: 34px; height: 34px; object-fit: contain; }

.z-nav-item{
  display:flex; align-items:center; gap:8px;
  padding:10px 12px; border-radius:14px;
  text-decoration:none; color: var(--z-text);
  border:1px solid transparent;
  transition: transform .12s ease, background .12s ease, border-color .12s ease;
}
.z-nav-item:hover{
  background: rgba(0,166,166,.12);
  border-color: rgba(0,166,166,.22);
  transform: translateX(2px);
}
.z-nav-item.active{
  background: rgba(0,166,166,.16);
  border-color: rgba(0,166,166,.32);
}

.z-user{
  border-radius:16px;
  background: color-mix(in srgb, var(--z-side-bg) 70%, white 30%);
  border:1px solid var(--z-border);
}
.z-user-btn{
  cursor: pointer;
  transition: transform .12s ease, background .12s ease, border-color .12s ease;
}
.z-user-btn:hover{
  background: rgba(0,166,166,.10);
  border-color: rgba(0,166,166,.28);
  transform: translateY(-1px);
}
.z-user-btn:active{ transform: translateY(0px); }

.z-avatar{
  width:36px; height:36px; border-radius:12px;
  display:grid; place-items:center;
  background: rgba(0,166,166,.16);
  color: var(--z-text);
}

.z-footer-actions{ display:flex; gap:10px; }
.z-icon-btn{
  flex:1; border-radius:14px;
  border:1px solid var(--z-border);
  background: rgba(255,255,255,.35);
  color: var(--z-text);
}
.z-icon-btn:hover{
  background: rgba(0,166,166,.12);
  border-color: rgba(0,166,166,.32);
}

.z-offcanvas{
  background: var(--z-side-bg);
  backdrop-filter: blur(10px);
}

.z-modal{
  border-radius:16px;
  border:1px solid var(--z-border);
  box-shadow: 0 18px 55px rgba(35,31,32,.18);
  background: color-mix(in srgb, var(--z-bg) 60%, white 40%);
  color: var(--z-text);
}

.z-bg-chip{
  display:flex; align-items:center; gap:8px;
  padding:8px 10px;
  border-radius: 14px;
  border: 1px solid var(--z-border);
  background: rgba(255,255,255,.35);
  color: var(--z-text);
  font-size: .9rem;
}
.z-bg-chip.active{ border-color: rgba(0,166,166,.55); background: rgba(0,166,166,.10); }
.z-bg-dot{ width:14px; height:14px; border-radius:999px; border: 1px solid var(--z-border); }

:global(body.z-dark) .btn-close{
  filter: invert(1) grayscale(100%);
  opacity: .9;
}
</style>
