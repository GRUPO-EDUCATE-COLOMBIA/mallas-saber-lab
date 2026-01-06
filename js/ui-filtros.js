// js/ui-filtros.js - v5.6 (Controlador de Menús y Eventos)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Referencias al DOM
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProg = document.getElementById('btn-progresion');
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');

  // --- EVENTOS DE USUARIO ---

  // A. Cambio de Área
  areaSel.addEventListener('change', () => {
    const areaId = areaSel.value;
    resetInterfaz();

    if (!areaId) {
      limpiarSelects([gradoSel, periodoSel, compSel]);
      return;
    }

    // Poblar Grados desde la Configuración Maestra
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    window.APP_CONFIG.GRADOS.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      if (g === "0") opt.textContent = "Transición (0)";
      else if (g === "-1") opt.textContent = "Jardín (-1)";
      else opt.textContent = g + "°";
      gradoSel.appendChild(opt);
    });

    gradoSel.disabled = false;
    limpiarSelects([periodoSel, compSel]);
    validarBotones();
  });

  // B. Cambio de Grado
  gradoSel.addEventListener('change', () => {
    if (!gradoSel.value) {
      limpiarSelects([periodoSel, compSel]);
      return;
    }

    // Poblar Períodos (Basado en la configuración de la malla)
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    const maxPeriodos = window.APP_CONFIG.TIPO_MALLA === "3_periodos" ? 3 : 4;
    for (let i = 1; i <= maxPeriodos; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
    limpiarSelects([compSel]);
    validarBotones();
  });

  // C. Cambio de Período -> DISPARA CARGA DE DATOS
  periodoSel.addEventListener('change', async () => {
    if (!periodoSel.value) {
      limpiarSelects([compSel]);
      return;
    }

    window.RenderEngine.setCargando(true);

    // Asegurar que los archivos existan en memoria (Malla + DCE + ECO)
    const areaId = areaSel.value;
    const grado = gradoSel.value;
    const exito = await asegurarDatosGrado(areaId, grado);

    if (exito) {
      updateComponentesUI();
    }
    
    window.RenderEngine.setCargando(false);
    validarBotones();
  });

  // D. Cambio de Componente
  compSel.addEventListener('change', validarBotones);

  // E. BOTÓN CONSULTAR
  btnBuscar.addEventListener('click', () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const grado = gradoSel.value;
    const periodo = periodoSel.value;
    const tipo = obtenerTipoMalla();

    const malla = window.MallasData[config.nombre][grado][tipo];
    const todosLosItems = malla.periodos[periodo] || [];
    
    const itemsFiltrados = compSel.value === "todos" 
      ? todosLosItems 
      : todosLosItems.filter(it => (it.componente || it.competencia) === compSel.value);

    // Renderizado
    window.RenderEngine.renderizar(itemsFiltrados, areaId, grado, periodo);
    
    // Aplicar identidad visual y mostrar
    resPrincipal.className = `resultados mostrar-block ${config.clase}`;
    herramientas.classList.add('mostrar-flex');
  });

  // F. BOTÓN PROGRESIÓN
  if (btnProg) {
    btnProg.addEventListener('click', () => {
      const config = window.APP_CONFIG.AREAS[areaSel.value];
      window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
    });
  }

  // --- FUNCIONES DE SOPORTE ---

  function updateComponentesUI() {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const grado = gradoSel.value;
    const tipo = obtenerTipoMalla();
    
    const malla = window.MallasData[config.nombre][grado][tipo];
    const items = malla.periodos[periodoSel.value] || [];
    
    compSel.innerHTML = '<option value="todos">Todos</option>';
    
    // Obtener nombres únicos (Componentes o Competencias)
    const nombres = [...new Set(items.map(it => it.componente || it.competencia))];
    nombres.sort().forEach(n => {
      if (n) {
        const opt = document.createElement('option');
        opt.value = n; opt.textContent = n;
        compSel.appendChild(opt);
      }
    });
    compSel.disabled = false;
  }

  function obtenerTipoMalla() {
    const radio = document.querySelector('input[name="periodos"]:checked');
    return radio && radio.value === "3" ? "3_periodos" : "4_periodos";
  }

  function validarBotones() {
    const completo = areaSel.value && gradoSel.value && periodoSel.value;
    btnBuscar.disabled = !completo;
    
    if (btnProg) {
      // Solo habilitar progresión si hay un componente específico
      btnProg.disabled = !(completo && compSel.value && compSel.value !== 'todos');
    }
  }

  function resetInterfaz() {
    if (resPrincipal) resPrincipal.classList.remove('mostrar-block');
    if (herramientas) herramientas.classList.remove('mostrar-flex');
  }

  function limpiarSelects(selects) {
    selects.forEach(s => {
      s.innerHTML = s.id === "componente" ? '<option value="todos">Todos</option>' : '<option value="">Seleccionar</option>';
      s.disabled = true;
    });
  }
});
