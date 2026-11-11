import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import {
  GraduationCap, Users, BookOpen, BarChart3, Shield,
  MessageSquare, Star, CheckCircle, ArrowRight, Brain,
  FileText, Globe, Sparkles, Award, MapPin, ChevronDown,
  Bell, Zap, Lock, TrendingUp, CheckCircle2, Quote,
  Phone, Mail, ExternalLink, Play, Heart, Clock, Target,
  Smartphone, Download, Copy, AlertCircle
} from "lucide-react";

/* ===================================================
   DATOS
=================================================== */
const features = [
  { icon: Star,          color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  title: "Registro de Notas",         desc: "Actividades con categorias y pesos ponderados. Calculo automatico de promedios en tiempo real con tabla dinamica." },
  { icon: CheckCircle,   color: "#10b981", bg: "rgba(16,185,129,0.12)",  title: "Control de Asistencia",     desc: "Registro diario Presente / Ausente / Tardanza. Estadisticas y alertas automaticas al superar el umbral." },
  { icon: BarChart3,     color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  title: "Dashboards en Tiempo Real", desc: "Cada rol ve indicadores clave, graficas interactivas y alertas de riesgo academico especificas para su funcion." },
  { icon: MessageSquare, color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  title: "Comunicacion Institucional",desc: "Mensajeria interna, alertas academicas, citaciones a padres, observador del estudiante y reuniones." },
  { icon: FileText,      color: "#ef4444", bg: "rgba(239,68,68,0.12)",   title: "Gestion Documental",        desc: "Catalogo normativo colombiano completo. Ley 1918/2018, Decreto 1075/2015 y escalafon docente integrados." },
  { icon: Brain,         color: "#6366f1", bg: "rgba(99,102,241,0.12)",  title: "IA Academica",              desc: "Deteccion automatica de riesgo de reprobacion con motor de reglas y recomendaciones de intervencion." },
  { icon: BookOpen,      color: "#0d9488", bg: "rgba(13,148,136,0.12)",  title: "Aula Virtual",              desc: "Recursos educativos por materia. Carga de archivos con drag & drop, filtros por tipo y materia." },
  { icon: TrendingUp,    color: "#d97706", bg: "rgba(217,119,6,0.12)",   title: "Reportes y Boletines",      desc: "Generacion de boletines academicos por periodo con exportacion a PDF. Reportes con graficas." },
  { icon: Lock,          color: "#64748b", bg: "rgba(100,116,139,0.12)", title: "Seguridad por Roles",       desc: "Control de acceso RBAC con 9 roles diferenciados. Guardias de ruta, cada usuario ve solo lo que le corresponde." },
];

const roles = [
  { rol: "Super Administrador", icon: Shield,        color: "#7c3aed", grad: "135deg,#7c3aed,#6d28d9", desc: "Control total del sistema multi-institucion" },
  { rol: "Administrador",       icon: Users,         color: "#2563eb", grad: "135deg,#2563eb,#1d4ed8", desc: "Gestion institucional y configuracion academica" },
  { rol: "Coordinador",         icon: BarChart3,     color: "#0d9488", grad: "135deg,#0d9488,#0f766e", desc: "Indicadores, planes de mejora y supervision" },
  { rol: "Docente",             icon: BookOpen,      color: "#d97706", grad: "135deg,#d97706,#b45309", desc: "Notas, asistencia, tareas y materiales" },
  { rol: "Director de Grupo",   icon: Star,          color: "#059669", grad: "135deg,#059669,#047857", desc: "Mi grupo, observador del alumno y citaciones" },
  { rol: "Psicoorientador",     icon: Heart,         color: "#dc2626", grad: "135deg,#dc2626,#b91c1c", desc: "Casos, citas y planes de apoyo psicosocial" },
  { rol: "Secretaria",          icon: FileText,      color: "#9333ea", grad: "135deg,#9333ea,#7c3aed", desc: "Matriculas, documentos y certificados" },
  { rol: "Estudiante",          icon: GraduationCap, color: "#0284c7", grad: "135deg,#0284c7,#0369a1", desc: "Notas, tareas, aula virtual y chatbot" },
  { rol: "Padre de Familia",    icon: Bell,          color: "#0d9488", grad: "135deg,#0d9488,#0f766e", desc: "Seguimiento academico en tiempo real de sus hijos" },
];

