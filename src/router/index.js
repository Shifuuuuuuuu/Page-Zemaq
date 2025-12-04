import { createRouter, createWebHistory } from "vue-router"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"

import LoginView from "../views/LoginView.vue"
import RegisterView from "../views/RegisterView.vue"
import HomeView from "../views/HomeView.vue"
import CertificadosView from "../views/CertificadosView.vue"
import VerificarCertificado from "../views/VerificarCertificado.vue"
import GestionCertificados from "../views/GestionCertificados.vue"
import PerfilView from "../views/PerfilView.vue"

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginView, meta: { public: true } },
  { path: "/register", component: RegisterView, meta: { public: true } },
  { path: "/home", component: HomeView, meta: { requiresAuth: true } },
  { path: "/certificados", name: "certificados", component: CertificadosView, meta: { requiresAuth: true } },
  { path: "/gestor-certificados", name: "gestor-certificados", component: GestionCertificados, meta: { requiresAuth: true } },
  { path: "/verificar", name: "verificar", component: VerificarCertificado, meta: { public: true } },
  { path: "/perfil", component: PerfilView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function waitForAuthReady() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, () => {
      unsub()
      resolve()
    })
  })
}

router.beforeEach(async (to) => {
  await waitForAuthReady()

  const isLogged = !!auth.currentUser
  const isPublic = !!to.meta.public
  const requiresAuth = !!to.meta.requiresAuth

  if (requiresAuth && !isLogged) return "/login"

  if (isLogged && isPublic && (to.path === "/login" || to.path === "/register")) return "/home"

  return true
})

export default router
