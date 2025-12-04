<template>
  <div class="container py-3 py-lg-4">
    <div class="row g-4">
      <div class="col-12 col-lg-5">
        <div class="z-card p-4 position-relative">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h1 class="h5 mb-0 z-ink">Crear certificado</h1>
            <span class="badge" :class="errors.length ? 'text-bg-danger' : 'text-bg-success'">
              {{ errors.length ? "Revisar" : "Listo" }}
            </span>
          </div>

          <p class="z-muted small mb-3">Completa los datos y podrás descargar el PDF.</p>

          <div v-if="loadingPdf" class="alert alert-info py-2 mb-3 d-flex align-items-center gap-2">
            <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
            <div class="small mb-0">
              <b>Procesando:</b> {{ loadingStep }}
            </div>
          </div>

          <div v-if="errors.length" class="alert alert-danger py-2 mb-3">
            <div class="fw-semibold mb-1">Faltan / están incorrectos:</div>
            <ul class="mb-0 ps-3">
              <li v-for="(e, idx) in errors" :key="idx">{{ e }}</li>
            </ul>
          </div>

          <form class="vstack gap-3" @submit.prevent>
            <div>
              <label class="form-label z-muted">Nombre completo</label>
              <input v-model.trim="form.nombre" class="form-control" placeholder="Ej: Ronal Sanhueza Lagos" @blur="validate"/>
            </div>

            <div>
              <label class="form-label z-muted">RUT</label>
              <input
                v-model.trim="form.rut"
                class="form-control"
                placeholder="Ej: 21.098.143-8"
                inputmode="text"
                @input="onRutInput"
                @blur="onRutBlur"
              />
              <div class="form-text z-muted">Se formatea automáticamente. Acepta K/k.</div>
            </div>

            <div>
              <label class="form-label z-muted">Tipo de curso</label>
              <select v-model="form.curso" class="form-select" @change="validate">
                <option disabled value="">Selecciona…</option>
                <option value="mantencion">Certificado de Mantención</option>
                <option value="operatividad">Certificado de Operatividad</option>
              </select>
            </div>

            <div class="row g-2">
              <div class="col-12 col-md-6">
                <label class="form-label z-muted">Duración (horas)</label>
                <input v-model="form.horas" type="number" min="1" step="1" class="form-control" placeholder="Ej: 6" @input="validate"/>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label z-muted">Modalidad</label>
                <select v-model="form.modalidad" class="form-select" @change="validate">
                  <option disabled value="">Selecciona…</option>
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            <div>
              <label class="form-label z-muted">Fecha (automática)</label>
              <input v-model="form.fecha" class="form-control" disabled />
            </div>

            <div class="d-flex gap-2 pt-2">
              <button type="button" class="btn btn-outline-secondary w-50" @click="reset" :disabled="loadingPdf">
                Limpiar
              </button>

              <button
                type="button"
                class="btn z-btn text-white fw-semibold w-50"
                :disabled="errors.length || loadingPdf"
                @click="generarPdf"
                title="Guardar y Descargar PDF"
              >
                <i class="bi bi-filetype-pdf me-2"></i>
                {{ loadingPdf ? "Procesando..." : "Guardar y Descargar PDF" }}
              </button>
            </div>

            <div v-if="saveMsg" class="alert alert-success py-2 mt-3 mb-0">
              {{ saveMsg }}
            </div>
          </form>
        </div>
      </div>


      <div class="col-12 col-lg-7">
        <div class="z-card p-4 p-lg-5 z-preview-wrap">
          <div class="preview-sheet">
            <div class="preview-head">
              <div class="d-flex align-items-center gap-3">
                <img :src="logoUrl" alt="Zemaq" class="preview-logo" />
                <div>
                  <div class="preview-brand">ZEMAQ electric</div>
                  <div class="preview-subbrand">Certificación</div>
                </div>
              </div>

              <div class="text-end">
                <div class="small z-muted">Fecha</div>
                <div class="fw-semibold z-ink">{{ form.fecha }}</div>
              </div>
            </div>

            <div class="preview-title">CERTIFICADO DE<br />PARTICIPACIÓN</div>
            <div class="preview-subtitle">de realización y aprobación</div>

            <div class="preview-body">
              <p class="mb-3">
                <b>{{ nombreParaTexto }}</b>
                <span class="z-muted ms-3">RUT</span>
                <b class="ms-2">{{ rutParaTexto }}</b>
              </p>

              <p class="mb-3"><b>{{ tipoCursoParaTexto }}</b></p>

              <p class="mb-2 z-muted">ha realizado la actividad</p>
              <p class="mb-4 preview-activity"><b>Mixer Eléctrico</b></p>

              <p class="mb-3">
                finalizado el <b>{{ form.fecha }}</b> con duración de <b>{{ horasTexto }}</b> horas
              </p>

              <p class="mb-4">
                Estado <b>Aprobado</b> · Modalidad <b>{{ modalidadParaTexto }}</b>
              </p>

              <p class="small z-muted mb-0">
                Se extiende certificado con vigencia por <b>3 años</b> desde la fecha de realización del curso.
              </p>
            </div>

            <div class="preview-divider"></div>

            <div class="preview-footer">
              <div class="preview-code">
                <div class="small z-muted">Código de certificado</div>
                <div class="fw-semibold z-ink">{{ codigo }}</div>
              </div>

              <div class="preview-signs">
                <div class="preview-sign">
                  <div class="preview-line"></div>
                  <div class="small z-muted mt-2">Firma</div>
                </div>
                <div class="preview-sign">
                  <div class="preview-line"></div>
                  <div class="small z-muted mt-2">Firma</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import jsPDF from "jspdf"
