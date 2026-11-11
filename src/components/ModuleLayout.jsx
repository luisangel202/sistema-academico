/**
 * ModuleLayout — estructura estándar para todos los módulos.
 * Uso:
 *   <ModuleLayout
 *     header={<PageHeader ... />}
 *     filters={<> ... </>}           // opcional
 *     count="12 registros"           // opcional
 *     toolbar={<button>...</button>} // opcional, va junto al count
 *   >
 *     {contenido principal}
 *   </ModuleLayout>
 */
export default function ModuleLayout({ header, filters, count, toolbar, children }) {
  return (
    <div className="space-y-4">
      {/* Cabecera de página */}
      {header}

      {/* Barra de filtros — solo si hay filtros */}
      {filters && (
        <div className="rounded-2xl px-3 py-3 flex flex-wrap gap-2 items-center"
          style={{
            background: "#fff",
            border: "1px solid #e8edf5",
            boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
          }}>
          {filters}
        </div>
      )}

      {/* Línea de conteo + acciones extras */}
      {(count || toolbar) && (
        <div className="flex items-center justify-between px-1">
          {count && (
            <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>{count}</p>
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {/* Contenido */}
      {children}
    </div>
  );
}

/* ── Subcomponente: DataTable ──────────────────────────────────────── */
export function DataTable({ columns, children, empty }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid #e8edf5",
        boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
      }}>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 480 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f0f4fa" }}>
              {columns.map((col, i) => (
                <th key={i}
                  className={col.hidden || ""}
                  style={{
                    textAlign: "left",
                    padding: "10px 18px",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#94a3b8",
                    whiteSpace: "nowrap",
                  }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children}
          </tbody>
        </table>
      </div>
      {empty && (
        <div className="py-14 text-center" style={{ color: "#94a3b8" }}>
          <p className="text-sm font-medium">{empty}</p>
        </div>
      )}
    </div>
  );
}

/* ── Subcomponente: TableRow ───────────────────────────────────────── */
export function TableRow({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      style={{ borderBottom: "1px solid #f8fafc", cursor: onClick ? "pointer" : "default" }}
      onMouseEnter={e => { e.currentTarget.style.background = "#f8faff"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
      {children}
    </tr>
  );
}

/* ── Subcomponente: Td ─────────────────────────────────────────────── */
export function Td({ children, hidden, muted }) {
  return (
    <td className={hidden || ""}
      style={{
        padding: "11px 18px",
        fontSize: 13.5,
        color: muted ? "#94a3b8" : "#374151",
        verticalAlign: "middle",
      }}>
      {children}
    </td>
  );
}

/* ── Subcomponente: FilterInput ───────────────────────────────────── */
export function FilterInput({ value, onChange, placeholder, icon: Icon }) {
  return (
    <div style={{ flex: "1 1 140px", minWidth: 0 }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl text-sm outline-none transition-all font-medium"
        style={{
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 8,
          paddingBottom: 8,
          background: "#f8fafc",
          border: "1.5px solid #e4eaf3",
          color: "#0f172a",
          minWidth: 0,
          width: "100%",
        }}
        onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
        onBlur={e => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

/* ── Subcomponente: FilterSelect ──────────────────────────────────── */
export function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="rounded-xl text-sm outline-none transition-all font-medium"
      style={{
        padding: "8px 28px 8px 10px",
        background: "#f8fafc",
        border: "1.5px solid #e4eaf3",
        color: "#374151",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: "right 6px center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "14px",
        flex: "1 1 120px",
        minWidth: 0,
        maxWidth: "100%",
      }}
      onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
      onBlur={e => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; }}>
      {children}
    </select>
  );
}

/* ── Subcomponente: FormField ─────────────────────────────────────── */
export function FormField({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
        style={{ color: "#64748b" }}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Subcomponente: FormInput ─────────────────────────────────────── */
export function FormInput({ error, ...props }) {
  return (
    <input
      {...props}
      className="w-full rounded-xl text-sm outline-none transition-all font-medium"
      style={{
        padding: "9px 13px",
        background: "#f8fafc",
        border: `1.5px solid ${error ? "#fca5a5" : "#e4eaf3"}`,
        color: "#0f172a",
        fontFamily: "inherit",
      }}
      onFocus={e => { e.target.style.borderColor = error ? "#f87171" : "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
      onBlur={e => { e.target.style.borderColor = error ? "#fca5a5" : "#e4eaf3"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
    />
  );
}

/* ── Subcomponente: FormSelect ────────────────────────────────────── */
export function FormSelect({ error, children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-xl text-sm outline-none transition-all font-medium"
      style={{
        padding: "9px 30px 9px 13px",
        background: "#f8fafc",
        border: `1.5px solid ${error ? "#fca5a5" : "#e4eaf3"}`,
        color: "#374151",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: "right 10px center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "14px",
        fontFamily: "inherit",
      }}
      onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
      onBlur={e => { e.target.style.borderColor = error ? "#fca5a5" : "#e4eaf3"; e.target.style.background = "#f8fafc"; }}>
      {children}
    </select>
  );
}

/* ── Subcomponente: ActionBtn ─────────────────────────────────────── */
export function ActionBtn({ icon: Icon, title, color = "blue", onClick }) {
  const colors = {
    blue:   { text: "#3b82f6", bg: "#eff6ff" },
    red:    { text: "#ef4444", bg: "#fff1f2" },
    orange: { text: "#f97316", bg: "#fff7ed" },
    green:  { text: "#22c55e", bg: "#f0fdf4" },
    gray:   { text: "#94a3b8", bg: "#f8fafc" },
  };
  const c = colors[color] || colors.gray;

  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-lg border-0 cursor-pointer transition-all flex-shrink-0"
      style={{ color: "#94a3b8", background: "transparent" }}
      onMouseEnter={e => { e.currentTarget.style.color = c.text; e.currentTarget.style.background = c.bg; }}
      onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}>
      <Icon size={14} />
    </button>
  );
}

/* ── Subcomponente: ModalActions ──────────────────────────────────── */
export function ModalActions({ onCancel, submitLabel = "Guardar", loading }) {
  return (
    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid #f4f6fb", marginTop: 4 }}>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-xl text-sm font-semibold cursor-pointer border transition-all"
        style={{
          padding: "9px 16px",
          background: "#fff",
          border: "1px solid #e8edf5",
          color: "#64748b",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
        Cancelar
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 rounded-xl text-sm font-bold text-white border-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
        style={{
          padding: "9px 16px",
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
          boxShadow: "0 3px 12px rgba(37,99,235,0.22)",
        }}
        onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 5px 18px rgba(37,99,235,0.35)")}
        onMouseLeave={e => !loading && (e.currentTarget.style.boxShadow = "0 3px 12px rgba(37,99,235,0.22)")}>
        {loading
          ? <><span className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />Guardando...</>
          : submitLabel}
      </button>
    </div>
  );
}
