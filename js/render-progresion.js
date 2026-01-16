// FILE: js/render-progresion.js | VERSION: v10.8 Stable
window.ProgresionMotor = (function() {
  // Estado interno del motor
  let est = { areaId: '', areaNombre: '', gradoCentral: 0, componente: '', tipo: '4_periodos' };
  
  const ov = document.getElementById('overlay-progresion');
  const txt = document.getElementById('prog-area-txt');
  const cPr = document.getElementById('cont-grado-prev');
  const cAc = document.getElementById('cont-grado-actual');
  const cNx = document.getElementById('cont-grado-next');

  /**
   * ABRE EL PANEL DE PROGRESIÓN
   */
  async function abrir(nom, gr, comp) {
    const config = window.APP_CONFIG.AREAS;
    // Identificar el ID del área para el fetch
    est.areaId = Object.keys(config).find(k => config[k].nombre === nom);
    est.areaNombre = nom; 
    est.gradoCentral = parseInt(gr); 
    est.componente = comp; 
    est.tipo = window.APP_CONFIG.TIPO_MALLA; // Sincronización bimodal v10.8

    if (ov) ov.classList.add('mostrar-flex');
    renderizar();
  }

  /**
   * GESTIONA EL DIBUJO DE LAS 3 COLUMNAS
   */
  function renderizar() {
    const g = est.gradoCentral;
    txt.textContent = `${est.areaNombre.toUpperCase()} - ${est.componente}`;
    
    // Dibujo de columnas (Previo, Actual, Siguiente)
    dibujar(cPr, (g - 1 < -1) ? null : String(g - 1));
    dibujar(cAc, String(g));
    dibujar(cNx, (g + 1 > 11) ? null : String(g + 1));
    
    // Control de navegación
    const btnP = document.getElementById('prog-prev');
    const btnN = document.getElementById('prog-next');
    if (btnP) btnP.disabled = (g <= -1);
    if (btnN) btnN.disabled = (g >= 11);
  }

  /**
   * RENDERIZA EL CONTENIDO DE UNA COLUMNA ESPECÍFICA
   */
  function dibujar(cont, grStr) {
    if (!cont) return;
    const h = cont.previousElementSibling; // El encabezado de la columna
    cont.innerHTML = '';

    if (grStr === null) {
      if (h) h.textContent = "---";
      cont.innerHTML = '<p style="text-align:center;color:#999;padding-top:20px;">Fin de secuencia.</p>';
      return;
    }

    if (h) h.textContent = (grStr === "0" ? "Transición (0)" : (grStr === "-1" ? "Jardín (-1)" : `Grado ${grStr}°`));
    
    // Lógica Híbrida: DBA para preescolar, Estándar para el resto
    const esPreescolar = (grStr === "0" || grStr === "-1");
    const datos = obtenerDatos(grStr, esPreescolar);

    if (datos.length === 0) {
      cont.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">Sin datos registrados.</p>';
    } else {
      datos.forEach(texto => {
        const d = document.createElement('div');
        d.className = 'prog-estandar-item';
        
        // Aplicación de Badges (v10.8)
        const parts = texto.split(':');
        if (parts.length > 1 && parts[0].trim().length < 25) {
           d.innerHTML = `<span class="badge-id">${parts[0].trim()}</span><div style="margin-top:8px;">${parts.slice(1).join(':').trim()}</div>`;
        } else {
           d.innerHTML = texto;
        }
        cont.appendChild(d);
      });
    }
  }

  /**
   * EXTRAE LA INFORMACIÓN DEL MODELO DE DATOS
   */
  function obtenerDatos(grStr, esPre) {
    const llaveArea = normalizarTexto(est.areaNombre);
    const malla = window.MallasData[llaveArea]?.[grStr]?.[est.tipo];
    
    if (!malla || !malla.periodos) return [];
    
    let resultados = [];
    const nomCompBuscado = normalizarTexto(est.componente);

    // Iteración segura sobre Objeto de Periodos (v10.8)
    Object.values(malla.periodos).forEach(listaItems => {
      if (Array.isArray(listaItems)) {
        listaItems.forEach(item => {
          const nomItem = normalizarTexto(item.componente || item.competencia);
          
          // Puente Pedagógico: Si el componente coincide o estamos en el salto de Grado 0 a 1
          if (nomItem === nomCompBuscado || (est.gradoCentral <= 0 && grStr === "1")) {
            const contenido = esPre ? item.dba : item.estandar;
            if (contenido) {
              if (Array.isArray(contenido)) resultados.push(...contenido);
              else resultados.push(contenido);
            }
          }
        });
      }
    });

    // Eliminar duplicados y limpiar vacíos
    return [...new Set(resultados)].filter(t => t && String(t).trim() !== "");
  }

  // EVENTOS DE NAVEGACIÓN DENTRO DEL MODAL
  const btnCerrar = document.getElementById('btn-cerrar-progresion');
  if (btnCerrar) btnCerrar.onclick = () => ov.classList.remove('mostrar-flex');
  
  const btnPrev = document.getElementById('prog-prev');
  if (btnPrev) {
    btnPrev.onclick = async () => { 
      if (est.gradoCentral > -1) {
        est.gradoCentral--; 
        window.RenderEngine.setCargando(true);
        await asegurarDatosGrado(est.areaId, est.gradoCentral - 1); // Carga preventiva
        renderizar();
        window.RenderEngine.setCargando(false);
      }
    };
  }
  
  const btnNext = document.getElementById('prog-next');
  if (btnNext) {
    btnNext.onclick = async () => { 
      if (est.gradoCentral < 11) {
        est.gradoCentral++; 
        window.RenderEngine.setCargando(true);
        await asegurarDatosGrado(est.areaId, est.gradoCentral + 1); // Carga preventiva
        renderizar();
        window.RenderEngine.setCargando(false);
      }
    };
  }

  return { abrir };
})();
