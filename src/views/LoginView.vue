<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center p-3">
    <div class="container" style="max-width: 980px;">
      <div class="row g-4 align-items-stretch position-relative">

        <transition name="fade">
          <div v-if="verifying" class="z-overlay">
            <div class="z-overlay-card">
              <div class="spinner-border" role="status" aria-hidden="true"></div>
              <div class="mt-3 fw-semibold" style="color: var(--z-dark);">
                Validando credenciales…
              </div>
              <div class="small z-muted mt-1">Por favor espera un momento</div>
            </div>
          </div>
        </transition>

        <div class="col-12 col-lg-6">
          <div class="h-100 p-4 p-md-5 z-card d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex align-items-center gap-3 mb-3">
                <img :src="logo" alt="Zemaq" style="width: 72px; height: 72px; object-fit: contain;" />
                <div>
                  <div class="fw-bold fs-4" style="color: var(--z-dark);">Zemaq</div>
                  <div class="z-muted">Portal de acceso</div>
                </div>
              </div>

              <div class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill z-pill">
                <span class="fw-semibold">ZEMAQ electric</span>
              </div>

              <p class="mt-4 z-muted mb-0">
                Inicia sesión de forma segura para acceder a tus módulos.
              </p>
            </div>

            <div class="mt-4 z-muted small">
              © {{ new Date().getFullYear() }} Zemaq
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="z-card p-4 p-md-5">
            <h1 class="h4 mb-1" style="color: var(--z-dark);">Iniciar sesión</h1>
            <p class="z-muted mb-4">Usa tu correo y contraseña.</p>

            <div v-if="error" class="alert alert-danger py-2 mb-3">
              {{ error }}
            </div>
            <div v-if="ok" class="alert alert-success py-2 mb-3">
              {{ ok }}
            </div>

            <form @submit.prevent="onLogin" class="vstack gap-3">
              <div>
                <label class="form-label z-muted">Correo</label>
                <input
                  v-model.trim="email"
                  type="email"
                  class="form-control"
                  placeholder="correo@empresa.com"
                  autocomplete="email"
                  :disabled="verifying"
                  required
                />
              </div>

              <div>
                <label class="form-label z-muted">Contraseña</label>
                <div class="input-group">
                  <input
                    v-model="password"
                    :type="showPass ? 'text' : 'password'"
                    class="form-control"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    :disabled="verifying"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showPass = !showPass"
                    :disabled="verifying"
                  >
                    {{ showPass ? "Ocultar" : "Ver" }}
                  </button>
                </div>
              </div>

              <div class="d-flex align-items-center justify-content-between">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    v-model="rememberMe"
                    :disabled="verifying"
                  />
                  <label class="form-check-label z-muted" for="rememberMe">
                    Mantener sesión
                  </label>
                </div>

                <button
                  type="button"
                  class="btn btn-link p-0 z-link small"
                  :disabled="verifying"
                  data-bs-toggle="modal"
                  data-bs-target="#resetModal"
                  @click="prefillResetEmail"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button class="btn z-btn text-white fw-semibold py-2" :disabled="verifying">
                <span v-if="verifying" class="spinner-border spinner-border-sm me-2"></span>
                {{ verifying ? "Validando..." : "Entrar" }}
              </button>

              <div class="d-flex justify-content-between align-items-center small">
                <span class="z-muted">¿No tienes cuenta?</span>
                <RouterLink class="z-link fw-semibold" to="/register">Registrarme</RouterLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="resetModal"
    tabindex="-1"
    aria-labelledby="resetModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content z-modal">
        <div class="modal-header">
          <h5 class="modal-title" id="resetModalLabel" style="color: var(--z-dark);">
            Restablecer contraseña
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
            :disabled="resetLoading"
          ></button>
        </div>

        <div class="modal-body">
          <p class="z-muted mb-3">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <div v-if="resetError" class="alert alert-danger py-2 mb-3">{{ resetError }}</div>
          <div v-if="resetOk" class="alert alert-success py-2 mb-3">{{ resetOk }}</div>

          <label class="form-label z-muted">Correo</label>
          <input
            v-model.trim="resetEmail"
            type="email"
            class="form-control"
            placeholder="correo@empresa.com"
            autocomplete="email"
            :disabled="resetLoading"
          />
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-secondary"
            data-bs-dismiss="modal"
            :disabled="resetLoading"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn z-btn text-white fw-semibold"
            @click="sendReset"
            :disabled="resetLoading"
          >
            <span v-if="resetLoading" class="spinner-border spinner-border-sm me-2"></span>
            Enviar enlace
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { useRouter } from "vue-router"
import { AuthService } from "../services/auth"
import { sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth"
import { auth } from "../firebase"
import logo from "../assets/img/zemaq-logo.png"

const router = useRouter()

const email = ref("")
const password = ref("")
const showPass = ref(false)

const verifying = ref(false)
const error = ref("")
const ok = ref("")


const rememberMe = ref(localStorage.getItem("zemaq_remember") !== "0")
watch(rememberMe, (v) => localStorage.setItem("zemaq_remember", v ? "1" : "0"))


const resetEmail = ref("")
const resetLoading = ref(false)
const resetError = ref("")
const resetOk = ref("")

const isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim())

const prefillResetEmail = () => {
  resetError.value = ""
  resetOk.value = ""
  resetEmail.value = email.value?.trim() || ""
}

const onLogin = async () => {
  error.value = ""
  ok.value = ""

  if (!email.value?.trim() || !password.value) {
    error.value = "Por favor ingresa tu correo y contraseña."
    return
  }

  verifying.value = true
  try {

    await setPersistence(
      auth,
      rememberMe.value ? browserLocalPersistence : browserSessionPersistence
    )

    await AuthService.login(email.value, password.value)

    ok.value = "✅ Credenciales correctas. ¡Bienvenido!"
    sessionStorage.setItem("justLoggedIn", "1")

    setTimeout(() => router.push("/home"), 450)
  } catch (e) {
    error.value = e?.message || "No se pudo iniciar sesión."
  } finally {
    verifying.value = false
  }
}

const sendReset = async () => {
  resetError.value = ""
  resetOk.value = ""

  if (!resetEmail.value.trim()) {
    resetError.value = "Debes ingresar tu correo."
    return
  }
  if (!isEmailValid(resetEmail.value)) {
    resetError.value = "El correo no tiene un formato válido."
    return
  }

  resetLoading.value = true
  try {
    await sendPasswordResetEmail(auth, resetEmail.value)
    resetOk.value = "✅ Listo. Te enviamos un correo con el enlace para restablecer tu contraseña."
  } catch (e) {
    const code = e?.code || ""
    if (code === "auth/user-not-found") resetError.value = "No existe una cuenta con ese correo."
    else if (code === "auth/invalid-email") resetError.value = "El correo no es válido."
    else if (code === "auth/too-many-requests") resetError.value = "Demasiados intentos. Intenta más tarde."
    else resetError.value = e?.message || "No se pudo enviar el correo de restablecimiento."
  } finally {
    resetLoading.value = false
  }
}
</script>

<style scoped>

.z-overlay{
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(35, 31, 32, 0.22);
  backdrop-filter: blur(6px);
  border-radius: 1rem;
}
.z-overlay-card{
  min-width: 260px;
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(255,255,255,.96);
  border: 1px solid rgba(35,31,32,.08);
  box-shadow: 0 18px 55px rgba(35,31,32,.18);
  text-align: center;
}

.z-modal{
  border-radius: 16px;
  border: 1px solid rgba(35,31,32,.08);
  box-shadow: 0 18px 55px rgba(35,31,32,.18);
}

.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
