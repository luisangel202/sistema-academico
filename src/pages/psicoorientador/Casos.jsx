import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, Lock, AlertCircle, Shield, Heart } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import { usuarios } from "../../data/mockData";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";

const casosIniciales = [
  { id: 1, estudianteId: 10, motivo: "Bajo rendimiento académico y desmotivación", tipo: "academico", privacidad: "academico_restringido", estado: "abierto", fecha: "2025-05-05", seguimientos: 2, fuenteRemision: "docente", nivelRiesgo: "medio", objetivos: "Mejorar motivación y hábitos de estudio", consentimiento: true },
  { id: 2, estudianteId: 9,  motivo: "Conflicto con compañeros de clase",           tipo: "convivencia", privacidad: "confidencial",          estado: "abierto", fecha: "2025-04-28", seguimientos: 1, fuenteRemision: "director", nivelRiesgo: "bajo", objetivos: "Desarrollar habilidades de resolución de conflictos", consentimiento: true },
];

const privacidadLabels = {
  publico:              "Público institucional",
  academico_restringido:"Académico restringido",
  confidencial:         "Confidencial",
};

const riesgoColor = {
  bajo:  "bg-green-100 text-green-700",
  medio: "bg-amber-100 text-amber-700",
  alto:  "bg-red-100 text-red-700",
};

const FORM_INICIAL = {
  estudianteId: "", motivo: "", tipo: "academico", privacidad: "academico_restringido",
  fuenteRemision: "docente", nivelRiesgo: "bajo", objetivos: "", consentimiento: false,
};

const REGLAS = {
  estudianteId: { required: true, label: "Estudiante" },
  motivo:       { required: true, minLength: 20, label: "Motivo" },
  objetivos:    { required: true, minLength: 10, label: "Objetivos" },
};

