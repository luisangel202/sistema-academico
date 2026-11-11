import { useState, useEffect } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, AlertCircle, GraduationCap, Upload, Printer } from "lucide-react";
import { imprimirFichaMatricula, imprimirListadoMatriculas } from "../../utils/formatos/formatoMatricula";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import ImportModal from "../../components/ImportModal";
import { useImportContext } from "../../context/ImportContext";
import { useData } from "../../context/DataContext";

const matriculasIniciales = [
  { id: 1, estudianteId: 9, cursoId: 2, periodoId: 2, fecha: "2025-01-15", estado: "activa", acudiente: "Roberto Pérez" },
  { id: 2, estudianteId: 10, cursoId: 2, periodoId: 2, fecha: "2025-01-16", estado: "activa", acudiente: "Carmen Torres" },
];

export default function Matriculas() {
  const toast = useToast();
  const { pendingImport, consumePending } = useImportContext();
  const { usuarios, cursos, periodos, agregarUsuario } = useData();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation({
    nombre:           { required: true, minLength: 3, label: "Nombre" },
    documento:        { required: true, minLength: 6, pattern: /^\d+$/, patternMsg: "Solo números", label: "Documento" },
    correo:           { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMsg: "Correo inválido", label: "Correo" },
    acudiente:        { required: true, minLength: 3, label: "Nombre del acudiente" },
    parentesco:       { required: true, label: "Parentesco" },
    telefonoAcudiente:{ required: true, pattern: /^\d{7,10}$/, patternMsg: "7-10 dígitos", label: "Teléfono acudiente" },
  });

  const [matriculas, setMatriculas] = useInstState("er_matriculas", matriculasIniciales);
  const [showModal, setShowModal]   = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch]         = useState("");
  const [filtroCurso, setFiltroCurso]     = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [filtroEstado, setFiltroEstado]   = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [nuevosEstudiantes, setNuevosEstudiantes] = useInstState("er_nuevos_estudiantes", []);
  const [nextEstudianteId, setNextEstudianteId]   = useInstState("er_next_est_id", 1000);
  const [form, setForm] = useState({
    nombre: "", documento: "", correo: "", telefono: "", direccion: "",
    cursoId: 2, acudiente: "", parentesco: "", telefonoAcudiente: "",
    tipoMatricula: "nueva", observaciones: "",
  });

  const f = (key, val) => { setForm(p => ({ ...p, [key]: val })); handleChange(key, val); };

  const documentoExiste = (doc) =>
    [...usuarios.filter(u => u.rol === "ESTUDIANTE"), ...nuevosEstudiantes].some(u => u.documento === doc);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Corrige los errores antes de continuar"); return; }
    if (documentoExiste(form.documento)) { toast.error(`Ya existe un estudiante con el documento ${form.documento}`); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));

    const nuevoEstudiante = {
      id: nextEstudianteId, nombre: form.nombre, documento: form.documento,
      correo: form.correo, telefono: form.telefono, direccion: form.direccion,
      rol: "ESTUDIANTE", activo: true,
      avatar: form.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
      institucionId: 1,
      curso: cursos.find(c => c.id === Number(form.cursoId))?.nombre || "Por asignar",
    };

    const nuevaMatricula = {
      id: Date.now(), estudianteId: nextEstudianteId,
      cursoId: Number(form.cursoId), periodoId: 2,
      fecha: new Date().toISOString().split("T")[0],
      estado: "activa", acudiente: form.acudiente,
      parentesco: form.parentesco, telefonoAcudiente: form.telefonoAcudiente,
      tipoMatricula: form.tipoMatricula, observaciones: form.observaciones,
    };

    setNuevosEstudiantes(prev => [...prev, nuevoEstudiante]);
    setMatriculas(prev => [...prev, nuevaMatricula]);
    setNextEstudianteId(id => id + 1);
    // Registrar en DataContext para que Notas/Asistencia lo vean
    agregarUsuario({ ...nuevoEstudiante, cursoId: Number(form.cursoId) });
    setShowModal(false);
    setForm({ nombre: "", documento: "", correo: "", telefono: "", direccion: "", cursoId: 2, acudiente: "", parentesco: "", telefonoAcudiente: "", tipoMatricula: "nueva", observaciones: "" });
    clearErrors();
    setSubmitting(false);
    toast.success(`Matrícula de ${form.nombre} registrada`, "Matrícula exitosa");
  };

  // Importar datos desde archivo / enlace / texto pegado
  const handleImport = (rows) => {
    let importados = 0;
    rows.forEach((row, idx) => {
      const nombre = row.nombre || row.Nombre || row["Nombre Completo"] || "";
      const documento = String(row.documento || row.Documento || row["No. Documento"] || "");
      if (!nombre || !documento) return;

      const estudiante = {
        id: nextEstudianteId + idx,
        nombre, documento,
        correo: row.correo || row.Correo || row.email || "",
        telefono: row.telefono || row.Telefono || "",
        rol: "ESTUDIANTE", activo: true,
        avatar: nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
        institucionId: 1,
        curso: cursos.find(c => c.id === Number(row.cursoId || row.Curso || row.curso || 2))?.nombre || "Por asignar",
      };

      const matricula = {
        id: Date.now() + idx,
        estudianteId: estudiante.id,
        cursoId: Number(row.cursoId || row.Curso || row.curso || 2),
        periodoId: 2,
        fecha: new Date().toISOString().split("T")[0],
        estado: "activa",
        acudiente: row.acudiente || row.Acudiente || "",
        parentesco: row.parentesco || row.Parentesco || "",
        telefonoAcudiente: row.telefonoAcudiente || row["Teléfono Acudiente"] || "",
        tipoMatricula: row.tipoMatricula || "nueva",
        observaciones: row.observaciones || "",
      };

      setNuevosEstudiantes(prev => [...prev, estudiante]);
      setMatriculas(prev => [...prev, matricula]);
      importados++;
    });
    setNextEstudianteId(id => id + rows.length);
    if (importados > 0) toast.success(`${importados} estudiante(s) importado(s)`);
    else toast.error("No se encontraron filas válidas (requiere nombre y documento)");
  };

  /* Recibir importación desde el SmartImport global */
  useEffect(() => {
    if (pendingImport?.destinationId === "matriculas") {
      handleImport(pendingImport.data);
      consumePending();
    }
  }, [pendingImport]);

  // Combinar estudiantes existentes y nuevos para mostrar
  const todosLosEstudiantes = [...usuarios.filter(u => u.rol === "ESTUDIANTE"), ...nuevosEstudiantes];

  const filtered = matriculas.filter((m) => {
    const est = todosLosEstudiantes.find((u) => u.id === m.estudianteId);
    const matchSearch = !search ||
      (est?.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      m.acudiente.toLowerCase().includes(search.toLowerCase());
    const matchCurso = filtroCurso ? m.cursoId === Number(filtroCurso) : true;
    const matchPeriodo = filtroPeriodo ? m.periodoId === Number(filtroPeriodo) : true;
    const matchEstado = filtroEstado ? m.estado === filtroEstado : true;
    return matchSearch && matchCurso && matchPeriodo && matchEstado;
  });

  const bulk = useBulkSelect(filtered);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setMatriculas);
    setConfirmDel(false);
    toast.success(`${count} matrícula${count !== 1 ? "s" : ""} eliminada${count !== 1 ? "s" : ""}`);
  };

  return (
    <div>
      <PageHeader
        title="Matrículas"
        subtitle="Registro y gestión de matrículas"
        icon={GraduationCap}
        color="#3b82f6"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => imprimirListadoMatriculas(filtered, todosLosEstudiantes, cursos)}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition border border-gray-200 cursor-pointer">
              <Printer size={15}/> Imprimir listado
            </button>
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition border border-gray-200 cursor-pointer">
              <Upload size={16} /> Importar
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer">
              <Plus size={16} /> Nueva Matrícula
            </button>
          </div>
        }
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar estudiante o acudiente..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todos los cursos</option>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todos los períodos</option>
          {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="inactiva">Inactiva</option>
        </select>
      </div>
      <p className="text-xs text-gray-400 mb-3">{filtered.length} matrícula(s)</p>

      {bulk.count > 0 && (
        <BulkBar count={bulk.count} label="matrícula"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}

      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtered.length} onToggleAll={bulk.toggleAll} label="matrícula" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 w-10"></th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Estudiante</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Curso</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Acudiente</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Fecha</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m) => {
                const est = todosLosEstudiantes.find((u) => u.id === m.estudianteId);
                const curso = cursos.find((c) => c.id === m.cursoId);
                const esNuevo = nuevosEstudiantes.some(e => e.id === m.estudianteId);
                return (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-5 py-3.5"><Checkbox checked={bulk.selected.has(m.id)} onChange={() => bulk.toggle(m.id)} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">{est?.avatar}</div>
                        <div>
                          <span className="font-semibold text-gray-800">{est?.nombre}</span>
                          {esNuevo && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">NUEVO</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{curso?.nombre}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <div>
                        <div className="font-medium text-sm">{m.acudiente}</div>
                        {m.parentesco && <div className="text-xs text-gray-400">{m.parentesco}</div>}
                        {m.telefonoAcudiente && <div className="text-xs text-gray-400">{m.telefonoAcudiente}</div>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{m.fecha}</td>
                    <td className="px-5 py-3.5"><Badge label={m.estado} variant={m.estado === "activa" ? "success" : "danger"} dot /></td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => imprimirFichaMatricula(m, est, cursos.find(c=>c.id===m.cursoId))}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition bg-transparent border-0 cursor-pointer" title="Imprimir ficha">
                        <Printer size={14}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Nueva Matrícula — Registrar Estudiante">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">

          {/* Tipo de matrícula */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tipo de matrícula</label>
            <div className="flex gap-2">
              {[["nueva","Nueva"],["renovacion","Renovación"],["traslado","Traslado"]].map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => f("tipoMatricula", val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition
                    ${form.tipoMatricula === val ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "nombre",    label: "Nombre completo",    placeholder: "Juan Pérez García",  type: "text"  },
              { key: "documento", label: "Documento",           placeholder: "123456789",          type: "text"  },
              { key: "correo",    label: "Correo electrónico",  placeholder: "juan@email.com",     type: "email", full: true },
              { key: "telefono",  label: "Teléfono",            placeholder: "3001234567",         type: "text"  },
            ].map(({ key, label, placeholder, type, full }) => (
              <div key={key} className={full ? "md:col-span-2" : ""}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label} *</label>
                <input type={type} value={form[key]}
                  onChange={e => f(key, e.target.value)}
                  onBlur={e => handleBlur(key, e.target.value)}
                  placeholder={placeholder}
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
                    ${errors[key] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`} />
                {errors[key] && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors[key]}</p>}
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Dirección</label>
              <input value={form.direccion} onChange={e => f("direccion", e.target.value)} placeholder="Cra 10 #20-30"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50 hover:bg-white transition" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Curso *</label>
              <select value={form.cursoId} onChange={e => f("cursoId", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50">
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nombre del acudiente *</label>
              <input value={form.acudiente} onChange={e => f("acudiente", e.target.value)} onBlur={e => handleBlur("acudiente", e.target.value)}
                placeholder="María Pérez"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
                  ${errors.acudiente ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`} />
              {errors.acudiente && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.acudiente}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Parentesco *</label>
              <select value={form.parentesco} onChange={e => f("parentesco", e.target.value)} onBlur={e => handleBlur("parentesco", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50
                  ${errors.parentesco ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`}>
                <option value="">Seleccionar</option>
                {["Madre","Padre","Tía","Tío","Abuela","Abuelo","Hermana","Hermano","Otro"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.parentesco && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.parentesco}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Teléfono del acudiente *</label>
              <input value={form.telefonoAcudiente} onChange={e => f("telefonoAcudiente", e.target.value)} onBlur={e => handleBlur("telefonoAcudiente", e.target.value)}
                placeholder="3009876543"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-gray-50 hover:bg-white
                  ${errors.telefonoAcudiente ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-500/30 focus:border-blue-400"}`} />
              {errors.telefonoAcudiente && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.telefonoAcudiente}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Observaciones especiales</label>
              <textarea value={form.observaciones} onChange={e => f("observaciones", e.target.value)}
                rows={2} placeholder="Condición médica, discapacidad, necesidades especiales..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50 resize-none" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            Al registrar esta matrícula se creará automáticamente el usuario estudiante en el sistema.
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); clearErrors(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white font-medium">Cancelar</button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
              {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registrando...</> : "Registrar Matrícula"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="matrícula"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        title="Importar Estudiantes"
        itemLabel="estudiante"
        hint="Columnas reconocidas: nombre, documento, correo, telefono, cursoId, acudiente, parentesco, telefonoAcudiente"
      />
    </div>
  );
}
