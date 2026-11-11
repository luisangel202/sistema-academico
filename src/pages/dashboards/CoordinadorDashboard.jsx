import {
  Star, AlertTriangle, FileText, TrendingDown,
  CheckCircle, ArrowRight, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import StatCard   from "../../components/StatCard";
import Badge      from "../../components/Badge";
import PageHeader from "../../components/PageHeader";
import { solicitudesCambioNota, usuarios } from "../../data/mockData";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useInstState } from "../../hooks/useInstState";

const promediosPorCurso = [
  { curso: "6A", promedio: 4.0 },
  { curso: "7A", promedio: 3.7 },
  { curso: "7B", promedio: 3.9 },
  { curso: "8A", promedio: 4.1 },
];

const alertasAcademicas = [
  { nivel: "alto",  titulo: "Sofía Torres — Riesgo alto",                desc: "Promedio 2.9 en Español · Período 2" },
  { nivel: "medio", titulo: "Curso 7A — Bajo rendimiento en Matemáticas",desc: "Promedio 3.2 · 8 estudiantes por debajo de 3.0" },
];

function getBarColor(promedio) {
  if (promedio >= 4.0) return "#22c55e";
  if (promedio >= 3.5) return "#3b82f6";
  return "#f59e0b";
}

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const color = getBarColor(payload[0].value);
  return (
    <div style={{
      background: "#fff", border: "1px solid #e8edf5",
      borderRadius: 10, padding: "8px 14px",
      boxShadow: "0 4px 16px rgba(15,23,42,0.10)",
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 3 }}>Curso {label}</p>
      <p style={{ fontSize: 16, fontWeight: 800, color }}>{payload[0].value}</p>
    </div>
  );
};

export default function CoordinadorDashboard() {
  const navigate   = useNavigate();
  const { getMetricas, notas, usuarios: todosUsuarios } = useData();
  const [planes]   = useInstState("er_planes_mejoramiento", []);
  const pendientes = solicitudesCambioNota.filter(s => s.estado === "pendiente");

  // Calcular estudiantes en riesgo (promedio < 3.0) desde notas reales
  const estudiantesRiesgo = (() => {
    const totales = {};
    Object.values(notas).forEach(actividades => {
      actividades.forEach(act => {
        Object.entries(act.notas || {}).forEach(([estId, nota]) => {
          const v = parseFloat(nota);
          if (!isNaN(v)) {
            if (!totales[estId]) totales[estId] = { sum: 0, count: 0 };
            totales[estId].sum += v;
            totales[estId].count += 1;
          }
        });
      });
    });
    return Object.entries(totales).filter(([, d]) => d.sum / d.count < 3.0).length;
  })();
  const planesActivos = planes.filter(p => p.estado === "activo").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard Académico"
        subtitle="Coordinación · IE Rural El Progreso"
        icon={BarChart3}
        color="#2563eb"
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
        <StatCard title="Promedio Institucional" value="3.9"                    subtitle="período 2 — 2025"          icon={Star}         color="blue"   />
        <StatCard title="Estudiantes en Riesgo"  value={estudiantesRiesgo}       subtitle="promedio menor a 3.0"      icon={TrendingDown}  color="red"    />
        <StatCard title="Cambios de Nota"        value={pendientes.length}       subtitle="pendientes de aprobación"  icon={FileText}      color="yellow" />
        <StatCard title="Planes de Mejora"       value={planesActivos}           subtitle="activos este período"      icon={CheckCircle}   color="green"  />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>

        {/* Bar chart promedios */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #f4f6fb" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Promedio por Curso</p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Período 2 — 2025</p>
            </div>
            <button onClick={() => navigate("/indicadores-curso")}
              className="flex items-center gap-1 text-xs font-semibold border-0 bg-transparent cursor-pointer"
              style={{ color: "#2563eb" }}>
              Indicadores <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={promediosPorCurso} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f6fb" vertical={false} />
                <XAxis dataKey="curso" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="promedio" radius={[8,8,0,0]} name="Promedio">
                  {promediosPorCurso.map((entry, i) => (
                    <Cell key={i} fill={getBarColor(entry.promedio)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Leyenda */}
            <div className="flex items-center gap-5 mt-2">
              {[
                { color: "#22c55e", label: "≥ 4.0" },
                { color: "#3b82f6", label: "≥ 3.5" },
                { color: "#f59e0b", label: "< 3.5" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                  <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Solicitudes cambio nota */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #f4f6fb" }}>
            <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Cambios de Nota Pendientes</p>
            <button onClick={() => navigate("/cambios-nota")}
              className="flex items-center gap-1 text-xs font-semibold border-0 bg-transparent cursor-pointer"
              style={{ color: "#2563eb" }}>
              Ver todos <ArrowRight size={12} />
            </button>
          </div>

          <div className="p-4">
            {pendientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "#f0fdf4" }}>
                  <CheckCircle size={22} style={{ color: "#22c55e" }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "#64748b" }}>Sin solicitudes pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendientes.map(s => {
                  const docente    = usuarios.find(u => u.id === s.docenteId);
                  const estudiante = usuarios.find(u => u.id === s.estudianteId);
                  return (
                    <div key={s.id} className="p-4 rounded-xl"
                      style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                      {/* Cabecera */}
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <p className="text-sm font-bold" style={{ color: "#1e293b" }}>{estudiante?.nombre}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                            Docente: {docente?.nombre}
                          </p>
                        </div>
                        <Badge label="Pendiente" variant="warning" dot />
                      </div>

                      {/* Motivo */}
                      <p className="text-xs px-3 py-2 rounded-lg mb-3"
                        style={{ background: "rgba(255,255,255,0.7)", color: "#475569", border: "1px solid rgba(255,255,255,0.9)" }}>
                        {s.motivo}
                      </p>

                      {/* Notas */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: "#fff1f2", color: "#dc2626", border: "1px solid #fecdd3" }}>
                          {s.notaAnterior} anterior
                        </div>
                        <span style={{ color: "#94a3b8", fontSize: 12 }}>→</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                          {s.notaNueva} nueva
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-xl text-xs font-bold text-white border-0 cursor-pointer transition-all"
                          style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 2px 10px rgba(34,197,94,0.25)" }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,197,94,0.35)"}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(34,197,94,0.25)"}>
                          ✓ Aprobar
                        </button>
                        <button className="flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all"
                          style={{ background: "#fff", color: "#dc2626", border: "1px solid #fecdd3" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
                          ✗ Rechazar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alertas académicas */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
        <div className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: "1px solid #f4f6fb" }}>
          <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
          <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Alertas Académicas</p>
        </div>
        <div className="p-4 space-y-3">
          {alertasAcademicas.map((a, i) => {
            const isAlto = a.nivel === "alto";
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                style={{
                  background: isAlto ? "#fff1f2" : "#fffbeb",
                  border: `1px solid ${isAlto ? "#fecdd3" : "#fde68a"}`,
                }}>
                <AlertTriangle size={15} className="flex-shrink-0 mt-0.5"
                  style={{ color: isAlto ? "#ef4444" : "#f59e0b" }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: isAlto ? "#9f1239" : "#92400e" }}>
                    {a.titulo}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: isAlto ? "#be123c" : "#b45309" }}>
                    {a.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
