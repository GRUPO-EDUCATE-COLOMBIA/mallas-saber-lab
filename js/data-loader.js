// js/data-loader.js

// Estructura global de datos
// MallasData[area][grado][tipo_malla] = json
window.MallasData = {};

// Helper para asegurar estructura
function ensureAreaGradeTipo(area, grado, tipo) {
  if (!window.MallasData[area]) window.MallasData[area] = {};
  if (!window.MallasData[area][grado]) window.MallasData[area][grado] = {};
  if (!window.MallasData[area][grado][tipo]) window.MallasData[area][grado][tipo] = null;
}

// Carga una malla dada un área, grado y tipo de malla ("3_periodos" o "4_periodos")
function cargarMalla(area, grado, tipo_malla) {
  const fileArea = area.toLowerCase().replace(/\s+/g, '-'); // ej. "Proyecto Socioemocional" -> "proyecto-socioemocional"
  const fileName = `data/${fileArea}_${grado}_${tipo_malla}.json`;

  return fetch(fileName)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(json => {
      const tipo = json.tipo_malla || tipo_malla;
      const gradoJson = json.grado || String(grado);
      const areaJson = json.area || area;

      ensureAreaGradeTipo(areaJson, gradoJson, tipo);
      window.MallasData[areaJson][gradoJson][tipo] = json;

      console.log(`Malla ${areaJson} ${gradoJson}° cargada (tipo: ${tipo}, períodos: ${json.numero_periodos})`);
    })
    .catch(err => {
      // No rompemos nada si el archivo no existe; solo informamos en consola
      console.warn(`No se encontró malla para ${area} grado ${grado} (${tipo_malla}) en ${fileName}`, err.message);
    });
}

// Configuración inicial: qué queremos intentar cargar ahora
// Puedes ampliar esta lista cuando agregues más archivos
const AREAS_INICIALES = [
  "Matemáticas",
  "Lenguaje",
  "Ciencias Sociales y Ciudadanas",
  "Ciencias Naturales y Ambiental",
  "Inglés",
  "Proyecto Socioemocional"
];

// Por ahora, solo cargamos Matemáticas 1°–5° a 4 períodos (ejemplo).
const PROMESAS_CARGA = [];

// Matemáticas 1° a 5° malla a 4 períodos
for (let g = 1; g <= 5; g++) {
  PROMESAS_CARGA.push(cargarMalla("Matemáticas", g, "4_periodos"));
}

// Aquí podrías ir añadiendo más cuando tengas nuevos JSON:
// PROMESAS_CARGA.push(cargarMalla("Lenguaje", 3, "4_periodos"));
// PROMESAS_CARGA.push(cargarMalla("Proyecto Socioemocional", 5, "3_periodos"));

Promise.all(PROMESAS_CARGA)
  .then(() => {
    console.log("Intento de carga inicial de mallas completado.");
  });
