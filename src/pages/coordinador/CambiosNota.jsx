import { useState } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Search, FileText, ArrowRight, Trash2, CheckCircle } from "lucide-react";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import { useToast } from "../../components/Toast";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import ModuleLayout, { FilterInput, FilterSelect } from "../../components/ModuleLayout";
import { solicitudesCambioNota, usuarios, materias } from "../../data/mockData";

export default function CambiosNota() {
  const [solicitudes, setSolicitudes] = useInstState("er_cambios_nota", solicitudesCambioNota);
  const [search, setSearch]           = useState("");
  const [filtroEstado, setFiltroEstado]   = useState("");
  const [filtroDocente, setFiltroDocente] = useState("");
  const [confirmDel, setConfirmDel]       = useState(false);
  const toast = useToast();

  const aprobar  = (id) => setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: "aprobado"  } : s));
  const rechazar = (id) => setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: "rechazado" } : s));

  const docentes = [...new Map(solicitudes.map(s => {
    const d = usuarios.find(u => u.id === s.docenteId);
    return [s.docenteId, d];
  })).values()].filter(Boolean);

  const filtradas = solicitudes.filter(s => {
    const docente    = usuarios.find(u => u.id === s.docenteId);
    const estudiante = usuarios.find(u => u.id === s.estudianteId);
    const materia    = materias.find(m => m.id === s.materiaId);
    const q = search.toLowerCase();
    const matchSearch  = !search || (estudiante?.nombre || "").toLowerCase().includes(q) || (materia?.nombre || "").toLowerCase().includes(q) || (s.motivo || "").toLowerCase().includes(q);
    const matchEstado  = filtroEstado  ? s.estado === filtroEstado         : true;
    const matchDocente = filtroDocente ? s.docenteId === Number(filtroDocente) : true;
    return matchSearch && matchEstado && matchDocente;
  });

  const bulk = useBulkSelect(filtradas);
  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setSolicitudes);
    setConfirmDel(false);
    toast.success(`${count} solicitud${count !== 1 ? "es" : ""} eliminada${count !== 1 ? "s" : ""}`);
  };

  const estadoVariant = { aprobado: "success", rechazado: "danger", pendiente: "warning" };

  return (
    <ModuleLayout
      header={
        <PageHeader title="Cambios de Nota" subtitle="Revisa y aprueba los cambios solicitados por docentes"
          icon={FileText} color="#f59e0b" />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar estudiante, materia..." icon={Search} />
        <FilterSelect value={filtroEstado} onChange={setFiltroEstado}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </FilterSelect>
        <FilterSelect value={filtroDocente} onChange={setFiltroDocente}>
          <option value="">Todos los docentes</option>
          {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
        </FilterSelect>
      </>}
      count={`${filtradas.length} solicitud${filtradas.length !== 1 ? "es" : ""}`}
      toolbar={bulk.count > 0 && (
        <BulkBar count={bulk.count} label="solicitud"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}
    >
      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtradas.length} onToggleAll={bulk.toggleAll} label="solicitud" />

      <div className="space-y-3">
        {filtradas.map(s => {
          const docente    = usuarios.find(u => u.id === s.docenteId);
          const estudiante = usuarios.find(u => u.id === s.estudianteId);
          const materia    = materias.find(m => m.id === s.materiaId);
          const isChecked  = bulk.selected.has(s.id);

          return (
            <div key={s.id} className="rounded-2xl overflow-hidden"
              style={{ background: isChecked ? "#f0f7ff" : "#fff", border: `1.5px solid ${isChecked ? "#2563eb" : "#e8edf5"}`, boxShadow: "0 1px 3px rgba(15,23,42,0.04)", cursor: "pointer" }}
              onClick={() => bulk.toggle(s.id)}>

              {/* Header */}
              <div className="flex items-start justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #f4f6fb" }}>
                <div className="flex items-center gap-3 min-w-0 mr-4">
                  <div onClick={e => e.stopPropagation()}>
                    <Checkbox checked={isChecked} onChange={() => bulk.toggle(s.id)} />
                  </div>
                  <p className="text-sm font-bold" style={{ color: "#1e293b" }}>
                    {estudiante?.nombre || "Estudiante desconocido"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                    {materia?.nombre || "Sin materia"} · Docente: {docente?.nombre || "—"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{s.fecha}</p>
                </div>
                <Badge label={s.estado} variant={estadoVariant[s.estado] || "info"} dot />
              </div>

              {/* Notas + motivo */}
              <div className="px-5 py-4">
                {/* Cambio de nota */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex flex-col items-center px-4 py-3 rounded-xl flex-1"
                    style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>Anterior</p>
                    <p className="text-2xl font-black" style={{ color: "#dc2626" }}>{s.notaAnterior}</p>
                  </div>
                  <div className="flex-shrink-0" style={{ color: "#94a3b8" }}>
                    <ArrowRight size={18} />
                  </div>
                  <div className="flex flex-col items-center px-4 py-3 rounded-xl flex-1"
                    style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>Nueva</p>
                    <p className="text-2xl font-black" style={{ color: "#16a34a" }}>{s.notaNueva}</p>
                  </div>
                </div>

                {/* Motivo */}
                <div className="px-3 py-2.5 rounded-xl mb-4"
                  style={{ background: "#f8fafc", border: "1px solid #e8edf5" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>Motivo</p>
                  <p className="text-sm" style={{ color: "#374151" }}>{s.motivo}</p>
                </div>

                {/* Acciones */}
                {s.estado === "pendiente" && (
                  <div className="flex gap-2">
                    <button onClick={() => aprobar(s.id)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all"
                      style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 3px 12px rgba(34,197,94,0.25)" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 5px 18px rgba(34,197,94,0.40)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 3px 12px rgba(34,197,94,0.25)"}>
                      ✓ Aprobar
                    </button>
                    <button onClick={() => rechazar(s.id)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all border"
                      style={{ background: "#fff", color: "#dc2626", borderColor: "#fecdd3" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
                      ✗ Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtradas.length === 0 && (
          <div className="py-16 text-center" style={{ color: "#94a3b8" }}>
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hay solicitudes que coincidan</p>
          </div>
        )}
      </div>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="solicitud"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </ModuleLayout>
  );
}
