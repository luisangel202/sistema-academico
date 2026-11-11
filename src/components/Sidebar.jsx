import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useImages } from "../context/ImageContext";
import { instituciones } from "../data/mockData";
import { ROLE_LABELS } from "../data/permissions";
import {
  LayoutDashboard, Building2, FileText, Settings, Shield,
  Database, ClipboardList, BarChart3, Users, BookOpen,
  GraduationCap, Calendar, Star, CheckSquare, FolderOpen,
  MessageSquare, Bot, Brain, Bell, LogOut, ChevronLeft,
  UserCheck, Heart, Home, Baby, Clock, User, Monitor, X,
  Sparkles, ChevronRight, MapPin, HelpCircle, Smartphone
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   MENÚ POR ROL — con grupos para separar visualmente
   Cada grupo tiene: { label, items[] }
   Cada item: { label, icon, path, color }
═══════════════════════════════════════════════════════════ */
const menuByRole = {
  SUPER_ADMIN: [
    {
      label: "Principal",
      items: [
        { label: "Dashboard Global",  icon: LayoutDashboard, path: "/dashboard",      color: "#6366f1" },
        { label: "Instituciones",     icon: Building2,       path: "/instituciones",  color: "#3b82f6" },
        { label: "Administradores",   icon: Users,           path: "/administradores",color: "#0d9488" },
        { label: "Licencias",         icon: FileText,        path: "/licencias",      color: "#f59e0b" },
      ],
    },
    {
      label: "Sistema",
      items: [
        { label: "Módulos",           icon: Settings,        path: "/modulos",        color: "#8b5cf6" },
        { label: "Seguridad Global",  icon: Shield,          path: "/seguridad",      color: "#ef4444" },
        { label: "Copias de Seguridad",icon: Database,       path: "/backups",        color: "#10b981" },
        { label: "Auditoría",         icon: ClipboardList,   path: "/auditoria",      color: "#64748b" },
        { label: "Estadísticas",      icon: BarChart3,       path: "/estadisticas",   color: "#2563eb" },
      ],
    },
    {
      label: "Cuenta",
      items: [
        { label: "Configuración",     icon: Settings,        path: "/configuracion",  color: "#64748b" },
        { label: "Mi Perfil",         icon: User,            path: "/perfil",         color: "#6366f1" },
      ],
    },
  ],

  ADMIN_INSTITUCIONAL: [
    {
      label: "Principal",
      items: [
        { label: "Dashboard",         icon: LayoutDashboard, path: "/dashboard",      color: "#6366f1" },
        { label: "Usuarios",          icon: Users,           path: "/usuarios",       color: "#3b82f6" },
        { label: "Reportes",          icon: BarChart3,       path: "/reportes",       color: "#0d9488" },
      ],
    },
    {
      label: "Académico",
      items: [
        { label: "Cursos",            icon: BookOpen,        path: "/cursos",         color: "#10b981" },
        { label: "Materias",          icon: GraduationCap,   path: "/materias",       color: "#f59e0b" },
        { label: "Períodos",          icon: Calendar,        path: "/periodos",       color: "#8b5cf6" },
        { label: "Horarios",          icon: Clock,           path: "/horarios",       color: "#ef4444" },
        { label: "Asignaciones",      icon: UserCheck,       path: "/asignaciones",   color: "#2563eb" },
      ],
    },
    {
      label: "Recursos",
      items: [
        { label: "Documentos",        icon: FolderOpen,      path: "/documentos",     color: "#d97706" },
        { label: "IA Académica",      icon: Brain,           path: "/ia-academica",   color: "#7c3aed" },
        { label: "Instalar App",      icon: Smartphone,      path: "/instalar-app",   color: "#10b981" },
        { label: "Configuración",     icon: Settings,        path: "/configuracion",  color: "#64748b" },
        { label: "Mi Perfil",         icon: User,            path: "/perfil",         color: "#6366f1" },
      ],
    },
  ],

  COORDINADOR: [
    {
      label: "Principal",
      items: [
        { label: "Dashboard",         icon: LayoutDashboard, path: "/dashboard",            color: "#6366f1" },
        { label: "Ind. por Curso",    icon: BarChart3,       path: "/indicadores-curso",    color: "#3b82f6" },
        { label: "Ind. por Materia",  icon: Star,            path: "/indicadores-materia",  color: "#f59e0b" },
      ],
    },
    {
      label: "Gestión",
      items: [
        { label: "Cambios de Nota",   icon: FileText,        path: "/cambios-nota",         color: "#ef4444" },
        { label: "Planes de Mejora",  icon: CheckSquare,     path: "/planes-mejoramiento",  color: "#10b981" },
        { label: "Reuniones",         icon: Calendar,        path: "/reuniones",            color: "#8b5cf6" },
        { label: "Horarios",          icon: Clock,           path: "/horarios",             color: "#0d9488" },
      ],
    },
    {
      label: "Recursos",
      items: [
        { label: "Reportes",          icon: ClipboardList,   path: "/reportes",             color: "#64748b" },
        { label: "IA Académica",      icon: Brain,           path: "/ia-academica",         color: "#7c3aed" },
        { label: "Instalar App",      icon: Smartphone,      path: "/instalar-app",         color: "#10b981" },
        { label: "Mi Perfil",         icon: User,            path: "/perfil",               color: "#6366f1" },
      ],
    },
  ],

  SECRETARIA: [
    {
      label: "Principal",
      items: [
        { label: "Dashboard",         icon: LayoutDashboard, path: "/dashboard",     color: "#6366f1" },
        { label: "Matrículas",        icon: FileText,        path: "/matriculas",    color: "#3b82f6" },
        { label: "Documentos",        icon: FolderOpen,      path: "/documentos",    color: "#f59e0b" },
      ],
    },
    {
      label: "Reportes",
      items: [
        { label: "Certificados",      icon: GraduationCap,   path: "/certificados",  color: "#10b981" },
        { label: "Listados",          icon: ClipboardList,   path: "/listados",      color: "#0d9488" },
        { label: "Instalar App",      icon: Smartphone,      path: "/instalar-app",  color: "#8b5cf6" },
        { label: "Mi Perfil",         icon: User,            path: "/perfil",        color: "#6366f1" },
      ],
    },
  ],

  DOCENTE: [
    {
      label: "Principal",
      items: [
        { label: "Dashboard",         icon: LayoutDashboard, path: "/dashboard",    color: "#6366f1" },
        { label: "Mis Cursos",        icon: BookOpen,        path: "/mis-cursos",   color: "#3b82f6" },
      ],
    },
    {
      label: "Académico",
      items: [
        { label: "Notas",             icon: Star,            path: "/notas",        color: "#f59e0b" },
        { label: "Asistencia",        icon: CheckSquare,     path: "/asistencia",   color: "#10b981" },
        { label: "Tareas",            icon: FileText,        path: "/tareas",       color: "#ef4444" },
        { label: "Cuestionarios",     icon: HelpCircle,      path: "/cuestionarios",color: "#8b5cf6" },
        { label: "Materiales",        icon: FolderOpen,      path: "/materiales",   color: "#0d9488" },
        { label: "Calendario",        icon: Calendar,        path: "/calendario",   color: "#d97706" },
        { label: "Horarios",          icon: Clock,           path: "/horarios",     color: "#64748b" },
      ],
    },
    {
      label: "Comunicación",
      items: [
        { label: "Mensajes",          icon: MessageSquare,   path: "/mensajes",     color: "#2563eb" },
        { label: "Reportes",          icon: BarChart3,       path: "/reportes",     color: "#64748b" },
        { label: "Instalar App",      icon: Smartphone,      path: "/instalar-app", color: "#10b981" },
        { label: "Mi Perfil",         icon: User,            path: "/perfil",       color: "#6366f1" },
      ],
    },
  ],

  DIRECTOR_GRUPO: [
    {
      label: "Principal",
      items: [
        { label: "Dashboard",         icon: LayoutDashboard, path: "/dashboard",   color: "#6366f1" },
        { label: "Mi Grupo",          icon: Users,           path: "/mi-grupo",    color: "#3b82f6" },
      ],
    },
    {
      label: "Gestión del Grupo",
      items: [
        { label: "Observador",        icon: ClipboardList,   path: "/observador",  color: "#f59e0b" },
        { label: "Citaciones",        icon: MessageSquare,   path: "/citaciones",  color: "#ef4444" },
        { label: "Horarios",          icon: Clock,           path: "/horarios",    color: "#0d9488" },
        { label: "Reportes",          icon: BarChart3,       path: "/reportes",    color: "#64748b" },
        { label: "Instalar App",      icon: Smartphone,      path: "/instalar-app",color: "#10b981" },
        { label: "Mi Perfil",         icon: User,            path: "/perfil",      color: "#6366f1" },
      ],
    },
  ],

  PSICOORIENTADOR: [
    {
      label: "Principal",
      items: [
        { label: "Dashboard",         icon: LayoutDashboard, path: "/dashboard",       color: "#6366f1" },
        { label: "Casos Asignados",   icon: Heart,           path: "/casos",           color: "#ef4444" },
        { label: "Citas",             icon: Calendar,        path: "/citas",           color: "#3b82f6" },
      ],
    },
    {
      label: "Seguimiento",
      items: [
        { label: "Seguimientos",      icon: ClipboardList,   path: "/seguimientos",    color: "#f59e0b" },
        { label: "Planes de Apoyo",   icon: CheckSquare,     path: "/planes-apoyo",    color: "#10b981" },
        { label: "Alertas",           icon: Bell,            path: "/alertas",         color: "#d97706" },
      ],
    },
    {
      label: "Recursos",
      items: [
        { label: "IA Académica",      icon: Brain,           path: "/ia-academica",    color: "#7c3aed" },
        { label: "Reportes",          icon: BarChart3,       path: "/reportes",        color: "#64748b" },
        { label: "Instalar App",      icon: Smartphone,      path: "/instalar-app",    color: "#10b981" },
        { label: "Mi Perfil",         icon: User,            path: "/perfil",          color: "#6366f1" },
      ],
    },
  ],

  ESTUDIANTE: [
    {
      label: "Inicio",
      items: [
        { label: "Dashboard",         icon: Home,            path: "/dashboard",            color: "#6366f1" },
        { label: "Mis Materias",      icon: BookOpen,        path: "/mis-materias",         color: "#3b82f6" },
      ],
    },
    {
      label: "Académico",
      items: [
        { label: "Mis Notas",         icon: Star,            path: "/mis-notas",            color: "#f59e0b" },
        { label: "Asistencia",        icon: CheckSquare,     path: "/mi-asistencia",        color: "#10b981" },
        { label: "Tareas",            icon: FileText,        path: "/tareas",               color: "#ef4444" },
        { label: "Cuestionarios",     icon: HelpCircle,      path: "/cuestionarios-estudiante", color: "#8b5cf6" },
        { label: "Boletines",         icon: GraduationCap,   path: "/boletines",            color: "#0d9488" },
        { label: "Aula Virtual",      icon: Monitor,         path: "/aula-virtual",         color: "#d97706" },
      ],
    },
    {
      label: "Más",
      items: [
        { label: "Mensajes",          icon: MessageSquare,   path: "/mensajes-estudiante",  color: "#2563eb" },
        { label: "Chatbot IA",        icon: Bot,             path: "/chatbot",              color: "#7c3aed" },
        { label: "Instalar App",      icon: Smartphone,      path: "/instalar-app",         color: "#10b981" },
        { label: "Mi Perfil",         icon: User,            path: "/perfil",               color: "#6366f1" },
      ],
    },
  ],

  PADRE: [
    {
      label: "Inicio",
      items: [
        { label: "Dashboard",         icon: Home,            path: "/dashboard",   color: "#6366f1" },
        { label: "Mis Hijos",         icon: Baby,            path: "/mis-hijos",   color: "#3b82f6" },
      ],
    },
    {
      label: "Seguimiento",
      items: [
        { label: "Notas",             icon: Star,            path: "/notas-hijos", color: "#f59e0b" },
        { label: "Asistencia",        icon: CheckSquare,     path: "/asistencia",  color: "#10b981" },
        { label: "Boletines",         icon: GraduationCap,   path: "/boletines",   color: "#8b5cf6" },
      ],
    },
    {
      label: "Comunicación",
      items: [
        { label: "Mensajes",          icon: MessageSquare,   path: "/mensajes",    color: "#2563eb" },
        { label: "Citaciones",        icon: Bell,            path: "/citaciones",  color: "#ef4444" },
        { label: "Alertas",           icon: Bell,            path: "/alertas",     color: "#d97706" },
        { label: "Instalar App",      icon: Smartphone,      path: "/instalar-app",color: "#10b981" },
        { label: "Mi Perfil",         icon: User,            path: "/perfil",      color: "#6366f1" },
      ],
    },
  ],
};

/* ═══════════════════════════════════════════════════════════
   COLORES POR ROL — para el badge del sidebar
═══════════════════════════════════════════════════════════ */
const ROL_BADGE = {
  SUPER_ADMIN:        { bg: "rgba(124,58,237,0.18)", color: "#c4b5fd", border: "rgba(124,58,237,0.30)" },
  ADMIN_INSTITUCIONAL:{ bg: "rgba(37,99,235,0.18)",  color: "#93c5fd", border: "rgba(37,99,235,0.30)"  },
  COORDINADOR:        { bg: "rgba(13,148,136,0.18)", color: "#5eead4", border: "rgba(13,148,136,0.30)" },
  SECRETARIA:         { bg: "rgba(217,119,6,0.18)",  color: "#fcd34d", border: "rgba(217,119,6,0.30)"  },
  DOCENTE:            { bg: "rgba(16,185,129,0.18)", color: "#6ee7b7", border: "rgba(16,185,129,0.30)" },
  DIRECTOR_GRUPO:     { bg: "rgba(59,130,246,0.18)", color: "#93c5fd", border: "rgba(59,130,246,0.30)" },
  PSICOORIENTADOR:    { bg: "rgba(239,68,68,0.18)",  color: "#fca5a5", border: "rgba(239,68,68,0.30)"  },
  ESTUDIANTE:         { bg: "rgba(99,102,241,0.18)", color: "#a5b4fc", border: "rgba(99,102,241,0.30)" },
  PADRE:              { bg: "rgba(20,184,166,0.18)", color: "#5eead4", border: "rgba(20,184,166,0.30)" },
};

/* ═══════════════════════════════════════════════════════════
   SIDEBAR PRINCIPAL
═══════════════════════════════════════════════════════════ */
export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const { getAvatar, getLogo } = useImages();
  const navigate  = useNavigate();
  const location  = useLocation();

  const grupos     = menuByRole[user?.rol] || [];
  const showLabels = mobileOpen || !collapsed;
  const instLogo   = user?.institucionId ? getLogo(user.institucionId) : null;
  const instNombre = user?.institucionId
    ? (instituciones.find(i => i.id === user.institucionId)?.nombre || "EduRural")
    : "EduRural";
  const badge = ROL_BADGE[user?.rol] || ROL_BADGE.DOCENTE;
  const handleLogout = () => { logout(); navigate("/login"); };

  /* ¿está activo este ítem? */
  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
  };

  const cls = `
    fixed left-0 top-0 h-full flex flex-col z-40
    transition-all duration-300 ease-in-out
    ${mobileOpen ? "translate-x-0 w-[268px]" : "-translate-x-full md:translate-x-0"}
    ${collapsed ? "md:w-[72px]" : "md:w-[268px]"}
  `;

  return (
    <aside className={cls} style={{
      background: "linear-gradient(180deg,#0f1117 0%,#13141e 100%)",
      borderRight: "1px solid rgba(255,255,255,0.04)",
      boxShadow: "4px 0 24px rgba(0,0,0,0.30)",
    }}>

      {/* Orbe decorativo fondo */}
      <div style={{ position: "absolute", top: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.08),transparent)", pointerEvents: "none" }} />

      {/* ─── HEADER ─────────────────────────────── */}
      <div style={{
        height: 60, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: showLabels ? "0 14px" : "0 10px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        gap: 10,
      }}>
        {/* Logo */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {instLogo ? (
            <img src={instLogo} alt="logo"
              style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover", background: "rgba(255,255,255,0.06)" }} />
          ) : (
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(79,70,229,0.35)" }}>
              <GraduationCap size={17} color="#fff" />
            </div>
          )}
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #0f1117" }} />
        </div>

        {showLabels && (
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              EduRural
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {instNombre}
            </p>
          </div>
        )}

        {/* Toggle colapso — desktop */}
        <button onClick={onToggle} className="hidden md:flex"
          style={{ marginLeft: "auto", width: 26, height: 26, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.20)", flexShrink: 0, transition: "all 150ms" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.70)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.20)"; }}>
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Cerrar — móvil */}
        <button onClick={onMobileClose} className="md:hidden"
          style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.40)", flexShrink: 0, transition: "all 150ms" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
          <X size={15} />
        </button>
      </div>

      {/* ─── USUARIO ────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        padding: showLabels ? "12px 12px" : "12px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        {showLabels ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Avatar */}
            {getAvatar(user?.id) ? (
              <img src={getAvatar(user?.id)} alt={user?.nombre}
                style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, outline: `2px solid ${badge.border}`, outlineOffset: 2 }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0, outline: `2px solid ${badge.border}`, outlineOffset: 2 }}>
                {user?.avatar}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.nombre}
              </p>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, display: "inline-block", whiteSpace: "nowrap" }}>
                {ROLE_LABELS[user?.rol]}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {getAvatar(user?.id) ? (
              <img src={getAvatar(user?.id)} alt={user?.nombre}
                style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", outline: `2px solid ${badge.border}`, outlineOffset: 2 }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", outline: `2px solid ${badge.border}`, outlineOffset: 2 }}>
                {user?.avatar}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── NAVEGACIÓN ─────────────────────────── */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: showLabels ? "8px 10px" : "8px 8px" }}
        className="custom-scroll">
        <style>{`
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 99px; }
        `}</style>

        {grupos.map((grupo, gi) => (
          <div key={gi} style={{ marginBottom: showLabels ? 8 : 16 }}>

            {/* Etiqueta del grupo — solo visible cuando está expandido */}
            {showLabels && (
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.10em", padding: "0 12px", margin: gi === 0 ? "4px 0 6px" : "10px 0 6px" }}>
                {grupo.label}
              </p>
            )}

            {/* Separador cuando está colapsado */}
            {!showLabels && gi > 0 && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 4px 8px" }} />
            )}

            {/* Items del grupo */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {grupo.items.map((item, ii) => {
                const active = isActive(item.path);
                return (
                  <NavLink
                    key={item.path + ii}
                    to={item.path}
                    onClick={onMobileClose}
                    title={!showLabels ? item.label : ""}
                    style={{ textDecoration: "none", display: "block" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: showLabels ? "9px 12px" : "10px",
                        borderRadius: 12,
                        cursor: "pointer",
                        justifyContent: showLabels ? "flex-start" : "center",
                        transition: "all 160ms ease",
                        position: "relative",
                        ...(active ? {
                          background: `linear-gradient(135deg,${item.color}22,${item.color}14)`,
                          border: `1px solid ${item.color}30`,
                          boxShadow: `0 2px 12px ${item.color}18`,
                        } : {
                          background: "transparent",
                          border: "1px solid transparent",
                        }),
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}>

                      {/* Ícono con su propio color */}
                      <div style={{
                        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: active ? `${item.color}22` : "rgba(255,255,255,0.05)",
                        transition: "all 160ms",
                      }}>
                        <item.icon
                          size={15}
                          style={{ color: active ? item.color : "rgba(255,255,255,0.40)", transition: "color 160ms" }}
                        />
                      </div>

                      {/* Label */}
                      {showLabels && (
                        <>
                          <span style={{
                            fontSize: 13, fontWeight: active ? 600 : 500,
                            color: active ? "#f1f5f9" : "rgba(255,255,255,0.52)",
                            flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            transition: "color 160ms",
                          }}>
                            {item.label}
                          </span>

                          {/* Indicador activo */}
                          {active && (
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}` }} />
                          )}
                        </>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── IA ACCESO RÁPIDO ───────────────────── */}
      {showLabels && (
        <div style={{ flexShrink: 0, padding: "0 10px 8px" }}>
          <button
            onClick={() => navigate("/ia-academica")}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12,
              background: "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(99,102,241,0.12))",
              border: "1px solid rgba(124,58,237,0.22)",
              cursor: "pointer", transition: "all 160ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,rgba(124,58,237,0.26),rgba(99,102,241,0.18))"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(99,102,241,0.12))"; }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={13} color="#c4b5fd" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", flex: 1, textAlign: "left" }}>IA Académica</span>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 99, background: "rgba(124,58,237,0.30)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.35)", letterSpacing: "0.04em" }}>
              BETA
            </span>
          </button>
        </div>
      )}

      {/* ─── LOGOUT ─────────────────────────────── */}
      <div style={{ flexShrink: 0, padding: "6px 10px 10px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <button
          onClick={handleLogout}
          title={!showLabels ? "Cerrar sesión" : ""}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            gap: showLabels ? 10 : 0,
            justifyContent: showLabels ? "flex-start" : "center",
            padding: showLabels ? "9px 12px" : "10px",
            borderRadius: 12, background: "transparent", border: "1px solid transparent",
            cursor: "pointer", transition: "all 160ms",
            color: "rgba(255,255,255,0.30)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.10)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.20)";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.30)";
          }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 160ms" }}>
            <LogOut size={14} style={{ color: "inherit" }} />
          </div>
          {showLabels && (
            <span style={{ fontSize: 13, fontWeight: 500, color: "inherit" }}>Cerrar sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
}
