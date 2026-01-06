// js/data-loader.js

window.MallasData = {};

/**
 * Prepara la estructura de la base de datos en memoria
 */
function prepararMemoria(area, grado, tipo) {
  if (!window.MallasData[area]) window.MallasData[area] = {};
  if (!window.MallasData[area][grado]) window.MallasData[area][grado] = {};
  if (!window.MallasData[area][grado][tipo]) window.MallasData[area][grado][tipo] = null;
}

/**
 * Función Maestra de Carga v4.4
 * Ajustada para subcarpeta 'tareas_dce' y limpieza de rutas.
 */
async function cargarAplicativo() {
  console.log("⏳ Iniciando carga v4.4 (Rutas de subcarpeta)...");
  
  const config = window.APP_CONFIG;
  const tipoLimpio = config.TIPO_MALLA.trim();
  const areas = Object.values(config.AREAS);
  const promesas = [];

  areas.forEach(area => {
    config.GRADOS.forEach(grado => {
      const gradoStr = String(grado).trim();
      const prefijoLimpio = area.prefijo.trim();
      const carpetaLimpia = area.carpeta.trim();

      // 1. RUTA BASE (data/matematicas/matematicas_1_4_periodos.json)
      const rutaBase = `data/${carpetaLimpia}/${prefijoLimpio}_${gradoStr}_${tipoLimpio}.json`;
      
      // 2. RUTA DCE (data/matematicas/tareas_dce/t_matematicas_1_4_periodos.json)
      // Se añade la subcarpeta 'tareas_dce' indicada por el usuario
      const rutaTareas = `data/${carpetaLimpia}/tareas_dce/t_${prefijoLimpio}_${gradoStr}_${tipoLimpio}.json`;

      // Carga de Malla Académica
      const pBase = fetch(rutaBase)
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json) {
            prepararMemoria(area.nombre, gradoStr, tipoLimpio);
            window.MallasData[area.nombre][gradoStr][tipoLimpio] = json;
          }
        }).catch(() => {});

      // Carga de Tareas DCE (Espejo en subcarpeta)
      const pTareas = fetch(rutaTareas)
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json) {
            const llaveT = `Tareas_DCE_${area.nombre}`;
            prepararMemoria(llaveT, gradoStr, tipoLimpio);
            window.MallasData[llaveT][gradoStr][tipoLimpio] = json;
            console.log(`💎 Tareas DCE vinculadas: ${rutaTareas}`);
          }
        }).catch(() => {});

      promesas.push(pBase, pTareas);
    });
  });

  Promise.all(promesas).then(() => {
    console.log("🚀 VINCULACIÓN EXITOSA CON SUBDIRECTORIOS.");
  });
}

cargarAplicativo();
