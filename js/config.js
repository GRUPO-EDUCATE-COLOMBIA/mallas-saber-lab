// FILE: js/config.js | VERSION: v7.2 Stable
/**
 * CONFIGURACIÓN MAESTRA DEL PROYECTO ECO
 * Centraliza la identidad de las áreas y el universo de grados.
 */

window.APP_CONFIG = {
  // ÁREAS: Definición de rutas y colores institucionales
  AREAS: {
    "matematicas": {
      nombre: "Matemáticas",
      clase: "area-matematicas",
      color: "#F07F3C",
      carpeta: "matematicas",
      prefijo: "matematicas"
    },
    "lenguaje": {
      nombre: "Lenguaje",
      clase: "area-lenguaje",
      color: "#FBBB21",
      carpeta: "lenguaje",
      prefijo: "lenguaje"
    },
    "ciencias-sociales": {
      nombre: "Ciencias Sociales",
      clase: "area-sociales",
      color: "#3974B9",
      carpeta: "sociales",
      prefijo: "sociales"
    },
    "ciencias-naturales": {
      nombre: "Ciencias Naturales",
      clase: "area-naturales",
      color: "#95C11F",
      carpeta: "naturales",
      prefijo: "naturales"
    },
    "ingles": {
      nombre: "Inglés",
      clase: "area-ingles",
      color: "#8257A0",
      carpeta: "ingles",
      prefijo: "ingles"
    },
    "proyecto-socioemocional": {
      nombre: "Proyecto Socioemocional",
      clase: "area-socioemocional",
      color: "#9B7BB6",
      carpeta: "Socioemocional",
      prefijo: "Socioemocional"
    }
  },

  // Universo de grados soportados
  GRADOS: ["-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],

  // Estructura por defecto
  TIPO_MALLA: "4_periodos"
};
// END OF FILE: js/config.js | VERSION: v7.2 Stable
