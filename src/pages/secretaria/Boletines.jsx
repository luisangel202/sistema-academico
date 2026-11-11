import { useState } from "react";
import { FileText, Download, CheckCircle, Clock, AlertCircle, Eye, Edit3, Send, Users, Calendar, Filter, Building2, UserCheck, Shield, Star } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { usuarios, notas, materias, periodos, cursos } from "../../data/mockData";

export default function BoletinesSecretaria() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [boletines, setBoletines] = useState([]);
  const [periodosCerrados, setPeriodosCerrados] = useState([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtener períodos cerrados para elaboración de boletines
  useState(() => {
    const cerrados = periodos.filter(p => p.estado === "cerrado");
    setPeriodosCerrados(cerrados);
  });

  // Función para generar boletín para un estudiante
  const generarBoletin = (periodo, estudiante) => {
    const notasPeriodo = notas.filter(n => 
      n.estudianteId === estudiante.id && n.periodoId === periodo.id
    );
    
    if (notasPeriodo.length === 0) {
      alert(`El estudiante ${estudiante.nombre} no tiene notas registradas para el período ${periodo.nombre}`);
      return null;
    }

    const promedio = notasPeriodo.length > 0 
      ? (notasPeriodo.reduce((a, b) => a + b.promedio, 0) / notasPeriodo.length).toFixed(1)
      : "0.0";

    return {
      id: Date.now(),
      estudianteId: estudiante.id,
      periodoId: periodo.id,
      periodoNombre: periodo.nombre,
      estudianteNombre: estudiante.nombre,
      estudianteGrado: estudiante.grado,
      estudianteDocumento: estudiante.documento,
      notas: notasPeriodo,
      promedio: parseFloat(promedio),
      promedioNumerico: parseFloat(promedio),
      aprobado: parseFloat(promedio) >= 3.0,
      fechaGeneracion: new Date().toISOString(),
      generadoPor: user.nombre,
      estado: "borrador", // borrador -> coordinador -> direccion -> final
      selloInstitucional: "IE RURAL EL PROGRESO",
      numeroConsecutivo: `BOL-${new Date().getFullYear()}-${String(boletines.length + 1).padStart(4, '0')}`
    };
  };

  // Función para generar boletines masivos
  const generarBoletinesMasivos = () => {
    if (!selectedPeriodo) {
      alert("Por favor selecciona un período académico");
      return;
    }

    setLoading(true);
    const estudiantes = usuarios.filter(u => 
      u.rol === "ESTUDIANTE" && 
      u.activo === true && 
      u.institucionId === user.institucionId
    );

    const nuevosBoletines = [];
    let procesados = 0;

    estudiantes.forEach(estudiante => {
      const boletin = generarBoletin(selectedPeriodo, estudiante);
      if (boletin) {
        nuevosBoletines.push(boletin);
        procesados++;
      }
    });

    setBoletines([...boletines, ...nuevosBoletines]);
    setLoading(false);
    alert(`Se generaron ${procesados} boletines para el período ${selectedPeriodo.nombre}`);
    setShowModal(false);
  };

  // Función para enviar a coordinación
  const enviarACoordinacion = (boletin) => {
    const actualizado = { ...boletin, estado: "revision_coordinador", fechaRevisionCoordinador: new Date().toISOString() };
    setBoletines(boletines.map(b => b.id === boletin.id ? actualizado : b));
    alert(`Boletín de ${boletin.estudianteNombre} enviado a coordinación para revisión`);
  };

  // Función para aprobar como coordinador
  const aprobarComoCoordinador = (boletin) => {
    const actualizado = { 
      ...boletin, 
      estado: "aprobado_coordinador", 
      aprobadoPor: user.nombre,
      fechaAprobacionCoordinador: new Date().toISOString() 
    };
    setBoletines(boletines.map(b => b.id === boletin.id ? actualizado : b));
    alert(`Boletín aprobado por coordinación`);
  };

  // Función para enviar a dirección
  const enviarADireccion = (boletin) => {
    const actualizado = { ...boletin, estado: "revision_direccion", fechaRevisionDireccion: new Date().toISOString() };
    setBoletines(boletines.map(b => b.id === boletin.id ? actualizado : b));
    alert(`Boletín de ${boletin.estudianteNombre} enviado a dirección para aprobación final`);
  };

  // Función para aprobar final
  const aprobarFinal = (boletin) => {
    const actualizado = { 
      ...boletin, 
      estado: "aprobado_final", 
      aprobadoPorDireccion: user.nombre,
      fechaAprobacionFinal: new Date().toISOString() 
    };
    setBoletines(boletines.map(b => b.id === boletin.id ? actualizado : b));
    alert(`Boletín aprobado y listo para distribución`);
  };

  // Función para descargar PDF
  const descargarPDF = (boletin) => {
    // Aquí iría la lógica de generación de PDF con sellos y firmas
    alert(`Generando PDF para ${boletin.estudianteNombre}...`);
    // Implementación real con jsPDF y html2canvas
  };

  // Filtrar boletines
  const boletinesFiltrados = boletines.filter(boletin => {
    const estudiante = usuarios.find(u => u.id === boletin.estudianteId);
    const matchSearch = !search || 
      estudiante?.nombre.toLowerCase().includes(search.toLowerCase()) ||
      boletin.numeroConsecutivo.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filtroEstado || boletin.estado === filtroEstado;
    const matchPeriodo = !filtroPeriodo || boletin.periodoId === Number(filtroPeriodo);
    return matchSearch && matchEstado && matchPeriodo;
  });

  // Obtener información de estado
  const getEstadoInfo = (estado) => {
    const estados = {
      "borrador": { label: "Borrador", variant: "gray", icon: Edit3 },
      "revision_coordinador": { label: "Revisión Coordinador", variant: "warning", icon: Clock },
      "aprobado_coordinador": { label: "Aprobado Coordinador", variant: "success", icon: CheckCircle },
      "revision_direccion": { label: "Revisión Dirección", variant: "warning", icon: Clock },
      "aprobado_final": { label: "Aprobado Final", variant: "success", icon: CheckCircle },
      "distribuido": { label: "Distribuido", variant: "info", icon: Send }
    };
    return estados[estado] || { label: estado, variant: "gray", icon: FileText };
  };

  return (
    <div>
      <PageHeader 
        title="Gestión de Boletines" 
        subtitle="Elaboración y control de boletines académicos"
        action={
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer"
          >
            <FileText size={16} /> Generar Boletines
          </button>
        }
      />

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar estudiante o consecutivo..."
              className="w-full pl-4 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
            />
          </div>
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
          >
            <option value="">Todos los períodos</option>
            {periodosCerrados.map(periodo => (
              <option key={periodo.id} value={periodo.id}>{periodo.nombre}</option>
            ))}
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="revision_coordinador">Revisión Coordinador</option>
            <option value="aprobado_coordinador">Aprobado Coordinador</option>
            <option value="revision_direccion">Revisión Dirección</option>
            <option value="aprobado_final">Aprobado Final</option>
            <option value="distribuido">Distribuido</option>
          </select>
          <div className="flex items-center text-sm text-gray-500">
            <FileText size={14} className="mr-2" />
            {boletinesFiltrados.length} boletín(es)
          </div>
        </div>
      </div>

      {/* Lista de Boletines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Consecutivo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estudiante</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Grado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Período</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Promedio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {boletinesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    <div className="flex flex-col items-center">
                      <FileText size={24} className="mb-2 opacity-30" />
                      <p className="text-sm">No hay boletines registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                boletinesFiltrados.map((boletin) => {
                  const estadoInfo = getEstadoInfo(boletin.estado);
                  const EstadoIcon = estadoInfo.icon;
                  
                  return (
                    <tr key={boletin.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {boletin.numeroConsecutivo}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{boletin.estudianteNombre}</p>
                          <p className="text-xs text-gray-500">{boletin.estudianteDocumento}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{boletin.estudianteGrado}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{boletin.periodoNombre}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${boletin.aprobado ? 'text-green-600' : 'text-red-600'}`}>
                          {boletin.promedio}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={estadoInfo.label} variant={estadoInfo.variant} icon={EstadoIcon} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setPreviewData(boletin);
                              setShowPreviewModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border-0 cursor-pointer"
                            title="Vista previa"
                          >
                            <Eye size={14} />
                          </button>
                          
                          {boletin.estado === "borrador" && user.rol === "SECRETARIA" && (
                            <button
                              onClick={() => enviarACoordinacion(boletin)}
                              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg border-0 cursor-pointer"
                              title="Enviar a coordinación"
                            >
                              <Send size={14} />
                            </button>
                          )}
                          
                          {boletin.estado === "revision_coordinador" && user.rol === "COORDINADOR" && (
                            <button
                              onClick={() => aprobarComoCoordinador(boletin)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border-0 cursor-pointer"
                              title="Aprobar"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          
                          {boletin.estado === "aprobado_coordinador" && user.rol === "SECRETARIA" && (
                            <button
                              onClick={() => enviarADireccion(boletin)}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg border-0 cursor-pointer"
                              title="Enviar a dirección"
                            >
                              <Send size={14} />
                            </button>
                          )}
                          
                          {boletin.estado === "revision_direccion" && user.rol === "ADMIN_INSTITUCIONAL" && (
                            <button
                              onClick={() => aprobarFinal(boletin)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border-0 cursor-pointer"
                              title="Aprobar final"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          
                          {(boletin.estado === "aprobado_final" || boletin.estado === "distribuido") && (
                            <button
                              onClick={() => descargarPDF(boletin)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border-0 cursor-pointer"
                              title="Descargar PDF"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para generar boletines */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Generar Boletines Masivos">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período Académico *</label>
            <select
              value={selectedPeriodo?.id || ""}
              onChange={(e) => setSelectedPeriodo(periodosCerrados.find(p => p.id === Number(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              required
            >
              <option value="">Seleccionar período...</option>
              {periodosCerrados.map(periodo => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre} ({periodo.inicio} - {periodo.fin})
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <strong>Información:</strong> Se generarán boletines para todos los estudiantes activos 
                matriculados en el período seleccionado. Cada boletín incluirá todas las notas registradas 
                y pasará por el proceso de aprobación correspondiente.
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white"
            >
              Cancelar
            </button>
            <button
              onClick={generarBoletinesMasivos}
              disabled={!selectedPeriodo || loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition border-0 cursor-pointer"
            >
              {loading ? "Generando..." : "Generar Boletines"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de vista previa */}
      <Modal open={showPreviewModal} onClose={() => setShowPreviewModal(false)} title={`Vista Previa - ${previewData?.estudianteNombre}`} size="large">
        {previewData && (
          <div className="space-y-4">
            {/* Encabezado del boletín */}
            <div className="text-center border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">BOLETÍN ACADÉMICO</h2>
              <p className="text-sm text-gray-600">{previewData.selloInstitucional}</p>
              <p className="text-sm text-gray-600">{previewData.periodoNombre}</p>
            </div>
            
            {/* Información del estudiante */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Estudiante:</p>
                <p className="text-sm text-gray-800">{previewData.estudianteNombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Documento:</p>
                <p className="text-sm text-gray-800">{previewData.estudianteDocumento}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Grado:</p>
                <p className="text-sm text-gray-800">{previewData.estudianteGrado}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Consecutivo:</p>
                <p className="text-sm text-gray-800">{previewData.numeroConsecutivo}</p>
              </div>
            </div>
            
            {/* Tabla de notas */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 text-left">Materia</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">N1</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">N2</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">N3</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">Promedio</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.notas.map((nota) => {
                    const materia = materias.find(m => m.id === nota.materiaId);
                    return (
                      <tr key={nota.id}>
                        <td className="border border-gray-200 px-3 py-2">{materia?.nombre}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">{nota.nota1}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">{nota.nota2}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">{nota.nota3}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center font-bold">
                          <span className={nota.promedio >= 3.0 ? 'text-green-600' : 'text-red-600'}>
                            {nota.promedio}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            nota.promedio >= 3.0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {nota.promedio >= 3.0 ? 'APROBADO' : 'REPROBADO'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Resumen */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Promedio del Período:</p>
                  <p className={`text-lg font-bold ${previewData.aprobado ? 'text-green-600' : 'text-red-600'}`}>
                    {previewData.promedio}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Estado General:</p>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    previewData.aprobado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {previewData.aprobado ? 'APROBADO' : 'REPROBADO'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Información de proceso */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <p>Generado por: {previewData.generadoPor}</p>
                  <p>Fecha: {new Date(previewData.fechaGeneracion).toLocaleDateString('es-CO')}</p>
                </div>
                <div>
                  <p>Estado actual: {getEstadoInfo(previewData.estado).label}</p>
                  <p>Número consecutivo: {previewData.numeroConsecutivo}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
