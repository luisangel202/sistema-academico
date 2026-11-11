import {
  Building2, Users, Shield, Database,
  AlertTriangle, CheckCircle, XCircle, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import StatCard   from "../../components/StatCard";
import Badge      from "../../components/Badge";
import PageHeader from "../../components/PageHeader";
import { instituciones, estadisticasGlobales } from "../../data/mockData";

const dataInstituciones = [
  { name: "El Progreso", estudiantes: 320, docentes: 18 },
  { name: "San José",    estudiantes: 210, docentes: 12 },
  { name: "La Esperanza",estudiantes: 0,   docentes: 0  },
];

const dataLicencias = [
  { name: "Premium", value: 1, color: "#7c3aed" },
  { name: "Básica",  value: 2, color: "#cbd5e1"  },
];

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e8edf5",
      borderRadius: 10, padding: "8px 14px",
      boxShadow: "0 4px 16px rgba(15,23,42,0.10)",
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: 12, fontWeight: 700, color: p.fill, marginBottom: 2 }}>
          {p.name}: <span style={{ color: "#0f172a" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard Global"
        subtitle="Vista general de todas las instituciones y el sistema"
        icon={BarChart3}
        color="#7c3aed"
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
        <StatCard
          title="Instituciones Activas"
          value={estadisticasGlobales.institucionesActivas}
          subtitle={`de ${estadisticasGlobales.totalInstituciones} registradas`}
          icon={Building2} color="blue"
        />
        <StatCard
          title="Total Usuarios"
          value={estadisticasGlobales.totalUsuarios.toLocaleString()}
          subtitle="en todas las instituciones"
          icon={Users} color="green"
        />
        <StatCard
          title="Licencias Premium"
          value={estadisticasGlobales.licenciasPremium}
          subtitle={`${estadisticasGlobales.licenciasBasicas} básicas activas`}
          icon={Shield} color="purple"
        />
        <StatCard
          title="Backups Recientes"
          value={estadisticasGlobales.backupsRecientes}
          subtitle="últimos 7 días"
          icon={Database} color="teal"
        />
      </div>

      {/* Gráficas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>

        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #f4f6fb" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Estudiantes y Docentes por Institución</p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Comparativo de matrícula activa</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#faf5ff", color: "#7c3aed" }}>2025</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataInstituciones} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f6fb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="estudiantes" fill="#3b82f6" radius={[6,6,0,0]} name="Estudiantes" maxBarSize={36} />
                <Bar dataKey="docentes"    fill="#10b981" radius={[6,6,0,0]} name="Docentes"    maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Leyenda */}
          <div className="flex items-center gap-5 px-5 pb-4">
            {[{ color: "#3b82f6", label: "Estudiantes" }, { color: "#10b981", label: "Docentes" }].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                <span className="text-xs font-semibold" style={{ color: "#64748b" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie licencias */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #f4f6fb" }}>
            <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Distribución de Licencias</p>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Estado actual</p>
          </div>
          <div className="flex flex-col items-center p-5">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={dataLicencias} cx="50%" cy="50%"
                  innerRadius={48} outerRadius={68}
                  dataKey="value" paddingAngle={4} strokeWidth={0}>
                  {dataLicencias.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e8edf5", fontSize: 12, fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 mt-2">
              {dataLicencias.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-sm font-medium" style={{ color: "#475569" }}>{d.name}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#0f172a" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla instituciones */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #f4f6fb" }}>
          <div>
            <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Instituciones Registradas</p>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{instituciones.length} instituciones en el sistema</p>
          </div>
          <Building2 size={16} style={{ color: "#cbd5e1" }} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f0f4fa" }}>
                {[
                  { label: "Institución", cls: "" },
                  { label: "Municipio",   cls: "hidden md:table-cell" },
                  { label: "Licencia",    cls: "" },
                  { label: "Vencimiento", cls: "hidden lg:table-cell" },
                  { label: "Estado",      cls: "" },
                ].map(h => (
                  <th key={h.label}
                    className={`text-left px-5 py-3 text-[11px] font-black uppercase tracking-widest ${h.cls}`}
                    style={{ color: "#94a3b8" }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {instituciones.map((inst, idx) => (
                <tr key={inst.id}
                  style={{ borderBottom: idx < instituciones.length - 1 ? "1px solid #f8fafc" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "#eff6ff" }}>
                        <Building2 size={14} style={{ color: "#3b82f6" }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#1e293b" }}>{inst.nombre}</p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>{inst.codigo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm" style={{ color: "#64748b" }}>{inst.municipio}, {inst.departamento}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge label={inst.licencia} variant={inst.licencia} />
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-sm" style={{ color: "#64748b" }}>{inst.vencimiento}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {inst.activa ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#16a34a" }}>
                        <CheckCircle size={13} /> Activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#dc2626" }}>
                        <XCircle size={13} /> Inactiva
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerta técnica */}
      <div className="flex items-start gap-4 px-5 py-4 rounded-2xl"
        style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#fef3c7" }}>
          <AlertTriangle size={16} style={{ color: "#d97706" }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "#92400e" }}>Alerta del sistema</p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#b45309" }}>
            Licencia de "Escuela Rural La Esperanza" vencida desde marzo 2025.
            Institución desactivada automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
