// Configuraciones por defecto para cada rol del sistema académico

export const defaultConfigsByRole = {
  SUPER_ADMIN: {
    apariencia: {
      tema: 'oscuro',
      tamañoFuente: 'mediano',
      modoContraste: 'normal',
      animaciones: true,
      sonido: true,
      idioma: 'español'
    },
    academicas: {
      vistaPreferida: 'dashboard',
      decimalesNotas: 2,
      plantillaComentarios: 'detallada',
      recordatorioAsistencia: false,
      reporteAutomatico: false
    },
    notificaciones: {
      notas: false,
      tareas: false,
      asistencia: false,
      mensajes: true,
      alertas: true
    },
    notificacionesAvanzadas: {
      email: {
        notas: false,
        tareas: false,
        asistencia: false,
        mensajes: true,
        reportes: true
      },
      sms: {
        urgentes: true,
        citaciones: false,
        ausencias: false
      },
      push: {
        inmediatas: true,
        resumenDiario: false,
        recordatorios: false
      }
    },
    calendario: {
      zonaHoraria: 'UTC',
      formatoFecha: 'YYYY-MM-DD',
      horasTrabajo: { inicio: '00:00', fin: '23:59' },
      diasLaborables: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
      bloqueoFinSemana: false
    },
    integraciones: {
      googleCalendar: false,
      appMovil: true,
      exportacionAutomatica: true,
      emailPersonal: ''
    },
    privacidad: {
      visibilidadPerfil: 'privado',
      compartirDatosAcademicos: false,
      historialActividad: true,
      cookiesAnalytics: true
    },
    rendimiento: {
      modoOffline: false,
      sincronizacionAutomatica: true,
      cacheLocal: true,
      datosPrecargados: true,
      calidadVideo: 'alta'
    }
  },

  ADMIN_INSTITUCIONAL: {
    apariencia: {
      tema: 'claro',
      tamañoFuente: 'mediano',
      modoContraste: 'normal',
      animaciones: true,
      sonido: true,
      idioma: 'español'
    },
    academicas: {
      vistaPreferida: 'dashboard',
      periodoPorDefecto: 'actual',
      decimalesNotas: 2,
      plantillaComentarios: 'detallada',
      recordatorioAsistencia: true,
      reporteAutomatico: true
    },
    notificaciones: {
      notas: true,
      tareas: true,
      asistencia: true,
      mensajes: true,
      alertas: true
    },
    notificacionesAvanzadas: {
      email: {
        notas: true,
        tareas: true,
        asistencia: true,
        mensajes: true,
        reportes: true
      },
      sms: {
        urgentes: true,
        citaciones: true,
        ausencias: false
      },
      push: {
        inmediatas: true,
        resumenDiario: true,
        recordatorios: true
      }
    },
    calendario: {
      zonaHoraria: 'America/Bogota',
      formatoFecha: 'DD/MM/YYYY',
      horasTrabajo: { inicio: '07:00', fin: '17:00' },
      diasLaborables: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
      bloqueoFinSemana: true
    },
    integraciones: {
      googleCalendar: true,
      appMovil: true,
      exportacionAutomatica: true,
      emailPersonal: ''
    },
    privacidad: {
      visibilidadPerfil: 'institucion',
      compartirDatosAcademicos: true,
      historialActividad: true,
      cookiesAnalytics: true
    },
    rendimiento: {
      modoOffline: false,
      sincronizacionAutomatica: true,
      cacheLocal: true,
      datosPrecargados: true,
      calidadVideo: 'media'
    }
  },

  COORDINADOR: {
    apariencia: {
      tema: 'claro',
      tamañoFuente: 'mediano',
      modoContraste: 'normal',
      animaciones: true,
      sonido: true,
      idioma: 'español'
    },
    academicas: {
      vistaPreferida: 'dashboard',
      decimalesNotas: 2,
      plantillaComentarios: 'detallada',
      recordatorioAsistencia: true,
      reporteAutomatico: false
    },
    notificaciones: {
      notas: false,
      tareas: false,
      asistencia: false,
      mensajes: true,
      alertas: true
    },
    notificacionesAvanzadas: {
      email: {
        notas: false,
        tareas: false,
        asistencia: false,
        mensajes: true,
        reportes: true
      },
      sms: {
        urgentes: true,
        citaciones: false,
        ausencias: false
      },
      push: {
        inmediatas: true,
        resumenDiario: false,
        recordatorios: false
      }
    },
    calendario: {
      zonaHoraria: 'America/Bogota',
      formatoFecha: 'DD/MM/YYYY',
      horasTrabajo: { inicio: '07:00', fin: '17:00' },
      diasLaborables: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
      bloqueoFinSemana: true
    },
    integraciones: {
      googleCalendar: true,
      appMovil: true,
      exportacionAutomatica: false,
      emailPersonal: ''
    },
    privacidad: {
      visibilidadPerfil: 'institucion',
      compartirDatosAcademicos: true,
      historialActividad: true,
      cookiesAnalytics: true
    },
    rendimiento: {
      modoOffline: false,
      sincronizacionAutomatica: true,
      cacheLocal: true,
      datosPrecargados: true,
      calidadVideo: 'media'
    }
  },

  DOCENTE: {
    apariencia: {
      tema: 'auto',
      tamañoFuente: 'mediano',
      modoContraste: 'normal',
      animaciones: true,
      sonido: true,
      idioma: 'español'
    },
    academicas: {
      vistaPreferida: 'asistencia',
      decimalesNotas: 1,
      plantillaComentarios: 'estándar',
      recordatorioAsistencia: true,
      reporteAutomatico: false
    },
    notificaciones: {
      notas: true,
      tareas: true,
      asistencia: true,
      mensajes: true,
      alertas: false
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
        citaciones: false,
        ausencias: false
      },
      push: {
        inmediatas: true,
        resumenDiario: false,
        recordatorios: true
      }
    },
    calendario: {
      zonaHoraria: 'America/Bogota',
      formatoFecha: 'DD/MM/YYYY',
      horasTrabajo: { inicio: '06:30', fin: '16:30' },
      diasLaborables: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
      bloqueoFinSemana: true
    },
    integraciones: {
      googleCalendar: true,
      appMovil: true,
      exportacionAutomatica: false,
      emailPersonal: ''
    },
    privacidad: {
      visibilidadPerfil: 'institucion',
      compartirDatosAcademicos: true,
      historialActividad: false,
      cookiesAnalytics: false
    },
    rendimiento: {
      modoOffline: true,
      sincronizacionAutomatica: true,
      cacheLocal: true,
      datosPrecargados: true,
      calidadVideo: 'baja'
    }
  },

  DIRECTOR_GRUPO: {
    apariencia: {
      tema: 'claro',
      tamañoFuente: 'mediano',
      modoContraste: 'normal',
      animaciones: true,
      sonido: true,
      idioma: 'español'
    },
    academicas: {
      vistaPreferida: 'dashboard',
      decimalesNotas: 2,
      plantillaComentarios: 'detallada',
      recordatorioAsistencia: true,
      reporteAutomatico: false
    },
    notificaciones: {
      notas: true,
      tareas: true,
      asistencia: true,
      mensajes: true,
      alertas: true
    },
    notificacionesAvanzadas: {
      email: {
        notas: true,
        tareas: true,
        asistencia: true,
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
      zonaHoraria: 'America/Bogota',
      formatoFecha: 'DD/MM/YYYY',
      horasTrabajo: { inicio: '07:00', fin: '17:00' },
      diasLaborables: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
      bloqueoFinSemana: true
    },
    integraciones: {
      googleCalendar: true,
      appMovil: true,
      exportacionAutomatica: false,
      emailPersonal: ''
    },
    privacidad: {
      visibilidadPerfil: 'institucion',
      compartirDatosAcademicos: true,
      historialActividad: true,
      cookiesAnalytics: true
    },
    rendimiento: {
      modoOffline: false,
      sincronizacionAutomatica: true,
      cacheLocal: true,
      datosPrecargados: true,
      calidadVideo: 'media'
    }
  },

  PSICOORIENTADOR: {
    apariencia: {
      tema: 'claro',
      tamañoFuente: 'grande',
      modoContraste: 'normal',
      animaciones: false,
      sonido: false,
      idioma: 'español'
    },
    academicas: {
      vistaPreferida: 'dashboard',
      decimalesNotas: 0,
      plantillaComentarios: 'detallada',
      recordatorioAsistencia: true,
      reporteAutomatico: false
    },
    notificaciones: {
      notas: false,
      tareas: false,
      asistencia: false,
      mensajes: true,
      alertas: true
    },
    notificacionesAvanzadas: {
      email: {
        notas: false,
        tareas: false,
        asistencia: false,
        mensajes: true,
        reportes: false
      },
      sms: {
        urgentes: true,
        citaciones: false,
        ausencias: false
      },
      push: {
        inmediatas: false,
        resumenDiario: false,
        recordatorios: false
      }
    },
    calendario: {
      zonaHoraria: 'America/Bogota',
      formatoFecha: 'DD/MM/YYYY',
      horasTrabajo: { inicio: '08:00', fin: '16:00' },
      diasLaborables: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
      bloqueoFinSemana: true
    },
    integraciones: {
      googleCalendar: true,
      appMovil: false,
      exportacionAutomatica: false,
      emailPersonal: ''
    },
    privacidad: {
      visibilidadPerfil: 'institucion',
      compartirDatosAcademicos: false,
      historialActividad: true,
      cookiesAnalytics: false
    },
    rendimiento: {
      modoOffline: true,
      sincronizacionAutomatica: false,
      cacheLocal: false,
      datosPrecargados: false,
      calidadVideo: 'baja'
    }
  },

  SECRETARIA: {
    apariencia: {
      tema: 'claro',
      tamañoFuente: 'mediano',
      modoContraste: 'normal',
      animaciones: true,
      sonido: true,
      idioma: 'español'
    },
    academicas: {
      vistaPreferida: 'dashboard',
      decimalesNotas: 0,
      plantillaComentarios: 'estándar',
      recordatorioAsistencia: true,
      reporteAutomatico: false
    },
    notificaciones: {
      notas: false,
      tareas: false,
      asistencia: false,
      mensajes: true,
      alertas: true
    },
    notificacionesAvanzadas: {
      email: {
        notas: false,
        tareas: false,
        asistencia: false,
        mensajes: true,
        reportes: false
      },
      sms: {
        urgentes: true,
        citaciones: false,
        ausencias: false
      },
      push: {
        inmediatas: false,
        resumenDiario: false,
        recordatorios: false
      }
    },
    calendario: {
      zonaHoraria: 'America/Bogota',
      formatoFecha: 'DD/MM/YYYY',
      horasTrabajo: { inicio: '07:00', fin: '17:00' },
      diasLaborables: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
      bloqueoFinSemana: true
    },
    integraciones: {
      googleCalendar: true,
      appMovil: false,
      exportacionAutomatica: false,
      emailPersonal: ''
    },
    privacidad: {
      visibilidadPerfil: 'institucion',
      compartirDatosAcademicos: false,
      historialActividad: true,
      cookiesAnalytics: true
    },
    rendimiento: {
      modoOffline: false,
      sincronizacionAutomatica: true,
      cacheLocal: true,
      datosPrecargados: true,
      calidadVideo: 'baja'
    }
  },

  ESTUDIANTE: {
    apariencia: {
      tema: 'auto',
      tamañoFuente: 'mediano',
      modoContraste: 'normal',
      animaciones: true,
      sonido: true,
      idioma: 'español'
    },
    academicas: {
      vistaPreferida: 'dashboard',
      metasPersonales: '',
      decimalesNotas: 0,
      plantillaComentarios: 'estándar',
      recordatorioAsistencia: true,
      reporteAutomatico: false
    },
    notificaciones: {
      notas: true,
      tareas: true,
      asistencia: true,
      mensajes: true,
      alertas: true
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
        urgentes: false,
        citaciones: false,
        ausencias: false
      },
      push: {
        inmediatas: true,
        resumenDiario: false,
        recordatorios: true
      }
    },
    calendario: {
      zonaHoraria: 'America/Bogota',
      formatoFecha: 'DD/MM/YYYY',
      horasTrabajo: { inicio: '07:00', fin: '17:00' },
      diasLaborables: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
      bloqueoFinSemana: false
    },
    integraciones: {
      googleCalendar: true,
      appMovil: true,
      exportacionAutomatica: false,
      emailPersonal: ''
    },
    privacidad: {
      visibilidadPerfil: 'institucion',
      compartirDatosAcademicos: false,
      historialActividad: true,
      cookiesAnalytics: false
    },
    rendimiento: {
      modoOffline: true,
      sincronizacionAutomatica: true,
      cacheLocal: true,
      datosPrecargados: true,
      calidadVideo: 'baja'
    }
  },

  PADRE: {
    apariencia: {
      tema: 'claro',
      tamañoFuente: 'grande',
      modoContraste: 'normal',
      animaciones: false,
      sonido: true,
      idioma: 'español'
    },
    academicas: {
      vistaPreferida: 'dashboard',
      metasPersonales: '',
      decimalesNotas: 0,
      plantillaComentarios: 'estándar',
      recordatorioAsistencia: true,
      reporteAutomatico: false
    },
    notificaciones: {
      notas: false,
      tareas: false,
      asistencia: false,
      mensajes: true,
      alertas: true
    },
    notificacionesAvanzadas: {
      email: {
        notas: false,
        tareas: false,
        asistencia: false,
        mensajes: true,
        reportes: false
      },
      sms: {
        urgentes: true,
        citaciones: false,
        ausencias: false
      },
      push: {
        inmediatas: true,
        resumenDiario: false,
        recordatorios: false
      }
    },
    calendario: {
      zonaHoraria: 'America/Bogota',
      formatoFecha: 'DD/MM/YYYY',
      horasTrabajo: { inicio: '07:00', fin: '17:00' },
      diasLaborables: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
      bloqueoFinSemana: false
    },
    integraciones: {
      googleCalendar: true,
      appMovil: true,
      exportacionAutomatica: false,
      emailPersonal: ''
    },
    privacidad: {
      visibilidadPerfil: 'institucion',
      compartirDatosAcademicos: false,
      historialActividad: false,
      cookiesAnalytics: false
    },
    rendimiento: {
      modoOffline: false,
      sincronizacionAutomatica: true,
      cacheLocal: true,
      datosPrecargados: false,
      calidadVideo: 'baja'
    }
  }
};

