import { X } from "lucide-react";
import { useEffect } from "react";

const sizes = {
  sm:   440,
  md:   560,
  lg:   760,
  xl:   960,
  full: "calc(100vw - 32px)",
};

export default function Modal({ open, onClose, title, children, size = "md", icon: Icon, iconColor = "#3b82f6" }) {
  /* Escape */
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  /* Bloquear scroll */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const maxW = typeof sizes[size] === "number" ? `${sizes[size]}px` : sizes[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto animate-fade-in"
      style={{
        backgroundColor: "rgba(15,23,42,0.60)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full mb-10 animate-scale-in"
        style={{
          maxWidth: maxW,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(15,23,42,0.22), 0 6px 20px rgba(15,23,42,0.10)",
          border: "1px solid #e8edf5",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 5rem)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #f4f6fb" }}>
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${iconColor}12`,
                  border: `1.5px solid ${iconColor}20`,
                }}>
                <Icon size={17} style={{ color: iconColor }} />
              </div>
            )}
            {!Icon && (
              <div className="w-1 h-5 rounded-full flex-shrink-0"
                style={{ background: "linear-gradient(180deg, #3b82f6, #6366f1)" }} />
            )}
            <h3 className="font-bold text-base leading-tight truncate"
              style={{ color: "#0f172a" }}>
              {title}
            </h3>
          </div>

          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border-0 cursor-pointer
              transition-all flex-shrink-0 ml-4"
            style={{ background: "#f4f6fb", color: "#94a3b8", border: "1px solid #e8edf5" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fecdd3"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f4f6fb"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e8edf5"; }}>
            <X size={15} />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
