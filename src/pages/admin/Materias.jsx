import { useState, useEffect } from "react";
import { useInstState } from "../../hooks/useInstState";
import { Plus, Search, GraduationCap } from "lucide-react";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import { useImportContext } from "../../context/ImportContext";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import ModuleLayout, {
  DataTable, TableRow, Td,
  FilterInput, FilterSelect,
  FormField, FormInput, FormSelect,
  ModalActions,
} from "../../components/ModuleLayout";
import { materias as dataMaterias, cursos, usuarios } from "../../data/mockData";

const AREAS    = ["Matemáticas","Humanidades","Ciencias Naturales","Ciencias Sociales","Tecnología","Educación Física","Artística","Ética","Religión","Inglés","Otra"];
const TIPOS    = ["Numérica (0-5)","Conceptual (D/B/A/S)","Mixta"];
const FORM_INI = { nombre: "", codigo: "", cursoId: 1, docenteId: "", intensidad: 4, horaInicio: "", horaFinal: "", area: "Matemáticas", tipoEvaluacion: "Numérica (0-5)" };
const REGLAS   = {
  nombre: { required: true, minLength: 3, label: "Nombre" },
  codigo: { required: true, minLength: 2, label: "Código" },
};

const cols = [
  { label: "" },
  { label: "Materia" },
  { label: "Curso",   hidden: "hidden sm:table-cell" },
  { label: "Docente", hidden: "hidden md:table-cell" },
  { label: "Horario", hidden: "hidden lg:table-cell" },
  { label: "Horas" },
];

