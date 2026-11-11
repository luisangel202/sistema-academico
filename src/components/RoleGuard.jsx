import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protege una ruta por rol.
 * Si el usuario no tiene ninguno de los roles permitidos → redirige al dashboard.
 * Si allowedRoles está vacío o undefined → cualquier usuario autenticado puede pasar.
 */
export default function RoleGuard({ allowedRoles = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