import logoUrl from "../assets/img/zemaq-logo.png"
import { db } from "../firebase"
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore"


import QRCode from "qrcode"

const loadingPdf = ref(false)
const loadingStep = ref("")
const saveMsg = ref("")


const BASE_URL = "https://zemaq-electric-27.web.app"

const today = () => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const form = ref({
  nombre: "",
  rut: "",
  curso: "",
  horas: "",
  modalidad: "",
  fecha: today(),
})

const errors = ref([])

const validate = () => {
  const err = []
  if (!form.value.nombre.trim()) err.push("Nombre completo")
  if (!form.value.rut.trim()) err.push("RUT")
  else if (!isValidRut(form.value.rut)) err.push("RUT (formato o dígito verificador inválido)")
  if (!form.value.curso) err.push("Tipo de curso")
  if (!form.value.horas || Number(form.value.horas) <= 0) err.push("Duración (horas) válida")
  if (!form.value.modalidad) err.push("Modalidad")
  errors.value = err
  return err.length === 0
}

const reset = () => {
  form.value = { nombre: "", rut: "", curso: "", horas: "", modalidad: "", fecha: today() }
  errors.value = []
  saveMsg.value = ""
}

const nombreParaTexto = computed(() => form.value.nombre.trim() || "Nombre Apellido")
const rutParaTexto = computed(() => formatRut(form.value.rut) || "12.345.678-9")

const tipoCursoParaTexto = computed(() => {
  if (form.value.curso === "mantencion") return "Certificado de mantención"
  if (form.value.curso === "operatividad") return "Certificado de operatividad"
  return "Certificado"
})

const modalidadParaTexto = computed(() => {
  if (form.value.modalidad === "presencial") return "Presencial"
  if (form.value.modalidad === "online") return "Online"
  return "__________"
})

const horasTexto = computed(() => String(form.value.horas || "0"))

const codigo = computed(() => {
  const base = `${nombreParaTexto.value}-${rutParaTexto.value}-${form.value.fecha}-${tipoCursoParaTexto.value}-MIXER-${horasTexto.value}-${modalidadParaTexto.value}`.toUpperCase()
  let hash = 0
  for (let i = 0; i < base.length; i++) hash = (hash * 31 + base.charCodeAt(i)) >>> 0
  return `${String(hash).padStart(10, "0")}${String(hash * 97).padStart(10, "0")}`
})


const onRutInput = () => {
  form.value.rut = form.value.rut.replace(/[^0-9kK.\-]/g, "")
  validate()
}
const onRutBlur = () => {
  form.value.rut = formatRut(form.value.rut)
  validate()
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


async function toDataURL(src) {
  const res = await fetch(src)
  const blob = await res.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

function safeFileName(name) {
  return String(name || "certificado")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
}

function centerText(doc, text, y, fontSize, fontStyle = "bold") {
  doc.setFont("helvetica", fontStyle)
  doc.setFontSize(fontSize)
  const pageW = doc.internal.pageSize.getWidth()
  const w = doc.getTextWidth(text)
  doc.text(text, (pageW - w) / 2, y)
}

function centerMulti(doc, text, centerX, yStart, maxW, lineHeight) {
  const lines = doc.splitTextToSize(String(text || ""), maxW)
  let y = yStart
  lines.forEach((ln) => {
    doc.text(ln, centerX, y, { align: "center" })
    y += lineHeight
  })
  return y
}

function getColeccionPorCurso(curso) {
  if (curso === "mantencion") return "certificado_mantencion"
  if (curso === "operatividad") return "certificado_operatividad"
  return "certificado_operatividad"
}
function addYears(date, years) {
  const d = new Date(date.getTime())
  d.setFullYear(d.getFullYear() + years)
  return d
}
function buildCertData() {
  const ahora = new Date()
  const vigenciaAnios = 3
  const vence = addYears(ahora, vigenciaAnios)


  const verifyUrl = `${BASE_URL}/verificar?code=${encodeURIComponent(codigo.value)}`

  return {
    codigo: codigo.value,
    nombre: nombreParaTexto.value,
    rut: rutParaTexto.value,

    curso: form.value.curso,
    tipoCursoTexto: tipoCursoParaTexto.value,

    horas: Number(form.value.horas || 0),
    modalidad: form.value.modalidad,
    modalidadTexto: modalidadParaTexto.value,

    actividad: "Mixer Eléctrico",
    estado: "Aprobado",

    fechaTexto: form.value.fecha,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
    creadoEnCliente: Timestamp.fromDate(ahora),
    venceEn: Timestamp.fromDate(vence),
    vigenciaAnios,

    verifyUrl, 
  }
}

async function guardarCertificadoEnFirestore(cert) {
  const col = getColeccionPorCurso(cert.curso)
  const refDoc = doc(db, col, cert.codigo)
  await setDoc(refDoc, cert, { merge: true })
}

async function makeQrDataUrl(text) {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 300, 
  })
}

