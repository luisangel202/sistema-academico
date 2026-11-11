import { imprimir, headerInstitucional, piePagina } from "../impresion";

const TIPO_LABEL = {
  evaluacion: "Comité de Evaluación",
  seguimiento: "Seguimiento Académico",
  padres: "Reunión de Padres de Familia",
  general: "Reunión General",
};

/**
 * Imprime el acta de una reunión académica.
 * @param {object} reunion
 * @param {string} instNombre
 */
export function imprimirActaReunion(reunion, instNombre = "Institución Educativa") {
  const tipo = TIPO_LABEL[reunion.tipo] || reunion.tipo;
  const estado = reunion.estado === "realizada"
    ? `<span class="badge badge-green">Realizada</span>`
    : `<span class="badge badge-amber">Programada</span>`;

  const agendaHtml = reunion.agenda
    ? reunion.agenda.split("\n").filter(Boolean).map((item, i) =>
        `<tr><td style="width:30px;font-weight:700;">${i + 1}.</td><td>${item}</td></tr>`
      ).join("")
    : `<tr><td colspan="2" style="color:#94a3b8;">Sin agenda registrada</td></tr>`;

  const actaHtml = reunion.acta
    ? `<div class="caja"><div class="caja-titulo">Acta / Compromisos</div>
       <div class="caja-contenido">${reunion.acta}</div></div>`
    : `<div style="border:1px dashed #cbd5e1;border-radius:6px;padding:40px 14px;text-align:center;color:#94a3b8;font-size:9.5pt;">
       Espacio para registro del acta durante la reunión
       </div>`;

  const html = `
  ${headerInstitucional(instNombre)}

  <div class="doc-titulo">Acta de Reunión Académica</div>
  <div class="doc-subtitulo">${tipo} · Código: REU-${String(reunion.id).padStart(4,"0")}</div>

  <div class="seccion">
    <div class="seccion-titulo">Información General</div>
    <div class="grid2">
      <div class="campo">
        <div class="campo-label">Título de la reunión</div>
        <div class="campo-valor">${reunion.titulo}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Tipo</div>
        <div class="campo-valor">${tipo} &nbsp; ${estado}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Fecha</div>
        <div class="campo-valor">${reunion.fecha}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Hora</div>
        <div class="campo-valor">${reunion.hora}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Lugar</div>
        <div class="campo-valor">${reunion.lugar}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Participantes</div>
        <div class="campo-valor">${reunion.participantes}</div>
      </div>
    </div>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Agenda</div>
    <table>
      <thead><tr><th style="width:30px;">No.</th><th>Punto a tratar</th></tr></thead>
      <tbody>${agendaHtml}</tbody>
    </table>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Acta y Compromisos</div>
    ${actaHtml}
    ${!reunion.acta ? `
    <div style="margin-top:12px;">
      <div class="campo-label" style="margin-bottom:6px;">Compromisos adquiridos</div>
      <div style="border:1px solid #e2e8f0;min-height:80px;border-radius:4px;"></div>
    </div>` : ""}
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Firmas de Asistentes</div>
    <table>
      <thead><tr><th>Nombre completo</th><th>Cargo / Rol</th><th>Firma</th></tr></thead>
      <tbody>
        ${Array.from({length: 6}).map(() =>
          `<tr><td style="height:28px;"></td><td></td><td></td></tr>`
        ).join("")}
      </tbody>
    </table>
  </div>

  ${piePagina()}`;

  imprimir(html, `Acta Reunión — ${reunion.titulo}`);
}
