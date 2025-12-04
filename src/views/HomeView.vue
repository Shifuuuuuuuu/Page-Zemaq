<template>

    <div class="container" style="max-width: 1100px;">

      <transition name="fadeDown">
        <div
          v-if="loginToast"
          class="alert alert-success d-flex align-items-center justify-content-between gap-3"
        >
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-shield-check fs-5"></i>
            <div>
              <div class="fw-semibold">¡Sesión iniciada con éxito!</div>
              <div class="small">
                Bienvenido/a <b>{{ userName }}</b>. Puedes navegar desde el menú lateral.
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-success" @click="loginToast=false">
            Cerrar
          </button>
        </div>
      </transition>
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h1 class="h4 mb-1" style="color: var(--z-dark);">Inicio</h1>
          <p class="text-muted mb-0">
            Bienvenido/a, <b>{{ userName }}</b>
          </p>
          <div class="small text-muted mt-1">
            Usa el menú lateral para crear, gestionar o verificar certificados.
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" @click="refreshAll" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-arrow-clockwise me-2"></i>
            Actualizar
          </button>
        </div>
      </div>


      <div class="row g-3 mb-3">
        <div class="col-12 col-lg-3">
          <div class="z-card p-3 h-100">
            <div class="text-muted small">Total certificados</div>
            <div class="d-flex align-items-end justify-content-between">
              <div class="display-6 mb-0">{{ stats.total }}</div>
              <i class="bi bi-award fs-2 text-muted"></i>
            </div>
            <div class="small text-muted mt-1">Mantención + Operatividad</div>
          </div>
        </div>

        <div class="col-12 col-lg-3">
          <div class="z-card p-3 h-100">
            <div class="text-muted small">Mantención</div>
            <div class="d-flex align-items-end justify-content-between">
              <div class="display-6 mb-0">{{ stats.mantencion }}</div>
              <i class="bi bi-tools fs-2 text-muted"></i>
            </div>
            <div class="small text-muted mt-1">Total emitidos</div>
          </div>
        </div>

        <div class="col-12 col-lg-3">
          <div class="z-card p-3 h-100">
            <div class="text-muted small">Operatividad</div>
            <div class="d-flex align-items-end justify-content-between">
              <div class="display-6 mb-0">{{ stats.operatividad }}</div>
              <i class="bi bi-gear-wide-connected fs-2 text-muted"></i>
            </div>
            <div class="small text-muted mt-1">Total emitidos</div>
          </div>
        </div>

        <div class="col-12 col-lg-3">
          <div class="z-card p-3 h-100">
            <div class="text-muted small">Estado vigencia</div>
            <div class="d-flex align-items-end justify-content-between">
              <div class="mb-0">
                <div class="h4 text-success mb-0">{{ stats.vigentes }}</div>
                <div class="small text-muted">Vigentes</div>
                <div class="h5 text-warning mb-0 mt-2">{{ stats.vencidos }}</div>
                <div class="small text-muted">Vencidos</div>
              </div>
              <i class="bi bi-shield-check fs-2 text-success"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="z-card p-3 p-lg-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div>
            <div class="fw-bold" style="color: var(--z-dark);">Últimos certificados emitidos</div>
            <div class="text-muted small">Lista combinada (mantención + operatividad)</div>
          </div>
          <span class="badge text-bg-light border">
            {{ recent.length }} mostrados
          </span>
        </div>

        <div v-if="loading" class="alert alert-info py-2 d-flex align-items-center gap-2 mb-3">
          <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
          <div class="small mb-0"><b>Cargando:</b> resumen y últimos certificados…</div>
        </div>

        <div v-if="!loading && !recent.length" class="text-muted small py-4 text-center">
          Aún no hay certificados guardados.
        </div>

        <div v-else class="table-responsive">
          <table class="table align-middle mb-0">
            <thead>
              <tr class="text-muted small">
                <th>Código</th>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Vence</th>
                <th class="text-end">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in recent" :key="c._key">
                <td class="fw-semibold">
                  <span class="z-mono">{{ c.codigo }}</span>
                </td>
                <td>{{ c.nombre }}</td>
                <td class="text-muted">{{ c.rut }}</td>
                <td>
                  <span class="badge"
                        :class="c._tipo === 'mantencion' ? 'text-bg-primary' : 'text-bg-dark'">
                    {{ c._tipo === 'mantencion' ? 'Mantención' : 'Operatividad' }}
                  </span>
                </td>
                <td class="text-muted">{{ c.fechaTexto || "-" }}</td>
                <td class="text-muted">{{ formatDate(c.venceEn) }}</td>
                <td class="text-end">
                  <span class="badge" :class="isVigente(c.venceEn) ? 'text-bg-success' : 'text-bg-warning'">
                    {{ isVigente(c.venceEn) ? 'Vigente' : 'Vencido' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="small text-muted mt-3">
          Para descargar o eliminar, entra a <b>Gestión de certificados</b> desde el menú lateral.
        </div>
      </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { signOut } from "firebase/auth"
import { auth, db } from "../firebase"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"

const router = useRouter()
const userName = computed(() => auth.currentUser?.displayName || auth.currentUser?.email || "Usuario")

const loginToast = ref(false)

const loading = ref(false)
const stats = ref({
  total: 0,
  mantencion: 0,
  operatividad: 0,
  vigentes: 0,
  vencidos: 0,
})
const recent = ref([])

const toDate = (ts) => {
  if (!ts) return null
  if (typeof ts.toDate === "function") return ts.toDate()
  if (ts?.seconds) return new Date(ts.seconds * 1000)
  return null
}

const isVigente = (venceEn) => {
  const d = toDate(venceEn)
  if (!d) return false
  return new Date() <= d
}

const formatDate = (ts) => {
  const d = toDate(ts)
  if (!d) return "-"
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

async function loadStatsAndRecent() {
  loading.value = true
  try {
    const [mAll, oAll] = await Promise.all([
      getDocs(collection(db, "certificado_mantencion")),
      getDocs(collection(db, "certificado_operatividad")),
    ])

    const allM = mAll.docs.map(d => ({ id: d.id, ...d.data(), _tipo: "mantencion" }))
    const allO = oAll.docs.map(d => ({ id: d.id, ...d.data(), _tipo: "operatividad" }))
    const all = [...allM, ...allO]

    let vig = 0, ven = 0
    for (const c of all) (isVigente(c.venceEn) ? vig++ : ven++)

    stats.value = {
      total: all.length,
      mantencion: allM.length,
      operatividad: allO.length,
      vigentes: vig,
      vencidos: ven,
    }

    const [mRecent, oRecent] = await Promise.all([
      getDocs(query(collection(db, "certificado_mantencion"), orderBy("creadoEn", "desc"), limit(8))),
      getDocs(query(collection(db, "certificado_operatividad"), orderBy("creadoEn", "desc"), limit(8))),
    ])

    const rr = [
      ...mRecent.docs.map(d => ({ _key: `m-${d.id}`, id: d.id, ...d.data(), _tipo: "mantencion" })),
      ...oRecent.docs.map(d => ({ _key: `o-${d.id}`, id: d.id, ...d.data(), _tipo: "operatividad" })),
    ]

    rr.sort((a, b) => {
      const da = toDate(a.creadoEn) || toDate(a.creadoEnCliente) || new Date(0)
      const dbb = toDate(b.creadoEn) || toDate(b.creadoEnCliente) || new Date(0)
      return dbb - da
    })

    recent.value = rr.slice(0, 10)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const refreshAll = () => loadStatsAndRecent()


onMounted(() => {
  const just = sessionStorage.getItem("justLoggedIn")
  if (just === "1") {
    sessionStorage.removeItem("justLoggedIn")
    loginToast.value = true
    setTimeout(() => (loginToast.value = false), 3500)
  }
  loadStatsAndRecent()
})
</script>

<style scoped>
.z-card{
  background:#fff;
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,.06);
}
.z-mono{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: .9rem;
}
.fadeDown-enter-active, .fadeDown-leave-active { transition: all .18s ease; }
.fadeDown-enter-from { opacity: 0; transform: translateY(-8px); }
.fadeDown-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
