import { useState } from "react";
import { Plus, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { useFormValidation } from "../hooks/useFormValidation";
import { cursos, materias, usuarios } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

const HORAS = ["7:00","8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"];
const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes"];

const COLORES = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-teal-100 text-teal-800 border-teal-200",
];

const horarioInicial = [
  { id:1, cursoId:2, materiaId:1, docenteId:5, dia:"Lunes",    hora:"7:00",  aula:"Aula 3" },
  { id:2, cursoId:2, materiaId:2, docenteId:6, dia:"Lunes",    hora:"8:00",  aula:"Aula 3" },
  { id:3, cursoId:2, materiaId:3, docenteId:5, dia:"Lunes",    hora:"10:00", aula:"Aula 3" },
  { id:4, cursoId:2, materiaId:1, docenteId:5, dia:"Martes",   hora:"7:00",  aula:"Aula 3" },
  { id:5, cursoId:2, materiaId:4, docenteId:6, dia:"Martes",   hora:"9:00",  aula:"Aula 3" },
  { id:6, cursoId:2, materiaId:2, docenteId:6, dia:"Miércoles",hora:"8:00",  aula:"Aula 3" },
  { id:7, cursoId:2, materiaId:3, docenteId:5, dia:"Jueves",   hora:"10:00", aula:"Aula 3" },
  { id:8, cursoId:2, materiaId:1, docenteId:5, dia:"Viernes",  hora:"7:00",  aula:"Aula 3" },
  { id:9, cursoId:2, materiaId:4, docenteId:6, dia:"Viernes",  hora:"9:00",  aula:"Aula 3" },
];