// Función para obtener configuraciones por defecto según el rol
export const getConfigByRole = (userRole) => {
  return defaultConfigsByRole[userRole] || defaultConfigsByRole.ESTUDIANTE;
};

// Función para asignar configuraciones a un nuevo usuario
export const assignRoleConfig = (user) => {
  const roleConfig = getConfigByRole(user.rol);
  
  // Fusionar con datos específicos del usuario
  return {
    ...roleConfig,
    // Datos personales que no vienen del rol
    integraciones: {
      ...roleConfig.integraciones,
      emailPersonal: user.correo || ''
    },
    academicas: {
      ...roleConfig.academicas,
      metasPersonales: user.rol === 'ESTUDIANTE' ? '' : undefined
    }
  };
};

// Función para resetear configuraciones a los valores por defecto del rol
export const resetToRoleDefaults = (userRole) => {
  return getConfigByRole(userRole);
};

// Función para validar si una configuración es aplicable a un rol
export const isConfigApplicableToRole = (configSection, userRole) => {
  const roleConfig = getConfigByRole(userRole);
  return roleConfig[configSection] !== undefined;
};

// Función para obtener solo las configuraciones modificables por el usuario
export const getUserModifiableConfigs = (userRole) => {
  const roleConfig = getConfigByRole(userRole);
  
  // Aquí se pueden definir qué secciones puede modificar el usuario
  return {
    apariencia: roleConfig.apariencia,
    academicas: roleConfig.academicas,
    notificaciones: roleConfig.notificaciones,
    calendario: roleConfig.calendario,
    integraciones: roleConfig.integraciones,
    privacidad: roleConfig.privacidad,
    rendimiento: roleConfig.rendimiento
  };
};
