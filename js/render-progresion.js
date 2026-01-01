// js/render-progresion.js

/**
 * Motor de Progresión de Aprendizajes
 * Encargado de la agregación de estándares de 4 períodos para 3 grados.
 */
window.ProgresionMotor = (function() {
  
  // Estado interno de la vista de progresión
  let estado = {
    area: '',
    gradoCentral: 0,
    componente: '',
    tipoMalla: '4_periodos'
  };

  // Referencias a elementos del DOM
  const overlay = document.getElementById('overlay-progresion');
  const btnCerrar = document.getElementById('btn-cerrar-progresion');
  const btnPrev = document.getElementById('prog-prev');
  const btnNext = document.getElementById('prog-next');
  
  const txtArea = document.getElementById('prog-area-txt');
  const txtComp = document.getElementById('prog-comp-txt');

  const contPrev = document.getElementById('cont-grado-prev');
  const contActual = document.getElementById('cont-grado-actual');
  const contNext = document.getElementById('cont-grado-next');

  const labelPrev = document.querySelector('#col-grado-prev .col-header');
  const labelActual = document.querySelector('#col-grado-actual .col-header');
  const labelNext = document.querySelector('#col-grado-next .col-header');

  /**
   * Inicializa y muestra la ventana de progresión
   */
  function abrir(area, grado, componente) {
    estado.area = area;
    estado.gradoCentral = parseInt(grado);
    estado.componente = componente;
    
    overlay.classList.remove('ocultar');
    renderizar();
  }

  /**
   * Cierra la ventana
   */
  function cerrar() {
    overlay.classList.add('ocultar');
  }

  /**
   * Procesa los datos y dibuja las 3 columnas
   */
  function renderizar() {
    const g = estado.gradoCentral;
    
    // Configurar títulos superiores
    txtArea.textContent = estado.area;
    txtComp.textContent = estado.componente;

    // Calcular grados de la secuencia
    const gPrev = calcularGradoRelativo(g, -1);
    const gActual = String(g);
    const gNext = calcularGradoRelativo(g, 1);

    // Poblar contenido de columnas
    dibujarColumna(contPrev, labelPrev, gPrev);
    dibujarColumna(contActual, labelActual, gActual);
    dibujarColumna(contNext, labelNext, gNext);

    // Control de navegación (Límites de Jardín -1 a Grado 11)
    btnPrev.disabled = (g <= -1);
    btnNext.disabled = (g >= 11);
  }

  /**
   * Obtiene y dibuja los estándares anuales de un grado específico
   */
  function dibujarColumna(contenedor, etiqueta, gradoStr) {
    contenedor.innerHTML = '';
    
    if (gradoStr === null) {
      etiqueta.textContent = "---";
      contenedor.innerHTML = '<p class="texto-vacio">Fin de la secuencia curricular.</p>';
      return;
    }

    // Actualizar nombre del grado en la cabecera de la columna
    etiqueta.textContent = formatearNombreGrado(gradoStr);

    // AGREGACIÓN: Obtener estándares de todos los períodos del año
    const estandaresAnuales = obtenerEstandaresAnuales(gradoStr);

    if (estandaresAnuales.length === 0) {
      contenedor.innerHTML = '<p class="texto-vacio">No se hallaron estándares para este componente en el año escolar.</p>';
    } else {
      estandaresAnuales.forEach(texto => {
        const item = document.createElement('div');
        item.className = 'prog-estandar-item';
        item.textContent = texto;
        contenedor.appendChild(item);
      });
    }
  }

  /**
   * Navega por los 4 períodos del JSON y extrae estándares únicos
   */
  function obtenerEstandaresAnuales(gradoStr) {
    const malla = window.MallasData?.[estado.area]?.[gradoStr]?.[estado.tipoMalla];
    if (!malla || !malla.periodos) return [];

    let acumulado = [];
    
    // Recorremos todos los períodos disponibles (1, 2, 3, 4)
    Object.keys(malla.periodos).forEach(pNum => {
      const itemsPeriodo = malla.periodos[pNum];
      
      // Filtramos por el componente seleccionado
      itemsPeriodo.forEach(it => {
        if (it.componente === estado.componente && it.estandar) {
          acumulado.push(it.estandar);
        }
      });
    });

    // Eliminar duplicados exactos para limpieza visual
    return [...new Set(acumulado)];
  }

  /**
   * Auxiliar para navegación de grados
   */
  function calcularGradoRelativo(gradoActual, desplazamiento) {
    const nuevo = gradoActual + desplazamiento;
    if (nuevo < -1 || nuevo > 11) return null;
    return String(nuevo);
  }

  function formatearNombreGrado(g) {
    if (g === "0") return "Transición (0)";
    if (g === "-1") return "Jardín (-1)";
    return `Grado ${g}°`;
  }

  // --- LISTENERS DE LA VENTANA ---
  btnCerrar.addEventListener('click', cerrar);

  btnPrev.addEventListener('click', () => {
    estado.gradoCentral--;
    renderizar();
  });

  btnNext.addEventListener('click', () => {
    estado.gradoCentral++;
    renderizar();
  });

  // Exportar funciones públicas
  return {
    abrir: abrir
  };

})();
