import { useState, useRef } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Upload, FileText, Download, Trash2, X, CheckCircle, AlertCircle, Paperclip } from "lucide-react";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { materias, cursos } from "../../data/mockData";

const materialesIniciales = [
  { id: 1, nombre: "Guía de álgebra - Capítulo 5.pdf",   tipo: "PDF", materiaId: 1, fecha: "2025-05-01", tamaño: "1.2 MB", fileUrl: null },
  { id: 2, nombre: "Presentación ecosistemas.pptx",       tipo: "PPT", materiaId: 3, fecha: "2025-04-28", tamaño: "3.5 MB", fileUrl: null },
  { id: 3, nombre: "Taller de comprensión lectora.docx",  tipo: "DOC", materiaId: 2, fecha: "2025-04-25", tamaño: "0.8 MB", fileUrl: null },
];

const TIPO_COLOR = {
  PDF: "bg-red-100 text-red-700",
  PPT: "bg-orange-100 text-orange-700",
  DOC: "bg-blue-100 text-blue-700",
  IMG: "bg-green-100 text-green-700",
  XLS: "bg-emerald-100 text-emerald-700",
  ZIP: "bg-gray-100 text-gray-600",
};

// Detecta el tipo a partir de la extensión del archivo
function detectarTipo(nombre) {
  const ext = nombre.split(".").pop()?.toLowerCase();
  if (["pdf"].includes(ext))                    return "PDF";
  if (["doc","docx"].includes(ext))             return "DOC";
  if (["ppt","pptx"].includes(ext))             return "PPT";
  if (["xls","xlsx","csv"].includes(ext))       return "XLS";
  if (["jpg","jpeg","png","gif","webp"].includes(ext)) return "IMG";
  if (["zip","rar","7z"].includes(ext))         return "ZIP";
  return "DOC";
}

