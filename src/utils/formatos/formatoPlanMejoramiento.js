import { imprimir, headerInstitucional, piePagina } from "../impresion";

/**
 * Imprime el plan de mejoramiento individual del estudiante.
 */
export function imprimirPlanMejoramiento(plan, instNombre = "Institución Educativa") {
  const estadoBadge = plan.estado === "activo"
    ? `<span class="badge badge-green">Activo</span>`
    : `<span class="badge badge-gray">Completado</span>`;

  const frecuenciaLabel = {
    semanal: "Semanal",
    quincenal: "Quincenal",
    mensual: "Mensual",
  }[plan.frecuencia] || plan.frecuencia;

  const actividadesHtml = plan.actividades
    ? plan.actividades.split(/[,\n]/).filter(Boolean).map((act, i) =>
        `<tr>
          <td style="width:28px;text-align:center;font-weight:700;">${i + 1}</td>
          <td>${act.trim()}</td>
          <td style="width:80px;"></td>
          <td style="width:80px;"></td>
        </tr>`
      ).join("")
    : `<tr><td colspan="4" style="color:#94a3b8;">Sin actividades registradas</td></tr>`;

  const html = `
  ${headerInstitucional(instNombre)}

  <div class="doc-titulo">Plan de Mejoramiento Académico</div>
  <div class="doc-subtitulo">Código: PM-${String(plan.id).padStart(4,"0")} &nbsp;·&nbsp; ${estadoBadge}</div>

  <div class="seccion">
    <div class="seccion-titulo">Información del Estudiante y Asignatura</div>
    <div class="grid3">
      <div class="campo">
        <div class="campo-label">Estudiante</div>
        <div class="campo-valor">${plan.estudiante}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Materia / Asignatura</div>
        <div class="campo-valor">${plan.materia}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Docente responsable</div>
        <div class="campo-valor">${plan.docente || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Fecha de inicio</div>
        <div class="campo-valor">${plan.fechaInicio}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Fecha de cierre</div>
        <div class="campo-valor">${plan.fechaFin}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Seguimiento</div>
        <div class="campo-valor">${frecuenciaLabel}</div>
      </div>
    </div>
  </div>

  ${plan.objetivo ? `
  <div class="seccion">
    <div class="seccion-titulo">Objetivo del Plan</div>
    <div class="caja">
      <div class="caja-contenido">${plan.objetivo}</div>
    </div>
  </div>` : ""}

  <div class="seccion">
    <div class="seccion-titulo">Actividades de Mejoramiento</div>
    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>Actividad</th>
          <th>Fecha realización</th>
          <th>Observación</th>
        </tr>
      </thead>
      <tbody>${actividadesHtml}</tbody>
    </table>
  </div>

  ${plan.indicadores ? `
  <div class="seccion">
    <div class="seccion-titulo">Indicadores de Logro</div>
    <div class="caja">
      <div class="caja-contenido">${plan.indicadores}</div>
    </div>
  </div>` : ""}

  <div class="seccion">
    <div class="seccion-titulo">Evaluación Final del Plan</div>
    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:14px;">
      <div style="margin-bottom:12px;">
        <div class="campo-label" style="margin-bottom:4px;">Resultado alcanzado</div>
        <div style="border:1px solid #e2e8f0;min-height:50px;border-radius:4px;"></div>
      </div>
      <div>
        <div class="campo-label" style="margin-bottom:4px;">¿El estudiante superó la dificultad?</div>
        <div style="display:flex;gap:24px;margin-top:4px;font-size:10pt;">
          <span>☐ Sí, completamente</span>
          <span>☐ Parcialmente</span>
          <span>☐ No superó</span>
          <span>☐ Requiere otro período</span>
        </div>
      </div>
    </div>
  </div>

  <div class="firma-bloque">
    <div class="firma-linea">
      <div class="firma-nombre">${plan.estudiante}</div>
      <div class="firma-cargo">Estudiante</div>
    </div>
    <div class="firma-linea">
      <div class="firma-nombre">${plan.docente || "___________________"}</div>
      <div class="firma-cargo">Docente responsable</div>
    </div>
    <div class="firma-linea">
      <div class="firma-nombre">___________________</div>
      <div class="firma-cargo">Acudiente / Padre de familia</div>
    </div>
  </div>

  ${piePagina()}`;

  imprimir(html, `Plan de Mejoramiento — ${plan.estudiante}`);
}
