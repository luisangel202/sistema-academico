/* ═══════════════════════════════════════════════════════
   PageHeader — cabecera estándar de todas las páginas
   Totalmente responsive: en móvil apila título y acción
   Props: title, subtitle, action, icon, color, breadcrumb
═══════════════════════════════════════════════════════ */
export default function PageHeader({
  title, subtitle, action,
  icon: Icon, color = "#2563eb",
  breadcrumb,
}) {
  return (
    <div style={{ marginBottom: 20 }}>

      {/* Fila principal — en móvil se apila, en desktop se pone en fila */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}>
        {/* Izquierda: ícono + textos */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: "1 1 200px" }}>

          {/* Ícono */}
          {Icon && (
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${color}12`,
              border: `1.5px solid ${color}24`,
            }}>
              <Icon size={18} style={{ color }} />
            </div>
          )}

          {/* Textos */}
          <div style={{ minWidth: 0, flex: 1 }}>
            {breadcrumb && (
              <p style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 2, margin: "0 0 2px",
              }}>
                {breadcrumb}
              </p>
            )}
            <h1 style={{
              fontSize: "clamp(16px, 4vw, 22px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontSize: 12,
                color: "#64748b",
                marginTop: 3,
                lineHeight: 1.5,
                margin: "3px 0 0",
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Acción — en móvil ocupa ancho completo si es necesario */}
        {action && (
          <div style={{
            flexShrink: 0,
            alignSelf: "flex-start",
          }}>
            {/* Wrapper que permite scroll horizontal si hay muchos botones */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}>
              {action}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
