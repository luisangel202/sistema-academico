import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/Badge";
import { TrendingUp, TrendingDown, Users, BarChart3 } from "lucide-react";
import { cursos, notas, asistencia, periodos, usuarios } from "../../data/mockData";

const COLORES = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"];

export default function IndicadoresCurso() {

  /* ── Calcular indicadores reales desde mockData ── */
  const datosCursos = useMemo(() => {
    return cursos.map(curso => {
      /* Estudiantes del curso */
      const estudiantesDelCurso = usuarios.filter(
        u => u.rol === "ESTUDIANTE" && u.cursoId === curso.id
      );
      const total = estudiantesDelCurso.length;
      if (total === 0) return { curso: curso.nombre, promedio: 0, aprobados: 0, reprobados: 0, asistencia: 0, total: 0 };

      /* Notas */
      const notasCurso = notas.filter(n =>
        estudiantesDelCurso.some(e => e.id === n.estudianteId)
      );
      const promedio = notasCurso.length
        ? parseFloat((notasCurso.reduce((a, b) => a + b.promedio, 0) / notasCurso.length).toFixed(1))
        : 0;

      /* Aprobados / reprobados */
      const aprobadosCount = notasCurso.filter(n => n.promedio >= 3.0).length;
      const pctAprobados   = notasCurso.length ? Math.round((aprobadosCount / notasCurso.length) * 100) : 0;
      const pctReprobados  = 100 - pctAprobados;

      /* Asistencia */
      const asistCurso    = asistencia.filter(a =>
        estudiantesDelCurso.some(e => e.id === a.estudianteId)
      );
      const pctAsistencia = asistCurso.length
        ? Math.round((asistCurso.filter(a => a.estado === "presente").length / asistCurso.length) * 100)
        : 0;

      return {
        curso:       curso.nombre,
        promedio,
        aprobados:   pctAprobados,
        reprobados:  pctReprobados,
        asistencia:  pctAsistencia,
        total,
      };
    }).filter(d => d.total > 0); /* Ocultar cursos sin estudiantes */
  }, []);

  /* ── Tendencia por período ── */
  const tendencia = useMemo(() => {
    return periodos.filter(p => p.estado !== "pendiente").map(p => {
      const fila = { periodo: p.nombre.split(" ")[0] || p.nombre };
      cursos.forEach(curso => {
        const estudiantesDelCurso = usuarios.filter(u => u.rol === "ESTUDIANTE" && u.cursoId === curso.id);
        const notasPeriodo = notas.filter(n =>
          n.periodoId === p.id && estudiantesDelCurso.some(e => e.id === n.estudianteId)
        );
        fila[curso.nombre] = notasPeriodo.length
          ? parseFloat((notasPeriodo.reduce((a, b) => a + b.promedio, 0) / notasPeriodo.length).toFixed(1))
          : null;
      });
      return fila;
    });
  }, []);

  const cursosConDatos  = cursos.filter(c => datosCursos.some(d => d.curso === c.nombre));
  const promedioInst    = datosCursos.length
    ? (datosCursos.reduce((a, b) => a + b.promedio, 0) / datosCursos.length).toFixed(1)
    : "—";
  const cursosEnRiesgo  = datosCursos.filter(c => c.promedio > 0 && c.promedio < 3.8).length;
  const totalEstudiantes = datosCursos.reduce((a, b) => a + b.total, 0);

  const barColor = p => p >= 4.0 ? "#10b981" : p >= 3.5 ? "#6366f1" : p >= 3.0 ? "#f59e0b" : "#ef4444";

  if (datosCursos.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="Indicadores por Curso" subtitle="Rendimiento académico comparativo" icon={BarChart3} color="#6366f1" />
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-20 text-gray-400" />
          <p className="text-gray-500 font-medium">Sin datos suficientes para mostrar indicadores</p>
          <p className="text-xs text-gray-400 mt-1">Registra notas y asistencia para ver los indicadores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Indicadores por Curso"
        subtitle="Rendimiento académico comparativo · Datos en tiempo real"
        icon={BarChart3}
        color="#6366f1"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Promedio Institucional" value={promedioInst}     subtitle="promedio de todos los cursos" icon={TrendingUp}  color="blue"  />
        <StatCard title="Cursos con Riesgo"      value={cursosEnRiesgo}   subtitle="promedio menor a 3.8"         icon={TrendingDown} color="red"   />
        <StatCard title="Total Estudiantes"      value={totalEstudiantes} subtitle="con notas registradas"        icon={Users}       color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Promedio por Curso</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosCursos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="curso" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="promedio" radius={[6, 6, 0, 0]} name="Promedio">
                {datosCursos.map((e, i) => <Cell key={i} fill={barColor(e.promedio)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart tendencia */}
        {tendencia.length >= 2 ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Tendencia por Período</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={tendencia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} />
                {cursosConDatos.map((c, i) => (
                  <Line key={c.id} type="monotone" dataKey={c.nombre}
                    stroke={COLORES[i % COLORES.length]} strokeWidth={2}
                    dot={{ r: 4 }} connectNulls name={c.nombre} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-center text-center">
            <div>
              <TrendingUp size={32} className="mx-auto mb-2 opacity-20 text-gray-400" />
              <p className="text-sm text-gray-400">La tendencia se mostrará cuando haya datos de al menos 2 períodos</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabla detalle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Detalle por Curso</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Curso", "Estudiantes", "Promedio", "% Aprobados", "% Reprobados", "Asistencia", "Estado"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {datosCursos.map(c => (
                <tr key={c.curso} className="hover:bg-gray-50/60 transition">
                  <td className="px-5 py-3.5 font-bold text-gray-800">{c.curso}</td>
                  <td className="px-5 py-3.5 text-gray-600">{c.total}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-black text-lg ${barColor(c.promedio) === "#10b981" ? "text-green-600" : barColor(c.promedio) === "#6366f1" ? "text-indigo-600" : barColor(c.promedio) === "#f59e0b" ? "text-yellow-600" : "text-red-600"}`}>
                      {c.promedio}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-green-600 font-semibold">{c.aprobados}%</td>
                  <td className="px-5 py-3.5 text-red-500 font-semibold">{c.reprobados}%</td>
                  <td className="px-5 py-3.5 text-gray-600">{c.asistencia > 0 ? `${c.asistencia}%` : "—"}</td>
                  <td className="px-5 py-3.5">
                    <Badge label={c.promedio >= 3.8 ? "Bien" : "Atención"} variant={c.promedio >= 3.8 ? "success" : "warning"} dot />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
