<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center p-3">
    <div class="container" style="max-width: 520px;">
      <div class="z-card p-4 p-md-5">
        <div class="text-center mb-3">
          <img :src="logo" alt="Zemaq" style="width: 88px; height: 88px; object-fit: contain;" />
        </div>

        <h1 class="h4 mb-1 text-center" style="color: var(--z-dark);">Crear cuenta</h1>
        <p class="z-muted text-center mb-4">Regístrate para acceder al portal.</p>

        <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
        <div v-if="ok" class="alert alert-success py-2">{{ ok }}</div>

        <form @submit.prevent="onRegister" class="vstack gap-3" novalidate>
          <div>
            <label class="form-label z-muted">Nombre</label>
            <input v-model.trim="name" class="form-control" placeholder="Tu nombre" />
          </div>

          <div>
            <label class="form-label z-muted">Correo</label>
            <input v-model.trim="email" type="email" class="form-control" placeholder="correo@empresa.com" />
          </div>

          <div>
            <label class="form-label z-muted">Teléfono</label>
            <input
              v-model="telefono"
              class="form-control"
              placeholder="+56 9 1234 5678"
              inputmode="tel"
              autocomplete="tel"
              @input="onTelefonoInput"
            />
            <div class="form-text z-muted">Solo números y “+”. Ej: +56 9 1234 5678</div>
          </div>

          <div>
            <label class="form-label z-muted">RUT</label>
            <input
              v-model="rut"
              class="form-control"
              placeholder="12.345.678-9"
              inputmode="text"
              autocomplete="off"
              @input="onRutInput"
              @blur="onRutBlur"
            />
            <div class="form-text z-muted">Solo números y K. Se formatea automáticamente.</div>
          </div>

          <div>
            <label class="form-label z-muted">Contraseña</label>
            <input v-model="password" type="password" class="form-control" placeholder="Mínimo 6 caracteres" />
          </div>

          <div>
            <label class="form-label z-muted">Confirmar contraseña</label>
            <input v-model="confirm" type="password" class="form-control" placeholder="Repite la contraseña" />
          </div>

          <button class="btn z-btn text-white fw-semibold py-2" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Registrarme
          </button>

          <div class="text-center small">
            <span class="z-muted">¿Ya tienes cuenta?</span>
            <RouterLink class="z-link fw-semibold ms-2" to="/login">Volver a login</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { AuthService } from "../services/auth"
import logo from "../assets/img/zemaq-logo.png"

const router = useRouter()

const name = ref("")
const email = ref("")
const telefono = ref("")
const rut = ref("")
const password = ref("")
const confirm = ref("")
const loading = ref(false)
const error = ref("")
const ok = ref("")

// ------------------------------
// Helpers: Validaciones básicas
// ------------------------------
const isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim())

// ------------------------------
// TELÉFONO: solo + y números + formato
// Ej: +56 9 1234 5678
// ------------------------------
const sanitizePhone = (value) => {
  let v = String(value || "")
  // solo permite + y números
  v = v.replace(/[^\d+]/g, "")
  // solo un + al inicio
  if (v.includes("+")) {
    v = "+" + v.replace(/\+/g, "")
  }
  return v
}

const formatPhone = (value) => {
  // formato simple: +56 9 1234 5678 (si tiene esa cantidad)
  let v = sanitizePhone(value)
  if (!v.startsWith("+")) v = "+" + v.replace(/\+/g, "")

  const digits = v.replace(/\D/g, "") // solo números (sin el +)
  // intentamos formatear como CL: 56 9 1234 5678
  // si no alcanza, lo dejamos agrupado suavemente
  if (digits.length >= 11) {
    const cc = digits.slice(0, 2)      // 56
    const m = digits.slice(2, 3)       // 9
    const p1 = digits.slice(3, 7)      // 1234
    const p2 = digits.slice(7, 11)     // 5678
    return `+${cc} ${m} ${p1} ${p2}`.trim()
  }

  // fallback: agrupa cada 3-4 para que se vea decente
  const parts = []
  let i = 0
  while (i < digits.length) {
    const take = i === 2 ? 1 : (i === 3 ? 4 : 4)
    parts.push(digits.slice(i, i + take))
    i += take
  }
  return "+" + parts.join(" ").trim()
}

