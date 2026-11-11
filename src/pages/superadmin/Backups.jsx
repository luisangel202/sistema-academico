import { useState, useRef } from "react";
import {
  Database, Download, Upload, RefreshCw, Trash2,
  HardDrive, CheckCircle, AlertCircle, Building2,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useStorage } from "../../context/StorageContext";
import { instituciones as dataInst } from "../../data/mockData";

const COLECCIONES = [
  "usuarios", "credenciales", "materias", "cursos", "periodos",
  "matriculas", "notas", "asistencia", "cuestionarios", "preguntas",
  "documentos", "instituciones", "observador", "citaciones",
  "planesMejoramiento", "reuniones", "casos", "citas", "seguimientos",
];

export default function Backups() {
  const toast = useToast();
  const { exportarInstitucion, importarInstitucion, clearCollection, usageBytes, getCollection } = useStorage();

  const [instSeleccionada, setInstSeleccionada] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [limpiezaModal, setLimpiezaModal] = useState(false);
  const [generando, setGenerando] = useState(false);

  const fileRef = useRef(null);

  const instituciones = getCollection("instituciones", dataInst, null);

  /* ── Calcular uso de localStorage ─────────────────── */
  const totalBytes = usageBytes();
  const totalKB    = (totalBytes / 1024).toFixed(1);
  const totalMB    = (totalBytes / 1048576).toFixed(2);
  const porcentaje = Math.min((totalBytes / (5 * 1048576)) * 100, 100).toFixed(1); // ~5 MB límite típico

  /* ── Exportar institución ──────────────────────────── */
  const exportar = (inst) => {
    setGenerando(true);
    setTimeout(() => {
      const json = exportarInstitucion(inst.id);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edurural_backup_${inst.codigo}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setGenerando(false);
      toast.success(`Backup de "${inst.nombre}" descargado`);
    }, 600);
  };

  /* ── Importar desde archivo ────────────────────────── */
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportJson(ev.target.result);
    reader.readAsText(file);
  };

  const confirmarImport = () => {
    const ok = importarInstitucion(importJson);
    if (ok) {
      toast.success("Backup restaurado correctamente");
      setShowImportModal(false);
      setImportJson("");
    } else {
      toast.error("El archivo no es un backup válido de EduRural");
    }
  };

  /* ── Limpiar datos de una colección ───────────────── */
  const limpiarTodo = () => {
    COLECCIONES.forEach(col => clearCollection(col, null));
    COLECCIONES.forEach(col => instituciones.forEach(i => clearCollection(col, i.id)));
    setLimpiezaModal(false);
    toast.success("Caché limpiado. Los datos se recargarán desde los valores iniciales.");
  };

  /* ── Contar entradas por institución ──────────────── */
  const contarEntradas = (instId) => {
    let total = 0;
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(`edurural_${instId}_`)) {
        try { total += JSON.parse(localStorage.getItem(k))?.length || 0; } catch {}
      }
    }
    return total;
  };

  const colsGlobal = () => {
    let total = 0;
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("edurural_global_")) total++;
    }
    return total;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Almacenamiento y Backups"
        subtitle="Control del almacenamiento local y copias de seguridad"
        icon={Database}
        color="#14b8a6"
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition cursor-pointer">
              <Upload size={15}/> Restaurar
            </button>
          </div>
        }
      />

      {/* ── Estadísticas de uso ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={HardDrive} color="#3b82f6" label="Uso localStorage" value={`${totalKB} KB`} sub={`${totalMB} MB`} />
        <StatCard icon={Database} color="#10b981" label="Colecciones globales" value={colsGlobal()} sub="en memoria" />
        <StatCard icon={Building2} color="#8b5cf6" label="Instituciones" value={instituciones.length} sub="registradas" />
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 mb-2">Capacidad usada</p>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
            <div className="h-2.5 rounded-full transition-all"
              style={{ width: `${porcentaje}%`, background: Number(porcentaje) > 80 ? "#ef4444" : "#10b981" }} />
          </div>
          <p className="text-xs text-gray-500">{porcentaje}% de ~5 MB</p>
        </div>
      </div>

      {/* ── Backup por institución ──────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Backup por Institución</h3>
          <button onClick={() => setLimpiezaModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition cursor-pointer border-0 bg-transparent">
            <Trash2 size={13}/> Limpiar caché
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Institución</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Licencia</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Registros</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Backup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {instituciones.map(inst => {
                const vencida = inst.vencimiento ? new Date(inst.vencimiento) < new Date() : true;
                const entradas = contarEntradas(inst.id);
                return (
                  <tr key={inst.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800 text-sm">{inst.nombre}</p>
                      <p className="text-xs text-gray-400 font-mono">{inst.codigo}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <Badge label={inst.licencia || "sin licencia"} variant={inst.licencia === "premium" ? "purple" : "gray"} dot />
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-gray-600">{entradas} registros</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {!inst.activa
                        ? <Badge label="Inactiva" variant="danger" dot />
                        : vencida
                          ? <Badge label="Vencida" variant="warning" dot />
                          : <Badge label="Activa" variant="success" dot />}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => exportar(inst)} disabled={generando}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition cursor-pointer border-0 bg-transparent disabled:opacity-40">
                        <Download size={13}/> Exportar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Colecciones en localStorage ────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">Colecciones en Almacenamiento Local</h3>
          <p className="text-sm text-gray-400 mt-0.5">Todas las claves guardadas en este dispositivo</p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.keys(localStorage)
            .filter(k => k.startsWith("edurural_"))
            .sort()
            .map(k => {
              let size = 0;
              let count = 0;
              try {
                const val = localStorage.getItem(k);
                size = (val.length * 2 / 1024).toFixed(1);
                const parsed = JSON.parse(val);
                count = Array.isArray(parsed) ? parsed.length : (typeof parsed === "object" ? Object.keys(parsed).length : 1);
              } catch {}
              const partes = k.replace("edurural_", "").split("_");
              const scope = partes[0];
              const col   = partes.slice(1).join("_");
              return (
                <div key={k} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-semibold text-gray-700 truncate">{col || scope}</p>
                    <p className="text-[10px] text-gray-400">
                      {scope !== "global" ? `Inst. ${scope}` : "Global"} · {count} items
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 ml-3 flex-shrink-0">{size} KB</span>
                </div>
              );
            })}
          {Object.keys(localStorage).filter(k => k.startsWith("edurural_")).length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-400">
              <Database size={24} className="mx-auto mb-2 opacity-30"/>
              <p className="text-sm">Ningún dato guardado localmente todavía</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal restaurar backup */}
      <Modal open={showImportModal} onClose={() => { setShowImportModal(false); setImportJson(""); }} title="Restaurar Backup">
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5"/>
            <p className="text-sm text-amber-800">Restaurar un backup sobreescribe los datos existentes para esa institución. Esta acción no se puede deshacer.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Cargar archivo .json</label>
            <input ref={fileRef} type="file" accept=".json" onChange={onFileChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {importJson && (
            <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-auto">
              <pre className="text-[10px] text-gray-500 font-mono">{importJson.slice(0, 300)}...</pre>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowImportModal(false); setImportJson(""); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">
              Cancelar
            </button>
            <button onClick={confirmarImport} disabled={!importJson}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              <Upload size={14}/> Restaurar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal limpiar caché */}
      <Modal open={limpiezaModal} onClose={() => setLimpiezaModal(false)} title="Limpiar Caché" size="sm">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5"/>
            <p className="text-sm text-red-800">Esto borrará <strong>todos los datos locales</strong> del almacenamiento del navegador. Los datos se recargarán desde los valores iniciales del sistema.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setLimpiezaModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">
              Cancelar
            </button>
            <button onClick={limpiarTodo}
              className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 border-0 cursor-pointer">
              Limpiar todo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-black text-gray-800">{value}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
