import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import { TrendingDown, BarChart3 } from "lucide-react";
import { materias, notas, usuarios } from "../../data/mockData";

export default function IndicadoresMateria() {

  const datosMaterias = useMemo(() => {
    return materias.map(mat => {
      /* Docente asignado */
      const docente = usuarios.find(u => u.id === mat.docenteId);

      /* Notas de esta materia */
      const notasMat = notas.filter(n => n.materiaId === mat.id);
      if (!notasMat.length) return null;

      const promedio = parseFloat(
        (notasMat.reduce((a, b) => a + b.promedio, 0) / notasMat.length).toFixed(1)
      );
      const aprobados   = Math.round((notasMat.filter(n => n.promedio >= 3.0).length / notasMat.length) * 100);
      const reprobados  = 100 - aprobados;
      const riesgo      = reprobados > 15 || promedio < 3.5;

      return {
        materia:    mat.nombre,
        codigo:     mat.codigo,
        promedio,
        aprobados,
        reprobados,
        riesgo,
        docente:    docente?.nombre || "Sin asignar",
        total:      notasMat.length,
      };
    }).filter(Boolean);
  }, []);

  if (datosMaterias.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="Indicadores por Materia" subtitle="Rendimiento por asignatura" icon={BarChart3} color="#6366f1" />
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-20 text-gray-400" />
          <p className="text-gray-500 font-medium">Sin datos suficientes para mostrar indicadores</p>
          <p className="text-xs text-gray-400 mt-1">Registra notas para ver el análisis por materia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Indicadores por Materia"
        subtitle="Rendimiento académico por asignatura · Datos en tiempo real"
        icon={BarChart3}
        color="#6366f1"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-2">
        {/* Promedio por materia */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Promedio por Materia</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosMaterias} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="materia" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} width={90} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="promedio" fill="#6366f1" radius={[0, 6, 6, 0]} name="Promedio" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* % Reprobados */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">% Reprobados por Materia</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosMaterias} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="materia" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} width={90} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="reprobados" fill="#ef4444" radius={[0, 6, 6, 0]} name="% Reprobados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla detalle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Detalle por Materia</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Materia", "Docente", "Promedio", "Aprobados", "Reprobados", "Estado"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {datosMaterias.map(m => (
                <tr key={m.materia} className="hover:bg-gray-50/60 transition">
                  <td className="px-5 py-3.5 font-semibold text-gray-800">
                    <div className="flex items-center gap-2">
                      {m.riesgo && <TrendingDown size={14} className="text-red-500 flex-shrink-0" />}
                      <div>
                        <p>{m.materia}</p>
                        <p className="text-xs text-gray-400 font-normal">{m.total} registro(s)</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{m.docente}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-black text-lg ${m.promedio >= 4.0 ? "text-green-600" : m.promedio >= 3.5 ? "text-blue-600" : m.promedio >= 3.0 ? "text-yellow-600" : "text-red-600"}`}>
                      {m.promedio}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-green-600 font-semibold hidden sm:table-cell">{m.aprobados}%</td>
                  <td className="px-5 py-3.5 text-red-500 font-semibold hidden sm:table-cell">{m.reprobados}%</td>
                  <td className="px-5 py-3.5">
                    <Badge label={m.riesgo ? "Alta pérdida" : "Normal"} variant={m.riesgo ? "danger" : "success"} dot />
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
