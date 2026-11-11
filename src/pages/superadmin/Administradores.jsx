import { useState } from "react";
import { usePersistedState } from "../../hooks/usePersistedState";
import { Plus, Edit, Search, Users } from "lucide-react";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useFormValidation } from "../../hooks/useFormValidation";
import ModuleLayout, {
  DataTable, TableRow, Td,
  FilterInput, FilterSelect,
  FormField, FormInput, FormSelect,
  ActionBtn, ModalActions,
} from "../../components/ModuleLayout";
import { usuarios, instituciones } from "../../data/mockData";

const FORM_INI = {
  nombre: "", documento: "", correo: "", telefono: "",
  cargo: "Administrador Institucional", fechaInicio: "", institucionId: 1,
};
const REGLAS = {
  nombre:      { required: true, minLength: 3, label: "Nombre" },
  documento:   { required: true, minLength: 6, pattern: /^\d+$/, patternMsg: "Solo números", label: "Documento" },
  correo:      { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMsg: "Correo inválido", label: "Correo" },
  fechaInicio: { required: true, label: "Fecha de inicio" },
};

const cols = [
  { label: "" },
  { label: "Administrador" },
  { label: "Correo",      hidden: "hidden md:table-cell" },
  { label: "Institución", hidden: "hidden lg:table-cell" },
  { label: "Estado" },
  { label: "Acciones" },
];

