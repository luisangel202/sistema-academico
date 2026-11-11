import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import { notas, tareas, materias, alertas } from "../data/mockData";

const respuestas = {
  ESTUDIANTE: {
    promedio: (user) => {
      const misNotas = notas.filter((n) => n.estudianteId === user?.id);
      if (!misNotas.length) return "Aún no tienes notas registradas en este período.";
      const prom = (misNotas.reduce((a, b) => a + b.promedio, 0) / misNotas.length).toFixed(1);
      const menor = misNotas.reduce((a, b) => a.promedio < b.promedio ? a : b);
      const mat = materias.find((m) => m.id === menor.materiaId);
      return `Tu promedio actual es ${prom}. La materia con menor nota es ${mat?.nombre || "—"} con ${menor.promedio}.`;
    },
    tareas: (user) => {
      const pendientes = tareas.filter((t) => t.cursoId === user?.cursoId && t.estado === "activa");
      if (!pendientes.length) return "No tienes tareas pendientes. ¡Bien hecho!";
      return `Tienes ${pendientes.length} tarea(s) pendiente(s): ${pendientes.map(t => `${t.titulo} (vence ${t.fechaLimite})`).join(", ")}.`;
    },
    asistencia: () => "Consulta tu asistencia detallada en la sección Mi Asistencia.",
    boletin: () => "Tus boletines están disponibles en la sección Boletines.",
    default: () => "Puedo ayudarte con tu promedio, tareas pendientes, asistencia y boletines. ¿Qué necesitas saber?",
  },
  DOCENTE: {
    cursos: (user) => {
      const mats = materias.filter(m => m.docenteId === user?.id);
      if (!mats.length) return "No tienes materias asignadas este período.";
      return `Tienes ${mats.length} materia(s) asignada(s): ${mats.map(m => m.nombre).join(", ")}.`;
    },
    tareas: (user) => {
      const activas = tareas.filter((t) => t.docenteId === user?.id && t.estado === "activa");
      if (!activas.length) return "No tienes tareas activas en este momento.";
      return `Tienes ${activas.length} tarea(s) activa(s): ${activas.map(t => t.titulo).join(", ")}.`;
    },
    asistencia: () => "Recuerda registrar la asistencia de tus cursos en la sección Asistencia.",
    default: () => "Puedo ayudarte con tus cursos, tareas, asistencia y notas. ¿Qué necesitas?",
  },
  PADRE: {
    promedio: (user) => {
      const hijosIds = user?.hijosIds || [];
      if (!hijosIds.length) return "No hay hijos registrados en tu cuenta.";
      const misNotas = notas.filter((n) => hijosIds.includes(n.estudianteId));
      if (!misNotas.length) return "Aún no hay notas registradas para tu hijo(a).";
      const prom = (misNotas.reduce((a, b) => a + b.promedio, 0) / misNotas.length).toFixed(1);
      return `El promedio actual es ${prom} en el Período 2.`;
    },
    tareas: (user) => {
      const pendientes = tareas.filter((t) => t.estado === "activa");
      if (!pendientes.length) return "No hay tareas activas en este momento.";
      return `Hay ${pendientes.length} tarea(s) activa(s): ${pendientes.map(t => `${t.titulo} para el ${t.fechaLimite}`).join(", ")}.`;
    },
    asistencia: () => "Consulta la asistencia de tu hijo(a) en la sección Boletines o contáctate con el Director de Grupo.",
    default: () => "Puedo informarte sobre notas, tareas y asistencia. ¿Qué deseas consultar?",
  },
  default: {
    default: () => "Hola, soy el asistente académico de EduRural. ¿En qué puedo ayudarte?",
  },
};

const detectarIntencion = (texto) => {
  const t = texto.toLowerCase();
  if (t.includes("promedio") || t.includes("nota") || t.includes("calificaci")) return "promedio";
  if (t.includes("tarea") || t.includes("pendiente") || t.includes("entreg")) return "tareas";
  if (t.includes("asistencia") || t.includes("falta") || t.includes("ausencia")) return "asistencia";
  if (t.includes("boletin") || t.includes("boletín") || t.includes("informe")) return "boletin";
  if (t.includes("curso") || t.includes("horario") || t.includes("hoy")) return "cursos";
  return "default";
};

const sugerencias = {
  ESTUDIANTE: ["¿Cuál es mi promedio?", "¿Qué tareas tengo pendientes?", "¿Cómo está mi asistencia?"],
  DOCENTE: ["¿Qué cursos tengo hoy?", "¿Tengo tareas activas?", "¿Hay asistencia pendiente?"],
  PADRE: ["¿Cuál es el promedio de mi hijo?", "¿Tiene tareas pendientes?", "¿Tiene inasistencias?"],
};

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: `Hola ${user?.nombre?.split(" ")[0]}, soy tu asistente académico. ¿En qué puedo ayudarte?` }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (texto) => {
    const msg = texto || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg = { id: Date.now(), from: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const intencion = detectarIntencion(msg);
      const rolRespuestas = respuestas[user?.rol] || respuestas.default;
      const fn = rolRespuestas[intencion] || rolRespuestas.default;
      const respuesta = fn(user);
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: "bot", text: respuesta }]);
    }, 600);
  };

  const sugs = sugerencias[user?.rol] || [];

  return (
    <div>
      <PageHeader title="Chatbot Académico" subtitle="Asistente inteligente para consultas académicas" />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ height: "60vh" }}>
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-start gap-2 ${m.from === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.from === "bot" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {m.from === "bot" ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                  m.from === "bot"
                    ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                    : "bg-blue-600 text-white rounded-tr-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Sugerencias */}
          {sugs.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 flex gap-2 flex-wrap">
              {sugs.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition border-0 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => sendMessage()}
              className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition border-0 cursor-pointer flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
