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

  const AREA_MAP = {
    "matematicas": "Matemáticas",
    "proyecto-socioemocional": "Proyecto Socioemocional"
  };

  // 1. EVENTO: CAMBIO DE ÁREA
  areaSel.addEventListener('change', () => {
    const areaNombre = AREA_MAP[areaSel.value];
    ocultarResultados();
    
    if (!areaNombre || !window.MallasData[areaNombre]) {
      gradoSel.disabled = true;
      return;
    }

    // Extraer grados disponibles en el JSON cargado
    const gradosDisponibles = Object.keys(window.MallasData[areaNombre]);
    
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    gradosDisponibles.sort((a, b) => a - b).forEach(grado => {
      const opt = document.createElement('option');
      opt.value = grado;
      opt.textContent = (grado === "0") ? "Transición (0)" : (grado === "-1" ? "Jardín (-1)" : grado + "°");
      gradoSel.appendChild(opt);
    });

    gradoSel.disabled = false;
    periodoSel.disabled = true;
    compSel.disabled = true;
  });

  // 2. EVENTO: CAMBIO DE GRADO
  gradoSel.addEventListener('change', updatePeriodosUI);

  // 3. EVENTO: CAMBIO DE PERIODO
  periodoSel.addEventListener('change', updateComponentesUI);

  function updatePeriodosUI() {
    const area = AREA_MAP[areaSel.value];
    const grado = gradoSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";

    const malla = window.MallasData?.[area]?.[grado]?.[tipo];
    
    if (!malla) {
      periodoSel.disabled = true;
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
    const area = AREA_MAP[areaSel.value];
    const grado = gradoSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const periodo = periodoSel.value;

    const malla = window.MallasData?.[area]?.[grado]?.[tipo];
    const items = malla?.periodos?.[periodo] || [];

    compSel.innerHTML = '<option value="todos">Todos</option>';
    const nombres = [...new Set(items.map(it => it.componente || it.competencia))];
    
    nombres.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n; opt.textContent = n;
      compSel.appendChild(opt);
    });
    compSel.disabled = false;
  }

  // 4. BOTÓN CONSULTAR
  btnBuscar.addEventListener('click', () => {
    const areaVal = areaSel.value;
    const areaNombre = AREA_MAP[areaVal];
    const grado = gradoSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const periodo = periodoSel.value;
    const componente = compSel.value;

    const malla = window.MallasData?.[areaNombre]?.[grado]?.[tipo];
    if (!malla || !periodo) {
      modalError.classList.add('mostrar');
      return;
    }

    const items = componente === "todos" 
      ? malla.periodos[periodo] 
      : malla.periodos[periodo].filter(it => (it.componente === componente || it.competencia === componente));

    ocultarResultados();

    if (areaVal === "proyecto-socioemocional") {
      resSocio.classList.add('mostrar');
      window.renderSocioemocional(items);
    } else {
      resNucleo.classList.add('mostrar');
      window.renderTablaMallas(items);
    }
  });

  function ocultarResultados() {
    resNucleo.classList.remove('mostrar');
    resSocio.classList.remove('mostrar');
  }

  document.getElementById('btn-modal-cancelar').addEventListener('click', () => {
    modalError.classList.remove('mostrar');
  });
});
