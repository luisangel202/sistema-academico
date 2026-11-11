const variants = {
  success:   { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  warning:   { bg: "#fffbeb", text: "#92400e", border: "#fde68a", dot: "#f59e0b" },
  danger:    { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3", dot: "#f43f5e" },
  info:      { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", dot: "#3b82f6" },
  gray:      { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" },
  purple:    { bg: "#faf5ff", text: "#5b21b6", border: "#ddd6fe", dot: "#8b5cf6" },
  orange:    { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa", dot: "#f97316" },
  teal:      { bg: "#f0fdfa", text: "#134e4a", border: "#99f6e4", dot: "#14b8a6" },
  indigo:    { bg: "#eef2ff", text: "#3730a3", border: "#c7d2fe", dot: "#6366f1" },
  // Aliases semánticos
  activo:    { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  inactivo:  { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3", dot: "#f43f5e" },
  pendiente: { bg: "#fffbeb", text: "#92400e", border: "#fde68a", dot: "#f59e0b" },
  cerrado:   { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" },
  publicada: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  activa:    { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", dot: "#3b82f6" },
  vencida:   { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3", dot: "#f43f5e" },
  premium:   { bg: "#faf5ff", text: "#5b21b6", border: "#ddd6fe", dot: "#8b5cf6" },
  basica:    { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" },
  exento:    { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
};

export default function Badge({ label, variant = "info", dot = false, size = "sm" }) {
  const v = variants[variant] || variants.info;
  const paddings = size === "sm" ? "2px 8px" : "4px 12px";
  const fontSize = size === "sm" ? "11px" : "12px";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-semibold"
      style={{
        background: v.bg,
        color: v.text,
        border: `1px solid ${v.border}`,
        padding: paddings,
        fontSize,
        lineHeight: "1.6",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: v.dot }} />
      )}
      {label}
    </span>
  );
}
