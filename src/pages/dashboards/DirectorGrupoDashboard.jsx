import { Users, Star, AlertTriangle, MessageSquare, ArrowRight, TrendingUp, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/Badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usuarios, notas, asistencia, cursos, materias } from "../../data/mockData";

const estadoBadge = { bien: "success", alerta: "warning", riesgo: "danger" };
const estadoLabel = { bien: "Bien",    alerta: "Alerta",  riesgo: "Riesgo" };
const barColor    = p => p >= 4.0 ? "#10b981" : p >= 3.5 ? "#3b82f6" : p >= 3.0 ? "#f59e0b" : "#ef4444";

export default function DirectorGrupoDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  /* Curso asignado al director actual */
  const miCurso = cursos.find(c => c.directorId === user?.id);

  /* Estudiantes de ese curso */
  const estudiantesGrupo = miCurso
    ? usuarios.filter(u => u.rol === "ESTUDIANTE" && u.cursoId === miCurso.id)
    : [];

  /* Calcular promedio y asistencia por estudiante */
  const estudiantesConDatos = estudiantesGrupo.map(est => {
    const notasEst   = notas.filter(n => n.estudianteId === est.id);
    const asistEst   = asistencia.filter(a => a.estudianteId === est.id);
    const promedio   = notasEst.length
      ? parseFloat((notasEst.reduce((a, b) => a + b.promedio, 0) / notasEst.length).toFixed(1))
      : null;
    const pctAsist   = asistEst.length
      ? Math.round((asistEst.filter(a => a.estado === "presente").length / asistEst.length) * 100)
      : null;
    const estado     = promedio === null ? "alerta"
      : promedio < 3.0 ? "riesgo"
      : promedio < 3.5 ? "alerta"
      : "bien";
    return { ...est, promedio, pctAsist, estado };
  });

  /* Promedios por materia del curso */
  const materiasDelCurso = miCurso ? materias.filter(m => m.cursoId === miCurso.id) : [];
  const promediosPorMateria = materiasDelCurso.map(mat => {
    const notasMat = notas.filter(n => n.materiaId === mat.id);
    const prom     = notasMat.length
      ? parseFloat((notasMat.reduce((a, b) => a + b.promedio, 0) / notasMat.length).toFixed(1))
      : 0;
    return { materia: mat.nombre.slice(0, 8), promedio: prom };
  });

  const promedioGrupo = estudiantesConDatos.length
    ? (estudiantesConDatos.filter(e => e.promedio !== null).reduce((a, b) => a + (b.promedio || 0), 0)
      / estudiantesConDatos.filter(e => e.promedio !== null).length).toFixed(1)
    : "—";

  const enRiesgo = estudiantesConDatos.filter(e => e.estado === "riesgo").length;

  if (!miCurso) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#f0fdfa" }}>
          <Users size={28} style={{ color: "#14b8a6" }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: "#1e293b" }}>Sin grupo asignado</p>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            Comunícate con el Administrador para que te asignen un grupo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Mi Grupo — ${miCurso.nombre}`}
        subtitle={`${user?.nombre} · Director de Grupo · Período 2 — 2025`}
        icon={Users}
        color="#14b8a6"
        action={
          <button onClick={() => navigate("/mi-grupo")}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition border-0 cursor-pointer shadow-sm shadow-teal-200">
            Ver grupo completo <ArrowRight size={14} />
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 16 }}>
        <StatCard title="Estudiantes"    value={estudiantesGrupo.length} subtitle="en mi grupo"        icon={Users}         color="teal"   />
        <StatCard title="Promedio Grupo" value={promedioGrupo}           subtitle="período 2 — 2025"   icon={Star}          color="yellow" />
        <StatCard title="En Riesgo"      value={enRiesgo}                subtitle="requieren atención" icon={AlertTriangle} color="red"    />
        <StatCard title="Citaciones Pend." value={0}                     subtitle="sin atender"        icon={MessageSquare} color="orange" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
        {/* Gráfica promedios por materia */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-800">Promedio por Materia</h3>
              <p className="text-xs text-gray-400 mt-0.5">Período 2 — 2025</p>
            </div>
            <TrendingUp size={16} className="text-teal-400" />
          </div>
          {promediosPorMateria.length === 0 ? (
            <p className="text-sm text-center text-gray-400 py-8">Sin materias registradas</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={promediosPorMateria} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="materia" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="promedio" radius={[6, 6, 0, 0]} name="Promedio">
                  {promediosPorMateria.map((e, i) => (
                    <Cell key={i} fill={barColor(e.promedio)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Lista estudiantes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Estado del Grupo</h3>
            <button onClick={() => navigate("/observador")}
              className="text-xs text-teal-600 hover:text-teal-800 bg-transparent border-0 cursor-pointer flex items-center gap-1">
              Observador <ArrowRight size={12} />
            </button>
          </div>
          {estudiantesConDatos.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">Sin estudiantes en este grupo</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {estudiantesConDatos.map((e, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: e.estado === "riesgo" ? "#fee2e2" : e.estado === "alerta" ? "#fef3c7" : "#f0fdf4",
                        color:      e.estado === "riesgo" ? "#dc2626" : e.estado === "alerta" ? "#d97706" : "#16a34a",
                      }}>
                      {e.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{e.nombre}</p>
                      <p className="text-xs text-gray-400">
                        Asistencia: {e.pctAsist !== null ? `${e.pctAsist}%` : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className={`text-base font-black ${e.promedio >= 3.5 ? "text-green-600" : e.promedio >= 3.0 ? "text-yellow-600" : e.promedio !== null ? "text-red-600" : "text-gray-400"}`}>
                      {e.promedio ?? "—"}
                    </span>
                    <Badge label={estadoLabel[e.estado]} variant={estadoBadge[e.estado]} dot />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
        {[
          { label: "Registrar Observación", icon: CheckCircle,  path: "/observador",  color: "#3b82f6", bg: "#eff6ff" },
          { label: "Nueva Citación",        icon: MessageSquare, path: "/citaciones", color: "#f97316", bg: "#fff7ed" },
          { label: "Ver Reportes",          icon: TrendingUp,   path: "/reportes",    color: "#14b8a6", bg: "#f0fdfa" },
        ].map(a => (
          <button key={a.label} onClick={() => navigate(a.path)}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-left">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: a.bg }}>
              <a.icon size={18} style={{ color: a.color }} />
            </div>
            <span className="text-sm font-semibold text-gray-700">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
