import { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Play, ChevronRight, ChevronLeft } from 'lucide-react';
import { cuestionarios, preguntas, respuestasCuestionario, respuestasPreguntas, resultadosCuestionario, materias, cursos } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const CuestionariosEstudiante = () => {
  const { user } = useAuth();
  const [cuestionariosDisponibles, setCuestionariosDisponibles] = useState([]);
  const [cuestionarioActivo, setCuestionarioActivo] = useState(null);
  const [preguntasCuestionario, setPreguntasCuestionario] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [cuestionarioIniciado, setCuestionarioIniciado] = useState(false);
  const [cuestionarioCompletado, setCuestionarioCompletado] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const estudianteCursos = cursos.filter(c => c.id === user.cursoId);
    const materiasCurso = materias.filter(m => estudianteCursos.some(c => c.id === m.cursoId));
    
    const disponibles = cuestionarios.filter(c => 
      materiasCurso.some(m => m.id === c.materiaId) &&
      c.estado === 'activo' &&
      new Date(c.fechaInicio) <= new Date() &&
      new Date(c.fechaFin) >= new Date()
    );
    
    setCuestionariosDisponibles(disponibles);
  }, [user]);

  const iniciarCuestionario = (cuestionario) => {
    const preguntasCuestionario = preguntas.filter(p => p.cuestionarioId === cuestionario.id);
    setPreguntasCuestionario(preguntasCuestionario.sort((a, b) => a.orden - b.orden));
    setCuestionarioActivo(cuestionario);
    setTiempoRestante(cuestionario.duracionMinutos * 60);
    setCuestionarioIniciado(true);
    setPreguntaActual(0);
    setRespuestas({});
    setCuestionarioCompletado(false);
    setMostrarResultados(false);
  };

  useEffect(() => {
    let intervalo;
    if (cuestionarioIniciado && tiempoRestante > 0 && !cuestionarioCompletado) {
      intervalo = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            enviarCuestionario();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [cuestionarioIniciado, tiempoRestante, cuestionarioCompletado]);

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRespuestaSeleccion = (preguntaId, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor,
    }));
  };

  const preguntaAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(prev => prev - 1);
    }
  };

  const siguientePregunta = () => {
    if (preguntaActual < preguntasCuestionario.length - 1) {
      setPreguntaActual(prev => prev + 1);
    }
  };

  const enviarCuestionario = () => {
    setCuestionarioCompletado(true);
    setCuestionarioIniciado(false);

    const puntajeTotal = preguntasCuestionario.reduce((total, pregunta) => {
      if (pregunta.tipo === 'seleccion_multiple') {
        const respuestaUsuario = respuestas[pregunta.id];
        const opcionCorrecta = pregunta.opciones.find(op => op.correcta);
        if (respuestaUsuario === opcionCorrecta?.id) {
          return total + pregunta.puntaje;
        }
      }
      return total;
    }, 0);

    const puntajeMaximo = preguntasCuestionario.reduce((total, pregunta) => total + pregunta.puntaje, 0);
    const porcentaje = Math.round((puntajeTotal / puntajeMaximo) * 100);

    const nuevoResultado = {
      puntajeTotal,
      puntajeMaximo,
      porcentaje,
      estado: porcentaje >= 60 ? 'aprobado' : 'reprobado',
    };

    setResultado(nuevoResultado);
    setMostrarResultados(true);
  };

  const verResultado = (cuestionarioId) => {
    const resultadoExistente = resultadosCuestionario.find(
      r => r.cuestionarioId === cuestionarioId && r.estudianteId === user.id
    );
    if (resultadoExistente) {
      setResultado(resultadoExistente);
      setMostrarResultados(true);
    }
  };

  const cerrarResultado = () => {
    setMostrarResultados(false);
    setResultado(null);
    setCuestionarioActivo(null);
  };

  const getEstadoBadge = (estado) => {
    if (estado === 'aprobado') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle size={16} />
          Aprobado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <AlertCircle size={16} />
        Reprobado
      </span>
    );
  };

  if (cuestionarioIniciado && cuestionarioActivo) {
    const pregunta = preguntasCuestionario[preguntaActual];
    const materia = materias.find(m => m.id === cuestionarioActivo.materiaId);
    const curso = cursos.find(c => c.id === cuestionarioActivo.cursoId);

    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{cuestionarioActivo.titulo}</h2>
                  <p className="text-blue-100 text-sm">{materia?.nombre} - {curso?.nombre}</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-lg">
                  <Clock size={20} />
                  <span className="text-2xl font-mono font-bold">{formatearTiempo(tiempoRestante)}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-blue-100 mb-1">
                  <span>Pregunta {preguntaActual + 1} de {preguntasCuestionario.length}</span>
                  <span>{Math.round(((preguntaActual + 1) / preguntasCuestionario.length) * 100)}% completado</span>
                </div>
                <div className="w-full bg-blue-700 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((preguntaActual + 1) / preguntasCuestionario.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {pregunta.tipo === 'seleccion_multiple' ? 'Selección Múltiple' : 'Pregunta Abierta'}
                  </span>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    {pregunta.puntaje} puntos
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">{pregunta.enunciado}</h3>

                {pregunta.tipo === 'seleccion_multiple' ? (
                  <div className="space-y-3">
                    {pregunta.opciones.map((opcion) => (
                      <label
                        key={opcion.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          respuestas[pregunta.id] === opcion.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`pregunta-${pregunta.id}`}
                          value={opcion.id}
                          checked={respuestas[pregunta.id] === opcion.id}
                          onChange={() => handleRespuestaSeleccion(pregunta.id, opcion.id)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="font-medium text-gray-700 text-lg">{opcion.id.toUpperCase()}.</span>
                        <span className="text-gray-900">{opcion.texto}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={respuestas[pregunta.id] || ''}
                    onChange={(e) => handleRespuestaSeleccion(pregunta.id, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="6"
                    placeholder="Escribe tu respuesta aquí..."
                  />
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={preguntaAnterior}
                  disabled={preguntaActual === 0}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                  Anterior
                </button>

                {preguntaActual === preguntasCuestionario.length - 1 ? (
                  <button
                    onClick={enviarCuestionario}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={20} />
                    Enviar Cuestionario
                  </button>
                ) : (
                  <button
                    onClick={siguientePregunta}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Siguiente
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mostrarResultados && resultado) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="mb-6">
              {resultado.estado === 'aprobado' || resultado.porcentaje >= 60 ? (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={48} className="text-green-600" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={48} className="text-red-600" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {resultado.porcentaje >= 60 ? '¡Felicitaciones!' : 'Sigue practicando'}
              </h2>
              <p className="text-gray-600">
                {resultado.porcentaje >= 60
                  ? 'Has completado el cuestionario exitosamente'
                  : 'Revisa los temas y vuelve a intentarlo'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Puntaje Obtenido</p>
                  <p className="text-3xl font-bold text-blue-600">{resultado.puntajeTotal}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Puntaje Máximo</p>
                  <p className="text-3xl font-bold text-gray-900">{resultado.puntajeMaximo}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Porcentaje</p>
                  <p className="text-3xl font-bold text-green-600">{resultado.porcentaje}%</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={cerrarResultado}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver a Cuestionarios
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cuestionarios Disponibles</h1>
        <p className="text-gray-600 mt-1">Responde a las evaluaciones asignadas a tu curso</p>
      </div>

      {cuestionariosDisponibles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay cuestionarios disponibles</h3>
          <p className="text-gray-600">No tienes cuestionarios pendientes en este momento</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cuestionariosDisponibles.map((cuestionario) => {
            const materia = materias.find(m => m.id === cuestionario.materiaId);
            const curso = cursos.find(c => c.id === cuestionario.cursoId);
            const numPreguntas = preguntas.filter(p => p.cuestionarioId === cuestionario.id).length;
            const resultadoExistente = resultadosCuestionario.find(
              r => r.cuestionarioId === cuestionario.id && r.estudianteId === user.id
            );

            return (
              <div key={cuestionario.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{cuestionario.titulo}</h3>
                      {resultadoExistente && getEstadoBadge(resultadoExistente.porcentaje >= 60 ? 'aprobado' : 'reprobado')}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{cuestionario.descripcion}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        {materia?.nombre}
                      </span>
                      <span className="flex items-center gap-1">
                        {curso?.nombre}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {cuestionario.duracionMinutos} min
                      </span>
                      <span className="flex items-center gap-1">
                        {numPreguntas} preguntas
                      </span>
                      <span className="flex items-center gap-1">
                        {cuestionario.puntajeTotal} pts
                      </span>
                      <span className="flex items-center gap-1">
                        {cuestionario.intentosMaximos} intento(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {resultadoExistente ? (
                      <button
                        onClick={() => verResultado(cuestionario.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Ver Resultado
                      </button>
                    ) : (
                      <button
                        onClick={() => iniciarCuestionario(cuestionario)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play size={18} />
                        Iniciar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CuestionariosEstudiante;
