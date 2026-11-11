import { useState, useMemo, useEffect } from "react";
import { Save, AlertCircle, Plus, Search, Trash2, X, Users, Star } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import ModuleLayout, {
  FilterSelect, FilterInput,
  FormField, FormInput, FormSelect,
  ModalActions,
} from "../../components/ModuleLayout";
import { useToast } from "../../components/Toast";
import { useImportContext } from "../../context/ImportContext";
import { useData } from "../../context/DataContext";

const CATEGORIAS = [
  { value: "examen",       label: "Examen",       color: "#ef4444", bg: "#fff1f2" },
  { value: "taller",       label: "Taller",        color: "#3b82f6", bg: "#eff6ff" },
  { value: "exposicion",   label: "Exposición",    color: "#8b5cf6", bg: "#faf5ff" },
  { value: "quiz",         label: "Quiz",          color: "#f97316", bg: "#fff7ed" },
  { value: "proyecto",     label: "Proyecto",      color: "#22c55e", bg: "#f0fdf4" },
  { value: "tarea",        label: "Tarea",         color: "#eab308", bg: "#fefce8" },
  { value: "participacion",label: "Participación", color: "#14b8a6", bg: "#f0fdfa" },
  { value: "otro",         label: "Otro",          color: "#94a3b8", bg: "#f8fafc" },
];

const NOTAS_INI = [
  { id: 1, nombre: "Examen parcial 1", categoria: "examen",  peso: 35, notas: { 9: "4.5", 10: "3.0", 12: "3.5", 13: "4.3", 14: "3.1" } },
  { id: 2, nombre: "Taller álgebra",   categoria: "taller",  peso: 20, notas: { 9: "3.8", 10: "3.2", 12: "4.0", 13: "4.5", 14: "3.8" } },
  { id: 3, nombre: "Quiz capítulo 3",  categoria: "quiz",    peso: 15, notas: { 9: "4.2", 10: "2.8", 12: "3.9", 13: "4.0", 14: "3.5" } },
];

function calcProm(acts, estId) {
  const pesoUsado = acts.reduce((s, a) => {
    const v = parseFloat(a.notas[estId]);
    return isNaN(v) ? s : s + a.peso;
  }, 0);
  if (!pesoUsado) return null;
  const suma = acts.reduce((s, a) => {
    const v = parseFloat(a.notas[estId]);
    return isNaN(v) ? s : s + v * a.peso;
  }, 0);
  return (suma / pesoUsado).toFixed(1);
}

function getCat(value) {
  return CATEGORIAS.find(c => c.value === value) || CATEGORIAS[CATEGORIAS.length - 1];
}

