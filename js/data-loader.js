// js/data-loader.js

// Objeto global donde se centralizará toda la información de las mallas
window.MallasData = {};

/**
 * Asegura que la estructura de objetos exista para evitar errores de 'undefined'
 */
function ensureAreaGradeTipo(area, grado, tipo) {
  if (!window.MallasData[area]) window.MallasData[area] = {};
  if (!window.MallasData[area][grado]) window.MallasData[area][grado] = {};
  if (!window.MallasData[area][grado][tipo]) window.MallasData[area][grado][tipo] = null;
}

/**
 * Carga los archivos JSON de Matemáticas (0 a 11)
 */
function cargarMatematicas4Periodos() {
  const areaNombre = "Matemáticas";
  const tipo_malla = "4_periodos";
  const promesas = [];

  for (let grado = 0; grado <= 11; grado++) {
    const gradoStr = String(grado);
    const fileName = `data/matematicas/matematicas_${gradoStr}_4_periodos.json`;

    const p = fetch(fileName)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(json => {
        ensureAreaGradeTipo(areaNombre, gradoStr, tipo_malla);
        window.MallasData[areaNombre][gradoStr][tipo_malla] = json;
        console.log(`✅ Matemáticas ${gradoStr}° cargada`);
      })
      .catch(() => {}); // Fallo silencioso si no existe el archivo aún
    promesas.push(p);
  }
  return Promise.all(promesas);
}

/**
 * NUEVA FUNCIÓN: Carga los archivos JSON de Lenguaje (0 a 11)
 */
function cargarLenguaje4Periodos() {
  const areaNombre = "Lenguaje";
  const tipo_malla = "4_periodos";
  const promesas = [];

  for (let grado = 0; grado <= 11; grado++) {
    const gradoStr = String(grado);
    // IMPORTANTE: Se asume que la carpeta se llama 'lenguaje' y el archivo 'lenguaje_...'
    const fileName = `data/lenguaje/lenguaje_${gradoStr}_4_periodos.json`;

    const p = fetch(fileName)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(json => {
        ensureAreaGradeTipo(areaNombre, gradoStr, tipo_malla);
        window.MallasData[areaNombre][gradoStr][tipo_malla] = json;
        console.log(`✅ Lenguaje ${gradoStr}° cargada`);
      })
      .catch(() => {
        // console.warn(`⚠️ No se halló Lenguaje: ${fileName}`);
      });
    promesas.push(p);
  }
  return Promise.all(promesas);
}

/**
 * Carga los archivos JSON de Proyecto Socioemocional
 */
function cargarSocioemocional4Periodos() {
  const areaNombre = "Proyecto Socioemocional";
  const tipo_malla = "4_periodos";
  const promesas = [];
  const niveles = ["-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

  niveles.forEach(gradoStr => {
    const fileName = `data/Socioemocional/Socioemocional_${gradoStr}_4_periodos.json`;

    const p = fetch(fileName)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(json => {
        ensureAreaGradeTipo(areaNombre, gradoStr, tipo_malla);
        window.MallasData[areaNombre][gradoStr][tipo_malla] = json;
        console.log(`✅ Proyecto Socioemocional ${gradoStr}° cargada`);
      })
      .catch(() => {});
    promesas.push(p);
  });
  return Promise.all(promesas);
}

// Ejecución de carga inicial en paralelo
Promise.all([
  cargarMatematicas4Periodos(),
  cargarLenguaje4Periodos(), // ACTIVACIÓN DE LENGUAJE
  cargarSocioemocional4Periodos()
]).then(() => {
  console.log("🚀 VINCULACIÓN FINALIZADA - ÁREAS DISPONIBLES CARGADAS");
});
