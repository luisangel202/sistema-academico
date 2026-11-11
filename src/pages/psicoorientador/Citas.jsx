import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, Calendar, Clock, CheckCircle, Printer } from "lucide-react";
import { imprimirInformeCita, imprimirListadoCitas } from "../../utils/formatos/formatoCita";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { usuarios } from "../../data/mockData";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";

const citasIniciales = [
  { id: 1, estudianteId: 10, fecha: "2025-05-09", hora: "09:00", motivo: "Seguimiento bajo rendimiento", estado: "programada", tipo: "seguimiento" },
  { id: 2, estudianteId: 9, fecha: "2025-05-12", hora: "10:30", motivo: "Primera atención - conflicto grupal", estado: "programada", tipo: "primera_atencion" },
  { id: 3, estudianteId: 10, fecha: "2025-04-30", hora: "09:00", motivo: "Evaluación inicial", estado: "realizada", tipo: "evaluacion" },
];

const tipoLabel = { seguimiento: "Seguimiento", primera_atencion: "Primera atención", evaluacion: "Evaluación", cierre: "Cierre de caso" };
const tipoColor = { seguimiento: "bg-blue-100 text-blue-700", primera_atencion: "bg-yellow-100 text-yellow-700", evaluacion: "bg-purple-100 text-purple-700", cierre: "bg-green-100 text-green-700" };

export default function Citas() {
  const [citas, setCitas] = useInstState("er_citas_psico", citasIniciales);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ estudianteId: "", fecha: "", hora: "", motivo: "", tipo: "seguimiento" });

  const estudiantes = usuarios.filter((u) => u.rol === "ESTUDIANTE");

  const handleCreate = (e) => {
    e.preventDefault();
    setCitas([{ ...form, id: Date.now(), estudianteId: Number(form.estudianteId), estado: "programada" }, ...citas]);
    setShowModal(false);
    setForm({ estudianteId: "", fecha: "", hora: "", motivo: "", tipo: "seguimiento" });
  };

  const marcarRealizada = (id) => setCitas(citas.map((c) => c.id === id ? { ...c, estado: "realizada" } : c));

  const bulk = useBulkSelect(citas);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setCitas);
    setConfirmDel(false);
  };

  return (
    <div>
      <PageHeader
        title="Citas"
        subtitle="Agenda de atención psicosocial"
        action={
          <div className="flex gap-2">
            <button onClick={() => imprimirListadoCitas(citas, estudiantes)}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition border border-gray-200 cursor-pointer">
              <Printer size={15}/> Imprimir agenda
            </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer">
            <Plus size={16} /> Agendar Cita
          </button>
          </div>
        }
      />

      {bulk.count > 0 && (
        <BulkBar count={bulk.count} label="cita"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}

      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={citas.length} onToggleAll={bulk.toggleAll} label="cita" />

      <div className="flex flex-col gap-4">
        {citas.map((c) => {
          const est = estudiantes.find((u) => u.id === c.estudianteId);
          return (
            <div key={c.id} className={`bg-white rounded-xl p-5 shadow-sm border ${c.estado === "realizada" ? "border-gray-100 opacity-70" : "border-gray-100"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">{est?.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{est?.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {c.fecha}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {c.hora}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={bulk.selected.has(c.id)} onChange={() => bulk.toggle(c.id)} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoColor[c.tipo] || "bg-gray-100 text-gray-600"}`}>{tipoLabel[c.tipo]}</span>
                  <Badge label={c.estado} variant={c.estado === "realizada" ? "success" : "info"} />
                </div>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{c.motivo}</p>
              {c.estado === "programada" && (
                <button onClick={() => marcarRealizada(c.id)}
                  className="mt-3 flex items-center gap-1 text-xs text-green-600 hover:text-green-800 bg-transparent border-0 cursor-pointer">
                  <CheckCircle size={13} /> Marcar como realizada
                </button>
              )}
              <button onClick={() => { const est = estudiantes.find(u => u.id === c.estudianteId); imprimirInformeCita(c, est); }}
                className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-transparent border-0 cursor-pointer">
                <Printer size={13} /> Imprimir informe
              </button>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Agendar Cita">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
            <select required value={form.estudianteId} onChange={(e) => setForm({ ...form, estudianteId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar estudiante</option>
              {estudiantes.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input required type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
              <input required type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(tipoLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
            <textarea required value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Cancelar</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 border-0 cursor-pointer">Agendar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="cita"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </div>
  );
}
