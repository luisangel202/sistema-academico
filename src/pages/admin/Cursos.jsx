import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, BookOpen, Search, Users, Trash, X, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge      from "../../components/Badge";
import Modal      from "../../components/Modal";
import { useToast } from "../../components/Toast";
import ModuleLayout, {
  FilterInput, FilterSelect,
  FormField, FormInput, FormSelect,
  ModalActions,
} from "../../components/ModuleLayout";
import { cursos as dataCursos, usuarios, periodos } from "../../data/mockData";

const NOMBRES_GRADO = ["Sexto","Séptimo","Octavo","Noveno","Décimo","Once"];
const JORNADAS      = ["mañana","tarde","noche","completa"];
const FORM_INI      = { grado: 6, grupo: "A", directorId: "", periodoId: 2, capacidad: 35, aula: "", jornada: "mañana" };

/* ── Checkbox reutilizable ── */
function Checkbox({ checked, indeterminate, onChange }) {
  return (
    <div onClick={e => { e.stopPropagation(); onChange(); }}
      style={{
        width: 18, height: 18, borderRadius: 5, cursor: "pointer",
        border: `2px solid ${checked || indeterminate ? "#2563eb" : "#d1d5db"}`,
        background: checked || indeterminate ? "#2563eb" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 150ms", flexShrink: 0,
      }}>
      {indeterminate && !checked
        ? <div style={{ width: 8, height: 2, background: "#fff", borderRadius: 2 }} />
        : checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      }
    </div>
  );
}

