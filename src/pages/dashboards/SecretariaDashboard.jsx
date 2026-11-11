import {
  FileText, GraduationCap, AlertCircle,
  ArrowRight, CheckCircle, Clock, FolderOpen, Users, Plus
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard   from "../../components/StatCard";
import Badge      from "../../components/Badge";
import { useNavigate } from "react-router-dom";

const documentosPendientes = [
  { estudiante: "Juan Pérez",   doc: "Boletín año anterior", fecha: "15 ene", urgente: false },
  { estudiante: "Sofía Torres", doc: "Foto carné 3×4",       fecha: "16 ene", urgente: true  },
  { estudiante: "Carlos Ruiz",  doc: "Certificado médico",   fecha: "17 ene", urgente: false },
];

const matriculasRecientes = [
  { estudiante: "Juan Pérez",  curso: "7A", fecha: "15 ene", estado: "activa", av: "JP" },
  { estudiante: "Sofía Torres",curso: "7A", fecha: "16 ene", estado: "activa", av: "ST" },
  { estudiante: "Laura Gómez", curso: "7A", fecha: "17 ene", estado: "activa", av: "LG" },
];

const acciones = [
  { label: "Nueva Matrícula",    icon: GraduationCap, path: "/matriculas",   color: "#2563eb", bg: "#eff6ff" },
  { label: "Certificado",        icon: FileText,      path: "/certificados", color: "#10b981", bg: "#f0fdf4" },
  { label: "Listados",           icon: Users,         path: "/listados",     color: "#8b5cf6", bg: "#faf5ff" },
  { label: "Documentos",         icon: FolderOpen,    path: "/documentos",   color: "#f59e0b", bg: "#fffbeb" },
];

const card = {
  background: "#fff", borderRadius: 18,
  border: "1px solid #e8edf5",
  boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
  overflow: "hidden",
};
const cardHeader = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "16px 20px", borderBottom: "1px solid #f0f4fa",
};
const linkBtn = {
  display: "flex", alignItems: "center", gap: 4,
  fontSize: 12, fontWeight: 600, color: "#2563eb",
  background: "none", border: "none", cursor: "pointer",
};

export default function SecretariaDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Dashboard Secretaría"
        subtitle="IE Rural El Progreso · Período 2 — 2025"
        icon={FileText}
        color="#2563eb"
        action={
          <button onClick={() => navigate("/matriculas")} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 11,
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.28)",
          }}>
            <Plus size={14} /> Nueva matrícula
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
        <StatCard title="Matriculados"    value={320}                          subtitle="período activo"   icon={GraduationCap} color="blue"   />
        <StatCard title="Nuevas este mes" value={12}                           subtitle="en mayo 2025"     icon={FileText}      color="green"  />
        <StatCard title="Docs. pendientes"value={documentosPendientes.length}  subtitle="por entregar"     icon={AlertCircle}   color="yellow" />
        <StatCard title="Certificados"    value={8}                            subtitle="generados"        icon={CheckCircle}   color="indigo" />
      </div>

      {/* Acciones rápidas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
        {acciones.map(a => (
          <button key={a.label} onClick={() => navigate(a.path)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "18px 12px", borderRadius: 16,
            background: "#fff", border: "1px solid #e8edf5",
            boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
            cursor: "pointer", transition: "all 180ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.09)"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.04)"; e.currentTarget.style.borderColor = "#e8edf5"; }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <a.icon size={20} style={{ color: a.color }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", textAlign: "center", lineHeight: 1.3 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Listas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>

        {/* Documentos pendientes */}
        <div style={card}>
          <div style={cardHeader}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Documentos Pendientes</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{documentosPendientes.length} con documentos faltantes</p>
            </div>
            <button onClick={() => navigate("/documentos")} style={linkBtn}>Ver todos <ArrowRight size={12} /></button>
          </div>
          <div>
            {documentosPendientes.map((d, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: i < documentosPendientes.length - 1 ? "1px solid #f4f6fb" : "none",
                transition: "background 150ms",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: d.urgente ? "#fff1f2" : "#fffbeb" }}>
                    <AlertCircle size={16} style={{ color: d.urgente ? "#ef4444" : "#f59e0b" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{d.estudiante}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{d.doc} · {d.fecha}</p>
                  </div>
                </div>
                <Badge label={d.urgente ? "urgente" : "pendiente"} variant={d.urgente ? "danger" : "warning"} dot />
              </div>
            ))}
          </div>
        </div>

        {/* Matrículas recientes */}
        <div style={card}>
          <div style={cardHeader}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Matrículas Recientes</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Últimas inscripciones registradas</p>
            </div>
            <button onClick={() => navigate("/matriculas")} style={linkBtn}>Ver todas <ArrowRight size={12} /></button>
          </div>
          <div>
            {matriculasRecientes.map((m, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: i < matriculasRecientes.length - 1 ? "1px solid #f4f6fb" : "none",
                transition: "background 150ms",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {m.av}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{m.estudiante}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={10} /> Curso {m.curso} · {m.fecha}
                    </p>
                  </div>
                </div>
                <Badge label={m.estado} variant="success" dot />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
