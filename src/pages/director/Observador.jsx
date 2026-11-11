import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, Eye, EyeOff, Search, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import ModuleLayout, {
  FilterInput, FilterSelect,
  FormField, FormInput, FormSelect,
  ModalActions,
} from "../../components/ModuleLayout";
import { useData } from "../../context/DataContext";

const estudiantesGrupo = [
  { id: 9,  nombre: "Juan Pérez",        avatar: "JP" },
  { id: 10, nombre: "Sofía Torres",       avatar: "ST" },
  { id: 12, nombre: "Carlos Ruiz",        avatar: "CR" },
  { id: 13, nombre: "Laura Gómez",        avatar: "LG" },
  { id: 14, nombre: "Miguel Ángel Díaz",  avatar: "MA" },
];

const obsIniciales = [
  { id: 1, estudianteId: 10, tipo: "academico",   descripcion: "Bajo rendimiento en Matemáticas. Se recomienda refuerzo.",                     fecha: "2025-05-05", visibilidad: "coordinacion", autor: "Jorge Castro", acciones: "Se habló con el estudiante",   seguimiento: true  },
  { id: 2, estudianteId: 9,  tipo: "convivencia", descripcion: "Excelente comportamiento y liderazgo en actividades grupales.",                 fecha: "2025-04-28", visibilidad: "publica",      autor: "Jorge Castro", acciones: "",                              seguimiento: false },
  { id: 3, estudianteId: 14, tipo: "citacion",    descripcion: "Se cita al acudiente para tratar inasistencias reiteradas.",                  fecha: "2025-05-06", visibilidad: "coordinacion", autor: "Jorge Castro", acciones: "Citación enviada",               seguimiento: true  },
];

const TIPO_COLOR = {
  academico:    { bg: "#eff6ff", text: "#1d4ed8" },
  convivencia:  { bg: "#f0fdf4", text: "#15803d" },
  citacion:     { bg: "#fffbeb", text: "#92400e" },
  disciplinario:{ bg: "#fff1f2", text: "#be123c" },
};
const VIS_LABEL  = { publica: "Pública", coordinacion: "Coordinación", confidencial: "Confidencial" };

const FORM_INI = { estudianteId: "", tipo: "academico", descripcion: "", visibilidad: "coordinacion", acciones: "", seguimiento: false };
const REGLAS   = {
  estudianteId: { required: true, label: "Estudiante" },
  descripcion:  { required: true, minLength: 20, label: "Descripción" },
};

