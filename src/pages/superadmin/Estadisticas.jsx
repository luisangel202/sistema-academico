import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { Users, GraduationCap, Building2, TrendingUp } from "lucide-react";

const matriculasPorMes = [
  { mes: "Ene", matriculas: 480 },
  { mes: "Feb", matriculas: 510 },
  { mes: "Mar", matriculas: 525 },
  { mes: "Abr", matriculas: 530 },
  { mes: "May", matriculas: 530 },
];

const rendimientoPorInst = [
  { inst: "El Progreso", promedio: 3.9 },
  { inst: "San José", promedio: 3.7 },
];

const distribucionRoles = [
  { name: "Estudiantes", value: 530, color: "#3b82f6" },
  { name: "Docentes", value: 30, color: "#10b981" },
  { name: "Administrativos", value: 12, color: "#f59e0b" },
  { name: "Padres", value: 668, color: "#8b5cf6" },
];

export default function Estadisticas() {
  return (
    <div>
      <PageHeader
        title="Estadísticas Globales"
        subtitle="Métricas agregadas de todas las instituciones"
        icon={TrendingUp}
        color="#3b82f6"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Estudiantes" value="530" subtitle="en 2 instituciones activas" icon={GraduationCap} color="blue" />
        <StatCard title="Total Docentes" value="30" subtitle="activos en el sistema" icon={Users} color="green" />
        <StatCard title="Instituciones" value="2" subtitle="activas de 3 registradas" icon={Building2} color="indigo" />
        <StatCard title="Promedio Global" value="3.8" subtitle="todas las instituciones" icon={TrendingUp} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Matrículas por Mes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={matriculasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis domain={[450, 550]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="matriculas" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Matrículas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Promedio por Institución</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rendimientoPorInst}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="inst" tick={{ fontSize: 11 }} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="promedio" fill="#6366f1" radius={[4, 4, 0, 0]} name="Promedio" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Distribución de Usuarios por Rol</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={distribucionRoles} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {distribucionRoles.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-3 min-w-40">
            {distribucionRoles.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-gray-600">{d.name}</span>
                <span className="ml-auto font-semibold text-gray-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
