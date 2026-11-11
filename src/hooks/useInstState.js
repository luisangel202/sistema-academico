/**
 * useInstState — reemplazo de usePersistedState con aislamiento por institución.
 *
 * Funciona igual que usePersistedState pero prefija automáticamente la clave
 * con el institucionId del usuario logueado:
 *
 *   "er_matriculas"  →  "er_inst_1_matriculas"   (usuario de institución 1)
 *   "er_matriculas"  →  "er_inst_2_matriculas"   (usuario de institución 2)
 *   "er_matriculas"  →  "er_inst_global_matriculas" (superadmin)
 *
 * Así cada institución tiene su propio almacenamiento completamente separado.
 *
 * Uso (igual que usePersistedState):
 *   const [data, setData] = useInstState("er_matriculas", []);
 */

import { useAuth } from "../context/AuthContext";
import { usePersistedState } from "./usePersistedState";

export function useInstState(key, initialValue) {
  const { user } = useAuth();
  const instId = user?.institucionId ?? "global";
  // Reemplaza el prefijo "er_" con "er_inst_{id}_"
  const scopedKey = key.replace(/^er_/, `er_inst_${instId}_`);
  return usePersistedState(scopedKey, initialValue);
}
