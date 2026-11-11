import { CheckCircle, XCircle, Clock, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import { useAuth } from "../../context/AuthContext";
import { asistencia, materias } from "../../data/mockData";

export default function MiAsistencia() {
  const { user } = useAuth();
  
  // Obtener todas las asistencias del estudiante
  const miAsistencia = asistencia.filter((a) => a.estudianteId === user.id);
  
  // Estadísticas de asistencia
  const totalClases = miAsistencia.length;
  const presentes = miAsistencia.filter((a) => a.estado === "presente").length;
  const ausentes = miAsistencia.filter((a) => a.estado === "ausente").length;
  const tardanzas = miAsistencia.filter((a) => a.estado === "tardanza").length;
  
  const porcentajeAsistencia = totalClases > 0 
    ? ((presentes / totalClases) * 100).toFixed(1)
    : "0";

  // Agrupar asistencia por materia
  const asistenciaPorMateria = materias.map((materia) => {
    const asistenciasMateria = miAsistencia.filter((a) => a.materiaId === materia.id);
    const presentesMateria = asistenciasMateria.filter((a) => a.estado === "presente").length;
    const porcentajeMateria = asistenciasMateria.length > 0
      ? ((presentesMateria / asistenciasMateria.length) * 100).toFixed(1)
      : "0";
    
    return {
      ...materia,
      totalClases: asistenciasMateria.length,
      presentes: presentesMateria,
      ausentes: asistenciasMateria.filter((a) => a.estado === "ausente").length,
      tardanzas: asistenciasMateria.filter((a) => a.estado === "tardanza").length,
      porcentaje: parseFloat(porcentajeMateria),
    };
  }).filter((m) => m.totalClases > 0);

  // Últimos 10 registros
  const registrosRecientes = miAsistencia
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 10);

  // Estado de asistencia general
  const getEstadoAsistencia = (porcentaje) => {
    if (porcentaje >= 95) return { label: "Excelente", variant: "success", color: "text-green-600" };
    if (porcentaje >= 90) return { label: "Muy Buena", variant: "success", color: "text-green-500" };
    if (porcentaje >= 85) return { label: "Buena", variant: "warning", color: "text-yellow-600" };
    if (porcentaje >= 80) return { label: "Regular", variant: "warning", color: "text-orange-600" };
    return { label: "Crítica", variant: "danger", color: "text-red-600" };
  };

  const estadoGeneral = getEstadoAsistencia(parseFloat(porcentajeAsistencia));

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "presente": return <CheckCircle size={16} className="text-green-500" />;
      case "ausente": return <XCircle size={16} className="text-red-500" />;
      case "tardanza": return <Clock size={16} className="text-orange-500" />;
      default: return null;
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "presente": return { label: "Presente", variant: "success" };
      case "ausente": return { label: "Ausente", variant: "danger" };
      case "tardanza": return { label: "Tardanza", variant: "warning" };
      default: return { label: "Desconocido", variant: "gray" };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Asistencia"
        subtitle={`Registro de asistencia de ${user.nombre} · ${user.grado}`}
        icon={CheckCircle}
        color="#10b981"
      />

      {/* Tarjetas de estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Clases</p>
              <p className="text-lg font-bold text-gray-800">{totalClases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Presentes</p>
              <p className="text-lg font-bold text-green-600">{presentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Ausentes</p>
              <p className="text-lg font-bold text-red-600">{ausentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tardanzas</p>
              <p className="text-lg font-bold text-orange-600">{tardanzas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">% Asistencia</p>
              <p className={`text-lg font-bold ${estadoGeneral.color}`}>
                {porcentajeAsistencia}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta si la asistencia es baja */}
      {parseFloat(porcentajeAsistencia) < 85 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Tu asistencia es {estadoGeneral.label.toLowerCase()}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Se recomienda mantener una asistencia mínima del 85% para un buen rendimiento académico.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asistencia por materia */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Asistencia por Materia</h3>
            <p className="text-xs text-gray-500 mt-1">Desglose de tu asistencia por asignatura</p>
          </div>
          <div className="p-6 space-y-4">
            {asistenciaPorMateria.map((materia) => {
              const estadoMateria = getEstadoAsistencia(materia.porcentaje);
              return (
                <div key={materia.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-800">{materia.nombre}</p>
                      <Badge 
                        label={estadoMateria.label} 
                        variant={estadoMateria.variant} 
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{materia.presentes} presentes</span>
                      <span>{materia.ausentes} ausentes</span>
                      <span>{materia.tardanzas} tardanzas</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${estadoMateria.color}`}>
                      {materia.porcentaje.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">de {materia.totalClases} clases</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registros recientes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Registros Recientes</h3>
            <p className="text-xs text-gray-500 mt-1">Últimos 10 registros de asistencia</p>
          </div>
          <div className="p-6">
            {registrosRecientes.length > 0 ? (
              <div className="space-y-3">
                {registrosRecientes.map((registro) => {
                  const materia = materias.find((m) => m.id === registro.materiaId);
                  const badge = getEstadoBadge(registro.estado);
                  return (
                    <div key={registro.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        {getEstadoIcon(registro.estado)}
                        <div>
                          <p className="font-medium text-gray-800">{materia?.nombre}</p>
                          <p className="text-xs text-gray-500">{registro.fecha}</p>
                        </div>
                      </div>
                      <Badge 
                        label={badge.label} 
                        variant={badge.variant} 
                        size="sm"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={24} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No hay registros de asistencia</p>
                <p className="text-xs text-gray-400 mt-1">Los registros aparecerán aquí cuando se registren</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensaje si no hay datos */}
      {miAsistencia.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay registros de asistencia</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Tu registro de asistencia aparecerá aquí tan pronto como los docentes comiencen a tomar asistencia en tus clases.
          </p>
        </div>
      )}
    </div>
  );
}
