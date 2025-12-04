<template>
  <div class="container py-4">
    <div class="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
      <div>
        <h1 class="h4 mb-1">Gestión de certificados</h1>
        <div class="text-muted">Mantención y Operatividad</div>
      </div>

      <button class="btn btn-outline-secondary" @click="refrescar" :disabled="loadingList || action.loading">
        <i class="bi bi-arrow-clockwise me-2"></i>
        Actualizar
      </button>
    </div>

    <div v-if="action.loading" class="alert alert-info d-flex align-items-center gap-2 mb-3">
      <div class="spinner-border spinner-border-sm"></div>
      <div class="small">
        <b>Procesando:</b> {{ action.step }}
        <span v-if="action.codigo" class="text-muted">· {{ action.codigo }}</span>
      </div>
    </div>

    <div class="z-card p-3 p-lg-4">

      <div class="row g-2 align-items-end">
        <div class="col-12 col-lg-3">
          <label class="form-label text-muted">Colección</label>
          <select v-model="tab" class="form-select">
            <option value="mantencion">Mantención</option>
            <option value="operatividad">Operatividad</option>
            <option value="todas">Todas</option>
          </select>
        </div>

        <div class="col-12 col-lg-6">
          <label class="form-label text-muted">Buscar</label>
          <input v-model.trim="q" class="form-control" placeholder="Nombre, RUT o Código..." />
        </div>

        <div class="col-12 col-lg-3">
          <label class="form-label text-muted">Orden</label>
          <select v-model="sort" class="form-select">
            <option value="creado_desc">Más nuevos</option>
            <option value="creado_asc">Más antiguos</option>
            <option value="vence_asc">Vence pronto</option>
            <option value="vence_desc">Vence lejano</option>
          </select>
        </div>
      </div>

      <hr class="my-4" />


      <div v-if="loadingList" class="d-flex align-items-center gap-2 text-muted">
        <div class="spinner-border spinner-border-sm"></div>
        Cargando certificados…
      </div>

      <div v-else-if="filtered.length === 0" class="text-muted">
        No hay certificados para mostrar.
      </div>

      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr class="text-muted small">
              <th>Estado</th>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Curso</th>
              <th>Creado</th>
              <th>Vence</th>
              <th>Código</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in filtered" :key="c._key">
              <td>
                <span class="badge" :class="isVigente(c) ? 'text-bg-success' : 'text-bg-warning'">
                  {{ isVigente(c) ? "Vigente" : "Vencido" }}
                </span>
              </td>

              <td class="fw-semibold">{{ c.nombre }}</td>
              <td>{{ c.rut }}</td>

              <td>
                <span class="badge text-bg-secondary">
                  {{ c._tipo === "mantencion" ? "Mantención" : "Operatividad" }}
                </span>
              </td>

              <td>{{ fmtTS(c.creadoEnCliente) }}</td>
              <td>{{ fmtTS(c.venceEn) }}</td>

              <td class="text-monospace small">{{ c.codigo }}</td>

              <td class="text-end">
                <div class="d-inline-flex gap-2">
                  <a
                    class="btn btn-sm btn-outline-dark"
                    :href="c.verifyUrl || makeVerifyUrl(c.codigo)"
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir verificación"
                  >
                    <i class="bi bi-shield-check me-1"></i> Verificar
                  </a>

                  <button
                    class="btn btn-sm btn-primary"
                    :disabled="action.loading"
                    @click="regenerarPdf(c)"
                    title="Re-generar y descargar PDF"
                  >
                    <i class="bi bi-filetype-pdf me-1"></i> Descargar
                  </button>

                  <button
                    class="btn btn-sm btn-outline-danger"
                    :disabled="action.loading"
                    @click="eliminar(c)"
                    title="Eliminar certificado"
                  >
                    <i class="bi bi-trash3 me-1"></i> Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      <div class="text-muted small mt-3">
        Total: <b>{{ filtered.length }}</b>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import jsPDF from "jspdf"
import QRCode from "qrcode"
import logoUrl from "../assets/img/zemaq-logo.png"
import { db } from "../firebase"
import {
  collection,
  getDocs,
  query as fsQuery,
  deleteDoc,
  doc,
} from "firebase/firestore"

const BASE_URL = "https://zemaq-electric.web.app"

const tab = ref("todas")
const q = ref("")
const sort = ref("creado_desc")
const loadingList = ref(false)


const mantencion = ref([])
const operatividad = ref([])


const action = ref({ loading: false, step: "", codigo: "" })

function makeVerifyUrl(code) {
  return `${BASE_URL}/verificar?code=${encodeURIComponent(code)}`
}

function toDate(ts) {
  if (!ts) return null
  if (typeof ts.toDate === "function") return ts.toDate()
  if (ts.seconds) return new Date(ts.seconds * 1000)
  return null
}

