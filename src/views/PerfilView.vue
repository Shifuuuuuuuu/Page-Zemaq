<template>
  <div class="min-vh-100 p-3 p-lg-4" style="background: var(--z-bg);">
    <div class="container" style="max-width: 980px;">

      <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h1 class="h4 mb-1" style="color: var(--z-text);">Mi perfil</h1>
          <div class="text-muted">
            Gestiona tus datos personales.
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" @click="reload" :disabled="loading || saving">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-arrow-clockwise me-2"></i>
            Actualizar
          </button>
        </div>
      </div>


      <transition name="fade">
        <div
          v-if="alert.msg"
          class="alert py-2 mb-3"
          :class="alert.type === 'ok' ? 'alert-success' : alert.type === 'warn' ? 'alert-warning' : 'alert-danger'"
        >
          <div class="d-flex align-items-start justify-content-between gap-3">
            <div>
              <b v-if="alert.type==='ok'">✅ Listo</b>
              <b v-else-if="alert.type==='warn'">⚠️ Ojo</b>
              <b v-else>⛔ Error</b>
              <div class="small mt-1">{{ alert.msg }}</div>
            </div>
            <button class="btn-close" @click="alert.msg=''" aria-label="Cerrar"></button>
          </div>
        </div>
      </transition>

      <div class="row g-3">
        <div class="col-12 col-lg-4">
          <div class="z-card p-4 h-100">
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="z-avatar-lg">
                <i class="bi bi-person-fill"></i>
              </div>
              <div class="min-w-0">
                <div class="fw-bold text-truncate" style="color: var(--z-text);">
                  {{ perfil.nombre || "Usuario" }}
                </div>
                <div class="small text-muted text-truncate">
                  {{ perfil.correo || authUser?.email || "-" }}
                </div>
              </div>
            </div>

            <div class="z-kv">
              <div class="z-kv-row">
                <div class="z-k">Creado</div>
                <div class="z-v">{{ fmtTs(perfil.createdAt) }}</div>
              </div>
              <div class="z-kv-row">
                <div class="z-k">Actualizado</div>
                <div class="z-v">{{ fmtTs(perfil.updatedAt) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="z-card p-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <div>
                <div class="fw-bold" style="color: var(--z-text);">Datos editables</div>
                <div class="small text-muted">Nombre, RUT y teléfono</div>
              </div>

              <span
                class="badge"
                :class="editing ? 'text-bg-primary' : (dirty ? 'text-bg-warning' : 'text-bg-success')"
              >
                {{ editing ? "Modo edición" : (dirty ? "Cambios pendientes" : "Todo guardado") }}
              </span>
            </div>

            <div v-if="loading" class="alert alert-info py-2 d-flex align-items-center gap-2">
              <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
              <div class="small mb-0"><b>Cargando:</b> perfil del usuario…</div>
            </div>

            <form v-else class="vstack gap-3" @submit.prevent="save">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label text-muted">Correo</label>
                  <input class="form-control" :value="perfil.correo || authUser?.email || ''" disabled />
                </div>

                <div class="col-12">
                  <label class="form-label text-muted">Nombre</label>
                  <input
                    v-model.trim="form.nombre"
                    class="form-control"
                    placeholder="Ej: Ronal Sanhueza"
                    :disabled="saving || !editing"
                    @input="onDirty"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label text-muted">RUT</label>
                  <input
                    v-model.trim="form.rut"
                    class="form-control"
                    placeholder="Ej: 12.345.678-9"
                    :class="rutError ? 'is-invalid' : ''"
                    :disabled="saving || !editing"
                    inputmode="text"
                    @input="onRutInput"
                    @blur="onRutBlur"
                  />
                  <div v-if="rutError" class="invalid-feedback">
                    {{ rutError }}
                  </div>
                  <div v-else class="form-text text-muted">Se formatea automáticamente. Acepta K/k.</div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label text-muted">Teléfono</label>
                  <input
                    v-model.trim="form.telefono"
                    class="form-control"
                    placeholder="Ej: +56912345678"
                    :class="telError ? 'is-invalid' : ''"
                    :disabled="saving || !editing"
                    inputmode="tel"
                    @input="onPhoneInput"
                    @blur="onPhoneBlur"
                  />
                  <div v-if="telError" class="invalid-feedback">
                    {{ telError }}
                  </div>
                  <div v-else class="form-text text-muted">
                    Se guarda limpio: solo <b>+</b> y números
                  </div>
                </div>
              </div>


              <div class="d-flex flex-wrap gap-2 pt-2">

                <button
                  v-if="!editing"
                  type="button"
                  class="btn z-btn text-white fw-semibold ms-auto"
                  @click="startEdit"
                  :disabled="saving"
                >
                  <i class="bi bi-pencil-square me-2"></i>
                  Editar perfil
                </button>

                <template v-else>
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="cancelEdit"
                    :disabled="saving"
                  >
                    <i class="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    class="btn z-btn text-white fw-semibold ms-auto"
                    :disabled="saving || !canSave"
                  >
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-save2 me-2"></i>
                    {{ saving ? "Guardando..." : "Guardar cambios" }}
                  </button>
                </template>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import { AuthService } from "../services/auth"

const router = useRouter()
const authUser = computed(() => auth.currentUser)

const loading = ref(true)
const saving = ref(false)
const editing = ref(false)

const alert = reactive({ type: "ok", msg: "" })

const perfil = reactive({
  uid: "",
  correo: "",
  nombre: "",
  rut: "",
  telefono: "",
  createdAt: null,
  updatedAt: null,
})

const form = reactive({
  nombre: "",
  rut: "",
  telefono: "",
})

const original = reactive({
  nombre: "",
  rut: "",
  telefono: "",
})

const dirty = ref(false)
const rutError = ref("")
const telError = ref("")

const fmtTs = (ts) => {
  if (!ts) return "-"
  const d =
    typeof ts?.toDate === "function" ? ts.toDate() :
    ts?.seconds ? new Date(ts.seconds * 1000) :
    ts instanceof Date ? ts :
    null
  if (!d) return "-"
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}

function cleanRut(rut) {
  return String(rut || "").replace(/\./g, "").replace(/-/g, "").trim()
}
function formatRut(rut) {
  const cr = cleanRut(rut)
  if (!cr) return ""
  const body = cr.slice(0, -1)
  const dv = cr.slice(-1).toUpperCase()
  if (!body) return ""
  const reversed = body.split("").reverse().join("")
  const withDots = reversed.replace(/(\d{3})(?=\d)/g, "$1.").split("").reverse().join("")
  return `${withDots}-${dv}`
}
function isValidRut(rut) {
  const cr = cleanRut(rut).toUpperCase()
  if (!/^\d+[0-9K]$/.test(cr)) return false
  const body = cr.slice(0, -1)
  const dv = cr.slice(-1)

  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const mod = 11 - (sum % 11)
  const dvCalc = mod === 11 ? "0" : mod === 10 ? "K" : String(mod)
  return dvCalc === dv
}


const normalizePhone = (raw) => {
  let s = String(raw || "").trim()

  s = s.replace(/[^\d+]/g, "")

  const hasPlus = s.startsWith("+")
  s = s.replace(/\+/g, "")
  if (hasPlus) s = "+" + s

  return s
}


const prettyPhone = (raw) => {
  const n = normalizePhone(raw)
  if (!n) return ""
  if (/^\+569\d{8}$/.test(n)) return `+56 9 ${n.slice(4, 8)} ${n.slice(8)}`
  return n
}

const isValidPhone = (v) => {
  const n = normalizePhone(v)
  if (!n) return true
  const digits = n.startsWith("+") ? n.slice(1) : n
  return /^\d{8,15}$/.test(digits)
}

const onDirty = () => {
  dirty.value =
    form.nombre !== original.nombre ||
    form.rut !== original.rut ||
    form.telefono !== original.telefono
}

const onRutInput = () => {
  if (!editing.value) return
  form.rut = form.rut.replace(/[^0-9kK.\-]/g, "")
  rutError.value = ""
  onDirty()
}
const onRutBlur = () => {
  if (!editing.value) return
  form.rut = formatRut(form.rut)
  if (form.rut && !isValidRut(form.rut)) rutError.value = "RUT inválido (formato o dígito verificador)."
  else rutError.value = ""
  onDirty()
}

const onPhoneInput = () => {
  if (!editing.value) return
  form.telefono = normalizePhone(form.telefono)
  telError.value = ""
  onDirty()
}
const onPhoneBlur = () => {
  if (!editing.value) return
  form.telefono = prettyPhone(form.telefono)
  telError.value = isValidPhone(form.telefono) ? "" : "Teléfono inválido. Usa formato + y números."
  onDirty()
}

const validate = () => {
  rutError.value = ""
  telError.value = ""
  alert.msg = ""

  if (!form.nombre.trim()) {
    alert.type = "warn"
    alert.msg = "El nombre no puede quedar vacío."
    return false
  }
  if (form.rut && !isValidRut(form.rut)) {
    rutError.value = "RUT inválido (formato o dígito verificador)."
    return false
  }
  if (!isValidPhone(form.telefono)) {
    telError.value = "Teléfono inválido. Usa solo + y números (ej: +56990409011)."
    return false
  }
  return true
}

const canSave = computed(() =>
  editing.value &&
  dirty.value &&
  !rutError.value &&
  !telError.value &&
  !!form.nombre.trim()
)

function startEdit() {
  alert.msg = ""
  rutError.value = ""
  telError.value = ""
  editing.value = true
}

function cancelEdit() {
  form.nombre = original.nombre
  form.rut = original.rut
  form.telefono = original.telefono
  rutError.value = ""
  telError.value = ""
  dirty.value = false
  alert.msg = ""
  editing.value = false
}

async function loadProfile() {
  loading.value = true
  alert.msg = ""

  try {
    const u = auth.currentUser
    if (!u?.uid) {
      router.push("/login")
      return
    }

    const snap = await getDoc(doc(db, "usuarios", u.uid))
    if (!snap.exists()) {
      alert.type = "danger"
      alert.msg = "No existe tu perfil en la colección 'usuarios'."
      return
    }

    const data = snap.data()

    perfil.uid = data.uid || u.uid
    perfil.correo = data.correo || u.email || ""
    perfil.nombre = data.nombre || u.displayName || ""
    perfil.rut = data.rut || ""
    perfil.telefono = data.telefono || ""
    perfil.createdAt = data.createdAt || null
    perfil.updatedAt = data.updatedAt || null

    form.nombre = perfil.nombre
    form.rut = perfil.rut
    form.telefono = perfil.telefono

    original.nombre = form.nombre
    original.rut = form.rut
    original.telefono = form.telefono

    dirty.value = false
    editing.value = false
  } catch (e) {
    console.error(e)
    alert.type = "danger"
    alert.msg = "No se pudo cargar el perfil."
  } finally {
    loading.value = false
  }
}

async function save() {
  alert.msg = ""
  if (!validate()) return

  saving.value = true
  try {
    await AuthService.updateProfileData({
      nombre: form.nombre.trim(),
      rut: form.rut ? formatRut(form.rut) : "",
      telefono: normalizePhone(form.telefono), 
    })

    alert.type = "ok"
    alert.msg = "Perfil actualizado correctamente."

    await loadProfile()

    setTimeout(() => { alert.msg = "" }, 2500)
  } catch (e) {
    console.error(e)
    alert.type = "danger"
    alert.msg = e?.message || "No se pudo actualizar tu perfil."
  } finally {
    saving.value = false
  }
}

const reload = () => loadProfile()


onMounted(loadProfile)
</script>

<style scoped>
.z-card{
  background:#fff;
  border: 1px solid var(--z-border);
  border-radius: 18px;
  box-shadow: 0 18px 55px rgba(35,31,32,.10);
}

.z-avatar-lg{
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(0,166,166,.16);
  color: var(--z-text);
  font-size: 1.4rem;
}

.z-kv{
  border: 1px solid var(--z-border);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255,255,255,.35);
}
.z-kv-row{
  display:flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--z-border);
}
.z-kv-row:last-child{ border-bottom: none; }
.z-k{ font-size: .85rem; color: var(--z-muted); }
.z-v{ font-size: .9rem; color: var(--z-text); }
.z-mono{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

:global(.z-btn){
  background: #00A6A6 !important;
  border-color: #00A6A6 !important;
}

.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
