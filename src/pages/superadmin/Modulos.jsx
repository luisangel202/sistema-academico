import { useState } from "react";
import {
  ToggleLeft, ToggleRight, Lock, Users, BookOpen,
  Star, CheckSquare, FileText, BarChart3, MessageSquare,
  Heart, Bot, Brain, Search, Settings
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import ModuleLayout, { FilterSelect } from "../../components/ModuleLayout";

/* Mapa de iconos — sin emojis */
const ICONS = {
  1:  Lock, 2: Users, 3: BookOpen, 4: Star,
  5:  CheckSquare, 6: FileText, 7: BarChart3, 8: MessageSquare,
  9:  Heart, 10: Bot, 11: Brain, 12: Search,
};

const COLORS = {
  core:          { bg: "#eff6ff", icon: "#2563eb" },
  academico:     { bg: "#f0fdf4", icon: "#16a34a" },
  reportes:      { bg: "#faf5ff", icon: "#7c3aed" },
  comunicacion:  { bg: "#fffbeb", icon: "#d97706" },
  bienestar:     { bg: "#fdf4ff", icon: "#a21caf" },
  ia:            { bg: "#f0f9ff", icon: "#0284c7" },
};

const modulosIniciales = [
  { id: 1,  nombre: "Autenticación y Seguridad",   descripcion: "Login, roles, permisos y auditoría",           activo: true,  premium: false, categoria: "core"         },
  { id: 2,  nombre: "Gestión de Usuarios",          descripcion: "Crear, editar y asignar roles a usuarios",     activo: true,  premium: false, categoria: "core"         },
  { id: 3,  nombre: "Cursos y Materias",            descripcion: "Estructura académica, grupos y asignaciones",  activo: true,  premium: false, categoria: "academico"    },
  { id: 4,  nombre: "Notas y Calificaciones",       descripcion: "Registro y gestión de calificaciones",         activo: true,  premium: false, categoria: "academico"    },
  { id: 5,  nombre: "Asistencia",                   descripcion: "Control de asistencia diaria por curso",       activo: true,  premium: false, categoria: "academico"    },
  { id: 6,  nombre: "Tareas y Materiales",          descripcion: "Aula virtual, tareas y recursos educativos",   activo: true,  premium: false, categoria: "academico"    },
  { id: 7,  nombre: "Reportes y Boletines",         descripcion: "Generación de informes académicos en PDF",     activo: true,  premium: false, categoria: "reportes"     },
  { id: 8,  nombre: "Comunicación",                 descripcion: "Mensajería interna entre todos los roles",     activo: true,  premium: false, categoria: "comunicacion" },
  { id: 9,  nombre: "Psicoorientación",             descripcion: "Seguimiento psicosocial con privacidad",       activo: true,  premium: true,  categoria: "bienestar"    },
  { id: 10, nombre: "Chatbot Académico",            descripcion: "Asistente inteligente contextualizado",        activo: true,  premium: true,  categoria: "ia"           },
  { id: 11, nombre: "Inteligencia Artificial",      descripcion: "Detección de riesgos y recomendaciones",       activo: false, premium: true,  categoria: "ia"           },
  { id: 12, nombre: "Auditoría Global",             descripcion: "Registro de todas las acciones críticas",      activo: true,  premium: false, categoria: "core"         },
];

const categorias = ["todos", "core", "academico", "reportes", "comunicacion", "bienestar", "ia"];

export default function Modulos() {
  const [modulos, setModulos] = useState(modulosIniciales);
  const [filtro, setFiltro]   = useState("todos");

  const toggle    = (id) => setModulos(prev => prev.map(m => m.id === id ? { ...m, activo: !m.activo } : m));
  const filtrados = filtro === "todos" ? modulos : modulos.filter(m => m.categoria === filtro);

  const stats = [
    { label: "Total",           value: modulos.length,                                         bg: "#f8fafc", text: "#374151",  border: "#e8edf5"  },
    { label: "Módulos activos", value: modulos.filter(m => m.activo).length,                   bg: "#f0fdf4", text: "#15803d",  border: "#bbf7d0"  },
    { label: "Premium activos", value: modulos.filter(m => m.premium && m.activo).length,      bg: "#faf5ff", text: "#6d28d9",  border: "#ddd6fe"  },
  ];

  return (
    <ModuleLayout
      header={
        <PageHeader title="Módulos del Sistema" subtitle="Activa o desactiva módulos para todas las instituciones"
          icon={Settings} color="#2563eb" />
      }
      filters={
        <FilterSelect value={filtro} onChange={setFiltro}>
          {categorias.map(c => (
            <option key={c} value={c} className="capitalize">
              {c === "todos" ? "Todas las categorías" : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </FilterSelect>
      }
      count={`${filtrados.length} módulo${filtrados.length !== 1 ? "s" : ""}`}
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-4"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <p className="text-2xl font-black" style={{ color: s.text }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: s.text, opacity: 0.75 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros de categoría como pills */}
      <div className="flex gap-2 flex-wrap">
        {categorias.map(c => (
          <button key={c} onClick={() => setFiltro(c)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize border-0 cursor-pointer transition-all"
            style={{
              background: filtro === c ? "#2563eb" : "#f1f5f9",
              color:      filtro === c ? "#fff"    : "#475569",
            }}
            onMouseEnter={e => { if (filtro !== c) e.currentTarget.style.background = "#e2e8f0"; }}
            onMouseLeave={e => { if (filtro !== c) e.currentTarget.style.background = "#f1f5f9"; }}>
            {c === "todos" ? "Todos" : c}
          </button>
        ))}
      </div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtrados.map(m => {
          const IconComp = ICONS[m.id] || Settings;
          const col      = COLORS[m.categoria] || COLORS.core;

          return (
            <div key={m.id} className="rounded-2xl p-4 transition-all"
              style={{
                background: "#fff",
                border: "1px solid #e8edf5",
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
                opacity: m.activo ? 1 : 0.55,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.08)"; e.currentTarget.style.borderColor = "#c8d8f0"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.04)"; e.currentTarget.style.borderColor = "#e8edf5"; }}>

              {/* Header de la card */}
              <div className="flex items-start justify-between mb-3">
                {/* Icono + nombre */}
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: col.bg, border: `1px solid ${col.icon}20` }}>
                    <IconComp size={16} style={{ color: col.icon }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#1e293b" }}>{m.nombre}</p>
                    <p className="text-[11px] capitalize font-medium" style={{ color: "#94a3b8" }}>{m.categoria}</p>
                  </div>
                </div>

                {/* Toggle */}
                <button onClick={() => toggle(m.id)}
                  className="flex-shrink-0 border-0 bg-transparent cursor-pointer p-0 transition-transform"
                  style={{ color: m.activo ? "#22c55e" : "#cbd5e1" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                  {m.activo
                    ? <ToggleRight size={28} />
                    : <ToggleLeft size={28} />}
                </button>
              </div>

              {/* Descripción */}
              <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "#64748b" }}>
                {m.descripcion}
              </p>

              {/* Footer: estado + badge premium */}
              <div className="flex items-center gap-2">
                <Badge label={m.activo ? "Activo" : "Inactivo"} variant={m.activo ? "success" : "gray"} dot />
                {m.premium && <Badge label="Premium" variant="purple" />}
              </div>
            </div>
          );
        })}
      </div>
    </ModuleLayout>
  );
}
