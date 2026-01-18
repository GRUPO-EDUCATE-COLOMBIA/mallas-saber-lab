// FILE: js/config.js | VERSION: v10.8.1 Stable
/**
 * CONFIGURACIÓN MAESTRA v10.8.1
 * Gestión de identidades de áreas y soporte Bimodal (3P/4P).
 */

window.APP_CONFIG = {
  AREAS: {
    "matematicas": { 
      nombre: "Matemáticas", 
      color: "#F07F3C", 
      carpeta: "matematicas", 
      prefijo: "matematicas" 
    },
    "lenguaje": { 
      nombre: "Lenguaje", 
      color: "#FBBB21", 
      carpeta: "lenguaje", 
      prefijo: "lenguaje" 
    },
    // SINCRONIZACIÓN: Nombre ajustado para coincidir exactamente con el campo 'area' de los JSON
    "ciencias-sociales": { 
      nombre: "Ciencias Sociales y Competencias Ciudadanas", 
      color: "#3974B9", 
      carpeta: "sociales", 
      prefijo: "sociales" 
    },
    "ciencias-naturales": { 
      nombre: "Ciencias Naturales", 
      color: "#95C11F", 
      carpeta: "naturales", 
      prefijo: "naturales" 
    },
    "ingles": { 
      nombre: "Inglés", 
      color: "#8257A0", 
      carpeta: "ingles", 
      prefijo: "ingles" 
    },
    "proyecto-socioemocional": { 
      nombre: "Proyecto Socioemocional", 
      color: "#9B7BB6", 
      carpeta: "Socioemocional", 
      prefijo: "Socioemocional" 
    }
  },

  GRADOS: ["-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],

  MODALIDADES_TIEMPO: {
    "3": "3_periodos",
    "4": "4_periodos"
  },

  TIPO_MALLA: "4_periodos"
};