export default function Administradores() {
  const toast = useToast();
  const { errors, validate, handleBlur, handleChange, clearErrors } = useFormValidation(REGLAS);

  const [admins, setAdmins]     = usePersistedState("er_admins", usuarios.filter(u => u.rol === "ADMIN_INSTITUCIONAL"));
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [search, setSearch]     = useState("");
  const [filtroInst, setFiltroInst]         = useState("");
  const [filtroEstado, setFiltroEstado]     = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [form, setForm]         = useState(FORM_INI);
  const [confirmDel, setConfirmDel]         = useState(false);

  const f = (k, v) => { setForm(p => ({ ...p, [k]: v })); handleChange(k, v); };

  const filtrados = admins.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !search || a.nombre.toLowerCase().includes(q) || a.documento.includes(q) || a.correo.toLowerCase().includes(q);
    const matchInst   = filtroInst   ? a.institucionId === Number(filtroInst) : true;
    const matchEstado = filtroEstado !== "" ? String(a.activo) === filtroEstado : true;
    return matchSearch && matchInst && matchEstado;
  });

  const bulk = useBulkSelect(filtrados);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(form)) { toast.error("Corrige los errores"); return; }
    if (admins.some(a => a.correo === form.correo && a.id !== editAdmin?.id)) {
      toast.error("Ya existe un administrador con ese correo"); return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 350));
    if (editAdmin) {
      setAdmins(prev => prev.map(a => a.id === editAdmin.id
        ? { ...a, ...form, institucionId: Number(form.institucionId) } : a));
      toast.success("Administrador actualizado");
    } else {
      setAdmins(prev => [...prev, {
        ...form, id: Date.now(), rol: "ADMIN_INSTITUCIONAL", activo: true,
        avatar: form.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
        institucionId: Number(form.institucionId),
      }]);
      toast.success(`Administrador ${form.nombre} creado`);
    }
    setShowModal(false); setEditAdmin(null); setForm(FORM_INI); clearErrors(); setSubmitting(false);
  };

  const abrirEditar = (a) => {
    setEditAdmin(a);
    setForm({ nombre: a.nombre, documento: a.documento, correo: a.correo,
      telefono: a.telefono || "", cargo: a.cargo || "Administrador Institucional",
      fechaInicio: a.fechaInicio || "", institucionId: a.institucionId });
    clearErrors(); setShowModal(true);
  };

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setAdmins);
    setConfirmDel(false);
    toast.success(`${count} administrador${count !== 1 ? "es" : ""} eliminado${count !== 1 ? "s" : ""}`);
  };

  return (
    <ModuleLayout
      header={
        <PageHeader title="Administradores Institucionales"
          subtitle="Gestiona los administradores de cada institución"
          icon={Users} color="#3b82f6"
          action={
            <button onClick={() => { setEditAdmin(null); setForm(FORM_INI); clearErrors(); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              <Plus size={14} /> Nuevo administrador
            </button>
          }
        />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar por nombre, documento..." icon={Search} />
        <FilterSelect value={filtroInst} onChange={setFiltroInst}>
          <option value="">Todas las instituciones</option>
          {instituciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
        </FilterSelect>
        <FilterSelect value={filtroEstado} onChange={setFiltroEstado}>
          <option value="">Todos los estados</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </FilterSelect>
      </>}
      count={`${filtrados.length} administrador${filtrados.length !== 1 ? "es" : ""}`}
      toolbar={bulk.count > 0 && (
        <BulkBar count={bulk.count} label="administrador"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}
    >
      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtrados.length} onToggleAll={bulk.toggleAll} label="administrador" />

      <DataTable columns={cols} empty={filtrados.length === 0 ? "No hay administradores que coincidan" : undefined}>
        {filtrados.map(a => {
          const inst = instituciones.find(i => i.id === a.institucionId);
          const isChecked = bulk.selected.has(a.id);
          return (
            <TableRow key={a.id}>
              <Td><Checkbox checked={isChecked} onChange={() => bulk.toggle(a.id)} /></Td>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff" }}>
                    {a.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1e293b" }}>{a.nombre}</p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>{a.documento}</p>
                  </div>
                </div>
              </Td>
              <Td hidden="hidden md:table-cell" muted>{a.correo}</Td>
              <Td hidden="hidden lg:table-cell" muted>
                <span className="truncate block max-w-[200px]">{inst?.nombre || "Sin asignar"}</span>
              </Td>
              <Td><Badge label={a.activo ? "Activo" : "Inactivo"} variant={a.activo ? "success" : "danger"} dot /></Td>
              <Td><ActionBtn icon={Edit} color="blue" title="Editar" onClick={() => abrirEditar(a)} /></Td>
            </TableRow>
          );
        })}
      </DataTable>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="administrador"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />

      <Modal open={showModal} onClose={() => { setShowModal(false); clearErrors(); setEditAdmin(null); }}
        title={editAdmin ? "Editar Administrador" : "Nuevo Administrador"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Nombre completo" required error={errors.nombre}>
                <FormInput required value={form.nombre} placeholder="Nombre completo" error={errors.nombre}
                  onChange={e => f("nombre", e.target.value)} onBlur={e => handleBlur("nombre", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Documento" required error={errors.documento}>
              <FormInput required value={form.documento} placeholder="Cédula" error={errors.documento}
                onChange={e => f("documento", e.target.value)} onBlur={e => handleBlur("documento", e.target.value)} />
            </FormField>
            <FormField label="Teléfono">
              <FormInput value={form.telefono} placeholder="3001234567" onChange={e => f("telefono", e.target.value)} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Correo electrónico" required error={errors.correo}>
                <FormInput required type="email" value={form.correo} placeholder="admin@institucion.edu.co"
                  error={errors.correo}
                  onChange={e => f("correo", e.target.value)} onBlur={e => handleBlur("correo", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Cargo">
              <FormInput value={form.cargo} onChange={e => f("cargo", e.target.value)} />
            </FormField>
            <FormField label="Fecha de inicio" required error={errors.fechaInicio}>
              <FormInput required type="date" value={form.fechaInicio} error={errors.fechaInicio}
                onChange={e => f("fechaInicio", e.target.value)} onBlur={e => handleBlur("fechaInicio", e.target.value)} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Institución" required>
                <FormSelect value={form.institucionId} onChange={e => f("institucionId", e.target.value)}>
                  {instituciones.filter(i => i.activa).map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </FormSelect>
              </FormField>
            </div>
          </div>
          <ModalActions onCancel={() => { setShowModal(false); clearErrors(); setEditAdmin(null); }}
            submitLabel={editAdmin ? "Actualizar" : "Crear administrador"} loading={submitting} />
        </form>
      </Modal>
    </ModuleLayout>
  );
}
