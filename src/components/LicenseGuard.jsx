import { useAuth } from "../context/AuthContext";
import { useStorage } from "../context/StorageContext";
import { instituciones as dataInst } from "../data/mockData";
import { Shield, AlertTriangle, Phone, Mail } from "lucide-react";

/**
 * LicenseGuard — Bloquea el acceso a la aplicación si:
 *  1. La institución del usuario no existe
 *  2. La institución está inactiva (activa = false)
 *  3. La licencia está vencida (vencimiento < hoy)
 *
 * El SUPER_ADMIN nunca es bloqueado.
 * Se coloca después de que el usuario inicia sesión.
 */
export default function LicenseGuard({ children }) {
  const { user } = useAuth();
  const { getCollection } = useStorage();

  // Sin usuario — dejar pasar (el AuthGuard ya maneja esto)
  if (!user) return children;

  // SuperAdmin nunca bloqueado
  if (user.rol === "SUPER_ADMIN") return children;

  // Obtener datos de instituciones desde storage (o mockData como fallback)
  const instituciones = getCollection("instituciones", dataInst, null);
  const inst = instituciones.find(i => i.id === user.institucionId);

  // Sin institución asignada
  if (!inst) {
    return <BlockScreen
      titulo="Institución no encontrada"
      mensaje="Tu usuario no está asociado a ninguna institución registrada en el sistema."
      tipo="sin_institucion"
    />;
  }

  // Institución inactiva
  if (!inst.activa) {
    return <BlockScreen
      titulo="Institución desactivada"
      mensaje={`La institución "${inst.nombre}" ha sido desactivada. Contacta al administrador del sistema para reactivarla.`}
      tipo="inactiva"
      institucion={inst}
    />;
  }

  // Licencia vencida
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = inst.vencimiento ? new Date(inst.vencimiento) : null;

  if (!venc || venc < hoy) {
    return <BlockScreen
      titulo="Licencia vencida"
      mensaje={`La licencia de "${inst.nombre}" venció el ${inst.vencimiento || "fecha no definida"}. Renuévala para continuar usando la plataforma.`}
      tipo="vencida"
      institucion={inst}
    />;
  }

  // Todo OK
  return children;
}

/* ── Pantalla de bloqueo ─────────────────────────────────────────── */
function BlockScreen({ titulo, mensaje, tipo, institucion }) {
  const { logout } = useAuth();

  const iconConfig = {
    sin_institucion: { bg: "#fef3c7", border: "#fde68a", icon: AlertTriangle, color: "#92400e" },
    inactiva:        { bg: "#fef2f2", border: "#fecaca", icon: Shield,         color: "#991b1b" },
    vencida:         { bg: "#fff7ed", border: "#fed7aa", icon: Shield,         color: "#9a3412" },
  };
  const cfg = iconConfig[tipo] || iconConfig.vencida;
  const Icon = cfg.icon;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#1e40af,#1d4ed8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "40px 36px",
        maxWidth: 480, width: "100%",
        boxShadow: "0 24px 64px rgba(15,23,42,0.28)",
      }}>
        {/* Ícono */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: cfg.bg, border: `2px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Icon size={28} style={{ color: cfg.color }} />
        </div>

        {/* Logo / Nombre */}
        <p style={{
          textAlign: "center", fontSize: 12, fontWeight: 800,
          color: "#94a3b8", letterSpacing: "2px",
          textTransform: "uppercase", marginBottom: 8,
        }}>
          EduRural
        </p>

        {/* Título */}
        <h1 style={{
          fontSize: 22, fontWeight: 900, color: "#1e293b",
          textAlign: "center", margin: "0 0 12px",
        }}>
          {titulo}
        </h1>

        {/* Mensaje */}
        <p style={{
          fontSize: 14, color: "#64748b", textAlign: "center",
          lineHeight: 1.7, margin: "0 0 24px",
        }}>
          {mensaje}
        </p>

        {/* Info de contacto si hay institución */}
        {institucion && (
          <div style={{
            background: "#f8fafc", border: "1px solid #e8edf5",
            borderRadius: 14, padding: "14px 16px", marginBottom: 24,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>
              Datos de contacto del administrador
            </p>
            {institucion.correo && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                <Mail size={13} style={{ color: "#94a3b8" }} /> {institucion.correo}
              </div>
            )}
            {institucion.telefono && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                <Phone size={13} style={{ color: "#94a3b8" }} /> {institucion.telefono}
              </div>
            )}
          </div>
        )}

        {/* Contacto EduRural */}
        <div style={{
          background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: 12, padding: "12px 14px", marginBottom: 24,
          fontSize: 12, color: "#1d4ed8", lineHeight: 1.6,
          textAlign: "center",
        }}>
          Para renovar tu licencia contacta al soporte de EduRural:<br/>
          <strong>soporte@edurural.edu.co</strong> · <strong>+57 300 000 0000</strong>
        </div>

        {/* Botón cerrar sesión */}
        <button
          onClick={logout}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 14,
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff", fontSize: 14, fontWeight: 700,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.30)",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
