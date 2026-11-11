import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { Moon, Sun, Bell, Volume2, VolumeX, Palette, Settings } from 'lucide-react';

export default function ConfigExample() {
  const { config, updateConfig, exportConfig, importConfig } = useConfig();
  const { 
    theme, 
    fontSize, 
    animations, 
    sound, 
    toggleTheme, 
    toggleAnimations, 
    toggleSound,
    setFontSize,
    getThemeInfo 
  } = useTheme();
  
  const { 
    notifySuccess, 
    notifyError, 
    notifyWarning, 
    notifyInfo,
    notifyNotaPublicada,
    notifyTareaAsignada,
    hasPermissions,
    notificationsEnabled
  } = useNotifications();

  const [testMessage, setTestMessage] = useState('');

  // Demostrar cambios de configuración
  const handleThemeToggle = () => {
    toggleTheme();
    notifySuccess('Tema Cambiado', `El tema ahora es ${getThemeInfo().theme}`);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    notifyInfo('Tamaño de Fuente', `Tamaño cambiado a ${size}`);
  };

  const handleAnimationToggle = () => {
    toggleAnimations();
    notifyInfo('Animaciones', animations ? 'Animaciones desactivadas' : 'Animaciones activadas');
  };

  const handleSoundToggle = () => {
    toggleSound();
    notifyInfo('Sonidos', sound ? 'Sonidos desactivados' : 'Sonidos activados');
  };

  // Demostrar notificaciones
  const testNotifications = () => {
    notifySuccess('Éxito', 'Esta es una notificación de éxito');
    setTimeout(() => notifyError('Error', 'Esta es una notificación de error'), 1000);
    setTimeout(() => notifyWarning('Advertencia', 'Esta es una advertencia'), 2000);
    setTimeout(() => notifyInfo('Info', 'Esta es información'), 3000);
  };

  const testAcademicNotifications = () => {
    notifyNotaPublicada('Matemáticas', 'Juan Pérez');
    setTimeout(() => notifyTareaAsignada('Tarea de Álgebra', 'Matemáticas'), 1000);
  };

  // Exportar/Importar configuraciones
  const handleExport = () => {
    exportConfig();
    notifySuccess('Exportación', 'Configuraciones exportadas correctamente');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importConfig(file)
        .then(() => notifySuccess('Importación', 'Configuraciones importadas correctamente'))
        .catch(() => notifyError('Importación', 'Error al importar configuraciones'));
    }
  };

  // Actualizar configuración específica
  const updateSpecificConfig = () => {
    updateConfig('academicas', 'decimalesNotas', 2);
    notifySuccess('Configuración', 'Decimales en notas actualizado a 2');
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Demo de Configuraciones Funcionales</h2>
      </div>

      {/* Información actual */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Estado Actual de Configuraciones:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
          <div><strong>Tema:</strong> {theme}</div>
          <div><strong>Tamaño Fuente:</strong> {fontSize}</div>
          <div><strong>Animaciones:</strong> {animations ? 'Activadas' : 'Desactivadas'}</div>
          <div><strong>Sonidos:</strong> {sound ? 'Activados' : 'Desactivados'}</div>
          <div><strong>Idioma:</strong> {config.apariencia.idioma}</div>
          <div><strong>Contraste:</strong> {config.apariencia.modoContraste}</div>
          <div><strong>Decimales Notas:</strong> {config.academicas.decimalesNotas}</div>
          <div><strong>Notificaciones:</strong> {hasPermissions ? 'Permitidas' : 'Denegadas'}</div>
        </div>
      </div>

      {/* Controles de Tema */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Palette size={18} /> Controles de Tema
        </h3>
        
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleThemeToggle}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {theme === 'oscuro' ? <Sun size={16} /> : <Moon size={16} />}
            Cambiar Tema
          </button>
          
          <button
            onClick={handleAnimationToggle}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {animations ? '🎬' : '⏸️'} Animaciones
          </button>
          
          <button
            onClick={handleSoundToggle}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            Sonidos
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleFontSizeChange('pequeño')}
            className={`px-3 py-1 rounded ${fontSize === 'pequeño' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Pequeño
          </button>
          <button
            onClick={() => handleFontSizeChange('mediano')}
            className={`px-3 py-1 rounded ${fontSize === 'mediano' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Mediano
          </button>
          <button
            onClick={() => handleFontSizeChange('grande')}
            className={`px-3 py-1 rounded ${fontSize === 'grande' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Grande
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Bell size={18} /> Notificaciones
        </h3>
        
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={testNotifications}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Probar Notificaciones
          </button>
          
          <button
            onClick={testAcademicNotifications}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Notificaciones Académicas
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-2">Mensaje personalizado:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={() => {
                if (testMessage) {
                  notifyInfo('Mensaje Personalizado', testMessage);
                  setTestMessage('');
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>

      {/* Configuraciones Avanzadas */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800">Configuraciones Avanzadas</h3>
        
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={updateSpecificConfig}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Cambiar Decimales a 2
          </button>
          
          <button
            onClick={() => updateConfig('apariencia', 'idioma', 'inglés')}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            Cambiar a Inglés
          </button>
          
          <button
            onClick={() => updateConfig('academicas', 'recordatorioAsistencia', !config.academicas.recordatorioAsistencia)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            {config.academicas.recordatorioAsistencia ? 'Desactivar' : 'Activar'} Recordatorios
          </button>
        </div>
      </div>

      {/* Import/Export */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800">Importar/Exportar</h3>
        
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            📥 Exportar Configuraciones
          </button>
          
          <label className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer">
            📤 Importar Configuraciones
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Estado de Notificaciones */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h4 className="font-semibold text-green-800 mb-2">Estado de Notificaciones:</h4>
        <div className="space-y-1 text-sm text-green-700">
          <div><strong>Permisos:</strong> {hasPermissions ? '✅ Concedidos' : '❌ Denegados'}</div>
          <div><strong>Básicas:</strong> 
            {notificationsEnabled.basic.notas ? ' ✅' : ' ❌'} Notas
            {notificationsEnabled.basic.tareas ? ' ✅' : ' ❌'} Tareas
            {notificationsEnabled.basic.asistencia ? ' ✅' : ' ❌'} Asistencia
            {notificationsEnabled.basic.mensajes ? ' ✅' : ' ❌'} Mensajes
            {notificationsEnabled.basic.alertas ? ' ✅' : ' ❌'} Alertas
          </div>
          <div><strong>Avanzadas:</strong>
            {notificationsEnabled.advanced.email.notas ? ' ✅' : ' ❌'} Email Notas
            {notificationsEnabled.advanced.sms.urgentes ? ' ✅' : ' ❌'} SMS Urgentes
            {notificationsEnabled.advanced.push.inmediatas ? ' ✅' : ' ❌'} Push Inmediatas
          </div>
        </div>
      </div>
    </div>
  );
}
