import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, Send, CheckCircle, AlertCircle, Phone, Clock, MapPin, Printer, Search } from "lucide-react";
import { imprimirCitacion } from "../../utils/formatos/formatoCitacion";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
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
  { id: 9,  nombre: "Juan Pérez",       avatar: "JP", acudiente: "Roberto Pérez",  tel: "3001234567" },
  { id: 10, nombre: "Sofía Torres",      avatar: "ST", acudiente: "Carmen Torres",  tel: "3109876543" },
  { id: 12, nombre: "Carlos Ruiz",       avatar: "CR", acudiente: "Luis Ruiz",      tel: "3205551234" },
  { id: 14, nombre: "Miguel Ángel Díaz", avatar: "MA", acudiente: "Ana Díaz",       tel: "3154449876" },
];

const citIniciales = [
  { id: 1, estudianteId: 10, motivo: "Bajo rendimiento académico en Español y Matemáticas",  fecha: "2025-05-12", hora: "14:00", canal: "presencial", urgencia: "normal",  estado: "pendiente", acudiente: "Carmen Torres", resultado: ""                                          },
  { id: 2, estudianteId: 14, motivo: "Inasistencias reiteradas sin justificación",            fecha: "2025-05-10", hora: "10:00", canal: "presencial", urgencia: "urgente", estado: "atendida",  acudiente: "Ana Díaz",      resultado: "Se acordó plan de asistencia con el acudiente." },
];

const FORM_INI = { estudianteId: "", motivo: "", fecha: "", hora: "", canal: "presencial", urgencia: "normal" };
const REGLAS   = {
  estudianteId: { required: true, label: "Estudiante" },
  motivo:       { required: true, minLength: 15, label: "Motivo" },
  fecha:        { required: true, label: "Fecha" },
  hora:         { required: true, label: "Hora" },
};

