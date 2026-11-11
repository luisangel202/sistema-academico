import { useState, useRef, useEffect } from "react";
import { Bell, Bot, Menu, Sparkles, ChevronDown, Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useImages } from "../context/ImageContext";
import { alertas } from "../data/mockData";
import { useNavigate, useLocation } from "react-router-dom";

/* ── Mapa de títulos por ruta ── */
const ROUTE_TITLES = {
  "/dashboard":               "Inicio",
  "/instituciones":           "Instituciones",
  "/auditoria":               "Auditoría Global",
  "/licencias":               "Licencias",
  "/modulos":                 "Módulos del Sistema",
  "/administradores":         "Administradores",
  "/seguridad":               "Seguridad Global",
  "/backups":                 "Copias de Seguridad",
  "/estadisticas":            "Estadísticas",
  "/usuarios":                "Personal Institucional",
  "/cursos":                  "Cursos",
  "/materias":                "Materias",
  "/periodos":                "Períodos Académicos",
  "/asignaciones":            "Asignaciones",
  "/indicadores-curso":       "Indicadores por Curso",
  "/indicadores-materia":     "Indicadores por Materia",
  "/cambios-nota":            "Cambios de Nota",
  "/planes-mejoramiento":     "Planes de Mejoramiento",
  "/reuniones":               "Reuniones",
  "/matriculas":              "Matrículas",
  "/documentos":              "Documentos",
  "/certificados":            "Certificados",
  "/listados":                "Listados",
  "/mis-cursos":              "Mis Cursos",
  "/notas":                   "Registro de Notas",
  "/asistencia":              "Asistencia",
  "/tareas":                  "Tareas",
  "/materiales":              "Materiales",
  "/calendario":              "Calendario",
  "/solicitudes-cambio-nota": "Solicitudes de Cambio",
  "/mi-grupo":                "Mi Grupo",
  "/observador":              "Observador del Estudiante",
  "/citaciones":              "Citaciones",
  "/casos":                   "Casos Asignados",
  "/citas":                   "Citas",
  "/seguimientos":            "Seguimientos",
  "/planes-apoyo":            "Planes de Apoyo",
  "/mis-materias":            "Mis Materias",
  "/mis-notas":               "Mis Notas",
  "/mi-asistencia":           "Mi Asistencia",
  "/mensajes-estudiante":     "Mensajes",
  "/mis-hijos":               "Mis Hijos",
  "/notas-hijos":             "Notas",
  "/horarios":                "Horarios",
  "/ia-academica":            "IA Académica",
  "/aula-virtual":            "Aula Virtual",
  "/perfil":                  "Mi Perfil",
  "/reportes":                "Reportes",
  "/alertas":                 "Alertas",
  "/boletines":               "Boletines",
  "/mensajes":                "Mensajes",
  "/configuracion":           "Configuración",
  "/chatbot":                 "Chatbot Académico",
};

const nivelDot = { alto: "#ef4444", medio: "#f59e0b", info: "#3b82f6" };
const nivelBg  = { alto: "#fff1f2", medio: "#fffbeb", info: "#eff6ff" };

