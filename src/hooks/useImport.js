import * as XLSX from "xlsx";

/**
 * Hook universal para importar/extraer datos.
 *
 * Fuentes soportadas:
 *  - Archivo: CSV, Excel (.xlsx/.xls), JSON, TXT
 *  - URL: link directo a CSV/JSON, o Google Sheets
 *  - Texto pegado: auto-detecta CSV o JSON
 *
 * Retorna siempre un array de objetos { columna: valor }.
 */
export function useImport() {
  /* ── Parsear archivo ────────────────────────────────── */
  const parseFile = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "json") {
      const text = await file.text();
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [data];
    }

    if (ext === "csv" || ext === "txt") {
      const text = await file.text();
      return parseCSV(text);
    }

    /* Excel (.xlsx, .xls) */
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  };

  /* ── Parsear desde URL ──────────────────────────────── */
  const parseUrl = async (url) => {
    let fetchUrl = url.trim();

    /* Google Sheets → CSV export */
    if (fetchUrl.includes("docs.google.com/spreadsheets")) {
      const idMatch = fetchUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const gidMatch = fetchUrl.match(/[#&?]gid=(\d+)/);
      if (idMatch) {
        const id = idMatch[1];
        const gid = gidMatch ? gidMatch[1] : "0";
        fetchUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
      }
    }

    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error(`No se pudo acceder al enlace (HTTP ${res.status})`);

    const text = await res.text();

    /* Auto-detectar formato */
    const trimmed = text.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      const data = JSON.parse(trimmed);
      return Array.isArray(data) ? data : [data];
    }

    return parseCSV(text);
  };

  /* ── Parsear texto pegado ───────────────────────────── */
  const parseText = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      const data = JSON.parse(trimmed);
      return Array.isArray(data) ? data : [data];
    }

    return parseCSV(trimmed);
  };

  return { parseFile, parseUrl, parseText };
}

/* ════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════ */

/** Parsea texto CSV a array de objetos */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  /* Detectar delimitador: tab > punto y coma > coma */
  const sample = lines[0];
  const delimiter = sample.includes("\t")
    ? "\t"
    : sample.includes(";")
      ? ";"
      : ",";

  const headers = splitLine(lines[0], delimiter);

  return lines.slice(1).map((line) => {
    const values = splitLine(line, delimiter);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] || "").trim();
    });
    return obj;
  });
}

/** Divide una línea CSV respetando comillas */
function splitLine(line, delimiter) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