export default function Observador() {
  const toast = useToast();
  const { user } = useAuth();
  const { getGrupoDirector } = useData();
  const { estudiantes: estudiantesGrupo } = getGrupoDirector(user?.id);
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);
  const [obs, setObs]           = useInstState("er_observador", obsIniciales);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]         = useState(FORM_INI);
  const [search, setSearch]     = useState("");
  const [filtroEst, setFiltroEst] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroVis, setFiltroVis]   = useState("");

  const f = (k, v) => { setForm(p => ({ ...p, [k]: v })); handleChange(k, v); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Completa los campos requeridos"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 350));
    const est = estudiantesGrupo.find(e => e.id === Number(form.estudianteId));
    setObs(prev => [{ ...form, id: Date.now(), estudianteId: Number(form.estudianteId), fecha: new Date().toISOString().split("T")[0], autor: user?.nombre || "Director de grupo" }, ...prev]);
    setShowModal(false); setForm(FORM_INI); clearErrors(); setSubmitting(false);
    toast.success(`Observación registrada para ${est?.nombre}`);
  };

  const filtradas = obs.filter(o => {
    const est = estudiantesGrupo.find(e => e.id === o.estudianteId);
    const q = search.toLowerCase();
    const matchSearch = !search || (est?.nombre || "").toLowerCase().includes(q) || o.descripcion.toLowerCase().includes(q);
    const matchEst  = filtroEst  ? o.estudianteId === Number(filtroEst) : true;
    const matchTipo = filtroTipo ? o.tipo === filtroTipo                : true;
    const matchVis  = filtroVis  ? o.visibilidad === filtroVis          : true;
    return matchSearch && matchEst && matchTipo && matchVis;
  });

  const bulk = useBulkSelect(filtradas);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setObs);
    setConfirmDel(false);
    toast.success(`${count} observación${count !== 1 ? "es" : ""} eliminada${count !== 1 ? "s" : ""}`);
  };

  return (
    <ModuleLayout
      header={
        <PageHeader title="Observador del Estudiante" subtitle="Registro de observaciones académicas y convivenciales"
          icon={Eye} color="#14b8a6"
          action={
            <button onClick={() => { setShowModal(true); setForm(FORM_INI); clearErrors(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              <Plus size={14} /> Nueva observación
            </button>
          }
        />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar observación..." icon={Search} />
        <FilterSelect value={filtroEst} onChange={setFiltroEst}>
          <option value="">Todos los estudiantes</option>
          {estudiantesGrupo.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </FilterSelect>
        <FilterSelect value={filtroTipo} onChange={setFiltroTipo}>
          <option value="">Todos los tipos</option>
          <option value="academico">Académico</option>
          <option value="convivencia">Convivencia</option>
          <option value="citacion">Citación</option>
          <option value="disciplinario">Disciplinario</option>
        </FilterSelect>
        <FilterSelect value={filtroVis} onChange={setFiltroVis}>
          <option value="">Toda visibilidad</option>
          <option value="publica">Pública</option>
          <option value="coordinacion">Coordinación</option>
          <option value="confidencial">Confidencial</option>
        </FilterSelect>
      </>}
      count={`${filtradas.length} observación${filtradas.length !== 1 ? "es" : ""}`}
      toolbar={bulk.count > 0 && (
        <BulkBar count={bulk.count} label="observación"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}
    >
      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtradas.length} onToggleAll={bulk.toggleAll} label="observación" />
      <div className="space-y-3">
        {filtradas.map(o => {
          const est   = estudiantesGrupo.find(e => e.id === o.estudianteId);
          const tCol  = TIPO_COLOR[o.tipo] || TIPO_COLOR.academico;

          return (
            <div key={o.id} className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>

              {/* Header */}
              <div className="flex items-start justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #f4f6fb" }}>
                <div className="flex items-center gap-3 min-w-0 mr-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: "#f0fdfa", color: "#0f766e" }}>
                    {est?.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#1e293b" }}>{est?.nombre}</p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>{o.fecha} · {o.autor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Checkbox checked={bulk.selected.has(o.id)} onChange={() => bulk.toggle(o.id)} />
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                    style={{ background: tCol.bg, color: tCol.text }}>
                    {o.tipo}
                  </span>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "#94a3b8" }}>
                    {o.visibilidad === "confidencial" ? <EyeOff size={11} /> : <Eye size={11} />}
                    <span className="hidden sm:inline">{VIS_LABEL[o.visibilidad]}</span>
                  </div>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="px-5 py-4 space-y-2.5">
                <div className="px-3 py-2.5 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e8edf5" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{o.descripcion}</p>
                </div>

                {o.acciones && (
                  <div className="px-3 py-2.5 rounded-xl" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>Acciones tomadas</p>
                    <p className="text-xs" style={{ color: "#1d4ed8" }}>{o.acciones}</p>
                  </div>
                )}

                {o.seguimiento && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
                    <AlertCircle size={11} /> Requiere seguimiento
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filtradas.length === 0 && (
          <div className="py-16 text-center" style={{ color: "#94a3b8" }}>
            <Eye size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hay observaciones registradas</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Nueva Observación" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Estudiante" required error={errors.estudianteId}>
            <FormSelect value={form.estudianteId} onChange={e => f("estudianteId", e.target.value)}>
              <option value="">Seleccionar estudiante</option>
              {estudiantesGrupo.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </FormSelect>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo">
              <FormSelect value={form.tipo} onChange={e => f("tipo", e.target.value)}>
                <option value="academico">Académico</option>
                <option value="convivencia">Convivencia</option>
                <option value="citacion">Citación</option>
                <option value="disciplinario">Disciplinario</option>
              </FormSelect>
            </FormField>
            <FormField label="Visibilidad">
              <FormSelect value={form.visibilidad} onChange={e => f("visibilidad", e.target.value)}>
                <option value="publica">Pública institucional</option>
                <option value="coordinacion">Solo coordinación</option>
                <option value="confidencial">Confidencial</option>
              </FormSelect>
            </FormField>
          </div>

          <FormField label="Descripción" required error={errors.descripcion}>
            <textarea value={form.descripcion} onChange={e => f("descripcion", e.target.value)}
              onBlur={e => handleBlur("descripcion", e.target.value)}
              rows={4} placeholder="Describe la observación (mínimo 20 caracteres)..."
              className="w-full rounded-xl text-sm outline-none transition-all resize-none"
              style={{ padding: "9px 13px", background: "#f8fafc", border: `1.5px solid ${errors.descripcion ? "#fca5a5" : "#e4eaf3"}`, color: "#0f172a", fontFamily: "inherit" }}
              onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = errors.descripcion ? "#fca5a5" : "#e4eaf3"; e.target.style.background = "#f8fafc"; }}
            />
            {errors.descripcion && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.descripcion}</p>}
          </FormField>

          <FormField label="Acciones tomadas">
            <FormInput value={form.acciones} placeholder="Ej: Se habló con el estudiante..."
              onChange={e => f("acciones", e.target.value)} />
          </FormField>

          <label className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl"
            style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
            <input type="checkbox" checked={form.seguimiento} onChange={e => f("seguimiento", e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-amber-600" />
            <span className="text-sm" style={{ color: "#92400e" }}>Requiere seguimiento posterior</span>
          </label>

          <ModalActions onCancel={() => { setShowModal(false); clearErrors(); }}
            submitLabel="Registrar observación" loading={submitting} />
        </form>
      </Modal>
      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="observación"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </ModuleLayout>
  );
}
