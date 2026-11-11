/**
 * DataContext — Fuente de verdad central aislada por institución.
 *
 * CLAVE: cada colección se guarda bajo la clave
 *   "er_inst_{institucionId}_{colección}"
 * así cada institución tiene sus propios datos completamente separados.
 *
 * El SuperAdmin (institucionId === null) ve todas las instituciones
 * pero no mezcla datos con ninguna de ellas.
 */

import { createContext, useContext, useCallback, useMemo } from "react";
import { usePersistedState } from "../hooks/usePersistedState";
import { useAuth } from "./AuthContext";
import {
  usuarios as mockUsuarios,
  cursos    as mockCursos,
  materias  as mockMaterias,
  periodos  as mockPeriodos,
} from "../data/mockData";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();

  /* ── ID de la institución activa ──────────────────
     SuperAdmin: null  →  usa prefijo "global"
     Cualquier otro rol: su institucionId
  ─────────────────────────────────────────────────── */
  const instId = user?.institucionId ?? "global";

  /* ── Datos iniciales filtrados por institución ───
     La primera vez que un usuario de una institución
     abre la app, se cargan solo los datos de mockData
     que pertenecen a su institución.
  ─────────────────────────────────────────────────── */
  const usuariosIniciales = useMemo(() =>
    instId === "global"
      ? mockUsuarios
      : mockUsuarios.filter(u => u.institucionId === instId || u.institucionId === null),
    [instId]
  );

  const cursosIniciales = useMemo(() =>
    instId === "global"
      ? mockCursos
      : mockCursos.filter(c => c.institucionId === instId),
    [instId]
  );

  const materiasIniciales = useMemo(() =>
    instId === "global"
      ? mockMaterias
      : mockMaterias.filter(m => {
          const cursoDeInstitucion = mockCursos.some(c => c.id === m.cursoId && c.institucionId === instId);
          return cursoDeInstitucion;
        }),
    [instId]
  );

  const periodosIniciales = useMemo(() =>
    instId === "global"
      ? mockPeriodos
      : mockPeriodos.filter(p => p.institucionId === instId || !p.institucionId),
    [instId]
  );

  /* ── Claves únicas por institución ───────────────── */
  const K = useCallback((col) => `er_inst_${instId}_${col}`, [instId]);

  /* ── Colecciones persistidas por institución ─────── */
  const [usuarios,   setUsuarios]   = usePersistedState(K("usuarios"),   usuariosIniciales);
  const [cursos,     setCursos]     = usePersistedState(K("cursos"),     cursosIniciales);
  const [materias,   setMaterias]   = usePersistedState(K("materias"),   materiasIniciales);
  const [periodos,   setPeriodos]   = usePersistedState(K("periodos"),   periodosIniciales);
  const [notas,      setNotas]      = usePersistedState(K("notas"),      {});
  const [asistencia, setAsistencia] = usePersistedState(K("asistencia"), {});

  /* ── Helpers de usuarios ─────────────────────────── */
  const agregarUsuario = useCallback((nuevoUsuario) => {
    setUsuarios(prev => {
      if (prev.some(u => u.id === nuevoUsuario.id)) return prev;
      return [...prev, { ...nuevoUsuario, institucionId: instId === "global" ? nuevoUsuario.institucionId : instId }];
    });
  }, [setUsuarios, instId]);

  const actualizarUsuario = useCallback((id, cambios) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...cambios } : u));
  }, [setUsuarios]);

  const eliminarUsuarios = useCallback((ids) => {
    const set = new Set(ids);
    setUsuarios(prev => prev.filter(u => !set.has(u.id)));
  }, [setUsuarios]);

  /* ── Helpers de notas ────────────────────────────── */
  const setNotasMateriaId = useCallback((materiaId, actividades) => {
    setNotas(prev => ({ ...prev, [materiaId]: actividades }));
  }, [setNotas]);

  const getNotasMateriaId = useCallback((materiaId) => {
    return notas[materiaId] || [];
  }, [notas]);

  /* ── Helpers de asistencia ───────────────────────── */
  const setAsistenciaKey = useCallback((key, registro) => {
    setAsistencia(prev => ({ ...prev, [key]: registro }));
  }, [setAsistencia]);

  const getAsistenciaKey = useCallback((key) => {
    return asistencia[key] || {};
  }, [asistencia]);

  /* ── Período activo ──────────────────────────────── */
  const periodoActivo = periodos.find(p => p.estado === "activo")
    || periodos[periodos.length - 1]
    || null;

  /* ── Helpers de consulta ─────────────────────────── */
  const getMateriasByDocente = useCallback((docenteId) =>
    materias.filter(m => m.docenteId === docenteId),
    [materias]
  );

  const getEstudiantesByCurso = useCallback((cursoId) =>
    usuarios.filter(u => u.rol === "ESTUDIANTE" && u.cursoId === cursoId),
    [usuarios]
  );

  const getCursosDocente = useCallback((docenteId) => {
    const ids = new Set(materias.filter(m => m.docenteId === docenteId).map(m => m.cursoId));
    return cursos.filter(c => ids.has(c.id));
  }, [materias, cursos]);

  const getGrupoDirector = useCallback((directorId) => {
    const curso = cursos.find(c => c.directorId === directorId);
    if (!curso) return { curso: null, estudiantes: [] };
    const estudiantes = usuarios.filter(u => u.rol === "ESTUDIANTE" && u.cursoId === curso.id);
    return { curso, estudiantes };
  }, [cursos, usuarios]);

  /* ── Métricas de la institución activa ───────────── */
  const getMetricas = useCallback(() => ({
    totalEstudiantes : usuarios.filter(u => u.rol === "ESTUDIANTE").length,
    totalDocentes    : usuarios.filter(u => ["DOCENTE","DIRECTOR_GRUPO"].includes(u.rol)).length,
    totalCursos      : cursos.length,
    totalMaterias    : materias.length,
  }), [usuarios, cursos, materias]);

  return (
    <DataContext.Provider value={{
      instId,
      /* Colecciones */
      usuarios,   setUsuarios,
      cursos,     setCursos,
      materias,   setMaterias,
      periodos,   setPeriodos,
      notas,      asistencia,
      /* Helpers usuarios */
      agregarUsuario, actualizarUsuario, eliminarUsuarios,
      /* Helpers notas */
      setNotasMateriaId, getNotasMateriaId,
      /* Helpers asistencia */
      setAsistenciaKey, getAsistenciaKey,
      /* Helpers consulta */
      periodoActivo,
      getMateriasByDocente,
      getEstudiantesByCurso,
      getCursosDocente,
      getGrupoDirector,
      getMetricas,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
