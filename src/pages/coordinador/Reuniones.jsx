import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, Calendar, Clock, Users, AlertCircle, FileText, Printer } from "lucide-react";
import { imprimirActaReunion } from "../../utils/formatos/formatoReunion";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";

const reunionesIniciales = [
  { id: 1, titulo: "Comité de evaluación - Período 2", fecha: "2025-05-15", hora: "14:00", lugar: "Sala de profesores", tipo: "evaluacion", participantes: "Coordinador, Docentes", estado: "programada", agenda: "1. Revisión de notas\n2. Estudiantes en riesgo\n3. Compromisos", acta: "" },
  { id: 2, titulo: "Seguimiento estudiantes en riesgo",  fecha: "2025-05-10", hora: "10:00", lugar: "Coordinación",      tipo: "seguimiento", participantes: "Coordinador, Directores de grupo", estado: "programada", agenda: "", acta: "" },
  { id: 3, titulo: "Reunión de padres - 7A",             fecha: "2025-04-25", hora: "16:00", lugar: "Aula 3",            tipo: "padres",      participantes: "Director de grupo, Padres de familia", estado: "realizada", agenda: "", acta: "Se informó sobre el rendimiento del grupo. Los padres se comprometieron a mayor acompañamiento." },
];

const tipoColor = {
  evaluacion: "bg-blue-100 text-blue-700",
  seguimiento: "bg-amber-100 text-amber-700",
  padres: "bg-green-100 text-green-700",
  general: "bg-gray-100 text-gray-600",
};

const FORM_INICIAL = { titulo: "", fecha: "", hora: "", lugar: "", tipo: "evaluacion", participantes: "", agenda: "" };

const REGLAS = {
  titulo:       { required: true, minLength: 5, label: "Título" },
  fecha:        { required: true, label: "Fecha" },
  hora:         { required: true, label: "Hora" },
  lugar:        { required: true, label: "Lugar" },
  participantes:{ required: true, label: "Participantes" },
};

