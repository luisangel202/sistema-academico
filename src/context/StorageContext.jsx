/**
 * StorageContext — Persistencia local universal.
 *
 * Todo dato del sistema se guarda en localStorage bajo la clave
 * "edurural_<instId>_<colección>". Al montar, hidrata desde
 * localStorage si existe; si no, usa los datos iniciales de mockData.
 *
 * Expone un hook useStorage(collection) que devuelve:
 *   [data, setData]  — idéntico a useState pero sincronizado con localStorage.
 *
 * El SuperAdmin tiene acceso a todas las instituciones; el resto
 * de roles solo ven datos de su instituciones (institucionId).
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const StorageContext = createContext(null);

const PREFIX = "edurural";

/** Lee desde localStorage, devuelve null si no existe o está corrupto */
function leerLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Escribe en localStorage de forma segura */
function escribirLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* cuota excedida u otros errores — silencioso */
  }
}

export function StorageProvider({ children }) {
  /**
   * store: { [key]: data }
   * key = "edurural_<instId>_<colección>"
   */
  const [store, setStore] = useState({});

  /**
   * Obtiene o crea el estado de una colección con datos iniciales.
   * @param {string} collection  — nombre de la colección ("usuarios", "materias"…)
   * @param {any}    initialData — datos de mockData usados si no hay nada en LS
   * @param {number|null} instId — id de institución (null = global / superadmin)
   */
  const getCollection = useCallback((collection, initialData = [], instId = null) => {
    const key = `${PREFIX}_${instId ?? "global"}_${collection}`;

    // Ya está cargado en memoria
    if (store[key] !== undefined) return store[key];

    // Intenta desde localStorage
    const cached = leerLS(key);
    if (cached !== null) {
      setStore(prev => ({ ...prev, [key]: cached }));
      return cached;
    }

    // Primera vez: usa initialData y persiste
    escribirLS(key, initialData);
    setStore(prev => ({ ...prev, [key]: initialData }));
    return initialData;
  }, [store]);

  /**
   * Guarda una colección (actualiza memoria + localStorage).
   */
  const setCollection = useCallback((collection, data, instId = null) => {
    const key = `${PREFIX}_${instId ?? "global"}_${collection}`;
    escribirLS(key, data);
    setStore(prev => ({ ...prev, [key]: data }));
  }, []);

  /**
   * Borra una colección (útil para reset / tests).
   */
  const clearCollection = useCallback((collection, instId = null) => {
    const key = `${PREFIX}_${instId ?? "global"}_${collection}`;
    localStorage.removeItem(key);
    setStore(prev => { const next = { ...prev }; delete next[key]; return next; });
  }, []);

  /**
   * Exporta TODOS los datos de una institución como JSON
   * (para backup desde el panel del SuperAdmin).
   */
  const exportarInstitucion = useCallback((instId) => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(`${PREFIX}_${instId}_`));
    const blob = {};
    keys.forEach(k => { try { blob[k] = JSON.parse(localStorage.getItem(k)); } catch {} });
    return JSON.stringify(blob, null, 2);
  }, []);

  /**
   * Importa datos desde un JSON (restaurar backup).
   */
  const importarInstitucion = useCallback((jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      Object.entries(data).forEach(([k, v]) => {
        escribirLS(k, v);
        setStore(prev => ({ ...prev, [k]: v }));
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Tamaño total usado en localStorage (bytes aproximados).
   */
  const usageBytes = useCallback(() => {
    let total = 0;
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(PREFIX)) {
        total += (localStorage.getItem(k) || "").length * 2;
      }
    }
    return total;
  }, []);

  return (
    <StorageContext.Provider value={{
      store,
      getCollection,
      setCollection,
      clearCollection,
      exportarInstitucion,
      importarInstitucion,
      usageBytes,
    }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  return useContext(StorageContext);
}

/**
 * Hook de conveniencia: useStoredState("usuarios", initialData, instId)
 * Funciona igual que useState pero sincroniza con localStorage.
 *
 * @param {string} collection
 * @param {any}    initialData
 * @param {number|null} instId
 */
export function useStoredState(collection, initialData, instId = null) {
  const { getCollection, setCollection } = useStorage();
  const data = getCollection(collection, initialData, instId);

  const setData = useCallback((updater) => {
    const current = data;
    const next = typeof updater === "function" ? updater(current) : updater;
    setCollection(collection, next, instId);
  }, [data, collection, instId, setCollection]);

  return [data, setData];
}
