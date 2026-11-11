import {
  BookOpen, FileText, CheckSquare, Users,
  Clock, ArrowRight, LayoutDashboard, Calendar, Play
} from "lucide-react";
import StatCard   from "../../components/StatCard";
import Badge      from "../../components/Badge";
import PageHeader from "../../components/PageHeader";
import { cursos, tareas, materias } from "../../data/mockData";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

const horarioHoy = [
  { hora: "7:00 – 8:00",   materia: "Matemáticas",       curso: "7A", salon: "Aula 3", color: "#3b82f6" },
  { hora: "8:00 – 9:00",   materia: "Matemáticas",       curso: "6A", salon: "Aula 1", color: "#3b82f6" },
  { hora: "10:00 – 11:00", materia: "Ciencias Naturales", curso: "7A", salon: "Aula 3", color: "#10b981" },
  { hora: "14:00 – 15:00", materia: "Ciencias Naturales", curso: "6A", salon: "Aula 1", color: "#10b981" },
];

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl overflow-hidden ${className}`}
    style={{ background: "#fff", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon, action, subtitle }) => (
  <div className="flex items-center justify-between px-5 py-4"
    style={{ borderBottom: "1px solid #f4f6fb" }}>
    <div className="flex items-center gap-2">
      {Icon && <Icon size={14} style={{ color: "#94a3b8" }} />}
      <div>
        <p className="text-sm font-bold" style={{ color: "#0f172a" }}>{title}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const NavBtn = ({ label, path, navigate }) => (
  <button onClick={() => navigate(path)}
    className="flex items-center gap-1 text-xs font-semibold border-0 bg-transparent cursor-pointer"
    style={{ color: "#2563eb" }}>
    {label} <ArrowRight size={12} />
  </button>
);

export default function DocenteDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMateriasByDocente, getEstudiantesByCurso, materias: todasMaterias } = useData();
  const misMaterias = getMateriasByDocente(user?.id);
  const misTareas   = tareas.filter(t => t.docenteId === user?.id);
  const totalEstudiantes = [...new Set(misMaterias.map(m => m.cursoId))]
    .flatMap(cId => getEstudiantesByCurso(cId)).length;
  const activas     = misTareas.filter(t => t.estado === "activa");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mi Panel Docente"
        subtitle="Luis Herrera · Docente · Período 2 — 2025"
        icon={LayoutDashboard}
        color="#2563eb"
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
        <StatCard title="Mis Materias"   value={misMaterias.length} subtitle="asignadas este período"   icon={BookOpen}    color="blue"   />
        <StatCard title="Tareas Activas" value={activas.length}       subtitle="pendientes de revisión"   icon={FileText}    color="yellow" />
        <StatCard title="Asistencia Hoy" value="Pendiente"            subtitle="marcar antes de las 10am" icon={CheckSquare} color="orange" />
        <StatCard title="Estudiantes"    value={totalEstudiantes}     subtitle="en mis cursos"            icon={Users}       color="green"  />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {/* Materias */}
        <Card>
          <SectionHeader title="Mis Materias" icon={BookOpen}
            action={<NavBtn label="Ver cursos" path="/mis-cursos" navigate={navigate} />} />
          <div className="p-4 space-y-2">
            {misMaterias.map(m => {
              const curso = cursos.find(c => c.id === m.cursoId);
              return (
                <div key={m.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
                  style={{ background: "#f8fafc" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}>
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1e293b" }}>{m.nombre}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      {curso?.nombre} · {m.intensidad}h/sem
                    </p>
                  </div>
                  <Badge label={m.codigo} variant="info" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Tareas */}
        <Card>
          <SectionHeader title="Tareas Recientes" icon={FileText}
            action={<NavBtn label="Ver todas" path="/tareas" navigate={navigate} />} />
          <div className="p-4 space-y-2">
            {misTareas.map(t => (
              <div key={t.id} className="flex items-start justify-between px-3 py-2.5 rounded-xl transition-colors"
                style={{ background: "#f8fafc" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}>
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1e293b" }}>{t.titulo}</p>
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#94a3b8" }}>
                    <Clock size={10} /> Vence: {t.fechaLimite}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    {t.entregas} entregas recibidas
                  </p>
                </div>
                <Badge label={t.estado} variant={t.estado} dot />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Horario hoy */}
      <Card>
        <SectionHeader
          title="Horario de Hoy"
          subtitle="Lunes · 17 de agosto"
          icon={Calendar}
          action={<NavBtn label="Calendario" path="/calendario" navigate={navigate} />}
        />
        <div className="p-4 space-y-1.5">
          {horarioHoy.map((h, i) => (
            <div key={i}
              className="flex items-center gap-4 px-4 py-3 rounded-xl group transition-colors"
              style={{ background: "#f8fafc" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
              onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}>

              {/* Hora */}
              <div className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-center min-w-[96px]"
                style={{ background: `${h.color}12`, color: h.color, border: `1px solid ${h.color}22` }}>
                {h.hora}
              </div>

              {/* Acento */}
              <div className="w-0.5 h-8 rounded-full flex-shrink-0"
                style={{ background: `${h.color}40` }} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "#1e293b" }}>{h.materia}</p>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                  {h.curso} · {h.salon}
                </p>
              </div>

              {/* Acción */}
              <button onClick={() => navigate("/asistencia")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                  border-0 cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                style={{ background: `${h.color}12`, color: h.color, border: `1px solid ${h.color}22` }}>
                <Play size={10} /> Pasar lista
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