export default function Citaciones() {
  const toast = useToast();
  const { user } = useAuth();
  const { getGrupoDirector } = useData();
  const { estudiantes: estudiantesGrupo } = getGrupoDirector(user?.id);
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);
  const [cits, setCits]         = useInstState("er_citaciones", citIniciales);
  const [showModal, setShowModal] = useState(false);
  const [showRes, setShowRes]   = useState(null);
  const [resultado, setResultado] = useState("");
  const [search, setSearch]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroEst, setFiltroEst]       = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm]         = useState(FORM_INI);

  const f = (k, v) => { setForm(p => ({ ...p, [k]: v })); handleChange(k, v); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Completa los campos requeridos"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 350));
    const est = estudiantesGrupo.find(e => e.id === Number(form.estudianteId));
    setCits(prev => [{ ...form, id: Date.now(), estudianteId: Number(form.estudianteId), estado: "pendiente", acudiente: est?.acudiente || "", resultado: "" }, ...prev]);
    setShowModal(false); setForm(FORM_INI); clearErrors(); setSubmitting(false);
    toast.success(`Citación creada para ${est?.nombre}`);
  };

  const confirmarAtendida = () => {
    setCits(prev => prev.map(c => c.id === showRes ? { ...c, estado: "atendida", resultado } : c));
    setShowRes(null); toast.success("Citación marcada como atendida");
  };

  const filtradas = cits.filter(c => {
    const est = estudiantesGrupo.find(e => e.id === c.estudianteId);
    const q = search.toLowerCase();
    const matchSearch  = !search || (est?.nombre || "").toLowerCase().includes(q) || c.motivo.toLowerCase().includes(q);
    const matchEstado  = filtroEstado ? c.estado === filtroEstado            : true;
    const matchEst     = filtroEst    ? c.estudianteId === Number(filtroEst) : true;
    return matchSearch && matchEstado && matchEst;
  });

  const bulk = useBulkSelect(filtradas);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setCits);
    setConfirmDel(false);
    toast.success(`${count} citación${count !== 1 ? "es" : ""} eliminada${count !== 1 ? "s" : ""}`);
  };

  return (
    <ModuleLayout
      header={
        <PageHeader title="Citaciones" subtitle="Citaciones a padres y acudientes del grupo"
          icon={Send} color="#f59e0b"
          action={
            <button onClick={() => { setShowModal(true); setForm(FORM_INI); clearErrors(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              <Plus size={14} /> Nueva citación
            </button>
          }
        />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar citación..." icon={Search} />
        <FilterSelect value={filtroEst} onChange={setFiltroEst}>
          <option value="">Todos los estudiantes</option>
          {estudiantesGrupo.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </FilterSelect>
        <FilterSelect value={filtroEstado} onChange={setFiltroEstado}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="atendida">Atendida</option>
        </FilterSelect>
      </>}
      count={`${filtradas.length} citación${filtradas.length !== 1 ? "es" : ""}`}
      toolbar={bulk.count > 0 && (
        <BulkBar count={bulk.count} label="citación"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}
    >
      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtradas.length} onToggleAll={bulk.toggleAll} label="citación" />
      <div className="space-y-3">
        {filtradas.map(c => {
          const est = estudiantesGrupo.find(e => e.id === c.estudianteId);
          return (
            <div key={c.id} className="rounded-2xl overflow-hidden"
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
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      Acudiente: {c.acudiente}
                    </p>
                    {est?.tel && (
                      <div className="flex items-center gap-1 mt-0.5" style={{ color: "#94a3b8" }}>
                        <Phone size={10} />
                        <span className="text-xs">{est.tel}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Checkbox checked={bulk.selected.has(c.id)} onChange={() => bulk.toggle(c.id)} />
                  {c.urgencia === "urgente" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#fff1f2", color: "#dc2626", border: "1px solid #fecdd3" }}>
                      Urgente
                    </span>
                  )}
                  <Badge label={c.estado} variant={c.estado === "atendida" ? "success" : "warning"} dot />
                </div>
              </div>

              {/* Cuerpo */}
              <div className="px-5 py-4 space-y-3">
                {/* Motivo */}
                <div className="px-3 py-2.5 rounded-xl" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>Motivo</p>
                  <p className="text-sm" style={{ color: "#92400e" }}>{c.motivo}</p>
                </div>

                {/* Metadatos */}
                <div className="flex items-center flex-wrap gap-4 text-xs" style={{ color: "#64748b" }}>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} style={{ color: "#94a3b8" }} />
                    <span>{c.fecha} — {c.hora}</span>
                  </div>
                  <div className="flex items-center gap-1.5 capitalize">
                    <MapPin size={12} style={{ color: "#94a3b8" }} />
                    <span>{c.canal}</span>
                  </div>
                </div>

                {/* Resultado */}
                {c.resultado && (
                  <div className="px-3 py-2.5 rounded-xl" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>Resultado</p>
                    <p className="text-xs" style={{ color: "#15803d" }}>{c.resultado}</p>
                  </div>
                )}

                {/* Acciones */}
                {c.estado === "pendiente" && (
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border-0 cursor-pointer transition-all"
                      style={{ background: "#eff6ff", color: "#2563eb" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; }}>
                      <Send size={11} /> Notificar
                    </button>
                    <button onClick={() => { setShowRes(c.id); setResultado(""); }}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border-0 cursor-pointer transition-all"
                      style={{ background: "#f0fdf4", color: "#15803d" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#dcfce7"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#f0fdf4"; }}>
                      <CheckCircle size={11} /> Marcar atendida
                    </button>
                    <button onClick={() => { const est = estudiantesGrupo.find(e => e.id === c.estudianteId); imprimirCitacion(c, est); }}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border-0 cursor-pointer transition-all"
                      style={{ background: "#eff6ff", color: "#2563eb" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; }}>
                      <Printer size={11} /> Imprimir
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtradas.length === 0 && (
          <div className="py-16 text-center" style={{ color: "#94a3b8" }}>
            <Send size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hay citaciones que coincidan</p>
          </div>
        )}
      </div>

      {/* Modal nueva citación */}
      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Nueva Citación" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Estudiante" required error={errors.estudianteId}>
            <FormSelect value={form.estudianteId} onChange={e => f("estudianteId", e.target.value)}>
              <option value="">Seleccionar estudiante</option>
              {estudiantesGrupo.map(e => <option key={e.id} value={e.id}>{e.nombre} — {e.acudiente}</option>)}
            </FormSelect>
          </FormField>

          <FormField label="Motivo" required error={errors.motivo}>
            <textarea value={form.motivo} onChange={e => f("motivo", e.target.value)}
              onBlur={e => handleBlur("motivo", e.target.value)}
              rows={3} placeholder="Describe el motivo (mínimo 15 caracteres)..."
              className="w-full rounded-xl text-sm outline-none transition-all resize-none"
              style={{ padding: "9px 13px", background: "#f8fafc", border: `1.5px solid ${errors.motivo ? "#fca5a5" : "#e4eaf3"}`, color: "#0f172a", fontFamily: "inherit" }}
              onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = errors.motivo ? "#fca5a5" : "#e4eaf3"; e.target.style.background = "#f8fafc"; }}
            />
            {errors.motivo && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.motivo}</p>}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fecha" required error={errors.fecha}>
              <FormInput type="date" error={errors.fecha} value={form.fecha}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => f("fecha", e.target.value)} onBlur={e => handleBlur("fecha", e.target.value)} />
            </FormField>
            <FormField label="Hora" required error={errors.hora}>
              <FormInput type="time" error={errors.hora} value={form.hora}
                onChange={e => f("hora", e.target.value)} onBlur={e => handleBlur("hora", e.target.value)} />
            </FormField>
            <FormField label="Canal">
              <FormSelect value={form.canal} onChange={e => f("canal", e.target.value)}>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="telefonica">Telefónica</option>
              </FormSelect>
            </FormField>
            <FormField label="Urgencia">
              <FormSelect value={form.urgencia} onChange={e => f("urgencia", e.target.value)}>
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
              </FormSelect>
            </FormField>
          </div>

          <ModalActions onCancel={() => { setShowModal(false); clearErrors(); }}
            submitLabel="Crear citación" loading={submitting} />
        </form>
      </Modal>

      {/* Modal resultado */}
      <Modal open={!!showRes} onClose={() => setShowRes(null)} title="Registrar Resultado" size="sm">
        <div className="space-y-4">
          <FormField label="Resultado y compromisos adquiridos">
            <textarea value={resultado} onChange={e => setResultado(e.target.value)}
              rows={4} placeholder="Describe el resultado de la reunión y los compromisos acordados..."
              className="w-full rounded-xl text-sm outline-none transition-all resize-none"
              style={{ padding: "9px 13px", background: "#f8fafc", border: "1.5px solid #e4eaf3", color: "#0f172a", fontFamily: "inherit" }}
              onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; }}
            />
          </FormField>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setShowRes(null)}
              className="flex-1 rounded-xl text-sm font-semibold cursor-pointer border transition-all"
              style={{ padding: "9px 16px", background: "#fff", border: "1px solid #e8edf5", color: "#64748b" }}>
              Cancelar
            </button>
            <button onClick={confirmarAtendida} disabled={!resultado.trim()}
              className="flex-1 rounded-xl text-sm font-bold text-white border-0 cursor-pointer disabled:opacity-50"
              style={{ padding: "9px 16px", background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 3px 12px rgba(34,197,94,0.25)" }}>
              Confirmar atendida
            </button>
          </div>
        </div>
      </Modal>
      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="citación"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </ModuleLayout>
  );
}