function fmtTS(ts) {
  const d = toDate(ts)
  if (!d || isNaN(d.getTime())) return "—"
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function isVigente(cert) {
  const vence = toDate(cert.venceEn)
  if (!vence) return false
  return new Date() <= vence
}

function normalize(s) {
  return String(s || "").toLowerCase().trim()
}

const merged = computed(() => {
  const a = mantencion.value.map((x) => ({ ...x, _tipo: "mantencion", _key: `m-${x.codigo}` }))
  const b = operatividad.value.map((x) => ({ ...x, _tipo: "operatividad", _key: `o-${x.codigo}` }))
  return [...a, ...b]
})

const filtered = computed(() => {
  let arr = merged.value

  if (tab.value !== "todas") {
    arr = arr.filter((x) => x._tipo === tab.value)
  }

  const qq = normalize(q.value)
  if (qq) {
    arr = arr.filter((x) => {
      const hay = `${x.nombre} ${x.rut} ${x.codigo}`.toLowerCase()
      return hay.includes(qq)
    })
  }

  const getCreado = (x) => toDate(x.creadoEnCliente)?.getTime?.() ?? 0
  const getVence = (x) => toDate(x.venceEn)?.getTime?.() ?? 0

  if (sort.value === "creado_desc") arr = [...arr].sort((a, b) => getCreado(b) - getCreado(a))
  if (sort.value === "creado_asc") arr = [...arr].sort((a, b) => getCreado(a) - getCreado(b))
  if (sort.value === "vence_asc") arr = [...arr].sort((a, b) => getVence(a) - getVence(b))
  if (sort.value === "vence_desc") arr = [...arr].sort((a, b) => getVence(b) - getVence(a))

  return arr
})

async function refrescar() {
  loadingList.value = true
  try {
    const q1 = fsQuery(collection(db, "certificado_mantencion"))
    const q2 = fsQuery(collection(db, "certificado_operatividad"))

    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)])

    mantencion.value = s1.docs.map((d) => d.data())
    operatividad.value = s2.docs.map((d) => d.data())
  } catch (e) {
    console.error(e)
    alert("No se pudo cargar el listado.")
  } finally {
    loadingList.value = false
  }
}

async function toDataURL(src) {
  const res = await fetch(src)
  const blob = await res.blob()
  return await new Promise((resolve) => {
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

async function makeQrDataUrl(text) {
  return await QRCode.toDataURL(text, { errorCorrectionLevel: "M", margin: 0, width: 300 })
}

async function regenerarPdf(cert) {
  action.value = { loading: true, step: "Preparando…", codigo: cert.codigo }

  try {
    const verifyUrl = cert.verifyUrl || makeVerifyUrl(cert.codigo)

    action.value.step = "Generando QR…"
    const qrDataUrl = await makeQrDataUrl(verifyUrl)

    action.value.step = "Generando PDF…"
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
    docPdf.text(cert.fechaTexto || "—", rightX, y + 30, { align: "right" })

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
    docPdf.text(cert.nombre || "—", centerX - 20, y, { align: "right" })
    docPdf.setFont("helvetica", "normal")
    docPdf.setTextColor(...cMuted)
    docPdf.text("RUT", centerX + 8, y, { align: "left" })
    docPdf.setFont("helvetica", "bold")
    docPdf.setTextColor(...cText)
    docPdf.text(cert.rut || "—", centerX + 44, y, { align: "left" })

    y += lh + 20
    docPdf.setFont("helvetica", "bold")
    docPdf.setFontSize(11.5)
    docPdf.setTextColor(...cText)
    y = centerMulti(docPdf, cert.tipoCursoTexto || "Certificado", centerX, y, maxW, lh)

    y += 10
    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(11)
    docPdf.setTextColor(...cText)
    centerText(docPdf, "ha realizado la actividad", y, 11, "normal")

    y += 28
    docPdf.setFont("helvetica", "bold")
    docPdf.setFontSize(14)
    docPdf.setTextColor(...cText)
    centerText(docPdf, cert.actividad || "Mixer Eléctrico", y, 14, "bold")

    y += 36
    docPdf.setFont("helvetica", "normal")
    docPdf.setFontSize(11)
    docPdf.setTextColor(...cText)
    y = centerMulti(
      docPdf,
      `finalizado el ${cert.fechaTexto || "—"} con duración de ${Number(cert.horas || 0)} horas`,
      centerX,
      y,
      maxW,
      lh
    )

    y += 10
    y = centerMulti(
      docPdf,
      `Estado ${cert.estado || "Aprobado"} · Modalidad ${cert.modalidadTexto || "—"}`,
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
      `Se extiende certificado con vigencia por ${Number(cert.vigenciaAnios || 3)} años desde la fecha de realización del curso.`,
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

    action.value.step = "Descargando PDF…"
    const fileName = `Certificado - ${safeFileName(cert.nombre)} - ${cert.fechaTexto || "sin-fecha"}.pdf`
    docPdf.save(fileName)
  } catch (e) {
    console.error(e)
    alert("No se pudo regenerar el PDF.")
  } finally {
    action.value = { loading: false, step: "", codigo: "" }
  }
}


async function eliminar(cert) {
  const ok = confirm(`¿Eliminar definitivamente el certificado ${cert.codigo}?`)
  if (!ok) return

  action.value = { loading: true, step: "Eliminando certificado…", codigo: cert.codigo }

  try {
    const col = cert._tipo === "mantencion" ? "certificado_mantencion" : "certificado_operatividad"
    await deleteDoc(doc(db, col, cert.codigo))
    await refrescar()
  } catch (e) {
    console.error(e)
    alert("No se pudo eliminar.")
  } finally {
    action.value = { loading: false, step: "", codigo: "" }
  }
}

onMounted(refrescar)
</script>

<style scoped>
.z-card{
  background:#fff;
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,.06);
}
.text-monospace{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
</style>