export default function Casos() {
  const toast = useToast();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);

  const [casos, setCasos]           = useInstState("er_casos", casosIniciales);
  const [showModal, setShowModal]   = useState(false);
  const [showSeguimiento, setShowSeguimiento] = useState(null);
  const [notaSeguimiento, setNotaSeguimiento] = useState("");
  const [search, setSearch]         = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState(FORM_INICIAL);

  const estudiantes = usuarios.filter(u => u.rol === "ESTUDIANTE");

  const f = (key, val) => { setForm(p => ({ ...p, [key]: val })); handleChange(key, val); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.consentimiento) { toast.error("Debes confirmar el consentimiento informado del acudiente"); return; }
    if (!validate(form)) { toast.error("Corrige los errores antes de continuar"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    const est = estudiantes.find(u => u.id === Number(form.estudianteId));
    const nuevo = { ...form, id: Date.now(), estado: "abierto", fecha: new Date().toISOString().split("T")[0], seguimientos: 0, estudianteId: Number(form.estudianteId) };
    setCasos([...casos, nuevo]);
    setShowModal(false);
    setForm(FORM_INICIAL);
    clearErrors();
    setSubmitting(false);
    toast.success(`Caso abierto para ${est?.nombre}`, "Caso registrado");
  };

  const agregarSeguimiento = (id) => { setShowSeguimiento(id); setNotaSeguimiento(""); };

  const confirmarSeguimiento = () => {
    setCasos(casos.map(x => x.id === showSeguimiento ? { ...x, seguimientos: x.seguimientos + 1 } : x));
    setShowSeguimiento(null);
    toast.success("Seguimiento registrado");
  };

  const cerrarCaso = (id) => {
    setCasos(casos.map(x => x.id === id ? { ...x, estado: "cerrado" } : x));
    toast.info("Caso cerrado");
  };

  const filtrados = casos.filter(c => {
    const est = usuarios.find(u => u.id === c.estudianteId);
    const matchSearch = !search ||
      (est?.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      c.motivo.toLowerCase().includes(search.toLowerCase());
    const matchTipo   = filtroTipo   ? c.tipo   === filtroTipo   : true;
    const matchEstado = filtroEstado ? c.estado === filtroEstado : true;
    return matchSearch && matchTipo && matchEstado;
  });

  const bulk = useBulkSelect(filtrados);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setCasos);
    setConfirmDel(false);
    toast.success(`${count} caso${count !== 1 ? "s" : ""} eliminado${count !== 1 ? "s" : ""}`);
  };

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
    ${errors[field] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Casos Asignados"
        subtitle="Atención psicosocial y seguimiento estudiantil"
        icon={Heart}
        color="#f97316"
        action={
          <button onClick={() => { setShowModal(true); setForm(FORM_INICIAL); clearErrors(); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm shadow-blue-200">
            <Plus size={15} /> Nuevo Caso
          </button>
        }
      />

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar estudiante o motivo..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
        </div>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="">Todos los tipos</option>
          <option value="academico">Académico</option>
          <option value="convivencia">Convivencia</option>
          <option value="emocional">Emocional</option>
          <option value="familiar">Familiar</option>
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="">Todos los estados</option>
          <option value="abierto">Abierto</option>
          <option value="cerrado">Cerrado</option>
        </select>
      </div>
      <p className="text-xs text-gray-400">{filtrados.length} caso(s)</p>

      {bulk.count > 0 && (
        <BulkBar count={bulk.count} label="caso"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}

      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtrados.length} onToggleAll={bulk.toggleAll} label="caso" />

      <div className="flex flex-col gap-4">
        {filtrados.map(c => {
          const est = usuarios.find(u => u.id === c.estudianteId);
          return (
            <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">{est?.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{est?.nombre}</p>
                    <p className="text-xs text-gray-400">Abierto: {c.fecha} · {c.seguimientos} seguimiento(s)</p>
                    <p className="text-xs text-gray-400 capitalize">Remitido por: {c.fuenteRemision}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={bulk.selected.has(c.id)} onChange={() => bulk.toggle(c.id)} />
                  {c.privacidad === "confidencial" && <Lock size={13} className="text-orange-500" />}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${riesgoColor[c.nivelRiesgo] || riesgoColor.bajo}`}>
                    Riesgo {c.nivelRiesgo}
                  </span>
                  <Badge label={c.estado} variant={c.estado === "abierto" ? "warning" : "success"} dot />
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-3 mb-3 border border-orange-100">
                <p className="text-xs font-semibold text-orange-800 mb-1">Motivo de atención:</p>
                <p className="text-sm text-orange-700">{c.motivo}</p>
              </div>

              {c.objetivos && (
                <div className="bg-blue-50 rounded-xl p-3 mb-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Objetivos de intervención:</p>
                  <p className="text-xs text-blue-700">{c.objetivos}</p>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs mb-3">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{c.tipo}</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{privacidadLabels[c.privacidad]}</span>
              </div>

              {c.estado === "abierto" && (
                <div className="flex gap-2">
                  <button onClick={() => agregarSeguimiento(c.id)}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 border-0 cursor-pointer font-medium">
                    + Seguimiento
                  </button>
                  <button onClick={() => cerrarCaso(c.id)}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 border-0 cursor-pointer font-medium">
                    Cerrar caso
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal nuevo caso */}
      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Abrir Nuevo Caso">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Estudiante *</label>
            <select value={form.estudianteId} onChange={e => f("estudianteId", e.target.value)} onBlur={e => handleBlur("estudianteId", e.target.value)}
              className={inputCls("estudianteId")}>
              <option value="">Seleccionar estudiante</option>
              {estudiantes.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            {errors.estudianteId && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.estudianteId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Motivo de atención *</label>
            <textarea value={form.motivo} onChange={e => f("motivo", e.target.value)} onBlur={e => handleBlur("motivo", e.target.value)}
              rows={3} placeholder="Describe detalladamente el motivo (mínimo 20 caracteres)..."
              className={`${inputCls("motivo")} resize-none`} />
            {errors.motivo && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.motivo}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tipo</label>
              <select value={form.tipo} onChange={e => f("tipo", e.target.value)} className={inputCls("tipo")}>
                <option value="academico">Académico</option>
                <option value="convivencia">Convivencia</option>
                <option value="emocional">Emocional</option>
                <option value="familiar">Familiar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nivel de riesgo</label>
              <select value={form.nivelRiesgo} onChange={e => f("nivelRiesgo", e.target.value)} className={inputCls("nivelRiesgo")}>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fuente de remisión</label>
              <select value={form.fuenteRemision} onChange={e => f("fuenteRemision", e.target.value)} className={inputCls("fuenteRemision")}>
                <option value="docente">Docente</option>
                <option value="director">Director de grupo</option>
                <option value="coordinador">Coordinador</option>
                <option value="acudiente">Acudiente</option>
                <option value="autoremision">Autoremisión</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Privacidad</label>
              <select value={form.privacidad} onChange={e => f("privacidad", e.target.value)} className={inputCls("privacidad")}>
                <option value="publico">Público institucional</option>
                <option value="academico_restringido">Académico restringido</option>
                <option value="confidencial">Confidencial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Objetivos de intervención *</label>
            <textarea value={form.objetivos} onChange={e => f("objetivos", e.target.value)} onBlur={e => handleBlur("objetivos", e.target.value)}
              rows={2} placeholder="¿Qué se espera lograr con este caso?"
              className={`${inputCls("objetivos")} resize-none`} />
            {errors.objetivos && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.objetivos}</p>}
          </div>

          {/* Consentimiento informado */}
          <div className={`flex items-start gap-3 p-3 rounded-xl border ${form.consentimiento ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
            <input type="checkbox" id="consentimiento" checked={form.consentimiento}
              onChange={e => f("consentimiento", e.target.checked)}
              className="mt-0.5 w-4 h-4 cursor-pointer accent-green-600" />
            <label htmlFor="consentimiento" className="text-xs text-gray-700 cursor-pointer leading-relaxed">
              <span className="font-semibold flex items-center gap-1 mb-0.5"><Shield size={11} /> Consentimiento informado</span>
              Confirmo que el acudiente ha sido informado y ha dado su consentimiento para la atención psicosocial del estudiante.
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); clearErrors(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
              {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</> : "Abrir Caso"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal seguimiento */}
      <Modal open={!!showSeguimiento} onClose={() => setShowSeguimiento(null)} title="Registrar Seguimiento">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nota de seguimiento *</label>
            <textarea value={notaSeguimiento} onChange={e => setNotaSeguimiento(e.target.value)}
              rows={4} placeholder="Describe el avance, observaciones y próximos pasos..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowSeguimiento(null)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">
              Cancelar
            </button>
            <button onClick={confirmarSeguimiento} disabled={!notaSeguimiento.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-50 shadow-sm shadow-blue-200">
              Guardar seguimiento
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="caso"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </div>
  );
}