async function generarPdf() {
  if (!validate()) return

  loadingPdf.value = true
  saveMsg.value = ""

  try {
    loadingStep.value = "Preparando datos del certificado…"
    const cert = buildCertData()

    loadingStep.value = `Guardando en Firestore (${getColeccionPorCurso(cert.curso)})…`
    await guardarCertificadoEnFirestore(cert)

    loadingStep.value = "Generando QR…"
    const qrDataUrl = await makeQrDataUrl(cert.verifyUrl)

    loadingStep.value = "Generando PDF…"
    const docPdf = new jsPDF({ unit: "pt", format: "a4" })
    const pageW = docPdf.internal.pageSize.getWidth()
    const pageH = docPdf.internal.pageSize.getHeight()

    const cText = [17, 17, 17]
    const cMuted = [120, 120, 120]
    const cLine = [205, 205, 205]

    docPdf.setFillColor(255, 255, 255)
    docPdf.rect(0, 0, pageW, pageH, "F")

    const padL = 64
    const padR = 64
    const topY = 56

    let logoData = null
    try { logoData = await toDataURL(logoUrl) } catch { logoData = null }

    let y = topY
    const leftX = padL
    const rightX = pageW - padR

    if (logoData) docPdf.addImage(logoData, "PNG", leftX, y, 42, 42, undefined, "FAST")

    const brandX = leftX + (logoData ? 54 : 0)
    docPdf.setTextColor(...cText)
    docPdf.setFont("helvetica", "bold")
    docPdf.setFontSize(12)
    docPdf.text("ZEMAQ electric", brandX, y + 16)

    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(10)
    docPdf.setTextColor(...cMuted)
    docPdf.text("Certificación", brandX, y + 32)

    docPdf.setTextColor(...cMuted)
    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(10)
    docPdf.text("Fecha", rightX, y + 14, { align: "right" })

    docPdf.setTextColor(...cText)
    docPdf.setFont("helvetica", "bold")
    docPdf.setFontSize(11)
    docPdf.text(form.value.fecha, rightX, y + 30, { align: "right" })

    y = 170
    docPdf.setTextColor(...cText)
    centerText(docPdf, "CERTIFICADO DE", y, 26, "bold")
    y += 34
    centerText(docPdf, "PARTICIPACIÓN", y, 26, "bold")

    y += 18
    docPdf.setTextColor(...cMuted)
    centerText(docPdf, "de realización y aprobación", y, 11, "normal")

    const centerX = pageW / 2
    const maxW = 520
    const lh = 19

    y += 62
    docPdf.setTextColor(...cText)
    docPdf.setFont("helvetica", "bold")
    docPdf.setFontSize(11)

    docPdf.text(cert.nombre, centerX - 20, y, { align: "right" })
    docPdf.setFont("helvetica", "normal")
    docPdf.setTextColor(...cMuted)
    docPdf.text("RUT", centerX + 8, y, { align: "left" })
    docPdf.setFont("helvetica", "bold")
    docPdf.setTextColor(...cText)
    docPdf.text(cert.rut, centerX + 44, y, { align: "left" })

    y += lh + 20
    docPdf.setFont("helvetica", "bold")
    docPdf.setFontSize(11.5)
    docPdf.setTextColor(...cText)
    y = centerMulti(docPdf, cert.tipoCursoTexto, centerX, y, maxW, lh)

    y += 10
    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(11)
    docPdf.setTextColor(...cText)
    centerText(docPdf, "ha realizado la actividad", y, 11, "normal")

    y += 28
    docPdf.setFont("helvetica", "bold")
    docPdf.setFontSize(14)
    docPdf.setTextColor(...cText)
    centerText(docPdf, cert.actividad, y, 14, "bold")

    y += 36
    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(11)
    docPdf.setTextColor(...cText)
    y = centerMulti(
      docPdf,
      `finalizado el ${form.value.fecha} con duración de ${cert.horas} horas`,
      centerX,
      y,
      maxW,
      lh
    )

    y += 10
    y = centerMulti(
      docPdf,
      `Estado ${cert.estado} · Modalidad ${cert.modalidadTexto}`,
      centerX,
      y,
      maxW,
      lh
    )

    y += 18
    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(9.5)
    docPdf.setTextColor(...cMuted)
    y = centerMulti(
      docPdf,
      `Se extiende certificado con vigencia por ${cert.vigenciaAnios} años desde la fecha de realización del curso.`,
      centerX,
      y,
      maxW,
      14
    )


    const dividerY = pageH - 150
    docPdf.setDrawColor(...cLine)
    docPdf.setLineWidth(1)
    docPdf.line(padL, dividerY, pageW - padR, dividerY)

    const signLineW = 170
    const signGap = 68
    const totalW = signLineW * 2 + signGap
    const signStartX = (pageW - totalW) / 2
    const signLineY = dividerY + 26

    docPdf.setDrawColor(150, 150, 150)
    docPdf.setLineWidth(1)
    docPdf.line(signStartX, signLineY, signStartX + signLineW, signLineY)
    docPdf.line(signStartX + signLineW + signGap, signLineY, signStartX + signLineW + signGap + signLineW, signLineY)

    docPdf.setTextColor(...cMuted)
    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(9)
    docPdf.text("Firma", signStartX + signLineW / 2, signLineY + 16, { align: "center" })
    docPdf.text("Firma", signStartX + signLineW + signGap + signLineW / 2, signLineY + 16, { align: "center" })

    const codeLabelY = pageH - 42
    const codeValueY = pageH - 24

    docPdf.setTextColor(...cMuted)
    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(9.5)
    docPdf.text("Código de certificado", padL, codeLabelY)

    docPdf.setTextColor(...cText)
    docPdf.setFont("helvetica", "bold")
    docPdf.setFontSize(10.5)
    docPdf.text(cert.codigo, padL, codeValueY, { maxWidth: 320 })


    const qrSize = 68
    const qrX = pageW - padR - qrSize
    const qrY = pageH - 24 - qrSize 
    docPdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize, undefined, "FAST")

    docPdf.setTextColor(...cMuted)
    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(7.8)
    docPdf.text("Verificar", qrX + qrSize / 2, qrY + qrSize + 10, { align: "center" })

    loadingStep.value = "Descargando PDF…"
    const fileName = `Certificado - ${safeFileName(cert.nombre)} - ${form.value.fecha}.pdf`
    docPdf.save(fileName)

    saveMsg.value = `Listo ✅ Guardado y PDF generado con QR. Código: ${cert.codigo}`
  } catch (e) {
    console.error(e)
    alert("No fue posible generar/guardar el certificado.")
  } finally {
    loadingPdf.value = false
    loadingStep.value = ""
  }
}

