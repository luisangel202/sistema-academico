import { useState } from "react";
import { Brain, AlertTriangle, TrendingDown, CheckCircle, RefreshCw, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";
import { notas, asistencia, tareas, usuarios, materias } from "../data/mockData";

// ── Motor de reglas de riesgo (sin IA real, basado en el spec) ──────────────
function calcularRiesgos() {
  const estudiantes = usuarios.filter(u => u.rol === "ESTUDIANTE");
  return estudiantes.map(est => {
    const misNotas = notas.filter(n => n.estudianteId === est.id);
    const promedio = misNotas.length
      ? misNotas.reduce((a, b) => a + b.promedio, 0) / misNotas.length
      : null;

    const ausencias = asistencia.filter(a => a.estudianteId === est.id && a.estado === "ausente").length;
    const totalClases = asistencia.filter(a => a.estudianteId === est.id).length || 1;
    const pctAsistencia = ((totalClases - ausencias) / totalClases) * 100;

    const tareasVencidas = tareas.filter(t => t.estado === "vencida").length; // simplificado

    // Reglas del spec
    let nivel = "bajo";
    const motivos = [];
    const recomendaciones = [];

    if (promedio !== null && promedio < 3.0) {
      nivel = "alto";
      motivos.push(`Promedio ${promedio.toFixed(1)} — por debajo de 3.0`);
      recomendaciones.push("Plan de mejoramiento urgente");
      recomendaciones.push("Remitir a psicoorientación");
    } else if (promedio !== null && promedio < 3.5) {
      nivel = nivel === "alto" ? "alto" : "medio";
      motivos.push(`Promedio ${promedio.toFixed(1)} — entre 3.0 y 3.5`);
      recomendaciones.push("Refuerzo académico semanal");
    }

    if (pctAsistencia < 80) {
      nivel = "alto";
      motivos.push(`Asistencia ${pctAsistencia.toFixed(0)}% — crítica`);
      recomendaciones.push("Citación urgente al acudiente");
    } else if (pctAsistencia < 90) {
      if (nivel !== "alto") nivel = "medio";
      motivos.push(`Asistencia ${pctAsistencia.toFixed(0)}% — por debajo del 90%`);
      recomendaciones.push("Seguimiento de asistencia");
    }

    const notaBaja = misNotas.find(n => n.promedio < 3.0);
    const materiaCritica = notaBaja ? materias.find(m => m.id === notaBaja.materiaId) : null;

    return {
      estudianteId: est.id,
      nombre: est.nombre,
      avatar: est.avatar,
      grado: est.grado || "7A",
      promedio: promedio ? promedio.toFixed(1) : "N/A",
      asistencia: pctAsistencia.toFixed(0),
      nivel,
      motivos,
      recomendaciones,
      materiaCritica: materiaCritica?.nombre || null,
      responsable: nivel === "alto" ? "Coordinador + Psicoorientador" : "Docente director",
      fechaSeguimiento: "2025-05-20",
    };
  }).filter(r => r.nivel !== "bajo" || r.motivos.length > 0);
}

const nivelColor = {
  alto:  "bg-red-50 border-red-200",
  medio: "bg-yellow-50 border-yellow-200",
  bajo:  "bg-green-50 border-green-200",
};
const nivelBadge = { alto: "danger", medio: "warning", bajo: "success" };

const dataMaterias = [
  { materia: "Matemáticas", riesgo: 8 },
  { materia: "Español",     riesgo: 5 },
  { materia: "Ciencias",    riesgo: 3 },
  { materia: "Sociales",    riesgo: 2 },
  { materia: "Inglés",      riesgo: 6 },
];

export default function IAcademica() {
  const [riesgos, setRiesgos] = useState(calcularRiesgos);
  const [analizando, setAnalizando] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [expandido, setExpandido] = useState(null);

  const reanalizar = () => {
    setAnalizando(true);
    setTimeout(() => { setRiesgos(calcularRiesgos()); setAnalizando(false); }, 1500);
  };

  const filtrados = filtro === "todos" ? riesgos : riesgos.filter(r => r.nivel === filtro);
  const altos  = riesgos.filter(r => r.nivel === "alto").length;
  const medios = riesgos.filter(r => r.nivel === "medio").length;

  return (
    <div>
      <PageHeader
        title="Inteligencia Artificial Académica"
        subtitle="Detección automática de riesgos · Solo recomendaciones, sin acciones automáticas"
        action={
          <button onClick={reanalizar} disabled={analizando}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer disabled:opacity-60">
            <RefreshCw size={16} className={analizando ? "animate-spin" : ""}/>
            {analizando ? "Analizando..." : "Re-analizar"}
          </button>
        }
      />

      {/* Aviso */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <Brain size={18} className="flex-shrink-0 mt-0.5"/>
        <div>
          <p className="font-semibold">Motor de reglas académicas</p>
          <p className="text-xs mt-0.5 text-blue-600">
            Basado en: promedio &lt; 3.0 = riesgo alto · promedio 3.0–3.5 = riesgo medio · asistencia &lt; 80% = crítico.
            Todas las recomendaciones requieren aprobación humana.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Riesgo Alto" value={altos} subtitle="requieren intervención urgente" icon={AlertTriangle} color="red"/>
        <StatCard title="Riesgo Medio" value={medios} subtitle="requieren seguimiento" icon={TrendingDown} color="yellow"/>
        <StatCard title="Analizados" value={riesgos.length} subtitle="estudiantes evaluados" icon={Brain} color="blue"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfica materias */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Estudiantes en riesgo por Materia</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataMaterias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="materia" tick={{ fontSize: 11 }}/>
              <YAxis tick={{ fontSize: 11 }}/>
              <Tooltip/>
              <Bar dataKey="riesgo" fill="#ef4444" radius={[4,4,0,0]} name="En riesgo"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Distribución de Riesgo</h3>
          <div className="flex flex-col gap-3">
            {[
              { nivel:"alto",  label:"Riesgo Alto",  count: altos,  color:"bg-red-500" },
              { nivel:"medio", label:"Riesgo Medio", count: medios, color:"bg-yellow-500" },
              { nivel:"bajo",  label:"Sin riesgo",   count: riesgos.filter(r=>r.nivel==="bajo").length, color:"bg-green-500" },
            ].map(r => (
              <div key={r.nivel}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{r.label}</span>
                  <span className="font-semibold">{r.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${r.color}`}
                    style={{ width: `${riesgos.length ? (r.count/riesgos.length)*100 : 0}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {["todos","alto","medio"].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition border cursor-pointer ${filtro===f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
            {f === "todos" ? "Todos" : `Riesgo ${f}`}
          </button>
        ))}
      </div>

      {/* Tarjetas de riesgo */}
      <div className="flex flex-col gap-4">
        {filtrados.map(r => (
          <div key={r.estudianteId} className={`rounded-xl border p-5 shadow-sm ${nivelColor[r.nivel]}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-gray-100">
                  {r.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{r.nombre}</p>
                  <p className="text-xs text-gray-500">Grado {r.grado} · Promedio: <strong>{r.promedio}</strong> · Asistencia: <strong>{r.asistencia}%</strong></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={`Riesgo ${r.nivel}`} variant={nivelBadge[r.nivel]}/>
                <button onClick={() => setExpandido(expandido === r.estudianteId ? null : r.estudianteId)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer">
                  <Eye size={15}/>
                </button>
              </div>
            </div>

            {/* Motivos */}
            <div className="flex flex-wrap gap-2 mb-2">
              {r.motivos.map((m, i) => (
                <span key={i} className="text-xs bg-white/70 px-2 py-0.5 rounded-full border border-current/20">{m}</span>
              ))}
            </div>

            {/* Detalle expandido */}
            {expandido === r.estudianteId && (
              <div className="mt-3 bg-white/60 rounded-xl p-4 border border-white/80">
                <p className="text-xs font-semibold text-gray-600 mb-2">Recomendaciones del sistema:</p>
                <ul className="flex flex-col gap-1">
                  {r.recomendaciones.map((rec, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle size={12} className="text-green-600 flex-shrink-0"/>
                      {rec}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>👤 Responsable: {r.responsable}</span>
                  <span>📅 Seguimiento: {r.fechaSeguimiento}</span>
                  {r.materiaCritica && <span>📚 Materia crítica: {r.materiaCritica}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">
                  ⚠️ Esta es una recomendación automática. Requiere revisión y aprobación del coordinador o docente.
                </p>
              </div>
            )}
          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle size={32} className="mx-auto mb-3 text-green-400"/>
            <p className="font-medium">Sin estudiantes en riesgo en este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}