export default function Header({ sidebarCollapsed, onMobileMenuToggle }) {
  const { user } = useAuth();
  const { getAvatar } = useImages();
  const [showNotif, setShowNotif] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const unread = alertas.filter(a => !a.leida).length;
  const sidebarW = sidebarCollapsed ? 72 : 268;

  /* Título de la página actual */
  const pageTitle = ROUTE_TITLES[location.pathname] || "EduRural";

  /* Cerrar notif al click fuera */
  useEffect(() => {
    const fn = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <>
      <style>{`
        @media (min-width: 768px) { #app-header { left: ${sidebarW}px !important; } }
      `}</style>

      <header id="app-header"
        style={{
          position: "fixed", top: 0, right: 0, left: 0, zIndex: 30,
          height: 60,
          background: "rgba(249,250,251,0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid #e8edf5",
          boxShadow: "0 1px 8px rgba(15,23,42,0.04)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "left 300ms ease",
        }}>

        {/* ── Lado izquierdo ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 20, height: "100%" }}>

          {/* Hamburger — solo móvil */}
          <button onClick={onMobileMenuToggle}
            className="md:hidden"
            style={{ width: 34, height: 34, borderRadius: 10, background: "transparent", border: "1px solid #e8edf5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", flexShrink: 0, transition: "all 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <Menu size={17} />
          </button>

          {/* Título de la página */}
          <div className="hidden md:block">
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0, letterSpacing: "-0.01em" }}>
              {pageTitle}
            </p>
          </div>

          {/* Mobile: logo */}
          <div className="md:hidden" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#4f46e5,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>E</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>EduRural</span>
          </div>
        </div>

        {/* ── Lado derecho ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 16, height: "100%" }}>

          {/* Búsqueda rápida */}
          {showSearch ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 10, background: "#fff", border: "1.5px solid #3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.08)" }}>
              <Search size={14} color="#94a3b8" />
              <input
                autoFocus
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Buscar módulo..."
                style={{ border: "none", outline: "none", fontSize: 13, color: "#1e293b", background: "transparent", width: 160, fontFamily: "inherit" }}
              />
              <button onClick={() => { setShowSearch(false); setSearchQ(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 0 }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)}
              className="hidden md:flex"
              style={{ width: 34, height: 34, borderRadius: 10, background: "transparent", border: "1px solid #e8edf5", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8", transition: "all 150ms" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
              <Search size={15} />
            </button>
          )}

          {/* IA */}
          <button onClick={() => navigate("/ia-academica")}
            className="hidden sm:flex"
            style={{ alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: "linear-gradient(135deg,rgba(124,58,237,0.07),rgba(99,102,241,0.05))", border: "1px solid rgba(124,58,237,0.15)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#7c3aed", transition: "all 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,rgba(124,58,237,0.14),rgba(99,102,241,0.10))"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,rgba(124,58,237,0.07),rgba(99,102,241,0.05))"; }}>
            <Sparkles size={13} />
            <span>IA</span>
          </button>

          {/* Chatbot */}
          <button onClick={() => navigate("/chatbot")}
            style={{ width: 34, height: 34, borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#2563eb", transition: "all 150ms" }}
            title="Chatbot académico"
            onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; }}>
            <Bot size={15} />
          </button>

          {/* Notificaciones */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button onClick={() => setShowNotif(!showNotif)}
              style={{
                width: 34, height: 34, borderRadius: 10, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", transition: "all 150ms",
                background: unread > 0 ? "#fffbeb" : "#f8fafc",
                color: unread > 0 ? "#d97706" : "#64748b",
                outline: unread > 0 ? "1px solid #fde68a" : "1px solid #e8edf5",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = unread > 0 ? "#fef3c7" : "#f1f5f9"; }}
              onMouseLeave={e => { e.currentTarget.style.background = unread > 0 ? "#fffbeb" : "#f8fafc"; }}>
              <Bell size={15} />
              {unread > 0 && (
                <span style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #f9fafb" }}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {/* Dropdown notificaciones */}
            {showNotif && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                width: 320, zIndex: 50,
                background: "#fff", borderRadius: 16,
                border: "1px solid #e8edf5",
                boxShadow: "0 16px 48px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.06)",
                overflow: "hidden",
                animation: "fadeDown 200ms ease both",
              }}>
                <style>{`@keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>

                {/* Header dropdown */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px", borderBottom: "1px solid #f4f6fb" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Notificaciones</p>
                  {unread > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#fee2e2", color: "#dc2626" }}>
                      {unread} nueva{unread > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Lista */}
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {alertas.map(a => (
                    <div key={a.id}
                      style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid #f8fafc", cursor: "pointer", transition: "background 150ms", background: a.leida ? "transparent" : "#fafbff" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = a.leida ? "transparent" : "#fafbff"; }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: nivelDot[a.nivel] || "#3b82f6", flexShrink: 0, marginTop: 5 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.55, margin: "0 0 4px" }}>{a.mensaje}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>{a.fecha}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: nivelBg[a.nivel] || "#eff6ff", color: nivelDot[a.nivel] || "#3b82f6" }}>
                            {a.nivel}
                          </span>
                          {!a.leida && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ padding: "10px 16px", borderTop: "1px solid #f4f6fb" }}>
                  <button onClick={() => { navigate("/alertas"); setShowNotif(false); }}
                    style={{ width: "100%", fontSize: 13, fontWeight: 600, color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "center" }}>
                    Ver todas las alertas →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Separador */}
          <div style={{ width: 1, height: 22, background: "#e8edf5", flexShrink: 0 }} />

          {/* Avatar + nombre */}
          <button onClick={() => navigate("/perfil")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 12, background: "transparent", border: "1px solid transparent", cursor: "pointer", transition: "all 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f4f6fb"; e.currentTarget.style.borderColor = "#e8edf5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
            {getAvatar(user?.id) ? (
              <img src={getAvatar(user?.id)} alt={user?.nombre}
                style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0, outline: "2px solid #e0e7ff", outlineOffset: 1 }} />
            ) : (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                {user?.avatar}
              </div>
            )}
            <span className="hidden md:block" style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.nombre?.split(" ")[0]}
            </span>
            <ChevronDown size={13} style={{ color: "#94a3b8", flexShrink: 0 }} className="hidden md:block" />
          </button>
        </div>
      </header>
    </>
  );
}
