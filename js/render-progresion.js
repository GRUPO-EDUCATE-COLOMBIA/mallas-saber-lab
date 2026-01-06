// js/render-progresion.js - v5.0 (Motor de Alineación Asíncrono)

window.ProgresionMotor = (function() {
  
  // Estado extendido para soportar Lazy Loading durante la navegación
  let estado = { 
    areaId: '',      // ej: 'matematicas'
    areaNombre: '',  // ej: 'Matemáticas'
    gradoCentral: 0, 
    componente: '', 
    tipo: '4_periodos' 
  };

  const overlay = document.getElementById('overlay-progresion');
  const btnCerrar = document.getElementById('btn-cerrar-progresion');
  const btnPrev = document.getElementById('prog-prev');
  const btnNext = document.getElementById('prog-next');
  
  const txtArea = document.getElementById('prog-area-txt');
  const txtComp = document.getElementById('prog-comp-txt');
  
  const contPrev = document.getElementById('cont-grado-prev');
  const contActual = document.getElementById('cont-grado-actual');
  const contNext = document.getElementById('cont-grado-next');
  
  const colNext = contNext.closest('.col-prog');

  /**
   * Abre el overlay y asegura que los datos existan
   */
  async function abrir(areaNombre, grado, componente) {
    // Encontrar el ID del área para futuras descargas
    const areaId = Object.keys(window.APP_CONFIG.AREAS).find(
      k => window.APP_CONFIG.AREAS[k].nombre === areaNombre
    );

    estado.areaId = areaId;
    estado.areaNombre = areaNombre;
    estado.gradoCentral = parseInt(grado);
    estado.componente = componente;
    estado.tipo = obtenerTipoMalla();
    
    overlay.classList.add('mostrar-flex');
    renderizar();
  }

  function cerrar() {
    overlay.classList.remove('mostrar-flex');
  }

  /**
   * Renderizado con validación de existencia de datos
   */
  function renderizar() {
    const g = estado.gradoCentral;
    txtArea.textContent = estado.areaNombre;
    txtComp.textContent = `COMPONENTE: ${estado.componente}`;

    // LÓGICA DE PUENTE PEDAGÓGICO
    if (g <= 0) {
      colNext.style.display = 'none'; 
      if (g === -1) { 
        dibujarColumna(contPrev, "-1");
        dibujarColumna(contActual, "0");
      } else { 
        dibujarColumna(contPrev, "0");
        dibujarColumna(contActual, "1");
        document.querySelector('#col-grado-actual .col-header').textContent = "Grado 1° (Puente)";
      }
      btnPrev.disabled = (g === -1);
      btnNext.disabled = true; 
      document.querySelector('.info-ciclo').textContent = "Secuencia de Preescolar Integral";
    } else {
      // LÓGICA ESTÁNDAR DE 3 COLUMNAS
      colNext.style.display = 'flex';
      const gPrev = (g - 1 < -1) ? null : String(g - 1);
      const gActual = String(g);
      const gNext = (g + 1 > 11) ? null : String(g + 1);
      
      dibujarColumna(contPrev, gPrev);
      dibujarColumna(contActual, gActual);
      dibujarColumna(contNext, gNext);
      
      btnPrev.disabled = (g <= -1);
      btnNext.disabled = (g >= 11);
      document.querySelector('.info-ciclo').textContent = "Visualizando secuencia de 3 grados";
    }
  }

  function dibujarColumna(contenedor, gradoStr) {
    const header = contenedor.previousElementSibling;
    contenedor.innerHTML = '';
    
    if (gradoStr === null) {
      header.textContent = "---";
      contenedor.innerHTML = '<p class="texto-vacio">Fin de la secuencia.</p>';
      return;
    }

    header.textContent = formatearNombre(gradoStr);
    
    // Verificación de seguridad: ¿Los datos están en memoria?
    const datosCargados = window.MallasData?.[estado.areaNombre]?.[gradoStr]?.[estado.tipo];
    
    if (!datosCargados) {
      contenedor.innerHTML = `<div class="spinner-mini"></div><p class="texto-vacio">Cargando datos...</p>`;
      return;
    }

    const esPreescolar = (gradoStr === "0" || gradoStr === "-1");
    const datos = obtenerDatosAnuales(gradoStr, esPreescolar);
    
    if (datos.length === 0) {
      contenedor.innerHTML = `<p class="texto-vacio">No hay registros para este componente.</p>`;
    } else {
      datos.forEach(texto => {
        const div = document.createElement('div');
        div.className = 'prog-estandar-item';
        div.innerHTML = esPreescolar ? `<strong>DBA:</strong> ${texto}` : texto;
        contenedor.appendChild(div);
      });
    }
  }

  function obtenerDatosAnuales(gradoStr, esPreescolar) {
    const malla = window.MallasData?.[estado.areaNombre]?.[gradoStr]?.[estado.tipo];
    if (!malla || !malla.periodos) return [];
    
    let acumulado = [];
    Object.keys(malla.periodos).forEach(p => {
      malla.periodos[p].forEach(it => {
        if (esPreescolar) {
          if (it.dba) {
            if (Array.isArray(it.dba)) acumulado.push(...it.dba);
            else acumulado.push(it.dba);
          }
        } else {
          if (estado.gradoCentral === 0 && gradoStr === "1") {
            if (it.estandar) acumulado.push(it.estandar);
          } 
          else if (it.componente === estado.componente && it.estandar) {
            acumulado.push(it.estandar);
          }
        }
      });
    });
    return [...new Set(acumulado)];
  }

  function formatearNombre(g) {
    if (g === "0") return "Transición (0)";
    if (g === "-1") return "Jardín (-1)";
    return `Grado ${g}°`;
  }

  function obtenerTipoMalla() {
    const radio = document.querySelector('input[name="periodos"]:checked');
    return radio && radio.value === "3" ? "3_periodos" : "4_periodos";
  }

  // --- NAVEGACIÓN ASÍNCRONA (Lazy Loading Integrado) ---

  btnPrev.onclick = async () => {
    estado.gradoCentral--;
    const gNecesario = String(estado.gradoCentral - 1);
    // Aseguramos el grado que entrará a la vista por la izquierda
    if (estado.gradoCentral >= 0) {
      await asegurarDatosGrado(estado.areaId, gNecesario);
    }
    renderizar();
  };

  btnNext.onclick = async () => {
    estado.gradoCentral++;
    const gNecesario = String(estado.gradoCentral + 1);
    // Aseguramos el grado que entrará a la vista por la derecha
    if (estado.gradoCentral < 11) {
      await asegurarDatosGrado(estado.areaId, gNecesario);
    }
    renderizar();
  };

  btnCerrar.onclick = cerrar;

  return { abrir };
})();
