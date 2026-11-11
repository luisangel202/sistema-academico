import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, Clock, Users, Search, BookOpen, FileText, Trash2 } from "lucide-react";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import ModuleLayout, {
  FilterInput, FilterSelect,
  FormField, FormInput, FormSelect,
  ModalActions,
} from "../../components/ModuleLayout";
import { tareas as dataTareas, materias, cursos } from "../../data/mockData";

const FORM_INI = {
  titulo: "", descripcion: "", materiaId: 1, cursoId: 2,
  fechaLimite: "", tipoEntrega: "digital", valorNota: 0, permiteTardanza: false,
};

const REGLAS = {
  titulo:      { required: true, minLength: 5, label: "Título" },
  fechaLimite: { required: true, label: "Fecha límite" },
};

const estadoStyle = {
  activa:  { bg: "#eff6ff", border: "#bfdbfe", accent: "#2563eb" },
  vencida: { bg: "#fff1f2", border: "#fecdd3", accent: "#ef4444" },
};

export default function Tareas() {
  const toast = useToast();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);

  const [tareas, setTareas]       = useInstState("er_tareas", dataTareas.filter(t => t.docenteId === 5));
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState("");
  const [filtroEstado, setFiltroEstado]   = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [form, setForm]                   = useState(FORM_INI);

  const misMaterias = materias.filter(m => m.docenteId === 5);
  const f = (k, v) => { setForm(p => ({ ...p, [k]: v })); handleChange(k, v); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Completa los campos obligatorios"); return; }
    if (form.fechaLimite < new Date().toISOString().split("T")[0]) {
      toast.error("La fecha límite no puede ser en el pasado"); return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 350));
    setTareas(prev => [{
      ...form, id: Date.now(), docenteId: 5, estado: "activa", entregas: 0,
      materiaId: Number(form.materiaId), cursoId: Number(form.cursoId),
      valorNota: Number(form.valorNota),
    }, ...prev]);
    setShowModal(false); setForm(FORM_INI); clearErrors(); setSubmitting(false);
    toast.success(`Tarea "${form.titulo}" publicada`);
  };

  const filtradas = tareas.filter(t => {
    const matchSearch  = !search || t.titulo.toLowerCase().includes(search.toLowerCase());
    const matchEstado  = filtroEstado  ? t.estado    === filtroEstado          : true;
    const matchMateria = filtroMateria ? t.materiaId === Number(filtroMateria) : true;
    return matchSearch && matchEstado && matchMateria;
  });

  return (
    <ModuleLayout
      header={
        <PageHeader title="Tareas" subtitle="Gestiona las tareas de tus cursos"
          icon={FileText} color="#f59e0b"
          action={
            <button onClick={() => { setShowModal(true); setForm(FORM_INI); clearErrors(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              <Plus size={14} /> Nueva tarea
            </button>
          }
        />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar tarea..." icon={Search} />
        <FilterSelect value={filtroMateria} onChange={setFiltroMateria}>
          <option value="">Todas las materias</option>
          {misMaterias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </FilterSelect>
        <FilterSelect value={filtroEstado} onChange={setFiltroEstado}>
          <option value="">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="vencida">Vencida</option>
        </FilterSelect>
      </>}
      count={`${filtradas.length} tarea${filtradas.length !== 1 ? "s" : ""}`}
    >
      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtradas.map(t => {
          const materia = misMaterias.find(m => m.id === t.materiaId);
          const curso   = cursos.find(c => c.id === t.cursoId);
          const s       = estadoStyle[t.estado] || estadoStyle.activa;

          return (
            <div key={t.id} className="rounded-2xl p-4 transition-all"
              style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.08)"; e.currentTarget.style.borderColor = "#c8d8f0"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.04)"; e.currentTarget.style.borderColor = "#e8edf5"; }}>

              {/* Acento superior */}
              <div className="h-[3px] rounded-full mb-3"
                style={{ background: `linear-gradient(90deg, ${s.accent}, ${s.accent}50, transparent)` }} />

              {/* Título + estado */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <p className="text-sm font-bold leading-snug flex-1" style={{ color: "#1e293b" }}>{t.titulo}</p>
                <Badge label={t.estado} variant={t.estado} dot />
              </div>

              {/* Descripción */}
              {t.descripcion && (
                <p className="text-xs mb-3 line-clamp-2" style={{ color: "#64748b" }}>{t.descripcion}</p>
              )}

              {/* Metadatos en fila */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#94a3b8" }}>
                  <Clock size={11} />
                  <span>Vence: <span className="font-semibold" style={{ color: "#374151" }}>{t.fechaLimite}</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "#94a3b8" }}>
                    <BookOpen size={11} />
                    <span>{materia?.nombre}{curso ? ` · ${curso.nombre}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "#94a3b8" }}>
                    <Users size={11} />
                    <span>{t.entregas} entregas</span>
                  </div>
                </div>
                {t.valorNota > 0 && (
                  <span className="text-xs font-semibold" style={{ color: "#2563eb" }}>
                    Valor: {t.valorNota}%
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filtradas.length === 0 && (
          <div className="col-span-3 py-16 text-center" style={{ color: "#94a3b8" }}>
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hay tareas que coincidan</p>
          </div>
        )}
      </div>

      {/* Modal nueva tarea */}
      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }}
        title="Nueva Tarea" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Título" required error={errors.titulo}>
            <FormInput error={errors.titulo} value={form.titulo} placeholder="Ej: Taller de ecuaciones"
              onChange={e => f("titulo", e.target.value)} onBlur={e => handleBlur("titulo", e.target.value)} />
          </FormField>

          <FormField label="Descripción">
            <textarea value={form.descripcion} onChange={e => f("descripcion", e.target.value)}
              rows={3} placeholder="Instrucciones para los estudiantes..."
              className="w-full rounded-xl text-sm outline-none transition-all resize-none"
              style={{
                padding: "9px 13px", background: "#f8fafc",
                border: "1.5px solid #e4eaf3", color: "#0f172a", fontFamily: "inherit",
              }}
              onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; }}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Materia" required>
              <FormSelect value={form.materiaId} onChange={e => f("materiaId", e.target.value)}>
                {misMaterias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Fecha límite" required error={errors.fechaLimite}>
              <FormInput type="date" error={errors.fechaLimite} value={form.fechaLimite}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => f("fechaLimite", e.target.value)}
                onBlur={e => handleBlur("fechaLimite", e.target.value)} />
            </FormField>
            <FormField label="Tipo de entrega">
              <FormSelect value={form.tipoEntrega} onChange={e => f("tipoEntrega", e.target.value)}>
                <option value="digital">Digital</option>
                <option value="fisica">Física</option>
                <option value="exposicion">Exposición</option>
                <option value="mixta">Mixta</option>
              </FormSelect>
            </FormField>
            <FormField label="Valor en nota (%)">
              <FormInput type="number" min="0" max="100" value={form.valorNota} placeholder="0"
                onChange={e => f("valorNota", e.target.value)} />
            </FormField>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.permiteTardanza}
              onChange={e => f("permiteTardanza", e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer" />
            <span className="text-sm" style={{ color: "#374151" }}>Permitir entrega tardía</span>
          </label>

          <ModalActions onCancel={() => { setShowModal(false); clearErrors(); }}
            submitLabel="Publicar Tarea" loading={submitting} />
        </form>
      </Modal>
    </ModuleLayout>
  );
}
