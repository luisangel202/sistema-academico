import { useState } from 'react';
import { useInstState } from "../../hooks/useInstState";
import {
  Plus, Edit, Trash2, Eye, Clock, Users, CheckCircle, XCircle,
  Sparkles, BookOpen, ChevronRight, ChevronLeft, Save, RotateCcw,
  AlertCircle, Tag,
} from 'lucide-react';
import { cuestionarios as cuestionariosIniciales, preguntas as preguntasIniciales, materias, cursos } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { generarPreguntas, generarTitulo } from '../../utils/generadorPreguntas';

/* ── Pasos del wizard de generación ─────────────────────────────── */
const PASOS = ["Configurar", "Temas", "Revisar preguntas", "Publicar"];

export default function Cuestionarios() {
  const { user } = useAuth();

  const [lista, setLista]           = useInstState("er_cuestionarios", cuestionariosIniciales);
  const [preguntasMap, setPreguntasMap] = useInstState("er_preguntas_map", () => {
    const map = {};
    preguntasIniciales.forEach(p => {
      if (!map[p.cuestionarioId]) map[p.cuestionarioId] = [];
      map[p.cuestionarioId].push(p);
    });
    return map;
  });

  /* Vista principal */
  const [vista, setVista] = useState("lista"); // lista | wizard | verPreguntas
  const [cuestionarioVer, setCuestionarioVer] = useState(null);

  /* Wizard */
  const [paso, setPaso]           = useState(0);
  const [config, setConfig]       = useState({
    titulo: "", descripcion: "", materiaId: "", cursoId: "",
    duracionMinutos: 45, fechaInicio: "", fechaFin: "",
    intentosMaximos: 1, puntajeTotal: 100, mostrarResultados: true,
  });
  const [temaInput, setTemaInput] = useState("");
  const [temas, setTemas]         = useState([]);
  const [cantPreguntas, setCantPreguntas] = useState(5);
  const [generadas, setGeneradas] = useState([]);
  const [editandoIdx, setEditandoIdx] = useState(null);
  const [editPregunta, setEditPregunta] = useState(null);

  const materiasDocente = materias.filter(m => m.docenteId === user.id);
  const cursosDocente   = [...new Set(materiasDocente.map(m => m.cursoId))]
    .map(id => cursos.find(c => c.id === id)).filter(Boolean);

  /* ── Wizard: avanzar / retroceder ──────────────────────────────── */
  const puedeAvanzar = () => {
    if (paso === 0) return config.materiaId && config.cursoId && config.titulo && config.fechaInicio && config.fechaFin;
    if (paso === 1) return temas.length > 0;
    return true;
  };

  const avanzar = () => {
    if (paso === 1) {
      const mat = materiasDocente.find(m => m.id === parseInt(config.materiaId));
      const pregs = generarPreguntas(temas, mat?.nombre || "", cantPreguntas, Math.floor(config.puntajeTotal / cantPreguntas));
      setGeneradas(pregs);
    }
    if (paso < PASOS.length - 1) setPaso(p => p + 1);
  };

  const retroceder = () => { if (paso > 0) setPaso(p => p - 1); };

  /* ── Temas ──────────────────────────────────────────────────────── */
  const agregarTema = () => {
    const t = temaInput.trim();
    if (t && !temas.includes(t)) { setTemas(prev => [...prev, t]); setTemaInput(""); }
  };

  const quitarTema = (t) => setTemas(prev => prev.filter(x => x !== t));

  /* ── Editar pregunta generada ───────────────────────────────────── */
  const abrirEditar = (idx) => {
    setEditandoIdx(idx);
    setEditPregunta(JSON.parse(JSON.stringify(generadas[idx])));
  };

  const guardarEdicion = () => {
    setGeneradas(prev => prev.map((p, i) => i === editandoIdx ? editPregunta : p));
    setEditandoIdx(null);
    setEditPregunta(null);
  };

  const regenerarPregunta = (idx) => {
    const mat = materiasDocente.find(m => m.id === parseInt(config.materiaId));
    const tema = generadas[idx]?.tema || temas[idx % temas.length];
    const nueva = generarPreguntas([tema], mat?.nombre || "", 1, generadas[idx]?.puntaje || 10)[0];
    setGeneradas(prev => prev.map((p, i) => i === idx ? { ...nueva, orden: p.orden } : p));
  };

  const eliminarPregunta = (idx) => {
    setGeneradas(prev => prev.filter((_, i) => i !== idx));
  };

  /* ── Publicar ────────────────────────────────────────────────────── */
  const publicar = () => {
    const nuevo = {
      ...config,
      id: Date.now(),
      materiaId: parseInt(config.materiaId),
      cursoId: parseInt(config.cursoId),
      docenteId: user.id,
      periodoId: 2,
      tipo: "icfes",
      fechaCreacion: new Date().toISOString().split("T")[0],
      estado: "activo",
    };
    const pregs = generadas.map((p, i) => ({ ...p, cuestionarioId: nuevo.id, orden: i + 1 }));
    setLista(prev => [...prev, nuevo]);
    setPreguntasMap(prev => ({ ...prev, [nuevo.id]: pregs }));
    resetWizard();
    setVista("lista");
  };

  const resetWizard = () => {
    setPaso(0);
    setConfig({ titulo: "", descripcion: "", materiaId: "", cursoId: "", duracionMinutos: 45, fechaInicio: "", fechaFin: "", intentosMaximos: 1, puntajeTotal: 100, mostrarResultados: true });
    setTemas([]);
    setTemaInput("");
    setCantPreguntas(5);
    setGeneradas([]);
    setEditandoIdx(null);
    setEditPregunta(null);
  };

  const iniciarWizard = () => { resetWizard(); setVista("wizard"); };

  /* ── Ver preguntas de un cuestionario ──────────────────────────── */
  const abrirVer = (c) => { setCuestionarioVer(c); setVista("verPreguntas"); };

  const eliminarCuestionario = (id) => {
    if (!confirm("¿Eliminar este cuestionario?")) return;
    setLista(prev => prev.filter(c => c.id !== id));
  };

  /* ── Colores de estado ──────────────────────────────────────────── */
  const badgeEstado = (estado) => {
    const map = {
      activo:     { bg: "#dcfce7", color: "#15803d", icon: CheckCircle },
      inactivo:   { bg: "#f1f5f9", color: "#64748b", icon: XCircle },
      programado: { bg: "#dbeafe", color: "#1d4ed8", icon: Clock },
    };
    const { bg, color, icon: Icon } = map[estado] || map.inactivo;
    return (
      <span style={{ background: bg, color, display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
        <Icon size={11} /> {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 hover:bg-white transition";

  /* ════════════════════════════════════════════════════════════════
     VISTA: LISTA
     ════════════════════════════════════════════════════════════════ */
  if (vista === "lista") return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuestionarios ICFES</h1>
          <p className="text-gray-500 text-sm mt-1">Genera cuestionarios automáticamente a partir de los temas vistos</p>
        </div>
        <button onClick={iniciarWizard}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm"
          style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
          <Sparkles size={16} /> Generar con IA
        </button>
      </div>

      {/* Lista */}
      {lista.filter(c => c.docenteId === user.id).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Sparkles size={40} className="mx-auto mb-4 text-blue-300" />
          <p className="font-semibold text-gray-700 mb-1">No tienes cuestionarios aún</p>
          <p className="text-sm text-gray-400 mb-4">Genera tu primer cuestionario a partir de los temas vistos</p>
          <button onClick={iniciarWizard} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer">
            <Plus size={15} /> Crear primer cuestionario
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {lista.filter(c => c.docenteId === user.id).map(c => {
            const mat  = materias.find(m => m.id === c.materiaId);
            const cur  = cursos.find(x => x.id === c.cursoId);
            const nPreg = (preguntasMap[c.id] || []).length;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 mr-4">
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <h3 className="font-bold text-gray-900">{c.titulo}</h3>
                      {badgeEstado(c.estado)}
                    </div>
                    {c.descripcion && <p className="text-sm text-gray-500 mb-2">{c.descripcion}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Users size={14}/>{cur?.nombre}</span>
                      <span className="flex items-center gap-1"><BookOpen size={14}/>{mat?.nombre}</span>
                      <span className="flex items-center gap-1"><Clock size={14}/>{c.duracionMinutos} min</span>
                      <span className="flex items-center gap-1"><AlertCircle size={14}/>{nPreg} preguntas</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => abrirVer(c)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition bg-transparent border-0 cursor-pointer" title="Ver preguntas"><Eye size={17}/></button>
                    <button onClick={() => eliminarCuestionario(c.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition bg-transparent border-0 cursor-pointer" title="Eliminar"><Trash2 size={17}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ════════════════════════════════════════════════════════════════
     VISTA: VER PREGUNTAS
     ════════════════════════════════════════════════════════════════ */
  if (vista === "verPreguntas") {
    const pregsVer = preguntasMap[cuestionarioVer?.id] || [];
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setVista("lista")} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition border-0 cursor-pointer"><ChevronLeft size={18}/></button>
          <div>
            <h2 className="font-bold text-gray-900">{cuestionarioVer?.titulo}</h2>
            <p className="text-sm text-gray-500">{pregsVer.length} preguntas</p>
          </div>
        </div>
        <div className="space-y-3">
          {pregsVer.map((p, i) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 mb-2">{p.enunciado}</p>
                  {p.tipo === "seleccion_multiple" && (
                    <div className="space-y-1">
                      {p.opciones.map(op => (
                        <div key={op.id} className={`text-sm flex items-center gap-2 ${op.correcta ? "text-green-700 font-semibold" : "text-gray-600"}`}>
                          <span className="w-5 h-5 border rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ borderColor: op.correcta ? "#16a34a" : "#d1d5db", background: op.correcta ? "#dcfce7" : "transparent" }}>
                            {op.id.toUpperCase()}
                          </span>
                          {op.texto} {op.correcta && "✓"}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-medium">{p.puntaje} pts</span>
                    {p.tema && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{p.tema}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     VISTA: WIZARD DE GENERACIÓN
     ════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header del wizard */}
      <div className="flex items-center gap-3">
        <button onClick={() => { resetWizard(); setVista("lista"); }} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition border-0 cursor-pointer"><ChevronLeft size={18}/></button>
        <div>
          <h2 className="font-bold text-gray-900">Generar Cuestionario con IA</h2>
          <p className="text-sm text-gray-500">Paso {paso + 1} de {PASOS.length} — {PASOS[paso]}</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="flex gap-2">
        {PASOS.map((p, i) => (
          <div key={i} className="flex-1 h-2 rounded-full transition-all"
            style={{ background: i <= paso ? "#2563eb" : "#e2e8f0" }} />
        ))}
      </div>

      {/* ── PASO 0: Configuración ─────────────────────────────── */}
      {paso === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><BookOpen size={18} className="text-blue-500"/>Configuración del cuestionario</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Título *</label>
            <input value={config.titulo} onChange={e => setConfig(p => ({ ...p, titulo: e.target.value }))} placeholder="Evaluación de Matemáticas — Período 2" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Descripción</label>
            <textarea value={config.descripcion} onChange={e => setConfig(p => ({ ...p, descripcion: e.target.value }))} rows={2} placeholder="Descripción opcional..." className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Materia *</label>
              <select value={config.materiaId} onChange={e => setConfig(p => ({ ...p, materiaId: e.target.value, cursoId: "" }))} className={inputCls}>
                <option value="">Seleccionar</option>
                {materiasDocente.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Curso *</label>
              <select value={config.cursoId} onChange={e => setConfig(p => ({ ...p, cursoId: e.target.value }))} className={inputCls}>
                <option value="">Seleccionar</option>
                {cursosDocente
                  .filter(c => { const m = materiasDocente.find(m => m.id === parseInt(config.materiaId)); return m ? m.cursoId === c.id : true; })
                  .map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fecha inicio *</label>
              <input type="date" value={config.fechaInicio} onChange={e => setConfig(p => ({ ...p, fechaInicio: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fecha fin *</label>
              <input type="date" value={config.fechaFin} min={config.fechaInicio} onChange={e => setConfig(p => ({ ...p, fechaFin: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Duración (min)</label>
              <input type="number" min={5} value={config.duracionMinutos} onChange={e => setConfig(p => ({ ...p, duracionMinutos: +e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Puntaje total</label>
              <input type="number" min={10} value={config.puntajeTotal} onChange={e => setConfig(p => ({ ...p, puntajeTotal: +e.target.value }))} className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={config.mostrarResultados} onChange={e => setConfig(p => ({ ...p, mostrarResultados: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm text-gray-700">Mostrar resultados a los estudiantes al finalizar</span>
          </label>
        </div>
      )}

      {/* ── PASO 1: Temas ─────────────────────────────────────── */}
      {paso === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Tag size={18} className="text-purple-500"/>Temas dados hasta el momento</h3>
          <p className="text-sm text-gray-500">Escribe cada tema que has visto con el curso. El sistema generará preguntas basadas en ellos.</p>

          <div className="flex gap-2">
            <input value={temaInput} onChange={e => setTemaInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); agregarTema(); }}}
              placeholder="Ej: Fracciones equivalentes, Polígonos regulares..." className={`flex-1 ${inputCls}`} />
            <button onClick={agregarTema} disabled={!temaInput.trim()} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition border-0 cursor-pointer disabled:opacity-40">
              <Plus size={16} />
            </button>
          </div>

          {/* Tags de temas */}
          {temas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {temas.map(t => (
                <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" }}>
                  {t}
                  <button onClick={() => quitarTema(t)} className="bg-transparent border-0 cursor-pointer p-0 leading-none" style={{ color: "#0369a1" }}><XCircle size={14}/></button>
                </span>
              ))}
            </div>
          )}

          {temas.length === 0 && (
            <div className="py-6 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <Tag size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Agrega al menos un tema para continuar</p>
            </div>
          )}

          {temas.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Cantidad de preguntas a generar</label>
              <div className="flex items-center gap-3">
                <input type="range" min={3} max={20} value={cantPreguntas} onChange={e => setCantPreguntas(+e.target.value)} className="flex-1 accent-blue-600" />
                <span className="w-12 text-center font-bold text-blue-600 text-lg">{cantPreguntas}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Puntaje por pregunta: {Math.floor(config.puntajeTotal / cantPreguntas)} pts</p>
            </div>
          )}
        </div>
      )}

      {/* ── PASO 2: Revisar y editar preguntas ────────────────── */}
      {paso === 2 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <Sparkles size={18} className="text-blue-600 flex-shrink-0 mt-0.5"/>
            <p className="text-sm text-blue-800">
              <strong>{generadas.length} preguntas generadas</strong> basadas en los temas que proporcionaste.
              Puedes editarlas, regenerarlas o eliminarlas antes de publicar.
            </p>
          </div>

          {generadas.map((p, i) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              {editandoIdx === i ? (
                /* ── Editor inline ── */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                    <span className="text-sm font-semibold text-blue-600">Editando pregunta</span>
                  </div>
                  <textarea value={editPregunta.enunciado} onChange={e => setEditPregunta(p => ({ ...p, enunciado: e.target.value }))}
                    rows={3} className={`${inputCls} resize-none font-medium`} placeholder="Enunciado de la pregunta..." />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Opciones (marca la correcta)</p>
                    {editPregunta.opciones.map((op, oi) => (
                      <div key={op.id} className="flex items-center gap-3">
                        <input type="radio" name={`correcta_${i}`} checked={op.correcta}
                          onChange={() => setEditPregunta(p => ({ ...p, opciones: p.opciones.map((o, j) => ({ ...o, correcta: j === oi })) }))}
                          className="w-4 h-4 accent-blue-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-500 w-5">{op.id.toUpperCase()}.</span>
                        <input value={op.texto} onChange={e => setEditPregunta(p => ({ ...p, opciones: p.opciones.map((o, j) => j === oi ? { ...o, texto: e.target.value } : o) }))}
                          className={`flex-1 ${inputCls} py-2`} placeholder={`Opción ${op.id.toUpperCase()}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide w-20">Puntaje</label>
                    <input type="number" min={1} value={editPregunta.puntaje} onChange={e => setEditPregunta(p => ({ ...p, puntaje: +e.target.value }))} className={`w-24 ${inputCls} py-2`} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => { setEditandoIdx(null); setEditPregunta(null); }} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Cancelar</button>
                    <button onClick={guardarEdicion} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer flex items-center justify-center gap-2">
                      <Save size={14}/> Guardar
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Vista normal ── */
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 mb-2 text-sm">{p.enunciado}</p>
                    <div className="space-y-1 mb-3">
                      {p.opciones.map(op => (
                        <div key={op.id} className={`text-xs flex items-center gap-2 ${op.correcta ? "text-green-700 font-semibold" : "text-gray-500"}`}>
                          <span className="w-4 h-4 border rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                            style={{ borderColor: op.correcta ? "#16a34a" : "#d1d5db", background: op.correcta ? "#dcfce7" : "transparent" }}>
                            {op.id.toUpperCase()}
                          </span>
                          {op.texto} {op.correcta && "✓"}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">{p.puntaje} pts</span>
                      {p.tema && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">{p.tema}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => abrirEditar(i)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition bg-transparent border-0 cursor-pointer" title="Editar"><Edit size={15}/></button>
                    <button onClick={() => regenerarPregunta(i)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition bg-transparent border-0 cursor-pointer" title="Regenerar"><RotateCcw size={15}/></button>
                    <button onClick={() => eliminarPregunta(i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition bg-transparent border-0 cursor-pointer" title="Eliminar"><Trash2 size={15}/></button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {generadas.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle size={24} className="mx-auto mb-2 opacity-40"/>
              <p className="text-sm">Eliminaste todas las preguntas. Vuelve al paso anterior para regenerarlas.</p>
            </div>
          )}
        </div>
      )}

      {/* ── PASO 3: Publicar ──────────────────────────────────── */}
      {paso === 3 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/>Resumen antes de publicar</h3>
          <div className="space-y-2 text-sm">
            {[
              ["Título", config.titulo],
              ["Materia", materiasDocente.find(m => m.id === parseInt(config.materiaId))?.nombre],
              ["Curso", cursosDocente.find(c => c.id === parseInt(config.cursoId))?.nombre],
              ["Duración", `${config.duracionMinutos} minutos`],
              ["Período", `${config.fechaInicio} → ${config.fechaFin}`],
              ["Preguntas", generadas.length],
              ["Puntaje total", `${config.puntajeTotal} pts`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-800">{v}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
            Al publicar, el cuestionario quedará disponible para los estudiantes del curso en las fechas indicadas.
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex gap-3 pb-4">
        <button onClick={retroceder} disabled={paso === 0}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer bg-white">
          <ChevronLeft size={16}/> Anterior
        </button>
        {paso < PASOS.length - 1 ? (
          <button onClick={avanzar} disabled={!puedeAvanzar()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 border-0 cursor-pointer">
            {paso === 1 ? <><Sparkles size={15}/> Generar preguntas</> : <>Siguiente <ChevronRight size={16}/></>}
          </button>
        ) : (
          <button onClick={publicar} disabled={generadas.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", boxShadow: "0 4px 14px rgba(34,197,94,0.25)" }}>
            <CheckCircle size={15}/> Publicar cuestionario
          </button>
        )}
      </div>
    </div>
  );
}
