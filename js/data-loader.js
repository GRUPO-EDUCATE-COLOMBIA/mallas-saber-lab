// js/data-loader.js - v5.4 STABLE (REVISADO)
window.MallasData = {};

async function asegurarDatosGrado(areaKey, grado) {
  const config = window.APP_CONFIG;
  const area = config.AREAS[areaKey];
  const gradoStr = String(grado).trim();
  const tipo = config.TIPO_MALLA;

  if (!area) return false;

  // Si ya existe en memoria, no recargar
  if (window.MallasData[area.nombre]?.[gradoStr]) return true;

  // RUTAS EXACTAS SEGÚN TU REPORTE TÉCNICO
  const rutaBase = `data/${area.carpeta}/${area.prefijo}_${gradoStr}_${tipo}.json`;
  const rutaTareas = `data/${area.carpeta}/tareas_dce/t_${area.prefijo}_${gradoStr}_${tipo}.json`;
  
  // RUTA SOCIOEMOCIONAL (Indispensable para el cruce)
  const areaEco = config.AREAS["proyecto-socioemocional"];
  const rutaEco = `data/${areaEco.carpeta}/${areaEco.prefijo}_${gradoStr}_${tipo}.json`;

  try {
    const [resBase, resTareas, resEco] = await Promise.all([
      fetch(rutaBase).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaTareas).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaEco).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    // Registro Académico
    if (resBase) {
      if (!window.MallasData[area.nombre]) window.MallasData[area.nombre] = {};
      window.MallasData[area.nombre][gradoStr] = { [tipo]: resBase };
    }

    // Registro DCE (Espejo)
    if (resTareas) {
      const llaveT = `Tareas_DCE_${area.nombre}`;
      if (!window.MallasData[llaveT]) window.MallasData[llaveT] = {};
      window.MallasData[llaveT][gradoStr] = { [tipo]: resTareas };
    }

    // Registro ECO (Socioemocional Transversal)
    if (resEco) {
      if (!window.MallasData[areaEco.nombre]) window.MallasData[areaEco.nombre] = {};
      window.MallasData[areaEco.nombre][gradoStr] = { [tipo]: resEco };
    }

    return true;
  } catch (e) {
    console.error("Error cargando archivos:", e);
    return false;
  }
}
