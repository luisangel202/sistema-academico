/**
 * Utilidad de impresión — abre una ventana nueva con el HTML formateado
 * y lanza el diálogo de impresora del navegador.
 *
 * También puede generar un Blob descargable como PDF (usando el diálogo
 * "Guardar como PDF" del navegador).
 */

/** Estilos CSS base compartidos por todos los formatos */
const CSS_BASE = `
  @page { size: letter; margin: 2cm 2.5cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Arial", sans-serif;
    font-size: 11pt;
    color: #1a1a1a;
    line-height: 1.5;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid #1d4ed8;
    padding-bottom: 10px;
    margin-bottom: 18px;
  }
  .header-left { flex: 1; }
  .inst-nombre {
    font-size: 13pt;
    font-weight: 700;
    color: #1d4ed8;
    margin-bottom: 2px;
  }
  .inst-sub {
    font-size: 9pt;
    color: #64748b;
  }
  .doc-titulo {
    font-size: 15pt;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
  .doc-subtitulo {
    font-size: 10pt;
    color: #64748b;
    text-align: center;
    margin-bottom: 20px;
  }
  .seccion {
    margin-bottom: 16px;
  }
  .seccion-titulo {
    font-size: 10pt;
    font-weight: 700;
    color: #1d4ed8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #bfdbfe;
    padding-bottom: 4px;
    margin-bottom: 10px;
  }
  .grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 24px;
  }
  .grid3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px 16px;
  }
  .campo { margin-bottom: 6px; }
  .campo-label {
    font-size: 8.5pt;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .campo-valor {
    font-size: 10.5pt;
    color: #1e293b;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 2px;
    min-height: 18px;
  }
  .firma-bloque {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 32px;
  }
  .firma-linea {
    border-top: 1px solid #374151;
    padding-top: 6px;
    text-align: center;
  }
  .firma-nombre { font-size: 9pt; font-weight: 700; color: #1e293b; }
  .firma-cargo  { font-size: 8pt; color: #64748b; }
  .pie {
    margin-top: 24px;
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #94a3b8;
  }
  .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 9pt;
    font-weight: 700;
  }
  .badge-blue   { background: #dbeafe; color: #1d4ed8; }
  .badge-green  { background: #dcfce7; color: #15803d; }
  .badge-amber  { background: #fef9c3; color: #92400e; }
  .badge-red    { background: #fee2e2; color: #991b1b; }
  .badge-gray   { background: #f1f5f9; color: #475569; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 9.5pt;
  }
  th {
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 700;
    text-align: left;
    padding: 7px 10px;
    border: 1px solid #bfdbfe;
    font-size: 8.5pt;
    text-transform: uppercase;
  }
  td {
    padding: 7px 10px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f8fafc; }
  .caja {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 14px;
    background: #f8fafc;
    margin-bottom: 10px;
  }
  .caja-titulo {
    font-size: 8.5pt;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .caja-contenido { font-size: 10.5pt; color: #1e293b; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

/**
 * Abre ventana de impresión con el HTML generado.
 * @param {string} html   — contenido HTML del documento
 * @param {string} titulo — título de la ventana
 */
export function imprimir(html, titulo = "EduRural") {
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>${titulo}</title>
  <style>${CSS_BASE}</style>
</head>
<body>
  ${html}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`);
  win.document.close();
}

/** Cabecera institucional reutilizable */
export function headerInstitucional(instNombre = "Institución Educativa", instInfo = "") {
  return `
  <div class="header">
    <div class="header-left">
      <div class="inst-nombre">${instNombre}</div>
      <div class="inst-sub">${instInfo || "Sistema Académico EduRural"}</div>
    </div>
    <div style="text-align:right; font-size:8.5pt; color:#94a3b8;">
      Fecha: ${new Date().toLocaleDateString("es-CO", { day:"2-digit", month:"long", year:"numeric" })}<br/>
      Hora: ${new Date().toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" })}
    </div>
  </div>`;
}

/** Pie de página reutilizable */
export function piePagina() {
  return `
  <div class="pie">
    <span>Generado por EduRural — Sistema Académico</span>
    <span>Documento generado el ${new Date().toLocaleString("es-CO")}</span>
  </div>`;
}
