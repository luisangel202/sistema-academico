import { useState, useEffect } from "react";
import { useInstState } from "../../hooks/useInstState";
import {
  Plus, Search, Edit, Camera, Power, Trash2,
  UserCheck, Users, CheckSquare, Square, Trash,
  X, AlertTriangle
} from "lucide-react";
import PageHeader    from "../../components/PageHeader";
import Badge         from "../../components/Badge";
import Modal         from "../../components/Modal";
import ImageUploader from "../../components/ImageUploader";
import ModuleLayout, {
  DataTable, TableRow, Td,
  FilterInput, FilterSelect,
  FormField, FormInput, FormSelect,
  ActionBtn, ModalActions,
} from "../../components/ModuleLayout";
import { ROLE_LABELS, ROLE_COLORS } from "../../data/permissions";
import { usuarios as dataUsuarios }   from "../../data/mockData";
import { useImages }                  from "../../context/ImageContext";
import { useToast }                   from "../../components/Toast";
import { useImportContext } from "../../context/ImportContext";
import { useData } from "../../context/DataContext";

const FORM_VACIO = {
  nombre: "", documento: "", correo: "",
  telefono: "", direccion: "", rol: "DOCENTE",
  especialidad: "", experiencia: "", titulo: "",
};

export default function Usuarios() {
  const { getAvatar, setAvatar } = useImages();
  const toast = useToast();
  const { pendingImport, consumePending } = useImportContext();
  const { agregarUsuario: agregarUsuarioData } = useData();

  const handleImport = (rows) => {
    let importados = 0;
    rows.forEach((row) => {
      const nombre = row.nombre || row.Nombre || row["Nombre Completo"] || "";
      if (!nombre) return;
      setUsuarios(prev => [...prev, {
        id: Date.now() + importados,
        nombre,
        documento: String(row.documento || row.Documento || ""),
        correo: row.correo || row.Correo || row.email || "",
        telefono: row.telefono || row.Telefono || "",
        rol: (row.rol || row.Rol || "DOCENTE").toUpperCase(),
        activo: true,
        avatar: nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
        institucionId: 1,
      }]);
      importados++;
    });
    if (importados > 0) toast.success(`${importados} usuario(s) importado(s)`);
    else toast.error("No se encontraron filas válidas (requiere nombre)");
  };

  useEffect(() => {
    if (pendingImport?.destinationId === "usuarios") {
      handleImport(pendingImport.data);
      consumePending();
    }
  }, [pendingImport]);

  const [usuarios, setUsuarios]       = useInstState("er_usuarios_inst1", dataUsuarios.filter(u => u.institucionId === 1));
  const [search, setSearch]           = useState("");
  const [filtroRol, setFiltroRol]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [editUsuario, setEditUsuario] = useState(null);
  const [fotoUsuario, setFotoUsuario] = useState(null);
  const [form, setForm]               = useState(FORM_VACIO);

  /* ── Selección múltiple ── */
  const [selected, setSelected]         = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const roles = [...new Set(dataUsuarios.map(u => u.rol))];

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.nombre.toLowerCase().includes(q) || u.documento.includes(q) || u.correo.toLowerCase().includes(q);
    const matchRol    = filtroRol    ? u.rol === filtroRol : true;
    const matchEstado = filtroEstado !== "" ? String(u.activo) === filtroEstado : true;
    return matchSearch && matchRol && matchEstado;
  });

  /* Toggle individual */
  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* Seleccionar / deseleccionar todos los visibles */
  const allSelected = filtered.length > 0 && filtered.every(u => selected.has(u.id));
  const someSelected = filtered.some(u => selected.has(u.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(u => n.delete(u.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(u => n.add(u.id)); return n; });
    }
  };

  /* Eliminar seleccionados */
  const eliminarSeleccionados = () => {
    const count = selected.size;
    setUsuarios(prev => prev.filter(u => !selected.has(u.id)));
    setSelected(new Set());
    setConfirmDelete(false);
    toast.success(`${count} usuario${count !== 1 ? "s" : ""} eliminado${count !== 1 ? "s" : ""}`);
  };

  /* Eliminar individual */
  const eliminar = (id, nombre) => {
    if (window.confirm(`¿Eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success(`Usuario "${nombre}" eliminado`);
    }
  };

  const abrirCrear = () => { setEditUsuario(null); setForm(FORM_VACIO); setShowModal(true); };
  const abrirEditar = (u) => {
    setEditUsuario(u);
    setForm({ nombre: u.nombre, documento: u.documento, correo: u.correo, telefono: u.telefono || "", direccion: u.direccion || "", rol: u.rol, especialidad: u.especialidad || "", experiencia: u.experiencia || "", titulo: u.titulo || "" });
    setShowModal(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editUsuario) {
      setUsuarios(prev => prev.map(u => u.id === editUsuario.id ? { ...u, ...form } : u));
    } else {
      setUsuarios(prev => [...prev, { ...form, id: Date.now(), institucionId: 1, activo: true, avatar: form.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() }]);
      agregarUsuarioData({ ...form, id: Date.now(), institucionId: 1, activo: true, avatar: form.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() });
    }
    setShowModal(false); setForm(FORM_VACIO); setEditUsuario(null);
  };
  const toggleEstado = (id, activo) => {
    if (window.confirm(`¿${activo ? "Desactivar" : "Activar"} este usuario?`)) {
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !activo } : u));
    }
  };

  const cols = [
    { label: "" },                                        /* checkbox */
    { label: "Usuario" },
    { label: "Documento",  hidden: "hidden md:table-cell" },
    { label: "Correo",     hidden: "hidden lg:table-cell" },
    { label: "Rol" },
    { label: "Estado" },
    { label: "Acciones" },
  ];

  return (
    <ModuleLayout
      header={
        <PageHeader
          title="Personal Institucional"
          subtitle="Docentes y personal administrativo"
          icon={Users} color="#3b82f6"
          action={
            <button onClick={abrirCrear}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              <Plus size={14} /> Nuevo personal
            </button>
          }
        />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar por nombre, documento..." icon={Search} />
        <FilterSelect value={filtroRol} onChange={setFiltroRol}>
          <option value="">Todos los roles</option>
          {roles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </FilterSelect>
        <FilterSelect value={filtroEstado} onChange={setFiltroEstado}>
          <option value="">Todos los estados</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </FilterSelect>
      </>}
      count={`${filtered.length} registro${filtered.length !== 1 ? "s" : ""}`}
      toolbar={
        selected.size > 0 && (
          <BulkBar
            count={selected.size}
            onClear={() => setSelected(new Set())}
            onDelete={() => setConfirmDelete(true)}
          />
        )
      }
    >
      <DataTable columns={cols} empty={filtered.length === 0 ? "No hay personal que coincida" : undefined}>
        {/* Fila de cabecera con checkbox "todos" */}
        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f0f4fa" }}>
          <th style={{ padding: "10px 12px 10px 18px", width: 40 }}>
            <CheckboxCell
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={toggleAll}
            />
          </th>
          {cols.slice(1).map((c, i) => (
            <th key={i} className={c.hidden || ""}
              style={{ textAlign: "left", padding: "10px 18px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8" }}>
              {c.label}
            </th>
          ))}
        </tr>

        {filtered.map(u => {
          const isChecked = selected.has(u.id);
          return (
            <TableRow key={u.id}>
              <Td>
                <CheckboxCell checked={isChecked} onChange={() => toggleSelect(u.id)} />
              </Td>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0 group cursor-pointer"
                    onClick={() => setFotoUsuario(u)} title="Cambiar foto">
                    {getAvatar(u.id)
                      ? <img src={getAvatar(u.id)} alt={u.nombre} className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
                          style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
                          {u.avatar}
                        </div>
                    }
                    <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      style={{ background: "rgba(0,0,0,0.35)" }}>
                      <Camera size={11} color="#fff" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1e293b" }}>{u.nombre}</p>
                    <p className="text-xs truncate lg:hidden" style={{ color: "#94a3b8" }}>{u.correo}</p>
                  </div>
                </div>
              </Td>
              <Td hidden="hidden md:table-cell" muted><span className="font-mono text-xs">{u.documento}</span></Td>
              <Td hidden="hidden lg:table-cell" muted>{u.correo}</Td>
              <Td>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ROLE_COLORS[u.rol]}`}>
                  {ROLE_LABELS[u.rol]}
                </span>
              </Td>
              <Td>
                <Badge label={u.activo ? "Activo" : "Inactivo"} variant={u.activo ? "success" : "danger"} dot />
              </Td>
              <Td>
                <div className="flex items-center gap-0.5">
                  <ActionBtn icon={Edit}    color="blue"   title="Editar"    onClick={() => abrirEditar(u)} />
                  <ActionBtn icon={u.activo ? Power : UserCheck} color={u.activo ? "orange" : "green"}
                    title={u.activo ? "Desactivar" : "Activar"}
                    onClick={() => toggleEstado(u.id, u.activo)} />
                  <ActionBtn icon={Trash2}  color="red"    title="Eliminar"  onClick={() => eliminar(u.id, u.nombre)} />
                </div>
              </Td>
            </TableRow>
          );
        })}
      </DataTable>

      {/* Modal foto */}
      <Modal open={!!fotoUsuario} onClose={() => setFotoUsuario(null)}
        title={fotoUsuario ? `Foto — ${fotoUsuario.nombre}` : ""} size="sm">
        {fotoUsuario && (
          <div className="flex flex-col items-center gap-5 py-2">
            <ImageUploader currentImage={getAvatar(fotoUsuario.id)} onImage={url => setAvatar(fotoUsuario.id, url)} onRemove={() => setAvatar(fotoUsuario.id, null)} shape="circle" size={96} placeholder={fotoUsuario.avatar} label="Cargar foto" />
            <p className="text-sm font-semibold" style={{ color: "#1e293b" }}>{fotoUsuario.nombre}</p>
            <button onClick={() => setFotoUsuario(null)} className="w-full py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>Listo</button>
          </div>
        )}
      </Modal>

      {/* Modal crear/editar */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditUsuario(null); }}
        title={editUsuario ? "Editar Personal" : "Registrar Personal"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre completo" required><FormInput required value={form.nombre} placeholder="María González" onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></FormField>
            <FormField label="Documento" required><FormInput required value={form.documento} placeholder="123456789" onChange={e => setForm(p => ({ ...p, documento: e.target.value }))} /></FormField>
            <FormField label="Correo" required><FormInput required type="email" value={form.correo} placeholder="correo@email.com" onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} /></FormField>
            <FormField label="Teléfono"><FormInput value={form.telefono} placeholder="3001234567" onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} /></FormField>
            <FormField label="Rol" required>
              <FormSelect value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}>
                <option value="DOCENTE">Docente</option>
                <option value="DIRECTOR_GRUPO">Director de Grupo</option>
                <option value="COORDINADOR">Coordinador Académico</option>
                <option value="SECRETARIA">Secretaria Académica</option>
                <option value="PSICOORIENTADOR">Psicoorientador</option>
              </FormSelect>
            </FormField>
            <FormField label="Título Profesional"><FormInput value={form.titulo} placeholder="Lic. en Matemáticas" onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} /></FormField>
          </div>
          <ModalActions onCancel={() => { setShowModal(false); setEditUsuario(null); }} submitLabel={editUsuario ? "Actualizar" : "Registrar"} />
        </form>
      </Modal>

      {/* Modal confirmar eliminación masiva */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Eliminar personal seleccionado" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
            <AlertTriangle size={18} style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 14, color: "#9f1239", lineHeight: 1.6 }}>
              ¿Eliminar <strong>{selected.size} usuario{selected.size !== 1 ? "s" : ""}</strong>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border"
              style={{ background: "#fff", color: "#64748b", borderColor: "#e8edf5" }}>
              Cancelar
            </button>
            <button onClick={eliminarSeleccionados}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 3px 12px rgba(239,68,68,0.30)" }}>
              Eliminar {selected.size} registro{selected.size !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </Modal>
    </ModuleLayout>
  );
}

/* ── Sub-componentes ──────────────────────────────────────── */

function CheckboxCell({ checked, indeterminate, onChange }) {
  return (
    <div onClick={e => { e.stopPropagation(); onChange(); }}
      style={{
        width: 18, height: 18, borderRadius: 5, cursor: "pointer",
        border: `2px solid ${checked || indeterminate ? "#2563eb" : "#d1d5db"}`,
        background: checked || indeterminate ? "#2563eb" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 150ms", flexShrink: 0,
      }}>
      {indeterminate && !checked
        ? <div style={{ width: 8, height: 2, background: "#fff", borderRadius: 2 }} />
        : checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      }
    </div>
  );
}

function BulkBar({ count, onClear, onDelete }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 14px", borderRadius: 12,
      background: "#eff6ff", border: "1px solid #bfdbfe",
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
        {count} seleccionado{count !== 1 ? "s" : ""}
      </span>
      <button onClick={onDelete}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "#fff1f2", border: "1px solid #fecdd3", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 150ms" }}
        onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#fff1f2"; }}>
        <Trash size={13} /> Eliminar
      </button>
      <button onClick={onClear}
        style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: "transparent", border: "none", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        <X size={13} /> Cancelar
      </button>
    </div>
  );
}
