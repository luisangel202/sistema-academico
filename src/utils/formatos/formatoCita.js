import { imprimir, headerInstitucional, piePagina } from "../impresion";

const TIPO_LABEL = {
  seguimiento: "Seguimiento Psicosocial",
  primera_atencion: "Primera Atención",
  evaluacion: "Evaluación Psicológica",
  cierre: "Cierre de Caso",
};

/**
 * Imprime el informe de cita de psicoorientación.
 */
export function imprimirInformeCita(cita, estudiante, instNombre = "Institución Educativa", orientadorNombre = "Psicoorientador(a)") {
  const tipo = TIPO_LABEL[cita.tipo] || cita.tipo;
  const estadoBadge = cita.estado === "realizada"
    ? `<span class="badge badge-green">Realizada</span>`
    : `<span class="badge badge-blue">Programada</span>`;

  const html = `
  ${headerInstitucional(instNombre)}

  <div class="doc-titulo">Informe de Atención Psicosocial</div>
  <div class="doc-subtitulo">${tipo} · Código: CPS-${String(cita.id).padStart(4,"0")} &nbsp;·&nbsp; ${estadoBadge}</div>

  <div style="margin:12px 0;padding:10px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:9pt;color:#92400e;">
    ⚠ Documento de carácter confidencial. Uso exclusivo del área de psicoorientación y directivos.
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Datos de la Atención</div>
    <div class="grid3">
      <div class="campo">
        <div class="campo-label">Estudiante</div>
        <div class="campo-valor">${estudiante?.nombre || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Fecha de la cita</div>
        <div class="campo-valor">${cita.fecha}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Hora</div>
        <div class="campo-valor">${cita.hora}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Tipo de atención</div>
        <div class="campo-valor">${tipo}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Estado</div>
        <div class="campo-valor">${estadoBadge}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Orientador(a)</div>
        <div class="campo-valor">${orientadorNombre}</div>
      </div>
    </div>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Motivo de la Atención</div>
    <div class="caja">
      <div class="caja-contenido">${cita.motivo}</div>
    </div>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Desarrollo de la Sesión</div>
    <div style="border:1px solid #e2e8f0;min-height:80px;border-radius:6px;padding:10px;"></div>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Acuerdos y Compromisos</div>
    <div style="border:1px solid #e2e8f0;min-height:60px;border-radius:6px;padding:10px;"></div>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Remisiones y Acciones Sugeridas</div>
    <div style="font-size:9.5pt;display:flex;flex-direction:column;gap:6px;padding:10px;border:1px solid #e2e8f0;border-radius:6px;">
      <span>☐ Remisión a coordinación académica</span>
      <span>☐ Remisión a director(a) de grupo</span>
      <span>☐ Citación al acudiente</span>
      <span>☐ Remisión externa (médico, especialista)</span>
      <span>☐ Seguimiento en próxima sesión</span>
      <span>☐ Otra: _______________________________________________</span>
    </div>
  </div>

  <div class="firma-bloque">
    <div class="firma-linea">
      <div class="firma-nombre">${estudiante?.nombre || "___________________"}</div>
      <div class="firma-cargo">Estudiante</div>
    </div>
    <div class="firma-linea">
      <div class="firma-nombre">___________________</div>
      <div class="firma-cargo">Acudiente (si aplica)</div>
    </div>
    <div class="firma-linea">
      <div class="firma-nombre">${orientadorNombre}</div>
      <div class="firma-cargo">Psicoorientador(a)</div>
    </div>
  </div>

  ${piePagina()}`;

  imprimir(html, `Cita Psicoorientación — ${estudiante?.nombre}`);
}

/**
 * Imprime el listado de citas del psicoorientador.
 */
export function imprimirListadoCitas(citas, estudiantes, instNombre = "Institución Educativa") {
  const filas = citas.map(c => {
    const est = estudiantes.find(u => u.id === c.estudianteId);
    return `<tr>
      <td>${est?.nombre || "—"}</td>
      <td>${c.fecha}</td>
      <td>${c.hora}</td>
      <td>${TIPO_LABEL[c.tipo] || c.tipo}</td>
      <td>${c.motivo}</td>
      <td><span class="badge ${c.estado === "realizada" ? "badge-green" : "badge-blue"}">${c.estado}</span></td>
    </tr>`;
  }).join("");

  const html = `
  ${headerInstitucional(instNombre)}
  <div class="doc-titulo">Agenda de Citas — Psicoorientación</div>
  <div class="doc-subtitulo">Total: ${citas.length} cita(s) · Confidencial</div>
  <table>
    <thead>
      <tr><th>Estudiante</th><th>Fecha</th><th>Hora</th><th>Tipo</th><th>Motivo</th><th>Estado</th></tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>
  ${piePagina()}`;

  imprimir(html, "Agenda Citas Psicoorientación");
}
