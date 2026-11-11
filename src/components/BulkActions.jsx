import { Trash, X, CheckSquare } from "lucide-react";

/* ── Checkbox ─────────────────────────────────────────── */
export function Checkbox({ checked, indeterminate, onChange }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange(); }}
      style={{
        width: 17, height: 17, borderRadius: 5,
        border: `2px solid ${checked || indeterminate ? "#2563eb" : "#d1d5db"}`,
        background: checked || indeterminate ? "#2563eb" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0, transition: "all 150ms",
      }}>
      {indeterminate && !checked
        ? <div style={{ width: 7, height: 2, background: "#fff", borderRadius: 2 }} />
        : checked && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
      }
    </div>
  );
}

/* ── Barra de acciones masivas ────────────────────────── */
export function BulkBar({ count, onDelete, onClear, extraActions = [], label = "seleccionado" }) {
  const plural = count !== 1;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      padding: "8px 14px", borderRadius: 12,
      background: "#eff6ff", border: "1px solid #bfdbfe",
    }}>
      <CheckSquare size={15} style={{ color: "#2563eb", flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
        {count} {label}{plural ? "s" : ""}
      </span>

      {extraActions.map((a, i) => (
        <button key={i} onClick={a.onClick}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8,
            background: a.bg || "#f0fdf4", border: `1px solid ${a.border || "#bbf7d0"}`,
            color: a.color || "#16a34a", fontSize: 12, fontWeight: 700,
            cursor: "pointer", transition: "opacity 150ms",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
          {a.icon && <a.icon size={13} />} {a.label}
        </button>
      ))}

      <button onClick={onDelete}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 8,
          background: "#fff1f2", border: "1px solid #fecdd3",
          color: "#dc2626", fontSize: 12, fontWeight: 700,
          cursor: "pointer", transition: "all 150ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#fff1f2"; }}>
        <Trash size={13} /> Eliminar
      </button>

      <button onClick={onClear}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "5px 10px", borderRadius: 8,
          background: "transparent", border: "none",
          color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>
        <X size={13} /> Cancelar
      </button>
    </div>
  );
}

/* ── Barra Seleccionar todos ──────────────────────────── */
export function SelectAllBar({ allSelected, someSelected, count, onToggleAll, label = "elemento" }) {
  const plural = count !== 1;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 14px", borderRadius: 12,
      background: "#f8fafc", border: "1px solid #e8edf5",
      cursor: "pointer",
    }} onClick={onToggleAll}>
      <Checkbox
        checked={allSelected}
        indeterminate={someSelected && !allSelected}
        onChange={onToggleAll}
      />
      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500, userSelect: "none" }}>
        {allSelected
          ? `Deseleccionar todo${plural ? "s" : ""}`
          : `Seleccionar todo${plural ? "s" : ""} (${count})`}
      </span>
    </div>
  );
}

/* ── Modal confirmación eliminación ──────────────────── */
export function ConfirmDeleteModal({ open, count, itemLabel = "elemento", onConfirm, onCancel }) {
  if (!open) return null;
  const plural = count !== 1;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onCancel}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420,
        padding: "28px 24px",
        boxShadow: "0 24px 64px rgba(15,23,42,0.22)",
        border: "1px solid #e8edf5",
      }} onClick={e => e.stopPropagation()}>

        <div style={{
          display: "flex", alignItems: "flex-start", gap: 14,
          padding: "14px 16px", borderRadius: 14,
          background: "#fff1f2", border: "1px solid #fecdd3", marginBottom: 20,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Trash size={16} style={{ color: "#dc2626" }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#9f1239", margin: "0 0 4px" }}>
              Eliminar {count} {itemLabel}{plural ? "s" : ""}
            </p>
            <p style={{ fontSize: 13, color: "#be123c", margin: 0, lineHeight: 1.6 }}>
              Esta acción no se puede deshacer. ¿Deseas continuar?
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 12,
              background: "#fff", border: "1.5px solid #e8edf5",
              color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
            Cancelar
          </button>
          <button onClick={onConfirm}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 12,
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(239,68,68,0.28)",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(239,68,68,0.40)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(239,68,68,0.28)"; }}>
            Eliminar {count}
          </button>
        </div>
      </div>
    </div>
  );
}
