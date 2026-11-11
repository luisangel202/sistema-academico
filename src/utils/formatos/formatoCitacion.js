import { imprimir, headerInstitucional, piePagina } from "../impresion";

/**
 * Imprime la citación formal al acudiente.
 * @param {object} citacion
 * @param {object} estudiante  — { nombre, avatar }
 * @param {string} instNombre
 * @param {string} directorNombre
 */
export function imprimirCitacion(citacion, estudiante, instNombre = "Institución Educativa", directorNombre = "Director(a) de Grupo") {
  const canal = {
    presencial: "Presencial — en la institución educativa",
    virtual: "Virtual — videollamada (se enviará enlace)",
    telefonica: "Telefónica",
  }[citacion.canal] || citacion.canal;

  const urgenciaBadge = citacion.urgencia === "urgente"
    ? `<span class="badge badge-red">⚠ URGENTE</span>`
    : `<span class="badge badge-blue">Normal</span>`;

  const estadoBadge = citacion.estado === "atendida"
    ? `<span class="badge badge-green">Atendida</span>`
    : `<span class="badge badge-amber">Pendiente de atención</span>`;

  const resultadoHtml = citacion.resultado
    ? `<div class="seccion">
        <div class="seccion-titulo">Resultado de la Citación</div>
        <div class="caja"><div class="caja-contenido">${citacion.resultado}</div></div>
      </div>`
    : "";

  const html = `
  ${headerInstitucional(instNombre)}

  <div class="doc-titulo">Citación a Acudiente</div>
  <div class="doc-subtitulo">Código: CIT-${String(citacion.id).padStart(4,"0")} &nbsp;·&nbsp; ${urgenciaBadge} &nbsp;·&nbsp; ${estadoBadge}</div>

  <div style="margin:16px 0;padding:12px 16px;background:#eff6ff;border-left:4px solid #2563eb;border-radius:0 6px 6px 0;font-size:10pt;">
    Por medio del presente documento, la institución <strong>${instNombre}</strong> cita cordialmente al
    señor(a) <strong>${citacion.acudiente}</strong>, acudiente del estudiante
    <strong>${estudiante?.nombre || "—"}</strong>, para tratar asuntos de interés académico o convivencial.
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Datos del Estudiante</div>
    <div class="grid2">
      <div class="campo">
        <div class="campo-label">Nombre del estudiante</div>
        <div class="campo-valor">${estudiante?.nombre || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Nombre del acudiente</div>
        <div class="campo-valor">${citacion.acudiente}</div>
      </div>
    </div>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Detalles de la Citación</div>
    <div class="grid2">
      <div class="campo">
        <div class="campo-label">Fecha</div>
        <div class="campo-valor">${citacion.fecha}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Hora</div>
        <div class="campo-valor">${citacion.hora}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Modalidad</div>
        <div class="campo-valor">${canal}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Urgencia</div>
        <div class="campo-valor">${urgenciaBadge}</div>
      </div>
    </div>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Motivo de la Citación</div>
    <div class="caja">
      <div class="caja-contenido">${citacion.motivo}</div>
    </div>
  </div>

  ${resultadoHtml}

  <div class="seccion">
    <div class="seccion-titulo">Acuse de Recibo</div>
    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:14px;">
      <p style="font-size:9.5pt;color:#374151;margin-bottom:12px;">
        Yo, ___________________________________, identificado(a) con C.C. No. ___________________,
        acudiente del estudiante <strong>${estudiante?.nombre || "___________"}</strong>,
        declaro haber recibido y comprendido la presente citación.
      </p>
      <div class="grid2" style="margin-top:16px;">
        <div>
          <div style="border-top:1px solid #374151;padding-top:6px;text-align:center;">
            <div style="font-size:9pt;font-weight:700;">Firma del acudiente</div>
          </div>
        </div>
        <div>
          <div style="border-top:1px solid #374151;padding-top:6px;text-align:center;">
            <div style="font-size:9pt;font-weight:700;">${directorNombre}</div>
            <div style="font-size:8pt;color:#64748b;">Director(a) de Grupo</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  ${piePagina()}`;

  imprimir(html, `Citación — ${estudiante?.nombre}`);
}
