import { useState } from "react";
import { useInstState } from "../hooks/useInstState";
import { Bell, CheckCircle, AlertTriangle, Info, Search, CheckCheck, Trash, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ModuleLayout, { FilterInput, FilterSelect } from "../components/ModuleLayout";
import { alertas as dataAlertas } from "../data/mockData";
import { useToast } from "../components/Toast";

const nivelCfg = {
  alto:  { dot: "#ef4444", bg: "#fff1f2", border: "#fecdd3", icon: AlertTriangle, iconColor: "#ef4444", badgeBg: "#fee2e2", badgeText: "#dc2626" },
  medio: { dot: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: AlertTriangle, iconColor: "#f59e0b", badgeBg: "#fef3c7", badgeText: "#d97706" },
  info:  { dot: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", icon: Info,          iconColor: "#3b82f6", badgeBg: "#dbeafe", badgeText: "#2563eb" },
};

/* ── Checkbox ── */
function Checkbox({ checked, indeterminate, onChange }) {
  return (
    <div onClick={e => { e.stopPropagation(); onChange(); }}
      style={{
        width: 17, height: 17, borderRadius: 5, cursor: "pointer", flexShrink: 0,
        border: `2px solid ${checked || indeterminate ? "#2563eb" : "#d1d5db"}`,
        background: checked || indeterminate ? "#2563eb" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 150ms",
      }}>
      {indeterminate && !checked
        ? <div style={{ width: 7, height: 2, background: "#fff", borderRadius: 2 }} />
        : checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      }
    </div>
  );
}

export default function Alertas() {
  const toast = useToast();
  const [alertas, setAlertas]         = useInstState("er_alertas", dataAlertas);
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroLeida, setFiltroLeida] = useState("");
  const [search, setSearch]           = useState("");

  /* Selección múltiple */
  const [selected, setSelected] = useState(new Set());

  const marcarLeida = (id) => setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
  const marcarTodas = ()   => setAlertas(prev => prev.map(a => ({ ...a, leida: true })));

  const noLeidas = alertas.filter(a => !a.leida).length;

  const filtradas = alertas.filter(a => {
    const matchNivel  = filtroNivel ? a.nivel === filtroNivel : true;
    const matchLeida  = filtroLeida === "leida" ? a.leida : filtroLeida === "no_leida" ? !a.leida : true;
    const matchSearch = !search || a.mensaje.toLowerCase().includes(search.toLowerCase());
    return matchNivel && matchLeida && matchSearch;
  });

  /* Selección */
  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected  = filtradas.length > 0 && filtradas.every(a => selected.has(a.id));
  const someSelected = filtradas.some(a => selected.has(a.id));
  const toggleAll    = () => {
    if (allSelected) setSelected(prev => { const n = new Set(prev); filtradas.forEach(a => n.delete(a.id)); return n; });
    else             setSelected(prev => { const n = new Set(prev); filtradas.forEach(a => n.add(a.id)); return n; });
  };

  /* Eliminar seleccionados */
  const eliminarSeleccionados = () => {
    const count = selected.size;
    setAlertas(prev => prev.filter(a => !selected.has(a.id)));
    setSelected(new Set());
    toast.success(`${count} alerta${count !== 1 ? "s" : ""} eliminada${count !== 1 ? "s" : ""}`);
  };

  /* Marcar seleccionadas como leídas */
  const marcarSeleccionadasLeidas = () => {
    const count = selected.size;
    setAlertas(prev => prev.map(a => selected.has(a.id) ? { ...a, leida: true } : a));
    setSelected(new Set());
    toast.success(`${count} alerta${count !== 1 ? "s" : ""} marcada${count !== 1 ? "s" : ""} como leída${count !== 1 ? "s" : ""}`);
  };

  return (
    <ModuleLayout
      header={
        <PageHeader
          title="Alertas"
          subtitle={noLeidas > 0 ? `${noLeidas} alerta${noLeidas > 1 ? "s" : ""} sin leer` : "Todo al día"}
          icon={Bell} color="#f59e0b"
          action={
            <div style={{ display: "flex", gap: 8 }}>
              {noLeidas > 0 && (
                <button onClick={marcarTodas}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 11, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 150ms" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; }}>
                  <CheckCheck size={14} /> Marcar todas leídas
                </button>
              )}
            </div>
          }
        />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar alerta..." icon={Search} />
        <FilterSelect value={filtroNivel} onChange={setFiltroNivel}>
          <option value="">Todos los niveles</option>
          <option value="alto">Alto</option>
          <option value="medio">Medio</option>
          <option value="info">Informativo</option>
        </FilterSelect>
        <FilterSelect value={filtroLeida} onChange={setFiltroLeida}>
          <option value="">Todas</option>
          <option value="no_leida">Sin leer</option>
          <option value="leida">Leídas</option>
        </FilterSelect>
      </>}
      count={`${filtradas.length} alerta${filtradas.length !== 1 ? "s" : ""}`}
      toolbar={
        selected.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>{selected.size} seleccionada{selected.size !== 1 ? "s" : ""}</span>
            <button onClick={marcarSeleccionadasLeidas}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              <CheckCircle size={13} /> Marcar leídas
            </button>
            <button onClick={eliminarSeleccionados}
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
      {/* Barra seleccionar todos */}
      {filtradas.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e8edf5" }}>
          <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} />
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            {allSelected ? "Deseleccionar todas" : `Seleccionar todas (${filtradas.length})`}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {filtradas.map(a => {
          const cfg      = nivelCfg[a.nivel] || nivelCfg.info;
          const IconCmp  = cfg.icon;
          const isChecked = selected.has(a.id);

          return (
            <div key={a.id}
              onClick={() => toggleSelect(a.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "14px 16px", borderRadius: 16,
                cursor: "pointer", transition: "all 150ms",
                background: isChecked ? "#eff6ff" : a.leida ? "#fafbff" : cfg.bg,
                border: `1.5px solid ${isChecked ? "#2563eb" : a.leida ? "#e8edf5" : cfg.border}`,
                opacity: a.leida && !isChecked ? 0.65 : 1,
                boxShadow: isChecked ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
              }}>

              {/* Checkbox */}
              <div style={{ marginTop: 2 }}>
                <Checkbox checked={isChecked} onChange={() => toggleSelect(a.id)} />
              </div>

              {/* Ícono nivel */}
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: a.leida ? "#f1f5f9" : `${cfg.dot}18` }}>
                <IconCmp size={15} style={{ color: a.leida ? "#94a3b8" : cfg.iconColor }} />
              </div>

              {/* Contenido */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: a.leida ? "#94a3b8" : "#374151", fontWeight: a.leida ? 400 : 500, lineHeight: 1.55, margin: 0 }}>
                  {a.mensaje}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{a.fecha}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, textTransform: "capitalize", background: cfg.badgeBg, color: cfg.badgeText }}>
                    {a.nivel}
                  </span>
                  {a.leida && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
                      <CheckCircle size={11} /> Leída
                    </span>
                  )}
                </div>
              </div>

              {/* Acción marcar leída */}
              {!a.leida && (
                <button onClick={e => { e.stopPropagation(); marcarLeida(a.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.75)", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, transition: "all 150ms" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#374151"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.75)"; e.currentTarget.style.color = "#64748b"; }}>
                  <CheckCircle size={12} /> Leída
                </button>
              )}
            </div>
          );
        })}

        {filtradas.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Bell size={24} style={{ opacity: 0.3 }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>Sin alertas</p>
            <p style={{ fontSize: 13, margin: 0 }}>No hay alertas que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