onMounted(() => validate())
</script>

<style scoped>
.z-ink { color: var(--z-dark); }
.z-preview-wrap { background: rgba(255,255,255,.88); border: 1px solid rgba(35,31,32,.06); }
.z-card{
  background:#fff;
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,.06);
}
.preview-sheet{ background:#fff; padding: 26px; }
.preview-head{ display:flex; justify-content: space-between; align-items:flex-start; gap:18px; margin-bottom: 18px; }
.preview-logo{ width:48px; height:48px; object-fit:contain; }
.preview-brand{ font-weight:900; letter-spacing:.3px; color:#111; font-size:13px; }
.preview-subbrand{ font-size:11px; opacity:.65; }
.preview-title{ text-align:center; font-weight:950; font-size:30px; line-height:1.05; color:#111; margin-top: 10px; }
.preview-subtitle{ text-align:center; font-size:13px; opacity:.65; margin-top: 6px; margin-bottom: 22px; }
.preview-body{ max-width: 560px; margin: 0 auto; color:#111; text-align: center; }
.preview-activity{ font-size:16px; text-decoration: underline; }
.preview-divider{ margin-top: 22px; border-top: 1px solid rgba(0,0,0,.18); }
.preview-footer{ display:flex; justify-content: space-between; align-items:flex-end; gap:18px; margin-top: 16px; }
.preview-code{ min-width: 240px; }
.preview-signs{ display:flex; gap:28px; align-items:flex-end; }
.preview-sign{ width: 180px; text-align:center; }
.preview-line{ height:1px; background: rgba(0,0,0,.45); }
</style>
