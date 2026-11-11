import { Shield, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";

const intentosFallidos = [
  { id: 1, correo: "usuario@ie001.edu.co", ip: "192.168.1.55", fecha: "2025-05-07 08:12", intentos: 3 },
  { id: 2, correo: "admin@ie002.edu.co", ip: "10.0.0.22", fecha: "2025-05-06 17:45", intentos: 5 },
];

const configuracion = [
  { label: "Longitud mínima de contraseña", valor: "8 caracteres", estado: "activo" },
  { label: "Bloqueo tras intentos fallidos", valor: "5 intentos", estado: "activo" },
  { label: "Sesión máxima inactiva", valor: "30 minutos", estado: "activo" },
  { label: "Autenticación en dos pasos", valor: "Desactivado", estado: "inactivo" },
  { label: "Cifrado de datos sensibles", valor: "AES-256", estado: "activo" },
];

export default function Seguridad() {
  return (
    <div>
      <PageHeader
        title="Seguridad Global"
        subtitle="Configuración y monitoreo de seguridad del sistema"
        icon={Shield}
        color="#ef4444"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-800">Sistema seguro</p>
            <p className="text-xs text-green-600">Sin amenazas activas</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="font-bold text-yellow-800">{intentosFallidos.length} alertas</p>
            <p className="text-xs text-yellow-600">Intentos fallidos recientes</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lock size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-blue-800">0 cuentas bloqueadas</p>
            <p className="text-xs text-blue-600">En este momento</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Configuración de Seguridad</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {configuracion.map((c) => (
              <div key={c.label} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/60 transition">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{c.label}</p>
                  <p className="text-xs text-gray-400">{c.valor}</p>
                </div>
                <Badge label={c.estado} variant={c.estado === "activo" ? "success" : "danger"} dot />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Intentos de Acceso Fallidos</h3>
          </div>
          {intentosFallidos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin intentos fallidos recientes</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {intentosFallidos.map((i) => (
                <div key={i.id} className="px-5 py-3.5 hover:bg-gray-50/60 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{i.correo}</p>
                      <p className="text-xs text-gray-400">IP: {i.ip} · {i.fecha}</p>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                      {i.intentos} intentos
                    </span>
                  </div>
                  <button className="mt-2 text-xs text-red-600 hover:text-red-800 bg-transparent border-0 cursor-pointer font-medium">
                    Bloquear IP
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
