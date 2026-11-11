import { useState } from "react";
import { Plus, AlertCircle, CheckCircle, Clock, User, BookOpen, FileText } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { solicitudesCambioNota, usuarios, materias } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

export default function SolicitudesCambioNotaEstudiante() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState(solicitudesCambioNota);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [form, setForm] = useState({
    materiaId: "",
    notaReportada: "",
    notaEsperada: "",
    motivo: ""
  });

  // Obtener materias del estudiante actual
  const misMaterias = materias.filter(m => m.cursoId === user?.cursoId);

  const handleCreate = (e) => {
    e.preventDefault();
    const nuevaSolicitud = {
      ...form,
      id: Date.now(),
      estudianteId: user.id,
      docenteId: misMaterias.find(m => m.id === Number(form.materiaId))?.docenteId,
      periodoId: 2,
      notaAnterior: form.notaReportada,
      notaNueva: form.notaEsperada,
      estado: "pendiente",
      fecha: new Date().toISOString().split('T')[0]
    };
    setSolicitudes([...solicitudes, nuevaSolicitud]);
    setShowModal(false);
    setForm({ materiaId: "", notaReportada: "", notaEsperada: "", motivo: "" });
  };

  const filtradas = solicitudes.filter(s => {
    // Solo mostrar solicitudes del estudiante actual
    if (s.estudianteId !== user?.id) return false;
    
    const docente = usuarios.find(u => u.id === s.docenteId);
    const materia = materias.find(m => m.id === s.materiaId);
    const matchSearch = !search ||
      (materia?.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.motivo || "").toLowerCase().includes(search.toLowerCase()) ||
      (docente?.nombre || "").toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado ? s.estado === filtroEstado : true;
    return matchSearch && matchEstado;
  });

  const getEstadoInfo = (estado) => {
    switch(estado) {
      case "pendiente":
        return { label: "Pendiente", variant: "warning", icon: Clock };
      case "aprobado":
        return { label: "Aprobado", variant: "success", icon: CheckCircle };
      case "rechazado":
        return { label: "Rechazado", variant: "danger", icon: AlertCircle };
      default:
        return { label: estado, variant: "gray", icon: Clock };
    }
  };

  return (
    <div>
      <PageHeader
        title="Solicitudes de Revisión de Nota"
        subtitle="Solicita revisión de notas que consideres incorrectas"
        icon={FileText}
        color="#f59e0b"
        action={
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer">
            <Plus size={16} /> Nueva Solicitud
          </button>
        }
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48">
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Buscar materia o motivo..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
          />
        </div>
        <select 
          value={filtroEstado} 
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="pendingiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>
      <p className="text-xs text-gray-400 mb-3">{filtradas.length} solicitud(es)</p>

      <div className="flex flex-col gap-4">
        {filtradas.map((s) => {
          const estadoInfo = getEstadoInfo(s.estado);
          const docente = usuarios.find(u => u.id === s.docenteId);
          const materia = materias.find(m => m.id === s.materiaId);
          
          return (
            <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{materia?.nombre}</p>
                  <p className="text-xs text-gray-500">Docente: {docente?.nombre}</p>
                </div>
                <Badge 
                  label={estadoInfo.label} 
                  variant={estadoInfo.variant}
                  icon={estadoInfo.icon}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-orange-800 mb-1">Nota reportada:</p>
                  <p className="text-lg font-bold text-orange-700">{s.notaAnterior}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-blue-800 mb-1">Nota esperada:</p>
                  <p className="text-lg font-bold text-blue-700">{s.notaNueva}</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-medium text-purple-800 mb-1">Motivo de la solicitud:</p>
                <p className="text-sm text-purple-700">{s.motivo}</p>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>📅 Fecha: {s.fecha}</span>
                <span>📊 Período: {s.periodoId}</span>
              </div>
            </div>
          );
        })}
        
        {filtradas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No tienes solicitudes de revisión</p>
            <p className="text-gray-400 text-sm mt-1">Crea tu primera solicitud usando el botón superior</p>
          </div>
        )}
      </div>

      {/* Modal para crear nueva solicitud */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva Solicitud de Revisión de Nota">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
            <select 
              required 
              value={form.materiaId} 
              onChange={(e) => setForm({ ...form, materiaId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar materia</option>
              {misMaterias.map(materia => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre} - {usuarios.find(u => u.id === materia.docenteId)?.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota reportada *</label>
              <input 
                required 
                type="number" 
                step="0.1" 
                min="0" 
                max="5"
                value={form.notaReportada} 
                onChange={(e) => setForm({ ...form, notaReportada: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota esperada *</label>
              <input 
                required 
                type="number" 
                step="0.1" 
                min="0" 
                max="5"
                value={form.notaEsperada} 
                onChange={(e) => setForm({ ...form, notaEsperada: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la solicitud *</label>
            <textarea 
              required 
              value={form.motivo} 
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              rows={3} 
              placeholder="Describe por qué consideras que la nota debe ser revisada..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
            <strong>Importante:</strong> Tu solicitud será revisada por el coordinador académico. 
            Proporciona información clara y detallada sobre por qué consideras que la nota debe ser modificada.
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>Nota:</strong> Esta es una solicitud de revisión. El cambio solo se aplicará si el coordinador 
            lo aprueba después de analizar tu caso.
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setShowModal(false)} 
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 border-0 cursor-pointer"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
