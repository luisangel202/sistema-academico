import { createContext, useContext, useState, useCallback } from "react";
import { usePersistedState } from "../hooks/usePersistedState";
import { usuarios } from "../data/mockData";

/**
 * Contexto de documentos organizados por usuario (carpetas).
 *
 * Estructura: docs[userId] = [doc1, doc2, ...]
 * Cada documento: { id, nombre, categoria, estado, fechaCarga, fileSize, fileType, dataUrl }
 *
 * Métodos:
 *  - getFolders() → lista de usuarios con su conteo de documentos
 *  - getUserDocuments(userId) → documentos del usuario
 *  - addDocument(userId, doc) → agrega documento a la carpeta del usuario
 *  - removeDocument(userId, docId) → elimina un documento
 *  - removeDocuments(userId, docIds) → elimina varios (bulk)
 */

const DocumentContext = createContext(null);

/* Datos de ejemplo iniciales */
const initialDocs = {
  5: [
    { id: "d1", nombre: "Diploma Licenciatura", categoria: "Formación", estado: "aprobado", fechaCarga: "2025-01-15", fileSize: "2.3 MB", fileType: "pdf", dataUrl: null },
    { id: "d2", nombre: "Carné de salud", categoria: "Salud", estado: "pendiente", fechaCarga: null, fileSize: null, fileType: null, dataUrl: null },
  ],
  9: [
    { id: "d3", nombre: "Registro civil", categoria: "Identificación", estado: "aprobado", fechaCarga: "2025-02-10", fileSize: "1.1 MB", fileType: "pdf", dataUrl: null },
    { id: "d4", nombre: "Carné estudiantil", categoria: "Identificación", estado: "cargado", fechaCarga: "2025-03-05", fileSize: "0.8 MB", fileType: "jpg", dataUrl: null },
    { id: "d5", nombre: "Examen médico", categoria: "Salud", estado: "pendiente", fechaCarga: null, fileSize: null, fileType: null, dataUrl: null },
  ],
  10: [
    { id: "d6", nombre: "Registro civil", categoria: "Identificación", estado: "aprobado", fechaCarga: "2025-02-12", fileSize: "1.0 MB", fileType: "pdf", dataUrl: null },
    { id: "d7", nombre: "Certificado notas P1", categoria: "Académico", estado: "cargado", fechaCarga: "2025-04-01", fileSize: "0.5 MB", fileType: "pdf", dataUrl: null },
  ],
  7: [
    { id: "d8", nombre: "Acta de posesión", categoria: "Administrativo", estado: "aprobado", fechaCarga: "2025-01-20", fileSize: "1.5 MB", fileType: "pdf", dataUrl: null },
    { id: "d9", nombre: "Carné de salud", categoria: "Salud", estado: "vencido", fechaCarga: "2024-06-15", fileSize: "0.9 MB", fileType: "pdf", dataUrl: null },
  ],
  11: [
    { id: "d10", nombre: "Documento del hijo", categoria: "Identificación", estado: "aprobado", fechaCarga: "2025-02-10", fileSize: "1.2 MB", fileType: "pdf", dataUrl: null },
  ],
};

export function DocumentProvider({ children }) {
  const [docs, setDocs] = usePersistedState("er_documentos", initialDocs);

  const getFolders = useCallback(() => {
    return usuarios.map((u) => ({
      ...u,
      docCount: (docs[u.id] || []).length,
    }));
  }, [docs]);

  const getUserDocuments = useCallback(
    (userId) => docs[userId] || [],
    [docs]
  );

  const addDocument = useCallback((userId, doc) => {
    setDocs((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] || []), doc],
    }));
  }, []);

  const removeDocument = useCallback((userId, docId) => {
    setDocs((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).filter((d) => d.id !== docId),
    }));
  }, []);

  const removeDocuments = useCallback((userId, docIds) => {
    const idSet = new Set(docIds);
    setDocs((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).filter((d) => !idSet.has(d.id)),
    }));
  }, []);

  return (
    <DocumentContext.Provider
      value={{ docs, getFolders, getUserDocuments, addDocument, removeDocument, removeDocuments }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  return useContext(DocumentContext);
}
