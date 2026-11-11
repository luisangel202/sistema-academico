import { useState } from "react";
import { Save, Shield, Bell, User, Eye, EyeOff, Check, MapPin, Phone, Mail } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ImageUploader from "../components/ImageUploader";
import Toggle from "../components/Toggle";
import { useAuth } from "../context/AuthContext";
import { useImages } from "../context/ImageContext";
import { ROLE_LABELS, ROLE_COLORS } from "../data/permissions";

export default function Perfil() {
  const { user } = useAuth();
  const { getAvatar, setAvatar } = useImages();
  const [tab, setTab] = useState("info");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nombre: user?.nombre || "",
    correo: user?.correo || "",
    telefono: "3001234567",
    municipio: "Apartadó",
    departamento: "Antioquia",
  });
  const [passwords, setPasswords] = useState({ actual: "", nueva: "", confirmar: "" });
  const [notif, setNotif] = useState({
    notas: true, tareas: true, asistencia: true,
    mensajes: true, alertas: true, boletines: true,
  });

  const guardar = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "info",      label: "Información",    icon: User   },
    { id: "seguridad", label: "Seguridad",       icon: Shield },
    { id: "notif",     label: "Notificaciones",  icon: Bell   },
  ];

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition bg-gray-50 hover:bg-white";

  return (
    <div className="space-y-6">
      <PageHeader title="Mi Perfil" subtitle="Gestiona tu información personal y preferencias" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tarjeta perfil */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="mb-4">
              <ImageUploader
                currentImage={getAvatar(user?.id)}
                onImage={(url) => setAvatar(user?.id, url)}
                onRemove={() => setAvatar(user?.id, null)}
                shape="circle"
                size={88}
                placeholder={user?.avatar}
                label="Cambiar foto"
                className="mx-auto"
              />
            </div>
            <p className="font-bold text-gray-900 text-lg">{user?.nombre}</p>
            <p className="text-xs text-gray-400 mt-1 mb-3">{user?.correo}</p>
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${ROLE_COLORS[user?.rol]}`}>
              {ROLE_LABELS[user?.rol]}
            </span>
            {user?.institucionId && (
              <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <MapPin size={11} /> IE Rural El Progreso
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm transition border-0 cursor-pointer
                  ${tab === t.id
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-gray-600 hover:bg-gray-100 bg-transparent"
                  }`}>
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            {tab === "info" && (
              <form onSubmit={guardar} className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800">Información Personal</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Actualiza tus datos de contacto</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
                    <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})}
                        className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})}
                        className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Municipio</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={form.municipio} onChange={e => setForm({...form, municipio: e.target.value})}
                        className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Información del sistema (solo lectura)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">Rol</p>
                      <p className="font-semibold text-gray-700 mt-0.5">{ROLE_LABELS[user?.rol]}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">Documento</p>
                      <p className="font-semibold text-gray-700 font-mono mt-0.5">{user?.documento}</p>
                    </div>
                  </div>
                </div>
                <button type="submit"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition border-0 cursor-pointer
                    ${saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200"}`}>
                  {saved ? <><Check size={15} /> ¡Guardado!</> : <><Save size={15} /> Guardar cambios</>}
                </button>
              </form>
            )}

            {tab === "seguridad" && (
              <form onSubmit={guardar} className="space-y-5 max-w-md">
                <div>
                  <h3 className="font-semibold text-gray-800">Cambiar Contraseña</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Usa una contraseña segura de al menos 8 caracteres</p>
                </div>
                {["actual","nueva","confirmar"].map(campo => (
                  <div key={campo}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 capitalize">
                      Contraseña {campo}
                    </label>
                    <input type="password" value={passwords[campo]}
                      onChange={e => setPasswords({...passwords, [campo]: e.target.value})}
                      placeholder="••••••••"
                      className={inputCls} />
                  </div>
                ))}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas y números.
                </div>
                <button type="submit"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition border-0 cursor-pointer
                    ${saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200"}`}>
                  {saved ? <><Check size={15} /> ¡Actualizado!</> : <><Save size={15} /> Actualizar contraseña</>}
                </button>
              </form>
            )}

            {tab === "notif" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800">Preferencias de Notificaciones</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Elige qué notificaciones quieres recibir</p>
                </div>
                <div className="space-y-1">
                  {Object.entries(notif).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 capitalize">{key}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Recibir alertas de {key}</p>
                      </div>
                      <Toggle
                        checked={val}
                        onChange={(newValue) => setNotif({...notif, [key]: newValue})}
                        color="primary"
                        size="small"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
