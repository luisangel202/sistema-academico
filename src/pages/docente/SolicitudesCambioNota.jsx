import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, AlertCircle, CheckCircle, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { solicitudesCambioNota, usuarios, materias } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";

export default function SolicitudesCambioNotaDocente() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useInstState("er_solicitudes_nota", solicitudesCambioNota);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [form, setForm] = useState({
    estudianteId: "",
    materiaId: "",
    notaAnterior: "",
    notaNueva: "",
    motivo: ""
  });

  // Obtener materias del docente actual
  const misMaterias = materias.filter(m => m.docenteId === user?.id);
  
  // Obtener estudiantes de las materias del docente
  const estudiantesDeMisMaterias = usuarios.filter(u => 
    u.rol === "ESTUDIANTE" && 
    misMaterias.some(m => m.cursoId === u.cursoId)
  );

  const handleCreate = (e) => {
    e.preventDefault();
    const nuevaSolicitud = {
      ...form,
      id: Date.now(),
      docenteId: user.id,
      periodoId: 2,
      estado: "pendiente",
      fecha: new Date().toISOString().split('T')[0]
    };
    setSolicitudes([...solicitudes, nuevaSolicitud]);
    setShowModal(false);
    setForm({ estudianteId: "", materiaId: "", notaAnterior: "", notaNueva: "", motivo: "" });
  };

  const filtradas = solicitudes.filter(s => {
    // Solo mostrar solicitudes del docente actual
    if (s.docenteId !== user?.id) return false;
    
    const estudiante = usuarios.find(u => u.id === s.estudianteId);
    const materia = materias.find(m => m.id === s.materiaId);
    const matchSearch = !search ||
      (estudiante?.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      (materia?.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.motivo || "").toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado ? s.estado === filtroEstado : true;
    return matchSearch && matchEstado;
  });

  const bulk = useBulkSelect(filtradas);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setSolicitudes);
    setConfirmDel(false);
  };

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
        title="Solicitudes de Cambio de Nota"
        subtitle="Solicita correcciones de notas para tus estudiantes"
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
            placeholder="Buscar estudiante, materia o motivo..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
          />
        </div>
        <select 
          value={filtroEstado} 
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>
      <p className="text-xs text-gray-400 mb-3">{filtradas.length} solicitud(es)</p>

      {bulk.count > 0 && (
        <BulkBar count={bulk.count} label="solicitud"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}

      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtradas.length} onToggleAll={bulk.toggleAll} label="solicitud" />

      <div className="flex flex-col gap-4">
        {filtradas.map((s) => {
          const estadoInfo = getEstadoInfo(s.estado);
          const estudiante = usuarios.find(u => u.id === s.estudianteId);
          const materia = materias.find(m => m.id === s.materiaId);
          
          return (
            <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{estudiante?.nombre}</p>
                  <p className="text-xs text-gray-500">Materia: {materia?.nombre}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={bulk.selected.has(s.id)} onChange={() => bulk.toggle(s.id)} />
                  <Badge 
                    label={estadoInfo.label} 
                    variant={estadoInfo.variant}
                    icon={estadoInfo.icon}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-red-800 mb-1">Nota anterior:</p>
                  <p className="text-lg font-bold text-red-700">{s.notaAnterior}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-green-800 mb-1">Nota solicitada:</p>
                  <p className="text-lg font-bold text-green-700">{s.notaNueva}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-medium text-blue-800 mb-1">Motivo del cambio:</p>
                <p className="text-sm text-blue-700">{s.motivo}</p>
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
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No tienes solicitudes de cambio de nota</p>
            <p className="text-gray-400 text-sm mt-1">Crea tu primera solicitud usando el botón superior</p>
          </div>
        )}
      </div>

      {/* Modal para crear nueva solicitud */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva Solicitud de Cambio de Nota">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
              <select 
                required 
                value={form.estudianteId} 
                onChange={(e) => setForm({ ...form, estudianteId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar estudiante</option>
                {estudiantesDeMisMaterias.map(est => (
                  <option key={est.id} value={est.id}>{est.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
              <select 
                required 
                value={form.materiaId} 
                onChange={(e) => setForm({ ...form, materiaId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar materia</option>
                {misMaterias.map(materia => (
                  <option key={materia.id} value={materia.id}>{materia.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota anterior *</label>
              <input 
                required 
                type="number" 
                step="0.1" 
                min="0" 
                max="5"
                value={form.notaAnterior} 
                onChange={(e) => setForm({ ...form, notaAnterior: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva nota *</label>
              <input 
                required 
                type="number" 
                step="0.1" 
                min="0" 
                max="5"
                value={form.notaNueva} 
                onChange={(e) => setForm({ ...form, notaNueva: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del cambio *</label>
            <textarea 
              required 
              value={form.motivo} 
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              rows={3} 
              placeholder="Describe el motivo por el cual solicitas este cambio de nota..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>Importante:</strong> Las solicitudes de cambio de nota serán revisadas por el coordinador académico. 
            El cambio solo se aplicará si es aprobado.
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

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="solicitud"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </div>
  );
}
