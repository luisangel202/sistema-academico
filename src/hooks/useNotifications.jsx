import { useCallback, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

export function useNotifications() {
  const { config, triggerNotification, requestNotificationPermission } = useConfig();

  // Solicitar permisos al montar el hook
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Notificaciones básicas
  const notifySuccess = useCallback((title, message = '') => {
    if (config.notificaciones.notas) {
      triggerNotification('success', title, message || 'Operación completada exitosamente');
    }
  }, [config.notificaciones.notas, triggerNotification]);

  const notifyError = useCallback((title, message = '') => {
    if (config.notificaciones.alertas) {
      triggerNotification('error', title, message || 'Ha ocurrido un error');
    }
  }, [config.notificaciones.alertas, triggerNotification]);

  const notifyWarning = useCallback((title, message = '') => {
    if (config.notificaciones.alertas) {
      triggerNotification('warning', title, message || 'Advertencia');
    }
  }, [config.notificaciones.alertas, triggerNotification]);

  const notifyInfo = useCallback((title, message = '') => {
    if (config.notificaciones.mensajes) {
      triggerNotification('info', title, message || 'Información');
    }
  }, [config.notificaciones.mensajes, triggerNotification]);

  // Notificaciones académicas específicas
  const notifyNotaPublicada = useCallback((materia, estudiante) => {
    if (config.notificacionesAvanzadas.email.notas) {
      triggerNotification('notas', 'Nueva Nota Publicada', 
        `Se ha publicado una nueva calificación en ${materia}${estudiante ? ` para ${estudiante}` : ''}`);
    }
  }, [config.notificacionesAvanzadas.email.notas, triggerNotification]);

  const notifyTareaAsignada = useCallback((tarea, materia) => {
    if (config.notificacionesAvanzadas.email.tareas) {
      triggerNotification('tareas', 'Nueva Tarea Asignada', 
        `Se ha asignado una nueva tarea: ${tarea} en ${materia}`);
    }
  }, [config.notificacionesAvanzadas.email.tareas, triggerNotification]);

  const notifyAsistencia = useCallback((mensaje) => {
    if (config.notificacionesAvanzadas.email.asistencia) {
      triggerNotification('asistencia', 'Recordatorio de Asistencia', mensaje);
    }
  }, [config.notificacionesAvanzadas.email.asistencia, triggerNotification]);

  const notifyMensaje = useCallback((remitente, asunto) => {
    if (config.notificacionesAvanzadas.email.mensajes) {
      triggerNotification('mensajes', 'Nuevo Mensaje', 
        `Has recibido un mensaje de ${remitente}: ${asunto}`);
    }
  }, [config.notificacionesAvanzadas.email.mensajes, triggerNotification]);

  const notifyAlerta = useCallback((tipo, descripcion) => {
    if (config.notificacionesAvanzadas.email.reportes) {
      triggerNotification('alertas', `Alerta: ${tipo}`, descripcion);
    }
  }, [config.notificacionesAvanzadas.email.reportes, triggerNotification]);

  // Notificaciones SMS (urgentemente)
  const notifySMSUrgente = useCallback((mensaje) => {
    if (config.notificacionesAvanzadas.sms.urgentes) {
      // Aquí se integraría con un servicio SMS real
      console.log('SMS Urgente:', mensaje);
      triggerNotification('sms', 'Mensaje SMS Urgente', mensaje);
    }
  }, [config.notificacionesAvanzadas.sms.urgentes, triggerNotification]);

  const notifySMSCitacion = useCallback((detalles) => {
    if (config.notificacionesAvanzadas.sms.citaciones) {
      console.log('SMS Citación:', detalles);
      triggerNotification('sms', 'Citación Programada', detalles);
    }
  }, [config.notificacionesAvanzadas.sms.citaciones, triggerNotification]);

  const notifySMSAusencia = useCallback((estudiante, fecha) => {
    if (config.notificacionesAvanzadas.sms.ausencias) {
      const mensaje = `Ausencia registrada: ${estudiante} el ${fecha}`;
      console.log('SMS Ausencia:', mensaje);
      triggerNotification('sms', 'Ausencia Registrada', mensaje);
    }
  }, [config.notificacionesAvanzadas.sms.ausencias, triggerNotification]);

  // Notificaciones Push
  const notifyPushInmediata = useCallback((titulo, mensaje) => {
    if (config.notificacionesAvanzadas.push.inmediatas) {
      triggerNotification('push', titulo, mensaje);
    }
  }, [config.notificacionesAvanzadas.push.inmediatas, triggerNotification]);

  const notifyPushResumen = useCallback((resumen) => {
    if (config.notificacionesAvanzadas.push.resumenDiario) {
      triggerNotification('push', 'Resumen Diario', resumen);
    }
  }, [config.notificacionesAvanzadas.push.resumenDiario, triggerNotification]);

  const notifyPushRecordatorio = useCallback((evento) => {
    if (config.notificacionesAvanzadas.push.recordatorios) {
      triggerNotification('push', 'Recordatorio', evento);
    }
  }, [config.notificacionesAvanzadas.push.recordatorios, triggerNotification]);

  // Funciones de utilidad
  const notifyCustom = useCallback((type, title, message) => {
    triggerNotification(type, title, message);
  }, [triggerNotification]);

  // Verificar permisos
  const checkPermissions = useCallback(() => {
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }, []);

  // Solicitar permisos manualmente
  const requestPermissions = useCallback(async () => {
    return await requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    // Básicas
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    
    // Académicas
    notifyNotaPublicada,
    notifyTareaAsignada,
    notifyAsistencia,
    notifyMensaje,
    notifyAlerta,
    
    // SMS
    notifySMSUrgente,
    notifySMSCitacion,
    notifySMSAusencia,
    
    // Push
    notifyPushInmediata,
    notifyPushResumen,
    notifyPushRecordatorio,
    
    // Utilidades
    notifyCustom,
    checkPermissions,
    requestPermissions,
    
    // Estado de permisos
    hasPermissions: checkPermissions(),
    soundEnabled: config.apariencia.sonido,
    notificationsEnabled: {
      basic: config.notificaciones,
      advanced: config.notificacionesAvanzadas
    }
  };
}
