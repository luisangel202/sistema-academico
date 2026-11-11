import { useState, useEffect } from "react";
import { 
  Save, User, Bell, Shield, Eye, EyeOff, Check, Monitor, Moon, Sun, 
  Globe, Clock, Calendar, Brain, Smartphone, Mail, MessageSquare, 
  Database, Lock, Wifi, Download, Upload, RefreshCw, Palette, 
  Volume2, VolumeX, Settings, ChevronRight, Info, AlertTriangle, AlertCircle
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import ImageUploader from "../components/ImageUploader";
import Toggle from "../components/Toggle";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { useImages } from "../context/ImageContext";
import { useConfig } from "../context/ConfigContext";
import { ROLE_LABELS, ROLE_COLORS } from "../data/permissions";

const notifLabels = {
  notas:      { label: "Notas publicadas",    desc: "Cuando se publican nuevas calificaciones" },
  tareas:     { label: "Nuevas tareas",        desc: "Cuando se asigna una tarea" },
  asistencia: { label: "Asistencia",           desc: "Recordatorios de registro de asistencia" },
  mensajes:   { label: "Mensajes",             desc: "Cuando recibes un mensaje nuevo" },
  alertas:    { label: "Alertas académicas",   desc: "Alertas de riesgo y seguimiento" },
};

export default function Configuracion() {
  const { user } = useAuth();
  const { getAvatar, setAvatar } = useImages();
  const { config, updateConfig, updateSection, exportConfig, importConfig, requestNotificationPermission } = useConfig();
  
  const [tab, setTab] = useState("perfil");
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState({ nueva: false, confirmar: false });
  const [form, setForm] = useState({
    nombre: user?.nombre || "",
    correo: user?.correo || "",
    telefono: "3001234567",
    password: "",
    passwordConfirm: "",
  });

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const guardar = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: "perfil",          label: "Perfil",           icon: User   },
    { id: "apariencia",      label: "Apariencia",       icon: Monitor },
    { id: "academicas",      label: "Académicas",       icon: Brain  },
    { id: "notificaciones",  label: "Notificaciones",   icon: Bell   },
    { id: "calendario",      label: "Calendario",       icon: Calendar },
    { id: "integraciones",   label: "Integraciones",    icon: Smartphone },
    { id: "privacidad",      label: "Privacidad",       icon: Lock   },
    { id: "rendimiento",     label: "Rendimiento",      icon: Wifi   },
    { id: "seguridad",       label: "Seguridad",        icon: Shield },
  ];

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition bg-gray-50 hover:bg-white";

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" subtitle="Ajusta tu perfil y preferencias" />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="md:w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm transition border-0 cursor-pointer whitespace-nowrap flex-shrink-0
                  ${tab === t.id
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-gray-600 hover:bg-gray-100 bg-transparent"
                  }`}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            {/* ── Perfil ── */}
            {tab === "perfil" && (
              <form onSubmit={guardar} className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Información Personal</h3>
                  <p className="text-xs text-gray-400">Actualiza tu nombre, correo y foto de perfil</p>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl">
                  <ImageUploader
                    currentImage={getAvatar(user?.id)}
                    onImage={(url) => setAvatar(user?.id, url)}
                    onRemove={() => setAvatar(user?.id, null)}
                    shape="circle"
                    size={72}
                    placeholder={user?.avatar}
                    label="Cambiar foto"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{user?.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.correo}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1.5 inline-block ${ROLE_COLORS[user?.rol]}`}>
                      {ROLE_LABELS[user?.rol]}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
                    <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                    <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
                    <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputCls} />
                  </div>
                </div>

                {/* Read-only info */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Rol</p>
                    <p className="text-sm font-semibold text-gray-700">{ROLE_LABELS[user?.rol]}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Documento</p>
                    <p className="text-sm font-semibold text-gray-700 font-mono">{user?.documento}</p>
                  </div>
                </div>

                <button type="submit"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition border-0 cursor-pointer
                    ${saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200"}`}>
                  {saved ? <><Check size={15} /> ¡Guardado!</> : <><Save size={15} /> Guardar cambios</>}
                </button>
              </form>
            )}

            {/* ── Apariencia ── */}
            {tab === "apariencia" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Apariencia y Tema</h3>
                  <p className="text-xs text-gray-400">Personaliza la visualización del sistema</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tema</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateConfig('apariencia', 'tema', 'claro')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm border-2 transition cursor-pointer
                          ${config.apariencia.tema === "claro" 
                            ? "border-blue-500 bg-blue-50 text-blue-700" 
                            : "border-gray-200 bg-white text-gray-600"}`}
                      >
                        <Sun size={16} /> Claro
                      </button>
                      <button
                        onClick={() => updateConfig('apariencia', 'tema', 'oscuro')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm border-2 transition cursor-pointer
                          ${config.apariencia.tema === "oscuro" 
                            ? "border-blue-500 bg-blue-50 text-blue-700" 
                            : "border-gray-200 bg-white text-gray-600"}`}
                      >
                        <Moon size={16} /> Oscuro
                      </button>
                      <button
                        onClick={() => updateConfig('apariencia', 'tema', 'auto')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm border-2 transition cursor-pointer
                          ${config.apariencia.tema === "auto" 
                            ? "border-blue-500 bg-blue-50 text-blue-700" 
                            : "border-gray-200 bg-white text-gray-600"}`}
                      >
                        <Monitor size={16} /> Auto
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Idioma</label>
                    <select 
                      value={config.apariencia.idioma} 
                      onChange={(e) => updateConfig('apariencia', 'idioma', e.target.value)}
                      className={inputCls}
                    >
                      <option value="español">Español</option>
                      <option value="inglés">Inglés</option>
                      <option value="portugués">Portugués</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tamaño de Fuente</label>
                    <select 
                      value={config.apariencia.tamañoFuente} 
                      onChange={(e) => updateConfig('apariencia', 'tamañoFuente', e.target.value)}
                      className={inputCls}
                    >
                      <option value="pequeño">Pequeño</option>
                      <option value="mediano">Mediano</option>
                      <option value="grande">Grande</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Modo Contraste</label>
                    <select 
                      value={config.apariencia.modoContraste} 
                      onChange={(e) => updateConfig('apariencia', 'modoContraste', e.target.value)}
                      className={inputCls}
                    >
                      <option value="normal">Normal</option>
                      <option value="alto">Alto Contraste</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Animaciones</p>
                      <p className="text-xs text-gray-400 mt-0.5">Activar animaciones y transiciones</p>
                    </div>
                    <Toggle
                      checked={config.apariencia.animaciones}
                      onChange={(value) => updateConfig('apariencia', 'animaciones', value)}
                      color="primary"
                      size="small"
                      icon={config.apariencia.animaciones ? "✨" : "🔒"}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Sonidos del Sistema</p>
                      <p className="text-xs text-gray-400 mt-0.5">Activar sonidos de notificación</p>
                    </div>
                    <Toggle
                      checked={config.apariencia.sonido}
                      onChange={(value) => updateConfig('apariencia', 'sonido', value)}
                      color="success"
                      size="small"
                      icon={config.apariencia.sonido ? "🔊" : "🔇"}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Académicas ── */}
            {tab === "academicas" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Configuraciones Académicas</h3>
                  <p className="text-xs text-gray-400">Ajustes específicos para tu rol académico</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user?.rol === "DOCENTE" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vista Predeterminada</label>
                      <select 
                        value={config.academicas.vistaPreferida} 
                        onChange={(e) => updateConfig('academicas', 'vistaPreferida', e.target.value)}
                        className={inputCls}
                      >
                        <option value="asistencia">Asistencia</option>
                        <option value="notas">Notas</option>
                        <option value="dashboard">Dashboard</option>
                      </select>
                    </div>
                  )}

                  {user?.rol === "ADMIN_INSTITUCIONAL" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Periodo por Defecto</label>
                      <select className={inputCls}>
                        <option value="2">Período 2 - 2025</option>
                        <option value="1">Período 1 - 2025</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Decimales en Notas</label>
                    <select 
                      value={config.academicas.decimalesNotas} 
                      onChange={(e) => updateConfig('academicas', 'decimalesNotas', Number(e.target.value))}
                      className={inputCls}
                    >
                      <option value="0">Sin decimales</option>
                      <option value="1">1 decimal</option>
                      <option value="2">2 decimales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Plantilla de Comentarios</label>
                    <select 
                      value={config.academicas.plantillaComentarios} 
                      onChange={(e) => updateConfig('academicas', 'plantillaComentarios', e.target.value)}
                      className={inputCls}
                    >
                      <option value="estándar">Estándar</option>
                      <option value="detallada">Detallada</option>
                      <option value="concisa">Concisa</option>
                    </select>
                  </div>
                </div>

                {user?.rol === "ESTUDIANTE" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Metas Personales</label>
                    <textarea
                      value={config.academicas.metasPersonales}
                      onChange={(e) => updateConfig('academicas', 'metasPersonales', e.target.value)}
                      placeholder="Define tus metas académicas..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition bg-gray-50 hover:bg-white resize-none"
                      rows={3}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Recordatorio de Asistencia</p>
                      <p className="text-xs text-gray-400 mt-0.5">Notificar para registrar asistencia diaria</p>
                    </div>
                    <Toggle
                      checked={config.academicas.recordatorioAsistencia}
                      onChange={(value) => updateConfig('academicas', 'recordatorioAsistencia', value)}
                      color="primary"
                      size="small"
                    />
                  </div>

                  {user?.rol === "ADMIN_INSTITUCIONAL" && (
                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Reportes Automáticos</p>
                        <p className="text-xs text-gray-400 mt-0.5">Generar reportes periódicos automáticamente</p>
                      </div>
                      <Toggle
                        checked={config.academicas.reporteAutomatico}
                        onChange={(value) => updateConfig('academicas', 'reporteAutomatico', value)}
                        color="success"
                        size="small"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Notificaciones ── */}
            {tab === "notificaciones" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Preferencias de Notificaciones</h3>
                  <p className="text-xs text-gray-400">Elige qué notificaciones quieres recibir</p>
                </div>
                <div className="space-y-1">
                  {Object.entries(config.notificaciones).map(([key, val]) => {
                    const cfg = notifLabels[key] || { label: key, desc: "" };
                    return (
                      <div key={key}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{cfg.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{cfg.desc}</p>
                        </div>
                        <Toggle
                          checked={val}
                          onChange={(newValue) => updateConfig('notificaciones', key, newValue)}
                          color="primary"
                          size="small"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Calendario ── */}
            {tab === "calendario" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Configuraciones de Calendario</h3>
                  <p className="text-xs text-gray-400">Ajusta tu zona horaria y preferencias de fecha</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Zona Horaria</label>
                    <select 
                      value={config.calendario.zonaHoraria} 
                      onChange={(e) => updateConfig('calendario', 'zonaHoraria', e.target.value)}
                      className={inputCls}
                    >
                      <option value="America/Bogota">Bogotá (GMT-5)</option>
                      <option value="America/Mexico_City">México (GMT-6)</option>
                      <option value="America/Argentina">Argentina (GMT-3)</option>
                      <option value="Europe/Madrid">España (GMT+1)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Formato de Fecha</label>
                    <select 
                      value={config.calendario.formatoFecha} 
                      onChange={(e) => updateConfig('calendario', 'formatoFecha', e.target.value)}
                      className={inputCls}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD de MMMM">DD de MMMM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Horario de Trabajo</label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={config.calendario.horasTrabajo.inicio}
                        onChange={(e) => updateConfig('calendario', 'horasTrabajo', {...config.calendario.horasTrabajo, inicio: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="flex items-center text-gray-500">a</span>
                      <input
                        type="time"
                        value={config.calendario.horasTrabajo.fin}
                        onChange={(e) => updateConfig('calendario', 'horasTrabajo', {...config.calendario.horasTrabajo, fin: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Días Laborables</label>
                  <div className="flex flex-wrap gap-2">
                    {["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"].map((dia) => (
                      <button
                        key={dia}
                        onClick={() => {
                          const dias = config.calendario.diasLaborables.includes(dia)
                            ? config.calendario.diasLaborables.filter(d => d !== dia)
                            : [...config.calendario.diasLaborables, dia];
                          updateConfig('calendario', 'diasLaborables', dias);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer
                          ${config.calendario.diasLaborables.includes(dia)
                            ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                            : "bg-gray-100 text-gray-500 border-2 border-gray-200"}`}
                      >
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Bloquear Fin de Semana</p>
                      <p className="text-xs text-gray-400 mt-0.5">No permitir actividades los fines de semana</p>
                    </div>
                    <Toggle
                      checked={config.calendario.bloqueoFinSemana}
                      onChange={(value) => updateConfig('calendario', 'bloqueoFinSemana', value)}
                      color="warning"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Integraciones ── */}
            {tab === "integraciones" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Integraciones y Sincronización</h3>
                  <p className="text-xs text-gray-400">Conecta con servicios externos</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Google Calendar</p>
                        <p className="text-xs text-gray-400 mt-0.5">Sincronizar eventos y horarios</p>
                      </div>
                    </div>
                    <Toggle
                      checked={config.integraciones.googleCalendar}
                      onChange={(value) => updateConfig('integraciones', 'googleCalendar', value)}
                      color="primary"
                      size="small"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Smartphone size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">App Móvil</p>
                        <p className="text-xs text-gray-400 mt-0.5">Acceso desde dispositivos móviles</p>
                      </div>
                    </div>
                    <Toggle
                      checked={config.integraciones.appMovil}
                      onChange={(value) => updateConfig('integraciones', 'appMovil', value)}
                      color="success"
                      size="small"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Upload size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Exportación Automática</p>
                        <p className="text-xs text-gray-400 mt-0.5">Exportar datos automáticamente</p>
                      </div>
                    </div>
                    <Toggle
                      checked={config.integraciones.exportacionAutomatica}
                      onChange={(value) => updateConfig('integraciones', 'exportacionAutomatica', value)}
                      color="primary"
                      size="small"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Personal</label>
                  <input
                    type="email"
                    value={config.integraciones.emailPersonal}
                    onChange={(e) => updateConfig('integraciones', 'emailPersonal', e.target.value)}
                    placeholder="tuemail@ejemplo.com"
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-400 mt-1">Para recibir notificaciones y reportes</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Estado de Sincronización</p>
                      <p className="text-xs">Última sincronización: Hace 2 minutos</p>
                      <p className="text-xs">Próxima sincronización: En 58 minutos</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Privacidad ── */}
            {tab === "privacidad" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Privacidad y Datos</h3>
                  <p className="text-xs text-gray-400">Controla tu información y privacidad</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Visibilidad del Perfil</p>
                      <p className="text-xs text-gray-400 mt-0.5">Quién puede ver tu perfil</p>
                    </div>
                    <select 
                      value={config.privacidad.visibilidadPerfil} 
                      onChange={(e) => updateConfig('privacidad', 'visibilidadPerfil', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="publico">Público</option>
                      <option value="institucion">Solo Institución</option>
                      <option value="privado">Privado</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Compartir Datos Académicos</p>
                      <p className="text-xs text-gray-400 mt-0.5">Permitir análisis de rendimiento</p>
                    </div>
                    <Toggle
                      checked={config.privacidad.compartirDatosAcademicos}
                      onChange={(value) => updateConfig('privacidad', 'compartirDatosAcademicos', value)}
                      color="warning"
                      size="small"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Historial de Actividad</p>
                      <p className="text-xs text-gray-400 mt-0.5">Guardar registro de acciones</p>
                    </div>
                    <Toggle
                      checked={config.privacidad.historialActividad}
                      onChange={(value) => updateConfig('privacidad', 'historialActividad', value)}
                      color="primary"
                      size="small"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Cookies de Analytics</p>
                      <p className="text-xs text-gray-400 mt-0.5">Ayudar a mejorar el sistema</p>
                    </div>
                    <Toggle
                      checked={config.privacidad.cookiesAnalytics}
                      onChange={(value) => updateConfig('privacidad', 'cookiesAnalytics', value)}
                      color="danger"
                      size="small"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Gestión de Datos</p>
                      <p className="text-xs">Tus datos están protegidos según la política de privacidad institucional.</p>
                      <p className="text-xs">Puedes solicitar una copia o eliminación de tus datos en cualquier momento.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Rendimiento ── */}
            {tab === "rendimiento" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Rendimiento y Cache</h3>
                  <p className="text-xs text-gray-400">Optimiza el rendimiento del sistema</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Modo Offline</p>
                      <p className="text-xs text-gray-400 mt-0.5">Trabajar sin conexión</p>
                    </div>
                    <Toggle
                      checked={config.rendimiento.modoOffline}
                      onChange={(value) => updateConfig('rendimiento', 'modoOffline', value)}
                      color="success"
                      size="small"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Sincronización Automática</p>
                      <p className="text-xs text-gray-400 mt-0.5">Actualizar datos automáticamente</p>
                    </div>
                    <Toggle
                      checked={config.rendimiento.sincronizacionAutomatica}
                      onChange={(value) => updateConfig('rendimiento', 'sincronizacionAutomatica', value)}
                      color="primary"
                      size="small"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Cache Local</p>
                      <p className="text-xs text-gray-400 mt-0.5">Almacenar datos localmente</p>
                    </div>
                    <Toggle
                      checked={config.rendimiento.cacheLocal}
                      onChange={(value) => updateConfig('rendimiento', 'cacheLocal', value)}
                      color="primary"
                      size="small"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Datos Precargados</p>
                      <p className="text-xs text-gray-400 mt-0.5">Cargar datos anticipadamente</p>
                    </div>
                    <Toggle
                      checked={config.rendimiento.datosPrecargados}
                      onChange={(value) => updateConfig('rendimiento', 'datosPrecargados', value)}
                      color="success"
                      size="small"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Calidad de Video</label>
                  <select 
                    value={config.rendimiento.calidadVideo} 
                    onChange={(e) => updateConfig('rendimiento', 'calidadVideo', e.target.value)}
                    className={inputCls}
                  >
                    <option value="baja">Baja (Ahorro de datos)</option>
                    <option value="media">Media (Balanceada)</option>
                    <option value="alta">Alta (Mejor calidad)</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition border-0 cursor-pointer">
                    <RefreshCw size={14} /> Limpiar Cache
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition border-0 cursor-pointer">
                    <Download size={14} /> Exportar Datos
                  </button>
                </div>
              </div>
            )}

            {/* ── Seguridad ── */}
            {tab === "seguridad" && (
              <form onSubmit={guardar} className="space-y-5 max-w-md">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Cambiar Contraseña</h3>
                  <p className="text-xs text-gray-400">Usa una contraseña segura de al menos 8 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass.nueva ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Mínimo 8 caracteres"
                      className={`${inputCls} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPass(p => ({ ...p, nueva: !p.nueva }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-1">
                      {showPass.nueva ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass.confirmar ? "text" : "password"}
                      value={form.passwordConfirm}
                      onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                      placeholder="Repite la contraseña"
                      className={`${inputCls} pr-11 ${
                        form.passwordConfirm && form.passwordConfirm !== form.password
                          ? "border-red-300 focus:border-red-400" : ""
                      }`}
                    />
                    <button type="button" onClick={() => setShowPass(p => ({ ...p, confirmar: !p.confirmar }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-1">
                      {showPass.confirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.passwordConfirm && form.passwordConfirm !== form.password && (
                    <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
