import { useState } from "react";
import { Users, Star, AlertTriangle, Search } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import ModuleLayout, { DataTable, TableRow, Td, FilterInput, FilterSelect } from "../../components/ModuleLayout";
import { cursos } from "../../data/mockData";

const estudiantesGrupo = [
  { id: 9,  nombre: "Juan Pérez",        promedio: 4.1, asistencia: 94,  estado: "bien"   },
  { id: 10, nombre: "Sofía Torres",       promedio: 2.9, asistencia: 88,  estado: "riesgo" },
  { id: 12, nombre: "Carlos Ruiz",        promedio: 3.5, asistencia: 96,  estado: "bien"   },
  { id: 13, nombre: "Laura Gómez",        promedio: 4.3, asistencia: 100, estado: "bien"   },
  { id: 14, nombre: "Miguel Ángel Díaz",  promedio: 3.1, asistencia: 90,  estado: "alerta" },
  { id: 15, nombre: "Valentina Moreno",   promedio: 4.5, asistencia: 98,  estado: "bien"   },
];

const estadoVariant = { bien: "success", alerta: "warning", riesgo: "danger" };

const cols = [
  { label: "Estudiante" },
  { label: "Promedio",   hidden: "" },
  { label: "Asistencia", hidden: "" },
  { label: "Estado" },
  { label: "",           hidden: "" },
];

export default function MiGrupo() {
  const [search, setSearch]         = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const miCurso = cursos.find(c => c.id === 2);
  const promGrupo = (estudiantesGrupo.reduce((a, b) => a + b.promedio, 0) / estudiantesGrupo.length).toFixed(1);

  const filtrados = estudiantesGrupo.filter(e => {
    const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado ? e.estado === filtroEstado : true;
    return matchSearch && matchEstado;
  });

  const stats = [
    { label: "Estudiantes",    value: estudiantesGrupo.length,                              icon: Users,         bg: "#eff6ff", iconColor: "#2563eb"  },
    { label: "Promedio grupo", value: promGrupo,                                             icon: Star,          bg: "#fffbeb", iconColor: "#d97706"  },
    { label: "En riesgo",      value: estudiantesGrupo.filter(e => e.estado === "riesgo").length, icon: AlertTriangle, bg: "#fff1f2", iconColor: "#dc2626"  },
  ];

  return (
    <ModuleLayout
      header={
        <PageHeader title="Mi Grupo" subtitle={`${miCurso?.nombre || "Grupo asignado"} · Director de Grupo`}
          icon={Users} color="#14b8a6" />
      }
      filters={<>
        <FilterInput value={search} onChange={setSearch} placeholder="Buscar estudiante..." icon={Search} />
        <FilterSelect value={filtroEstado} onChange={setFiltroEstado}>
          <option value="">Todos los estados</option>
          <option value="bien">Bien</option>
          <option value="alerta">Alerta</option>
          <option value="riesgo">Riesgo</option>
        </FilterSelect>
      </>}
      count={`${filtrados.length} estudiante${filtrados.length !== 1 ? "s" : ""}`}
    >
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.iconColor }} />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: "#1e293b" }}>{s.value}</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <DataTable columns={cols} empty={filtrados.length === 0 ? "No hay estudiantes que coincidan" : undefined}>
        {filtrados.map(e => {
          const promColor = e.promedio >= 3.5 ? "#16a34a" : e.promedio >= 3.0 ? "#d97706" : "#dc2626";
          const initials  = e.nombre.split(" ").map(n => n[0]).join("").slice(0, 2);
          const avatarBg  = e.estado === "riesgo" ? { bg: "#fff1f2", text: "#dc2626" } : e.estado === "alerta" ? { bg: "#fffbeb", text: "#d97706" } : { bg: "#f0fdf4", text: "#16a34a" };

          return (
            <TableRow key={e.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: avatarBg.bg, color: avatarBg.text }}>
                    {initials}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#1e293b" }}>{e.nombre}</span>
                </div>
              </Td>
              <Td>
                <span className="text-base font-black" style={{ color: promColor }}>{e.promedio}</span>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9", maxWidth: 60 }}>
                    <div className="h-full rounded-full" style={{ width: `${e.asistencia}%`, background: e.asistencia >= 90 ? "#22c55e" : "#f59e0b" }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#374151" }}>{e.asistencia}%</span>
                </div>
              </Td>
              <Td>
                <Badge label={e.estado === "bien" ? "Bien" : e.estado === "alerta" ? "Alerta" : "Riesgo"}
                  variant={estadoVariant[e.estado]} dot />
              </Td>
              <Td>
                <button className="text-xs font-semibold border-0 bg-transparent cursor-pointer"
                  style={{ color: "#2563eb" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#1d4ed8"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#2563eb"; }}>
                  Ver observaciones
                </button>
              </Td>
            </TableRow>
          );
        })}
      </DataTable>
    </ModuleLayout>
  );
}