const normativa = [
  "Ley 115 de 1994 - Ley General de Educacion",
  "Decreto 1075 de 2015 - Decreto Unico Reglamentario",
  "Ley 1918 de 2018 - Regimen de inhabilidades docentes",
  "Resolucion 15683 de 2016 - Registro de informacion academica",
  "Escalafon Docente Nacional",
  "Estructura SIMAT compatible",
];

const testimonios = [
  { nombre: "Carlos Mendoza",  rol: "Rector",                   texto: "Ahora tenemos todos los datos de nuestras sedes en un solo lugar. Los directivos pueden tomar decisiones basadas en informacion real.", avatar: "CM" },
  { nombre: "Maria Gonzalez",  rol: "Coordinadora Academica",   texto: "Los indicadores por curso me permiten identificar estudiantes en riesgo antes de que sea demasiado tarde. Una herramienta indispensable.", avatar: "MG" },
  { nombre: "Luis Herrera",    rol: "Docente",                  texto: "El registro de notas por actividades con pesos es exactamente lo que necesitabamos. Ya no pierdo tiempo haciendo calculos manuales.", avatar: "LH" },
  { nombre: "Roberto Perez",   rol: "Padre de Familia",         texto: "Puedo ver las notas y asistencia de mi hijo desde el telefono. Es increible tener esa informacion disponible en el campo.", avatar: "RP" },
];

const faqs = [
  { q: "Funciona sin internet estable?",        a: "Si. EduRural esta disenado para entornos con conectividad intermitente. La interfaz es liviana y optimizada para conexiones lentas." },
  { q: "Cuantos estudiantes puede manejar?",    a: "El sistema esta disenado para escalar desde una sede pequena hasta multiples instituciones con miles de estudiantes." },
  { q: "Como se protegen los datos?",           a: "Se implementa control de acceso basado en roles (RBAC). Cada usuario solo puede ver y editar lo que corresponde a su funcion." },
  { q: "Se puede usar desde el celular?",       a: "Completamente. EduRural es 100% responsive y esta optimizado para dispositivos moviles de gama media y baja." },
  { q: "Cumple la normativa colombiana?",       a: "Si. Incorpora los requisitos del Decreto 1075/2015, Ley 1918/2018, Resolucion 15683/2016 y el escalafon docente." },
  { q: "Cuanto cuesta la licencia?",            a: "EduRural es un proyecto academico de acceso libre para instituciones educativas rurales del municipio de Achi, Bolivar." },
];

const galeria = [
  { icon: BarChart3,    label: "Dashboard",         color: "#3b82f6", bg: "#eff6ff" },
  { icon: Star,         label: "Registro de notas", color: "#f59e0b", bg: "#fffbeb" },
  { icon: CheckCircle,  label: "Asistencia",        color: "#10b981", bg: "#f0fdf4" },
  { icon: MessageSquare,label: "Mensajes",          color: "#8b5cf6", bg: "#faf5ff" },
  { icon: Brain,        label: "IA Academica",      color: "#6366f1", bg: "#eef2ff" },
  { icon: FileText,     label: "Boletines PDF",     color: "#ef4444", bg: "#fff1f2" },
];

/* ===================================================
   SUB-COMPONENTES
=================================================== */
function Pill({ color, bg, border, icon, children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 99, background: bg, border: `1px solid ${border}`, marginBottom: 16 }}>
      {icon}
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{children}</span>
    </div>
  );
}

function FooterHead({ children }) {
  return <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.90)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</p>;
}