function formatBytes(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function Materiales() {
  const toast = useToast();
  const [materiales, setMateriales] = useInstState("er_materiales", materialesIniciales);
  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [archivoError, setArchivoError]               = useState("");
  const [materiaId, setMateriaId]                     = useState(1);
  const [titulo, setTitulo]                           = useState("");
  const [descripcion, setDescripcion]                 = useState("");
  const [categoria, setCategoria]                     = useState("guia");
  const [isDragging, setIsDragging]                   = useState(false);
  const [subiendo, setSubiendo]                       = useState(false);

  const fileInputRef = useRef(null);
  const misMaterias  = materias.filter(m => m.docenteId === 5);

  // ── Manejo de archivo ──────────────────────────────────────────────────────

  const procesarArchivo = (file) => {
    setArchivoError("");
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setArchivoError(`El archivo supera el límite de 10 MB (${formatBytes(file.size)})`);
      return;
    }
    setArchivoSeleccionado(file);
  };

  const handleFileInput = (e) => {
    procesarArchivo(e.target.files[0] || null);
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    procesarArchivo(e.dataTransfer.files[0] || null);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);

  // ── Subir ──────────────────────────────────────────────────────────────────

  const handleSubir = async (e) => {
    e.preventDefault();
    if (!archivoSeleccionado) {
      setArchivoError("Selecciona un archivo antes de subir.");
      return;
    }
    if (!titulo.trim()) {
      setArchivoError("Escribe un título para el material.");
      return;
    }

    setSubiendo(true);
    const fileUrl = URL.createObjectURL(archivoSeleccionado);
    await new Promise(r => setTimeout(r, 600));

    const nuevo = {
      id:        Date.now(),
      nombre:    titulo.trim() || archivoSeleccionado.name,
      nombreArchivo: archivoSeleccionado.name,
      descripcion,
      categoria,
      tipo:      detectarTipo(archivoSeleccionado.name),
      materiaId: Number(materiaId),
      fecha:     new Date().toISOString().split("T")[0],
      tamaño:    formatBytes(archivoSeleccionado.size),
      fileUrl,
    };

    setMateriales(prev => [nuevo, ...prev]);
    setSubiendo(false);
    cerrarModal();
    toast.success(`"${nuevo.nombre}" subido correctamente`, "Material publicado");
  };

  const cerrarModal = () => {
    setShowModal(false);
    setArchivoSeleccionado(null);
    setArchivoError("");
    setIsDragging(false);
    setMateriaId(1);
    setTitulo("");
    setDescripcion("");
    setCategoria("guia");
  };

  // ── Descarga ───────────────────────────────────────────────────────────────

  const descargar = (material) => {
    if (!material.fileUrl) {
      // Para materiales de demo sin archivo real, simular descarga
      alert(`Descargando: ${material.nombre}\n(En producción se descargaría desde el servidor)`);
      return;
    }
    const a = document.createElement("a");
    a.href = material.fileUrl;
    a.download = material.nombre;
    a.click();
  };

  const eliminar = (id) => {
    const mat = materiales.find(m => m.id === id);
    if (mat?.fileUrl) URL.revokeObjectURL(mat.fileUrl); // liberar memoria
    setMateriales(materiales.filter((m) => m.id !== id));
  };

  // ── Filtros ────────────────────────────────────────────────────────────────

  const filtrados = materiales.filter((m) => {
    const matchSearch  = !search      || m.nombre.toLowerCase().includes(search.toLowerCase());
    const matchTipo    = !filtroTipo  || m.tipo === filtroTipo;
    const matchMateria = !filtroMateria || m.materiaId === Number(filtroMateria);
    return matchSearch && matchTipo && matchMateria;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <PageHeader
        title="Materiales"
        subtitle="Archivos y recursos para tus estudiantes"
        icon={Upload}
        color="#8b5cf6"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm shadow-blue-200"
          >
            <Upload size={15} /> Subir Material
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar archivo..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
        >
          <option value="">Todos los tipos</option>
          {["PDF","DOC","PPT","IMG","XLS","ZIP"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filtroMateria}
          onChange={(e) => setFiltroMateria(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
        >
          <option value="">Todas las materias</option>
          {misMaterias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
      </div>
      <p className="text-xs text-gray-400">{filtrados.length} archivo(s)</p>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Archivo</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Materia</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Fecha</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Tamaño</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((m) => {
                const materia = misMaterias.find((x) => x.id === m.materiaId);
                return (
                  <tr key={m.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${TIPO_COLOR[m.tipo] || "bg-gray-100 text-gray-600"}`}>
                          {m.tipo}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate max-w-xs">{m.nombre}</p>
                          {m.descripcion && <p className="text-xs text-gray-400 truncate max-w-xs">{m.descripcion}</p>}
                          <div className="flex items-center gap-2 mt-0.5">
                            {m.categoria && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full capitalize">{m.categoria}</span>}
                            {m.fileUrl && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle size={11} /> Cargado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{materia?.nombre || "—"}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell">{m.fecha}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell">{m.tamaño}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => descargar(m)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition bg-transparent border-0 cursor-pointer"
                          title="Descargar"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          onClick={() => eliminar(m.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition bg-transparent border-0 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <FileText size={28} className="mx-auto mb-2 opacity-30" />
                    No hay archivos que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal subir material ── */}
      <Modal open={showModal} onClose={cerrarModal} title="Subir Material">
        <form onSubmit={handleSubir} className="flex flex-col gap-4">

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Título del material *</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Guía de álgebra - Capítulo 5"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50 hover:bg-white transition" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Descripción / Instrucciones de uso</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
              rows={2} placeholder="Describe para qué sirve este material..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50 hover:bg-white transition resize-none" />
          </div>

          {/* Materia y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Materia *</label>
              <select value={materiaId} onChange={e => setMateriaId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50">
                {misMaterias.map(m => {
                  const c = cursos.find(c => c.id === m.cursoId);
                  return <option key={m.id} value={m.id}>{m.nombre} — {c?.nombre}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Categoría</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50">
                <option value="guia">Guía</option>
                <option value="presentacion">Presentación</option>
                <option value="evaluacion">Evaluación</option>
                <option value="taller">Taller</option>
                <option value="video">Video</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Zona de carga */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Archivo *</label>

            {/* Input oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
              className="hidden"
              onChange={handleFileInput}
            />

            {archivoSeleccionado ? (
              /* Archivo seleccionado — preview */
              <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${TIPO_COLOR[detectarTipo(archivoSeleccionado.name)] || "bg-gray-100 text-gray-600"}`}>
                  {detectarTipo(archivoSeleccionado.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{archivoSeleccionado.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatBytes(archivoSeleccionado.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setArchivoSeleccionado(null); setArchivoError(""); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 bg-transparent border-0 cursor-pointer rounded-lg hover:bg-red-50 flex-shrink-0"
                  title="Quitar archivo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              /* Zona drag & drop */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${isDragging
                    ? "border-blue-400 bg-blue-50 scale-[1.01]"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
                  }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}>
                  <Paperclip size={22} className={isDragging ? "text-blue-500" : "text-gray-400"} />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {isDragging ? "Suelta el archivo aquí" : "Arrastra un archivo o haz clic para seleccionar"}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">
                  PDF, DOC, PPT, XLS, IMG, ZIP — máx. 10 MB
                </p>
              </div>
            )}

            {/* Error */}
            {archivoError && (
              <div className="flex items-center gap-2 mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={13} className="flex-shrink-0" />
                {archivoError}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            El archivo quedará disponible para descarga por los estudiantes del curso asignado.
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={cerrarModal}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!archivoSeleccionado || subiendo}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {subiendo ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Subiendo...
                </>
              ) : (
                <><Upload size={14} /> Subir archivo</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
