/**
 * Generador local de preguntas tipo ICFES basado en temas.
 *
 * No requiere API externa. Usa un banco de plantillas por materia
 * y rellena variables con los temas que ingresa el docente.
 *
 * Soporta: Matemáticas, Español, Ciencias Naturales, Ciencias Sociales,
 * Inglés, Ética, Artística, Tecnología, Educación Física, Religión.
 */

/* ── Utilidades ──────────────────────────────────────────────────── */
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const uuid = () => `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/* ── Banco de plantillas por área ───────────────────────────────── */
const PLANTILLAS = {
  matematicas: [
    {
      gen: (tema) => ({
        enunciado: `En el contexto de "${tema}", si se tiene una ecuación de la forma ax² + bx + c = 0, ¿cuál de las siguientes afirmaciones es CORRECTA respecto a sus soluciones?`,
        opciones: [
          { texto: "Siempre tiene dos soluciones reales diferentes", correcta: false },
          { texto: "El discriminante b² - 4ac determina el tipo de soluciones", correcta: true },
          { texto: "Si a = 0 sigue siendo una ecuación cuadrática", correcta: false },
          { texto: "Las soluciones siempre son números enteros", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Al estudiar "${tema}", un estudiante debe calcular el área de un triángulo con base 8 cm y altura 5 cm. ¿Cuál es el resultado correcto?`,
        opciones: [
          { texto: "40 cm²", correcta: false },
          { texto: "13 cm²", correcta: false },
          { texto: "20 cm²", correcta: true },
          { texto: "80 cm²", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Relacionado con "${tema}", ¿cuál de las siguientes expresiones representa una RAZÓN de cambio constante (función lineal)?`,
        opciones: [
          { texto: "y = x²", correcta: false },
          { texto: "y = 2x + 3", correcta: true },
          { texto: "y = √x", correcta: false },
          { texto: "y = 1/x", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Sobre el tema "${tema}": Si en un conjunto de datos los valores son {2, 5, 5, 8, 10}, ¿cuál es la MODA?`,
        opciones: [
          { texto: "6", correcta: false },
          { texto: "8", correcta: false },
          { texto: "5", correcta: true },
          { texto: "2", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `En el estudio de "${tema}", la propiedad distributiva establece que a(b + c) es igual a:`,
        opciones: [
          { texto: "ab + c", correcta: false },
          { texto: "a + bc", correcta: false },
          { texto: "ab + ac", correcta: true },
          { texto: "(a+b)(a+c)", correcta: false },
        ],
      }),
    },
  ],

  espanol: [
    {
      gen: (tema) => ({
        enunciado: `Al abordar "${tema}", se lee el siguiente fragmento: "El sol se ocultó tras las montañas dejando un manto carmesí". La figura literaria presente en este verso es:`,
        opciones: [
          { texto: "Hipérbole", correcta: false },
          { texto: "Metáfora", correcta: true },
          { texto: "Onomatopeya", correcta: false },
          { texto: "Anáfora", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `En el marco de "${tema}", ¿cuál de los siguientes conectores indica una relación de CAUSA?`,
        opciones: [
          { texto: "Sin embargo", correcta: false },
          { texto: "Por lo tanto", correcta: false },
          { texto: "Debido a que", correcta: true },
          { texto: "Aunque", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Al estudiar "${tema}", el propósito comunicativo de un texto ARGUMENTATIVO es:`,
        opciones: [
          { texto: "Contar una historia de manera cronológica", correcta: false },
          { texto: "Describir las características de un objeto", correcta: false },
          { texto: "Convencer al lector sobre un punto de vista", correcta: true },
          { texto: "Dar instrucciones para realizar una actividad", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Referente a "${tema}", la diferencia entre narrador protagonista y narrador omnisciente radica en:`,
        opciones: [
          { texto: "El tipo de texto que narran", correcta: false },
          { texto: "La participación del narrador en la historia y su conocimiento de los hechos", correcta: true },
          { texto: "El uso de primera o tercera persona", correcta: false },
          { texto: "La extensión del relato", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Sobre "${tema}": En el enunciado "Mis amigos llegaron tarde", el sujeto gramatical es:`,
        opciones: [
          { texto: "llegaron tarde", correcta: false },
          { texto: "Mis amigos", correcta: true },
          { texto: "tarde", correcta: false },
          { texto: "amigos llegaron", correcta: false },
        ],
      }),
    },
  ],

  ciencias_naturales: [
    {
      gen: (tema) => ({
        enunciado: `En el tema de "${tema}", el proceso por el cual las plantas fabrican su propio alimento usando la luz solar se denomina:`,
        opciones: [
          { texto: "Respiración celular", correcta: false },
          { texto: "Fermentación", correcta: false },
          { texto: "Fotosíntesis", correcta: true },
          { texto: "Digestión", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Al estudiar "${tema}", la unidad básica y funcional de todos los seres vivos es:`,
        opciones: [
          { texto: "El tejido", correcta: false },
          { texto: "El órgano", correcta: false },
          { texto: "La molécula", correcta: false },
          { texto: "La célula", correcta: true },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `En relación con "${tema}", la Ley de Newton que establece que a toda acción corresponde una reacción igual y contraria es la:`,
        opciones: [
          { texto: "Primera Ley (Inercia)", correcta: false },
          { texto: "Segunda Ley (F=ma)", correcta: false },
          { texto: "Tercera Ley (Acción y Reacción)", correcta: true },
          { texto: "Ley de Gravitación Universal", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Sobre "${tema}": La función principal del sistema circulatorio es:`,
        opciones: [
          { texto: "Filtrar el aire que respiramos", correcta: false },
          { texto: "Transportar nutrientes, oxígeno y desechos por el cuerpo", correcta: true },
          { texto: "Producir enzimas digestivas", correcta: false },
          { texto: "Regular la temperatura corporal únicamente", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `En el contexto de "${tema}", ¿cuál de los siguientes cambios es un cambio QUÍMICO?`,
        opciones: [
          { texto: "Derretir el hielo", correcta: false },
          { texto: "Romper un vidrio", correcta: false },
          { texto: "Quemar papel", correcta: true },
          { texto: "Doblar una hoja de aluminio", correcta: false },
        ],
      }),
    },
  ],

  ciencias_sociales: [
    {
      gen: (tema) => ({
        enunciado: `Al estudiar "${tema}", el proceso mediante el cual Colombia se independizó de España se consolidó con:`,
        opciones: [
          { texto: "El grito de independencia del 20 de julio de 1810 como única fecha", correcta: false },
          { texto: "La Batalla de Boyacá del 7 de agosto de 1819", correcta: true },
          { texto: "La firma de la Constitución de 1886", correcta: false },
          { texto: "La Revolución Comunera de 1781", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `En el marco de "${tema}", los tres poderes del Estado colombiano son:`,
        opciones: [
          { texto: "Presidente, Senado y Ejército", correcta: false },
          { texto: "Ejecutivo, Legislativo y Judicial", correcta: true },
          { texto: "Gobernadores, Alcaldes y Congreso", correcta: false },
          { texto: "Constitucional, Legal y Ejecutivo", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Sobre "${tema}": La región con mayor biodiversidad de Colombia es:`,
        opciones: [
          { texto: "Región Andina", correcta: false },
          { texto: "Región Caribe", correcta: false },
          { texto: "Región Amazónica", correcta: true },
          { texto: "Región Pacífica", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Al abordar "${tema}", los Derechos Humanos se caracterizan principalmente por ser:`,
        opciones: [
          { texto: "Exclusivos para los ciudadanos de países democráticos", correcta: false },
          { texto: "Universales, inalienables e indivisibles", correcta: true },
          { texto: "Otorgados por el gobierno de cada país", correcta: false },
          { texto: "Aplicables solo a mayores de edad", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `En relación con "${tema}", el concepto de DESARROLLO SOSTENIBLE implica:`,
        opciones: [
          { texto: "Explotar al máximo los recursos naturales disponibles", correcta: false },
          { texto: "Detener todo tipo de desarrollo industrial", correcta: false },
          { texto: "Satisfacer las necesidades actuales sin comprometer las de generaciones futuras", correcta: true },
          { texto: "Priorizar el crecimiento económico sobre el ambiente", correcta: false },
        ],
      }),
    },
  ],

  ingles: [
    {
      gen: (tema) => ({
        enunciado: `In the context of "${tema}", which of the following sentences uses the PRESENT PERFECT correctly?`,
        opciones: [
          { texto: "She go to school yesterday", correcta: false },
          { texto: "She has visited Paris three times", correcta: true },
          { texto: "She will went to Paris", correcta: false },
          { texto: "She is visit Paris now", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Regarding "${tema}", the word "although" is used to:`,
        opciones: [
          { texto: "Show a result or consequence", correcta: false },
          { texto: "Express contrast or concession", correcta: true },
          { texto: "Indicate a reason or cause", correcta: false },
          { texto: "Show addition of ideas", correcta: false },
        ],
      }),
    },
  ],

  default: [
    {
      gen: (tema) => ({
        enunciado: `En el estudio de "${tema}", ¿cuál de las siguientes opciones describe MEJOR el concepto central de este tema?`,
        opciones: [
          { texto: "Es un concepto que no tiene aplicación práctica", correcta: false },
          { texto: "Es un principio fundamental que estructura el conocimiento del área", correcta: true },
          { texto: "Es una teoría descartada por la ciencia moderna", correcta: false },
          { texto: "Es exclusivamente un concepto histórico sin vigencia actual", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Al analizar "${tema}", ¿cuál sería la CONSECUENCIA más directa de no comprender este concepto?`,
        opciones: [
          { texto: "No tendría ningún efecto en el aprendizaje general", correcta: false },
          { texto: "Dificultaría la comprensión de los temas relacionados y su aplicación", correcta: true },
          { texto: "Solo afectaría el desempeño en evaluaciones escritas", correcta: false },
          { texto: "Generaría ventajas en el aprendizaje de otras áreas", correcta: false },
        ],
      }),
    },
    {
      gen: (tema) => ({
        enunciado: `Sobre "${tema}", ¿cuál de las siguientes HABILIDADES es fundamental para dominar este contenido?`,
        opciones: [
          { texto: "Memorización sin comprensión", correcta: false },
          { texto: "Análisis crítico y aplicación contextualizada del conocimiento", correcta: true },
          { texto: "Repetición mecánica de procedimientos", correcta: false },
          { texto: "Conocimiento aislado sin conexión con otros saberes", correcta: false },
        ],
      }),
    },
  ],
};

/** Detecta el área a partir del nombre de la materia */
function detectarArea(nombreMateria) {
  const n = nombreMateria.toLowerCase();
  if (n.includes("mat") || n.includes("álgebra") || n.includes("geometría") || n.includes("cálculo")) return "matematicas";
  if (n.includes("español") || n.includes("castellano") || n.includes("lengua") || n.includes("literatura")) return "espanol";
  if (n.includes("natural") || n.includes("física") || n.includes("química") || n.includes("biología")) return "ciencias_naturales";
  if (n.includes("social") || n.includes("histor") || n.includes("geograf") || n.includes("ética") || n.includes("civil")) return "ciencias_sociales";
  if (n.includes("inglés") || n.includes("english") || n.includes("idioma")) return "ingles";
  return "default";
}

/**
 * Genera preguntas tipo ICFES a partir de una lista de temas.
 *
 * @param {string[]} temas - Lista de temas dados hasta el momento
 * @param {string}   nombreMateria - Nombre de la materia
 * @param {number}   cantidad - Número de preguntas a generar (default: 5)
 * @param {number}   puntajePorPregunta - Puntaje por pregunta (default: 10)
 * @returns {object[]} Array de preguntas listas para editar/usar
 */
export function generarPreguntas(temas, nombreMateria = "", cantidad = 5, puntajePorPregunta = 10) {
  if (!temas || temas.length === 0) return [];

  const area = detectarArea(nombreMateria);
  const plantillasArea = PLANTILLAS[area] || PLANTILLAS.default;
  const todas = [...plantillasArea, ...PLANTILLAS.default];

  const preguntasGeneradas = [];
  const temasShuffled = shuffle(temas);

  for (let i = 0; i < cantidad; i++) {
    const tema = temasShuffled[i % temasShuffled.length];
    const plantilla = shuffle(todas)[i % todas.length];
    const generado = plantilla.gen(tema);

    // Mezcla las opciones manteniendo registro de cuál es la correcta
    const opcionesConId = generado.opciones.map((op, idx) => ({
      ...op,
      id: ["a", "b", "c", "d"][idx],
    }));
    const opcionesMezcladas = shuffle(opcionesConId).map((op, idx) => ({
      ...op,
      id: ["a", "b", "c", "d"][idx],
    }));

    preguntasGeneradas.push({
      id: uuid(),
      tipo: "seleccion_multiple",
      enunciado: generado.enunciado,
      opciones: opcionesMezcladas,
      puntaje: puntajePorPregunta,
      orden: i + 1,
      tema,
      generada: true,
    });
  }

  return preguntasGeneradas;
}

/** Genera el título automático del cuestionario */
export function generarTitulo(temas, nombreMateria) {
  const maxTemas = temas.slice(0, 3).join(", ");
  const sufijo = temas.length > 3 ? ` y ${temas.length - 3} temas más` : "";
  return `Evaluación ${nombreMateria}: ${maxTemas}${sufijo}`;
}
