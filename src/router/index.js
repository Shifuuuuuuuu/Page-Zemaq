import { createRouter, createWebHistory } from "vue-router"
import LoginView from "../views/LoginView.vue"
import RegisterView from "../views/RegisterView.vue"
import HomeView from "../views/HomeView.vue"
import CertificadosView from "../views/CertificadosView.vue"

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginView, meta: { public: true } },
  { path: "/register", component: RegisterView, meta: { public: true } },
  { path: "/home", component: HomeView },
  { path: "/certificados", name: "certificados", component: CertificadosView, }
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
