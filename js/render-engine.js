// js/render-engine.js

/**
 * MOTOR DE RENDERIZADO UNIFICADO (v2.1)
 * Optimización: Vinculación dinámica de elementos y búsqueda profunda.
 */
window.RenderEngine = (function() {

  // Variables de estado interno
  let itemsActuales = [];
  let contextoActual = { areaId: '', grado: '', periodo: '' };

  /**
   * FUNCIÓN MAESTRA: Renderiza la malla y activa herramientas
   */
  function renderizar(items, areaId, grado, periodo) {
    itemsActuales = items;
    contextoActual = { areaId, grado, periodo };

    // Captura de elementos asegurada en el momento de la consulta
    const resPrincipal = document.getElementById('resultados-principal');
    const herramientas = document.getElementById('herramientas-resultados');
    const inputBusqueda = document.getElementById('input-busqueda');

    // 1. Mostrar contenedores
    resPrincipal.classList.remove('ocultar');
    herramientas.classList.remove('herramientas-ocultas');
    
    // 2. Limpiar búsqueda anterior al consultar algo nuevo
    if (inputBusqueda) inputBusqueda.value = '';

    // 3. Dibujar por primera vez
    dibujarHTML(items);

    // 4. Activar el escuchador de búsqueda (Mejora: Usamos 'input' para máxima compatibilidad)
    if (inputBusqueda) {
      // Eliminamos cualquier listener previo para no duplicar procesos
      inputBusqueda.oninput = (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        // Filtrado profundo sobre los datos originales
        const filtrados = itemsActuales.filter(item => {
          const contenidoTextual = JSON.stringify(item).toLowerCase();
          return contenidoTextual.includes(term);
        });

        dibujarHTML(filtrados);
      };
    }
  }

  /**
   * Genera el HTML basado en el tipo de área
   */
  function dibujarHTML(items) {
    const containerMalla = document.getElementById('contenedor-malla');
    if (!containerMalla) return;

    containerMalla.innerHTML = '';

    if (!items || items.length === 0) {
      containerMalla.innerHTML = `
        <div class="sin-resultados-caja">
          <p>🔍 No se hallaron coincidencias para su búsqueda.</p>
        </div>
      `;
      return;
    }

    const html = items.map(item => {
      if (contextoActual.areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item);
      } else {
        return plantillaAcademica(item, contextoActual.grado, contextoActual.periodo);
      }
    }).join('');

    containerMalla.innerHTML = html;
  }

  /**
   * PLANTILLA: Áreas del Núcleo Común (Matemáticas, Lenguaje, Sociales, etc.)
   */
  function plantillaAcademica(item, grado, periodo) {
    const areaSocioNombre = "Proyecto Socioemocional";
    const tipoMalla = window.APP_CONFIG.TIPO_MALLA;
    const socioData = window.MallasData?.[areaSocioNombre]?.[grado]?.[tipoMalla]?.periodos?.[periodo];
    const infoSocio = socioData && socioData.length > 0 ? socioData[0] : null;

    let bloqueECO = '';
    if (infoSocio) {
      const habs = infoSocio.Habilidades ? infoSocio.Habilidades.map(h => `<div>${h}</div>`).join('') : '';
      const evids = infoSocio.evidencias_de_desempeno ? infoSocio.evidencias_de_desempeno.map(e => `<div>${e}</div>`).join('') : '';
      
      bloqueECO = `
        <div class="fila-separador-eco">Responsabilidad Socioemocional Proyecto ECO</div>
        <div class="seccion-eco-integrada">
          <div class="eco-badge">Cátedra ECO</div>
          <div class="campo"><strong>Eje Central:</strong> ${infoSocio.eje_central || ''}</div>
          <div class="campo"><strong>Habilidades:</strong> <div style="margin-top:5px;">${habs}</div></div>
          <div class="campo"><strong>Evidencias ECO:</strong> <div style="margin-top:5px;">${evids}</div></div>
        </div>
      `;
    }

    // Nombres dinámicos para el botón de diccionario
    let nombreGrado = grado + "°";
    if (grado === "0") nombreGrado = "Transición";
    if (grado === "-1") nombreGrado = "Jardín";

    return `
      <div class="item-malla">
        <h3>${item.componente || 'General'}</h3>
        <div class="item-malla-contenido">
          ${item.estandar ? `<div class="campo"><strong>Estándar Curricular:</strong><div>${item.estandar}</div></div>` : ''}
          ${item.dba ? `<div class="campo"><strong>Derechos Básicos (DBA):</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : item.dba}</div></div>` : ''}
          ${item.evidencias ? `<div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : item.evidencias}</div></div>` : ''}
          ${item.saberes ? `<div class="campo"><strong>Saberes y Temas:</strong><div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : item.saberes}</div></div>` : ''}
          ${item.tareas_dce ? `<div class="campo"><strong>Tareas DCE:</strong><div>${item.tareas_dce}</div></div>` : ''}
          ${item.fuente ? `<div class="campo"><strong>Fuente:</strong><div style="font-style:italic;">${item.fuente}</div></div>` : ''}
          ${bloqueECO}
          <div class="dic-link-container">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO - ${nombreGrado}</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * PLANTILLA: Área Socioemocional Pura
   */
  function plantillaSocioemocional(item) {
    const habs = item.Habilidades ? item.Habilidades.map(h => `<li>${h}</li>`).join('') : '';
    const evids = item.evidencias_de_desempeno ? item.evidencias_de_desempeno.map(e => `<li>${e}</li>`).join('') : '';
    return `
      <div class="item-malla socioemocional">
        <h3>${item.competencia || 'Competencia ECO'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Eje Central:</strong><div>${item.eje_central || ''}</div></div>
          ${item.estandar ? `<div class="campo"><strong>Estándar:</strong><div>${item.estandar}</div></div>` : ''}
          ${habs ? `<div class="campo"><strong>Habilidades:</strong><ul>${habs}</ul></div>` : ''}
          ${evids ? `<div class="campo"><strong>Evidencias:</strong><ul>${evids}</ul></div>` : ''}
          ${item.orientacion_bateria ? `<div class="campo"><strong>Orientación:</strong><div>${item.orientacion_bateria}</div></div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Control del Indicador de Carga
   */
  function setCargando(estado) {
    const loading = document.getElementById('loading-overlay');
    const resPrincipal = document.getElementById('resultados-principal');
    if (!loading) return;

    if (estado) {
      loading.classList.remove('loading-oculto');
      if (resPrincipal) resPrincipal.classList.add('ocultar');
    } else {
      loading.classList.add('loading-oculto');
    }
  }

  // Evento de Impresión Global
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-imprimir') {
      window.print();
    }
  });

  return { renderizar, setCargando };

})();
