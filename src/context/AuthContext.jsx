import { createContext, useContext, useState, useEffect } from "react";
import { credenciales as dataCreds, usuarios as dataUsuarios } from "../data/mockData";
import { useStorage } from "./StorageContext";

const AuthContext = createContext(null);

const SESSION_KEY = "edurural_session";

function leerSesion() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function escribirSesion(user) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function AuthProvider({ children }) {
  const storage = useStorage();

  /* Hidratar sesión desde localStorage */
  const [user, setUser]   = useState(() => leerSesion());
  const [error, setError] = useState("");

  /* Credenciales: primero desde storage global, luego mockData */
  const [credenciales, setCredenciales] = useState(() => {
    try {
      const cached = localStorage.getItem("edurural_global_credenciales");
      return cached ? JSON.parse(cached) : dataCreds;
    } catch { return dataCreds; }
  });

  /* Usuarios: primero desde storage global, luego mockData */
  const [usuarios, setUsuarios] = useState(() => {
    try {
      const cached = localStorage.getItem("edurural_global_usuarios");
      return cached ? JSON.parse(cached) : dataUsuarios;
    } catch { return dataUsuarios; }
  });

  /* Persistir cambios de credenciales */
  useEffect(() => {
    try { localStorage.setItem("edurural_global_credenciales", JSON.stringify(credenciales)); } catch {}
  }, [credenciales]);

  /* Persistir cambios de usuarios */
  useEffect(() => {
    try { localStorage.setItem("edurural_global_usuarios", JSON.stringify(usuarios)); } catch {}
  }, [usuarios]);

  const login = (correo, password) => {
    const cred = credenciales.find(
      (c) => c.correo === correo && c.password === password
    );
    if (!cred) {
      setError("Correo o contraseña incorrectos");
      return false;
    }
    const usuario = usuarios.find((u) => u.id === cred.usuarioId);
    if (!usuario || !usuario.activo) {
      setError("Usuario inactivo o no encontrado");
      return false;
    }
    setUser(usuario);
    escribirSesion(usuario);
    setError("");
    return true;
  };

  const logout = () => {
    setUser(null);
    escribirSesion(null);
  };

  const verificarCorreo = (correo) =>
    credenciales.some((c) => c.correo === correo);

  const resetPassword = (correo, nuevaPassword) => {
    setCredenciales((prev) =>
      prev.map((c) => c.correo === correo ? { ...c, password: nuevaPassword } : c)
    );
  };

  /**
   * Actualiza el perfil del usuario en sesión y en la lista de usuarios.
   * @param {Partial<Usuario>} cambios
   */
  const actualizarPerfil = (cambios) => {
    const actualizado = { ...user, ...cambios };
    setUser(actualizado);
    escribirSesion(actualizado);
    setUsuarios(prev => prev.map(u => u.id === user.id ? actualizado : u));
  };

  /**
   * Agrega un usuario nuevo al sistema (desde Usuarios.jsx).
   */
  const agregarUsuario = (nuevoUsuario, cred) => {
    setUsuarios(prev => [...prev, nuevoUsuario]);
    if (cred) setCredenciales(prev => [...prev, cred]);
  };

  /**
   * Actualiza la sesión si el usuario fue modificado externamente
   * (ej: cambio de rol desde Usuarios.jsx).
   */
  const refrescarSesion = () => {
    if (!user) return;
    const fresco = usuarios.find(u => u.id === user.id);
    if (fresco) { setUser(fresco); escribirSesion(fresco); }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      error,
      setError,
      verificarCorreo,
      resetPassword,
      actualizarPerfil,
      agregarUsuario,
      refrescarSesion,
      usuarios,
      credenciales,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
