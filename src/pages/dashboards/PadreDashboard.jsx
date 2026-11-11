import {
  Star, CheckSquare, FileText, Bell,
  ArrowRight, MessageSquare, GraduationCap,
  TrendingUp, AlertTriangle, BookOpen
} from "lucide-react";
import StatCard   from "../../components/StatCard";
import Badge      from "../../components/Badge";
import PageHeader from "../../components/PageHeader";
import { notas, tareas, alertas, materias, usuarios, asistencia } from "../../data/mockData";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const card = {
  background: "#fff", borderRadius: 18,
  border: "1px solid #e8edf5",
  boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
  overflow: "hidden",
};
const cardHeader = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "16px 20px", borderBottom: "1px solid #f0f4fa",
};
const linkBtn = {
  display: "flex", alignItems: "center", gap: 4,
  fontSize: 12, fontWeight: 600, color: "#2563eb",
  background: "none", border: "none", cursor: "pointer",
};

export default function PadreDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const hijosIds  = user?.hijosIds || [];
  const hijo      = hijosIds.length ? usuarios.find(u => u.id === hijosIds[0]) : null;

  const misNotas     = hijo ? notas.filter(n => n.estudianteId === hijo.id) : [];
  const misTareas    = hijo ? tareas.filter(t => t.cursoId === hijo.cursoId) : [];
  const asistHijo    = hijo ? asistencia.filter(a => a.estudianteId === hijo.id) : [];

  const promedio = misNotas.length
    ? (misNotas.reduce((a, b) => a + b.promedio, 0) / misNotas.length).toFixed(1)
    : "—";

  const tareasActivas = misTareas.filter(t => t.estado === "activa").length;

  const pctAsistencia = asistHijo.length
    ? Math.round((asistHijo.filter(a => a.estado === "presente").length / asistHijo.length) * 100)
    : null;

  const alertasSinLeer = alertas.filter(a => !a.leida).length;

  /* Iniciales del hijo (sin emoji) */
  const initials = hijo
    ? hijo.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  if (!hijo) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GraduationCap size={28} style={{ color: "#2563eb" }} />
        </div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>Sin hijos registrados</p>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Comunícate con la secretaría para vincular a tu hijo(a) a tu cuenta.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Panel de Acudiente"
        subtitle={`${user?.nombre} · Padre / Acudiente`}
        icon={GraduationCap}
        color="#2563eb"
      />

      {/* Hero del hijo */}
      <div style={{
        borderRadius: 20, padding: "24px",
        background: "linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%)",
        position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(37,99,235,0.28)",
      }}>
        {/* Orbes decorativos */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          {/* Avatar con iniciales */}
          <div style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: "rgba(255,255,255,0.18)",
            border: "2px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
            backdropFilter: "blur(8px)",
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {hijo.nombre}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>
              Grado {hijo.grado} · IE Rural El Progreso
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 99, background: "rgba(34,197,94,0.18)", color: "#86efac", border: "1px solid rgba(34,197,94,0.28)", flexShrink: 0 }}>
            ● Activo
          </span>
        </div>

        {/* Mini stats */}
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { label: "Promedio",     value: promedio },
            { label: "Asistencia",   value: pctAsistencia !== null ? `${pctAsistencia}%` : "—" },
            { label: "Tareas pend.", value: tareasActivas },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.10)", borderRadius: 12, padding: "12px 10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(8px)" }}>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 5 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
        <StatCard title="Promedio Actual"    value={promedio}      subtitle="período activo"   icon={Star}        color="blue"   />
        <StatCard title="Asistencia"         value={pctAsistencia !== null ? `${pctAsistencia}%` : "—"} subtitle="registrada" icon={CheckSquare} color="green" />
        <StatCard title="Tareas Pendientes"  value={tareasActivas} subtitle="por entregar"     icon={FileText}    color="yellow" />
        <StatCard title="Alertas"            value={alertasSinLeer}subtitle="sin revisar"      icon={Bell}        color="red"    />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>

        {/* Notas */}
        <div style={card}>
          <div style={cardHeader}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Notas de {hijo.nombre.split(" ")[0]}</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Período activo</p>
            </div>
            <button onClick={() => navigate("/boletines")} style={linkBtn}>
              Boletín <ArrowRight size={12} />
            </button>
          </div>

          {misNotas.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
              <BookOpen size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 13, margin: 0 }}>Sin notas registradas en este período</p>
            </div>
          ) : (
            <div>
              {misNotas.map((n, i) => {
                const materia  = materias.find(m => m.id === n.materiaId);
                const aprobado = n.promedio >= 3.0;
                const color    = n.promedio >= 3.5 ? "#16a34a" : n.promedio >= 3.0 ? "#d97706" : "#dc2626";
                return (
                  <div key={n.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 20px",
                    borderBottom: i < misNotas.length - 1 ? "1px solid #f4f6fb" : "none",
                    transition: "background 150ms",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ minWidth: 0, marginRight: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{materia?.nombre}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                        {n.nota1} · {n.nota2} · {n.nota3}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color }}>{n.promedio}</span>
                      <Badge label={aprobado ? "Aprobado" : "Reprobado"} variant={aprobado ? "success" : "danger"} dot />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Acciones + Alertas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Acciones rápidas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
            {[
              { label: "Mensajes",   icon: MessageSquare, path: "/mensajes-estudiante", color: "#2563eb", bg: "#eff6ff" },
              { label: "Citaciones", icon: Bell,          path: "/citaciones",          color: "#f59e0b", bg: "#fffbeb" },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                borderRadius: 16, background: "#fff", border: "1px solid #e8edf5",
                boxShadow: "0 1px 4px rgba(15,23,42,0.04)", cursor: "pointer", transition: "all 180ms",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.04)"; }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <a.icon size={16} style={{ color: a.color }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{a.label}</span>
              </button>
            ))}
          </div>

          {/* Alertas */}
          <div style={{ ...card, flex: 1 }}>
            <div style={cardHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Alertas Recientes</p>
              </div>
              <button onClick={() => navigate("/alertas")} style={linkBtn}>
                Ver todas <ArrowRight size={12} />
              </button>
            </div>
            {alertas.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Sin alertas recientes</div>
            ) : (
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                {alertas.slice(0, 3).map(a => {
                  const colors = { alto: { bg: "#fff1f2", border: "#fecdd3", dot: "#ef4444", text: "#9f1239" }, medio: { bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", text: "#92400e" }, info: { bg: "#eff6ff", border: "#bfdbfe", dot: "#3b82f6", text: "#1e40af" } };
                  const c = colors[a.nivel] || colors.info;
                  return (
                    <div key={a.id} style={{
                      display: "flex", gap: 10, padding: "10px 12px", borderRadius: 12,
                      background: c.bg, border: `1px solid ${c.border}`,
                      opacity: a.leida ? 0.55 : 1,
                    }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, flexShrink: 0, marginTop: 5 }} />
                      <div>
                        <p style={{ fontSize: 12, color: c.text, fontWeight: 500, lineHeight: 1.5, margin: 0 }}>{a.mensaje}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{a.fecha}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
