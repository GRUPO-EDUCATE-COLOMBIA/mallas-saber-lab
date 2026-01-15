// FILE: js/config.js | VERSION: v10.2.1 Stable
/**
 * CONFIGURACIÓN MAESTRA v10.2.1
 * Gestión de identidades de áreas y soporte para Mallas de 3 y 4 periodos.
 */

window.APP_CONFIG = {
  // Identidad institucional de las áreas
  AREAS: {
    "matematicas": { nombre: "Matemáticas", color: "#F07F3C", carpeta: "matematicas", prefijo: "matematicas" },
    "lenguaje": { nombre: "Lenguaje", color: "#FBBB21", carpeta: "lenguaje", prefijo: "lenguaje" },
    "ciencias-sociales": { nombre: "Ciencias Sociales", color: "#3974B9", carpeta: "sociales", prefijo: "sociales" },
    "ciencias-naturales": { nombre: "Ciencias Naturales", color: "#95C11F", carpeta: "naturales", prefijo: "naturales" },
    "ingles": { nombre: "Inglés", color: "#8257A0", carpeta: "ingles", prefijo: "ingles" },
    "proyecto-socioemocional": { nombre: "Proyecto Socioemocional", color: "#9B7BB6", carpeta: "Socioemocional", prefijo: "Socioemocional" }
  },

  // Universo de grados soportados (Nivel Nacional)
  GRADOS: ["-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],

  /**
   * LÓGICA DE PERIODOS (Novedad v10.2.1)
   * Define las modalidades de tiempo disponibles en la plataforma.
   */
  MODALIDADES_TIEMPO: {
    "3": "3_periodos",
    "4": "4_periodos"
  },

  // Estado inicial del sistema (Por defecto 4 periodos)
  TIPO_MALLA: "4_periodos"
};
