import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from "recharts";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import { Download, TrendingUp, TrendingDown, Users, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { notas, materias, cursos, periodos, asistencia, usuarios } from "../data/mockData";

export default function Reportes() {
  const { user } = useAuth();

  /* ── Promedio por materia — calculado desde notas reales ── */
  const promediosPorMateria = useMemo(() => {
    return materias.map(mat => {
      const notasMat = notas.filter(n => n.materiaId === mat.id);
      const promedio = notasMat.length
        ? parseFloat((notasMat.reduce((a, b) => a + b.promedio, 0) / notasMat.length).toFixed(1))
        : 0;
      return { materia: mat.nombre, promedio };
    }).filter(m => m.promedio > 0);
  }, []);

  /* ── Rendimiento por período — calculado desde notas reales ── */
  const rendimientoPorPeriodo = useMemo(() => {
    return periodos
      .filter(p => p.estado !== "pendiente")
      .map(p => {
        const notasPer = notas.filter(n => n.periodoId === p.id);
        const promedio = notasPer.length
          ? parseFloat((notasPer.reduce((a, b) => a + b.promedio, 0) / notasPer.length).toFixed(1))
          : 0;
        const aprobados = notasPer.length
          ? Math.round((notasPer.filter(n => n.promedio >= 3.0).length / notasPer.length) * 100)
          : 0;
        return { periodo: `P${p.id}`, promedio, aprobados };
      }).filter(p => p.promedio > 0);
  }, []);

  /* ── Estudiantes en riesgo — calculado desde notas reales ── */
  const estudiantesEnRiesgo = useMemo(() => {
    return usuarios
      .filter(u => u.rol === "ESTUDIANTE")
      .map(est => {
        const notasEst = notas.filter(n => n.estudianteId === est.id);
        if (!notasEst.length) return null;
        const promedio = parseFloat(
          (notasEst.reduce((a, b) => a + b.promedio, 0) / notasEst.length).toFixed(1)
        );
        if (promedio >= 3.5) return null;
        const peor = notasEst.reduce((a, b) => a.promedio < b.promedio ? a : b);
        const mat  = materias.find(m => m.id === peor.materiaId);
        const cur  = cursos.find(c => c.id === est.cursoId);
        return {
          nombre:    est.nombre,
          avatar:    est.avatar,
          curso:     cur?.nombre || "—",
          materia:   mat?.nombre || "—",
          promedio,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.promedio - b.promedio);
  }, []);

  /* ── Estadísticas globales ── */
  const promedioGeneral = notas.length
    ? (notas.reduce((a, b) => a + b.promedio, 0) / notas.length).toFixed(1)
    : "—";
  const pctAprobados = notas.length
    ? Math.round((notas.filter(n => n.promedio >= 3.0).length / notas.length) * 100)
    : 0;

  const resumen = [
    { label: "Promedio general",   value: promedioGeneral,            icon: TrendingUp,   color: "text-blue-600",  bg: "bg-blue-50"  },
    { label: "% Aprobados",        value: `${pctAprobados}%`,         icon: Users,        color: "text-green-600", bg: "bg-green-50" },
    { label: "Estudiantes en riesgo", value: estudiantesEnRiesgo.length, icon: TrendingDown, color: "text-red-600",   bg: "bg-red-50"   },
  ];

  const barColor = p => p >= 4.0 ? "#10b981" : p >= 3.5 ? "#3b82f6" : "#f59e0b";

  /* ── Exportar PDF ── */
  const exportarReportePDF = async () => {
    try {
      const contenidoHTML = `
        <div style="font-family:Arial,sans-serif;padding:20px;max-width:800px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:30px;">
            <h1 style="color:#1e40af;">Reporte Académico</h1>
            <h2 style="color:#6b7280;font-size:18px;">IE Rural El Progreso</h2>
            <p style="color:#6b7280;font-size:14px;">Período activo — 2025</p>
            <p style="color:#6b7280;font-size:12px;">Generado por: ${user.nombre} · ${new Date().toLocaleDateString("es-CO")}</p>
          </div>
          <h3 style="color:#374151;">Resumen General</h3>
          <p>Promedio general: <b>${promedioGeneral}</b> · Aprobados: <b>${pctAprobados}%</b> · En riesgo: <b>${estudiantesEnRiesgo.length}</b></p>
          <h3 style="color:#374151;margin-top:20px;">Promedio por Materia</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#f3f4f6;">
              <th style="border:1px solid #d1d5db;padding:8px;text-align:left;">Materia</th>
              <th style="border:1px solid #d1d5db;padding:8px;text-align:center;">Promedio</th>
            </tr></thead>
            <tbody>
              ${promediosPorMateria.map(m =>
                `<tr><td style="border:1px solid #d1d5db;padding:8px;">${m.materia}</td>
                <td style="border:1px solid #d1d5db;padding:8px;text-align:center;font-weight:bold;color:${barColor(m.promedio)};">${m.promedio}</td></tr>`
              ).join("")}
            </tbody>
          </table>
          ${estudiantesEnRiesgo.length ? `
          <h3 style="color:#374151;margin-top:20px;">Estudiantes en Riesgo</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#f3f4f6;">
              <th style="border:1px solid #d1d5db;padding:8px;text-align:left;">Estudiante</th>
              <th style="border:1px solid #d1d5db;padding:8px;text-align:center;">Curso</th>
              <th style="border:1px solid #d1d5db;padding:8px;text-align:center;">Materia crítica</th>
              <th style="border:1px solid #d1d5db;padding:8px;text-align:center;">Promedio</th>
            </tr></thead>
            <tbody>
              ${estudiantesEnRiesgo.map(e =>
                `<tr><td style="border:1px solid #d1d5db;padding:8px;">${e.nombre}</td>
                <td style="border:1px solid #d1d5db;padding:8px;text-align:center;">${e.curso}</td>
                <td style="border:1px solid #d1d5db;padding:8px;text-align:center;">${e.materia}</td>
                <td style="border:1px solid #d1d5db;padding:8px;text-align:center;color:#dc2626;font-weight:bold;">${e.promedio}</td></tr>`
              ).join("")}
            </tbody>
          </table>` : ""}
          <p style="margin-top:30px;color:#9ca3af;font-size:11px;text-align:center;">
            Generado el ${new Date().toLocaleDateString("es-CO")} · Sistema EduRural
          </p>
        </div>`;

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = contenidoHTML;
      tempDiv.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
      document.body.appendChild(tempDiv);
      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
      document.body.removeChild(tempDiv);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgW = 210;
      const imgH = (canvas.height * imgW) / canvas.width;
      let left = imgH; let pos = 0;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, pos, imgW, imgH);
      left -= 297;
      while (left >= 0) { pos = left - imgH; pdf.addPage(); pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, pos, imgW, imgH); left -= 297; }
      pdf.save(`Reporte_Academico_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Error PDF:", err);
      alert("Error al generar el PDF. Intenta nuevamente.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes Académicos"
        subtitle="Análisis calculado desde los datos reales del sistema"
        icon={BarChart3}
        color="#3b82f6"
        action={
          <button onClick={exportarReportePDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm shadow-blue-200">
            <Download size={15} /> Exportar PDF
          </button>
        }
      />

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {resumen.map(r => (
          <div key={r.label} className={`${r.bg} rounded-2xl p-4 flex items-center gap-4 border border-gray-100`}>
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <r.icon size={20} className={r.color} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${r.color}`}>{r.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Promedio por Materia</h3>
            <p className="text-xs text-gray-400 mt-0.5">{promediosPorMateria.length} materias con datos</p>
          </div>
          {promediosPorMateria.length === 0 ? (
            <p className="text-sm text-center text-gray-400 py-10">Sin datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={promediosPorMateria} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="materia" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} width={85} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="promedio" radius={[0, 6, 6, 0]} name="Promedio">
                  {promediosPorMateria.map((e, i) => <Cell key={i} fill={barColor(e.promedio)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Rendimiento por Período</h3>
            <p className="text-xs text-gray-400 mt-0.5">Promedio y % aprobados</p>
          </div>
          {rendimientoPorPeriodo.length < 1 ? (
            <p className="text-sm text-center text-gray-400 py-10">Sin períodos con datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={rendimientoPorPeriodo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="periodo" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  domain={[0, 5]}   tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
                <Line yAxisId="left"  type="monotone" dataKey="promedio"  stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} name="Promedio" />
                <Line yAxisId="right" type="monotone" dataKey="aprobados" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} name="% Aprobados" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabla riesgo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Estudiantes en Riesgo Académico</h3>
            <p className="text-xs text-gray-400 mt-0.5">Promedio menor a 3.5 — requieren atención</p>
          </div>
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-semibold">
            {estudiantesEnRiesgo.length} estudiante{estudiantesEnRiesgo.length !== 1 ? "s" : ""}
          </span>
        </div>
        {estudiantesEnRiesgo.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-green-400 opacity-50" />
            <p className="text-sm text-gray-500 font-medium">Sin estudiantes en riesgo</p>
            <p className="text-xs text-gray-400 mt-1">Todos los estudiantes tienen promedio ≥ 3.5</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Estudiante", "Curso", "Materia crítica", "Promedio", "Riesgo"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {estudiantesEnRiesgo.map((e, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600 flex-shrink-0">
                          {e.avatar}
                        </div>
                        <span className="font-semibold text-gray-800">{e.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{e.curso}</td>
                    <td className="px-5 py-3.5 text-gray-500">{e.materia}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-base font-black ${e.promedio < 3.0 ? "text-red-600" : "text-amber-600"}`}>
                        {e.promedio}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={e.promedio < 3.0 ? "Alto" : "Medio"} variant={e.promedio < 3.0 ? "danger" : "warning"} dot />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
