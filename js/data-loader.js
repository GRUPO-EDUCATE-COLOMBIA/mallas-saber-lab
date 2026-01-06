// js/data-loader.js - v5.6 (Carga Bajo Demanda Sincronizada)

window.MallasData = {};

/**
 * Función Maestra: Asegura que toda la tríada de datos de un grado esté en memoria.
 * Carga: Malla Académica + Tareas DCE + Proyecto Socioemocional (ECO)
 */
async function asegurarDatosGrado(areaKey, grado) {
  const config = window.APP_CONFIG;
  const area = config.AREAS[areaKey];
  const gradoStr = String(grado).trim();
  const tipo = config.TIPO_MALLA;

  if (!area) return false;

  // 1. Verificar si los datos ya están en memoria para evitar peticiones duplicadas
  const nombreEco = config.AREAS["proyecto-socioemocional"].nombre; // "Proyecto Socioemocional"
  const yaCargadoAcademico = window.MallasData[area.nombre]?.[gradoStr];
  const yaCargadoEco = window.MallasData[nombreEco]?.[gradoStr];

  if (yaCargadoAcademico && yaCargadoEco) {
    return true; 
  }

  // 2. Definir Rutas de los 3 archivos fundamentales
  // Ruta Base (ej: data/matematicas/matematicas_1_4_periodos.json)
  const rutaBase = `data/${area.carpeta}/${area.prefijo}_${gradoStr}_${tipo}.json`;
  
  // Ruta DCE (ej: data/matematicas/tareas_dce/t_matematicas_1_4_periodos.json)
  const rutaTareas = `data/${area.carpeta}/tareas_dce/t_${area.prefijo}_${gradoStr}_${tipo}.json`;
  
  // Ruta ECO Transversal (ej: data/Socioemocional/Socioemocional_1_4_periodos.json)
  const areaEco = config.AREAS["proyecto-socioemocional"];
  const rutaEco = `data/${areaEco.carpeta}/${areaEco.prefijo}_${gradoStr}_${tipo}.json`;

  try {
    // 3. Ejecutar descarga asíncrona paralela
    const [resBase, resTareas, resEco] = await Promise.all([
      fetch(rutaBase).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaTareas).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaEco).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    // 4. Indexar Malla Académica / Socioemocional Base
    if (resBase) {
      if (!window.MallasData[area.nombre]) window.MallasData[area.nombre] = {};
      window.MallasData[area.nombre][gradoStr] = { [tipo]: resBase };
    }

    // 5. Indexar Tareas DCE (Espejo Metodológico)
    if (resTareas) {
      const llaveT = `Tareas_DCE_${area.nombre}`;
      if (!window.MallasData[llaveT]) window.MallasData[llaveT] = {};
      window.MallasData[llaveT][gradoStr] = { [tipo]: resTareas };
    }

    // 6. Indexar Proyecto ECO (Capa Transversal)
    if (resEco) {
      if (!window.MallasData[nombreEco]) window.MallasData[nombreEco] = {};
      window.MallasData[nombreEco][gradoStr] = { [tipo]: resEco };
    }

    return true;
  } catch (error) {
    console.error(`Error crítico en carga de grado ${gradoStr}:`, error);
    return false;
  }
}

/**
 * Helper: Identifica si un área es Socioemocional
 */
function esAreaSocioemocional(areaKey) {
  return areaKey === "proyecto-socioemocional";
}
