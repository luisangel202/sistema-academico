import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const CONFIG = {
  success: {
    icon: CheckCircle,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    bar: "#22c55e",
  },
  error: {
    icon: XCircle,
    color: "#dc2626",
    bg: "#fff1f2",
    border: "#fecdd3",
    bar: "#ef4444",
  },
  warning: {
    icon: AlertTriangle,
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    bar: "#f59e0b",
  },
  info: {
    icon: Info,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    bar: "#3b82f6",
  },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cfg = CONFIG[toast.type] || CONFIG.info;
  const IconComp = cfg.icon;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10);
    const t2 = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onRemove(toast.id), 280);
    }, toast.duration || 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const close = () => { setLeaving(true); setTimeout(() => onRemove(toast.id), 280); };

  return (
    <div
      className="relative overflow-hidden transition-all duration-280"
      style={{
        background: "#fff",
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        boxShadow: "0 8px 28px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)",
        minWidth: 288,
        maxWidth: 360,
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(24px) scale(0.97)",
        opacity: visible && !leaving ? 1 : 0,
      }}
    >
      {/* Barra lateral de color */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[14px]"
        style={{ background: cfg.bar }} />

      {/* Icono */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${cfg.bg}`, border: `1px solid ${cfg.border}` }}>
        <IconComp size={15} style={{ color: cfg.color }} />
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0 pr-2">
        {toast.title && (
          <p className="text-[13px] font-bold mb-0.5 leading-tight" style={{ color: "#0f172a" }}>
            {toast.title}
          </p>
        )}
        <p className="text-[13px] leading-relaxed" style={{ color: "#475569" }}>
          {toast.message}
        </p>
      </div>

      {/* Cerrar */}
      <button onClick={close}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg
          border-0 cursor-pointer transition-all"
        style={{ color: "#cbd5e1", background: "transparent" }}
        onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#cbd5e1"; }}>
        <X size={12} />
      </button>

      {/* Barra de progreso */}
      <div className="absolute bottom-0 left-0 h-[2px] rounded-full"
        style={{
          background: cfg.bar,
          opacity: 0.45,
          animation: `shrink ${toast.duration || 4200}ms linear forwards`,
        }} />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback(({ type = "info", title, message, duration = 4200 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message, title) => add({ type: "success", title, message }),
    error:   (message, title) => add({ type: "error",   title, message }),
    warning: (message, title) => add({ type: "warning", title, message }),
    info:    (message, title) => add({ type: "info",    title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