export default function Cursos() {
  const toast = useToast();
  const [cursos, setCursos]     = useInstState("er_cursos", dataCursos);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState("");
  const [filtroGrado, setFiltroGrado]     = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [form, setForm]                   = useState(FORM_INI);

  /* Selección múltiple */
  const [selected, setSelected]         = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const docentes = usuarios.filter(u => u.rol === "DOCENTE" || u.rol === "DIRECTOR_GRUPO");
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtrados = cursos.filter(c => {
    const matchSearch  = !search  || c.nombre.toLowerCase().includes(search.toLowerCase());
    const matchGrado   = filtroGrado   ? c.grado    === Number(filtroGrado)   : true;
    const matchPeriodo = filtroPeriodo ? c.periodoId === Number(filtroPeriodo) : true;
    return matchSearch && matchGrado && matchPeriodo;
  });

  /* Selección */
  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected  = filtrados.length > 0 && filtrados.every(c => selected.has(c.id));
  const someSelected = filtrados.some(c => selected.has(c.id));
  const toggleAll    = () => {
    if (allSelected) setSelected(prev => { const n = new Set(prev); filtrados.forEach(c => n.delete(c.id)); return n; });
    else             setSelected(prev => { const n = new Set(prev); filtrados.forEach(c => n.add(c.id)); return n; });
  };

  const eliminarSeleccionados = () => {
    const count = selected.size;
    setCursos(prev => prev.filter(c => !selected.has(c.id)));
    setSelected(new Set()); setConfirmDelete(false);
    toast.success(`${count} curso${count !== 1 ? "s" : ""} eliminado${count !== 1 ? "s" : ""}`);
  };

  const duplicado = () => cursos.some(c => c.grado === Number(form.grado) && c.grupo === form.grupo && c.periodoId === Number(form.periodoId));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (duplicado()) { toast.error(`Ya existe Grado ${form.grado}${form.grupo} en ese período`); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 350));
    setCursos(prev => [...prev, {
      id: Date.now(),
      nombre: `${NOMBRES_GRADO[form.grado - 6] || `Grado ${form.grado}`} ${form.grupo}`,
      grado: Number(form.grado), grupo: form.grupo,
      institucionId: 1, periodoId: Number(form.periodoId),
      directorId: Number(form.directorId) || null,
      estudiantes: 0, capacidad: Number(form.capacidad),
      aula: form.aula, jornada: form.jornada,
    }]);
    setShowModal(false); setForm(FORM_INI); setSubmitting(false);
    toast.success("Curso creado correctamente");
  };

  return (
    <ModuleLayout
      header={
        <PageHeader
          title="Cursos" subtitle="Grupos activos de la institución"
          icon={BookOpen} color="#3b82f6"
          action={
            <button onClick={() => { setShowModal(true); setForm(FORM_INI); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              <Plus size={14} /> Nuevo curso
            </button>
          }
        />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar curso..." icon={Search} />
        <FilterSelect value={filtroGrado} onChange={setFiltroGrado}>
          <option value="">Todos los grados</option>
          {[6,7,8,9,10,11].map(g => <option key={g} value={g}>Grado {g}</option>)}
        </FilterSelect>
        <FilterSelect value={filtroPeriodo} onChange={setFiltroPeriodo}>
          <option value="">Todos los períodos</option>
          {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </FilterSelect>
      </>}
      count={`${filtrados.length} curso${filtrados.length !== 1 ? "s" : ""}`}
      toolbar={
        selected.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>{selected.size} seleccionado{selected.size !== 1 ? "s" : ""}</span>
            <button onClick={() => setConfirmDelete(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "#fff1f2", border: "1px solid #fecdd3", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              <Trash size={13} /> Eliminar
            </button>
            <button onClick={() => setSelected(new Set())}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: "transparent", border: "none", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <X size={13} /> Cancelar
            </button>
          </div>
        )
      }
    >
      {/* Barra de selección total */}
      {filtrados.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e8edf5", marginBottom: 4 }}>
          <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} />
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            {allSelected ? "Deseleccionar todos" : `Seleccionar todos (${filtrados.length})`}
          </span>
        </div>
      )}

      {/* Grid de cards con checkbox */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtrados.map(c => {
          const isChecked = selected.has(c.id);
          const director = usuarios.find(u => u.id === c.directorId);
          const periodo  = periodos.find(p => p.id === c.periodoId);
          const pct      = c.capacidad ? Math.round((c.estudiantes / c.capacidad) * 100) : 0;
          const pctColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";

          return (
            <div key={c.id}
              onClick={() => toggleSelect(c.id)}
              className="rounded-2xl p-4 transition-all cursor-pointer"
              style={{
                background: isChecked ? "#eff6ff" : "#fff",
                border: `1.5px solid ${isChecked ? "#2563eb" : "#e8edf5"}`,
                boxShadow: isChecked ? "0 0 0 3px rgba(37,99,235,0.10)" : "0 1px 3px rgba(15,23,42,0.04)",
              }}
              onMouseEnter={e => { if (!isChecked) { e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.08)"; e.currentTarget.style.borderColor = "#c8d8f0"; } }}
              onMouseLeave={e => { if (!isChecked) { e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.04)"; e.currentTarget.style.borderColor = "#e8edf5"; } }}>

              {/* Header con checkbox */}
              <div className="flex items-center gap-3 mb-3">
                <div style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <Checkbox checked={isChecked} onChange={() => toggleSelect(c.id)} />
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <BookOpen size={15} style={{ color: "#2563eb" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "#1e293b" }}>{c.nombre}</p>
                  <p className="text-xs capitalize" style={{ color: "#94a3b8" }}>
                    Grado {c.grado}{c.jornada ? ` · ${c.jornada}` : ""}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "#94a3b8" }}>Director</span>
                  <span className="font-medium truncate ml-2 max-w-[120px] text-right" style={{ color: director ? "#374151" : "#cbd5e1" }}>
                    {director?.nombre || "Sin asignar"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "#94a3b8" }}>Estudiantes</span>
                  <span className="font-semibold" style={{ color: "#374151" }}>{c.estudiantes}{c.capacidad ? `/${c.capacidad}` : ""}</span>
                </div>
                {c.aula && (
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "#94a3b8" }}>Aula</span>
                    <span className="font-medium" style={{ color: "#374151" }}>{c.aula}</span>
                  </div>
                )}
              </div>

              {c.capacidad > 0 && (
                <div className="mb-3">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: pctColor }} />
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: "#94a3b8" }}>{pct}% de capacidad</p>
                </div>
              )}

              <Badge label={periodo?.estado || "pendiente"} variant={periodo?.estado || "pendiente"} dot />
            </div>
          );
        })}

        {filtrados.length === 0 && (
          <div className="col-span-4 py-16 text-center" style={{ color: "#94a3b8" }}>
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hay cursos que coincidan</p>
          </div>
        )}
      </div>

      {/* Modal nuevo curso */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(FORM_INI); }} title="Nuevo Curso" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Grado" required><FormSelect value={form.grado} onChange={e => f("grado", e.target.value)}>{[6,7,8,9,10,11].map(g => <option key={g} value={g}>Grado {g}</option>)}</FormSelect></FormField>
            <FormField label="Grupo" required><FormSelect value={form.grupo} onChange={e => f("grupo", e.target.value)}>{["A","B","C","D"].map(g => <option key={g} value={g}>{g}</option>)}</FormSelect></FormField>
            <FormField label="Jornada"><FormSelect value={form.jornada} onChange={e => f("jornada", e.target.value)}>{JORNADAS.map(j => <option key={j} value={j}>{j}</option>)}</FormSelect></FormField>
            <FormField label="Aula"><FormInput value={form.aula} placeholder="Ej: Aula 3" onChange={e => f("aula", e.target.value)} /></FormField>
            <FormField label="Capacidad"><FormInput type="number" min="1" max="50" value={form.capacidad} onChange={e => f("capacidad", e.target.value)} /></FormField>
            <FormField label="Director de Grupo">
              <FormSelect value={form.directorId} onChange={e => f("directorId", e.target.value)}>
                <option value="">Sin asignar</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </FormSelect>
            </FormField>
          </div>
          <FormField label="Período Académico" required><FormSelect value={form.periodoId} onChange={e => f("periodoId", e.target.value)}>{periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</FormSelect></FormField>
          <ModalActions onCancel={() => { setShowModal(false); setForm(FORM_INI); }} submitLabel="Crear Curso" loading={submitting} />
        </form>
      </Modal>

      {/* Modal confirmar eliminación masiva */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Eliminar cursos seleccionados" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
            <AlertTriangle size={18} style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 14, color: "#9f1239", lineHeight: 1.6 }}>
              ¿Eliminar <strong>{selected.size} curso{selected.size !== 1 ? "s" : ""}</strong>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border" style={{ background: "#fff", color: "#64748b", borderColor: "#e8edf5" }}>Cancelar</button>
            <button onClick={eliminarSeleccionados} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer" style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 3px 12px rgba(239,68,68,0.30)" }}>
              Eliminar {selected.size}
            </button>
          </div>
        </div>
      </Modal>
    </ModuleLayout>
  );
}
