import { imprimir, headerInstitucional, piePagina } from "../impresion";

/**
 * Imprime la ficha de matrícula del estudiante.
 */
export function imprimirFichaMatricula(matricula, estudiante, curso, instNombre = "Institución Educativa") {
  const tipoLabel = {
    nueva: "Matrícula Nueva",
    renovacion: "Renovación de Matrícula",
    traslado: "Matrícula por Traslado",
  }[matricula.tipoMatricula] || "Matrícula";

  const estadoBadge = matricula.estado === "activa"
    ? `<span class="badge badge-green">Activa</span>`
    : `<span class="badge badge-red">Inactiva</span>`;

  const html = `
  ${headerInstitucional(instNombre)}

  <div class="doc-titulo">Ficha de Matrícula Estudiantil</div>
  <div class="doc-subtitulo">${tipoLabel} · Código: MAT-${String(matricula.id).padStart(5,"0")} &nbsp;·&nbsp; ${estadoBadge}</div>

  <div style="margin:12px 0;padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:9.5pt;color:#15803d;">
    ✓ Matrícula registrada el <strong>${matricula.fecha}</strong> en el sistema académico EduRural.
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Datos del Estudiante</div>
    <div class="grid2">
      <div class="campo">
        <div class="campo-label">Nombre completo</div>
        <div class="campo-valor">${estudiante?.nombre || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Documento de identidad</div>
        <div class="campo-valor">${estudiante?.documento || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Correo electrónico</div>
        <div class="campo-valor">${estudiante?.correo || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Teléfono</div>
        <div class="campo-valor">${estudiante?.telefono || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Dirección</div>
        <div class="campo-valor">${estudiante?.direccion || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Curso matriculado</div>
        <div class="campo-valor">${curso?.nombre || "—"}</div>
      </div>
    </div>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Datos del Acudiente</div>
    <div class="grid2">
      <div class="campo">
        <div class="campo-label">Nombre del acudiente</div>
        <div class="campo-valor">${matricula.acudiente || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Parentesco</div>
        <div class="campo-valor">${matricula.parentesco || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Teléfono del acudiente</div>
        <div class="campo-valor">${matricula.telefonoAcudiente || "—"}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Tipo de matrícula</div>
        <div class="campo-valor">${tipoLabel}</div>
      </div>
    </div>
  </div>

  ${matricula.observaciones ? `
  <div class="seccion">
    <div class="seccion-titulo">Observaciones Especiales</div>
    <div class="caja">
      <div class="caja-contenido">${matricula.observaciones}</div>
    </div>
  </div>` : ""}

  <div class="seccion">
    <div class="seccion-titulo">Declaración y Compromisos</div>
    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:14px;font-size:9.5pt;color:#374151;line-height:1.7;">
      Yo, <strong>${matricula.acudiente || "___________________"}</strong>, en calidad de acudiente del
      estudiante <strong>${estudiante?.nombre || "___________________"}</strong>, declaro que la información
      suministrada es verídica y me comprometo a cumplir con el reglamento interno de la institución,
      asistir a las citaciones convocadas y acompañar activamente el proceso educativo de mi hijo(a).
    </div>
  </div>

  <div class="firma-bloque">
    <div class="firma-linea">
      <div class="firma-nombre">${matricula.acudiente || "___________________"}</div>
      <div class="firma-cargo">Acudiente · C.C. _______________</div>
    </div>
    <div class="firma-linea">
      <div class="firma-nombre">___________________</div>
      <div class="firma-cargo">Secretaria Académica</div>
    </div>
    <div class="firma-linea">
      <div class="firma-nombre">___________________</div>
      <div class="firma-cargo">Rector(a)</div>
    </div>
  </div>

  ${piePagina()}`;

  imprimir(html, `Matrícula — ${estudiante?.nombre}`);
}

/**
 * Imprime el listado completo de matrículas filtrado.
 */
export function imprimirListadoMatriculas(matriculas, todosEstudiantes, cursos, instNombre = "Institución Educativa") {
  const filas = matriculas.map(m => {
    const est  = todosEstudiantes.find(u => u.id === m.estudianteId);
    const cur  = cursos.find(c => c.id === m.cursoId);
    return `<tr>
      <td>${est?.nombre || "—"}</td>
      <td>${est?.documento || "—"}</td>
      <td>${cur?.nombre || "—"}</td>
      <td>${m.acudiente || "—"}</td>
      <td>${m.fecha}</td>
      <td><span class="badge ${m.estado === "activa" ? "badge-green" : "badge-red"}">${m.estado}</span></td>
    </tr>`;
  }).join("");

  const html = `
  ${headerInstitucional(instNombre)}

  <div class="doc-titulo">Listado de Matrículas</div>
  <div class="doc-subtitulo">Total: ${matriculas.length} matrícula(s)</div>

  <table>
    <thead>
      <tr>
        <th>Estudiante</th>
        <th>Documento</th>
        <th>Curso</th>
        <th>Acudiente</th>
        <th>Fecha</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>

  ${piePagina()}`;

  imprimir(html, "Listado de Matrículas");
}
