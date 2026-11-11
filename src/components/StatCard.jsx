/* ═══════════════════════════════════════════════════════
   StatCard — versión unificada
   Usa un sistema de paleta consistente.
   Diseño: ícono a la izquierda con fondo de color,
   número grande, título pequeño arriba, subtítulo abajo.
═══════════════════════════════════════════════════════ */

const P = {
  blue:   { accent: "#2563eb", light: "#eff6ff",  border: "#bfdbfe", glow: "rgba(37,99,235,0.14)"  },
  green:  { accent: "#059669", light: "#f0fdf4",  border: "#bbf7d0", glow: "rgba(5,150,105,0.14)"  },
  yellow: { accent: "#d97706", light: "#fffbeb",  border: "#fde68a", glow: "rgba(217,119,6,0.14)"  },
  red:    { accent: "#dc2626", light: "#fff1f2",  border: "#fecdd3", glow: "rgba(220,38,38,0.14)"  },
  purple: { accent: "#7c3aed", light: "#faf5ff",  border: "#ddd6fe", glow: "rgba(124,58,237,0.14)" },
  indigo: { accent: "#4f46e5", light: "#eef2ff",  border: "#c7d2fe", glow: "rgba(79,70,229,0.14)"  },
  orange: { accent: "#ea580c", light: "#fff7ed",  border: "#fed7aa", glow: "rgba(234,88,12,0.14)"  },
  teal:   { accent: "#0d9488", light: "#f0fdfa",  border: "#99f6e4", glow: "rgba(13,148,136,0.14)" },
  pink:   { accent: "#db2777", light: "#fdf2f8",  border: "#fbcfe8", glow: "rgba(219,39,119,0.14)" },
  sky:    { accent: "#0284c7", light: "#f0f9ff",  border: "#bae6fd", glow: "rgba(2,132,199,0.14)"  },
};

export default function StatCard({
  title, value, subtitle,
  icon: Icon, color = "blue",
  trend, onClick,
}) {
  const p = P[color] || P.blue;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#ffffff",
        border: "1px solid #e8edf5",
        borderRadius: 18,
        boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 200ms ease",
        overflow: "hidden",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 28px ${p.glow}, 0 2px 6px rgba(15,23,42,0.04)`;
        e.currentTarget.style.borderColor = p.border;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.05)";
        e.currentTarget.style.borderColor = "#e8edf5";
      }}
    >
      {/* Punto de acento superior derecho */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        width: 8, height: 8, borderRadius: "50%",
        background: p.accent, opacity: 0.35,
      }} />

      <div style={{ padding: "18px 16px", display: "flex", alignItems: "center", gap: 14 }}>

        {/* Ícono */}
        {Icon && (
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: p.light,
            border: `1.5px solid ${p.border}`,
          }}>
            <Icon size={20} style={{ color: p.accent }} />
          </div>
        )}

        {/* Contenido */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.07em", color: "#94a3b8",
            marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {title}
          </p>

          <p style={{
            fontSize: 28, fontWeight: 900, lineHeight: 1.05,
            letterSpacing: "-0.02em", color: "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {value}
          </p>

          {subtitle && (
            <p style={{
              fontSize: 12, color: "#94a3b8", marginTop: 4,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {subtitle}
            </p>
          )}

          {trend !== undefined && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              marginTop: 6, fontSize: 11, fontWeight: 700,
              padding: "2px 8px", borderRadius: 99,
              background: trend > 0 ? "#f0fdf4" : trend < 0 ? "#fff1f2" : "#f8fafc",
              color: trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "#64748b",
            }}>
              {trend > 0 ? "↑" : trend < 0 ? "↓" : "—"}
              {trend !== 0 && ` ${Math.abs(trend)}%`}
            </span>
          )}
        </div>
      </div>

      {/* Barra inferior de color */}
      <div style={{
        height: 3, background: `linear-gradient(90deg,${p.accent},${p.accent}50,transparent)`,
      }} />
    </div>
  );
}
