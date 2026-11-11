import { Heart, Calendar, AlertTriangle, CheckCircle, ArrowRight, Clock, Brain } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/Badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { alertas, usuarios } from "../../data/mockData";

/* Datos seed de casos y citas — en producción vendrán del backend */
const CASOS_SEED = [
  { estudianteId: 10, tipo: "Riesgo académico", nivel: "medio", fecha: "2025-05-05" },
  { estudianteId: 9,  tipo: "Convivencia",      nivel: "bajo",  fecha: "2025-04-28" },
];

const CITAS_HOY_SEED = [
  { estudianteId: 10, hora: "09:00", tipo: "Seguimiento"      },
  { estudianteId: 12, hora: "11:00", tipo: "Primera atención" },
];

const nivelVariant = { alto: "danger", medio: "warning", bajo: "success" };
const nivelColor   = { alto: "#ef4444", medio: "#f59e0b", bajo: "#22c55e" };
const nivelBg      = { alto: "#fee2e2", medio: "#fef3c7", bajo: "#f0fdf4" };

export default function PsicoDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  /* Enriquecer casos con datos reales de usuarios */
  const casosActivos = CASOS_SEED.map(c => {
    const est = usuarios.find(u => u.id === c.estudianteId);
    return { ...c, nombre: est?.nombre || "Estudiante", avatar: est?.avatar || "??" };
  });

  const citasHoy = CITAS_HOY_SEED.map(c => {
    const est = usuarios.find(u => u.id === c.estudianteId);
    return { ...c, nombre: est?.nombre || "Estudiante", avatar: est?.avatar || "??" };
  });

  const alertasSinAtender = alertas.filter(a => !a.leida && a.nivel === "alto").length;

  /* Fecha actual legible */
  const hoy = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  const hoyCapital = hoy.charAt(0).toUpperCase() + hoy.slice(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Psicoorientación"
        subtitle={`${user?.nombre} · IE Rural El Progreso · Período 2 — 2025`}
        icon={Heart}
        color="#f97316"
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 16 }}>
        <StatCard title="Casos Activos"    value={casosActivos.length} subtitle="en seguimiento"  icon={Heart}         color="orange" />
        <StatCard title="Citas Hoy"        value={citasHoy.length}     subtitle="programadas"     icon={Calendar}      color="blue"   />
        <StatCard title="Planes de Apoyo"  value={2}                   subtitle="en ejecución"    icon={CheckCircle}   color="green"  />
        <StatCard title="Alertas Críticas" value={alertasSinAtender}   subtitle="sin atender"     icon={AlertTriangle} color="red"    />
      </div>

      {/* Agenda del día */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-lg">Agenda de Hoy</p>
            <p className="text-orange-200 text-sm">{hoyCapital} · {citasHoy.length} citas programadas</p>
          </div>
          <button onClick={() => navigate("/citas")}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl font-semibold border-0 cursor-pointer transition flex items-center gap-1">
            Ver agenda <ArrowRight size={12} />
          </button>
        </div>
        {citasHoy.length === 0 ? (
          <p className="text-orange-200 text-sm text-center py-3">Sin citas programadas para hoy</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {citasHoy.map((c, i) => (
              <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl p-3.5 flex items-center gap-3 border border-white/20">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{c.nombre}</p>
                  <p className="text-orange-200 text-xs">{c.tipo}</p>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg flex-shrink-0">
                  <Clock size={11} />
                  <span className="text-xs font-bold">{c.hora}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
        {/* Casos en seguimiento */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">Casos en Seguimiento</h3>
              <p className="text-xs text-gray-400 mt-0.5">{casosActivos.length} casos activos</p>
            </div>
            <button onClick={() => navigate("/casos")}
              className="text-xs text-orange-600 hover:text-orange-800 bg-transparent border-0 cursor-pointer flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          {casosActivos.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">Sin casos activos</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {casosActivos.map((c, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/60 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: nivelBg[c.nivel], color: nivelColor[c.nivel] }}>
                      {c.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.nombre}</p>
                      <p className="text-xs text-gray-400">{c.tipo} · {c.fecha}</p>
                    </div>
                  </div>
                  <Badge label={`Riesgo ${c.nivel}`} variant={nivelVariant[c.nivel]} dot />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-gray-800 text-sm px-1">Acciones Rápidas</h3>
          {[
            { label: "Nuevo Caso",      icon: Heart,       path: "/casos",        color: "#f97316", bg: "#fff7ed" },
            { label: "Programar Cita",  icon: Calendar,    path: "/citas",        color: "#3b82f6", bg: "#eff6ff" },
            { label: "Plan de Apoyo",   icon: CheckCircle, path: "/planes-apoyo", color: "#10b981", bg: "#f0fdf4" },
            { label: "IA Académica",    icon: Brain,       path: "/ia-academica", color: "#8b5cf6", bg: "#faf5ff" },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: a.bg }}>
                <a.icon size={18} style={{ color: a.color }} />
              </div>
              <span className="text-sm font-semibold text-gray-700">{a.label}</span>
              <ArrowRight size={14} className="ml-auto text-gray-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
