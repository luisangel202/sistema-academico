import { useState, useRef } from "react";
import {
  Upload, FileText, Download, Eye, Check, X, AlertCircle,
  Trash2, Folder, ChevronLeft, Plus, User,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../context/DocumentContext";
import { useBulkSelect } from "../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../components/BulkActions";

const ESTADOS = {
  pendiente: { label: "Pendiente", variant: "warning" },
  cargado:   { label: "Cargado",   variant: "success" },
  aprobado:  { label: "Aprobado",  variant: "success" },
  rechazado: { label: "Rechazado", variant: "danger" },
  vencido:   { label: "Vencido",   variant: "danger" },
};

const CATEGORIAS = ["Identificación", "Salud", "Académico", "Formación", "Administrativo", "Otros"];

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin", ADMIN_INSTITUCIONAL: "Admin Institucional",
  COORDINADOR: "Coordinador", SECRETARIA: "Secretaría",
  DOCENTE: "Docente", DIRECTOR_GRUPO: "Director de Grupo",
  PSICOORIENTADOR: "Psicoorientador", ESTUDIANTE: "Estudiante",
  PADRE: "Padre / Acudiente",
};

export default function Documentos() {
  const toast = useToast();
  const { user } = useAuth();
  const { getFolders, getUserDocuments, addDocument, removeDocuments } = useDocuments();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Identificación");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef(null);

  /* ── Datos ────────────────────────────────────────── */
  const folders = getFolders();
  const selectedUser = folders.find((f) => f.id === selectedUserId);
  const userDocs = selectedUserId ? getUserDocuments(selectedUserId) : [];

  /* ── Filtros carpetas ──────────────────────────────── */
  const foldersFiltrados = folders.filter((f) => {
    if (!search) return true;
    return (
      f.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (ROLE_LABELS[f.rol] || f.rol).toLowerCase().includes(search.toLowerCase())
    );
  });

  /* ── Filtros documentos ───────────────────────────── */
  const docsFiltrados = userDocs.filter((doc) => {
    const matchSearch = !search || doc.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filtroCategoria || doc.categoria === filtroCategoria;
    const matchEst = !filtroEstado || doc.estado === filtroEstado;
    return matchSearch && matchCat && matchEst;
  });

  /* ── Bulk select ──────────────────────────────────── */
  const bulk = useBulkSelect(docsFiltrados);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    const ids = [...bulk.selected];
    removeDocuments(selectedUserId, ids);
    bulk.clear();
    setConfirmDel(false);
    toast.success(`${count} documento(s) eliminado(s)`);
  };

  /* ── Subir archivo real ───────────────────────────── */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    setUploadName(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleUpload = () => {
    if (!uploadFile) { toast.error("Selecciona un archivo"); return; }
    if (!uploadName.trim()) { toast.error("Escribe un nombre para el documento"); return; }

    setUploadProgress(10);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadProgress(80);
      const dataUrl = e.target.result;
      const ext = uploadFile.name.split(".").pop().toLowerCase();

      addDocument(selectedUserId, {
        id: `doc_${Date.now()}`,
        nombre: uploadName.trim(),
        categoria: uploadCategory,
        estado: "cargado",
        fechaCarga: new Date().toISOString().split("T")[0],
        fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
        fileType: ext,
        dataUrl,
      });

      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadFile(null);
        setUploadName("");
        setUploadCategory("Identificación");
        setShowUploadModal(false);
        toast.success("Documento subido correctamente");
      }, 400);
    };
    reader.readAsDataURL(uploadFile);
  };

  /* ── Descargar ─────────────────────────────────────── */
  const handleDownload = (doc) => {
    if (doc.dataUrl) {
      const link = document.createElement("a");
      link.href = doc.dataUrl;
      link.download = `${doc.nombre}.${doc.fileType || "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info("Este documento no tiene archivo cargado");
    }
  };

  /* ── Ver documento ────────────────────────────────── */
  const handleView = (doc) => {
    setViewDoc(doc);
    setShowViewModal(true);
  };

  /* ── Iconos de estado ──────────────────────────────── */
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "pendiente": return <AlertCircle size={16} className="text-yellow-500" />;
      case "cargado":   return <Upload size={16} className="text-green-500" />;
      case "aprobado":  return <Check size={16} className="text-green-600" />;
      case "rechazado": return <X size={16} className="text-red-500" />;
      case "vencido":   return <AlertCircle size={16} className="text-red-500" />;
      default:          return <FileText size={16} className="text-gray-400" />;
    }
  };

  /* ════════════════════════════════════════════════════════
     VISTA: CARPETAS (lista de usuarios)
     ════════════════════════════════════════════════════════ */
  if (!selectedUserId) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Gestión Documental"
          subtitle="Carpetas de documentos por usuario"
          icon={Folder}
          color="#3b82f6"
        />

        {/* Buscar carpetas */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Buscar usuario o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Grid de carpetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {foldersFiltrados.map((u) => (
            <button
              key={u.id}
              onClick={() => { setSelectedUserId(u.id); setSearch(""); setFiltroCategoria(""); setFiltroEstado(""); }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: "#eff6ff", color: "#2563eb" }}>
                  {u.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{u.nombre}</p>
                  <p className="text-xs text-gray-400">{ROLE_LABELS[u.rol] || u.rol}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Folder size={13} className={u.docCount > 0 ? "text-blue-500" : "text-gray-300"} />
                  <span>{u.docCount} documento{u.docCount !== 1 ? "s" : ""}</span>
                </div>
                {u.docCount > 0 ? (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {u.docCount}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Vacía</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {foldersFiltrados.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Folder size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     VISTA: DOCUMENTOS (dentro de una carpeta)
     ════════════════════════════════════════════════════════ */
  const pendientes = userDocs.filter((d) => d.estado === "pendiente").length;
  const cargados = userDocs.filter((d) => d.estado === "cargado").length;
  const aprobados = userDocs.filter((d) => d.estado === "aprobado").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Carpeta: ${selectedUser?.nombre || ""}`}
        subtitle={`${ROLE_LABELS[selectedUser?.rol] || ""} · ${userDocs.length} documento(s)`}
        icon={Folder}
        color="#3b82f6"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedUserId(null)}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition border border-gray-200 cursor-pointer"
            >
              <ChevronLeft size={16} /> Volver
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer"
            >
              <Upload size={16} /> Subir Documento
            </button>
          </div>
        }
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => setSelectedUserId(null)} className="text-gray-500 hover:text-blue-600 transition cursor-pointer bg-transparent border-0 flex items-center gap-1">
          <Folder size={14} /> Documentos
        </button>
        <ChevronLeft size={14} className="text-gray-300 rotate-180" />
        <span className="font-semibold text-gray-800">{selectedUser?.nombre}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={FileText} color="#3b82f6" label="Total" value={userDocs.length} />
        <StatCard icon={AlertCircle} color="#eab308" label="Pendientes" value={pendientes} />
        <StatCard icon={Upload} color="#22c55e" label="Cargados" value={cargados} />
        <StatCard icon={Check} color="#16a34a" label="Aprobados" value={aprobados} />
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <input
            type="text"
            placeholder="Buscar documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Bulk bar */}
      {bulk.count > 0 && (
        <BulkBar count={bulk.count} label="documento"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}

      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={docsFiltrados.length} onToggleAll={bulk.toggleAll} label="documento" />

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 w-10"></th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Documento</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Categoría</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Estado</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Información</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {docsFiltrados.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/80 transition">
                  <td className="px-5 py-4"><Checkbox checked={bulk.selected.has(doc.id)} onChange={() => bulk.toggle(doc.id)} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {getEstadoIcon(doc.estado)}
                      <div>
                        <p className="font-medium text-gray-800">{doc.nombre}</p>
                        {doc.fileType && (
                          <span className="text-xs font-mono text-gray-400 uppercase">{doc.fileType}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{doc.categoria}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge label={ESTADOS[doc.estado]?.label || doc.estado} variant={ESTADOS[doc.estado]?.variant || "gray"} />
                  </td>
                  <td className="px-5 py-4">
                    {doc.fileSize && <p className="text-xs text-gray-500">{doc.fileSize}</p>}
                    {doc.fechaCarga && <p className="text-xs text-gray-400">{doc.fechaCarga}</p>}
                    {doc.dataUrl && <span className="text-xs text-green-600 font-medium">Archivo disponible</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {doc.dataUrl && (
                        <>
                          <button onClick={() => handleView(doc)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition bg-transparent border-0 cursor-pointer"
                            title="Ver documento">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleDownload(doc)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition bg-transparent border-0 cursor-pointer"
                            title="Descargar">
                            <Download size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {docsFiltrados.length === 0 && (
          <div className="px-5 py-12 text-center text-gray-400">
            <FileText size={24} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No hay documentos en esta carpeta</p>
            <p className="text-xs mt-1">Sube el primer documento con el botón superior</p>
          </div>
        )}
      </div>

      {/* Modal subir documento */}
      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)} title={`Subir a carpeta de ${selectedUser?.nombre}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nombre del documento *</label>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="Ej: Carné de salud 2025"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Categoría</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Archivo *</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Máx. 10MB)</p>
          </div>

          {uploadProgress > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadName(""); setUploadProgress(0); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadFile || !uploadName.trim() || uploadProgress > 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
              <Upload size={15} /> Subir Documento
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal ver documento */}
      <Modal open={showViewModal} onClose={() => setShowViewModal(false)} title="Vista de Documento">
        {viewDoc && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-medium text-gray-800 mb-2">{viewDoc.nombre}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Categoría</p>
                  <p className="font-medium">{viewDoc.categoria}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <Badge label={ESTADOS[viewDoc.estado]?.label || viewDoc.estado} variant={ESTADOS[viewDoc.estado]?.variant || "gray"} />
                </div>
                {viewDoc.fileSize && (
                  <div>
                    <p className="text-gray-500">Tamaño</p>
                    <p className="font-medium">{viewDoc.fileSize}</p>
                  </div>
                )}
                {viewDoc.fechaCarga && (
                  <div>
                    <p className="text-gray-500">Fecha de carga</p>
                    <p className="font-medium">{viewDoc.fechaCarga}</p>
                  </div>
                )}
              </div>
            </div>

            {viewDoc.dataUrl && viewDoc.fileType === "pdf" && (
              <iframe src={viewDoc.dataUrl} title="Vista PDF" className="w-full h-64 border border-gray-200 rounded-xl" />
            )}
            {viewDoc.dataUrl && ["jpg", "jpeg", "png"].includes(viewDoc.fileType) && (
              <img src={viewDoc.dataUrl} alt={viewDoc.nombre} className="w-full max-h-64 object-contain rounded-xl border border-gray-200" />
            )}

            {viewDoc.dataUrl && (
              <button
                onClick={() => handleDownload(viewDoc)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition border-0 cursor-pointer">
                <Download size={16} /> Descargar Documento
              </button>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDeleteModal
        open={confirmDel}
        count={bulk.count}
        itemLabel="documento"
        onConfirm={eliminarSeleccionados}
        onCancel={() => setConfirmDel(false)}
      />
    </div>
  );
}

/* ── StatCard helper ─────────────────────────────────── */
function StatCard({ icon: Icon, color, label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}
