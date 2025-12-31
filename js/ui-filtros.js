// js/ui-filtros.js

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const resultadosNucleo = document.getElementById('resultados-nucleo');
  const resultadosSocio = document.getElementById('resultados-socio');
  const modalError = document.getElementById('modal-error');
  const btnModalCancelar = document.getElementById('btn-modal-cancelar');

  if (!areaSel || !gradoSel || !periodoSel || !compSel || !btnBuscar) return;

  // Mapeo de value HTML -> nombre de área en los JSON
  const AREA_MAP = {
    "matematicas": "Matemáticas",
    "lenguaje": "Lenguaje",
    "ciencias-sociales": "Ciencias Sociales y Ciudadanas",
    "ciencias-naturales": "Ciencias Naturales y Ambiental",
    "ingles": "Inglés",
    "proyecto-socioemocional": "Proyecto Socioemocional"
  };

  // Modal Error
  function mostrarErrorConsulta() {
    if (modalError) modalError.classList.add('mostrar');
  }

  if (btnModalCancelar) {
    btnModalCancelar.addEventListener('click', () => {
      if (modalError) modalError.classList.remove('mostrar');
    });
  }

  // LISTENERS
  document.querySelectorAll('input[name="periodos"]').forEach(radio => {
    radio.addEventListener('change', updatePeriodosUI);
  });

  areaSel.addEventListener('change', () => {
    limpiarPeriodosYComponentes();
    gradoSel.disabled = false;
  });

  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
  });

  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
  });

  btnBuscar.addEventListener('click', () => {
    consultarMalla();
  });

  // FUNCIONES

  function getSelectedTipoMalla() {
    const r = document.querySelector('input[name="periodos"]:checked');
    if (!r) return null;
    return r.value === "3" ? "3_periodos" : "4_periodos";
  }

  function getSelectedAreaNombre() {
    const val = areaSel.value;
    return AREA_MAP[val] || null;
  }

  function obtenerMallaSeleccionada() {
    const areaNombre = getSelectedAreaNombre();
    const grado = gradoSel.value;
    const tipo_malla = getSelectedTipoMalla();
    
    if (!areaNombre || !grado || !tipo_malla) return null;

    const areaData = window.MallasData?.[areaNombre];
    if (!areaData) return null;

    const gradoData = areaData[grado];
    if (!gradoData) return null;

    const malla = gradoData[tipo_malla];
    return malla || null;
  }

  function limpiarPeriodosYComponentes() {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    periodoSel.disabled = true;
    compSel.innerHTML = '<option value="todos">Todos</option>';
    compSel.disabled = true;
  }

  function updatePeriodosUI() {
    const malla = obtenerMallaSeleccionada();
    if (!malla) {
      limpiarPeriodosYComponentes();
      return;
    }

    const maxPeriodoJSON = malla.numero_periodos || 4;
    const tipo_malla = malla.tipo_malla || getSelectedTipoMalla();
    const maxPeriodoToggle = tipo_malla === "3_periodos" ? 3 : 4;
    const max = Math.min(maxPeriodoJSON, maxPeriodoToggle);

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
    compSel.innerHTML = '<option value="todos">Todos</option>';

    const malla = obtenerMallaSeleccionada();
    if (!malla || !periodo) {
      compSel.disabled = true;
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    const nombres = [...new Set(periodoData.map(it => 
      getNombreComponente(it, getSelectedAreaNombre())
    ))];

    nombres.forEach(nombre => {
      const opt = document.createElement('option');
      opt.value = nombre;
      opt.textContent = nombre;
      compSel.appendChild(opt);
    });

    compSel.disabled = false;
  }

  // Determina el nombre del componente según el área
  function getNombreComponente(item, areaNombre) {
    if (areaNombre === "Proyecto Socioemocional") {
      return item.competencia_anual || item.eje_central || "Sin componente";
    }
    return item.componente || "Sin componente";
  }

  function consultarMalla() {
    const areaNombre = getSelectedAreaNombre();
    const grado = gradoSel.value;
    const periodo = periodoSel.value;
    const componente = compSel.value;

    if (!areaNombre || !grado || !periodo) {
      mostrarErrorConsulta();
      return;
    }

    const malla = obtenerMallaSeleccionada();
    if (!malla) {
      mostrarErrorConsulta();
      ocultarResultados();
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    const items = componente === 'todos'
      ? periodoData
      : periodoData.filter(it => 
          getNombreComponente(it, areaNombre) === componente
        );

    if (items.length === 0) {
      mostrarErrorConsulta();
      ocultarResultados();
      return;
    }

    // Renderizar según el área
    if (areaNombre === "Proyecto Socioemocional") {
      if (window.renderSocioemocional) {
        window.renderSocioemocional(items);
        mostrarResultadosSocio();
      }
    } else {
      if (window.renderTablaMallas) {
        window.renderTablaMallas(items);
        mostrarResultadosNucleo();
      }
    }
  }

  function ocultarResultados() {
    if (resultadosNucleo) resultadosNucleo.classList.remove('mostrar');
    if (resultadosSocio) resultadosSocio.classList.remove('mostrar');
  }

  function mostrarResultadosNucleo() {
    if (resultadosNucleo) resultadosNucleo.classList.add('mostrar');
    if (resultadosSocio) resultadosSocio.classList.remove('mostrar');
  }

  function mostrarResultadosSocio() {
    if (resultadosSocio) resultadosSocio.classList.add('mostrar');
    if (resultadosNucleo) resultadosNucleo.classList.remove('mostrar');
  }

  // Inicial
  limpiarPeriodosYComponentes();
});
