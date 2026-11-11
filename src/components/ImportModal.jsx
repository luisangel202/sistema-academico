import { useState, useRef, useCallback } from "react";
import {
  Upload, Link2, FileText, FileSpreadsheet, CheckCircle,
  AlertCircle, X, Table, Download,
} from "lucide-react";
import Modal from "./Modal";
import { useToast } from "./Toast";
import { useImport } from "../hooks/useImport";

/**
 * Modal universal para importar/extraer datos.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onImport: (data: object[]) => void   ← recibe las filas parseadas
 *  - title: string                         ← título del modal
 *  - itemLabel: string                     ← "estudiante", "usuario", etc.
 *  - hint: string                          ← texto guía (opcional, columnas esperadas)
 */
export default function ImportModal({
  open,
  onClose,
  onImport,
  title = "Importar Datos",
  itemLabel = "registro",
  hint = "",
}) {
  const toast = useToast();
  const { parseFile, parseUrl, parseText } = useImport();

  const [tab, setTab] = useState("file"); // file | url | text
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const fileRef = useRef(null);

  /* ── Reset al cerrar ────────────────────────────────── */
  const handleClose = () => {
    setData([]);
    setError("");
    setUrlValue("");
    setTextValue("");
    setLoading(false);
    onClose();
  };

  /* ── Procesar resultado ──────────────────────────────── */
  const handleResult = (result) => {
    if (!Array.isArray(result) || result.length === 0) {
      setError("No se encontraron datos para importar");
      setData([]);
      return;
    }
    setError("");
    setData(result);
  };

  /* ── Manejar archivo ────────────────────────────────── */
  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setLoading(true);
      setError("");
      try {
        const result = await parseFile(file);
        handleResult(result);
        toast.success(`${result.length} ${itemLabel}${result.length !== 1 ? "s" : ""} detectado${result.length !== 1 ? "s" : ""}`);
      } catch (err) {
        setError(err.message || "Error al leer el archivo");
        toast.error("No se pudo leer el archivo");
      } finally {
        setLoading(false);
      }
    },
    [parseFile, toast, itemLabel]
  );

  /* ── Manejar URL ─────────────────────────────────────── */
  const handleUrl = async () => {
    if (!urlValue.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await parseUrl(urlValue);
      handleResult(result);
      toast.success(`${result.length} ${itemLabel}${result.length !== 1 ? "s" : ""} detectado${result.length !== 1 ? "s" : ""}`);
    } catch (err) {
      setError(err.message || "No se pudo acceder al enlace. Verifica que sea público.");
      toast.error("Error al importar desde el enlace");
    } finally {
      setLoading(false);
    }
  };

  /* ── Manejar texto pegado ────────────────────────────── */
  const handleText = () => {
    if (!textValue.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = parseText(textValue);
      handleResult(result);
      toast.success(`${result.length} ${itemLabel}${result.length !== 1 ? "s" : ""} detectado${result.length !== 1 ? "s" : ""}`);
    } catch (err) {
      setError(err.message || "Error al parsear el texto");
    } finally {
      setLoading(false);
    }
  };

  /* ── Confirmar importación ───────────────────────────── */
  const handleImport = () => {
    onImport(data);
    handleClose();
    toast.success(`${data.length} ${itemLabel}${data.length !== 1 ? "s" : ""} importado${data.length !== 1 ? "s" : ""}`);
  };

  /* ── Auto-parse texto al escribir ───────────────────── */
  const onTextChange = (val) => {
    setTextValue(val);
    if (val.trim().length > 20) {
      try {
        const result = parseText(val);
        if (result.length > 0) {
          setError("");
          setData(result);
        }
      } catch {
        /* ignore parse errors while typing */
      }
    }
  };

  /* ── Drag & drop handlers ───────────────────────────── */
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Modal open={open} onClose={handleClose} title={title} size="lg">
      <div className="space-y-4">
        {/* Hint de columnas esperadas */}
        {hint && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 12,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <FileText size={14} style={{ color: "#2563eb", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#1d4ed8", margin: 0, lineHeight: 1.6 }}>{hint}</p>
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, padding: 4, borderRadius: 12, background: "#f1f5f9" }}>
          {[
            { id: "file", label: "Archivo", icon: Upload },
            { id: "url", label: "Enlace", icon: Link2 },
            { id: "text", label: "Pegar texto", icon: FileText },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "9px 12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                transition: "all 200ms",
                background: tab === t.id ? "#fff" : "transparent",
                color: tab === t.id ? "#1e293b" : "#64748b",
                boxShadow: tab === t.id ? "0 1px 3px rgba(15,23,42,0.1)" : "none",
              }}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Archivo ──────────────────────────────────── */}
        {tab === "file" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "#3b82f6" : "#cbd5e1"}`,
              borderRadius: 16,
              padding: "36px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 200ms",
              background: dragOver ? "#eff6ff" : "#f8fafc",
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json,.txt"
              style={{ display: "none" }}
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: "3px solid #dbeafe", borderTopColor: "#3b82f6",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Procesando archivo...</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: "#eff6ff", border: "1px solid #bfdbfe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <Upload size={24} style={{ color: "#2563eb" }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>
                  Arrastra un archivo o haz clic aquí
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                  CSV, Excel (.xlsx), JSON o TXT
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Tab: Enlace ──────────────────────────────────── */}
        {tab === "url" && (
          <div className="space-y-3">
            <div style={{ position: "relative" }}>
              <Link2
                size={15}
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
              />
              <input
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrl()}
                placeholder="https://... o enlace de Google Sheets"
                style={{
                  width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                  borderRadius: 12, border: "1.5px solid #e4eaf3", fontSize: 13,
                  outline: "none", background: "#f8fafc", transition: "all 200ms",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; }}
              />
            </div>
            <button
              onClick={handleUrl}
              disabled={loading || !urlValue.trim()}
              style={{
                width: "100%", padding: "10px 16px", borderRadius: 12,
                background: loading || !urlValue.trim() ? "#cbd5e1" : "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: loading || !urlValue.trim() ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Importando..." : "Importar desde enlace"}
            </button>
            <div
              style={{
                padding: "10px 14px", borderRadius: 10,
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <FileSpreadsheet size={13} style={{ color: "#16a34a", flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: "#15803d", margin: 0, lineHeight: 1.5 }}>
                <strong>Google Sheets:</strong> pega el enlace de edición (compartir como "Cualquiera con el enlace")
              </p>
            </div>
          </div>
        )}

        {/* ── Tab: Pegar texto ──────────────────────────────── */}
        {tab === "text" && (
          <div className="space-y-3">
            <textarea
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              rows={6}
              placeholder={"Pega aquí datos en formato CSV o JSON...\n\nej: nombre,documento,curso\nJuan Pérez,12345,6A\nMaría Gómez,67890,7B"}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 12,
                border: "1.5px solid #e4eaf3", fontSize: 12, fontFamily: "monospace",
                outline: "none", background: "#f8fafc", resize: "none",
                transition: "all 200ms", lineHeight: 1.6,
              }}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; }}
            />
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────── */}
        {error && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 12,
              background: "#fef2f2", border: "1px solid #fecaca",
            }}
          >
            <AlertCircle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: "#991b1b", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Preview de datos ──────────────────────────────── */}
        {data.length > 0 && (
          <div className="space-y-3">
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 12,
                background: "#f0fdf4", border: "1px solid #bbf7d0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={15} style={{ color: "#16a34a" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
                  {data.length} {itemLabel}{data.length !== 1 ? "s" : ""} · {columns.length} columna{columns.length !== 1 ? "s" : ""}
                </span>
              </div>
              <Table size={15} style={{ color: "#16a34a" }} />
            </div>

            {/* Tabla preview */}
            <div
              style={{
                maxHeight: 280, overflow: "auto", borderRadius: 12,
                border: "1px solid #e8edf5",
              }}
            >
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0 }}>
                  <tr style={{ background: "#f8fafc" }}>
                    {columns.map((col) => (
                      <th
                        key={col}
                        style={{
                          textAlign: "left", padding: "8px 12px",
                          color: "#64748b", fontWeight: 700, fontSize: 11,
                          textTransform: "uppercase", letterSpacing: "0.5px",
                          whiteSpace: "nowrap", borderBottom: "1px solid #e8edf5",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 50).map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f4f6fb" }}>
                      {columns.map((col) => (
                        <td
                          key={col}
                          style={{
                            padding: "7px 12px", color: "#374151",
                            maxWidth: 180, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}
                        >
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.length > 50 && (
              <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", margin: 0 }}>
                Mostrando 50 de {data.length} filas
              </p>
            )}

            {/* Botón importar */}
            <button
              onClick={handleImport}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "12px 16px", borderRadius: 12,
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(34,197,94,0.25)",
              }}
            >
              <Download size={16} /> Importar {data.length} {itemLabel}{data.length !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
