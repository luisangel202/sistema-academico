import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, CheckCircle, AlertCircle, Target, Calendar, Edit2, Trash2, Printer } from "lucide-react";
import { imprimirPlanMejoramiento } from "../../utils/formatos/formatoPlanMejoramiento";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import ModuleLayout, {
  FilterInput, FilterSelect,
  FormField, FormInput, FormSelect,
  ActionBtn, ModalActions,
} from "../../components/ModuleLayout";

const planesIniciales = [
  { id: 1, estudiante: "Sofía Torres",  materia: "Español",     docente: "Sandra López", actividades: "Lectura diaria 30 min, taller de comprensión",       fechaInicio: "2025-05-08", fechaFin: "2025-05-30", estado: "activo",  objetivo: "Mejorar comprensión lectora al nivel básico",  indicadores: "Promedio ≥ 3.5",   frecuencia: "semanal"   },
  { id: 2, estudiante: "Carlos Ruiz",   materia: "Matemáticas", docente: "Luis Herrera", actividades: "Ejercicios de refuerzo, asesoría 2 veces por semana", fechaInicio: "2025-05-06", fechaFin: "2025-05-28", estado: "activo",  objetivo: "Superar dificultades en álgebra básica",      indicadores: "Aprobación eval.", frecuencia: "quincenal" },
];

const FORM_INI = { estudiante: "", materia: "", docente: "", actividades: "", fechaInicio: "", fechaFin: "", objetivo: "", indicadores: "", frecuencia: "semanal" };
const REGLAS   = {
  estudiante:  { required: true, label: "Estudiante" },
  materia:     { required: true, label: "Materia"    },
  actividades: { required: true, minLength: 20, label: "Actividades" },
  fechaInicio: { required: true, label: "Fecha inicio" },
  fechaFin:    { required: true, label: "Fecha fin"    },
  objetivo:    { required: true, minLength: 10, label: "Objetivo" },
};

function PlanForm({ form, f, handleBlur, errors, onCancel, onSubmit, submitLabel, submitting }) {
  const inputCls = (field) =>
    `w-full rounded-xl text-sm outline-none transition-all font-medium ${errors[field] ? "ring-1 ring-red-400" : ""}`;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Estudiante" required error={errors.estudiante}>
          <FormInput error={errors.estudiante} value={form.estudiante} placeholder="Nombre del estudiante"
            onChange={e => f("estudiante", e.target.value)} onBlur={e => handleBlur("estudiante", e.target.value)} />
        </FormField>
        <FormField label="Materia" required error={errors.materia}>
          <FormInput error={errors.materia} value={form.materia} placeholder="Materia"
            onChange={e => f("materia", e.target.value)} onBlur={e => handleBlur("materia", e.target.value)} />
        </FormField>
      </div>

      <FormField label="Objetivo del plan" required error={errors.objetivo}>
        <FormInput error={errors.objetivo} value={form.objetivo} placeholder="¿Qué se espera lograr?"
          onChange={e => f("objetivo", e.target.value)} onBlur={e => handleBlur("objetivo", e.target.value)} />
      </FormField>

      <FormField label="Actividades de mejora" required error={errors.actividades}>
        <textarea value={form.actividades} onChange={e => f("actividades", e.target.value)}
          onBlur={e => handleBlur("actividades", e.target.value)}
          rows={3} placeholder="Describe las actividades (mínimo 20 caracteres)..."
          className={`${inputCls("actividades")} resize-none w-full`}
          style={{ padding: "9px 13px", background: "#f8fafc", border: `1.5px solid ${errors.actividades ? "#fca5a5" : "#e4eaf3"}`, color: "#0f172a", fontFamily: "inherit" }}
          onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
          onBlur={e => { e.target.style.borderColor = errors.actividades ? "#fca5a5" : "#e4eaf3"; e.target.style.background = "#f8fafc"; }}
        />
        {errors.actividades && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.actividades}</p>}
      </FormField>

      <FormField label="Indicadores de logro">
        <FormInput value={form.indicadores} placeholder="Ej: Promedio ≥ 3.5, aprobación de evaluación..."
          onChange={e => f("indicadores", e.target.value)} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fecha inicio" required error={errors.fechaInicio}>
          <FormInput type="date" error={errors.fechaInicio} value={form.fechaInicio}
            onChange={e => f("fechaInicio", e.target.value)} onBlur={e => handleBlur("fechaInicio", e.target.value)} />
        </FormField>
        <FormField label="Fecha fin" required error={errors.fechaFin}>
          <FormInput type="date" error={errors.fechaFin} value={form.fechaFin} min={form.fechaInicio}
            onChange={e => f("fechaFin", e.target.value)} onBlur={e => handleBlur("fechaFin", e.target.value)} />
        </FormField>
      </div>

      <FormField label="Frecuencia de seguimiento">
        <FormSelect value={form.frecuencia} onChange={e => f("frecuencia", e.target.value)}>
          <option value="semanal">Semanal</option>
          <option value="quincenal">Quincenal</option>
          <option value="mensual">Mensual</option>
        </FormSelect>
      </FormField>

      <ModalActions onCancel={onCancel} submitLabel={submitLabel} loading={submitting} />
    </form>
  );
}