export default function Notas() {
  const { user } = useAuth();
  const toast = useToast();
  const { pendingImport, consumePending } = useImportContext();
  const { materias, cursos, periodos, usuarios, getNotasMateriaId, setNotasMateriaId } = useData();

  const handleImport = (rows) => {
    const estMap = new Map();
    estudiantesDelCurso.forEach(e => estMap.set(e.nombre.toLowerCase(), e.id));
    const newAct = {
      id: Date.now(),
      nombre: `Importado ${new Date().toLocaleDateString()}`,
      categoria: "otro",
      peso: 20,
      notas: {},
    };
    let count = 0;
    rows.forEach((row) => {
      const nombreEst = (row.estudiante || row.Estudiante || row.nombre || row.Nombre || "").toLowerCase();
      const nota = row.nota || row.Nota || row.calificacion || "";
      const estId = estMap.get(nombreEst);
      if (estId && nota) {
        newAct.notas[estId] = String(nota);
        count++;
      }
    });
    if (count > 0) {
      setActividades(prev => [...prev, newAct]);
      toast.success(`${count} nota(s) importada(s) en nueva actividad`);
    } else {
      toast.error("No se encontraron estudiantes del curso actual en los datos");
    }
  };

  useEffect(() => {
    if (pendingImport?.destinationId === "notas") {
      handleImport(pendingImport.data);
      consumePending();
    }
  }, [pendingImport]);
  const [selectedMateria, setSelectedMateria] = useState(() => {
    const primera = materias.find(m => m.docenteId === user?.id);
    return primera?.id || 1;
  });
  const [selectedPeriodo, setSelectedPeriodo] = useState(2);
  const [saved, setSaved]                     = useState(false);
  const [searchEst, setSearchEst]             = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado]       = useState("");
  const [showModal, setShowModal]             = useState(false);
  const [form, setForm]                       = useState({ nombre: "", categoria: "examen", peso: 20 });

  // Notas persistidas por materia en DataContext
  const actividades = getNotasMateriaId(selectedMateria).length > 0
    ? getNotasMateriaId(selectedMateria)
    : NOTAS_INI;
  const setActividades = (updater) => {
    const next = typeof updater === "function" ? updater(actividades) : updater;
    setNotasMateriaId(selectedMateria, next);
  };

  const misMaterias = materias.filter(m => m.docenteId === user?.id);
  const periodoActual  = periodos.find(p => p.id === selectedPeriodo);
  const periodoCerrado = periodoActual?.estado === "cerrado";
  const materiaActual  = materias.find(m => m.id === selectedMateria);
  const cursoActual    = cursos.find(c => c.id === materiaActual?.cursoId);

  const estudiantesDelCurso = useMemo(() => {
    if (!materiaActual) return [];
    return usuarios
      .filter(u => u.rol === "ESTUDIANTE" && u.cursoId === materiaActual.cursoId)
      .map(u => ({ id: u.id, nombre: u.nombre, avatar: u.avatar }));
  }, [materiaActual]);

  const estudiantesFiltrados = useMemo(() => {
    return estudiantesDelCurso.filter(est => {
      if (searchEst && !est.nombre.toLowerCase().includes(searchEst.toLowerCase())) return false;
      if (filtroEstado) {
        const p = calcProm(actividades, est.id);
        if (!p) return false;
        const aprobado = parseFloat(p) >= 3.0;
        if (filtroEstado === "aprobado" && !aprobado) return false;
        if (filtroEstado === "reprobado" && aprobado) return false;
      }
      return true;
    });
  }, [searchEst, filtroEstado, actividades, estudiantesDelCurso]);

  const actividadesFiltradas = useMemo(() =>
    filtroCategoria ? actividades.filter(a => a.categoria === filtroCategoria) : actividades,
    [actividades, filtroCategoria]
  );

  const pesoTotal = actividades.reduce((s, a) => s + Number(a.peso), 0);

  const updateNota = (actId, estId, val) => {
    if (periodoCerrado) return;
    const n = parseFloat(val);
    if (val !== "" && (isNaN(n) || n < 0 || n > 5)) return;
    setActividades(prev => prev.map(a => a.id === actId ? { ...a, notas: { ...a.notas, [estId]: val } } : a));
  };

  const agregarActividad = (e) => {
    e.preventDefault();
    setActividades(prev => [...prev, { id: Date.now(), ...form, peso: Number(form.peso), notas: {} }]);
    setShowModal(false);
    setForm({ nombre: "", categoria: "examen", peso: 20 });
  };

  return (
    <ModuleLayout
      header={
        <PageHeader
          title="Registro de Notas"
          subtitle={cursoActual
            ? `${materiaActual?.nombre} · ${cursoActual.nombre} · ${periodoActual?.nombre || ""}`
            : "Selecciona una materia para comenzar"}
          icon={Star} color="#f59e0b"
          action={!periodoCerrado && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              <Plus size={14} /> Actividad
            </button>
          )}
        />
      }
      filters={<>
        {/* Selector de materia */}
        <FilterSelect value={selectedMateria} onChange={v => { setSelectedMateria(Number(v)); setSearchEst(""); setFiltroCategoria(""); setFiltroEstado(""); }}>
          {misMaterias.map(m => {
            const c = cursos.find(c => c.id === m.cursoId);
            return <option key={m.id} value={m.id}>{m.nombre}{c ? ` — ${c.nombre}` : ""}</option>;
          })}
        </FilterSelect>

        <FilterSelect value={selectedPeriodo} onChange={v => setSelectedPeriodo(Number(v))}>
          {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </FilterSelect>

        <Badge label={periodoActual?.estado || ""} variant={periodoActual?.estado || "info"} dot />

        <div className="w-px h-5 flex-shrink-0" style={{ background: "#e8edf5" }} />

        <FilterInput value={searchEst} onChange={setSearchEst} placeholder="Buscar estudiante..." icon={Search} />

        <FilterSelect value={filtroCategoria} onChange={setFiltroCategoria}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </FilterSelect>

        <FilterSelect value={filtroEstado} onChange={setFiltroEstado}>
          <option value="">Todos</option>
          <option value="aprobado">Aprobados</option>
          <option value="reprobado">Reprobados</option>
        </FilterSelect>

        {(searchEst || filtroCategoria || filtroEstado) && (
          <button onClick={() => { setSearchEst(""); setFiltroCategoria(""); setFiltroEstado(""); }}
            className="flex items-center gap-1 text-xs font-semibold rounded-lg px-2.5 py-1.5 border-0 cursor-pointer transition-all"
            style={{ background: "#f1f5f9", color: "#64748b" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; }}>
            <X size={12} /> Limpiar
          </button>
        )}
      </>}
      count={`${actividadesFiltradas.length} actividad(es) · ${estudiantesFiltrados.length} estudiante(s)`}
      toolbar={
        <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
          pesoTotal === 100 ? "bg-green-50 text-green-700" :
          pesoTotal > 100  ? "bg-red-50 text-red-600"    :
          "bg-amber-50 text-amber-700"
        }`}>
          Peso: {pesoTotal}% {pesoTotal === 100 ? "✓" : pesoTotal > 100 ? "— excede" : `— faltan ${100 - pesoTotal}%`}
        </div>
      }
    >
      {/* Aviso período cerrado */}
      {periodoCerrado && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
          <AlertCircle size={15} className="flex-shrink-0" />
          Período cerrado. Para modificar notas solicita un cambio al coordinador.
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <div className="overflow-x-auto">
          <table style={{ minWidth: `${280 + actividadesFiltradas.length * 120}px`, width: "100%" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f0f4fa" }}>
                {/* Nombre — sticky */}
                <th className="sticky left-0 z-10 text-left"
                  style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", background: "#f8fafc", minWidth: 180 }}>
                  Estudiante
                </th>

                {/* Actividades */}
                {actividadesFiltradas.map(act => {
                  const cat = getCat(act.categoria);
                  return (
                    <th key={act.id} style={{ padding: "8px 12px", minWidth: 110, textAlign: "center", background: "#f8fafc" }}>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold truncate max-w-[84px]"
                            style={{ color: "#374151" }} title={act.nombre}>
                            {act.nombre}
                          </span>
                          {!periodoCerrado && (
                            <button onClick={() => setActividades(prev => prev.filter(a => a.id !== act.id))}
                              className="border-0 bg-transparent cursor-pointer p-0.5 transition-all"
                              style={{ color: "#cbd5e1" }}
                              onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = "#cbd5e1"; }}>
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: cat.bg, color: cat.color }}>
                            {cat.label}
                          </span>
                          <span className="text-[10px] font-bold" style={{ color: "#94a3b8" }}>{act.peso}%</span>
                        </div>
                      </div>
                    </th>
                  );
                })}

                <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", background: "#f8fafc", minWidth: 80 }}>
                  Promedio
                </th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", background: "#f8fafc", minWidth: 90 }}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.map((est, idx) => {
                const prom      = calcProm(actividadesFiltradas.length ? actividadesFiltradas : actividades, est.id);
                const promNum   = parseFloat(prom);
                const aprobado  = promNum >= 3.0;
                const promColor = !prom ? "#cbd5e1" : promNum >= 3.5 ? "#16a34a" : promNum >= 3.0 ? "#d97706" : "#ef4444";

                return (
                  <tr key={est.id}
                    style={{ borderBottom: idx < estudiantesFiltrados.length - 1 ? "1px solid #f8fafc" : "none" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f8faff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>

                    {/* Nombre sticky */}
                    <td className="sticky left-0 z-10" style={{ padding: "10px 16px", background: "inherit" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", color: "#2563eb" }}>
                          {est.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "#1e293b" }}>
                          {est.nombre}
                        </span>
                      </div>
                    </td>

                    {/* Inputs de nota */}
                    {actividadesFiltradas.map(act => (
                      <td key={act.id} style={{ padding: "8px 10px", textAlign: "center" }}>
                        <input
                          type="number" min="0" max="5" step="0.1"
                          value={act.notas[est.id] ?? ""}
                          onChange={e => updateNota(act.id, est.id, e.target.value)}
                          disabled={periodoCerrado}
                          placeholder="—"
                          className="text-center text-sm font-semibold outline-none transition-all rounded-lg"
                          style={{
                            width: 56, padding: "5px 4px",
                            background: "#f8fafc", border: "1.5px solid #e4eaf3",
                            color: "#1e293b",
                          }}
                          onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
                          onBlur={e => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
                        />
                      </td>
                    ))}

                    {/* Promedio */}
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <span className="text-base font-black" style={{ color: promColor }}>
                        {prom ?? "—"}
                      </span>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      {prom && <Badge label={aprobado ? "Aprobado" : "Reprobado"} variant={aprobado ? "success" : "danger"} dot />}
                    </td>
                  </tr>
                );
              })}

              {estudiantesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={actividadesFiltradas.length + 3} style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                    {estudiantesDelCurso.length === 0
                      ? `No hay estudiantes en ${cursoActual?.nombre || "este curso"}`
                      : "No coincide ningún estudiante con los filtros"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón guardar */}
      {!periodoCerrado && (
        <div className="flex justify-end">
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all"
            style={{
              background: saved ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#2563eb,#1d4ed8)",
              boxShadow: saved ? "0 4px 14px rgba(34,197,94,0.25)" : "0 4px 14px rgba(37,99,235,0.25)",
            }}>
            <Save size={14} />
            {saved ? "¡Guardado!" : "Guardar notas"}
          </button>
        </div>
      )}

      {/* Modal nueva actividad */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva Actividad" size="sm">
        <form onSubmit={agregarActividad} className="space-y-4">
          <FormField label="Nombre" required>
            <FormInput required value={form.nombre} placeholder="Ej: Examen parcial 2"
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
          </FormField>

          <FormField label="Categoría">
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS.map(cat => (
                <button key={cat.value} type="button"
                  onClick={() => setForm(p => ({ ...p, categoria: cat.value }))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border-2 cursor-pointer transition-all text-left"
                  style={{
                    borderColor: form.categoria === cat.value ? cat.color : "#e8edf5",
                    background:  form.categoria === cat.value ? cat.bg    : "#fff",
                    color:       form.categoria === cat.value ? cat.color : "#64748b",
                  }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  {cat.label}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Peso en nota final (%)">
            <div className="flex items-center gap-3">
              <FormInput type="number" required min="1" max="100" value={form.peso}
                onChange={e => setForm(p => ({ ...p, peso: e.target.value }))}
                style={{ width: 80 }} />
              <div className="flex-1">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(Number(form.peso), 100)}%`,
                      background: pesoTotal + Number(form.peso) > 100 ? "#ef4444" : "#3b82f6",
                    }} />
                </div>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                  Disponible: {Math.max(0, 100 - pesoTotal)}%
                </p>
              </div>
            </div>
          </FormField>

          <ModalActions onCancel={() => setShowModal(false)} submitLabel="Agregar actividad" />
        </form>
      </Modal>
    </ModuleLayout>
  );
}