export default function Horarios() {
  const { user } = useAuth();
  const toast = useToast();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation({
    docenteId: { required: true, label: "Docente" },
  });

  const [horario, setHorario]       = useState(horarioInicial);
  const [cursoBuscado, setCursoBuscado] = useState(2);
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ cursoId:2, materiaId:1, docenteId:5, dia:"Lunes", hora:"7:00", aula:"", tipoClase:"teorica" });

  const docentes = usuarios.filter(u => u.rol === "DOCENTE");
  const esAdmin  = ["SUPER_ADMIN","ADMIN_INSTITUCIONAL","COORDINADOR"].includes(user?.rol);

  const colorMap = {};
  [...new Set(horario.map(h => h.materiaId))].forEach((id, i) => { colorMap[id] = COLORES[i % COLORES.length]; });

  const getCelda = (dia, hora) =>
    horario.filter(h => h.cursoId === cursoBuscado && h.dia === dia && h.hora === hora);

  // Detectar conflicto: mismo docente en mismo día y hora
  const hayConflictoDocente = () =>
    horario.some(h => h.docenteId === Number(form.docenteId) && h.dia === form.dia && h.hora === form.hora && h.id !== form.id);

  // Detectar conflicto: mismo aula en mismo día y hora
  const hayConflictoAula = () =>
    form.aula && horario.some(h => h.aula === form.aula && h.dia === form.dia && h.hora === form.hora);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Selecciona un docente"); return; }
    if (hayConflictoDocente()) {
      const doc = usuarios.find(u => u.id === Number(form.docenteId));
      toast.error(`${doc?.nombre} ya tiene clase el ${form.dia} a las ${form.hora}`);
      return;
    }
    if (hayConflictoAula()) {
      toast.error(`El aula "${form.aula}" ya está ocupada el ${form.dia} a las ${form.hora}`);
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    const nuevo = { ...form, id: Date.now(), cursoId: Number(form.cursoId), materiaId: Number(form.materiaId), docenteId: Number(form.docenteId) };
    setHorario([...horario, nuevo]);
    setShowModal(false);
    clearErrors();
    setSubmitting(false);
    const mat = materias.find(m => m.id === Number(form.materiaId));
    toast.success(`${mat?.nombre} agregada al horario del ${form.dia}`, "Clase agregada");
  };

  const eliminar = (id) => {
    setHorario(horario.filter(h => h.id !== id));
    toast.warning("Clase eliminada del horario");
  };

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
    ${errors[field] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`;

  return (
    <div>
      <PageHeader
        title="Horarios"
        subtitle="Horario semanal por curso"
        action={esAdmin && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer">
            <Plus size={16}/> Agregar Clase
          </button>
        )}
      />

      {/* Selector de curso */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm font-medium text-gray-600">Curso:</label>
        <select value={cursoBuscado} onChange={e => setCursoBuscado(Number(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Tabla horario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-gray-500 font-medium border-b border-gray-100 w-20">
                  <Clock size={14} className="inline mr-1"/>Hora
                </th>
                {DIAS.map(d => (
                  <th key={d} className="px-4 py-3 text-center text-gray-600 font-semibold border-b border-gray-100">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORAS.map(hora => (
                <tr key={hora} className="border-b border-gray-50">
                  <td className="px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 whitespace-nowrap">{hora}</td>
                  {DIAS.map(dia => {
                    const celdas = getCelda(dia, hora);
                    return (
                      <td key={dia} className="px-2 py-1.5 align-top min-w-32">
                        {celdas.map(c => {
                          const mat = materias.find(m => m.id === c.materiaId);
                          const doc = usuarios.find(u => u.id === c.docenteId);
                          return (
                            <div key={c.id}
                              className={`rounded-lg px-2 py-1.5 border text-xs mb-1 ${colorMap[c.materiaId] || COLORES[0]}`}>
                              <p className="font-semibold truncate">{mat?.nombre}</p>
                              <p className="opacity-70 truncate">{doc?.nombre?.split(" ")[0]}</p>
                              {c.aula && <p className="opacity-60">{c.aula}</p>}
                              {esAdmin && (
                                <button onClick={() => eliminar(c.id)}
                                  className="text-xs opacity-50 hover:opacity-100 bg-transparent border-0 cursor-pointer mt-0.5">
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mt-4">
        {[...new Set(horario.filter(h => h.cursoId === cursoBuscado).map(h => h.materiaId))].map(id => {
          const mat = materias.find(m => m.id === id);
          return (
            <div key={id} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border ${colorMap[id]}`}>
              {mat?.nombre}
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Agregar Clase al Horario">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Curso *</label>
              <select value={form.cursoId} onChange={e => setForm({...form, cursoId: e.target.value})} className={inputCls("cursoId")}>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Materia *</label>
              <select value={form.materiaId} onChange={e => setForm({...form, materiaId: e.target.value})} className={inputCls("materiaId")}>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Docente *</label>
            <select value={form.docenteId} onChange={e => { setForm({...form, docenteId: e.target.value}); handleChange("docenteId", e.target.value); }}
              className={inputCls("docenteId")}>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            {errors.docenteId && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.docenteId}</p>}
          </div>

          {/* Alerta de conflicto en tiempo real */}
          {hayConflictoDocente() && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <AlertTriangle size={13} className="flex-shrink-0" />
              El docente seleccionado ya tiene clase el {form.dia} a las {form.hora}
            </div>
          )}
          {hayConflictoAula() && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              <AlertTriangle size={13} className="flex-shrink-0" />
              El aula "{form.aula}" ya está ocupada el {form.dia} a las {form.hora}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Día *</label>
              <select value={form.dia} onChange={e => setForm({...form, dia: e.target.value})} className={inputCls("dia")}>
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Hora *</label>
              <select value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} className={inputCls("hora")}>
                {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Aula / Salón</label>
              <input value={form.aula} onChange={e => setForm({...form, aula: e.target.value})}
                placeholder="Aula 3" className={inputCls("aula")} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tipo de clase</label>
            <select value={form.tipoClase} onChange={e => setForm({...form, tipoClase: e.target.value})} className={inputCls("tipoClase")}>
              <option value="teorica">Teórica</option>
              <option value="practica">Práctica</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="evaluacion">Evaluación</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); clearErrors(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">Cancelar</button>
            <button type="submit" disabled={submitting || hayConflictoDocente()}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
              {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</> : "Agregar Clase"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
