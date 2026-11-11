import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ImageProvider } from "./context/ImageContext";
import { ToastProvider } from "./components/Toast";
import { ConfigProvider } from "./context/ConfigContext";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import DashboardRouter from "./pages/dashboards/DashboardRouter";
import RoleGuard from "./components/RoleGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";
import "./styles/themes.css";
import "./styles/toggle.css";

// Lazy loading para componentes - carga solo cuando se necesitan
const Instituciones   = lazy(() => import("./pages/superadmin/Instituciones"));
const Auditoria       = lazy(() => import("./pages/superadmin/Auditoria"));
const Licencias       = lazy(() => import("./pages/superadmin/Licencias"));
const Backups         = lazy(() => import("./pages/superadmin/Backups"));
const Estadisticas    = lazy(() => import("./pages/superadmin/Estadisticas"));
const Seguridad       = lazy(() => import("./pages/superadmin/Seguridad"));
const Administradores = lazy(() => import("./pages/superadmin/Administradores"));
const Modulos         = lazy(() => import("./pages/superadmin/Modulos"));

const Usuarios     = lazy(() => import("./pages/admin/Usuarios"));
const Cursos       = lazy(() => import("./pages/admin/Cursos"));
const Materias     = lazy(() => import("./pages/admin/Materias"));
const Periodos     = lazy(() => import("./pages/admin/Periodos"));
const Asignaciones = lazy(() => import("./pages/admin/Asignaciones"));

const CambiosNota        = lazy(() => import("./pages/coordinador/CambiosNota"));
const PlanesMejoramiento = lazy(() => import("./pages/coordinador/PlanesMejoramiento"));
const Reuniones          = lazy(() => import("./pages/coordinador/Reuniones"));
const IndicadoresCurso   = lazy(() => import("./pages/coordinador/IndicadoresCurso"));
const IndicadoresMateria = lazy(() => import("./pages/coordinador/IndicadoresMateria"));

const Matriculas         = lazy(() => import("./pages/secretaria/Matriculas"));
const Certificados       = lazy(() => import("./pages/secretaria/Certificados"));
const Listados           = lazy(() => import("./pages/secretaria/Listados"));
const BoletinesSecretaria = lazy(() => import("./pages/secretaria/Boletines"));

const Notas                 = lazy(() => import("./pages/docente/Notas"));
const Asistencia            = lazy(() => import("./pages/docente/Asistencia"));
const Tareas                = lazy(() => import("./pages/docente/Tareas"));
const MisCursos             = lazy(() => import("./pages/docente/MisCursos"));
const Materiales            = lazy(() => import("./pages/docente/Materiales"));
const Calendario            = lazy(() => import("./pages/docente/Calendario"));
const SolicitudesCambioNota = lazy(() => import("./pages/docente/SolicitudesCambioNota"));
const Cuestionarios          = lazy(() => import("./pages/docente/Cuestionarios"));
const ResultadosCuestionarios = lazy(() => import("./pages/docente/ResultadosCuestionarios"));

const MiGrupo    = lazy(() => import("./pages/director/MiGrupo"));
const Observador = lazy(() => import("./pages/director/Observador"));
const Citaciones = lazy(() => import("./pages/director/Citaciones"));

const Casos        = lazy(() => import("./pages/psicoorientador/Casos"));
const Citas        = lazy(() => import("./pages/psicoorientador/Citas"));
const Seguimientos = lazy(() => import("./pages/psicoorientador/Seguimientos"));
const PlanesApoyo  = lazy(() => import("./pages/psicoorientador/PlanesApoyo"));

const MisMaterias                     = lazy(() => import("./pages/estudiante/MisMaterias"));
const MisNotas                        = lazy(() => import("./pages/estudiante/MisNotas"));
const MiAsistencia                    = lazy(() => import("./pages/estudiante/MiAsistencia"));
const SolicitudesCambioNotaEstudiante = lazy(() => import("./pages/estudiante/SolicitudesCambioNota"));
const MensajesEstudiante              = lazy(() => import("./pages/estudiante/Mensajes"));
const CuestionariosEstudiante          = lazy(() => import("./pages/estudiante/Cuestionarios"));

const MisHijos   = lazy(() => import("./pages/padre/MisHijos"));
const NotasPadre = lazy(() => import("./pages/padre/Notas"));

const Documentos = lazy(() => import("./pages/Documentos"));
const Horarios    = lazy(() => import("./pages/Horarios"));
const IAcademica  = lazy(() => import("./pages/IAcademica"));
const AulaVirtual = lazy(() => import("./pages/AulaVirtual"));
const Perfil      = lazy(() => import("./pages/Perfil"));
const Chatbot     = lazy(() => import("./pages/Chatbot"));
const MensajesDoc = lazy(() => import("./pages/Mensajes"));
const Reportes    = lazy(() => import("./pages/Reportes"));
const Alertas     = lazy(() => import("./pages/Alertas"));
const Boletines   = lazy(() => import("./pages/Boletines"));
const Configuracion = lazy(() => import("./pages/Configuracion"));
const InstalarApp = lazy(() => import("./pages/InstalarApp"));

