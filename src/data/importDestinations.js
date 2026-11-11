/**
 * Registro de destinos de importación.
 * Cada destino define qué columnas espera (con alias) para que
 * el SmartImport pueda detectar automáticamente a qué módulo
 * corresponden los datos del archivo.
 */

const normalize = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export const IMPORT_DESTINATIONS = [
  {
    id: "matriculas",
    label: "Matrículas",
    route: "/matriculas",
    color: "#3b82f6",
    hint: "nombre, documento, correo, telefono, cursoId, acudiente, parentesco, telefonoAcudiente",
    columns: {
      nombre:            ["nombre", "nombre completo", "estudiante"],
      documento:         ["documento", "no. documento", "identificacion", "cedula", "doc"],
      correo:            ["correo", "email", "correo electronico"],
      telefono:          ["telefono", "celular", "movil"],
      cursoId:           ["cursoid", "curso", "grado"],
      acudiente:         ["acudiente", "padre", "madre", "responsable"],
      parentesco:        ["parentesco", "tipo acudiente"],
      telefonoAcudiente: ["telefonoacudiente", "telefono acudiente", "celular acudiente"],
    },
    required: ["nombre"],
    minMatch: 2,
  },
  {
    id: "usuarios",
    label: "Usuarios",
    route: "/usuarios",
    color: "#8b5cf6",
    hint: "nombre, documento, correo, rol, telefono, activo",
    columns: {
      nombre:    ["nombre", "nombre completo", "nombres", "nombre y apellido"],
      documento: ["documento", "no. documento", "identificacion", "cedula", "doc"],
      correo:     ["correo", "email", "correo electronico"],
      rol:        ["rol", "tipo", "tipo usuario", "perfil"],
      telefono:   ["telefono", "celular", "movil", "cel"],
      activo:     ["activo", "estado", "vigente"],
    },
    required: ["nombre"],
    minMatch: 2,
  },
  {
    id: "materias",
    label: "Materias",
    route: "/materias",
    color: "#8b5cf6",
    hint: "nombre, codigo, cursoId, docenteId, intensidad, area, tipoEvaluacion",
    columns: {
      nombre:          ["nombre", "materia", "asignatura", "nombre materia"],
      codigo:          ["codigo", "cod", "codigo materia", "abreviatura"],
      cursoId:         ["cursoid", "curso", "grado"],
      docenteId:       ["docenteid", "docente", "profesor"],
      intensidad:      ["intensidad", "horas", "horas semana", "ih"],
      area:            ["area", "campo", "componente"],
      tipoEvaluacion:  ["tipoevaluacion", "tipo evaluacion", "evaluacion"],
    },
    required: ["nombre"],
    minMatch: 2,
  },
  {
    id: "periodos",
    label: "Períodos Académicos",
    route: "/periodos",
    color: "#3b82f6",
    hint: "nombre, numero, año, inicio, fin, pesoNota",
    columns: {
      nombre:   ["nombre", "periodo", "nombre periodo"],
      numero:   ["numero", "n. periodo", "num"],
      año:      ["año", "ano", "year"],
      inicio:   ["inicio", "fecha inicio", "desde", "fecha inicial"],
      fin:      ["fin", "fecha fin", "hasta", "fecha final", "fecha cierre"],
      pesoNota: ["pesonota", "peso", "peso nota", "porcentaje"],
    },
    required: ["nombre"],
    minMatch: 2,
  },
  {
    id: "notas",
    label: "Notas / Calificaciones",
    route: "/notas",
    color: "#f59e0b",
    hint: "estudiante, materia, nota, periodo, valoracion",
    columns: {
      estudiante:   ["estudiante", "nombre", "alumno", "id estudiante", "estudianteid"],
      materia:      ["materia", "asignatura", "materiaid", "id materia"],
      nota:         ["nota", "calificacion", "puntaje", "valor", "calif"],
      periodo:      ["periodo", "periodoid", "id periodo"],
      valoracion:   ["valoracion", "conceptual", "desempeno", "desempeño"],
    },
    required: ["estudiante"],
    minMatch: 2,
  },
  {
    id: "instituciones",
    label: "Instituciones",
    route: "/instituciones",
    color: "#3b82f6",
    hint: "nombre, codigo, codigoDANE, municipio, departamento, rector, licencia",
    columns: {
      nombre:      ["nombre", "institucion", "colegio", "nombre institucion"],
      codigo:      ["codigo", "cod", "codigo interno"],
      codigoDANE:  ["codigodane", "dane", "codigo dane"],
      municipio:   ["municipio", "ciudad", "poblacion"],
      departamento:["departamento", "depto", "estado"],
      rector:      ["rector", "director", "nombre rector"],
      licencia:    ["licencia", "tipo licencia", "plan"],
    },
    required: ["nombre"],
    minMatch: 2,
  },
];

/**
 * Detecta qué destino(s) coinciden con las columnas del archivo.
 * Retorna array ordenado por score descendente.
 */
export function detectDestinations(parsedColumns) {
  const normalizedCols = parsedColumns.map(normalize);
  const results = [];

  for (const dest of IMPORT_DESTINATIONS) {
    let matched = 0;
    let requiredMet = true;

    for (const [field, aliases] of Object.entries(dest.columns)) {
      const allAliases = [field, ...aliases].map(normalize);
      if (normalizedCols.some((col) => allAliases.includes(col))) {
        matched++;
      }
    }

    /* Verificar columnas obligatorias */
    for (const req of dest.required) {
      const allAliases = [req, ...(dest.columns[req] || [])].map(normalize);
      if (!normalizedCols.some((col) => allAliases.includes(col))) {
        requiredMet = false;
        break;
      }
    }

    const totalCols = Object.keys(dest.columns).length;
    const score = matched / totalCols;

    if (requiredMet && matched >= (dest.minMatch || 1)) {
      results.push({ ...dest, score, matched, totalCols });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
