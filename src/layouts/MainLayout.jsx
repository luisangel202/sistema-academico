import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SmartImportModal from "../components/SmartImportModal";

export default function MainLayout() {
  const { user }    = useAuth();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
        setMobileOpen(false);
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (!user) return <Navigate to="/login" replace />;

  /* Ancho del sidebar: 260px expandido, 68px colapsado */
  const sidebarW = collapsed ? 72 : 268;

  return (
    <div className="app-background min-h-screen">

      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[35] md:hidden"
          style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Header
        sidebarCollapsed={collapsed}
        onMobileMenuToggle={() => setMobileOpen(o => !o)}
      />

      {/*
        main recibe margin-left en desktop igual al ancho del sidebar.
        Usamos inline style para que reaccione en tiempo real al toggle,
        sin depender de clases Tailwind md:ml-64/md:ml-16.
      */}
      <main
        className="min-h-screen transition-[margin-left] duration-300"
        style={{
          paddingTop: 60,              /* altura exacta del header */
          marginLeft: 0,               /* móvil: sin margen */
        }}
      >
        {/* Breakpoint desktop: aplicar margen dinámico vía cssVar */}
        <style>{`
          @media (min-width: 768px) {
            #app-main { margin-left: ${sidebarW}px !important; }
          }
        `}</style>

        <div
          id="app-main"
          key={location.pathname}
          className="p-3 sm:p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto animate-fade-in-up"
          style={{ minHeight: "calc(100vh - 60px)", overflowX: "hidden" }}
        >
          <Outlet />
        </div>
      </main>

      {/* FAB: Importar datos global */}
      <button onClick={() => setShowImport(true)}
        style={{
          position: "fixed", bottom: 16, right: 16, zIndex: 40,
          width: 46, height: 46, borderRadius: "50%",
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
          color: "#fff", border: "none", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 200ms",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        title="Importar datos">
        <Upload size={18} />
      </button>

      <SmartImportModal open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