/* PWA */
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { ImportProvider } from "./context/ImportContext";
import { DocumentProvider } from "./context/DocumentContext";
import { StorageProvider } from "./context/StorageContext";
import { DataProvider } from "./context/DataContext";
import { useAuth } from "./context/AuthContext";
import LicenseGuard from "./components/LicenseGuard";

/* Wrapper que remonta DataProvider cuando cambia la institución */
function DataProviderScoped({ children }) {
  const { user } = useAuth();
  const instKey = user?.institucionId ?? "global";
  return <DataProvider key={instKey}>{children}</DataProvider>;
}

/* ── Roles ─────────────────────────────────── */
const SA   = ["SUPER_ADMIN"];
const ADMIN = ["ADMIN_INSTITUCIONAL"];
const SA_ADMIN = ["SUPER_ADMIN","ADMIN_INSTITUCIONAL"];
const COORD = ["COORDINADOR"];
const SEC   = ["SECRETARIA"];
const DOC   = ["DOCENTE"];
const DIR   = ["DIRECTOR_GRUPO"];
const PSICO = ["PSICOORIENTADOR"];
const EST   = ["ESTUDIANTE"];
const PAD   = ["PADRE"];
const STAFF = ["SUPER_ADMIN","ADMIN_INSTITUCIONAL","COORDINADOR","SECRETARIA","DOCENTE","DIRECTOR_GRUPO","PSICOORIENTADOR"];
const ALL   = []; // cualquier rol autenticado

/* ── Helper: envuelve con RoleGuard + ErrorBoundary ── */
function G({ roles = ALL, children }) {
  return (
    <Suspense fallback={<Loading />}>
      <RoleGuard allowedRoles={roles}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </RoleGuard>
    </Suspense>
  );
}

