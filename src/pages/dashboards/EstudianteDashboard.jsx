import {
  Star, FileText, CheckSquare, Bell,
  ArrowRight, TrendingUp, Home, Clock
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer, Tooltip
} from "recharts";
import StatCard   from "../../components/StatCard";
import Badge      from "../../components/Badge";
import PageHeader from "../../components/PageHeader";
import { notas, tareas, alertas, materias } from "../../data/mockData";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const radarData = [
  { materia: "Mat.",  nota: 4.1 },
  { materia: "Esp.",  nota: 4.3 },
  { materia: "CN",    nota: 3.8 },
  { materia: "CS",    nota: 4.0 },
];

const CustomRadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e8edf5",
      borderRadius: 10, padding: "6px 12px",
      boxShadow: "0 4px 16px rgba(15,23,42,0.10)",
      fontSize: 13, fontWeight: 700, color: "#2563eb",
    }}>
      {payload[0].value}
    </div>
  );
};

function NotaBar({ promedio }) {
  const pct   = ((promedio - 1) / 4) * 100;
  const color = promedio >= 4.0 ? "#22c55e" : promedio >= 3.0 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-black flex-shrink-0" style={{ color }}>{promedio}</span>
    </div>
  );
}

export default function EstudianteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const misNotas  = notas.filter(n => n.estudianteId === user.id);
  const misTareas = tareas.filter(t => t.cursoId === user.cursoId && t.estado === "activa");
  const promedio  = misNotas.length
    ? (misNotas.reduce((a, b) => a + b.promedio, 0) / misNotas.length).toFixed(1)
    : "—";
  const alertasSinLeer = alertas.filter(a => !a.leida && a.estudianteId === user.id).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mi Inicio"
        subtitle={`${user.nombre} · ${user.grado} · Período 2 — 2025`}
        icon={Home}
        color="#2563eb"
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
        <StatCard title="Mi Promedio"       value={promedio}         subtitle="período 2 — 2025" icon={Star}        color="blue"   trend={8}  />
        <StatCard title="Tareas Pendientes" value={misTareas.length} subtitle="por entregar"     icon={FileText}    color="yellow"            />
        <StatCard title="Asistencia"        value="94%"              subtitle="este período"     icon={CheckSquare} color="green"             />
        <StatCard title="Alertas"           value={alertasSinLeer}   subtitle="sin leer"         icon={Bell}        color="orange"            />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>

        {/* Radar */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #f4f6fb" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Rendimiento por Materia</p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Período 2 — 2025</p>
            </div>
            <TrendingUp size={16} style={{ color: "#3b82f6" }} />
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="materia" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} />
                <Radar dataKey="nota" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2.5} />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notas */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #f4f6fb" }}>
            <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Mis Notas — Período 2</p>
            <button onClick={() => navigate("/boletines")}
              className="flex items-center gap-1 text-xs font-semibold border-0 bg-transparent cursor-pointer"
              style={{ color: "#2563eb" }}>
              Boletín <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {misNotas.map(n => {
              const mat = materias.find(m => m.id === n.materiaId);
              const aprobado = n.promedio >= 3.0;
              return (
                <div key={n.id} className="px-4 py-3 rounded-xl transition-colors"
                  style={{ background: "#f8fafc" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: "#1e293b" }}>{mat?.nombre}</p>
                    <Badge label={aprobado ? "Aprobado" : "Reprobado"} variant={aprobado ? "success" : "danger"} dot />
                  </div>
                  <NotaBar promedio={n.promedio} />
                  <p className="text-[11px] mt-1" style={{ color: "#94a3b8" }}>
                    Notas: {n.nota1} · {n.nota2} · {n.nota3}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tareas pendientes */}
      {misTareas.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #f4f6fb" }}>
            <div className="flex items-center gap-2">
              <FileText size={14} style={{ color: "#94a3b8" }} />
              <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Tareas Pendientes</p>
            </div>
            <button onClick={() => navigate("/tareas")}
              className="flex items-center gap-1 text-xs font-semibold border-0 bg-transparent cursor-pointer"
              style={{ color: "#2563eb" }}>
              Ver todas <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {misTareas.map(t => (
              <div key={t.id} className="flex items-start gap-3 p-4 rounded-xl transition-all"
                style={{ border: "1.5px solid #e8edf5", background: "#fafbff" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#f0f7ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8edf5"; e.currentTarget.style.background = "#fafbff"; }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <FileText size={15} style={{ color: "#f97316" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1e293b" }}>{t.titulo}</p>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#64748b" }}>{t.descripcion}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock size={11} style={{ color: "#f97316" }} />
                    <span className="text-[11px] font-bold" style={{ color: "#f97316" }}>
                      Vence: {t.fechaLimite}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
