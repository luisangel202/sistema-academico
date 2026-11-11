import { Star, TrendingUp, TrendingDown, BookOpen, Calendar } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import { useAuth } from "../../context/AuthContext";
import { notas, materias, periodos } from "../../data/mockData";

export default function MisNotas() {
  const { user } = useAuth();
  
  // Obtener todas las notas del estudiante
  const misNotas = notas.filter((n) => n.estudianteId === user.id);
  
  // Agrupar notas por período
  const notasPorPeriodo = periodos.map((periodo) => {
    const notasPeriodo = misNotas.filter((n) => n.periodoId === periodo.id);
    const promedio = notasPeriodo.length > 0
      ? (notasPeriodo.reduce((a, b) => a + b.promedio, 0) / notasPeriodo.length).toFixed(1)
      : null;
    
    return {
      ...periodo,
      notas: notasPeriodo,
      promedio: promedio ? parseFloat(promedio) : null,
    };
  }).filter((p) => p.notas.length > 0);

  // Estadísticas generales
  const promedioGeneral = misNotas.length > 0
    ? (misNotas.reduce((a, b) => a + b.promedio, 0) / misNotas.length).toFixed(1)
    : "—";

  const mejorMateria = misNotas.length > 0
    ? misNotas.reduce((max, nota) => nota.promedio > max.promedio ? nota : max)
    : null;

  const materiaMasBaja = misNotas.length > 0
    ? misNotas.reduce((min, nota) => nota.promedio < min.promedio ? nota : min)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Notas"
        subtitle={`Registro académico de ${user.nombre} · ${user.grado}`}
        icon={Star}
        color="#f59e0b"
      />

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <Star className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Promedio General</p>
              <p className="text-2xl font-black text-gray-800">{promedioGeneral}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Mejor Materia</p>
              <p className="text-sm font-bold text-gray-800">
                {mejorMateria ? materias.find(m => m.id === mejorMateria.materiaId)?.nombre : "—"}
              </p>
              <p className="text-xs text-green-600 font-semibold">
                {mejorMateria ? `${mejorMateria.promedio.toFixed(1)}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">A Mejorar</p>
              <p className="text-sm font-bold text-gray-800">
                {materiaMasBaja ? materias.find(m => m.id === materiaMasBaja.materiaId)?.nombre : "—"}
              </p>
              <p className="text-xs text-orange-600 font-semibold">
                {materiaMasBaja ? `${materiaMasBaja.promedio.toFixed(1)}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <BookOpen className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Materias</p>
              <p className="text-2xl font-black text-gray-800">{misNotas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notas por período */}
      <div className="space-y-6">
        {notasPorPeriodo.map((periodo) => (
          <div key={periodo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header del período */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{periodo.nombre}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <Calendar size={12} className="inline mr-1" />
                    {periodo.inicio} → {periodo.fin}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={periodo.estado} variant={periodo.estado} dot />
                  {periodo.promedio && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Promedio</p>
                      <p className={`text-lg font-bold ${periodo.promedio >= 3.0 ? 'text-green-600' : 'text-red-500'}`}>
                        {periodo.promedio.toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de notas */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-gray-600 font-semibold text-sm">Materia</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold text-sm">Nota 1</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold text-sm">Nota 2</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold text-sm">Nota 3</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold text-sm">Promedio</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold text-sm">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {periodo.notas.map((nota) => {
                    const materia = materias.find((m) => m.id === nota.materiaId);
                    const aprobado = nota.promedio >= 3.0;
                    
                    return (
                      <tr key={nota.id} className="hover:bg-gray-50/80 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{materia?.nombre}</p>
                            <p className="text-xs text-gray-500">{materia?.codigo}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-700 font-medium">{nota.nota1}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-700 font-medium">{nota.nota2}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-700 font-medium">{nota.nota3}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-sm font-bold ${aprobado ? 'text-green-600' : 'text-red-500'}`}>
                            {nota.promedio}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge 
                            label={aprobado ? 'Aprobado' : 'Reprobado'} 
                            variant={aprobado ? 'success' : 'danger'} 
                            size="sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Resumen del período */}
            {periodo.promedio && (
              <div className={`px-6 py-4 border-t border-gray-100 ${
                periodo.promedio >= 3.0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {periodo.promedio >= 3.0 ? (
                      <TrendingUp size={18} className="text-green-600" />
                    ) : (
                      <TrendingDown size={18} className="text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      Rendimiento del período
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${
                      periodo.promedio >= 3.0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {periodo.promedio.toFixed(1)}
                    </span>
                    <Badge 
                      label={periodo.promedio >= 3.0 ? 'Aprobado' : 'Reprobado'} 
                      variant={periodo.promedio >= 3.0 ? 'success' : 'danger'} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mensaje si no hay notas */}
      {misNotas.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay notas registradas</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Tus notas aparecerán aquí tan pronto como los docentes las publiquen.
          </p>
        </div>
      )}
    </div>
  );
}