export default function Reuniones() {
  const toast = useToast();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);

  const [reuniones, setReuniones] = useInstState("er_reuniones", reunionesIniciales);
  const [showModal, setShowModal] = useState(false);
  const [showActa, setShowActa]   = useState(null);
  const [acta, setActa]           = useState("");
  const [search, setSearch]       = useState("");
  const [filtroTipo, setFiltroTipo]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm]                 = useState(FORM_INICIAL);

  const f = (key, val) => { setForm(p => ({ ...p, [key]: val })); handleChange(key, val); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Corrige los errores antes de continuar"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    setReuniones([{ ...form, id: Date.now(), estado: "programada", acta: "" }, ...reuniones]);
    setShowModal(false);
    setForm(FORM_INICIAL);
    clearErrors();
    setSubmitting(false);
    toast.success(`Reunión "${form.titulo}" programada`, "Reunión creada");
  };

  const marcarRealizada = (id) => { setShowActa(id); setActa(""); };

  const confirmarRealizada = () => {
    setReuniones(reuniones.map(x => x.id === showActa ? { ...x, estado: "realizada", acta } : x));
    setShowActa(null);
    toast.success("Reunión marcada como realizada");
  };

  const cancelarReunion = (id) => {
    setReuniones(reuniones.filter(x => x.id !== id));
    toast.warning("Reunión cancelada");
  };

  const filtradas = reuniones.filter(r => {
    const matchSearch = !search ||
      r.titulo.toLowerCase().includes(search.toLowerCase()) ||
      r.lugar.toLowerCase().includes(search.toLowerCase()) ||
      r.participantes.toLowerCase().includes(search.toLowerCase());
    const matchTipo   = filtroTipo   ? r.tipo   === filtroTipo   : true;
    const matchEstado = filtroEstado ? r.estado === filtroEstado : true;
    return matchSearch && matchTipo && matchEstado;
  });

  const bulk = useBulkSelect(filtradas);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setReuniones);
    setConfirmDel(false);
    toast.success(`${count} reunión${count !== 1 ? "es" : ""} eliminada${count !== 1 ? "s" : ""}`);
  };

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
    ${errors[field] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reuniones Académicas"
        subtitle="Programa y gestiona reuniones institucionales"
        icon={Calendar}
        color="#3b82f6"
        action={
          <button onClick={() => { setShowModal(true); setForm(FORM_INICIAL); clearErrors(); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm shadow-blue-200">
            <Plus size={15} /> Nueva Reunión
          </button>
        }
      />

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar reunión..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
        </div>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="">Todos los tipos</option>
          <option value="evaluacion">Evaluación</option>
          <option value="seguimiento">Seguimiento</option>
          <option value="padres">Padres de familia</option>
          <option value="general">General</option>
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="">Todos los estados</option>
          <option value="programada">Programada</option>
          <option value="realizada">Realizada</option>
        </select>
      </div>
      <p className="text-xs text-gray-400">{filtradas.length} reunión(es)</p>

      {bulk.count > 0 && (
        <BulkBar count={bulk.count} label="reunión"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}

      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtradas.length} onToggleAll={bulk.toggleAll} label="reunión" />

      <div className="flex flex-col gap-4">
        {filtradas.map(r => (
          <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-semibold text-gray-800">{r.titulo}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar size={11} /> {r.fecha}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {r.hora}</span>
                  <span>📍 {r.lugar}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Checkbox checked={bulk.selected.has(r.id)} onChange={() => bulk.toggle(r.id)} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tipoColor[r.tipo] || tipoColor.general}`}>{r.tipo}</span>
                <Badge label={r.estado} variant={r.estado === "realizada" ? "success" : "info"} dot />
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <Users size={11} /><span>{r.participantes}</span>
            </div>

            {r.agenda && (
              <div className="bg-blue-50 rounded-xl p-3 mb-2 border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1"><FileText size={11} /> Agenda:</p>
                <p className="text-xs text-blue-700 whitespace-pre-line">{r.agenda}</p>
              </div>
            )}

            {r.acta && (
              <div className="bg-green-50 rounded-xl p-3 mb-2 border border-green-100">
                <p className="text-xs font-semibold text-green-800 mb-1">Acta / Compromisos:</p>
                <p className="text-xs text-green-700">{r.acta}</p>
              </div>
            )}

            {r.estado === "programada" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => marcarRealizada(r.id)}
                  className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 border-0 cursor-pointer font-medium">
                  Marcar realizada
                </button>
                <button onClick={() => cancelarReunion(r.id)}
                  className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 border-0 cursor-pointer font-medium">
                  Cancelar
                </button>
                <button onClick={() => imprimirActaReunion(r)}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 border-0 cursor-pointer font-medium flex items-center gap-1">
                  <Printer size={12}/> Imprimir acta
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal nueva reunión */}
      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Nueva Reunión Académica">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Título *</label>
            <input value={form.titulo} onChange={e => f("titulo", e.target.value)} onBlur={e => handleBlur("titulo", e.target.value)}
              placeholder="Comité de evaluación..." className={inputCls("titulo")} />
            {errors.titulo && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.titulo}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fecha *</label>
              <input type="date" value={form.fecha} min={new Date().toISOString().split("T")[0]}
                onChange={e => f("fecha", e.target.value)} onBlur={e => handleBlur("fecha", e.target.value)}
                className={inputCls("fecha")} />
              {errors.fecha && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.fecha}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Hora *</label>
              <input type="time" value={form.hora} onChange={e => f("hora", e.target.value)} onBlur={e => handleBlur("hora", e.target.value)}
                className={inputCls("hora")} />
              {errors.hora && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.hora}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Lugar *</label>
              <input value={form.lugar} onChange={e => f("lugar", e.target.value)} onBlur={e => handleBlur("lugar", e.target.value)}
                placeholder="Sala de profesores..." className={inputCls("lugar")} />
              {errors.lugar && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.lugar}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tipo</label>
              <select value={form.tipo} onChange={e => f("tipo", e.target.value)} className={inputCls("tipo")}>
                <option value="evaluacion">Evaluación</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="padres">Padres de familia</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Participantes *</label>
            <input value={form.participantes} onChange={e => f("participantes", e.target.value)} onBlur={e => handleBlur("participantes", e.target.value)}
              placeholder="Coordinador, Docentes..." className={inputCls("participantes")} />
            {errors.participantes && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.participantes}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Agenda (puntos a tratar)</label>
            <textarea value={form.agenda} onChange={e => f("agenda", e.target.value)}
              rows={3} placeholder="1. Revisión de notas&#10;2. Estudiantes en riesgo&#10;3. Compromisos"
              className={`${inputCls("agenda")} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); clearErrors(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
              {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</> : "Programar Reunión"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal acta */}
      <Modal open={!!showActa} onClose={() => setShowActa(null)} title="Registrar Acta de Reunión">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Acta / Compromisos adquiridos *</label>
            <textarea value={acta} onChange={e => setActa(e.target.value)}
              rows={5} placeholder="Describe los acuerdos, compromisos y conclusiones de la reunión..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowActa(null)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">
              Cancelar
            </button>
            <button onClick={confirmarRealizada} disabled={!acta.trim()}
              className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 border-0 cursor-pointer disabled:opacity-50 shadow-sm shadow-green-200">
              Guardar y marcar realizada
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="reunión"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </div>
  );
}