export default function App() {
  return (
    <StorageProvider>
    <AuthProvider>
      <ImageProvider>
        <DataProviderScoped>
        <DocumentProvider>
          <ToastProvider>
          <ConfigProvider>
            <ImportProvider>
              <LicenseGuard>
              <BrowserRouter>
              <Routes>
                <Route path="/login"  element={<Login />} />
                <Route path="/inicio" element={<Landing />} />
                <Route path="/"       element={<Landing />} />

                <Route element={<MainLayout />}>
                  {/* Dashboard — acceso universal, el DashboardRouter muestra el correcto según rol */}
                  <Route path="/dashboard" element={<G><DashboardRouter /></G>} />

                  {/* ── Super Admin ─────────────────────────── */}
                  <Route path="/instituciones"   element={<G roles={SA}><Instituciones /></G>} />
                  <Route path="/auditoria"       element={<G roles={SA}><Auditoria /></G>} />
                  <Route path="/licencias"       element={<G roles={SA}><Licencias /></G>} />
                  <Route path="/modulos"         element={<G roles={SA}><Modulos /></G>} />
                  <Route path="/administradores" element={<G roles={SA}><Administradores /></G>} />
                  <Route path="/seguridad"       element={<G roles={SA}><Seguridad /></G>} />
                  <Route path="/backups"         element={<G roles={SA}><Backups /></G>} />
                  <Route path="/estadisticas"    element={<G roles={SA_ADMIN}><Estadisticas /></G>} />

                  {/* ── Admin Institucional ─────────────────── */}
                  <Route path="/usuarios"     element={<G roles={SA_ADMIN}><Usuarios /></G>} />
                  <Route path="/cursos"       element={<G roles={SA_ADMIN}><Cursos /></G>} />
                  <Route path="/materias"     element={<G roles={SA_ADMIN}><Materias /></G>} />
                  <Route path="/periodos"     element={<G roles={SA_ADMIN}><Periodos /></G>} />
                  <Route path="/asignaciones" element={<G roles={SA_ADMIN}><Asignaciones /></G>} />

                  {/* ── Coordinador ─────────────────────────── */}
                  <Route path="/indicadores-curso"   element={<G roles={COORD}><IndicadoresCurso /></G>} />
                  <Route path="/indicadores-materia" element={<G roles={COORD}><IndicadoresMateria /></G>} />
                  <Route path="/cambios-nota"        element={<G roles={COORD}><CambiosNota /></G>} />
                  <Route path="/planes-mejoramiento" element={<G roles={COORD}><PlanesMejoramiento /></G>} />
                  <Route path="/reuniones"           element={<G roles={[...COORD,...SA_ADMIN]}><Reuniones /></G>} />

                  {/* ── Secretaría ──────────────────────────── */}
                  <Route path="/matriculas"           element={<G roles={[...SEC,...SA_ADMIN]}><Matriculas /></G>} />
                  <Route path="/certificados"         element={<G roles={[...SEC,...SA_ADMIN]}><Certificados /></G>} />
                  <Route path="/listados"             element={<G roles={[...SEC,...SA_ADMIN]}><Listados /></G>} />
                  <Route path="/boletines-secretaria" element={<G roles={[...SEC,...SA_ADMIN]}><BoletinesSecretaria /></G>} />

                  {/* ── Docente ─────────────────────────────── */}
                  <Route path="/mis-cursos"             element={<G roles={DOC}><MisCursos /></G>} />
                  <Route path="/notas"                  element={<G roles={DOC}><Notas /></G>} />
                  <Route path="/asistencia"             element={<G roles={[...DOC,...DIR]}><Asistencia /></G>} />
                  <Route path="/tareas"                 element={<G roles={DOC}><Tareas /></G>} />
                  <Route path="/materiales"             element={<G roles={DOC}><Materiales /></G>} />
                  <Route path="/calendario"             element={<G roles={DOC}><Calendario /></G>} />
                  <Route path="/solicitudes-cambio-nota" element={<G roles={DOC}><SolicitudesCambioNota /></G>} />
                  <Route path="/cuestionarios"           element={<G roles={DOC}><Cuestionarios /></G>} />
                  <Route path="/resultados-cuestionarios" element={<G roles={DOC}><ResultadosCuestionarios /></G>} />

                  {/* ── Director de Grupo ───────────────────── */}
                  <Route path="/mi-grupo"   element={<G roles={DIR}><MiGrupo /></G>} />
                  <Route path="/observador" element={<G roles={DIR}><Observador /></G>} />
                  <Route path="/citaciones" element={<G roles={[...DIR,...SA_ADMIN]}><Citaciones /></G>} />

                  {/* ── Psicoorientador ─────────────────────── */}
                  <Route path="/casos"        element={<G roles={PSICO}><Casos /></G>} />
                  <Route path="/citas"        element={<G roles={PSICO}><Citas /></G>} />
                  <Route path="/seguimientos" element={<G roles={PSICO}><Seguimientos /></G>} />
                  <Route path="/planes-apoyo" element={<G roles={PSICO}><PlanesApoyo /></G>} />

                  {/* ── Estudiante ──────────────────────────── */}
                  <Route path="/mis-materias"              element={<G roles={EST}><MisMaterias /></G>} />
                  <Route path="/mis-notas"                 element={<G roles={EST}><MisNotas /></G>} />
                  <Route path="/mi-asistencia"             element={<G roles={EST}><MiAsistencia /></G>} />
                  <Route path="/solicitudes-revision-nota" element={<G roles={EST}><SolicitudesCambioNotaEstudiante /></G>} />
                  <Route path="/cuestionarios-estudiante"  element={<G roles={EST}><CuestionariosEstudiante /></G>} />
                  {/* ✅ FIX: ruta exclusiva para mensajes del estudiante */}
                  <Route path="/mensajes-estudiante"       element={<G roles={EST}><MensajesEstudiante /></G>} />

                  {/* ── Padre ───────────────────────────────── */}
                  <Route path="/mis-hijos"   element={<G roles={PAD}><MisHijos /></G>} />
                  <Route path="/notas-hijos" element={<G roles={PAD}><NotasPadre /></G>} />

                  {/* ── Compartidos ─────────────────────────── */}
                  <Route path="/documentos"    element={<G><Documentos /></G>} />
                  <Route path="/horarios"      element={<G roles={STAFF}><Horarios /></G>} />
                  <Route path="/ia-academica"  element={<G><IAcademica /></G>} />
                  <Route path="/aula-virtual"  element={<G><AulaVirtual /></G>} />
                  <Route path="/perfil"        element={<G><Perfil /></G>} />
                  <Route path="/chatbot"       element={<G><Chatbot /></G>} />
                  <Route path="/instalar-app"  element={<G><InstalarApp /></G>} />
                  {/* ✅ FIX: /mensajes para docentes/staff, no colisiona con /mensajes-estudiante */}
                  <Route path="/mensajes"      element={<G roles={STAFF}><MensajesDoc /></G>} />
                  <Route path="/reportes"      element={<G roles={STAFF}><Reportes /></G>} />
                  <Route path="/alertas"       element={<G><Alertas /></G>} />
                  <Route path="/boletines"     element={<G><Boletines /></G>} />
                  <Route path="/configuracion" element={<G><Configuracion /></G>} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
            </LicenseGuard>
            <PWAInstallPrompt />
            </ImportProvider>
          </ConfigProvider>
        </ToastProvider>
        </DocumentProvider>
        </DataProviderScoped>
      </ImageProvider>
    </AuthProvider>
    </StorageProvider>
  );
}