const onTelefonoInput = (e) => {
  telefono.value = formatPhone(e.target.value)
}

const phoneDigitsCount = (value) => sanitizePhone(value).replace(/\D/g, "").length

// ------------------------------
// RUT: solo números y K + formato + validación DV
// ------------------------------
const cleanRut = (value) => {
  // deja solo números y K/k
  return String(value || "")
    .toUpperCase()
    .replace(/[^0-9K]/g, "")
}

const formatRut = (value) => {
  const v = cleanRut(value)
  if (!v) return ""

  const body = v.slice(0, -1)
  const dv = v.slice(-1)

  // formatear cuerpo con puntos
  const bodyWithDots = body
    .split("")
    .reverse()
    .join("")
    .replace(/(\d{3})(?=\d)/g, "$1.")
    .split("")
    .reverse()
    .join("")

  return body.length > 0 ? `${bodyWithDots}-${dv}` : v
}

const rutDv = (rutBody) => {
  // rutBody solo números
  let sum = 0
  let mul = 2
  for (let i = rutBody.length - 1; i >= 0; i--) {
    sum += parseInt(rutBody[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const res = 11 - (sum % 11)
  if (res === 11) return "0"
  if (res === 10) return "K"
  return String(res)
}

const isRutValid = (value) => {
  const v = cleanRut(value)
  if (v.length < 2) return false
  const body = v.slice(0, -1)
  const dv = v.slice(-1)

  if (!/^\d+$/.test(body)) return false
  return rutDv(body) === dv
}

const onRutInput = (e) => {
  rut.value = formatRut(e.target.value)
}

const onRutBlur = () => {
  // al salir del input, deja el formato bien aplicado
  rut.value = formatRut(rut.value)
}

// ------------------------------
// Validación general: mensajes claros
// ------------------------------
const validateForm = () => {
  const missing = []

  if (!name.value.trim()) missing.push("Nombre")
  if (!email.value.trim()) missing.push("Correo")
  if (!telefono.value.trim()) missing.push("Teléfono")
  if (!rut.value.trim()) missing.push("RUT")
  if (!password.value) missing.push("Contraseña")
  if (!confirm.value) missing.push("Confirmar contraseña")

  if (missing.length) {
    return `Faltan campos obligatorios: ${missing.join(", ")}.`
  }

  if (!isEmailValid(email.value)) return "El correo no es válido."

  // teléfono: mínimo razonable (ej CL: +56 9 1234 5678 = 11 dígitos)
  const digits = phoneDigitsCount(telefono.value)
  if (digits < 8) return "El teléfono parece incompleto. Revisa el número."

  // rut válido
  if (!isRutValid(rut.value)) return "El RUT no es válido. Revisa el formato y el dígito verificador."

  if (password.value.length < 6) return "La contraseña debe tener al menos 6 caracteres."
  if (password.value !== confirm.value) return "Las contraseñas no coinciden."

  return null
}

// ------------------------------
// Submit
// ------------------------------
const onRegister = async () => {
  error.value = ""
  ok.value = ""

  const validationError = validateForm()
  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true
  try {
    // guardamos rut y teléfono normalizados
    const telefonoFinal = telefono.value.trim()
    const rutFinal = formatRut(rut.value)

    await AuthService.register({
      nombre: name.value.trim(),
      correo: email.value.trim().toLowerCase(),
      telefono: telefonoFinal,
      rut: rutFinal,
      password: password.value,
    })

    ok.value = "Cuenta creada. Redirigiendo..."
    router.push("/home")
  } catch (e) {
    error.value = e?.message || "No se pudo crear la cuenta."
  } finally {
    loading.value = false
  }
}
</script>
