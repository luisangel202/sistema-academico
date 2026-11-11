import { useState, useEffect, useRef } from "react";

/**
 * usePersistedState — reemplazo de useState que persiste en localStorage.
 *
 * @param {string} key          — clave única en localStorage
 * @param {any}    initialValue — valor inicial si no hay nada guardado
 * @returns [value, setValue]   — igual que useState
 *
 * Notas:
 * - initialValue puede ser un valor o una función () => value
 * - Si localStorage tiene datos, los usa en lugar del initialValue
 * - Cada set sincroniza automáticamente con localStorage
 */
export function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
    } catch {}
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  // Ref para evitar escritura en el primer render (ya se leyó del LS)
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn(`usePersistedState: no se pudo guardar "${key}"`, e);
    }
  }, [key, state]);

  return [state, setState];
}
