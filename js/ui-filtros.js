// js/ui-filtros.js - v5.0 (Controlador Asíncrono Bajo Demanda)

document.addEventListener('DOMContentLoaded', () => {
  // Elementos de Entrada
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  
  // Botones
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProgresion = document.getElementById('btn-progresion');
  
  // Capas de UI
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const modalError = document.getElementById('modal-error');
  const btnModalCancelar = document.getElementById('btn-modal-cancelar');

  // INICIALIZACIÓN
  resetInterfaz();

  // --- EVENTOS DE USUARIO ---

  /**
   * 1. Cambio de Área
   * Fuente de verdad: APP_CONFIG.GRADOS
   */
  areaSel.addEventListener('change', () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    
    resetInterfaz();

    if (!config) {
      gradoSel.disabled = true;
      limpiarSelects([gradoSel, periodoSel, compSel]);
      validarBotones();
      return;
    }

    // Poblamos grados desde la Configuración Maestra
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

  // 2. Cambio de Grado
  gradoSel.addEventListener('change', () => {
    // Al ser Lazy Loading, necesitamos cargar los periodos DESPUÉS de descargar el grado
    // Pero para una UX fluida, los periodos (1-4) suelen ser constantes.
    updatePeriodosEstaticos();
    validarBotones();
  });

  // 3. Cambio de Período
  periodoSel.addEventListener('change', async () => {
    // Para ver los componentes, necesitamos obligatoriamente descargar el archivo
    window.RenderEngine.setCargando(true);
    const exito = await asegurarDatosGrado(areaSel.value, gradoSel.value);
    
    if (exito) {
      updateComponentesUI();
    }
    window.RenderEngine.setCargando(false);
    validarBotones();
  });

  // 4. Cambio de Componente
  compSel.addEventListener('change', validarBotones);

  /**
   * 5. BOTÓN CONSULTAR (ASÍNCRONO)
   * Dispara la descarga de la Tríada de Datos
   */
  btnBuscar.addEventListener('click', async () => {
    const areaId = areaSel.value;
    const grado = gradoSel.value;
    const periodo = periodoSel.value;

    if (!areaId || !grado || !periodo) {
      if (modalError) modalError.classList.add('mostrar-flex');
      return;
    }

    // Activar spinner
    window.RenderEngine.setCargando(true);

    // SOLICITUD AL MOTOR DE CARGA: Descarga Malla + DCE + ECO en paralelo
    const exito = await asegurarDatosGrado(areaId, grado);

    if (exito) {
      const config = window.APP_CONFIG.AREAS[areaId];
      const tipo = obtenerTipoMalla();
      const malla = window.MallasData[config.nombre][grado][tipo];
      
      const todosLosItems = malla.periodos[periodo] || [];
      const itemsFiltrados = compSel.value === "todos" 
        ? todosLosItems 
        : todosLosItems.filter(it => (it.componente === compSel.value || it.competencia === compSel.value));

      // Dibujar resultados
      window.RenderEngine.renderizar(itemsFiltrados, areaId, grado, periodo);
      resPrincipal.className = `resultados mostrar-block ${config.clase}`;
    } else {
      console.error("No se pudo obtener el paquete curricular.");
    }
    
    window.RenderEngine.setCargando(false);
  });

  /**
   * 6. BOTÓN PROGRESIÓN (ASÍNCRONO)
   * Descarga hasta 3 grados antes de mostrar el overlay
   */
  if (btnProgresion) {
    btnProgresion.addEventListener('click', async () => {
      const areaId = areaSel.value;
      const gCentral = parseInt(gradoSel.value);
      const config = window.APP_CONFIG.AREAS[areaId];

      window.RenderEngine.setCargando(true);

      // Preparamos la lista de grados necesarios (Previo, Actual, Siguiente)
      const listaGrados = [String(gCentral)];
      if (gCentral > -1) listaGrados.push(String(gCentral - 1));
      if (gCentral < 11) listaGrados.push(String(gCentral + 1));

      // Descarga masiva controlada
      await Promise.all(listaGrados.map(g => asegurarDatosGrado(areaId, g)));

      window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
      window.RenderEngine.setCargando(false);
    });
  }

  // --- UTILIDADES ---

  function updatePeriodosEstaticos() {
    // Asumimos 4 periodos por defecto para agilizar la UI, 
    // el validador real ocurre en el motor de carga.
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    const num = obtenerTipoMalla() === "3_periodos" ? 3 : 4;
    for (let i = 1; i <= num; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${i}° período`;
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
      if(n) {
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
    if (btnProgresion) {
      const listo = areaSel.value && gradoSel.value && compSel.value && compSel.value !== 'todos';
      btnProgresion.disabled = !listo;
    }
  }

  function resetInterfaz() {
    if (resPrincipal) {
      resPrincipal.classList.remove('mostrar-block');
      resPrincipal.classList.add('ocultar-inicial');
    }
    if (herramientas) herramientas.classList.add('ocultar-inicial');
  }

  function limpiarSelects(selects) {
    selects.forEach(s => {
      s.innerHTML = s.id === "componente" ? '<option value="todos">Todos</option>' : '<option value="">Seleccionar</option>';
      s.disabled = true;
    });
  }

  if (btnModalCancelar) {
    btnModalCancelar.addEventListener('click', () => {
      modalError.classList.remove('mostrar-flex');
    });
  }
});
