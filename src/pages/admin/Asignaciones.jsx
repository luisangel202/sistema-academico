import { useState } from "react";
import { Plus, UserCheck, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import { materias, cursos, usuarios } from "../../data/mockData";

const TIPOS_ASIGNACION = ["Titular","Suplente","Temporal","Apoyo"];

const FORM_INICIAL = { materiaId: 1, docenteId: "", tipoAsignacion: "Titular", fechaInicio: "", observaciones: "" };

const REGLAS = {
  docenteId:   { required: true, label: "Docente" },
  fechaInicio: { required: true, label: "Fecha de inicio" },
};

export default function Asignaciones() {
  const toast = useToast();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);

  const [asignaciones, setAsignaciones] = useState(materias);
  const [showModal, setShowModal]       = useState(false);
  const [search, setSearch]             = useState("");
  const [filtroCurso, setFiltroCurso]   = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm]                 = useState(FORM_INICIAL);

  const docentes = usuarios.filter(u => u.rol === "DOCENTE");

  const f = (key, val) => { setForm(p => ({ ...p, [key]: val })); handleChange(key, val); };

  const handleAsignar = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Corrige los errores antes de continuar"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    const materia = asignaciones.find(m => m.id === Number(form.materiaId));
    const docente = docentes.find(d => d.id === Number(form.docenteId));
    setAsignaciones(asignaciones.map(m =>
      m.id === Number(form.materiaId) ? { ...m, docenteId: Number(form.docenteId), tipoAsignacion: form.tipoAsignacion, fechaAsignacion: form.fechaInicio } : m
    ));
    setShowModal(false);
    setForm(FORM_INICIAL);
    clearErrors();
    setSubmitting(false);
    toast.success(`${docente?.nombre} asignado a ${materia?.nombre}`, "Asignación realizada");
  };

  const docentesFiltrados = docentes.filter(doc => {
    const misAsignaciones = asignaciones.filter(a => a.docenteId === doc.id);
    const matchSearch = !search || doc.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCurso  = filtroCurso ? misAsignaciones.some(a => a.cursoId === Number(filtroCurso)) : true;
    return matchSearch && (matchCurso || (misAsignaciones.length === 0 && !filtroCurso));
  });

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
    ${errors[field] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Asignaciones Docentes"
        subtitle="Asigna docentes a materias y cursos"
        icon={UserCheck}
        color="#10b981"
        action={
          <button onClick={() => { setShowModal(true); setForm(FORM_INICIAL); clearErrors(); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm shadow-blue-200">
            <Plus size={15} /> Nueva Asignación
          </button>
        }
      />

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar docente..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
        </div>
        <select value={filtroCurso} onChange={e => setFiltroCurso(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="">Todos los cursos</option>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <p className="text-xs text-gray-400">{docentesFiltrados.length} docente(s)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docentesFiltrados.map(doc => {
          const misAsignaciones = asignaciones.filter(a => a.docenteId === doc.id);
          return (
            <div key={doc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">{doc.avatar}</div>
                <div>
                  <p className="font-semibold text-gray-800">{doc.nombre}</p>
                  <p className="text-xs text-gray-400">{misAsignaciones.length} materia(s) asignada(s)</p>
                </div>
              </div>
              {misAsignaciones.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Sin materias asignadas</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {misAsignaciones.map(m => {
                    const curso = cursos.find(c => c.id === m.cursoId);
                    return (
                      <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{m.nombre}</p>
                          <p className="text-xs text-gray-400">{curso?.nombre} · {m.intensidad}h/sem {m.tipoAsignacion ? `· ${m.tipoAsignacion}` : ""}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{m.codigo}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Asignar Docente a Materia">
        <form onSubmit={handleAsignar} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Materia *</label>
            <select value={form.materiaId} onChange={e => f("materiaId", e.target.value)} className={inputCls("materiaId")}>
              {asignaciones.map(m => {
                const curso = cursos.find(c => c.id === m.cursoId);
                return <option key={m.id} value={m.id}>{m.nombre} — {curso?.nombre}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Docente *</label>
            <select value={form.docenteId} onChange={e => f("docenteId", e.target.value)} onBlur={e => handleBlur("docenteId", e.target.value)}
              className={inputCls("docenteId")}>
              <option value="">Seleccionar docente</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            {errors.docenteId && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.docenteId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tipo de asignación</label>
              <select value={form.tipoAsignacion} onChange={e => f("tipoAsignacion", e.target.value)} className={inputCls("tipoAsignacion")}>
                {TIPOS_ASIGNACION.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fecha de inicio *</label>
              <input type="date" value={form.fechaInicio} onChange={e => f("fechaInicio", e.target.value)} onBlur={e => handleBlur("fechaInicio", e.target.value)}
                className={inputCls("fechaInicio")} />
              {errors.fechaInicio && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.fechaInicio}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Observaciones</label>
            <textarea value={form.observaciones} onChange={e => f("observaciones", e.target.value)}
              rows={2} placeholder="Notas adicionales sobre la asignación..."
              className={`${inputCls("observaciones")} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); clearErrors(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">Cancelar</button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
              {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</> : "Asignar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
