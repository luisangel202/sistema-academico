import { createContext, useContext, useState, useCallback } from "react";

/**
 * Contexto para pasar datos importados entre el SmartImport global
 * y el módulo de destino.
 *
 * Flujo:
 *  1. SmartImport parsea datos → detecta destino → sendToModule(id, data)
 *  2. Navega a la ruta del módulo
 *  3. El módulo monta → revisa pendingImport → si coincide, procesa → consumePending()
 */

const ImportContext = createContext(null);

export function ImportProvider({ children }) {
  const [pendingImport, setPendingImport] = useState(null);

  /* Enviar datos a un módulo destino */
  const sendToModule = useCallback((destinationId, data) => {
    setPendingImport({ destinationId, data, timestamp: Date.now() });
  }, []);

  /* El módulo destino consume los datos pendientes */
  const consumePending = useCallback(() => {
    const pending = pendingImport;
    setPendingImport(null);
    return pending;
  }, [pendingImport]);

  return (
    <ImportContext.Provider value={{ pendingImport, sendToModule, consumePending }}>
      {children}
    </ImportContext.Provider>
  );
}

export function useImportContext() {
  return useContext(ImportContext);
}