/* ===================================================
   COMPONENTE PRINCIPAL
=================================================== */
export default function Landing() {
  const navigate = useNavigate();
  const [scrolled,   setScrolled]   = useState(false);
  const [faqOpen,    setFaqOpen]    = useState(null);
  const [animStats,  setAnimStats]  = useState(false);
  const [copied,     setCopied]     = useState(false);
  const statsRef = useRef(null);

  const currentUrl = (() => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    // Usa la URL completa tal como el navegador la ve
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  })();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimStats(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", color: "#0f172a", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes bounce   { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
        @keyframes countUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        .anim-fade-up  { animation: fadeUp 0.55s ease both; }
        .orb-float     { animation: floatOrb 7s ease-in-out infinite; }
        .stat-anim     { animation: countUp 0.6s ease both; }
        .feat-card:hover { transform:translateY(-6px)!important; box-shadow:0 20px 48px rgba(15,23,42,0.13)!important; border-color:#c7d2fe!important; }
        .feat-card { transition: all 220ms cubic-bezier(0.34,1.56,0.64,1)!important; }
        .role-card:hover { transform:translateY(-3px)!important; box-shadow:0 12px 32px rgba(15,23,42,0.12)!important; }
        .role-card { transition: all 180ms ease!important; }
        .faq-item:hover { border-color:#c7d2fe!important; }
        .nav-link { transition: color 150ms; }
        .nav-link:hover { color:#1e293b!important; }
        .cta-btn:hover { transform:translateY(-2px)!important; }
        .cta-btn { transition: all 180ms!important; }

        /* RESPONSIVE */
        .landing-nav-links { display:flex; align-items:center; gap:4px; }
        .landing-hero-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; max-width:720px; margin:0 auto; }
        .landing-normativa-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
        .landing-qr-grid { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }

        @media (max-width:768px) {
          .landing-nav-links { display:none !important; }
          .landing-hero-stats { grid-template-columns:repeat(2,1fr) !important; gap:10px !important; }
          .landing-normativa-grid { grid-template-columns:1fr !important; gap:32px !important; }
          .landing-qr-grid { grid-template-columns:1fr !important; gap:32px !important; }
          .landing-section-pad { padding:60px 16px !important; }
          .hide-mobile { display:none !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(226,232,240,0.8)" : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 16px rgba(15,23,42,0.06)" : "none",
        transition: "all 320ms ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#2563eb,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}>
              <GraduationCap size={19} color="#fff" />
            </div>
            <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: "-0.02em", color: scrolled ? "#0f172a" : "#fff" }}>EduRural</span>
          </div>

          <div className="landing-nav-links">
            {[["#caracteristicas","Caracteristicas"],["#roles","Roles"],["#modulos","Modulos"],["#normativa","Normativa"],["#contacto","Contacto"]].map(([href, label]) => (
              <a key={href} href={href} className="nav-link"
                style={{ fontSize: 14, fontWeight: 500, color: scrolled ? "#64748b" : "rgba(255,255,255,0.80)", textDecoration: "none", padding: "6px 14px", borderRadius: 8 }}>
                {label}
              </a>
            ))}
          </div>

          <button onClick={() => navigate("/login")} className="cta-btn"
            style={{ padding: "9px 22px", borderRadius: 10, background: scrolled ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "rgba(255,255,255,0.14)", color: "#fff", fontSize: 14, fontWeight: 700, border: scrolled ? "none" : "1.5px solid rgba(255,255,255,0.35)", cursor: "pointer", backdropFilter: "blur(8px)", boxShadow: scrolled ? "0 4px 14px rgba(37,99,235,0.28)" : "none" }}>
            Ingresar
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 20px 80px", overflow: "hidden", background: "linear-gradient(160deg,#060c24 0%,#0f1f5c 40%,#1a0a4a 75%,#090c1a 100%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(99,102,241,0.15) 1px,transparent 1px)", backgroundSize: "42px 42px", pointerEvents: "none" }} />
        <div className="orb-float" style={{ position: "absolute", top: "5%",  left: "6%",  width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.22),transparent 70%)", pointerEvents: "none" }} />
        <div className="orb-float" style={{ animationDelay: "2s", position: "absolute", bottom: "4%", right: "5%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.18),transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 880 }} className="anim-fade-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", borderRadius: 99, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", marginBottom: 28 }}>
            <MapPin size={13} color="#a5b4fc" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a5b4fc" }}>Achi, Bolivar - Depresion Momposina - Colombia</span>
          </div>

          <h1 style={{ fontSize: "clamp(36px,6.5vw,78px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 24px" }}>
            La plataforma academica<br />
            <span style={{ background: "linear-gradient(90deg,#818cf8 0%,#a78bfa 40%,#60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              que el campo merece
            </span>
          </h1>

          <p style={{ fontSize: "clamp(15px,2vw,19px)", color: "rgba(255,255,255,0.60)", maxWidth: 640, margin: "0 auto 44px", lineHeight: 1.80 }}>
            Sistema integral de gestion academica para las instituciones educativas rurales de Achi. 9 roles, 40+ modulos, cumplimiento normativo colombiano, sin costo de licenciamiento.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
            <button onClick={() => navigate("/login")}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 34px", borderRadius: 13, background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontSize: 16, fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 8px 32px rgba(99,102,241,0.45)", transition: "all 200ms" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
              Acceder al sistema <ArrowRight size={18} />
            </button>
            <a href="#caracteristicas"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 32px", borderRadius: 13, background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 16, fontWeight: 600, border: "1.5px solid rgba(255,255,255,0.16)", cursor: "pointer", textDecoration: "none", backdropFilter: "blur(8px)" }}>
              <Play size={15} /> Ver caracteristicas
            </a>
          </div>

          <div className="landing-hero-stats">
            {[
              { val: "9",    lbl: "Roles de usuario",     col: "#818cf8" },
              { val: "40+",  lbl: "Modulos funcionales",  col: "#60a5fa" },
              { val: "100%", lbl: "Diseno responsive",    col: "#4ade80" },
              { val: "$0",   lbl: "Costo de licencia",    col: "#fbbf24" },
            ].map(s => (
              <div key={s.lbl} style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: "20px 12px", textAlign: "center" }}>
                <p style={{ fontSize: 32, fontWeight: 900, color: s.col, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{s.val}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", fontWeight: 500, margin: 0 }}>{s.lbl}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 28, left: "50%", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, opacity: 0.35, animation: "bounce 2s infinite" }}>
          <span style={{ fontSize: 10, color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase" }}>scroll</span>
          <ChevronDown size={16} color="#fff" />
        </div>
      </section>

      {/* BANDA VALOR */}
      <section style={{ background: "linear-gradient(135deg,#4f46e5,#2563eb)", padding: "26px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", alignItems: "center" }}>
          {[
            { icon: Zap,    text: "Acceso desde cualquier dispositivo"   },
            { icon: Globe,  text: "Funciona con conectividad limitada"    },
            { icon: Shield, text: "Cumplimiento normativo colombiano"     },
            { icon: Clock,  text: "Ahorra tiempo administrativo"         },
            { icon: Target, text: "Alertas tempranas de riesgo academico" },
          ].map(i => (
            <div key={i.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i.icon size={15} color="#fff" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.90)" }}>{i.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CARACTERISTICAS */}
      <section id="caracteristicas" style={{ padding: "80px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Pill color="#2563eb" bg="#eff6ff" border="#bfdbfe" icon={<Sparkles size={12} color="#2563eb" />}>Funcionalidades</Pill>
            <h2 style={{ fontSize: "clamp(24px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 16px", color: "#0f172a" }}>
              Todo lo que necesita tu institucion
            </h2>
            <p style={{ fontSize: 16, color: "#64748b", maxWidth: 560, margin: "0 auto", lineHeight: 1.80 }}>
              Disenado para las realidades del sector educativo rural colombiano. Sin costos de licenciamiento.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {features.map(f => (
              <div key={f.title} className="feat-card" style={{ padding: "26px", borderRadius: 20, border: "1px solid #e8edf5", background: "#fff", boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", color: "#1e293b" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULOS */}
      <section id="modulos" style={{ padding: "80px 20px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Pill color="#8b5cf6" bg="#faf5ff" border="#ddd6fe" icon={<Globe size={12} color="#8b5cf6" />}>Vista previa</Pill>
            <h2 style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 14px", color: "#0f172a" }}>
              Modulos principales del sistema
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
            {galeria.map(g => (
              <div key={g.label} className="role-card" style={{ borderRadius: 18, background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 2px 8px rgba(15,23,42,0.04)", overflow: "hidden" }}>
                <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #f4f6fb", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <g.icon size={16} color={g.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{g.label}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Modulo del sistema</p>
                  </div>
                </div>
                <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 7 }}>
                  {[80, 60, 75].map((w, i) => (
                    <div key={i} style={{ height: 9, borderRadius: 99, background: "#f1f5f9", width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 36 }}>
            <button onClick={() => navigate("/login")}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#2563eb)", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 6px 24px rgba(79,70,229,0.32)", transition: "all 180ms" }}>
              Explorar todos los modulos <ExternalLink size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" style={{ padding: "80px 20px", background: "linear-gradient(160deg,#0f172a 0%,#1e1b4b 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(99,102,241,0.08) 1px,transparent 1px)", backgroundSize: "46px 46px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Pill color="#818cf8" bg="rgba(99,102,241,0.15)" border="rgba(99,102,241,0.30)" icon={<Users size={12} color="#818cf8" />}>Roles del sistema</Pill>
            <h2 style={{ fontSize: "clamp(22px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 14px", color: "#fff" }}>
              Cada actor, su propio panel
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.50)", maxWidth: 540, margin: "0 auto", lineHeight: 1.80 }}>
              9 roles completamente diferenciados. Menus, permisos y modulos especificos para cada funcion institucional.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {roles.map(r => (
              <div key={r.rol} className="role-card" style={{ padding: "20px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(${r.grad})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <r.icon size={19} color="#fff" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.rol}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", margin: 0, lineHeight: 1.5 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ padding: "80px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Pill color="#10b981" bg="#f0fdf4" border="#bbf7d0" icon={<Heart size={12} color="#10b981" />}>Testimonios</Pill>
            <h2 style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 14px", color: "#0f172a" }}>
              Lo que dicen los usuarios
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
            {testimonios.map((t, i) => (
              <div key={t.nombre} className="role-card" style={{ padding: "26px", borderRadius: 20, background: i % 2 === 0 ? "#fff" : "#fafbff", border: "1px solid #e8edf5", boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
                <Quote size={26} color="#e0e7ff" style={{ marginBottom: 14 }} />
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.80, margin: "0 0 18px", fontStyle: "italic" }}>
                  "{t.texto}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{t.nombre}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{t.rol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ padding: "72px 20px", background: "linear-gradient(135deg,#1e1b4b 0%,#1d4ed8 100%)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 28, textAlign: "center" }}>
          {[
            { val: "9",    lbl: "Roles de usuario",        desc: "completamente diferenciados" },
            { val: "40+",  lbl: "Modulos funcionales",     desc: "cubriendo todo el proceso"   },
            { val: "57",   lbl: "Interfaces desarrolladas", desc: "listas para usar"            },
            { val: "100%", lbl: "Normativa colombiana",    desc: "incorporada en el sistema"   },
          ].map((s, i) => (
            <div key={s.lbl} className={animStats ? "stat-anim" : ""} style={{ animationDelay: `${i * 100}ms` }}>
              <p style={{ fontSize: 48, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.03em" }}>{s.val}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.90)", margin: "0 0 4px" }}>{s.lbl}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NORMATIVA */}
      <section id="normativa" style={{ padding: "80px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="landing-normativa-grid">
            <div>
              <Pill color="#16a34a" bg="#f0fdf4" border="#bbf7d0" icon={<Shield size={12} color="#16a34a" />}>Cumplimiento normativo</Pill>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,40px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 16px", color: "#0f172a" }}>
                Alineado con la normativa educativa colombiana
              </h2>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.80, marginBottom: 22 }}>
                EduRural incorpora de forma nativa los requisitos del sector educativo oficial colombiano, incluyendo el regimen de inhabilidades docentes de la Ley 1918 de 2018.
              </p>
              <button onClick={() => navigate("/login")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 11, background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
                Explorar el sistema <ArrowRight size={15} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {normativa.map(n => (
                <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e8edf5" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e8edf5"; }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle2 size={13} color="#16a34a" />
                  </div>
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, lineHeight: 1.5 }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 20px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Pill color="#6366f1" bg="#eef2ff" border="#c7d2fe" icon={<Sparkles size={12} color="#6366f1" />}>FAQ</Pill>
            <h2 style={{ fontSize: "clamp(22px,4vw,42px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 12px", color: "#0f172a" }}>
              Preguntas frecuentes
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item" onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{ borderRadius: 14, background: "#fff", border: `1px solid ${faqOpen === i ? "#c7d2fe" : "#e8edf5"}`, overflow: "hidden", cursor: "pointer", transition: "all 180ms" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: faqOpen === i ? "#4f46e5" : "#1e293b" }}>{faq.q}</span>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: faqOpen === i ? "#eef2ff" : "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 180ms", transform: faqOpen === i ? "rotate(45deg)" : "rotate(0)" }}>
                    <span style={{ fontSize: 18, color: faqOpen === i ? "#4f46e5" : "#94a3b8", fontWeight: 300, lineHeight: 1 }}>+</span>
                  </div>
                </div>
                {faqOpen === i && (
                  <div style={{ padding: "0 18px 16px" }}>
                    <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.80, margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "100px 20px", background: "linear-gradient(160deg,#1e1b4b 0%,#1d4ed8 55%,#0f172a 100%)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "36px 36px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 740, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", borderRadius: 99, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", marginBottom: 26 }}>
            <Award size={14} color="#fbbf24" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.90)" }}>
              Corporacion Universitaria Latinoamericana - Proyecto II - 2026
            </span>
          </div>
          <h2 style={{ fontSize: "clamp(28px,5vw,58px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.08 }}>
            Transforma la gestion<br />academica de Achi
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.60)", margin: "0 0 40px", lineHeight: 1.80 }}>
            Sin costos de licencia. Accesible desde cualquier dispositivo. Pensado para el contexto rural colombiano.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/login")}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 36px", borderRadius: 14, background: "#fff", color: "#1d4ed8", fontSize: 16, fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 10px 40px rgba(0,0,0,0.22)", transition: "all 200ms" }}>
              Ingresar al sistema <ArrowRight size={19} />
            </button>
            <a href="#caracteristicas"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 30px", borderRadius: 14, background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, fontWeight: 600, border: "1.5px solid rgba(255,255,255,0.20)", textDecoration: "none", cursor: "pointer" }}>
              Ver caracteristicas
            </a>
          </div>
        </div>
      </section>

      {/* QR */}
      <section style={{ padding: "72px 20px", background: "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="landing-qr-grid">
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: 18 }}>
                <Smartphone size={14} color="#6366f1" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>Instala la app en tu movil</span>
              </div>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 14px", color: "#0f172a" }}>
                Escanea y accede desde cualquier lugar
              </h2>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.80, marginBottom: 20 }}>
                Usa la camara de tu celular para escanear el codigo QR e instalar EduRural como una aplicacion en tu dispositivo.
              </p>

              {(currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1")) && (
                <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 14px", marginBottom: 18 }}>
                  <p style={{ fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                    En modo desarrollo el QR solo funciona en este dispositivo. Publica en Netlify para que funcione desde cualquier celular.
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={handleCopyUrl}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 11, background: "#fff", color: "#6366f1", fontSize: 13, fontWeight: 600, border: "1.5px solid #c7d2fe", cursor: "pointer" }}>
                  {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                  {copied ? "Copiado!" : "Copiar URL"}
                </button>
                <button onClick={() => navigate("/login")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 11, background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                  <Download size={15} /> Ingresar al sistema
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ background: "#fff", borderRadius: 22, padding: 28, boxShadow: "0 20px 60px rgba(99,102,241,0.15)", border: "2px solid #e0e7ff" }}>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <div style={{ width: 54, height: 54, background: "linear-gradient(135deg,#6366f1,#4f46e5)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Smartphone size={25} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 3px" }}>EduRural App</h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Escanea para instalar</p>
                </div>
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 14, border: "2px solid #e2e8f0" }}>
                  <QRCodeSVG value={currentUrl} size={180} level="H" includeMargin={false} style={{ display: "block", margin: "0 auto" }} />
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "10px 0 0", textAlign: "center", wordBreak: "break-all" }}>{currentUrl}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" style={{ background: "#060b18", padding: "60px 20px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GraduationCap size={16} color="#fff" />
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>EduRural</span>
              </div>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.80, margin: "0 0 16px" }}>
                Sistema de gestion academica para las instituciones educativas rurales del municipio de Achi, Bolivar.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {[Mail, Phone].map((Icon, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Icon size={14} color="rgba(255,255,255,0.40)" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <FooterHead>Institucion</FooterHead>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["IE Tecnica Agropecuaria de Achi", "Centro Educativo Rural El Progreso", "Centro Educativo Los Almendros"].map(n => (
                  <span key={n} style={{ fontSize: 13, color: "#475569" }}>{n}</span>
                ))}
              </div>
            </div>

            <div>
              <FooterHead>Proyecto academico</FooterHead>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Corporacion Universitaria Latinoamericana", "Ingenieria de Sistemas", "Proyecto de Grado II - 2026", "Asesor: Docente Asignado"].map(n => (
                  <span key={n} style={{ fontSize: 13, color: "#475569" }}>{n}</span>
                ))}
              </div>
            </div>

            <div>
              <FooterHead>Acceso rapido</FooterHead>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[["Caracteristicas","#caracteristicas"],["Roles","#roles"],["Modulos","#modulos"],["Normativa","#normativa"]].map(([label, href]) => (
                  <a key={href} href={href} style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#a5b4fc"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#475569"; }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>
              2026 EduRural - Todos los derechos reservados
            </p>
            <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>
              Municipio de Achi, Bolivar - Colombia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
