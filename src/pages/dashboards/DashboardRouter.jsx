import { useAuth } from "../../context/AuthContext";
import SuperAdminDashboard    from "./SuperAdminDashboard";
import AdminDashboard         from "./AdminDashboard";
import CoordinadorDashboard   from "./CoordinadorDashboard";
import DocenteDashboard       from "./DocenteDashboard";
import EstudianteDashboard    from "./EstudianteDashboard";
import PadreDashboard         from "./PadreDashboard";
import SecretariaDashboard    from "./SecretariaDashboard";
import PsicoDashboard         from "./PsicoDashboard";
import DirectorGrupoDashboard from "./DirectorGrupoDashboard";
import GenericDashboard       from "./GenericDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();

  const dashboards = {
    SUPER_ADMIN:        <SuperAdminDashboard/>,
    ADMIN_INSTITUCIONAL:<AdminDashboard/>,
    COORDINADOR:        <CoordinadorDashboard/>,
    SECRETARIA:         <SecretariaDashboard/>,
    DOCENTE:            <DocenteDashboard/>,
    DIRECTOR_GRUPO:     <DirectorGrupoDashboard/>,
    PSICOORIENTADOR:    <PsicoDashboard/>,
    ESTUDIANTE:         <EstudianteDashboard/>,
    PADRE:              <PadreDashboard/>,
  };

  return dashboards[user?.rol] || <GenericDashboard/>;
}
