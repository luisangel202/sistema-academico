import { useState, useMemo } from "react";
import {
  Save, CheckCircle, XCircle, Clock,
  Users, CheckSquare, FileText, X,
  AlertCircle, ChevronDown, MessageSquare
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { cursos, materias, usuarios } from "../../data/mockData";
import { useData } from "../../context/DataContext";

/* ── Categorías de excusa ─────────────────────────────── */
const TIPOS_EXCUSA = [
  { value: "medica",        label: "Médica / Salud",          color: "#3b82f6" },
  { value: "familiar",      label: "Urgencia familiar",       color: "#8b5cf6" },
  { value: "transporte",    label: "Problemas de transporte", color: "#f59e0b" },
  { value: "clima",         label: "Condiciones climáticas",  color: "#0d9488" },
  { value: "laboral_padre", label: "Obligación laboral del acudiente", color: "#d97706" },
  { value: "academica",     label: "Actividad académica externa", color: "#10b981" },
  { value: "otra",          label: "Otro motivo",             color: "#64748b" },
];

/* ── Configuración de estados ─────────────────────────── */
const ESTADOS = [
  {
    value: "presente",
    label: "Presente",
    icon: CheckCircle,
    bg: "#f0fdf4", border: "#86efac", text: "#16a34a",
    activeBg: "#dcfce7", activeBorder: "#4ade80",
  },
  {
    value: "ausente",
    label: "Ausente",
    icon: XCircle,
    bg: "#fff1f2", border: "#fca5a5", text: "#dc2626",
    activeBg: "#fee2e2", activeBorder: "#f87171",
  },
  {
    value: "tardanza",
    label: "Tardanza",
    icon: Clock,
    bg: "#fffbeb", border: "#fde68a", text: "#d97706",
    activeBg: "#fef3c7", activeBorder: "#fbbf24",
  },
  {
    value: "excusado",
    label: "Excusado",
    icon: FileText,
    bg: "#f0f9ff", border: "#bae6fd", text: "#0284c7",
    activeBg: "#e0f2fe", activeBorder: "#38bdf8",
  },
];

/* ── Modal de excusa ──────────────────────────────────── */
function ModalExcusa({ estudiante, excusaActual, onSave, onClose }) {
  const [tipo,  setTipo]  = useState(excusaActual?.tipo  || "medica");
  const [obs,   setObs]   = useState(excusaActual?.obs   || "");
  const [doc,   setDoc]   = useState(excusaActual?.doc   || false);

  const tipoSel = TIPOS_EXCUSA.find(t => t.value === tipo) || TIPOS_EXCUSA[0];

  if (!estudiante) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(15,23,42,0.55)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460,
        boxShadow: "0 24px 64px rgba(15,23,42,0.22)",
        border: "1px solid #e8edf5",
        overflow: "hidden",
        animation: "scaleIn 200ms ease both",
      }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes scaleIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }`}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: "1px solid #f4f6fb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={17} style={{ color: "#0284c7" }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>Registrar Excusa</p>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0, marginTop: 2 }}>{estudiante.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, background: "#f4f6fb", border: "1px solid #e8edf5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f4f6fb"; e.currentTarget.style.color = "#94a3b8"; }}>
            <X size={14} />
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Tipo de excusa */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 10 }}>
              Tipo de excusa *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {TIPOS_EXCUSA.map(t => (
                <button key={t.value} type="button" onClick={() => setTipo(t.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 12px", borderRadius: 10, cursor: "pointer",
                    border: `1.5px solid ${tipo === t.value ? t.color : "#e8edf5"}`,
                    background: tipo === t.value ? `${t.color}12` : "#f9fafb",
                    transition: "all 150ms", textAlign: "left",
                  }}
                  onMouseEnter={e => { if (tipo !== t.value) e.currentTarget.style.borderColor = "#c7d2fe"; }}
                  onMouseLeave={e => { if (tipo !== t.value) e.currentTarget.style.borderColor = "#e8edf5"; }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: tipo === t.value ? 700 : 500, color: tipo === t.value ? t.color : "#475569" }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Observación */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>
              Observación / Descripción
            </label>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              rows={3}
              placeholder={`Describe el motivo de la inasistencia de ${estudiante.nombre.split(" ")[0]}...`}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 13px", borderRadius: 12, fontSize: 13,
                border: "1.5px solid #e4eaf3", background: "#f8fafc",
                color: "#0f172a", fontFamily: "inherit", resize: "none",
                outline: "none", transition: "all 180ms",
              }}
              onFocus={e => { e.target.style.borderColor = "#0284c7"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(2,132,199,0.08)"; }}
              onBlur={e => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Documento de soporte */}
          <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, cursor: "pointer", background: doc ? "#f0f9ff" : "#f8fafc", border: `1.5px solid ${doc ? "#bae6fd" : "#e8edf5"}`, transition: "all 150ms" }}>
            <input type="checkbox" checked={doc} onChange={e => setDoc(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#0284c7", cursor: "pointer", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: doc ? "#0284c7" : "#374151", margin: 0 }}>
                Presentó documento de soporte
              </p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, marginTop: 2 }}>
                Fórmula médica, carta del acudiente, etc.
              </p>
            </div>
          </label>

          {/* Info del tipo seleccionado */}
          <div style={{ display: "flex", gap: 10, padding: "10px 13px", borderRadius: 11, background: `${tipoSel.color}10`, border: `1px solid ${tipoSel.color}30` }}>
            <AlertCircle size={14} style={{ color: tipoSel.color, flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: tipoSel.color, margin: 0, lineHeight: 1.6 }}>
              La inasistencia quedará registrada como <strong>{tipoSel.label}</strong>.
              {doc ? " Con soporte documentado." : " Sin documento de soporte."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, padding: "14px 22px", borderTop: "1px solid #f4f6fb" }}>
          <button type="button" onClick={onClose}
            style={{ flex: 1, padding: "10px 16px", borderRadius: 12, background: "#fff", border: "1.5px solid #e8edf5", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
            Cancelar
          </button>
          <button type="button" onClick={() => onSave({ tipo, obs, doc })}
            style={{ flex: 1, padding: "10px 16px", borderRadius: 12, background: "linear-gradient(135deg,#0284c7,#0369a1)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(2,132,199,0.28)", transition: "all 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(2,132,199,0.40)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(2,132,199,0.28)"; }}>
            Guardar excusa
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── COMPONENTE PRINCIPAL ─────────────────────────────── */
export default function Asistencia() {
  const { user } = useAuth();
  const { cursos, materias, usuarios, getAsistenciaKey, setAsistenciaKey } = useData();
  const toast    = useToast();

  const [fecha, setFecha]               = useState(new Date().toISOString().split("T")[0]);
  const [selectedCurso, setSelectedCurso] = useState("");
  const [excusas, setExcusas]           = useState({});
  const [saved, setSaved]               = useState(false);
  const [modalExcusa, setModalExcusa]   = useState(null);

  // Asistencia persistida: key = `${selectedCurso}_${fecha}`
  const asistKey = `${selectedCurso}_${fecha}`;
  const asistenciaState = getAsistenciaKey(asistKey);
  const setAsistenciaState = (updater) => {
    const next = typeof updater === "function" ? updater(asistenciaState) : updater;
    setAsistenciaKey(asistKey, next);
  };

  /* Materias y cursos del docente */
  const misMaterias = materias.filter(m => m.docenteId === user?.id);
  const misCursos   = useMemo(() => {
    const ids = [...new Set(misMaterias.map(m => m.cursoId))];
    return cursos.filter(c => ids.includes(c.id));
  }, [misMaterias]);

  /* Estudiantes del curso seleccionado */
  const estudiantesDelCurso = useMemo(() => {
    if (!selectedCurso) return [];
    return usuarios.filter(u => u.rol === "ESTUDIANTE" && u.cursoId === Number(selectedCurso));
  }, [selectedCurso]);

  /* Inicializar asistencia al cambiar curso */
  useMemo(() => {
    if (estudiantesDelCurso.length > 0) {
      setAsistenciaState(
        estudiantesDelCurso.reduce((acc, e) => ({ ...acc, [e.id]: "presente" }), {})
      );
      setExcusas({});
    }
  }, [estudiantesDelCurso]);

  /* Cambiar estado */
  const setEstado = (id, estado) => {
    setAsistenciaState(prev => ({ ...prev, [id]: estado }));
    /* Si deja de estar excusado, limpiar la excusa */
    if (estado !== "excusado") {
      setExcusas(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
    /* Si marca excusado, abrir modal */
    if (estado === "excusado") {
      const est = estudiantesDelCurso.find(e => e.id === id);
      setModalExcusa(est);
    }
  };

  /* Guardar excusa desde el modal */
  const guardarExcusa = (data) => {
    setExcusas(prev => ({ ...prev, [modalExcusa.id]: data }));
    setModalExcusa(null);
    toast.success(`Excusa registrada para ${modalExcusa.nombre.split(" ")[0]}`);
  };

  /* Contadores */
  const presentes  = Object.values(asistenciaState).filter(v => v === "presente").length;
  const ausentes   = Object.values(asistenciaState).filter(v => v === "ausente").length;
  const tardanzas  = Object.values(asistenciaState).filter(v => v === "tardanza").length;
  const excusados  = Object.values(asistenciaState).filter(v => v === "excusado").length;

  /* Color del avatar según estado */
  const avatarStyle = (estado) => {
    const map = {
      presente: { bg: "#dcfce7", color: "#16a34a" },
      ausente:  { bg: "#fee2e2", color: "#dc2626" },
      tardanza: { bg: "#fef3c7", color: "#d97706" },
      excusado: { bg: "#e0f2fe", color: "#0284c7" },
    };
    return map[estado] || map.presente;
  };

  /* Guardar asistencia */
  const handleSave = () => {
    const sinExcusa = estudiantesDelCurso.filter(e => asistenciaState[e.id] === "excusado" && !excusas[e.id]);
    if (sinExcusa.length > 0) {
      toast.warning(`${sinExcusa.length} estudiante${sinExcusa.length > 1 ? "s" : ""} marcado${sinExcusa.length > 1 ? "s" : ""} como excusado sin registrar el motivo.`);
    }
    setSaved(true);
    toast.success("Asistencia guardada correctamente");
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <ModalExcusa
        estudiante={modalExcusa}
        excusaActual={modalExcusa ? excusas[modalExcusa.id] : null}
        onSave={guardarExcusa}
        onClose={() => setModalExcusa(null)}
      />

      <PageHeader
        title="Registro de Asistencia"
        subtitle={selectedCurso
          ? `${cursos.find(c => c.id === Number(selectedCurso))?.nombre || ""} · ${new Date(fecha + "T12:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}`
          : "Selecciona un curso para tomar asistencia"}
        icon={CheckSquare}
        color="#10b981"
      />

      {/* Barra de filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end", marginBottom: 20, padding: "14px 16px", borderRadius: 16, background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Curso</label>
          <select value={selectedCurso} onChange={e => setSelectedCurso(e.target.value)}
            style={{ padding: "8px 30px 8px 12px", borderRadius: 11, border: "1.5px solid #e4eaf3", background: "#f8fafc", fontSize: 13, color: "#374151", outline: "none", cursor: "pointer", fontFamily: "inherit", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 8px center", backgroundRepeat: "no-repeat", backgroundSize: "14px" }}
            onFocus={e => { e.target.style.borderColor = "#10b981"; e.target.style.background = "#fff"; }}
            onBlur={e => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; }}>
            <option value="">Seleccionar curso...</option>
            {misCursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 11, border: "1.5px solid #e4eaf3", background: "#f8fafc", fontSize: 13, color: "#374151", outline: "none", fontFamily: "inherit" }}
            onFocus={e => { e.target.style.borderColor = "#10b981"; e.target.style.background = "#fff"; }}
            onBlur={e => { e.target.style.borderColor = "#e4eaf3"; e.target.style.background = "#f8fafc"; }}
          />
        </div>

        {/* Contadores */}
        {selectedCurso && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
            {[
              { count: presentes, label: "presentes",  bg: "#f0fdf4", color: "#16a34a", icon: CheckCircle },
              { count: ausentes,  label: "ausentes",   bg: "#fff1f2", color: "#dc2626", icon: XCircle     },
              { count: tardanzas, label: "tardanzas",  bg: "#fffbeb", color: "#d97706", icon: Clock       },
              { count: excusados, label: "excusados",  bg: "#e0f2fe", color: "#0284c7", icon: FileText    },
            ].map(({ count, label, bg, color, icon: Icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: bg, fontSize: 13, fontWeight: 600, color }}>
                <Icon size={13} /> {count} {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sin curso seleccionado */}
      {!selectedCurso ? (
        <div style={{ padding: "48px 24px", textAlign: "center", borderRadius: 18, background: "#f0f9ff", border: "1.5px solid #bae6fd" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Users size={26} style={{ color: "#0284c7" }} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0369a1", margin: "0 0 8px" }}>Selecciona un curso</h3>
          <p style={{ fontSize: 14, color: "#0284c7", margin: "0 0 8px" }}>Para tomar asistencia, primero selecciona uno de tus cursos asignados.</p>
          <p style={{ fontSize: 12, color: "#7dd3fc", margin: 0 }}>
            {misCursos.length} curso(s) disponible(s): {misCursos.map(c => c.nombre).join(", ")}
          </p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)", overflow: "hidden" }}>

          {/* Cabecera tabla */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #f0f4fa" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Estudiante</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" }}>Estado</span>
          </div>

          {/* Filas */}
          {estudiantesDelCurso.map((est, idx) => {
            const estadoActual = asistenciaState[est.id] || "presente";
            const av           = avatarStyle(estadoActual);
            const excusa       = excusas[est.id];

            return (
              <div key={est.id} style={{
                padding: "12px 20px",
                borderBottom: idx < estudiantesDelCurso.length - 1 ? "1px solid #f4f6fb" : "none",
                transition: "background 150ms",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                {/* Avatar + nombre */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, transition: "all 200ms" }}>
                    {est.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {est.nombre}
                    </p>
                    {/* Detalles de excusa si existe */}
                    {excusa && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 600 }}>
                          {TIPOS_EXCUSA.find(t => t.value === excusa.tipo)?.label}
                        </span>
                        {excusa.doc && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#e0f2fe", color: "#0284c7" }}>
                            Con soporte
                          </span>
                        )}
                        <button onClick={() => setModalExcusa(est)}
                          style={{ fontSize: 11, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                          editar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de estado */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {ESTADOS.map(e => {
                    const isActive = estadoActual === e.value;
                    return (
                      <button key={e.value} onClick={() => setEstado(est.id, e.value)}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "6px 12px", borderRadius: 10,
                          fontSize: 12, fontWeight: isActive ? 700 : 500,
                          cursor: "pointer", transition: "all 150ms",
                          border: `1.5px solid ${isActive ? e.activeBorder : "#e8edf5"}`,
                          background: isActive ? e.activeBg : "#f8fafc",
                          color: isActive ? e.text : "#94a3b8",
                          boxShadow: isActive ? `0 2px 8px ${e.activeBorder}60` : "none",
                        }}
                        onMouseEnter={e2 => { if (!isActive) { e2.currentTarget.style.borderColor = e.border; e2.currentTarget.style.background = e.bg; e2.currentTarget.style.color = e.text; } }}
                        onMouseLeave={e2 => { if (!isActive) { e2.currentTarget.style.borderColor = "#e8edf5"; e2.currentTarget.style.background = "#f8fafc"; e2.currentTarget.style.color = "#94a3b8"; } }}>
                        <e.icon size={13} />
                        {e.label}
                        {/* Indicador de excusa registrada */}
                        {e.value === "excusado" && excusa && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0284c7", flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botón guardar */}
      {selectedCurso && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={handleSave}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 24px", borderRadius: 12,
              fontSize: 14, fontWeight: 700, color: "#fff", border: "none", cursor: "pointer",
              background: saved
                ? "linear-gradient(135deg,#22c55e,#16a34a)"
                : "linear-gradient(135deg,#10b981,#059669)",
              boxShadow: saved
                ? "0 4px 14px rgba(34,197,94,0.30)"
                : "0 4px 14px rgba(16,185,129,0.28)",
              transition: "all 200ms",
            }}>
            <Save size={15} />
            {saved ? "¡Asistencia guardada!" : "Guardar asistencia"}
          </button>
        </div>
      )}

      {/* Leyenda */}
      {selectedCurso && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12, padding: "12px 16px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e8edf5" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", margin: 0, alignSelf: "center" }}>Leyenda:</p>
          {ESTADOS.map(e => (
            <div key={e.value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: e.activeBorder }} />
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{e.label}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginLeft: "auto", alignSelf: "center" }}>
            <MessageSquare size={11} style={{ display: "inline", marginRight: 4 }} />
            Al marcar <strong>Excusado</strong> se registra automáticamente el motivo
          </p>
        </div>
      )}
    </div>
  );
}
