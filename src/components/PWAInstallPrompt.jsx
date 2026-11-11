import { useState, useEffect } from "react";
import { Download, X, Share, Smartphone, Bell, BellRing, CheckCircle } from "lucide-react";
import { usePWA } from "../hooks/usePWA";

/**
 * Banner de instalación PWA + permiso de notificaciones.
 *
 * Flujo:
 *  1. Si la app es instalable → muestra banner "Instalar"
 *  2. Si está instalada pero sin permiso de notificaciones → muestra "Activar notificaciones"
 *  3. En iOS muestra instrucciones manuales
 *  4. Dismissible por 7 días (localStorage)
 */
export default function PWAInstallPrompt() {
  const {
    isInstallable,
    isInstalled,
    isStandalone,
    isIOS,
    promptInstall,
    notificationPermission,
    requestNotifications,
  } = usePWA();

  const [showInstall, setShowInstall] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifRequested, setNotifRequested] = useState(false);

  const DISMISS_KEY = "pwa-install-dismissed";
  const NOTIF_KEY = "pwa-notif-dismissed";
  const DISMISS_DAYS = 7;

  /* ── Lógica de qué mostrar ──────────────────────────── */
  useEffect(() => {
    if (!isStandalone && !isInstalled) {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) {
        const days = (Date.now() - Number(dismissed)) / 86400000;
        if (days < DISMISS_DAYS) return;
      }
      const timer = setTimeout(() => {
        if (isInstallable) setShowInstall(true);
        else if (isIOS) setShowIOS(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    /* Si ya está instalada, mostrar notificaciones si no hay permiso */
    if ((isStandalone || isInstalled) && notificationPermission === "default") {
      const notifDismissed = localStorage.getItem(NOTIF_KEY);
      if (notifDismissed) {
        const days = (Date.now() - Number(notifDismissed)) / 86400000;
        if (days < DISMISS_DAYS) return;
      }
      const timer = setTimeout(() => setShowNotif(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isIOS, isInstalled, isStandalone, notificationPermission]);

  const dismissInstall = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowInstall(false);
    setShowIOS(false);
  };

  const dismissNotif = () => {
    localStorage.setItem(NOTIF_KEY, Date.now().toString());
    setShowNotif(false);
  };

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) setShowInstall(false);
  };

  const handleEnableNotifs = async () => {
    const result = await requestNotifications();
    setNotifRequested(true);
    if (result === "granted") {
      setTimeout(() => setShowNotif(false), 1500);
    }
  };

  /* ── No renderizar si nada que mostrar ───────────────── */
  if (!showInstall && !showIOS && !showNotif) return null;

  /* ── Banner iOS (instrucciones manuales) ────────────── */
  if (showIOS && !showInstall) {
    return (
      <PWAWrapper>
        <div style={cardStyle}>
          <HeaderRow
            icon={<Smartphone size={20} style={{ color: "#fff" }} />}
            title="Instala EduRural"
            subtitle="Accede más rápido desde tu iPhone"
            onClose={dismissInstall}
          />
          <div style={stepBoxStyle}>
            <p style={stepTextStyle}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <strong>1.</strong> Toca <Share size={13} style={{ color: "#2563eb" }} /> en Safari
              </span>
              <br />
              <strong>2.</strong> Selecciona{" "}
              <span style={{ fontWeight: 700, color: "#2563eb" }}>
                "Agregar a pantalla de inicio"
              </span>
            </p>
          </div>
          <DismissBtn onClick={dismissInstall} label="Entendido" />
        </div>
      </PWAWrapper>
    );
  }

  /* ── Banner de instalación (Android/Chrome/Edge) ────── */
  if (showInstall) {
    return (
      <PWAWrapper>
        <style>{pulseKeyframes}</style>
        <div style={cardStyle}>
          <HeaderRow
            icon={<Download size={22} style={{ color: "#fff" }} />}
            title="Instala EduRural"
            subtitle="Accede más rápido, incluso sin internet"
            onClose={dismissInstall}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <DismissBtn onClick={dismissInstall} label="Ahora no" flex={1} />
            <button onClick={handleInstall} style={installBtnStyle}>
              <Download size={15} /> Instalar
            </button>
          </div>
        </div>
      </PWAWrapper>
    );
  }

  /* ── Banner de notificaciones ───────────────────────── */
  if (showNotif) {
    const granted = notificationPermission === "granted";
    return (
      <PWAWrapper>
        <div style={cardStyle}>
          <HeaderRow
            icon={
              granted ? (
                <CheckCircle size={22} style={{ color: "#fff" }} />
              ) : (
                <BellRing size={22} style={{ color: "#fff" }} />
              )
            }
            iconBg={
              granted
                ? "linear-gradient(135deg,#22c55e,#16a34a)"
                : "linear-gradient(135deg,#1e40af,#1d4ed8)"
            }
            title={granted ? "¡Notificaciones activadas!" : "Activa las notificaciones"}
            subtitle={
              granted
                ? "Recibirás alertas de notas, citaciones y más"
                : "Te avisaremos sobre notas, citaciones y novedades"
            }
            onClose={dismissNotif}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <DismissBtn onClick={dismissNotif} label={granted ? "Listo" : "Ahora no"} flex={1} />
            {!granted && (
              <button onClick={handleEnableNotifs} style={notifBtnStyle}>
                <Bell size={15} /> Activar
              </button>
            )}
          </div>
        </div>
      </PWAWrapper>
    );
  }

  return null;
}

/* ════════════════════════════════════════════════════════
   Sub-componentes y estilos
   ════════════════════════════════════════════════════════ */

function PWAWrapper({ children }) {
  return (
    <>
      <style>{`
        @keyframes pwaSlideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 90,
          maxWidth: 420,
          width: "calc(100% - 32px)",
          animation: "pwaSlideUp 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {children}
      </div>
    </>
  );
}

const cardStyle = {
  background: "#fff",
  borderRadius: 18,
  padding: "16px 18px",
  boxShadow: "0 12px 40px rgba(15,23,42,0.18)",
  border: "1px solid #e8edf5",
};

function HeaderRow({ icon, iconBg, title, subtitle, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            background: iconBg || "linear-gradient(135deg,#1e40af,#1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", margin: 0 }}>{title}</p>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8", flexShrink: 0 }}
      >
        <X size={18} />
      </button>
    </div>
  );
}

function DismissBtn({ onClick, label, flex }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: flex || 1,
        padding: "9px 16px",
        borderRadius: 12,
        background: "#f1f5f9",
        border: "none",
        color: "#64748b",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

const installBtnStyle = {
  flex: 1.5,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 16px",
  borderRadius: 12,
  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

const notifBtnStyle = {
  flex: 1.5,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 16px",
  borderRadius: 12,
  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

const stepBoxStyle = {
  background: "#f8fafc",
  borderRadius: 12,
  padding: "12px 14px",
  marginBottom: 12,
};

const stepTextStyle = {
  fontSize: 12,
  color: "#475569",
  margin: 0,
  lineHeight: 1.7,
};

const pulseKeyframes = `
  @keyframes pwaPulse {
    0%, 100% { box-shadow: 0 4px 14px rgba(37,99,235,0.30); }
    50%      { box-shadow: 0 4px 24px rgba(37,99,235,0.50); }
  }
`;
