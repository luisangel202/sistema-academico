import { useCallback, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

export function useTheme() {
  const { config, updateConfig } = useConfig();

  // Aplicar tema al documento
  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    
    // Remover clases existentes
    root.classList.remove('light', 'dark');
    
    if (theme === 'oscuro') {
      root.classList.add('dark');
    } else if (theme === 'claro') {
      root.classList.add('light');
    } else if (theme === 'auto') {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    }
  }, []);

  // Aplicar tamaño de fuente
  const applyFontSize = useCallback((size) => {
    const root = document.documentElement;
    
    // Remover clases existentes
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    
    // Aplicar nueva clase
    switch (size) {
      case 'pequeño':
        root.classList.add('text-sm');
        break;
      case 'grande':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }
  }, []);

  // Aplicar modo contraste
  const applyContrast = useCallback((contrast) => {
    const root = document.documentElement;
    
    if (contrast === 'alto') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, []);

  // Aplicar animaciones
  const applyAnimations = useCallback((enabled) => {
    const root = document.documentElement;
    
    if (!enabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  }, []);

  // Efectos para aplicar configuraciones automáticamente
  useEffect(() => {
    applyTheme(config.apariencia.tema);
  }, [config.apariencia.tema, applyTheme]);

  useEffect(() => {
    applyFontSize(config.apariencia.tamañoFuente);
  }, [config.apariencia.tamañoFuente, applyFontSize]);

  useEffect(() => {
    applyContrast(config.apariencia.modoContraste);
  }, [config.apariencia.modoContraste, applyContrast]);

  useEffect(() => {
    applyAnimations(config.apariencia.animaciones);
  }, [config.apariencia.animaciones, applyAnimations]);

  // Funciones para cambiar configuraciones
  const setTheme = useCallback((theme) => {
    updateConfig('apariencia', 'tema', theme);
  }, [updateConfig]);

  const setFontSize = useCallback((size) => {
    updateConfig('apariencia', 'tamañoFuente', size);
  }, [updateConfig]);

  const setContrast = useCallback((contrast) => {
    updateConfig('apariencia', 'modoContraste', contrast);
  }, [updateConfig]);

  const setAnimations = useCallback((enabled) => {
    updateConfig('apariencia', 'animaciones', enabled);
  }, [updateConfig]);

  const setSound = useCallback((enabled) => {
    updateConfig('apariencia', 'sonido', enabled);
  }, [updateConfig]);

  const setLanguage = useCallback((language) => {
    updateConfig('apariencia', 'idioma', language);
  }, [updateConfig]);

  // Detectar preferencia del sistema
  const getSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }, []);

  // Alternar tema
  const toggleTheme = useCallback(() => {
    const currentTheme = config.apariencia.tema;
    let newTheme;
    
    if (currentTheme === 'claro') {
      newTheme = 'oscuro';
    } else if (currentTheme === 'oscuro') {
      newTheme = 'auto';
    } else {
      newTheme = 'claro';
    }
    
    setTheme(newTheme);
  }, [config.apariencia.tema, setTheme]);

  // Alternar animaciones
  const toggleAnimations = useCallback(() => {
    setAnimations(!config.apariencia.animaciones);
  }, [config.apariencia.animaciones, setAnimations]);

  // Alternar sonido
  const toggleSound = useCallback(() => {
    setSound(!config.apariencia.sonido);
  }, [config.apariencia.sonido, setSound]);

  // Verificar si es modo oscuro
  const isDarkMode = useCallback(() => {
    const root = document.documentElement;
    return root.classList.contains('dark');
  }, []);

  // Verificar si es alto contraste
  const isHighContrast = useCallback(() => {
    const root = document.documentElement;
    return root.classList.contains('high-contrast');
  }, []);

  // Obtener información del tema actual
  const getThemeInfo = useCallback(() => {
    return {
      theme: config.apariencia.tema,
      fontSize: config.apariencia.tamañoFuente,
      contrast: config.apariencia.modoContraste,
      animations: config.apariencia.animaciones,
      sound: config.apariencia.sonido,
      language: config.apariencia.idioma,
      isDark: isDarkMode(),
      isHighContrast: isHighContrast(),
      systemTheme: getSystemTheme()
    };
  }, [config.apariencia, isDarkMode, isHighContrast, getSystemTheme]);

  // Escuchar cambios de preferencia del sistema
  useEffect(() => {
    if (config.apariencia.tema === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyTheme('auto');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [config.apariencia.tema, applyTheme]);

  return {
    // Estado actual
    theme: config.apariencia.tema,
    fontSize: config.apariencia.tamañoFuente,
    contrast: config.apariencia.modoContraste,
    animations: config.apariencia.animaciones,
    sound: config.apariencia.sonido,
    language: config.apariencia.idioma,
    
    // Funciones de cambio
    setTheme,
    setFontSize,
    setContrast,
    setAnimations,
    setSound,
    setLanguage,
    
    // Utilidades
    toggleTheme,
    toggleAnimations,
    toggleSound,
    isDarkMode,
    isHighContrast,
    getSystemTheme,
    getThemeInfo,
    
    // Aplicadores directos
    applyTheme,
    applyFontSize,
    applyContrast,
    applyAnimations
  };
}