export default function PlanesMejoramiento() {
  const toast = useToast();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);
  const [planes, setPlanes]       = useInstState("er_planes_mejoramiento", planesIniciales);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [delModal, setDelModal]   = useState(false);
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm]           = useState(FORM_INI);

  const f = (k, v) => { setForm(p => ({ ...p, [k]: v })); handleChange(k, v); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Completa los campos requeridos"); return; }
    if (form.fechaFin <= form.fechaInicio) { toast.error("La fecha fin debe ser posterior al inicio"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 350));
    setPlanes(prev => [...prev, { ...form, id: Date.now(), estado: "activo" }]);
    setShowModal(false); setForm(FORM_INI); clearErrors(); setSubmitting(false);
    toast.success(`Plan creado para ${form.estudiante}`);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Completa los campos requeridos"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 350));
    setPlanes(prev => prev.map(p => p.id === selected.id ? { ...p, ...form } : p));
    setEditModal(false); setSelected(null); setForm(FORM_INI); clearErrors(); setSubmitting(false);
    toast.success("Plan actualizado");
  };

  const abrirEditar = (p) => {
    setSelected(p);
    setForm({ estudiante: p.estudiante, materia: p.materia, docente: p.docente || "", actividades: p.actividades, fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, objetivo: p.objetivo || "", indicadores: p.indicadores || "", frecuencia: p.frecuencia || "semanal" });
    clearErrors(); setEditModal(true);
  };

  const confirmarEliminar = () => {
    setPlanes(prev => prev.filter(p => p.id !== selected.id));
    setDelModal(false); setSelected(null);
    toast.warning("Plan eliminado");
  };

  const marcarCompletado = (id) => {
    setPlanes(prev => prev.map(p => p.id === id ? { ...p, estado: "completado" } : p));
    toast.success("Plan marcado como completado");
  };

  const filtrados = planes.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.estudiante.toLowerCase().includes(q) || p.materia.toLowerCase().includes(q) || (p.docente || "").toLowerCase().includes(q);
    const matchEstado = filtroEstado ? p.estado === filtroEstado : true;
    return matchSearch && matchEstado;
  });

  const bulk = useBulkSelect(filtrados);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setPlanes);
    setConfirmDel(false);
    toast.success(`${count} plan${count !== 1 ? "es" : ""} eliminado${count !== 1 ? "s" : ""}`);
  };

  return (
    <ModuleLayout
      header={
        <PageHeader title="Planes de Mejoramiento" subtitle="Seguimiento a estudiantes en riesgo académico"
          icon={Target} color="#10b981"
          action={
            <button onClick={() => { setShowModal(true); setForm(FORM_INI); clearErrors(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              <Plus size={14} /> Nuevo plan
            </button>
          }
        />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar estudiante, materia..." icon={Search} />
        <FilterSelect value={filtroEstado} onChange={setFiltroEstado}>
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="completado">Completado</option>
        </FilterSelect>
      </>}
      count={`${filtrados.length} plan${filtrados.length !== 1 ? "es" : ""}`}
      toolbar={bulk.count > 0 && (
        <BulkBar count={bulk.count} label="plan"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}
    >
      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtrados.length} onToggleAll={bulk.toggleAll} label="plan" />
      <div className="space-y-3">
        {filtrados.map(p => (
          <div key={p.id} className="rounded-2xl overflow-hidden"
            style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>

            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4"
              style={{ borderBottom: "1px solid #f4f6fb" }}>
              <div className="min-w-0 mr-4">
                <p className="text-sm font-bold" style={{ color: "#1e293b" }}>{p.estudiante}</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                  {p.materia}{p.docente ? ` · ${p.docente}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Checkbox checked={bulk.selected.has(p.id)} onChange={() => bulk.toggle(p.id)} />
                <Badge label={p.estado} variant={p.estado === "activo" ? "success" : "gray"} dot />
                <ActionBtn icon={Edit2} color="blue" title="Editar" onClick={() => abrirEditar(p)} />
                <ActionBtn icon={Trash2} color="red" title="Eliminar" onClick={() => { setSelected(p); setDelModal(true); }} />
                <ActionBtn icon={Printer} color="blue" title="Imprimir plan" onClick={() => imprimirPlanMejoramiento(p)} />
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-5 py-4 space-y-3">
              {/* Objetivo */}
              {p.objetivo && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <Target size={13} style={{ color: "#2563eb", flexShrink: 0, marginTop: 2 }} />
                  <p className="text-xs leading-relaxed" style={{ color: "#1d4ed8" }}>{p.objetivo}</p>
                </div>
              )}

              {/* Actividades */}
              <div className="px-3 py-2.5 rounded-xl"
                style={{ background: "#f8fafc", border: "1px solid #e8edf5" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>
                  Actividades
                </p>
                <p className="text-sm" style={{ color: "#374151" }}>{p.actividades}</p>
              </div>

              {/* Meta datos en fila */}
              <div className="flex items-center flex-wrap gap-4">
                {p.indicadores && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
                    <CheckCircle size={12} style={{ color: "#22c55e" }} />
                    <span>{p.indicadores}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
                  <Calendar size={12} style={{ color: "#94a3b8" }} />
                  <span>{p.fechaInicio} — {p.fechaFin}</span>
                </div>
                {p.frecuencia && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                    style={{ background: "#f1f5f9", color: "#475569" }}>
                    Seguimiento {p.frecuencia}
                  </span>
                )}
              </div>

              {/* Acción completar */}
              {p.estado === "activo" && (
                <button onClick={() => marcarCompletado(p.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-transparent border-0 cursor-pointer"
                  style={{ color: "#16a34a" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#14532d"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#16a34a"; }}>
                  <CheckCircle size={13} /> Marcar como completado
                </button>
              )}
            </div>
          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="py-16 text-center" style={{ color: "#94a3b8" }}>
            <Target size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hay planes que coincidan</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Nuevo Plan de Mejoramiento" size="md">
        <PlanForm form={form} f={f} handleBlur={handleBlur} errors={errors}
          onCancel={() => { setShowModal(false); clearErrors(); }}
          onSubmit={handleCreate} submitLabel="Crear plan" submitting={submitting} />
      </Modal>

      <Modal open={editModal} onClose={() => { setEditModal(false); clearErrors(); }} title="Editar Plan" size="md">
        <PlanForm form={form} f={f} handleBlur={handleBlur} errors={errors}
          onCancel={() => { setEditModal(false); clearErrors(); }}
          onSubmit={handleUpdate} submitLabel="Actualizar" submitting={submitting} />
      </Modal>

      <Modal open={delModal} onClose={() => setDelModal(false)} title="Eliminar Plan" size="sm">
        <div className="space-y-4">
          <div className="px-4 py-3 rounded-xl" style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
            <p className="text-sm" style={{ color: "#be123c" }}>
              ¿Eliminar el plan de <strong>{selected?.estudiante}</strong>? Esta acción no se puede deshacer.
            </p>
          </div>
          <ModalActions onCancel={() => setDelModal(false)} submitLabel="Eliminar" />
        </div>
        {/* Override: botón rojo */}
        <style>{`.modal-del-btn { background: linear-gradient(135deg,#ef4444,#dc2626) !important; }`}</style>
      </Modal>
      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="plan"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </ModuleLayout>
  );
}
