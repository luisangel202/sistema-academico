import { useState, useEffect } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, Calendar, Power, Play, Edit, Trash2, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import { periodos as dataPeriodos } from "../../data/mockData";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import { useImportContext } from "../../context/ImportContext";

const FORM_INICIAL = { nombre: "", numero: 1, año: 2025, inicio: "", fin: "", pesoNota: 25 };

const REGLAS = {
  nombre: { required: true, minLength: 3, label: "Nombre" },
  inicio: { required: true, label: "Fecha inicio" },
  fin:    { required: true, label: "Fecha fin" },
};

export default function Periodos() {
  const toast = useToast();
  const { pendingImport, consumePending } = useImportContext();

  const handleImport = (rows) => {
    let importados = 0;
    rows.forEach((row) => {
      const nombre = row.nombre || row.Nombre || row.periodo || "";
      if (!nombre) return;
      setPeriodos(prev => [...prev, {
        id: Date.now() + importados,
        nombre,
        numero: Number(row.numero || row.Numero || 1),
        año: Number(row.año || row.Año || 2025),
        inicio: row.inicio || row.Inicio || "",
        fin: row.fin || row.Fin || "",
        pesoNota: Number(row.pesoNota || row.PesoNota || 25),
        estado: "pendiente",
        institucionId: 1,
      }]);
      importados++;
    });
    if (importados > 0) toast.success(`${importados} período(s) importado(s)`);
    else toast.error("No se encontraron filas válidas (requiere nombre)");
  };

  useEffect(() => {
    if (pendingImport?.destinationId === "periodos") {
      handleImport(pendingImport.data);
      consumePending();
    }
  }, [pendingImport]);
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);

  const [periodos, setPeriodos]     = useInstState("er_periodos", dataPeriodos);
  const [showModal, setShowModal]   = useState(false);
  const [editPeriodo, setEditPeriodo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState(FORM_INICIAL);

  const f = (key, val) => { setForm(p => ({ ...p, [key]: val })); handleChange(key, val); };

  const validarSolapamiento = (inicio, fin, excludeId) => {
    return periodos.some(p => {
      if (p.id === excludeId) return false;
      const pInicio = new Date(p.inicio);
      const pFin    = new Date(p.fin);
      const nInicio = new Date(inicio);
      const nFin    = new Date(fin);
      return nInicio <= pFin && nFin >= pInicio;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Corrige los errores antes de continuar"); return; }
    if (form.fin <= form.inicio) { toast.error("La fecha de fin debe ser posterior a la de inicio"); return; }
    if (validarSolapamiento(form.inicio, form.fin)) { toast.error("Las fechas se solapan con otro período existente"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    const nuevo = { ...form, id: Date.now(), estado: "pendiente", institucionId: 1, numero: Number(form.numero), año: Number(form.año), pesoNota: Number(form.pesoNota) };
    setPeriodos([...periodos, nuevo]);
    setShowModal(false);
    setForm(FORM_INICIAL);
    clearErrors();
    setSubmitting(false);
    toast.success(`Período "${form.nombre}" creado`, "Período registrado");
  };

  const abrirEditar = (periodo) => {
    setEditPeriodo(periodo);
    setForm({ nombre: periodo.nombre, numero: periodo.numero, año: periodo.año, inicio: periodo.inicio, fin: periodo.fin, pesoNota: periodo.pesoNota || 25 });
    clearErrors();
    setShowModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Corrige los errores antes de continuar"); return; }
    if (form.fin <= form.inicio) { toast.error("La fecha de fin debe ser posterior a la de inicio"); return; }
    if (validarSolapamiento(form.inicio, form.fin, editPeriodo.id)) { toast.error("Las fechas se solapan con otro período existente"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    setPeriodos(periodos.map(p => p.id === editPeriodo.id ? { ...p, ...form, numero: Number(form.numero), año: Number(form.año), pesoNota: Number(form.pesoNota) } : p));
    setShowModal(false);
    setEditPeriodo(null);
    setForm(FORM_INICIAL);
    clearErrors();
    setSubmitting(false);
    toast.success("Período actualizado");
  };

  const toggleEstado = (id, estadoActual) => {
    const mapa = { pendiente: "activo", activo: "cerrado", cerrado: "activo" };
    const msgs = { pendiente: "¿Activar este período?", activo: "¿Cerrar este período? Las notas no podrán modificarse.", cerrado: "¿Reabrir este período?" };
    if (!window.confirm(msgs[estadoActual])) return;
    setPeriodos(periodos.map(p => p.id === id ? { ...p, estado: mapa[estadoActual] } : p));
    toast.success(`Período ${mapa[estadoActual] === "activo" ? "activado" : mapa[estadoActual] === "cerrado" ? "cerrado" : "reabierto"}`);
  };

  const eliminar = (id, nombre) => {
    if (!window.confirm(`¿Eliminar el período "${nombre}"? Esta acción no se puede deshacer.`)) return;
    setPeriodos(periodos.filter(p => p.id !== id));
    toast.warning("Período eliminado");
  };

  const pesoTotal = periodos.reduce((s, p) => s + (Number(p.pesoNota) || 0), 0);

  const bulk = useBulkSelect(periodos);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setPeriodos);
    setConfirmDel(false);
    toast.success(`${count} período${count !== 1 ? "s" : ""} eliminado${count !== 1 ? "s" : ""}`);
  };

  const estadoColor = { activo: "bg-green-50 border-green-200", cerrado: "bg-gray-50 border-gray-200", pendiente: "bg-amber-50 border-amber-200" };

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
    ${errors[field] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Períodos Académicos"
        subtitle="Gestión de períodos del año escolar"
        icon={Calendar}
        color="#3b82f6"
        action={
          <button onClick={() => { setShowModal(true); setEditPeriodo(null); setForm(FORM_INICIAL); clearErrors(); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm shadow-blue-200">
            <Plus size={15} /> Nuevo Período
          </button>
        }
      />

      {/* Indicador de peso total */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium w-fit
        ${pesoTotal === 100 ? "bg-green-100 text-green-700" : pesoTotal > 100 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
        Peso total de períodos: {pesoTotal}%
        {pesoTotal === 100 ? " ✓" : pesoTotal > 100 ? " — excede 100%" : ` — faltan ${100 - pesoTotal}%`}
      </div>

      {bulk.count > 0 && (
        <BulkBar count={bulk.count} label="período"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}

      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={periodos.length} onToggleAll={bulk.toggleAll} label="período" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {periodos.map(p => (
          <div key={p.id} className={`rounded-2xl p-5 border shadow-sm ${estadoColor[p.estado] || "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                <Badge label={p.estado} variant={p.estado} dot />
              </div>
              <div className="flex items-center gap-1">
                <Checkbox checked={bulk.selected.has(p.id)} onChange={() => bulk.toggle(p.id)} />
                <button onClick={() => abrirEditar(p)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition bg-transparent border-0 cursor-pointer" title="Editar">
                  <Edit size={13} />
                </button>
                <button onClick={() => toggleEstado(p.id, p.estado)}
                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition bg-transparent border-0 cursor-pointer"
                  title={p.estado === "pendiente" ? "Activar" : p.estado === "activo" ? "Cerrar" : "Reabrir"}>
                  {p.estado === "activo" ? <Power size={13} /> : <Play size={13} />}
                </button>
                <button onClick={() => eliminar(p.id, p.nombre)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition bg-transparent border-0 cursor-pointer" title="Eliminar">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <p className="font-semibold text-gray-800 mb-2">{p.nombre}</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>📅 Inicio: {p.inicio}</p>
              <p>🏁 Fin: {p.fin}</p>
              {p.pesoNota && <p>⚖️ Peso en nota anual: {p.pesoNota}%</p>}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); setEditPeriodo(null); }}
        title={editPeriodo ? "Editar Período Académico" : "Nuevo Período Académico"}>
        <form onSubmit={editPeriodo ? handleEdit : handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nombre *</label>
            <input value={form.nombre} onChange={e => f("nombre", e.target.value)} onBlur={e => handleBlur("nombre", e.target.value)}
              placeholder="Período 1 - 2025" className={inputCls("nombre")} />
            {errors.nombre && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.nombre}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Número</label>
              <select value={form.numero} onChange={e => f("numero", e.target.value)} className={inputCls("numero")}>
                {[1,2,3,4].map(n => <option key={n} value={n}>Período {n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Año</label>
              <input type="number" value={form.año} onChange={e => f("año", e.target.value)} className={inputCls("año")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fecha inicio *</label>
              <input type="date" value={form.inicio} onChange={e => f("inicio", e.target.value)} onBlur={e => handleBlur("inicio", e.target.value)}
                className={inputCls("inicio")} />
              {errors.inicio && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.inicio}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fecha fin *</label>
              <input type="date" value={form.fin} min={form.inicio} onChange={e => f("fin", e.target.value)} onBlur={e => handleBlur("fin", e.target.value)}
                className={inputCls("fin")} />
              {errors.fin && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.fin}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Peso en nota anual (%)</label>
            <input type="number" min="1" max="100" value={form.pesoNota} onChange={e => f("pesoNota", e.target.value)}
              className={inputCls("pesoNota")} />
            <p className="text-xs text-gray-400 mt-1">Peso actual de otros períodos: {pesoTotal - (editPeriodo?.pesoNota || 0)}% · Disponible: {100 - pesoTotal + (editPeriodo?.pesoNota || 0)}%</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); clearErrors(); setEditPeriodo(null); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">Cancelar</button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
              {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</> : editPeriodo ? "Guardar Cambios" : "Crear Período"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="período"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </div>
  );
}
