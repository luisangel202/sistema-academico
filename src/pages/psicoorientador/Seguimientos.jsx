import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, Lock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { usuarios } from "../../data/mockData";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";

const seguimientosIniciales = [
  { id: 1, estudianteId: 10, fecha: "2025-05-05", descripcion: "Se observa desmotivación. Manifiesta dificultades en casa. Se recomienda apoyo familiar.", privacidad: "confidencial", avance: "inicial" },
  { id: 2, estudianteId: 10, fecha: "2025-04-30", descripcion: "Primera sesión. Estudiante receptiva. Se identifican factores de riesgo académico.", privacidad: "academico_restringido", avance: "inicial" },
  { id: 3, estudianteId: 9, fecha: "2025-05-06", descripcion: "Seguimiento por conflicto grupal. Situación en proceso de resolución.", privacidad: "academico_restringido", avance: "en_proceso" },
];

const avanceColor = { inicial: "bg-yellow-100 text-yellow-700", en_proceso: "bg-blue-100 text-blue-700", avanzado: "bg-green-100 text-green-700", cerrado: "bg-gray-100 text-gray-600" };
const privacidadLabel = { publico: "Público", academico_restringido: "Académico restringido", confidencial: "Confidencial" };

export default function Seguimientos() {
  const [seguimientos, setSeguimientos] = useInstState("er_seguimientos", seguimientosIniciales);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ estudianteId: "", descripcion: "", privacidad: "academico_restringido", avance: "inicial" });

  const estudiantes = usuarios.filter((u) => u.rol === "ESTUDIANTE");

  const handleCreate = (e) => {
    e.preventDefault();
    setSeguimientos([{
      ...form,
      id: Date.now(),
      estudianteId: Number(form.estudianteId),
      fecha: new Date().toISOString().split("T")[0],
    }, ...seguimientos]);
    setShowModal(false);
    setForm({ estudianteId: "", descripcion: "", privacidad: "academico_restringido", avance: "inicial" });
  };

  const bulk = useBulkSelect(seguimientos);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setSeguimientos);
    setConfirmDel(false);
  };

  return (
    <div>
      <PageHeader
        title="Seguimientos"
        subtitle="Registro de seguimiento psicosocial por estudiante"
        action={
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer">
            <Plus size={16} /> Nuevo Seguimiento
          </button>
        }
      />

      {bulk.count > 0 && (
        <BulkBar count={bulk.count} label="seguimiento"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}

      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={seguimientos.length} onToggleAll={bulk.toggleAll} label="seguimiento" />

      <div className="flex flex-col gap-4">
        {seguimientos.map((s) => {
          const est = estudiantes.find((u) => u.id === s.estudianteId);
          return (
            <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">{est?.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{est?.nombre}</p>
                    <p className="text-xs text-gray-400">{s.fecha}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={bulk.selected.has(s.id)} onChange={() => bulk.toggle(s.id)} />
                  {s.privacidad === "confidencial" && <Lock size={13} className="text-orange-500" />}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${avanceColor[s.avance]}`}>{s.avance.replace("_", " ")}</span>
                  <span className="text-xs text-gray-400">{privacidadLabel[s.privacidad]}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-orange-50 rounded-xl p-3">{s.descripcion}</p>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo Seguimiento">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del seguimiento *</label>
            <textarea required value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avance</label>
              <select value={form.avance} onChange={(e) => setForm({ ...form, avance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="inicial">Inicial</option>
                <option value="en_proceso">En proceso</option>
                <option value="avanzado">Avanzado</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Privacidad</label>
              <select value={form.privacidad} onChange={(e) => setForm({ ...form, privacidad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="publico">Público</option>
                <option value="academico_restringido">Académico restringido</option>
                <option value="confidencial">Confidencial</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Cancelar</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 border-0 cursor-pointer">Registrar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="seguimiento"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </div>
  );
}
