import { useState } from "react";
import { Plus, CheckCircle, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { usuarios } from "../../data/mockData";

const planesIniciales = [
  { id: 1, estudianteId: 10, objetivo: "Mejorar autoestima y motivación académica", estrategias: "Sesiones semanales, técnicas de relajación, metas cortas", responsable: "Psicoorientadora + Docente director", fechaInicio: "2025-05-06", fechaFin: "2025-06-06", estado: "activo", progreso: 20 },
  { id: 2, estudianteId: 9, objetivo: "Resolución de conflictos con pares", estrategias: "Mediación grupal, talleres de convivencia, seguimiento semanal", responsable: "Psicoorientadora + Director de grupo", fechaInicio: "2025-04-28", fechaFin: "2025-05-28", estado: "activo", progreso: 60 },
];

export default function PlanesApoyo() {
  const [planes, setPlanes] = useState(planesIniciales);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ estudianteId: "", objetivo: "", estrategias: "", responsable: "", fechaInicio: "", fechaFin: "" });

  const estudiantes = usuarios.filter((u) => u.rol === "ESTUDIANTE");

  const handleCreate = (e) => {
    e.preventDefault();
    setPlanes([{ ...form, id: Date.now(), estudianteId: Number(form.estudianteId), estado: "activo", progreso: 0 }, ...planes]);
    setShowModal(false);
    setForm({ estudianteId: "", objetivo: "", estrategias: "", responsable: "", fechaInicio: "", fechaFin: "" });
  };

  return (
    <div>
      <PageHeader
        title="Planes de Apoyo"
        subtitle="Planes de intervención psicosocial individualizados"
        action={
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer">
            <Plus size={16} /> Nuevo Plan
          </button>
        }
      />

      <div className="flex flex-col gap-4">
        {planes.map((p) => {
          const est = estudiantes.find((u) => u.id === p.estudianteId);
          return (
            <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">{est?.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{est?.nombre}</p>
                    <p className="text-xs text-gray-400">{p.fechaInicio} → {p.fechaFin}</p>
                  </div>
                </div>
                <Badge label={p.estado} variant={p.estado === "activo" ? "success" : "gray"} />
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Objetivo:</p>
                <p className="text-sm text-gray-700">{p.objetivo}</p>
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Estrategias:</p>
                <p className="text-sm text-gray-600">{p.estrategias}</p>
              </div>
              <div className="mb-3 text-xs text-gray-500">
                👤 Responsable: {p.responsable}
              </div>

              {/* Barra de progreso */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progreso</span>
                  <span className="text-xs font-semibold text-gray-700">{p.progreso}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${p.progreso >= 70 ? "bg-green-500" : p.progreso >= 30 ? "bg-blue-500" : "bg-yellow-500"}`}
                    style={{ width: `${p.progreso}%` }} />
                </div>
              </div>

              {p.estado === "activo" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setPlanes(planes.map(x => x.id === p.id ? { ...x, progreso: Math.min(100, x.progreso + 20) } : x))}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 border-0 cursor-pointer">
                    + Avance 20%
                  </button>
                  <button onClick={() => setPlanes(planes.map(x => x.id === p.id ? { ...x, estado: "completado", progreso: 100 } : x))}
                    className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 border-0 cursor-pointer flex items-center gap-1">
                    <CheckCircle size={12} /> Completar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo Plan de Apoyo" size="lg">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
            <select required value={form.estudianteId} onChange={(e) => setForm({ ...form, estudianteId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar estudiante</option>
              {estudiantes.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo *</label>
            <input required value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estrategias *</label>
            <textarea required value={form.estrategias} onChange={(e) => setForm({ ...form, estrategias: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
            <input value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })}
              placeholder="Psicoorientadora + Docente..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
              <input required type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
              <input required type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Cancelar</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 border-0 cursor-pointer">Crear Plan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
