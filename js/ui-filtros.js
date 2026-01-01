// js/ui-filtros.js

document.addEventListener('DOMContentLoaded', () => {
  // Captura de elementos del DOM
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  
  // Contenedores de resultados (Marcos)
  const resNucleo = document.getElementById('resultados-nucleo');
  const resSocio = document.getElementById('resultados-socio');
  
  const modalError = document.getElementById('modal-error');
  const btnModalCancelar = document.getElementById('btn-modal-cancelar');

  // Validación de existencia de elementos críticos
  if (!areaSel || !gradoSel || !periodoSel || !compSel || !btnBuscar) return;

  // Mapeo exacto entre el valor del HTML y la llave en window.MallasData (JSON)
  const AREA_MAP = {
    "matematicas": "Matemáticas",
    "lenguaje": "Lenguaje",
    "ciencias-sociales": "Ciencias Sociales y Ciudadanas",
    "ciencias-naturales": "Ciencias Naturales y Ambiental",
    "ingles": "Inglés",
    "proyecto-socioemocional": "Proyecto Socioemocional"
  };

  // --- MANEJO DE EVENTOS ---

  // 1. Cambio en Mallas A (3 o 4 períodos)
  document.querySelectorAll('input[name="periodos"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updatePeriodosUI();
    });
  });

  // 2. Cambio en Área
  areaSel.addEventListener('change', () => {
    limpiarSelects([gradoSel, periodoSel, compSel]);
    gradoSel.disabled = false;
    ocultarTodosLosResultados();
  });

  // 3. Cambio en Grado
  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
    ocultarTodosLosResultados();
  });

  // 4. Cambio en Período
  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
  });

  // 5. Botón Consultar
  btnBuscar.addEventListener('click', () => {
    consultarMalla();
  });

  // --- LÓGICA DE APOYO ---

  function getSelectedTipoMalla() {
    const r = document.querySelector('input[name="periodos"]:checked');
    return r ? (r.value === "3" ? "3_periodos" : "4_periodos") : "4_periodos";
  }

  function getSelectedAreaNombre() {
    return AREA_MAP[areaSel.value] || null;
  }

  /**
   * Obtiene el objeto de datos desde window.MallasData
   */
  function obtenerMallaData() {
    const area = getSelectedAreaNombre();
    const grado = gradoSel.value;
    const tipo = getSelectedTipoMalla();

    if (!area || !grado || !tipo) return null;
    
    // Navegación en la estructura: Área -> Grado -> Tipo
    return window.MallasData?.[area]?.[grado]?.[tipo] || null;
  }

  function updatePeriodosUI() {
    const malla = obtenerMallaData();
    if (!malla) {
      limpiarSelects([periodoSel, compSel]);
      return;
    }

    const max = malla.numero_periodos || 4;
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    
    for (let i = 1; i <= max; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
    updateComponentesUI();
  }

  function updateComponentesUI() {
    const periodo = periodoSel.value;
    const malla = obtenerMallaData();
    
    compSel.innerHTML = '<option value="todos">Todos</option>';

    if (!malla || !periodo) {
      compSel.disabled = true;
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    
    // Extraer nombres únicos de componentes o competencias
    const nombres = [...new Set(periodoData.map(it => it.componente || it.competencia))];

    nombres.forEach(nombre => {
      if (nombre) {
        const opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        compSel.appendChild(opt);
      }
    });
    compSel.disabled = false;
  }

  /**
   * FUNCIÓN PRINCIPAL DE CONSULTA
   */
  function consultarMalla() {
    const areaVal = areaSel.value;
    const areaNombre = getSelectedAreaNombre();
    const periodo = periodoSel.value;
    const componente = compSel.value;
    const malla = obtenerMallaData();

    if (!areaNombre || !periodo || !malla) {
      if (modalError) modalError.classList.add('mostrar');
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    const items = componente === 'todos'
      ? periodoData
      : periodoData.filter(it => (it.componente === componente || it.competencia === componente));

    ocultarTodosLosResultados();

    // DECISIÓN DE RENDERIZADO:
    if (areaVal === "proyecto-socioemocional") {
      // 1. Mostrar marco socioemocional
      resSocio.classList.remove('ocultar');
      resSocio.classList.add('mostrar');
      // 2. Llamar a su render específico
      if (window.renderSocioemocional) window.renderSocioemocional(items);
    } else {
      // 1. Mostrar marco núcleo común
      resNucleo.classList.remove('ocultar');
      resNucleo.classList.add('mostrar');
      // 2. Llamar al render de mallas académicas
      if (window.renderTablaMallas) window.renderTablaMallas(items);
    }
  }

  function limpiarSelects(selects) {
    selects.forEach(s => {
      if (s.id === 'componente') {
        s.innerHTML = '<option value="todos">Todos</option>';
      } else {
        s.innerHTML = '<option value="">Seleccionar</option>';
      }
      s.disabled = true;
    });
  }

  function ocultarTodosLosResultados() {
    resNucleo.classList.replace('mostrar', 'ocultar');
    resSocio.classList.replace('mostrar', 'ocultar');
  }

  if (btnModalCancelar) {
    btnModalCancelar.addEventListener('click', () => {
      modalError.classList.remove('mostrar');
    });
  }
});