export default function Materias() {
  const toast = useToast();
  const { pendingImport, consumePending } = useImportContext();

  const handleImport = (rows) => {
    let importados = 0;
    rows.forEach((row) => {
      const nombre = row.nombre || row.Nombre || row.materia || row.Materia || "";
      if (!nombre) return;
      setMaterias(prev => [...prev, {
        id: Date.now() + importados,
        nombre,
        codigo: row.codigo || row.Codigo || "",
        cursoId: Number(row.cursoId || row.Curso || 1),
        docenteId: Number(row.docenteId || row.Docente || "") || "",
        intensidad: Number(row.intensidad || row.Intensidad || 4),
        horaInicio: row.horaInicio || "",
        horaFinal: row.horaFinal || "",
        area: row.area || row.Area || "Otra",
        tipoEvaluacion: row.tipoEvaluacion || "Numérica (0-5)",
      }]);
      importados++;
    });
    if (importados > 0) toast.success(`${importados} materia(s) importada(s)`);
    else toast.error("No se encontraron filas válidas (requiere nombre)");
  };

  useEffect(() => {
    if (pendingImport?.destinationId === "materias") {
      handleImport(pendingImport.data);
      consumePending();
    }
  }, [pendingImport]);
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);

  const [materias, setMaterias]     = useInstState("er_materias", dataMaterias);
  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState("");
  const [filtroCurso, setFiltroCurso]     = useState("");
  const [filtroDocente, setFiltroDocente] = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [form, setForm]             = useState(FORM_INI);
  const [confirmDel, setConfirmDel] = useState(false);

  const docentes = usuarios.filter(u => u.rol === "DOCENTE");
  const f = (k, v) => { setForm(p => ({ ...p, [k]: v })); handleChange(k, v); };

  const filtradas = materias.filter(m => {
    const q = search.toLowerCase();
    const matchSearch  = !search || m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q);
    const matchCurso   = filtroCurso   ? m.cursoId   === Number(filtroCurso)   : true;
    const matchDocente = filtroDocente === "sin" ? !m.docenteId : filtroDocente ? m.docenteId === Number(filtroDocente) : true;
    return matchSearch && matchCurso && matchDocente;
  });

  const bulk = useBulkSelect(filtradas);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    if (materias.some(m => m.codigo.toLowerCase() === form.codigo.toLowerCase() && m.cursoId === Number(form.cursoId))) {
      toast.error(`El código "${form.codigo}" ya existe en ese curso`); return;
    }
    if (form.horaInicio && form.horaFinal && form.horaFinal <= form.horaInicio) {
      toast.error("La hora final debe ser posterior a la de inicio"); return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 350));
    setMaterias(prev => [...prev, {
      ...form, id: Date.now(),
      cursoId: Number(form.cursoId), docenteId: Number(form.docenteId), intensidad: Number(form.intensidad),
    }]);
    setShowModal(false); setForm(FORM_INI); clearErrors(); setSubmitting(false);
    toast.success(`Materia "${form.nombre}" creada`);
  };

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setMaterias);
    setConfirmDel(false);
    toast.success(`${count} materia${count !== 1 ? "s" : ""} eliminada${count !== 1 ? "s" : ""}`);
  };

  return (
    <ModuleLayout
      header={
        <PageHeader title="Materias" subtitle="Asignaturas registradas en la institución"
          icon={GraduationCap} color="#8b5cf6"
          action={
            <button onClick={() => { setShowModal(true); setForm(FORM_INI); clearErrors(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              <Plus size={14} /> Nueva materia
            </button>
          }
        />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar nombre o código..." icon={Search} />
        <FilterSelect value={filtroCurso} onChange={setFiltroCurso}>
          <option value="">Todos los cursos</option>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </FilterSelect>
        <FilterSelect value={filtroDocente} onChange={setFiltroDocente}>
          <option value="">Todos los docentes</option>
          <option value="sin">Sin asignar</option>
          {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
        </FilterSelect>
      </>}
      count={`${filtradas.length} materia${filtradas.length !== 1 ? "s" : ""}`}
      toolbar={bulk.count > 0 && (
        <BulkBar count={bulk.count} label="materia"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}
    >
      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtradas.length} onToggleAll={bulk.toggleAll} label="materia" />

      <DataTable columns={cols} empty={filtradas.length === 0 ? "No hay materias que coincidan" : undefined}>
        {filtradas.map(m => {
          const curso   = cursos.find(c => c.id === m.cursoId);
          const docente = usuarios.find(u => u.id === m.docenteId);
          const isChecked = bulk.selected.has(m.id);
          return (
            <TableRow key={m.id}>
              <Td><Checkbox checked={isChecked} onChange={() => bulk.toggle(m.id)} /></Td>
              <Td>
                <p className="text-sm font-semibold" style={{ color: "#1e293b" }}>{m.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono" style={{ color: "#94a3b8" }}>{m.codigo}</span>
                  {m.area && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#faf5ff", color: "#6d28d9", border: "1px solid #ddd6fe" }}>
                      {m.area}
                    </span>
                  )}
                </div>
              </Td>
              <Td hidden="hidden sm:table-cell" muted>{curso?.nombre || "—"}</Td>
              <Td hidden="hidden md:table-cell">
                {docente ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "#f0fdf4", color: "#16a34a" }}>
                      {docente.avatar}
                    </div>
                    <span className="text-sm" style={{ color: "#374151" }}>{docente.nombre}</span>
                  </div>
                ) : (
                  <span className="text-sm" style={{ color: "#cbd5e1" }}>Sin asignar</span>
                )}
              </Td>
              <Td hidden="hidden lg:table-cell" muted>
                {m.horaInicio && m.horaFinal ? `${m.horaInicio} – ${m.horaFinal}` : "—"}
              </Td>
              <Td><Badge label={`${m.intensidad}h/sem`} variant="info" /></Td>
            </TableRow>
          );
        })}
      </DataTable>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="materia"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />

      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title="Nueva Materia" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre" required error={errors.nombre}>
              <FormInput error={errors.nombre} value={form.nombre} placeholder="Matemáticas"
                onChange={e => f("nombre", e.target.value)} onBlur={e => handleBlur("nombre", e.target.value)} />
            </FormField>
            <FormField label="Código" required error={errors.codigo}>
              <FormInput error={errors.codigo} value={form.codigo} placeholder="MAT"
                onChange={e => f("codigo", e.target.value)} onBlur={e => handleBlur("codigo", e.target.value)} />
            </FormField>
            <FormField label="Área">
              <FormSelect value={form.area} onChange={e => f("area", e.target.value)}>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Tipo evaluación">
              <FormSelect value={form.tipoEvaluacion} onChange={e => f("tipoEvaluacion", e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Curso" required>
              <FormSelect value={form.cursoId} onChange={e => f("cursoId", e.target.value)}>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Intensidad (h/sem)">
              <FormInput type="number" min="1" max="10" value={form.intensidad} onChange={e => f("intensidad", e.target.value)} />
            </FormField>
            <FormField label="Hora inicio">
              <FormInput type="time" value={form.horaInicio} onChange={e => f("horaInicio", e.target.value)} />
            </FormField>
            <FormField label="Hora fin">
              <FormInput type="time" value={form.horaFinal} onChange={e => f("horaFinal", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Docente">
            <FormSelect value={form.docenteId} onChange={e => f("docenteId", e.target.value)}>
              <option value="">Sin asignar</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </FormSelect>
          </FormField>
          <ModalActions onCancel={() => { setShowModal(false); clearErrors(); }} submitLabel="Crear Materia" loading={submitting} />
        </form>
      </Modal>
    </ModuleLayout>
  );
}
