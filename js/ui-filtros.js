// FILE: js/ui-filtros.js | VERSION: v10.8 Stable
document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.getElementById('btn-buscar');
  const btnProg = document.getElementById('btn-progresion');
  const btnTop = document.getElementById('btn-top');
  const radiosPeriodos = document.querySelectorAll('input[name="periodos"]');
  
  // Captura de elementos del Modal de Atención
  const modal = document.getElementById('modal-notificacion');
  const modalMsg = document.getElementById('modal-mensaje');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');

  /**
   * CAPA DE SEGURIDAD NACIONAL (v10.8)
   * Bloquea copia, inspección y selección de texto
   */
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && ['c','u','i','s','p'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      mostrarError("Acceso Protegido - El contenido de esta malla no puede ser copiado.");
    }
  });

  /**
   * FUNCIÓN DE NOTIFICACIÓN (MODAL DE ATENCIÓN)
   */
  function mostrarError(mensaje) {
    if (modalMsg) modalMsg.textContent = mensaje;
    if (modal) modal.classList.add('mostrar-flex');
    window.RenderEngine.setCargando(false);
  }

  if (btnCerrarModal) {
    btnCerrarModal.onclick = () => modal.classList.remove('mostrar-flex');
  }

  /**
   * LIMPIEZA INSTANTÁNEA DE INTERFAZ (UX Propuesta)
   * Se ejecuta al cambiar cualquier criterio de búsqueda
   */
  function resetResultados() {
    const contMalla = document.getElementById('contenedor-malla');
    const resPrincipal = document.getElementById('resultados-principal');
    const indPeriodo = document.getElementById('indicador-periodo');
    if (contMalla) contMalla.innerHTML = '';
    if (resPrincipal) resPrincipal.classList.remove('mostrar-block');
    if (indPeriodo) indPeriodo.style.display = 'none';
    btnProg.disabled = true; // El botón se deshabilita hasta cargar nuevos datos
  }

  // --- LÓGICA BIMODAL (3 P. / 4 P.) ---
  radiosPeriodos.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const seleccion = e.target.value;
      window.APP_CONFIG.TIPO_MALLA = window.APP_CONFIG.MODALIDADES_TIEMPO[seleccion];
      resetResultados();
      areaSel.value = "";
      gradoSel.innerHTML = '<option value="">Seleccionar</option>';
      gradoSel.disabled = true;
      periodoSel.innerHTML = '<option value="">Seleccionar</option>';
      periodoSel.disabled = true;
      compSel.innerHTML = '<option value="todos">Todos</option>';
      compSel.disabled = true;
    });
  });

  areaSel.addEventListener('change', () => {
    resetResultados();
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    periodoSel.disabled = true;
    if (areaSel.value) {
      window.APP_CONFIG.GRADOS.forEach(g => {
        const opt = document.createElement('option'); opt.value = g;
        opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
        gradoSel.appendChild(opt);
      });
      gradoSel.disabled = false;
    }
  });

  gradoSel.addEventListener('change', () => {
    resetResultados();
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    if (gradoSel.value) {
      const maxP = window.APP_CONFIG.TIPO_MALLA === "3_periodos" ? 3 : 4;
      for (let i = 1; i <= maxP; i++) {
        const opt = document.createElement('option'); opt.value = i; opt.textContent = `${i}° Periodo`;
        periodoSel.appendChild(opt);
      }
      periodoSel.disabled = false;
    }
  });

  periodoSel.addEventListener('change', async () => {
    resetResultados(); // Limpia información previa al detectar cambio de periodo
    if (!periodoSel.value) return;
    
    window.RenderEngine.setCargando(true);
    const exito = await asegurarDatosGrado(areaSel.value, gradoSel.value);
    
    if (exito) {
      const configArea = window.APP_CONFIG.AREAS[areaSel.value];
      const dataGrado = window.MallasData[normalizarTexto(configArea.nombre)]?.[gradoSel.value]?.[window.APP_CONFIG.TIPO_MALLA];
      
      if (dataGrado?.periodos?.[periodoSel.value]) {
        const items = dataGrado.periodos[periodoSel.value];
        compSel.innerHTML = '<option value="todos">Todos</option>';
        const componentesUnicos = [...new Set(items.map(it => it.componente || it.competencia))];
        componentesUnicos.forEach(n => {
          if (n) {
            const opt = document.createElement('option'); opt.value = n; opt.textContent = n;
            compSel.appendChild(opt);
          }
        });
        compSel.disabled = false;
        btnProg.disabled = false; // REACTIVACIÓN DEL BOTÓN DE PROGRESIÓN
      }
    }
    window.RenderEngine.setCargando(false);
  });

  btnBuscar.addEventListener('click', () => {
    // VALIDACIÓN DE CRITERIOS (v10.8)
    if (!areaSel.value || !gradoSel.value || !periodoSel.value) {
      mostrarError("Faltan criterios de selección: Asegúrese de elegir Área, Grado y Periodo.");
      return;
    }

    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const malla = window.MallasData[normalizarTexto(config.nombre)]?.[gradoSel.value]?.[window.APP_CONFIG.TIPO_MALLA];
    
    if (!malla) {
      mostrarError("No se encontraron datos para la combinación seleccionada.");
      return;
    }

    const items = malla.periodos[periodoSel.value] || [];
    const filtrados = compSel.value === "todos" ? items : items.filter(it => (it.componente || it.competencia) === compSel.value);
    
    window.RenderEngine.renderizar(filtrados, areaSel.value, gradoSel.value, periodoSel.value);
  });

  btnProg.addEventListener('click', async () => {
    if (!areaSel.value || !gradoSel.value) return;
    window.RenderEngine.setCargando(true);
    const g = parseInt(gradoSel.value);
    // Precarga de grados adyacentes para suavizar la apertura del modal
    const grados = [String(g), String(g-1), String(g+1), "0", "-1", "1"];
    try {
      await Promise.all(grados.map(gr => asegurarDatosGrado(areaSel.value, gr)));
      window.ProgresionMotor.abrir(window.APP_CONFIG.AREAS[areaSel.value].nombre, gradoSel.value, compSel.value);
    } catch { 
      mostrarError("Error de conexión al cargar la secuencia de progresión.");
    }
    window.RenderEngine.setCargando(false);
  });

  // RESTAURACIÓN BOTÓN FLECHA ARRIBA (v10.8)
  window.onscroll = () => { 
    if (btnTop) btnTop.style.display = (window.scrollY > 400) ? 'block' : 'none'; 
  };
  if (btnTop) btnTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
});
