import { useState } from "react";
import { Send, ArrowLeft, MessageSquare, Users, Filter } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { usuarios, materias, cursos } from "../data/mockData";

const conversacionesIniciales = [
  { id: 1, conUsuarioId: 9, mensajes: [
    { de: 5, texto: "Hola Juan, recuerda entregar el taller de álgebra.", hora: "10:30" },
    { de: 9, texto: "Sí profe, lo entrego mañana.", hora: "10:45" },
  ]},
  { id: 2, conUsuarioId: 11, mensajes: [
    { de: 11, texto: "Buenas tardes, ¿cómo va Juan en matemáticas?", hora: "14:00" },
    { de: 5, texto: "Hola Roberto, Juan va bien, promedio 4.1.", hora: "14:15" },
  ]},
];

export default function Mensajes() {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState(conversacionesIniciales);
  const [activa, setActiva] = useState(null);
  const [texto, setTexto] = useState("");
  const [search, setSearch] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [showStudentsList, setShowStudentsList] = useState(false);
  // Mobile: show chat panel when a conversation is selected
  const [showChat, setShowChat] = useState(false);

  // Obtener cursos y estudiantes del docente actual
  const misCursos = cursos.filter(curso => 
    materias.some(materia => materia.cursoId === curso.id && materia.docenteId === user?.id)
  );
  
  const misEstudiantes = usuarios.filter(u => 
    u.rol === "ESTUDIANTE" && 
    misCursos.some(curso => curso.id === u.cursoId)
  );
  
  const estudiantesFiltrados = filtroCurso 
    ? misEstudiantes.filter(e => e.cursoId === Number(filtroCurso))
    : misEstudiantes;

  const enviar = () => {
    if (!texto.trim() || !activa) return;
    const nuevoMensaje = {
      de: user.id,
      texto,
      hora: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    };
    const actualizadas = conversaciones.map((c) =>
      c.id === activa.id ? { ...c, mensajes: [...c.mensajes, nuevoMensaje] } : c
    );
    setConversaciones(actualizadas);
    setActiva(actualizadas.find((c) => c.id === activa.id));
    setTexto("");
  };

  const getUsuario = (id) => usuarios.find((u) => u.id === id);

  const seleccionarConv = (conv) => {
    setActiva(conv);
    setShowChat(true);
    setShowStudentsList(false);
  };

  const iniciarConversacion = (estudiante) => {
    // Buscar si ya existe conversación con este estudiante
    let convExistente = conversaciones.find(c => c.conUsuarioId === estudiante.id);
    
    if (!convExistente) {
      // Crear nueva conversación
      convExistente = {
        id: Date.now(),
        conUsuarioId: estudiante.id,
        mensajes: []
      };
      setConversaciones([...conversaciones, convExistente]);
    }
    
    seleccionarConv(convExistente);
  };

  const convsFiltradas = conversaciones.filter((conv) => {
    if (!search) return true;
    const otro = getUsuario(conv.conUsuarioId);
    return (otro?.nombre || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader title="Mensajes" subtitle="Comunicación con estudiantes y padres" icon={MessageSquare} color="#3b82f6" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}>
        <div className="flex h-full">

          {/* ── Conversation list ── */}
          <div className={`
            flex flex-col border-r border-gray-100 flex-shrink-0
            w-full md:w-72 lg:w-80
            ${showChat ? "hidden md:flex" : "flex"}
          `}>
            {/* Search and Filters */}
            <div className="p-3 border-b border-gray-100 space-y-2">
              <div className="">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversación..."
                  className="w-full pl-4 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50"
                />
              </div>
              
              {/* Filtro por curso */}
              <div className="flex gap-2">
                <select
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                >
                  <option value="">Todos los cursos</option>
                  {misCursos.map(curso => (
                    <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowStudentsList(!showStudentsList)}
                  className={`px-3 py-2 text-sm rounded-xl border transition flex items-center gap-1
                    ${showStudentsList 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  <Users size={14} />
                  Estudiantes
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {showStudentsList ? (
                // Lista de estudiantes
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
                    ESTUDIANTES ({estudiantesFiltrados.length})
                  </div>
                  {estudiantesFiltrados.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      No hay estudiantes en este curso
                    </div>
                  ) : (
                    estudiantesFiltrados.map((estudiante) => {
                      const curso = cursos.find(c => c.id === estudiante.cursoId);
                      return (
                        <button
                          key={estudiante.id}
                          onClick={() => iniciarConversacion(estudiante)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left
                            hover:bg-gray-50 transition border-0 cursor-pointer rounded-lg"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full
                            flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                            {estudiante.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {estudiante.nombre}
                            </p>
                            <p className="text-xs text-gray-400">
                              {curso?.nombre} · Promedio: {estudiante.promedio}
                            </p>
                          </div>
                          <div className="text-xs text-gray-300 flex-shrink-0">
                            <MessageSquare size={12} />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                // Lista de conversaciones
                <>
                  {convsFiltradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                      <MessageSquare size={24} className="mb-2 opacity-30" />
                      Sin conversaciones
                    </div>
                  ) : (
                    convsFiltradas.map((conv) => {
                      const otro = getUsuario(conv.conUsuarioId);
                      const ultimo = conv.mensajes[conv.mensajes.length - 1];
                      const isActive = activa?.id === conv.id;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => seleccionarConv(conv)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left
                            hover:bg-gray-50 transition border-0 cursor-pointer
                            ${isActive ? "bg-blue-50 border-r-2 border-blue-500" : "bg-white"}`}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full
                            flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                            {otro?.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>
                              {otro?.nombre}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{ultimo?.texto}</p>
                          </div>
                          <span className="text-xs text-gray-300 flex-shrink-0">{ultimo?.hora}</span>
                        </button>
                      );
                    })
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Chat panel ── */}
          <div className={`
            flex-1 flex flex-col min-w-0
            ${showChat ? "flex" : "hidden md:flex"}
          `}>
            {activa ? (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setShowChat(false)}
                    className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  {(() => {
                    const otro = getUsuario(activa.conUsuarioId);
                    return (
                      <>
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full
                          flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {otro?.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{otro?.nombre}</p>
                          <p className="text-xs text-green-500 font-medium">En línea</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/30">
                  {activa.mensajes.map((m, i) => {
                    const esMio = m.de === user.id;
                    return (
                      <div key={i} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                        <div className={`
                          max-w-[75%] sm:max-w-xs px-4 py-2.5 rounded-2xl text-sm shadow-sm
                          ${esMio
                            ? "bg-blue-600 text-white rounded-tr-sm"
                            : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                          }
                        `}>
                          <p className="leading-relaxed">{m.texto}</p>
                          <p className={`text-xs mt-1.5 ${esMio ? "text-blue-200" : "text-gray-400"}`}>
                            {m.hora}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100 bg-white">
                  <div className="flex gap-2 items-end">
                    <input
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviar()}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                        bg-gray-50 resize-none"
                    />
                    <button
                      onClick={enviar}
                      disabled={!texto.trim()}
                      className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center
                        hover:bg-blue-700 transition border-0 cursor-pointer flex-shrink-0
                        disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={28} className="opacity-40" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-500">Selecciona una conversación</p>
                  <p className="text-sm mt-1">para comenzar a chatear</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
