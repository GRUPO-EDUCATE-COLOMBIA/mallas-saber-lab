// js/ui-filtros.js - v5.3 (Controlador con Auto-Collapse)

document.addEventListener('DOMContentLoaded', () => {
  // Elementos de Entrada
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  
  // Contenedores y Botones
  const filtrosCont = document.getElementById('filtros');
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProgresion = document.getElementById('btn-progresion');
  const resPrincipal = document.getElementById('resultados-principal');

  // --- LÓGICA DE AUTO-COLLAPSE ---

  function colapsarFiltros() {
    filtrosCont.classList.add('colapsado');
  }

  function expandirFiltros() {
    filtrosCont.classList.remove('colapsado');
  }

  // --- EVENTOS DE USUARIO ---

  // 1. Cambio de Área
  areaSel.addEventListener('change', () => {
    expandirFiltros(); // Asegurar que se vea todo al cambiar de área
    const areaId = areaSel.value;
    if (!areaId) {
      gradoSel.disabled = true;
      return;
    }

    // Población de grados desde Config (Lazy Loading ready)
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    window.APP_CONFIG.GRADOS.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
      gradoSel.appendChild(opt);
    });
    gradoSel.disabled = false;
    validarBotones();
  });

  // 2. Cambio de Grado y Período
  gradoSel.addEventListener('change', () => {
    updatePeriodosEstaticos();
    validarBotones();
  });

  periodoSel.addEventListener('change', async () => {
    window.RenderEngine.setCargando(true);
    const exito = await asegurarDatosGrado(areaSel.value, gradoSel.value);
    if (exito) updateComponentesUI();
    window.RenderEngine.setCargando(false);
    validarBotones();
  });

  /**
   * 3. BOTÓN CONSULTAR (Doble Función: Buscar / Expandir)
   */
  btnBuscar.addEventListener('click', async () => {
    // Si ya está colapsado, el usuario quiere MODIFICAR, así que expandimos
    if (filtrosCont.classList.contains('colapsado')) {
      expandirFiltros();
      return;
    }

    const areaId = areaSel.value;
    const grado = gradoSel.value;
    const periodo = periodoSel.value;

    if (!areaId || !grado || !periodo) {
      document.getElementById('modal-error').classList.add('mostrar-flex');
      return;
    }

    window.RenderEngine.setCargando(true);

    // Carga Bajo Demanda (Tríada: Académica + DCE + ECO)
    const exito = await asegurarDatosGrado(areaId, grado);

    if (exito) {
      const config = window.APP_CONFIG.AREAS[areaId];
      const tipo = obtenerTipoMalla();
      const malla = window.MallasData[config.nombre][grado][tipo];
      
      const todosLosItems = malla.periodos[periodo] || [];
      const itemsFiltrados = compSel.value === "todos" 
        ? todosLosItems 
        : todosLosItems.filter(it => (it.componente === compSel.value || it.competencia === compSel.value));

      // Ejecutar Renderizado
      window.RenderEngine.renderizar(itemsFiltrados, areaId, grado, periodo);
      
      // LA MAGIA: Colapsamos para dar 70% de espacio a los resultados
      colapsarFiltros(); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    window.RenderEngine.setCargando(false);
  });

  // 4. Botón Progresión
  if (btnProgresion) {
    btnProgresion.addEventListener('click', async () => {
      const areaId = areaSel.value;
      const gCentral = parseInt(gradoSel.value);
      const config = window.APP_CONFIG.AREAS[areaId];

      window.RenderEngine.setCargando(true);
      const listaGrados = [String(gCentral)];
      if (gCentral > -1) listaGrados.push(String(gCentral - 1));
      if (gCentral < 11) listaGrados.push(String(gCentral + 1));

      await Promise.all(listaGrados.map(g => asegurarDatosGrado(areaId, g)));
      window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
      window.RenderEngine.setCargando(false);
    });
  }

  // --- HELPERS ---

  function updatePeriodosEstaticos() {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    const num = obtenerTipoMalla() === "3_periodos" ? 3 : 4;
    for (let i = 1; i <= num; i++) {
      const opt = document.createElement('option');
      opt.value = String(i); opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
  }

  function updateComponentesUI() {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const tipo = obtenerTipoMalla();
    const malla = window.MallasData?.[config.nombre]?.[gradoSel.value]?.[tipo];
    const items = malla?.periodos?.[periodoSel.value] || [];
    compSel.innerHTML = '<option value="todos">Todos</option>';
    const nombres = [...new Set(items.map(it => it.componente || it.competencia))];
    nombres.sort().forEach(n => {
      if(n) { const opt = document.createElement('option'); opt.value = n; opt.textContent = n; compSel.appendChild(opt); }
    });
    compSel.disabled = false;
  }

  function obtenerTipoMalla() {
    const radio = document.querySelector('input[name="periodos"]:checked');
    return radio && radio.value === "3" ? "3_periodos" : "4_periodos";
  }

  function validarBotones() {
    if (btnProgresion) {
      btnProgresion.disabled = !(areaSel.value && gradoSel.value && compSel.value && compSel.value !== 'todos');
    }
  }

  function resetInterfaz() {
    if (resPrincipal) resPrincipal.classList.remove('mostrar-block');
    expandirFiltros();
  }

  document.getElementById('btn-modal-cancelar').onclick = () => {
    document.getElementById('modal-error').classList.remove('mostrar-flex');
  };
});
