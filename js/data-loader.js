// js/data-loader.js

window.MallasData = {};

function prepararMemoria(area, grado, tipo) {
  if (!window.MallasData[area]) window.MallasData[area] = {};
  if (!window.MallasData[area][grado]) window.MallasData[area][grado] = {};
  if (!window.MallasData[area][grado][tipo]) window.MallasData[area][grado][tipo] = null;
}

async function cargarAplicativo() {
  console.log("⏳ Cargando ecosistema modular...");
  
  const config = window.APP_CONFIG;
  const areas = Object.values(config.AREAS);
  const promesas = [];

  areas.forEach(area => {
    config.GRADOS.forEach(grado => {
      const rutaBase = `data/${area.carpeta}/${area.prefijo}_${grado}_${config.TIPO_MALLA}.json`;
      const rutaTareas = `data/${area.carpeta}/t_${area.prefijo}_${grado}_${config.TIPO_MALLA}.json`;

      // Intentar cargar malla base
      const pBase = fetch(rutaBase)
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json) {
            prepararMemoria(area.nombre, grado, config.TIPO_MALLA);
            window.MallasData[area.nombre][grado][config.TIPO_MALLA] = json;
          }
        }).catch(() => {});

      // Intentar cargar tareas DCE
      const pTareas = fetch(rutaTareas)
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json) {
            const llaveT = `Tareas_DCE_${area.nombre}`;
            prepararMemoria(llaveT, grado, config.TIPO_MALLA);
            window.MallasData[llaveT][grado][config.TIPO_MALLA] = json;
          }
        }).catch(() => {});

      promesas.push(pBase, pTareas);
    });
  });

  // No usamos await aquí para no bloquear el hilo principal si hay muchos 404
  Promise.all(promesas).then(() => {
    console.log("🚀 DATOS LISTOS PARA CONSULTA.");
  });
}

cargarAplicativo();
