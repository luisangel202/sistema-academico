import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, Download, TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cuestionarios, preguntas, respuestasCuestionario, respuestasPreguntas, resultadosCuestionario, usuarios, cursos, materias } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const ResultadosCuestionarios = () => {
  const { user } = useAuth();
  const [selectedCuestionario, setSelectedCuestionario] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);

  const cuestionariosDocente = cuestionarios.filter(c => c.docenteId === user.id);

  const getEstadisticasCuestionario = (cuestionarioId) => {
    const resultados = resultadosCuestionario.filter(r => r.cuestionarioId === cuestionarioId);
    const respuestas = respuestasCuestionario.filter(r => r.cuestionarioId === cuestionarioId);
    
    const totalEstudiantes = usuarios.filter(u => u.rol === 'ESTUDIANTE' && u.cursoId === cuestionarios.find(c => c.id === cuestionarioId)?.cursoId).length;
    const completados = resultados.length;
    const pendientes = totalEstudiantes - completados;
    
    const aprobados = resultados.filter(r => r.porcentaje >= 60).length;
    const reprobados = resultados.filter(r => r.porcentaje < 60).length;
    
    const promedioGeneral = resultados.length > 0
      ? resultados.reduce((sum, r) => sum + r.porcentaje, 0) / resultados.length
      : 0;

    return {
      totalEstudiantes,
      completados,
      pendientes,
      aprobados,
      reprobados,
      promedioGeneral: Math.round(promedioGeneral),
    };
  };

  const getRespuestasEstudiante = (cuestionarioId, estudianteId) => {
    const respuestaCuestionario = respuestasCuestionario.find(
      r => r.cuestionarioId === cuestionarioId && r.estudianteId === estudianteId
    );
    
    if (!respuestaCuestionario) return null;

    const respuestas = respuestasPreguntas.filter(
      r => r.respuestaCuestionarioId === respuestaCuestionario.id
    );

    return {
      respuestaCuestionario,
      respuestas,
    };
  };

  const handleVerDetalle = (cuestionario) => {
    setSelectedCuestionario(cuestionario);
    setShowDetalleModal(true);
  };

  const handleVerRespuestaEstudiante = (estudiante) => {
    setSelectedEstudiante(estudiante);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (showDetalleModal && selectedCuestionario) {
    const estadisticas = getEstadisticasCuestionario(selectedCuestionario.id);
    const resultados = resultadosCuestionario.filter(r => r.cuestionarioId === selectedCuestionario.id);
    const preguntasCuestionario = preguntas.filter(p => p.cuestionarioId === selectedCuestionario.id);
    const curso = cursos.find(c => c.id === selectedCuestionario.cursoId);
    const materia = materias.find(m => m.id === selectedCuestionario.materiaId);

    const dataGraficoBarras = resultados.map(r => {
      const estudiante = usuarios.find(u => u.id === r.estudianteId);
      return {
        nombre: estudiante?.nombre?.split(' ')[0] || 'Estudiante',
        puntaje: r.porcentaje,
      };
    });

    const dataGraficoPastel = [
      { name: 'Aprobados', value: estadisticas.aprobados },
      { name: 'Reprobados', value: estadisticas.reprobados },
      { name: 'Pendientes', value: estadisticas.pendientes },
    ];

    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => {
              setShowDetalleModal(false);
              setSelectedCuestionario(null);
              setSelectedEstudiante(null);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Volver a Cuestionarios
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{selectedCuestionario.titulo}</h1>
          <p className="text-gray-600 mt-1">{materia?.nombre} - {curso?.nombre}</p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Users size={16} />
              Total Estudiantes
            </div>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.totalEstudiantes}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <CheckCircle size={16} />
              Completados
            </div>
            <p className="text-2xl font-bold text-green-600">{estadisticas.completados}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <TrendingUp size={16} />
              Promedio
            </div>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.promedioGeneral}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Clock size={16} />
              Pendientes
            </div>
            <p className="text-2xl font-bold text-orange-600">{estadisticas.pendientes}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Puntajes por Estudiante</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataGraficoBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="puntaje" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Distribución de Resultados</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dataGraficoPastel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataGraficoPastel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Resultados por Estudiante</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estudiante</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Puntaje</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Porcentaje</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resultados.map((resultado) => {
                const estudiante = usuarios.find(u => u.id === resultado.estudianteId);
                return (
                  <tr key={resultado.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                          {estudiante?.avatar || 'E'}
                        </div>
                        <span className="font-medium text-gray-900">{estudiante?.nombre || 'Estudiante'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{resultado.puntajeTotal}/{resultado.puntajeMaximo}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${resultado.porcentaje >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                        {resultado.porcentaje}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {resultado.porcentaje >= 60 ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle size={14} />
                          Aprobado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                          <XCircle size={14} />
                          Reprobado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {new Date(resultado.fechaCalificacion).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleVerRespuestaEstudiante(estudiante)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver respuestas detalladas"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {estadisticas.pendientes > 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-center text-gray-500 text-sm">
                    {estadisticas.pendientes} estudiante(s) pendiente(s) de completar el cuestionario
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal detalle estudiante */}
        {selectedEstudiante && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Respuestas de {selectedEstudiante.nombre}</h2>
                    <p className="text-gray-600 text-sm">{selectedCuestionario.titulo}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEstudiante(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {(() => {
                  const datosRespuesta = getRespuestasEstudiante(selectedCuestionario.id, selectedEstudiante.id);
                  if (!datosRespuesta) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>El estudiante aún no ha completado el cuestionario</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {preguntasCuestionario
                        .sort((a, b) => a.orden - b.orden)
                        .map((pregunta) => {
                          const respuestaPregunta = datosRespuesta.respuestas.find(
                            r => r.preguntaId === pregunta.id
                          );

                          return (
                            <div key={pregunta.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                  Pregunta {pregunta.orden}
                                </span>
                                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                                  {pregunta.tipo === 'seleccion_multiple' ? 'Selección Múltiple' : 'Abierta'}
                                </span>
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                  {pregunta.puntaje} pts
                                </span>
                                {respuestaPregunta && (
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    respuestaPregunta.correcta === true
                                      ? 'bg-green-100 text-green-800'
                                      : respuestaPregunta.correcta === false
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {respuestaPregunta.correcta === true
                                      ? `+${respuestaPregunta.puntajeObtenido} pts`
                                      : respuestaPregunta.correcta === false
                                      ? 'Incorrecto'
                                      : `${respuestaPregunta.puntajeObtenido}/${pregunta.puntaje} pts`}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-900 font-medium mb-3">{pregunta.enunciado}</p>

                              {pregunta.tipo === 'seleccion_multiple' ? (
                                <div className="space-y-2">
                                  {pregunta.opciones.map((opcion) => {
                                    const esRespuestaUsuario = respuestaPregunta?.respuesta === opcion.id;
                                    const esCorrecta = opcion.correcta;
                                    
                                    return (
                                      <div
                                        key={opcion.id}
                                        className={`p-2 rounded text-sm ${
                                          esRespuestaUsuario && esCorrecta
                                            ? 'bg-green-100 text-green-800 border border-green-300'
                                            : esRespuestaUsuario && !esCorrecta
                                            ? 'bg-red-100 text-red-800 border border-red-300'
                                            : esCorrecta
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-gray-50 text-gray-600'
                                        }`}
                                      >
                                        <span className="font-medium">{opcion.id.toUpperCase()}.</span> {opcion.texto}
                                        {esRespuestaUsuario && ' ← Tu respuesta'}
                                        {esCorrecta && ' ✓ Correcta'}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="bg-white p-3 rounded border border-gray-200">
                                  <p className="text-gray-900 text-sm">{respuestaPregunta?.respuesta || 'Sin respuesta'}</p>
                                  {respuestaPregunta?.observacion && (
                                    <p className="text-yellow-700 text-sm mt-2 italic">
                                      Observación: {respuestaPregunta.observacion}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resultados de Cuestionarios</h1>
        <p className="text-gray-600 mt-1">Consulta los resultados de los cuestionarios creados</p>
      </div>

      <div className="grid gap-4">
        {cuestionariosDocente.map((cuestionario) => {
          const estadisticas = getEstadisticasCuestionario(cuestionario.id);
          const materia = materias.find(m => m.id === cuestionario.materiaId);
          const curso = cursos.find(c => c.id === cuestionario.cursoId);
          const numPreguntas = preguntas.filter(p => p.cuestionarioId === cuestionario.id).length;

          return (
            <div key={cuestionario.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{cuestionario.titulo}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {cuestionario.estado}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{cuestionario.descripcion}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      {materia?.nombre}
                    </span>
                    <span className="flex items-center gap-1">
                      {curso?.nombre}
                    </span>
                    <span className="flex items-center gap-1">
                      {numPreguntas} preguntas
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-gray-600 text-xs">Completados</p>
                      <p className="text-xl font-bold text-green-600">{estadisticas.completados}/{estadisticas.totalEstudiantes}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Aprobados</p>
                      <p className="text-xl font-bold text-blue-600">{estadisticas.aprobados}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Promedio</p>
                      <p className="text-xl font-bold text-gray-900">{estadisticas.promedioGeneral}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Pendientes</p>
                      <p className="text-xl font-bold text-orange-600">{estadisticas.pendientes}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerDetalle(cuestionario)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye size={18} />
                    Ver Resultados
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultadosCuestionarios;
