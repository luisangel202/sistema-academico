import { useState, useCallback } from "react";

/**
 * Hook reutilizable para validación de formularios.
 *
 * @param {Object} rules - Objeto con reglas por campo:
 *   { campo: { required, minLength, maxLength, pattern, custom, label } }
 *
 * @returns {Object} { errors, touched, validate, validateField, clearErrors, setTouched }
 *
 * Uso:
 *   const { errors, touched, validate, validateField } = useFormValidation({
 *     nombre:   { required: true, minLength: 3, label: "Nombre" },
 *     correo:   { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: "Correo" },
 *     telefono: { pattern: /^\d{7,10}$/, label: "Teléfono" },
 *   });
 */
export function useFormValidation(rules = {}) {
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const rule = rules[name];
    if (!rule) return "";

    const label = rule.label || name;
    const val   = typeof value === "string" ? value.trim() : value;

    if (rule.required && (!val || val === "")) {
      return `${label} es obligatorio`;
    }
    if (val && rule.minLength && val.length < rule.minLength) {
      return `${label} debe tener al menos ${rule.minLength} caracteres`;
    }
    if (val && rule.maxLength && val.length > rule.maxLength) {
      return `${label} no puede superar ${rule.maxLength} caracteres`;
    }
    if (val && rule.pattern && !rule.pattern.test(val)) {
      return rule.patternMsg || `${label} tiene un formato inválido`;
    }
    if (val && rule.custom) {
      const customError = rule.custom(val);
      if (customError) return customError;
    }
    return "";
  }, [rules]);

  /** Valida todos los campos y retorna true si el formulario es válido */
  const validate = useCallback((formData) => {
    const newErrors = {};
    let valid = true;

    Object.keys(rules).forEach(name => {
      const error = validateField(name, formData[name]);
      if (error) {
        newErrors[name] = error;
        valid = false;
      }
    });

    setErrors(newErrors);
    // Marcar todos como tocados
    const allTouched = Object.keys(rules).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    return valid;
  }, [rules, validateField]);

  /** Valida un campo individual al perder el foco */
  const handleBlur = useCallback((name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  /** Valida en tiempo real mientras se escribe */
  const handleChange = useCallback((name, value) => {
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return { errors, touched, validate, validateField, handleBlur, handleChange, clearErrors, setTouched };
}

// ── Reglas comunes reutilizables ──────────────────────────────────────────────
export const RULES = {
  nombre:    { required: true, minLength: 3, maxLength: 100, label: "Nombre" },
  documento: { required: true, minLength: 6, maxLength: 15, pattern: /^\d+$/, patternMsg: "Solo se permiten números", label: "Documento" },
  correo:    { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMsg: "Correo inválido", label: "Correo" },
  telefono:  { pattern: /^\d{7,10}$/, patternMsg: "Teléfono debe tener 7-10 dígitos", label: "Teléfono" },
  fecha:     { required: true, label: "Fecha" },
  texto:     { required: true, minLength: 10, label: "Descripción" },
};
