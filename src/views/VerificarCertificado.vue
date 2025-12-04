<template>
  <div class="container py-4">
    <div class="z-card p-4 p-lg-5">
      <div class="d-flex align-items-start justify-content-between gap-3">
        <div>
          <h1 class="h4 mb-1">Verificar certificado</h1>
          <p class="text-muted mb-0">
            Ingresa el código o escanea el QR del certificado.
          </p>
        </div>
        <span class="badge text-bg-dark">ZEMAQ electric</span>
      </div>

      <hr class="my-4" />

      <div class="row g-3 align-items-end">
        <div class="col-12 col-lg-8">
          <label class="form-label text-muted">Código</label>
          <input
            v-model.trim="code"
            class="form-control"
            placeholder="Ej: 00000000001234567890..."
            @keyup.enter="buscar"
          />
          <div class="form-text">
            Tip: si vienes desde el QR, esto se llena solo.
          </div>
        </div>
        <div class="col-12 col-lg-4 d-flex gap-2">
          <button class="btn btn-outline-secondary w-50" :disabled="loading" @click="limpiar">
            Limpiar
          </button>
          <button class="btn btn-primary w-50" :disabled="loading || !code" @click="buscar">
            {{ loading ? "Buscando..." : "Verificar" }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="alert alert-info mt-3 d-flex align-items-center gap-2">
        <div class="spinner-border spinner-border-sm"></div>
        Consultando certificado…
      </div>

      <div v-if="notFound" class="alert alert-danger mt-3">
        No se encontró un certificado con ese código. Verifica que esté bien escrito.
      </div>

      <div v-if="found" class="mt-4">
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span class="badge" :class="vigente ? 'text-bg-success' : 'text-bg-warning'">
            {{ vigente ? "VÁLIDO / VIGENTE" : "VÁLIDO / VENCIDO" }}
          </span>
          <span class="badge text-bg-secondary">{{ found.curso }}</span>
          <span class="badge text-bg-dark">Código: {{ found.codigo }}</span>
        </div>

        <div class="row g-3">
          <div class="col-12 col-lg-6">
            <div class="p-3 border rounded-3">
              <div class="text-muted small">Nombre</div>
              <div class="fw-semibold">{{ found.nombre }}</div>
              <div class="text-muted small mt-2">RUT</div>
              <div class="fw-semibold">{{ found.rut }}</div>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <div class="p-3 border rounded-3">
              <div class="text-muted small">Curso</div>
              <div class="fw-semibold">{{ found.tipoCursoTexto }}</div>
              <div class="text-muted small mt-2">Modalidad</div>
              <div class="fw-semibold">{{ found.modalidadTexto }}</div>
            </div>
          </div>

          <div class="col-12">
            <div class="p-3 border rounded-3 d-flex flex-wrap justify-content-between gap-3">
              <div>
                <div class="text-muted small">Actividad</div>
                <div class="fw-semibold">{{ found.actividad }}</div>
              </div>
              <div>
                <div class="text-muted small">Horas</div>
                <div class="fw-semibold">{{ found.horas }}</div>
              </div>
              <div>
                <div class="text-muted small">Creado</div>
                <div class="fw-semibold">{{ fmtTS(found.creadoEnCliente) }}</div>
              </div>
              <div>
                <div class="text-muted small">Vence</div>
                <div class="fw-semibold">{{ fmtTS(found.venceEn) }}</div>
              </div>
            </div>

            <div class="small text-muted mt-2">
              Nota: Un certificado vencido sigue siendo auténtico, pero ya no está vigente.
            </div>
          </div>

          <div class="col-12 d-flex gap-2 justify-content-end">
            <button class="btn btn-outline-dark" @click="copiarLink" :disabled="!verifyUrl">
              Copiar link de verificación
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"

const route = useRoute()

const code = ref((route.query.code || "").toString())
const loading = ref(false)
const notFound = ref(false)
const found = ref(null)
const verifyUrl = ref("")

const vigente = computed(() => {
  if (!found.value?.venceEn) return false
  const venceDate = toDate(found.value.venceEn)
  return new Date() <= venceDate
})

function toDate(ts) {
  if (!ts) return new Date(0)
  if (typeof ts.toDate === "function") return ts.toDate()
  if (ts.seconds) return new Date(ts.seconds * 1000)
  return new Date(0)
}

function fmtTS(ts) {
  const d = toDate(ts)
  if (!d || isNaN(d.getTime())) return "—"
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

async function buscar() {
  const c = code.value.trim()
  if (!c) return

  loading.value = true
  notFound.value = false
  found.value = null
  verifyUrl.value = ""

  try {
    const refs = [
      doc(db, "certificado_mantencion", c),
      doc(db, "certificado_operatividad", c),
    ]

    const snaps = await Promise.all(refs.map((r) => getDoc(r)))
    const hit = snaps.find((s) => s.exists())

    if (!hit) {
      notFound.value = true
      return
    }

    found.value = hit.data()
    verifyUrl.value = found.value.verifyUrl || `${window.location.origin}/verificar?code=${encodeURIComponent(c)}`
  } catch (e) {
    console.error(e)
    notFound.value = true
  } finally {
    loading.value = false
  }
}

function limpiar() {
  code.value = ""
  found.value = null
  notFound.value = false
  verifyUrl.value = ""
}

async function copiarLink() {
  if (!verifyUrl.value) return
  try {
    await navigator.clipboard.writeText(verifyUrl.value)
    alert("Link copiado ✅")
  } catch {
    alert("No se pudo copiar el link.")
  }
}

onMounted(() => {
  if (code.value.trim()) buscar()
})
</script>

<style scoped>
.z-card{
  background:#fff;
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,.06);
}
</style>
