import { useState, useMemo, useRef } from "react";
import {
  FileText, CheckCircle, AlertCircle, ChevronDown,
  ChevronRight, Clock, XCircle, Upload, Eye, Paperclip,
  Ban, RotateCcw, Download, Trash2
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/Toggle";
import Modal from "../../components/Modal";
import { usuarios, documentosRequeridosPorRol, documentosUsuarios } from "../../data/mockData";
import { ROLE_LABELS } from "../../data/permissions";

const ESTADO_CONFIG = {
  entregado: { label: "Entregado", variant: "success", icon: CheckCircle, color: "text-green-600" },
  pendiente: { label: "Pendiente", variant: "warning", icon: Clock, color: "text-yellow-600" },
  vencido:   { label: "Vencido",   variant: "danger",  icon: XCircle,       color: "text-red-600"    },
};

const CATEGORIA_COLOR = {
  Personal:         "bg-blue-100 text-blue-700",
  Académico:        "bg-purple-100 text-purple-700",
  Profesional:      "bg-indigo-100 text-indigo-700",
  Legal:            "bg-red-100 text-red-700",
  Vinculación:      "bg-orange-100 text-orange-700",
  "Seguridad Social": "bg-teal-100 text-teal-700",
  Salud:            "bg-green-100 text-green-700",
  Socioeconómico:   "bg-gray-100 text-gray-600",
};

// Roles que tienen documentos definidos
const ROLES_CON_DOCS = Object.keys(documentosRequeridosPorRol);

// Simula nombres de archivo cargados: { "usuarioId_docId": { nombre, tamaño, fecha } }
const archivosIniciales = {
  "9_est_01": { nombre: "registro_civil_juan.pdf", tamaño: "0.8 MB", fecha: "2025-01-15" },
  "5_doc_04": { nombre: "titulo_pregrado_luis.pdf", tamaño: "1.2 MB", fecha: "2025-01-10" },
  "5_doc_09": { nombre: "antecedentes_judiciales_luis.pdf", tamaño: "0.5 MB", fecha: "2025-01-10" },
};

export default function Documentos() {
  const [docs, setDocs] = useState(documentosUsuarios);
  // archivos[key] = { nombre, tamaño, fecha }  donde key = "usuarioId_docId"
  const [archivos, setArchivos] = useState(archivosIniciales);
  // exentos[key] = true  donde key = "usuarioId_docId"
  const [exentos, setExentos] = useState({});
  const [search, setSearch] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [expandidos, setExpandidos] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState(null); // { usuarioId, docId, docNombre }
  const [uploadFile, setUploadFile] = useState(null);
  const [form, setForm] = useState({ usuarioId: "", docId: "", observacion: "" });
  const fileInputRef = useRef(null);

  // Usuarios que tienen documentos definidos para su rol
  const usuariosConDocs = useMemo(() =>
    usuarios.filter((u) => ROLES_CON_DOCS.includes(u.rol) && u.institucionId === 1),
    []
  );

  // Filtrar usuarios según búsqueda y rol
  const usuariosFiltrados = useMemo(() => {
    return usuariosConDocs.filter((u) => {
      const matchSearch = !search ||
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.documento.includes(search);
      const matchRol = filtroRol ? u.rol === filtroRol : true;
      return matchSearch && matchRol;
    });
  }, [usuariosConDocs, search, filtroRol]);

  // Para un usuario, obtener el estado de cada documento requerido
  const getDocumentosUsuario = (usuario) => {
    const requeridos = documentosRequeridosPorRol[usuario.rol] || [];
    return requeridos
      .filter((req) => {
        const key = `${usuario.id}_${req.id}`;
        const reg = docs.find((d) => d.usuarioId === usuario.id && d.docId === req.id);
        const esExento = exentos[key];
        const estadoReal = esExento ? "exento" : (reg?.estado || "pendiente");
        const matchEstado = filtroEstado ? estadoReal === filtroEstado : true;
        const matchCat = filtroCategoria ? req.categoria === filtroCategoria : true;
        return matchEstado && matchCat;
      })
      .map((req) => {
        const key = `${usuario.id}_${req.id}`;
        const registro = docs.find((d) => d.usuarioId === usuario.id && d.docId === req.id);
        const esExento = exentos[key] || false;
        const archivo = archivos[key] || null;
        return {
          ...req,
          estado: esExento ? "exento" : (registro?.estado || "pendiente"),
          fecha: registro?.fecha || null,
          observacion: registro?.observacion || "",
          registroId: registro?.id || null,
          esExento,
          archivo,
          key,
        };
      });
  };

  // Estadísticas globales
  const stats = useMemo(() => {
    let total = 0, entregados = 0, pendientes = 0, vencidos = 0, exentosCount = 0;
    usuariosConDocs.forEach((u) => {
      const reqs = documentosRequeridosPorRol[u.rol] || [];
      reqs.forEach((req) => {
        const key = `${u.id}_${req.id}`;
        if (exentos[key]) { exentosCount++; return; }
        total++;
        const reg = docs.find((d) => d.usuarioId === u.id && d.docId === req.id);
        const estado = reg?.estado || "pendiente";
        if (estado === "entregado") entregados++;
        else if (estado === "vencido") vencidos++;
        else pendientes++;
      });
    });
    return { total, entregados, pendientes, vencidos, exentosCount };
  }, [docs, usuariosConDocs, exentos]);

  const toggleExpandido = (id) =>
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));

  const marcarEstado = (usuarioId, docId, nuevoEstado) => {
    setDocs((prev) => {
      const existe = prev.find((d) => d.usuarioId === usuarioId && d.docId === docId);
      if (existe) {
        return prev.map((d) =>
          d.usuarioId === usuarioId && d.docId === docId
            ? { ...d, estado: nuevoEstado, fecha: nuevoEstado === "entregado" ? new Date().toISOString().split("T")[0] : d.fecha }
            : d
        );
      }
      return [...prev, {
        id: Date.now(), usuarioId, docId, estado: nuevoEstado,
        fecha: nuevoEstado === "entregado" ? new Date().toISOString().split("T")[0] : null,
        observacion: "",
      }];
    });
  };

  // Alternar exención de un documento para un usuario
  const toggleExento = (key) => {
    setExentos((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Abrir modal de carga de archivo
  const abrirUpload = (usuarioId, docId, docNombre) => {
    setUploadTarget({ usuarioId, docId, docNombre });
    setUploadFile(null);
    setShowUploadModal(true);
  };

  // Confirmar carga de archivo (simulado — en producción iría a un servidor)
  const confirmarUpload = (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    const key = `${uploadTarget.usuarioId}_${uploadTarget.docId}`;
    const tamaño = uploadFile.size < 1024 * 1024
      ? `${(uploadFile.size / 1024).toFixed(0)} KB`
      : `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`;
    setArchivos((prev) => ({
      ...prev,
      [key]: { nombre: uploadFile.name, tamaño, fecha: new Date().toISOString().split("T")[0] },
    }));
    // Marcar automáticamente como entregado al subir archivo
    marcarEstado(uploadTarget.usuarioId, uploadTarget.docId, "entregado");
    setShowUploadModal(false);
    setUploadTarget(null);
    setUploadFile(null);
  };

  // Eliminar archivo cargado
  const eliminarArchivo = (key) => {
    setArchivos((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleRegistrar = (e) => {
    e.preventDefault();
    const uid = Number(form.usuarioId);
    const existe = docs.find((d) => d.usuarioId === uid && d.docId === form.docId);
    if (existe) {
      setDocs(docs.map((d) =>
        d.usuarioId === uid && d.docId === form.docId
          ? { ...d, estado: "entregado", fecha: new Date().toISOString().split("T")[0], observacion: form.observacion }
          : d
      ));
    } else {
      setDocs([...docs, {
        id: Date.now(), usuarioId: uid, docId: form.docId,
        estado: "entregado", fecha: new Date().toISOString().split("T")[0], observacion: form.observacion,
      }]);
    }
    setShowModal(false);
    setForm({ usuarioId: "", docId: "", observacion: "" });
  };

  const docsDisponiblesParaUsuario = form.usuarioId
    ? (documentosRequeridosPorRol[usuarios.find((u) => u.id === Number(form.usuarioId))?.rol] || [])
    : [];

  const categorias = [...new Set(
    Object.values(documentosRequeridosPorRol).flat().map((d) => d.categoria)
  )].sort();

  return (
    <div>
      <PageHeader
        title="Documentos"
        subtitle="Control de documentos requeridos por rol institucional"
        icon={FileText}
        color="#3b82f6"
        action={
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer">
            <Upload size={16} /> Registrar Entrega
          </button>
        }
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { label: "Total requeridos", value: stats.total,        color: "text-gray-700",  bg: "bg-gray-50"   },
          { label: "Entregados",       value: stats.entregados,   color: "text-green-700", bg: "bg-green-50"  },
          { label: "Pendientes",       value: stats.pendientes,   color: "text-yellow-700",bg: "bg-yellow-50" },
          { label: "Vencidos",         value: stats.vencidos,     color: "text-red-700",   bg: "bg-red-50"    },
          { label: "Exentos",          value: stats.exentosCount, color: "text-gray-500",  bg: "bg-gray-50"   },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alerta documentos vencidos */}
      {stats.vencidos > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-800">
          <AlertCircle size={16} className="flex-shrink-0" />
          {stats.vencidos} documento(s) vencido(s) requieren renovación urgente
        </div>
      )}
      {stats.pendientes > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-800">
          <AlertCircle size={16} className="flex-shrink-0" />
          {stats.pendientes} documento(s) pendiente(s) de entrega
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar persona o documento..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todos los roles</option>
          {ROLES_CON_DOCS.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
          ))}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todos los estados</option>
          <option value="entregado">Entregado</option>
          <option value="pendiente">Pendiente</option>
          <option value="vencido">Vencido</option>
          <option value="exento">Exento</option>
        </select>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <p className="text-xs text-gray-400 mb-3">{usuariosFiltrados.length} persona(s)</p>

      {/* Lista de usuarios con sus documentos */}
      <div className="flex flex-col gap-3">
        {usuariosFiltrados.map((usuario) => {
          const docsUsuario = getDocumentosUsuario(usuario);
          const entregados = docsUsuario.filter((d) => d.estado === "entregado").length;
          const vencidos = docsUsuario.filter((d) => d.estado === "vencido").length;
          const pendientesU = docsUsuario.filter((d) => d.estado === "pendiente").length;
          const exentosU = docsUsuario.filter((d) => d.esExento).length;
          const total = docsUsuario.filter((d) => !d.esExento).length;
          const pct = total > 0 ? Math.round((entregados / total) * 100) : 100;
          const abierto = expandidos[usuario.id];

          return (
            <div key={usuario.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Cabecera del usuario */}
              <button
                onClick={() => toggleExpandido(usuario.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition bg-transparent border-0 cursor-pointer"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {usuario.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{usuario.nombre}</p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {ROLE_LABELS[usuario.rol] || usuario.rol}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 max-w-32 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${pct === 100 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{entregados}/{total}</span>
                    {vencidos > 0 && <span className="text-xs text-red-600 font-medium">{vencidos} vencido(s)</span>}
                    {pendientesU > 0 && <span className="text-xs text-yellow-600">{pendientesU} pendiente(s)</span>}
                    {exentosU > 0 && <span className="text-xs text-gray-400">{exentosU} exento(s)</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-gray-400">
                  {abierto ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </button>

              {/* Tabla de documentos */}
              {abierto && (
                <div className="border-t border-gray-100">
                  {docsUsuario.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-gray-400 italic">
                      No hay documentos que coincidan con los filtros aplicados
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-5 py-2.5 text-gray-500 font-medium text-xs">Documento</th>
                            <th className="text-left px-3 py-2.5 text-gray-500 font-medium text-xs">Categoría</th>
                            <th className="text-center px-3 py-2.5 text-gray-500 font-medium text-xs">Estado</th>
                            <th className="text-left px-3 py-2.5 text-gray-500 font-medium text-xs">Archivo</th>
                            <th className="text-center px-3 py-2.5 text-gray-500 font-medium text-xs" title="Marcar como no requerido para esta persona">
                              No requerido
                            </th>
                            <th className="text-left px-3 py-2.5 text-gray-500 font-medium text-xs">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {docsUsuario.map((doc) => {
                            const ESTADO_CONFIG = {
                              entregado: { label: "Entregado", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
                              pendiente: { label: "Pendiente", icon: Clock,        color: "text-yellow-600",bg: "bg-yellow-50"},
                              vencido:   { label: "Vencido",   icon: XCircle,      color: "text-red-600",  bg: "bg-red-50"   },
                              exento:    { label: "Exento",    icon: Ban,          color: "text-gray-400", bg: "bg-gray-50"  },
                            };
                            const cfg = ESTADO_CONFIG[doc.estado] || ESTADO_CONFIG.pendiente;
                            const Icon = cfg.icon;

                            return (
                              <tr key={doc.id}
                                className={`border-t border-gray-50 transition ${doc.esExento ? "opacity-50 bg-gray-50" : "hover:bg-gray-50"}`}>

                                {/* Nombre del documento */}
                                <td className="px-5 py-3 max-w-xs">
                                  <div className="flex items-start gap-2">
                                    <FileText size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className={`text-xs ${doc.esExento ? "line-through text-gray-400" : "text-gray-800"}`}>
                                        {doc.nombre}
                                      </span>
                                      {doc.obligatorio && !doc.esExento && (
                                        <span className="ml-1 text-xs text-red-500">*</span>
                                      )}
                                      {doc.observacion && (
                                        <p className="text-xs text-orange-600 mt-0.5">{doc.observacion}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Categoría */}
                                <td className="px-3 py-3">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORIA_COLOR[doc.categoria] || "bg-gray-100 text-gray-600"}`}>
                                    {doc.categoria}
                                  </span>
                                </td>

                                {/* Estado */}
                                <td className="px-3 py-3 text-center">
                                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                                    <Icon size={11} />
                                    {cfg.label}
                                  </div>
                                </td>

                                {/* Archivo adjunto */}
                                <td className="px-3 py-3">
                                  {doc.archivo ? (
                                    <div className="flex items-center gap-1.5">
                                      <Paperclip size={12} className="text-blue-500 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-xs text-blue-700 truncate max-w-28" title={doc.archivo.nombre}>
                                          {doc.archivo.nombre}
                                        </p>
                                        <p className="text-xs text-gray-400">{doc.archivo.tamaño}</p>
                                      </div>
                                      <button
                                        onClick={() => eliminarArchivo(doc.key)}
                                        className="p-0.5 text-gray-300 hover:text-red-500 bg-transparent border-0 cursor-pointer flex-shrink-0"
                                        title="Eliminar archivo">
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  ) : (
                                    !doc.esExento && (
                                      <button
                                        onClick={() => abrirUpload(usuario.id, doc.id, doc.nombre)}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-transparent border-0 cursor-pointer whitespace-nowrap">
                                        <Upload size={12} /> Cargar
                                      </button>
                                    )
                                  )}
                                </td>

                                {/* Casilla "No requerido" (exención) */}
                                <td className="px-3 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Toggle
                                      checked={doc.esExento}
                                      onChange={() => toggleExento(doc.key)}
                                      color={doc.obligatorio ? "warning" : "primary"}
                                      size="small"
                                    />
                                    {doc.obligatorio && (
                                      <span className="text-xs text-gray-400">Excepción</span>
                                    )}
                                  </div>
                                </td>

                                {/* Acciones de estado */}
                                <td className="px-3 py-3">
                                  {!doc.esExento && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {doc.estado === "pendiente" && (
                                        <button
                                          onClick={() => marcarEstado(usuario.id, doc.id, "entregado")}
                                          className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg hover:bg-green-100 border-0 cursor-pointer whitespace-nowrap">
                                          ✓ Entregado
                                        </button>
                                      )}
                                      {doc.estado === "entregado" && (
                                        <button
                                          onClick={() => marcarEstado(usuario.id, doc.id, "vencido")}
                                          className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100 border-0 cursor-pointer whitespace-nowrap">
                                          Vencido
                                        </button>
                                      )}
                                      {doc.estado === "vencido" && (
                                        <button
                                          onClick={() => abrirUpload(usuario.id, doc.id, doc.nombre)}
                                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-100 border-0 cursor-pointer whitespace-nowrap">
                                          <span className="flex items-center gap-1"><RotateCcw size={11} /> Renovar</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {usuariosFiltrados.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            No se encontraron personas con los filtros aplicados
          </div>
        )}
      </div>

      {/* Modal registrar entrega */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar Entrega de Documento">
        <form onSubmit={handleRegistrar} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Persona *</label>
            <select required value={form.usuarioId}
              onChange={(e) => setForm({ ...form, usuarioId: e.target.value, docId: "" })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar persona</option>
              {usuariosConDocs.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} — {ROLE_LABELS[u.rol] || u.rol}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Documento *</label>
            <select required value={form.docId}
              onChange={(e) => setForm({ ...form, docId: e.target.value })}
              disabled={!form.usuarioId}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400">
              <option value="">Seleccionar documento</option>
              {docsDisponiblesParaUsuario.map((d) => (
                <option key={d.id} value={d.id}>
                  [{d.categoria}] {d.nombre}{d.obligatorio ? " *" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <input value={form.observacion}
              onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              placeholder="Ej: Copia simple, requiere original..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            El documento quedará registrado como <strong>Entregado</strong> con la fecha de hoy.
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 border-0 cursor-pointer">
              Registrar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal carga de archivo */}
      <Modal
        open={showUploadModal}
        onClose={() => { setShowUploadModal(false); setUploadFile(null); }}
        title="Cargar Archivo"
      >
        <form onSubmit={confirmarUpload} className="flex flex-col gap-4">
          {uploadTarget && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">Documento</p>
              <p className="text-sm font-medium text-gray-800">{uploadTarget.docNombre}</p>
            </div>
          )}

          {/* Zona de carga */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer
              ${uploadFile ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) setUploadFile(f);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files[0] || null)}
            />
            {uploadFile ? (
              <div className="flex flex-col items-center gap-2">
                <Paperclip size={24} className="text-green-600" />
                <p className="text-sm font-medium text-green-700">{uploadFile.name}</p>
                <p className="text-xs text-gray-400">
                  {uploadFile.size < 1024 * 1024
                    ? `${(uploadFile.size / 1024).toFixed(0)} KB`
                    : `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                  className="text-xs text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer">
                  Quitar archivo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={24} className="text-gray-300" />
                <p className="text-sm text-gray-500">Arrastra el archivo aquí o haz clic para seleccionar</p>
                <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG, XLS — máx. 10 MB</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            Al cargar el archivo, el documento se marcará automáticamente como <strong>Entregado</strong>.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowUploadModal(false); setUploadFile(null); }}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!uploadFile}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Cargar documento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
