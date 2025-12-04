import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth"

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"

import { auth, db } from "../firebase"

const ensureProfileExists = async (uid) => {
  const snap = await getDoc(doc(db, "usuarios", uid))
  return snap.exists() ? snap.data() : null
}

const prettyError = (e) => {
  const code = e?.code || ""
  if (code === "auth/invalid-email") return "El correo no tiene un formato válido."
  if (code === "auth/user-not-found") return "No existe una cuenta con ese correo."
  if (code === "auth/wrong-password") return "Contraseña incorrecta."
  if (code === "auth/invalid-credential") return "Credenciales inválidas (correo o contraseña)."
  if (code === "auth/email-already-in-use") return "Ese correo ya está registrado."
  if (code === "auth/weak-password") return "La contraseña es muy débil (mínimo 6 caracteres)."
  if (code === "auth/too-many-requests") return "Demasiados intentos. Intenta más tarde."
  return e?.message || "Ocurrió un error."
}


export const AuthService = {
  async register({ nombre, correo, telefono, rut, password }) {
    try {
      if (!correo || !password) throw new Error("Faltan datos obligatorios.")
      if ((password || "").length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.")

      const cred = await createUserWithEmailAndPassword(auth, correo, password)
      await updateProfile(cred.user, { displayName: nombre })

      const perfil = {
        uid: cred.user.uid,
        nombre,
        correo,
        telefono,
        rut,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(doc(db, "usuarios", cred.user.uid), perfil)
      return { user: cred.user, perfil }
    } catch (e) {
      throw new Error(prettyError(e))
    }
  },

  async login(correo, password, remember = true) {
    try {
      const persistence = remember ? browserLocalPersistence : browserSessionPersistence
      await setPersistence(auth, persistence)

      const cred = await signInWithEmailAndPassword(auth, correo, password)

      const perfil = await ensureProfileExists(cred.user.uid)
      if (!perfil) {
        throw new Error("Tu cuenta no tiene perfil en la base de datos (usuarios).")
      }

      return { user: cred.user, perfil }
    } catch (e) {
      throw new Error(prettyError(e))
    }
  },

  async logout() {
    await signOut(auth)
  },

  async getProfile(uid) {
    const id = uid || auth.currentUser?.uid
    if (!id) return null
    const snap = await getDoc(doc(db, "usuarios", id))
    return snap.exists() ? snap.data() : null
  },

  async updateProfileData(data) {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error("No hay sesión activa.")

    const payload = { ...data, updatedAt: serverTimestamp() }

    if (data?.nombre) {
      await updateProfile(auth.currentUser, { displayName: data.nombre })
    }

    await updateDoc(doc(db, "usuarios", uid), payload)
    return true
  },

  onAuthChange(cb) {
    return onAuthStateChanged(auth, cb)
  },
}
