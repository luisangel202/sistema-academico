import { useState } from "react";
import { Download, Plus, FileText, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import { usuarios, periodos } from "../../data/mockData";

const tiposCertificado = [
  "Constancia de estudio",
  "Constancia de notas",
  "Constancia de conducta",
  "Certificado de matrícula",
  "Paz y salvo académico",
];

const certificadosIniciales = [
  { id: 1, estudianteId: 9,  tipo: "Constancia de estudio", fecha: "2025-04-20", estado: "generado", destino: "Uso personal",    periodoId: 2, copias: 1 },
  { id: 2, estudianteId: 10, tipo: "Constancia de notas",   fecha: "2025-05-02", estado: "generado", destino: "Entidad bancaria", periodoId: 2, copias: 2 },
];

const FORM_INICIAL = { estudianteId: "", tipo: tiposCertificado[0], periodoId: 2, destino: "", copias: 1, fechaExpedicion: new Date().toISOString().split("T")[0] };

const REGLAS = {
  estudianteId: { required: true, label: "Estudiante" },
  destino:      { required: true, label: "Destino" },
};

export default function Certificados() {
  const toast = useToast();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);

  const [certificados, setCertificados] = useState(certificadosIniciales);
  const [showModal, setShowModal]       = useState(false);
  const [search, setSearch]             = useState("");
  const [filtroTipo, setFiltroTipo]     = useState("");
  const [generando, setGenerando]       = useState(false);
  const [form, setForm]                 = useState(FORM_INICIAL);

  const estudiantes = usuarios.filter(u => u.rol === "ESTUDIANTE");

  const f = (key, val) => { setForm(p => ({ ...p, [key]: val })); handleChange(key, val); };

  const handleGenerar = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Corrige los errores antes de continuar"); return; }
    setGenerando(true);
    await new Promise(r => setTimeout(r, 1200));
    const est = estudiantes.find(u => u.id === Number(form.estudianteId));
    const nuevo = {
      ...form, id: Date.now(), estudianteId: Number(form.estudianteId),
      periodoId: Number(form.periodoId), copias: Number(form.copias),
      fecha: form.fechaExpedicion, estado: "generado",
    };
    setCertificados([nuevo, ...certificados]);
    setShowModal(false);
    setGenerando(false);
    setForm(FORM_INICIAL);
    clearErrors();
    toast.success(`Certificado generado para ${est?.nombre}`, "Certificado listo");
  };

  const filtrados = certificados.filter(c => {
    const est = estudiantes.find(u => u.id === c.estudianteId);
    const matchSearch = !search ||
      (est?.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      c.tipo.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filtroTipo ? c.tipo === filtroTipo : true;
    return matchSearch && matchTipo;
  });

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
    ${errors[field] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Certificados"
        subtitle="Generación y descarga de certificados académicos"
        icon={FileText}
        color="#10b981"
        action={
          <button onClick={() => { setShowModal(true); setForm(FORM_INICIAL); clearErrors(); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm shadow-blue-200">
            <Plus size={15} /> Generar Certificado
          </button>
        }
      />

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar estudiante o tipo..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
        </div>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="">Todos los tipos</option>
          {tiposCertificado.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <p className="text-xs text-gray-400">{filtrados.length} certificado(s)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map(c => {
          const est = estudiantes.find(u => u.id === c.estudianteId);
          const periodo = periodos.find(p => p.id === c.periodoId);
          return (
            <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{c.tipo}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{est?.nombre}</p>
                  <p className="text-xs text-gray-400">{c.fecha}</p>
                  {c.destino && <p className="text-xs text-gray-400">Para: {c.destino}</p>}
                  {c.copias > 1 && <p className="text-xs text-blue-600">{c.copias} copias</p>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge label={c.estado} variant="success" dot />
                <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-transparent border-0 cursor-pointer font-medium">
                  <Download size={13} /> Descargar PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Generar Certificado">
        <form onSubmit={handleGenerar} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Estudiante *</label>
            <select value={form.estudianteId} onChange={e => f("estudianteId", e.target.value)} onBlur={e => handleBlur("estudianteId", e.target.value)}
              className={inputCls("estudianteId")}>
              <option value="">Seleccionar estudiante</option>
              {estudiantes.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            {errors.estudianteId && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.estudianteId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tipo de certificado *</label>
            <select value={form.tipo} onChange={e => f("tipo", e.target.value)} className={inputCls("tipo")}>
              {tiposCertificado.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Período / Año</label>
              <select value={form.periodoId} onChange={e => f("periodoId", e.target.value)} className={inputCls("periodoId")}>
                {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Número de copias</label>
              <input type="number" min="1" max="10" value={form.copias} onChange={e => f("copias", e.target.value)}
                className={inputCls("copias")} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Destino del certificado *</label>
            <input value={form.destino} onChange={e => f("destino", e.target.value)} onBlur={e => handleBlur("destino", e.target.value)}
              placeholder="Ej: Entidad bancaria, uso personal, trámite ICFES..."
              className={inputCls("destino")} />
            {errors.destino && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.destino}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fecha de expedición</label>
            <input type="date" value={form.fechaExpedicion} onChange={e => f("fechaExpedicion", e.target.value)}
              className={inputCls("fechaExpedicion")} />
          </div>

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            El certificado se generará con los datos actuales del estudiante y quedará disponible para descarga en PDF.
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); clearErrors(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">Cancelar</button>
            <button type="submit" disabled={generando}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
              {generando ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generando...</> : "Generar Certificado"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
