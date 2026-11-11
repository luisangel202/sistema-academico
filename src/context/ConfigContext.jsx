import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getConfigByRole, assignRoleConfig } from '../utils/roleConfigs';

const defaultConfig = {
  apariencia: {
    tema: "claro",
    idioma: "español",
    tamañoFuente: "mediano",
    modoContraste: "normal",
    animaciones: true,
    sonido: true
  },
  academicas: {
    vistaPreferida: "dashboard",
    recordatorioAsistencia: true,
    decimalesNotas: 1,
    plantillaComentarios: "estándar",
    reporteAutomatico: false,
    metasPersonales: "",
    nivelAsistenciaIA: "medio"
  },
  notificaciones: {
    notas: true, tareas: true, asistencia: true, mensajes: true, alertas: true,
  },
  notificacionesAvanzadas: {
    email: {
      notas: true,
      tareas: true,
      asistencia: false,
      mensajes: true,
      reportes: false
    },
    sms: {
      urgentes: true,
      citaciones: true,
      ausencias: false
    },
    push: {
      inmediatas: true,
      resumenDiario: false,
      recordatorios: true
    }
  },
  calendario: {
    zonaHoraria: "America/Bogota",
    formatoFecha: "DD/MM/YYYY",
    diasLaborables: ["lunes", "martes", "miércoles", "jueves", "viernes"],
    horasTrabajo: { inicio: "07:00", fin: "17:00" },
    bloqueoFinSemana: true
  },
  iaConfig: {
    nivelAsistencia: "medio",
    sugerenciasAutomaticas: true,
    analisisPredictivo: true,
    recomendacionesPersonalizadas: true,
    modoAprendizaje: "adaptativo"
  },
  integraciones: {
    googleCalendar: false,
    emailPersonal: "",
    appMovil: false,
    exportacionAutomatica: false,
    sincronizacionActiva: false
  },
  privacidad: {
    visibilidadPerfil: "institucion",
    compartirDatosAcademicos: true,
    historialActividad: true,
    eliminacionAutomatica: false,
    cookiesAnalytics: true
  },
  rendimiento: {
    modoOffline: false,
    sincronizacionAutomatica: true,
    cacheLocal: true,
    datosPrecargados: true,
    calidadVideo: "media"
  }
};

const ConfigContext = createContext();

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig debe ser usado dentro de ConfigProvider');
  }
  return context;
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(() => {
    // Obtener información del usuario actual
    const userStr = localStorage.getItem('user');
    let user = null;
    
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    }

    // Cargar configuraciones desde localStorage
    const savedConfig = localStorage.getItem('configuraciones');
    let baseConfig = defaultConfig;

    // Si hay un usuario con rol, usar configuraciones específicas del rol
    if (user && user.rol) {
      baseConfig = getConfigByRole(user.rol);
    }

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        // Fusionar configuraciones guardadas con las del rol (prioridad a las guardadas)
        return { ...baseConfig, ...parsedConfig };
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
        return baseConfig;
      }
    }
    
    // Si no hay configuraciones guardadas pero hay usuario, asignar configuraciones del rol
    if (user && user.rol) {
      const roleConfig = assignRoleConfig(user);
      // Guardar automáticamente las configuraciones del rol
      localStorage.setItem('configuraciones', JSON.stringify(roleConfig));
      return roleConfig;
    }
    
    return baseConfig;
  });

  // Guardar configuraciones en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('configuraciones', JSON.stringify(config));
  }, [config]);

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    const tema = config.apariencia.tema;
    
    if (tema === 'oscuro') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (tema === 'claro') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // Auto: detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [config.apariencia.tema]);

  // Aplicar tamaño de fuente
  useEffect(() => {
    const root = document.documentElement;
    const tamaño = config.apariencia.tamañoFuente;
    
    // Remover clases de tamaño existentes
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    
    // Aplicar nueva clase
    switch (tamaño) {
      case 'pequeño':
        root.classList.add('text-sm');
        break;
      case 'grande':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }
  }, [config.apariencia.tamañoFuente]);

  // Aplicar modo contraste
  useEffect(() => {
    const root = document.documentElement;
    const contraste = config.apariencia.modoContraste;
    
    if (contraste === 'alto') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [config.apariencia.modoContraste]);

  // Aplicar animaciones
  useEffect(() => {
    const root = document.documentElement;
    const animaciones = config.apariencia.animaciones;
    
    if (!animaciones) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  }, [config.apariencia.animaciones]);

  // Función para actualizar configuraciones
  const updateConfig = useCallback((section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  }, []);

  // Función para actualizar sección completa
  const updateSection = useCallback((section, values) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values
      }
    }));
  }, []);

  // Función para resetear configuraciones
  const resetConfig = useCallback(() => {
    // Obtener usuario actual para resetear a configuraciones de su rol
    const userStr = localStorage.getItem('user');
    let user = null;
    
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    }

    // Si hay usuario con rol, resetear a configuraciones del rol
    if (user && user.rol) {
      const roleConfig = assignRoleConfig(user);
      setConfig(roleConfig);
      localStorage.setItem('configuraciones', JSON.stringify(roleConfig));
    } else {
      // Si no hay rol, usar configuraciones por defecto generales
      setConfig(defaultConfig);
      localStorage.removeItem('configuraciones');
    }
  }, []);

  // Función para exportar configuraciones
  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'configuraciones.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [config]);

  // Función para importar configuraciones
  const importConfig = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setConfig({ ...defaultConfig, ...imported });
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  // Sistema de notificaciones
  const triggerNotification = useCallback((type, title, message) => {
    if (!config.apariencia.sonido) return;

    // Crear notificación del sistema
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: type
      });
    }

    // Reproducir sonido si está habilitado
    if (config.apariencia.sonido) {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [config.apariencia.sonido]);

  // Solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Función para obtener configuraciones del rol actual
  const getCurrentRoleConfig = useCallback(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.rol) {
          return getConfigByRole(user.rol);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    }
    return defaultConfig;
  }, []);

  // Función para verificar si una configuración está disponible para el rol actual
  const isConfigAvailable = useCallback((section) => {
    const roleConfig = getCurrentRoleConfig();
    return roleConfig[section] !== undefined;
  }, [getCurrentRoleConfig]);

  const value = {
    config,
    updateConfig,
    updateSection,
    resetConfig,
    exportConfig,
    importConfig,
    triggerNotification,
    requestNotificationPermission,
    getCurrentRoleConfig,
    isConfigAvailable
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}
