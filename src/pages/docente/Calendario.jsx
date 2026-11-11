import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Bell, Calendar } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";

const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const eventosIniciales = [
  { id: 1, fecha: "2025-05-10", titulo: "Entrega notas P2",       tipo: "academico", color: "bg-blue-500",   horaInicio: "08:00", horaFin: "09:00", lugar: "", recordatorio: "1dia" },
  { id: 2, fecha: "2025-05-12", titulo: "Tarea Ciencias vence",   tipo: "tarea",     color: "bg-yellow-500", horaInicio: "23:59", horaFin: "",       lugar: "", recordatorio: "1dia" },
  { id: 3, fecha: "2025-05-15", titulo: "Comité de evaluación",   tipo: "reunion",   color: "bg-purple-500", horaInicio: "14:00", horaFin: "16:00",  lugar: "Sala de profesores", recordatorio: "1hora" },
  { id: 4, fecha: "2025-05-20", titulo: "Día del maestro",        tipo: "festivo",   color: "bg-green-500",  horaInicio: "",      horaFin: "",       lugar: "", recordatorio: "" },
];

const TIPO_COLORES = { academico: "bg-blue-500", tarea: "bg-yellow-500", reunion: "bg-purple-500", festivo: "bg-green-500", otro: "bg-gray-500" };

const FORM_INICIAL = { fecha: "", titulo: "", tipo: "academico", horaInicio: "", horaFin: "", lugar: "", recordatorio: "1dia" };

const REGLAS = {
  titulo: { required: true, minLength: 3, label: "Título" },
  fecha:  { required: true, label: "Fecha" },
};

export default function Calendario() {
  const toast = useToast();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);

  const hoy = new Date();
  const [año, setAño]       = useState(hoy.getFullYear());
  const [mes, setMes]       = useState(hoy.getMonth());
  const [eventos, setEventos] = useState(eventosIniciales);
  const [showModal, setShowModal] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]     = useState(FORM_INICIAL);

  const f = (key, val) => { setForm(p => ({ ...p, [key]: val })); handleChange(key, val); };

  const primerDia  = new Date(año, mes, 1).getDay();
  const diasEnMes  = new Date(año, mes + 1, 0).getDate();

  const prevMes = () => { if (mes === 0) { setMes(11); setAño(año - 1); } else setMes(mes - 1); };
  const nextMes = () => { if (mes === 11) { setMes(0); setAño(año + 1); } else setMes(mes + 1); };

  const eventosDelDia = (dia) => {
    const fecha = `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return eventos.filter(e => e.fecha === fecha);
  };

  const abrirModalDia = (dia) => {
    const fecha = `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    setDiaSeleccionado(dia);
    setForm({ ...FORM_INICIAL, fecha });
    clearErrors();
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Corrige los errores antes de continuar"); return; }
    if (form.horaInicio && form.horaFin && form.horaFin <= form.horaInicio) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio"); return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    const nuevo = { ...form, id: Date.now(), color: TIPO_COLORES[form.tipo] || TIPO_COLORES.otro };
    setEventos([...eventos, nuevo]);
    setShowModal(false);
    setForm(FORM_INICIAL);
    clearErrors();
    setSubmitting(false);
    toast.success(`Evento "${form.titulo}" agregado`, "Evento creado");
  };

  const eliminarEvento = (id) => {
    setEventos(eventos.filter(e => e.id !== id));
    toast.warning("Evento eliminado");
  };

  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
    ${errors[field] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calendario"
        subtitle="Eventos académicos y fechas importantes"
        icon={Calendar}
        color="#3b82f6"
        action={
          <button onClick={() => { setShowModal(true); setForm(FORM_INICIAL); clearErrors(); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm shadow-blue-200">
            <Plus size={15} /> Nuevo Evento
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={prevMes} className="p-2 hover:bg-gray-100 rounded-xl transition bg-transparent border-0 cursor-pointer">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-800">{MESES[mes]} {año}</h3>
          <button onClick={nextMes} className="p-2 hover:bg-gray-100 rounded-xl transition bg-transparent border-0 cursor-pointer">
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100">
          {DIAS.map(d => (
            <div key={d} className="text-center py-2 text-xs font-semibold text-gray-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {celdas.map((dia, i) => {
            const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();
            const evs   = dia ? eventosDelDia(dia) : [];
            return (
              <div key={i}
                onClick={() => dia && abrirModalDia(dia)}
                className={`min-h-20 p-1.5 border-b border-r border-gray-50 transition
                  ${!dia ? "bg-gray-50/50" : "hover:bg-blue-50/30 cursor-pointer"}`}>
                {dia && (
                  <>
                    <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                      ${esHoy ? "bg-blue-600 text-white" : "text-gray-700"}`}>
                      {dia}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {evs.slice(0, 2).map(ev => (
                        <div key={ev.id} className={`${ev.color} text-white text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1`} title={ev.titulo}>
                          {ev.horaInicio && <span className="opacity-80">{ev.horaInicio}</span>}
                          <span className="truncate">{ev.titulo}</span>
                        </div>
                      ))}
                      {evs.length > 2 && <span className="text-xs text-gray-400">+{evs.length - 2} más</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 flex-wrap">
        {[
          { color: "bg-blue-500",   label: "Académico" },
          { color: "bg-yellow-500", label: "Tarea" },
          { color: "bg-purple-500", label: "Reunión" },
          { color: "bg-green-500",  label: "Festivo" },
          { color: "bg-gray-500",   label: "Otro" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Modal nuevo evento */}
      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Nuevo Evento">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Título *</label>
            <input value={form.titulo} onChange={e => f("titulo", e.target.value)} onBlur={e => handleBlur("titulo", e.target.value)}
              placeholder="Nombre del evento" className={inputCls("titulo")} />
            {errors.titulo && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.titulo}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fecha *</label>
              <input type="date" value={form.fecha} onChange={e => f("fecha", e.target.value)} onBlur={e => handleBlur("fecha", e.target.value)}
                className={inputCls("fecha")} />
              {errors.fecha && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.fecha}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tipo</label>
              <select value={form.tipo} onChange={e => f("tipo", e.target.value)} className={inputCls("tipo")}>
                <option value="academico">Académico</option>
                <option value="tarea">Tarea</option>
                <option value="reunion">Reunión</option>
                <option value="festivo">Festivo</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Hora inicio</label>
              <input type="time" value={form.horaInicio} onChange={e => f("horaInicio", e.target.value)} className={inputCls("horaInicio")} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Hora fin</label>
              <input type="time" value={form.horaFin} onChange={e => f("horaFin", e.target.value)} className={inputCls("horaFin")} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Lugar</label>
            <input value={form.lugar} onChange={e => f("lugar", e.target.value)} placeholder="Aula, sala, virtual..."
              className={inputCls("lugar")} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
              <Bell size={12} /> Recordatorio
            </label>
            <select value={form.recordatorio} onChange={e => f("recordatorio", e.target.value)} className={inputCls("recordatorio")}>
              <option value="">Sin recordatorio</option>
              <option value="1hora">1 hora antes</option>
              <option value="1dia">1 día antes</option>
              <option value="2dias">2 días antes</option>
              <option value="1semana">1 semana antes</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); clearErrors(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">Cancelar</button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
              {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</> : "Agregar Evento"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
