import { useState } from "react";
import { Send, ArrowLeft, MessageSquare, Users, Filter, UserCheck, BookOpen, Shield } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { usuarios, materias, cursos } from "../../data/mockData";

const conversacionesIniciales = [
  { id: 1, conUsuarioId: 3, mensajes: [
    { de: 3, texto: "Hola Sofía, necesito hablar contigo sobre tu rendimiento en matemáticas.", hora: "10:30" },
    { de: 10, texto: "Buenos días coordinador, ¿en qué puedo ayudar?", hora: "10:45" },
  ]},
  { id: 2, conUsuarioId: 5, mensajes: [
    { de: 5, texto: "Sofía, recuerda entregar el taller de álgebra mañana.", hora: "14:00" },
    { de: 10, texto: "Sí profe, lo entregaré a tiempo.", hora: "14:15" },
  ]},
  { id: 3, conUsuarioId: 4, mensajes: [
    { de: 4, texto: "Sofía, tu papá necesita traer el documento de matrícula.", hora: "09:00" },
    { de: 10, texto: "Ok, le digo a mi papá.", hora: "09:30" },
  ]},
];

export default function MensajesEstudiante() {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState(conversacionesIniciales);
  const [activa, setActiva] = useState(null);
  const [texto, setTexto] = useState("");
  const [search, setSearch] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  // Mobile: show chat panel when a conversation is selected
  const [showChat, setShowChat] = useState(false);

  // Obtener roles permitidos para enviar mensajes al estudiante
  const rolesPermitidos = ["COORDINADOR", "SECRETARIA", "DOCENTE"];
  
  // Obtener usuarios permitidos (solo roles permitidos)
  const usuariosPermitidos = usuarios.filter(u => 
    rolesPermitidos.includes(u.rol) && u.institucionId === user?.institucionId
  );

  // Filtrar conversaciones para mostrar solo usuarios permitidos
  const conversacionesPermitidas = conversaciones.filter(conv => {
    const otro = usuarios.find(u => u.id === conv.conUsuarioId);
    return otro && rolesPermitidos.includes(otro.rol);
  });

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

  const getRolLabel = (rol) => {
    const labels = {
      "COORDINADOR": "Coordinador",
      "SECRETARIA": "Secretaría", 
      "DOCENTE": "Docente"
    };
    return labels[rol] || rol;
  };

  const getRolIcon = (rol) => {
    const icons = {
      "COORDINADOR": UserCheck,
      "SECRETARIA": Shield,
      "DOCENTE": BookOpen
    };
    return icons[rol] || Users;
  };

  const getRolColor = (rol) => {
    const colors = {
      "COORDINADOR": "from-purple-500 to-purple-700",
      "SECRETARIA": "from-orange-500 to-orange-700", 
      "DOCENTE": "from-blue-500 to-blue-700"
    };
    return colors[rol] || "from-gray-500 to-gray-700";
  };

  const seleccionarConv = (conv) => {
    setActiva(conv);
    setShowChat(true);
  };

  const convsFiltradas = conversacionesPermitidas.filter((conv) => {
    if (!search && !filtroRol) return true;
    
    const otro = getUsuario(conv.conUsuarioId);
    const matchSearch = !search || (otro?.nombre || "").toLowerCase().includes(search.toLowerCase());
    const matchRol = !filtroRol || otro?.rol === filtroRol;
    
    return matchSearch && matchRol;
  });

  return (
    <div>
      <PageHeader title="Mensajes" subtitle="Comunicación con docentes y personal académico" />

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
                  placeholder="Buscar mensaje..."
                  className="w-full pl-4 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50"
                />
              </div>
              
              {/* Filtro por rol */}
              <div className="flex gap-2">
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                >
                  <option value="">Todos los remitentes</option>
                  <option value="COORDINADOR">Coordinador Académico</option>
                  <option value="SECRETARIA">Secretaría Académica</option>
                  <option value="DOCENTE">Docentes</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {convsFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                  <MessageSquare size={24} className="mb-2 opacity-30" />
                  {!filtroRol ? "Sin mensajes" : `Sin mensajes de ${getRolLabel(filtroRol)}`}
                </div>
              ) : (
                convsFiltradas.map((conv) => {
                  const otro = getUsuario(conv.conUsuarioId);
                  const ultimo = conv.mensajes[conv.mensajes.length - 1];
                  const isActive = activa?.id === conv.id;
                  const RolIcon = getRolIcon(otro?.rol);
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => seleccionarConv(conv)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left
                        hover:bg-gray-50 transition border-0 cursor-pointer
                        ${isActive ? "bg-blue-50 border-r-2 border-blue-500" : "bg-white"}`}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${getRolColor(otro?.rol)} rounded-full
                        flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                        {otro?.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>
                          {otro?.nombre}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <RolIcon size={10} className="text-gray-400" />
                          <p className="text-xs text-gray-400">
                            {getRolLabel(otro?.rol)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{ultimo?.texto}</p>
                      </div>
                      <span className="text-xs text-gray-300 flex-shrink-0">{ultimo?.hora}</span>
                    </button>
                  );
                })
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
                    className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 border-0 cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  
                  <div className="w-10 h-10 bg-gradient-to-br bg-gray-200 rounded-full
                    flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">
                    {getUsuario(activa.conUsuarioId)?.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {getUsuario(activa.conUsuarioId)?.nombre}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getRolLabel(getUsuario(activa.conUsuarioId)?.rol)}
                    </p>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                  {activa.mensajes.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.de === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                          msg.de === user.id
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                        }`}
                      >
                        {msg.texto}
                        <div className={`text-xs mt-1 ${
                          msg.de === user.id ? "text-blue-100" : "text-gray-400"
                        }`}>
                          {msg.hora}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50"
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && enviar()}
                    />
                    <button
                      onClick={enviar}
                      disabled={!texto.trim()}
                      className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                        disabled:opacity-50 disabled:cursor-not-allowed transition border-0 cursor-pointer"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Selecciona una conversación</p>
                  <p className="text-xs mt-1">para empezar a chatear</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
