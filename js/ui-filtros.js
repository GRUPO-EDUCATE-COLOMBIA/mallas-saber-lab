// js/ui-filtros.js

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const resNucleo = document.getElementById('resultados-nucleo');
  const resSocio = document.getElementById('resultados-socio');
  const modalError = document.getElementById('modal-error');

  // Mapeo detallado para vincular HTML -> JSON -> CSS
  const AREA_CONFIG = {
    "matematicas": { nombre: "Matemáticas", clase: "area-matematicas" },
    "lenguaje": { nombre: "Lenguaje", clase: "area-lenguaje" },
    "ciencias-sociales": { nombre: "Ciencias Sociales y Ciudadanas", clase: "area-sociales" },
    "ciencias-naturales": { nombre: "Ciencias Naturales y Ambiental", clase: "area-naturales" },
    "ingles": { nombre: "Inglés", clase: "area-ingles" },
    "proyecto-socioemocional": { nombre: "Proyecto Socioemocional", clase: "area-socioemocional" }
  };

  // 1. Bloqueo de menú contextual (Clic derecho) en resultados para evitar copia
  [resNucleo, resSocio].forEach(contenedor => {
    contenedor.addEventListener('contextmenu', e => e.preventDefault());
  });

  // 2. EVENTO: CAMBIO DE ÁREA
  areaSel.addEventListener('change', () => {
    const config = AREA_CONFIG[areaSel.value];
    ocultarResultados();
    
    if (!config || !window.MallasData[config.nombre]) {
      gradoSel.disabled = true;
      limpiarSelects([gradoSel, periodoSel, compSel]);
      return;
    }

    // Extraer grados disponibles dinámicamente del JSON cargado
    const gradosDisponibles = Object.keys(window.MallasData[config.nombre]);
    
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    gradosDisponibles.sort((a, b) => a - b).forEach(grado => {
      const opt = document.createElement('option');
      opt.value = grado;
      // Formateo de nombres de grados
      if (grado === "0") opt.textContent = "Transición (0)";
      else if (grado === "-1") opt.textContent = "Jardín (-1)";
      else opt.textContent = grado + "°";
      gradoSel.appendChild(opt);
    });

    gradoSel.disabled = false;
    periodoSel.disabled = true;
    compSel.disabled = true;
  });

  // 3. EVENTO: CAMBIO DE GRADO -> Actualiza Períodos
  gradoSel.addEventListener('change', updatePeriodosUI);

  // 4. EVENTO: CAMBIO DE PERIODO -> Actualiza Componentes
  periodoSel.addEventListener('change', updateComponentesUI);

  function updatePeriodosUI() {
    const config = AREA_CONFIG[areaSel.value];
    const grado = gradoSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";

    const malla = window.MallasData?.[config.nombre]?.[grado]?.[tipo];
    
    if (!malla) {
      limpiarSelects([periodoSel, compSel]);
      return;
    }

    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= malla.numero_periodos; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
    compSel.disabled = true;
  }

  function updateComponentesUI() {
    const config = AREA_CONFIG[areaSel.value];
    const grado = gradoSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const periodo = periodoSel.value;

    const malla = window.MallasData?.[config.nombre]?.[grado]?.[tipo];
    const items = malla?.periodos?.[periodo] || [];

    compSel.innerHTML = '<option value="todos">Todos</option>';
    const nombres = [...new Set(items.map(it => it.componente || it.competencia))];
    
    nombres.sort().forEach(n => {
      const opt = document.createElement('option');
      opt.value = n; opt.textContent = n;
      compSel.appendChild(opt);
    });
    compSel.disabled = false;
  }

  // 5. BOTÓN CONSULTAR
  function consultarMalla() {
    const areaVal = areaSel.value;
    const config = AREA_CONFIG[areaVal];
    const grado = gradoSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const periodo = periodoSel.value;
    const componente = compSel.value;

    const malla = window.MallasData?.[config?.nombre]?.[grado]?.[tipo];
    if (!malla || !periodo) {
      if (modalError) modalError.classList.add('mostrar');
      return;
    }

    const items = componente === "todos" 
      ? malla.periodos[periodo] 
      : malla.periodos[periodo].filter(it => (it.componente === componente || it.competencia === componente));

    ocultarResultados();

    // APLICAR CLASE DE COLOR DINÁMICA
    resNucleo.className = "resultados ocultar"; 
    resSocio.className = "resultados ocultar";

    if (areaVal === "proyecto-socioemocional") {
      resSocio.classList.add('mostrar', config.clase);
      if (window.renderSocioemocional) window.renderSocioemocional(items);
    } else {
      resNucleo.classList.add('mostrar', config.clase);
      // CAMBIO CLAVE: Enviamos grado y periodo para el cruce de datos con ECO
      if (window.renderTablaMallas) window.renderTablaMallas(items, grado, periodo);
    }
  }

  btnBuscar.addEventListener('click', consultarMalla);

  function ocultarResultados() {
    resNucleo.classList.remove('mostrar');
    resSocio.classList.remove('mostrar');
  }

  function limpiarSelects(selects) {
    selects.forEach(s => {
      s.innerHTML = s.id === "componente" ? '<option value="todos">Todos</option>' : '<option value="">Seleccionar</option>';
      s.disabled = true;
    });
  }

  document.getElementById('btn-modal-cancelar').addEventListener('click', () => {
    modalError.classList.remove('mostrar');
  });
});
