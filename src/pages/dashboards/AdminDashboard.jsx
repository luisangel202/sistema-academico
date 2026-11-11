import {
  Users, BookOpen, GraduationCap, TrendingUp,
  AlertTriangle, UserCheck, ArrowRight,
  LayoutDashboard, BarChart3, Calendar
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import StatCard   from "../../components/StatCard";
import Badge      from "../../components/Badge";
import PageHeader from "../../components/PageHeader";
import { cursos, periodos, alertas, usuarios } from "../../data/mockData";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";

const rendimientoData = [
  { periodo: "P1", promedio: 3.8 },
  { periodo: "P2", promedio: 4.0 },
  { periodo: "P3", promedio: 3.9 },
  { periodo: "P4", promedio: 4.2 },
];

const nivelCfg = {
  alto:  { bg: "#fff1f2", border: "#fecdd3", dot: "#ef4444", text: "#9f1239" },
  medio: { bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", text: "#92400e" },
  info:  { bg: "#eff6ff", border: "#bfdbfe", dot: "#3b82f6", text: "#1e40af" },
};

/* ── Helpers de estilo unificados ── */
const card = {
  background: "#fff", borderRadius: 18,
  border: "1px solid #e8edf5",
  boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
  overflow: "hidden",
};
const cardHeader = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1px solid #f0f4fa",
};
const sectionTitle = { fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 };
const sectionSub   = { fontSize: 12, color: "#94a3b8", marginTop: 2 };
const linkBtn = {
  display: "flex", alignItems: "center", gap: 4,
  fontSize: 12, fontWeight: 600, color: "#2563eb",
  background: "none", border: "none", cursor: "pointer",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 10, padding: "8px 14px", boxShadow: "0 4px 16px rgba(15,23,42,0.10)" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 800, color: "#2563eb" }}>{payload[0].value}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { getMetricas, periodos } = useData();
  const { totalEstudiantes, totalDocentes, totalCursos } = getMetricas();
  const periodoActivo = periodos.find(p => p.estado === "activo");
  const alertasActivas = alertas.filter(a => !a.leida);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Dashboard Institucional"
        subtitle="IE Rural El Progreso · Período 2 — 2025"
        icon={LayoutDashboard}
        color="#2563eb"
        action={
          <button onClick={() => navigate("/reportes")} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 11,
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.28)",
          }}>
            <BarChart3 size={14} /> Ver reportes
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
        <StatCard title="Estudiantes"      value={totalEstudiantes}  subtitle="matriculados activos"       icon={GraduationCap} color="blue"   trend={5} />
        <StatCard title="Docentes"         value={totalDocentes}     subtitle="activos en la institución"  icon={UserCheck}     color="green" />
        <StatCard title="Cursos Activos"   value={totalCursos}       subtitle="en período actual"          icon={BookOpen}      color="indigo" />
        <StatCard title="Promedio General" value="3.9"               subtitle={`institución · ${periodoActivo?.nombre || "período activo"}`} icon={TrendingUp} color="yellow" />
      </div>

      {/* Gráfica + Períodos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>

        {/* Área chart */}
        <div style={{ ...card, gridColumn: "span 1" }} className="lg:col-span-2">
          <div style={cardHeader}>
            <div>
              <p style={sectionTitle}>Rendimiento Académico</p>
              <p style={sectionSub}>Promedio institucional por período</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "#eff6ff", color: "#2563eb" }}>2025</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={rendimientoData}>
                <defs>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4fa" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[3.5, 4.5]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="promedio" stroke="#2563eb" strokeWidth={2.5}
                  fill="url(#gradBlue)"
                  dot={{ r: 4, fill: "#2563eb", strokeWidth: 2.5, stroke: "#fff" }}
                  activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Períodos */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={14} style={{ color: "#94a3b8" }} />
              <p style={sectionTitle}>Períodos</p>
            </div>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            {periodos.map(p => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", borderRadius: 12,
                background: "#f8fafc", border: "1px solid #f0f4fa",
                transition: "all 150ms",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f0f4ff"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#f0f4fa"; }}>
                <div style={{ minWidth: 0, marginRight: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{p.inicio} → {p.fin}</p>
                </div>
                <Badge label={p.estado} variant={p.estado} dot />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de cursos */}
      <div style={card}>
        <div style={cardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={14} style={{ color: "#94a3b8" }} />
            <p style={sectionTitle}>Cursos Activos</p>
          </div>
          <button onClick={() => navigate("/cursos")} style={linkBtn}>
            Ver todos <ArrowRight size={12} />
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Curso", "Grado", "Estudiantes", "Director"].map((h, i) => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 20px",
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", color: "#94a3b8",
                    borderBottom: "1px solid #f0f4fa",
                    display: i > 1 ? undefined : undefined,
                  }}
                    className={i > 1 ? "hidden md:table-cell" : ""}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cursos.map((c, idx) => {
                const director = usuarios.find(u => u.id === c.directorId);
                return (
                  <tr key={c.id}
                    style={{ borderBottom: idx < cursos.length - 1 ? "1px solid #f4f6fb" : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 20px" }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{c.nombre}</p>
                    </td>
                    <td style={{ padding: "12px 20px" }} className="hidden md:table-cell">
                      <span style={{ fontSize: 13, color: "#64748b" }}>Grado {c.grado}</span>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                        <Users size={13} style={{ color: "#94a3b8" }} /> {c.estudiantes}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px" }} className="hidden md:table-cell">
                      <span style={{ fontSize: 13, color: "#64748b" }}>{director?.nombre || "Sin asignar"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas activas */}
      {alertasActivas.length > 0 && (
        <div style={card}>
          <div style={cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
              <p style={sectionTitle}>Alertas Activas</p>
            </div>
            <button onClick={() => navigate("/alertas")} style={linkBtn}>
              Ver todas <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            {alertasActivas.slice(0, 4).map(a => {
              const cfg = nivelCfg[a.nivel] || nivelCfg.info;
              return (
                <div key={a.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 14px", borderRadius: 12,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.55 }}>{a.mensaje}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{a.fecha}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, flexShrink: 0, background: `${cfg.dot}18`, color: cfg.text }}>
                    {a.nivel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
