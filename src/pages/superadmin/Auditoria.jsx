import { useState } from "react";
import { usePersistedState } from "../../hooks/usePersistedState";
import { Search, Shield, X } from "lucide-react";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import { useToast } from "../../components/Toast";
import PageHeader from "../../components/PageHeader";
import ModuleLayout, { DataTable, TableRow, Td, FilterInput, FilterSelect } from "../../components/ModuleLayout";
import { auditoria as dataAuditoria, usuarios } from "../../data/mockData";

const accionesUnicas = [...new Set(dataAuditoria.map(a => a.accion))];
const accionColor = {
  LOGIN:   { bg: "#eff6ff", text: "#2563eb" },
  LOGOUT:  { bg: "#f8fafc", text: "#64748b" },
  CREATE:  { bg: "#f0fdf4", text: "#16a34a" },
  UPDATE:  { bg: "#fffbeb", text: "#d97706" },
  DELETE:  { bg: "#fff1f2", text: "#dc2626" },
};

const cols = [
  { label: "" },
  { label: "Fecha/Hora" },
  { label: "Usuario" },
  { label: "Acción" },
  { label: "Detalle",  hidden: "hidden md:table-cell" },
  { label: "IP",       hidden: "hidden lg:table-cell" },
];

export default function Auditoria() {
  const toast = useToast();
  const [registros, setRegistros]   = usePersistedState("er_auditoria", dataAuditoria);
  const [search, setSearch]         = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroAccion, setFiltroAccion]   = useState("");
  const [filtroDesde, setFiltroDesde]     = useState("");
  const [filtroHasta, setFiltroHasta]     = useState("");
  const [confirmDel, setConfirmDel]       = useState(false);

  const hayFiltros = search || filtroUsuario || filtroAccion || filtroDesde || filtroHasta;
  const limpiar = () => {
    setSearch(""); setFiltroUsuario(""); setFiltroAccion("");
    setFiltroDesde(""); setFiltroHasta("");
  };

  const filtered = registros.filter(a => {
    const usuario = usuarios.find(u => u.id === a.usuarioId);
    const matchSearch  = !search ||
      a.accion.toLowerCase().includes(search.toLowerCase()) ||
      a.detalle.toLowerCase().includes(search.toLowerCase()) ||
      (usuario?.nombre || "").toLowerCase().includes(search.toLowerCase());
    const matchUsuario = filtroUsuario ? a.usuarioId === Number(filtroUsuario) : true;
    const matchAccion  = filtroAccion  ? a.accion === filtroAccion             : true;
    const matchDesde   = filtroDesde   ? a.fecha >= filtroDesde               : true;
    const matchHasta   = filtroHasta   ? a.fecha <= filtroHasta               : true;
    return matchSearch && matchUsuario && matchAccion && matchDesde && matchHasta;
  });

  const bulk = useBulkSelect(filtered);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setRegistros);
    setConfirmDel(false);
    toast.success(`${count} registro${count !== 1 ? "s" : ""} eliminado${count !== 1 ? "s" : ""}`);
  };

  return (
    <ModuleLayout
      header={
        <PageHeader title="Auditoría Global"
          subtitle="Registro de todas las acciones críticas del sistema"
          icon={Shield} color="#2563eb" />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar acción, detalle o usuario..." icon={Search} />
        <FilterSelect value={filtroUsuario} onChange={setFiltroUsuario}>
          <option value="">Todos los usuarios</option>
          {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </FilterSelect>
        <FilterSelect value={filtroAccion} onChange={setFiltroAccion}>
          <option value="">Todas las acciones</option>
          {accionesUnicas.map(a => <option key={a} value={a}>{a}</option>)}
        </FilterSelect>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium flex-shrink-0" style={{ color: "#64748b" }}>Desde</span>
          <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)}
            className="rounded-xl text-sm outline-none"
            style={{ padding: "8px 12px", background: "#f8fafc", border: "1.5px solid #e4eaf3", color: "#374151" }}
            onFocus={e => { e.target.style.borderColor = "#3b82f6"; }}
            onBlur={e => { e.target.style.borderColor = "#e4eaf3"; }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium flex-shrink-0" style={{ color: "#64748b" }}>Hasta</span>
          <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)}
            className="rounded-xl text-sm outline-none"
            style={{ padding: "8px 12px", background: "#f8fafc", border: "1.5px solid #e4eaf3", color: "#374151" }}
            onFocus={e => { e.target.style.borderColor = "#3b82f6"; }}
            onBlur={e => { e.target.style.borderColor = "#e4eaf3"; }}
          />
        </div>
        {hayFiltros && (
          <button onClick={limpiar}
            className="flex items-center gap-1 text-xs font-semibold rounded-lg px-2.5 py-1.5 border-0 cursor-pointer"
            style={{ background: "#f1f5f9", color: "#64748b" }}>
            <X size={12} /> Limpiar
          </button>
        )}
      </>}
      count={`${filtered.length} registro${filtered.length !== 1 ? "s" : ""}`}
      toolbar={bulk.count > 0 && (
        <BulkBar count={bulk.count} label="registro"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}
    >
      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtered.length} onToggleAll={bulk.toggleAll} label="registro" />

      <DataTable columns={cols} empty={filtered.length === 0 ? "No hay registros que coincidan" : undefined}>
        {filtered.map(a => {
          const usuario = usuarios.find(u => u.id === a.usuarioId);
          const acColor = accionColor[a.accion?.toUpperCase()] || accionColor.UPDATE;
          const isChecked = bulk.selected.has(a.id);
          return (
            <TableRow key={a.id}>
              <Td><Checkbox checked={isChecked} onChange={() => bulk.toggle(a.id)} /></Td>
              <Td>
                <p className="text-sm font-semibold whitespace-nowrap" style={{ color: "#1e293b" }}>
                  {a.fecha?.split("T")[0] || a.fecha}
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  {a.fecha?.includes("T") ? a.fecha.split("T")[1]?.slice(0, 5) : ""}
                </p>
              </Td>
              <Td>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", color: "#2563eb" }}>
                    {usuario?.avatar || "?"}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>
                    {usuario?.nombre || "Desconocido"}
                  </span>
                </div>
              </Td>
              <Td>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: acColor.bg, color: acColor.text }}>
                  <Shield size={10} /> {a.accion}
                </span>
              </Td>
              <Td hidden="hidden md:table-cell" muted>
                <span className="max-w-xs block truncate text-sm">{a.detalle}</span>
              </Td>
              <Td hidden="hidden lg:table-cell" muted>
                <span className="font-mono text-xs">{a.ip}</span>
              </Td>
            </TableRow>
          );
        })}
      </DataTable>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="registro"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </ModuleLayout>
  );
}
