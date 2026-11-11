import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, Link2, FileText, FileSpreadsheet, CheckCircle,
  AlertCircle, X, Table, Download, Sparkles, ChevronRight,
} from "lucide-react";
import Modal from "./Modal";
import { useToast } from "./Toast";
import { useImport } from "../hooks/useImport";
import { useImportContext } from "../context/ImportContext";
import { IMPORT_DESTINATIONS, detectDestinations } from "../data/importDestinations";

/**
 * Modal de importación inteligente.
 *
 * 1. Subes archivo / pegas link / pegas texto
 * 2. El sistema detecta las columnas y sugiere un módulo destino
 * 3. Eliges el destino (con sugerencia automática)
 * 4. El sistema navega al módulo e importa los datos
 */
export default function SmartImportModal({ open, onClose }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { sendToModule } = useImportContext();
  const { parseFile, parseUrl, parseText } = useImport();

  const [tab, setTab] = useState("file");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const fileRef = useRef(null);

  const handleClose = () => {
    setData([]);
    setError("");
    setUrlValue("");
    setTextValue("");
    setSuggestions([]);
    setSelectedDest(null);
    setLoading(false);
    onClose();
  };

  /* ── Procesar resultado parseado ───────────────────── */
  const handleResult = (result) => {
    if (!Array.isArray(result) || result.length === 0) {
      setError("No se encontraron datos para importar");
      setData([]);
      setSuggestions([]);
      return;
    }
    setError("");
    setData(result);

    /* Detectar destino sugerido */
    const columns = Object.keys(result[0]);
    const detected = detectDestinations(columns);
    setSuggestions(detected);
    setSelectedDest(detected[0]?.id || null);
  };

  /* ── Handlers de input ──────────────────────────────── */
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const result = await parseFile(file);
      handleResult(result);
      toast.success(`${result.length} filas detectadas`);
    } catch (err) {
      setError(err.message || "Error al leer el archivo");
      toast.error("No se pudo leer el archivo");
    } finally {
      setLoading(false);
    }
  }, [parseFile, toast]);

  const handleUrl = async () => {
    if (!urlValue.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await parseUrl(urlValue);
      handleResult(result);
      toast.success(`${result.length} filas detectadas`);
    } catch (err) {
      setError(err.message || "No se pudo acceder al enlace");
      toast.error("Error al importar desde el enlace");
    } finally {
      setLoading(false);
    }
  };

  const handleText = () => {
    if (!textValue.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = parseText(textValue);
      handleResult(result);
    } catch (err) {
      setError(err.message || "Error al parsear el texto");
    } finally {
      setLoading(false);
    }
  };

  const onTextChange = (val) => {
    setTextValue(val);
    if (val.trim().length > 20) {
      try {
        const result = parseText(val);
        if (result.length > 0) handleResult(result);
      } catch {}
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  /* ── Confirmar importación ──────────────────────────── */
  const handleImport = () => {
    if (!selectedDest) {
      toast.error("Selecciona un módulo destino");
      return;
    }
    const dest = IMPORT_DESTINATIONS.find((d) => d.id === selectedDest);
    if (!dest) return;

    sendToModule(selectedDest, data);
    toast.success(`Enviando ${data.length} registros a ${dest.label}`);
    handleClose();
    navigate(dest.route);
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const selected = IMPORT_DESTINATIONS.find((d) => d.id === selectedDest);

  return (
    <Modal open={open} onClose={handleClose} title="Importar Datos" size="lg">
      <div className="space-y-4">
        {/* ── Tabs ──────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, padding: 4, borderRadius: 12, background: "#f1f5f9" }}>
          {[
            { id: "file", label: "Archivo", icon: Upload },
            { id: "url", label: "Enlace", icon: Link2 },
            { id: "text", label: "Pegar texto", icon: FileText },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700, transition: "all 200ms",
                background: tab === t.id ? "#fff" : "transparent",
                color: tab === t.id ? "#1e293b" : "#64748b",
                boxShadow: tab === t.id ? "0 1px 3px rgba(15,23,42,0.1)" : "none",
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Archivo ──────────────────────────────── */}
        {tab === "file" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "#3b82f6" : "#cbd5e1"}`,
              borderRadius: 16, padding: "36px 20px", textAlign: "center",
              cursor: "pointer", transition: "all 200ms",
              background: dragOver ? "#eff6ff" : "#f8fafc",
            }}>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json,.txt"
              style={{ display: "none" }}
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #dbeafe", borderTopColor: "#3b82f6", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Procesando...</p>
              </div>
            ) : (
              <>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Upload size={24} style={{ color: "#2563eb" }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Arrastra un archivo o haz clic aquí</p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>CSV, Excel (.xlsx), JSON o TXT</p>
              </>
            )}
          </div>
        )}

        {/* ── Tab: Enlace ────────────────────────────────── */}
        {tab === "url" && (
          <div className="space-y-3">
            <div style={{ position: "relative" }}>
              <Link2 size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input value={urlValue} onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrl()}
                placeholder="https://... o enlace de Google Sheets"
                style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 12, border: "1.5px solid #e4eaf3", fontSize: 13, outline: "none", background: "#f8fafc" }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; }} />
            </div>
            <button onClick={handleUrl} disabled={loading || !urlValue.trim()}
              style={{ width: "100%", padding: "10px 16px", borderRadius: 12, background: loading || !urlValue.trim() ? "#cbd5e1" : "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: loading || !urlValue.trim() ? "not-allowed" : "pointer" }}>
              {loading ? "Importando..." : "Importar desde enlace"}
            </button>
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 8 }}>
              <FileSpreadsheet size={13} style={{ color: "#16a34a", flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: "#15803d", margin: 0, lineHeight: 1.5 }}>
                <strong>Google Sheets:</strong> pega el enlace de edición (compartir como "Cualquiera con el enlace")
              </p>
            </div>
          </div>
        )}

        {/* ── Tab: Pegar texto ───────────────────────────── */}
        {tab === "text" && (
          <textarea value={textValue} onChange={(e) => onTextChange(e.target.value)} rows={6}
            placeholder={"Pega datos en CSV o JSON...\n\nnombre,documento,curso\nJuan Pérez,12345,6A\nMaría Gómez,67890,7B"}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e4eaf3", fontSize: 12, fontFamily: "monospace", outline: "none", background: "#f8fafc", resize: "none", lineHeight: 1.6 }}
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; }} />
        )}

        {/* ── Error ──────────────────────────────────────── */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca" }}>
            <AlertCircle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: "#991b1b", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ════════ Detección inteligente ══════════════════ */}
        {data.length > 0 && (
          <div className="space-y-4">
            {/* Columnas detectadas */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>
                Columnas detectadas ({columns.length})
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {columns.map((col) => (
                  <span key={col} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Sugerencia de destino */}
            {suggestions.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <Sparkles size={15} style={{ color: "#16a34a" }} />
                <p style={{ fontSize: 13, color: "#15803d", margin: 0, fontWeight: 600 }}>
                  Detectamos: <strong>{suggestions[0].label}</strong> ({suggestions[0].matched}/{suggestions[0].totalCols} columnas coinciden)
                </p>
              </div>
            )}

            {/* Selector de destino */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>
                ¿A qué módulo quieres importar?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                {IMPORT_DESTINATIONS.map((dest) => {
                  const isSuggested = suggestions[0]?.id === dest.id;
                  const matchScore = suggestions.find((s) => s.id === dest.id);
                  const isSelected = selectedDest === dest.id;
                  return (
                    <button key={dest.id} onClick={() => setSelectedDest(dest.id)}
                      style={{
                        position: "relative", padding: "12px 14px", borderRadius: 12,
                        border: isSelected ? `2px solid ${dest.color}` : "1.5px solid #e8edf5",
                        background: isSelected ? `${dest.color}08` : "#fff",
                        cursor: "pointer", transition: "all 200ms", textAlign: "left",
                      }}>
                      {isSuggested && (
                        <span style={{ position: "absolute", top: -8, right: 8, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "#16a34a", color: "#fff", letterSpacing: "0.3px" }}>
                          RECOMENDADO
                        </span>
                      )}
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>{dest.label}</p>
                      {matchScore ? (
                        <p style={{ fontSize: 11, color: "#16a34a", margin: 0, fontWeight: 600 }}>
                          ✓ {matchScore.matched}/{matchScore.totalCols} columnas
                        </p>
                      ) : (
                        <p style={{ fontSize: 11, color: "#cbd5e1", margin: 0 }}>Sin coincidencia</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e8edf5" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                {data.length} filas · {columns.length} columnas
              </span>
              <Table size={15} style={{ color: "#94a3b8" }} />
            </div>

            <div style={{ maxHeight: 200, overflow: "auto", borderRadius: 12, border: "1px solid #e8edf5" }}>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0 }}>
                  <tr style={{ background: "#f8fafc" }}>
                    {columns.map((col) => (
                      <th key={col} style={{ textAlign: "left", padding: "7px 10px", color: "#64748b", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", borderBottom: "1px solid #e8edf5" }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 20).map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f4f6fb" }}>
                      {columns.map((col) => (
                        <td key={col} style={{ padding: "6px 10px", color: "#374151", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.length > 20 && (
              <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", margin: 0 }}>
                Mostrando 20 de {data.length} filas
              </p>
            )}

            {/* Botón importar */}
            <button onClick={handleImport} disabled={!selectedDest}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px 16px", borderRadius: 12,
                background: selectedDest ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "#cbd5e1",
                color: "#fff", fontSize: 14, fontWeight: 700, border: "none",
                cursor: selectedDest ? "pointer" : "not-allowed",
                boxShadow: selectedDest ? "0 4px 14px rgba(37,99,235,0.25)" : "none",
              }}>
              <Download size={16} />
              {selected ? `Importar a ${selected.label}` : "Selecciona un destino"}
              {selected && <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
