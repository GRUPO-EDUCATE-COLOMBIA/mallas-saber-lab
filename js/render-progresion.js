// js/render-progresion.js - v5.6 (Motor de Progresión de estándares por grados)

window.ProgresionMotor = (function() {
  
  // Estado interno para la navegación
  let estado = { 
    areaId: '',      // ID técnico (ej: 'matematicas')
    areaNombre: '',  // Nombre formal (ej: 'Matemáticas')
    gradoCentral: 0, 
    componente: '', 
    tipo: '4_periodos' 
  };

  // Referencias al DOM
  const overlay = document.getElementById('overlay-progresion');
  const btnCerrar = document.getElementById('btn-cerrar-progresion');
  const btnPrev = document.getElementById('prog-prev');
  const btnNext = document.getElementById('prog-next');
  
  const txtArea = document.getElementById('prog-area-txt');
  const contPrev = document.getElementById('cont-grado-prev');
  const contActual = document.getElementById('cont-grado-actual');
  const contNext = document.getElementById('cont-grado-next');
  
  const colNext = contNext.closest('.col-prog');

  /**
   * Abre el overlay y prepara la visualización
   */
  async function abrir(areaNombre, grado, componente) {
    // Identificar el ID del área para gestionar cargas adicionales
    const areaId = Object.keys(window.APP_CONFIG.AREAS).find(
      k => window.APP_CONFIG.AREAS[k].nombre === areaNombre
    );

    estado.areaId = areaId;
    estado.areaNombre = areaNombre;
    estado.gradoCentral = parseInt(grado);
    estado.componente = componente;
    estado.tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    
    // Forzar visibilidad absoluta
    overlay.style.display = 'flex';
    overlay.classList.add('mostrar-flex');
    
    renderizar();
  }

  /**
   * Cierra el overlay de comparación
   */
  function cerrar() {
    overlay.style.display = 'none';
    overlay.classList.remove('mostrar-flex');
  }

  /**
   * Renderiza las 3 columnas comparativas
   */
  function renderizar() {
    const g = estado.gradoCentral;
    txtArea.textContent = `${estado.areaNombre.toUpperCase()} - COMPONENTE: ${estado.componente}`;

    // LÓGICA DE PUENTE PEDAGÓGICO (Preescolar -> Primero)
    if (g <= 0) {
      colNext.style.display = 'none'; // Ocultar tercera columna en niveles iniciales
      
      if (g === -1) { 
        // Caso: Jardín
        dibujarColumna(contPrev, "-1");
        dibujarColumna(contActual, "0");
      } else { 
        // Caso: Transición (Puente hacia Primero)
        dibujarColumna(contPrev, "0");
        dibujarColumna(contActual, "1");
        document.querySelector('#col-grado-actual .col-header').textContent = "Grado 1° (Puente)";
      }
      btnPrev.disabled = (g === -1);
      btnNext.disabled = true; 
    } else {
      // LÓGICA DE ALINEACIÓN ESTÁNDAR (3 Grados)
      colNext.style.display = 'flex';
      document.querySelector('#col-grado-actual .col-header').textContent = "Grado Actual";
      
      const gPrev = (g - 1 < -1) ? null : String(g - 1);
      const gActual = String(g);
      const gNext = (g + 1 > 11) ? null : String(g + 1);
      
      dibujarColumna(contPrev, gPrev);
      dibujarColumna(contActual, gActual);
      dibujarColumna(contNext, gNext);
      
      btnPrev.disabled = (g <= -1);
      btnNext.disabled = (g >= 11);
    }
  }

  /**
   * Dibuja los ítems de aprendizaje en una columna específica
   */
  function dibujarColumna(contenedor, gradoStr) {
    const header = contenedor.previousElementSibling;
    contenedor.innerHTML = '';
    
    if (gradoStr === null) {
      header.textContent = "---";
      contenedor.innerHTML = '<p class="texto-vacio">Fin de la secuencia.</p>';
      return;
    }

    header.textContent = formatearNombre(gradoStr);
    
    const esPreescolar = (gradoStr === "0" || gradoStr === "-1");
    const datos = obtenerAprendizajesAnuales(gradoStr, esPreescolar);
    
    if (datos.length === 0) {
      contenedor.innerHTML = `<p class="texto-vacio">Cargando o sin datos registrados...</p>`;
    } else {
      datos.forEach(texto => {
        const div = document.createElement('div');
        div.className = 'prog-estandar-item';
        // En preescolar etiquetamos como DBA, en primaria el texto va libre (Estándar)
        div.innerHTML = esPreescolar ? `<strong>DBA:</strong> ${texto}` : texto;
        contenedor.appendChild(div);
      });
    }
  }

  /**
   * Filtra y deduplica aprendizajes de todos los periodos del año
   */
  function obtenerAprendizajesAnuales(gradoStr, esPreescolar) {
    const malla = window.MallasData?.[estado.areaNombre]?.[gradoStr]?.[estado.tipo];
    if (!malla || !malla.periodos) return [];
    
    let acumulado = [];
    Object.keys(malla.periodos).forEach(p => {
      malla.periodos[p].forEach(it => {
        if (esPreescolar) {
          // Extraer DBAs
          if (it.dba) {
            if (Array.isArray(it.dba)) acumulado.push(...it.dba);
            else acumulado.push(it.dba);
          }
        } else {
          // Extraer Estándares por componente (o todos si es puente hacia 1°)
          if ((estado.gradoCentral === 0 && gradoStr === "1") || (it.componente === estado.componente)) {
            if (it.estandar) acumulado.push(it.estandar);
          }
        }
      });
    });
    // Eliminar duplicados para una visualización limpia
    return [...new Set(acumulado)];
  }

  /**
   * Formatea el nombre visual del grado
   */
  function formatearNombre(g) {
    if (g === "0") return "Transición (0)";
    if (g === "-1") return "Jardín (-1)";
    return `Grado ${g}°`;
  }

  // --- CONTROLES DE NAVEGACIÓN ---

  btnPrev.onclick = async () => {
    estado.gradoCentral--;
    // Asegurar que el nuevo grado a mostrar esté cargado
    await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral - 1));
    renderizar();
  };

  btnNext.onclick = async () => {
    estado.gradoCentral++;
    // Asegurar que el nuevo grado a mostrar esté cargado
    await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral + 1));
    renderizar();
  };

  btnCerrar.onclick = cerrar;

  return { abrir };
})();
