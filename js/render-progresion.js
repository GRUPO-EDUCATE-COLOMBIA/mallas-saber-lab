// js/render-progresion.js - v5.3 (Motor de Progresión de estándares por grados)

window.ProgresionMotor = (function() {
  
  let estado = { 
    areaId: '',      
    areaNombre: '',  
    gradoCentral: 0, 
    componente: '', 
    tipo: '4_periodos' 
  };

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
   * Abre el overlay y dispara el renderizado
   */
  async function abrir(areaNombre, grado, componente) {
    // Buscar el ID técnico del área para navegación
    const areaId = Object.keys(window.APP_CONFIG.AREAS).find(
      k => window.APP_CONFIG.AREAS[k].nombre === areaNombre
    );

    estado.areaId = areaId;
    estado.areaNombre = areaNombre;
    estado.gradoCentral = parseInt(grado);
    estado.componente = componente;
    estado.tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    
    // VISIBILIDAD GARANTIZADA: Usamos la clase maestra definida en CSS
    overlay.classList.add('mostrar-flex');
    renderizar();
  }

  function cerrar() {
    overlay.classList.remove('mostrar-flex');
  }

  /**
   * Lógica de renderizado de 3 columnas
   */
  function renderizar() {
    const g = estado.gradoCentral;
    txtArea.textContent = `${estado.areaNombre} - COMPONENTE: ${estado.componente}`;

    if (g <= 0) {
      // Caso Preescolar y Puente
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
    } else {
      // Caso Primaria/Bachillerato Estándar
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
    const datos = obtenerDatosAnuales(gradoStr, esPreescolar);
    
    if (datos.length === 0) {
      contenedor.innerHTML = `<p class="texto-vacio">Sin estándares para este componente.</p>`;
    } else {
      datos.forEach(texto => {
        const div = document.createElement('div');
        div.className = 'prog-estandar-item';
        div.style.marginBottom = "15px";
        div.style.padding = "15px";
        div.style.borderLeft = "4px solid #54BBAB";
        div.style.backgroundColor = "#fff";
        div.style.fontSize = "1.1rem"; // Fuente adaptada
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
          // Si estamos viendo el puente o coincide el componente, guardamos el estándar
          if ((estado.gradoCentral === 0 && gradoStr === "1") || (it.componente === estado.componente)) {
            if (it.estandar) acumulado.push(it.estandar);
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

  // Navegación asíncrona para Lazy Loading
  btnPrev.onclick = async () => {
    estado.gradoCentral--;
    await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral - 1));
    renderizar();
  };

  btnNext.onclick = async () => {
    estado.gradoCentral++;
    await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral + 1));
    renderizar();
  };

  btnCerrar.onclick = cerrar;

  return { abrir };
})();
