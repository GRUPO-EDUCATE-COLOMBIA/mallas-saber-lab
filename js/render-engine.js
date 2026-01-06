// js/render-engine.js - v5.6 (Motor de Renderizado con Integridad de Datos)

window.RenderEngine = (function() {

  const containerMalla = document.getElementById('contenedor-malla');
  const loading = document.getElementById('loading-overlay');

  let contextoActual = { areaId: '', grado: '', periodo: '' };

  /**
   * FUNCIÓN MAESTRA DE RENDERIZADO
   */
  function renderizar(items, areaId, grado, periodo) {
    contextoActual = { areaId, grado, periodo };

    dibujarHTML(items);
    vincularAcordeones();
  }

  /**
   * Genera el HTML recorriendo cada ítem del JSON académico
   */
  function dibujarHTML(items) {
    containerMalla.innerHTML = '';
    
    if (!items || items.length === 0) {
      containerMalla.innerHTML = '<p class="sin-resultados">No se hallaron registros para los filtros seleccionados.</p>';
      return;
    }

    containerMalla.innerHTML = items.map(item => {
      // Si el área seleccionada es Socioemocional, usamos su plantilla específica
      if (contextoActual.areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item);
      } else {
        // Para todas las demás áreas (Mat, Leng, etc.) usamos la plantilla académica con cruces
        return plantillaAcademica(item, contextoActual.grado, contextoActual.periodo);
      }
    }).join('');
  }

  /**
   * PLANTILLA ACADÉMICA: Cruce con DCE y ECO Transversal
   */
  function plantillaAcademica(item, grado, periodo) {
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    
    // 1. Obtener datos de Orientación Metodológica (DCE)
    const nombreArea = window.APP_CONFIG.AREAS[contextoActual.areaId].nombre;
    const llaveT = `Tareas_DCE_${nombreArea}`;
    const dceData = window.MallasData[llaveT]?.[grado]?.[tipo];
    
    // Buscar el periodo y el componente correspondiente en el JSON DCE
    const dcePeriodo = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    const infoDCE = dcePeriodo?.componentes?.find(c => c.nombre === (item.componente || item.competencia));

    // 2. Obtener datos Socioemocionales (ECO) como capa transversal
    const nombreEco = window.APP_CONFIG.AREAS["proyecto-socioemocional"].nombre;
    const ecoData = window.MallasData[nombreEco]?.[grado]?.[tipo];
    const ecoPer = ecoData?.periodos?.[periodo];
    const infoECO = ecoPer && ecoPer.length > 0 ? ecoPer[0] : null;

    return `
      <div class="item-malla">
        <h3>${item.componente || item.competencia || 'General'}</h3>
        <div class="item-malla-contenido">
          
          <!-- BLOQUE ACADÉMICO BASE -->
          <div class="campo"><strong>Estándar Curricular:</strong><div>${item.estandar || ''}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : (item.dba || '')}</div></div>
          <div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : (item.evidencias || '')}</div></div>
          <div class="campo"><strong>Saberes / Contenidos:</strong><div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : (item.saberes || '')}</div></div>

          <!-- ACORDEÓN DCE (ESTRUCTURA COMPLETA) -->
          ${infoDCE ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn dce-color" style="background-color: ${window.APP_CONFIG.AREAS[contextoActual.areaId].color}">💡</div>
                <div class="acordeon-titulo" style="color: ${window.APP_CONFIG.AREAS[contextoActual.areaId].color}">Orientaciones: ${infoDCE.la_estrategia || ''}</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="campo"><strong>Reto Sugerido:</strong> <div>${infoDCE.un_reto_sugerido || ''}</div></div>
                  
                  <div class="campo"><strong>Ruta de Exploración:</strong>
                    <ul style="margin-left: 20px; list-style: square;">
                      <li><strong>Explorar:</strong> ${infoDCE.ruta_de_exploracion?.explorar || ''}</li>
                      <li><strong>Visualización:</strong> ${infoDCE.ruta_de_exploracion?.visual || ''}</li>
                      <li><strong>Producción:</strong> ${infoDCE.ruta_de_exploracion?.produccion || ''}</li>
                    </ul>
                  </div>

                  <div class="campo"><strong>Para Pensar (Preguntas):</strong>
                    <div>${infoDCE.para_pensar ? infoDCE.para_pensar.map(p => `• ${p}`).join('<br>') : ''}</div>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px dashed #ccc; padding-top: 15px; margin-top: 10px;">
                    <div><strong>Pistas del Éxito:</strong><br><small>${infoDCE.pistas_del_exito || ''}</small></div>
                    <div><strong>Un Refuerzo:</strong><br><small>${infoDCE.un_refuerzo || ''}</small></div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ACORDEÓN ECO (TRANSVERSALIDAD SOCIOEMOCIONAL) -->
          ${infoECO ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn eco-color" style="background-color: var(--eco-purple);">🧠</div>
                <div class="acordeon-titulo" style="color: var(--eco-purple);">Responsabilidad Socioemocional ECO</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="campo"><strong>Eje Central:</strong> <div>${infoECO.eje_central || ''}</div></div>
                  <div class="campo"><strong>Habilidades a desarrollar:</strong> 
                    <div>${infoECO.Habilidades ? infoECO.Habilidades.join(' • ') : ''}</div>
                  </div>
                  <div class="campo"><strong>Evidencias de Desempeño ECO:</strong> 
                    <div>${infoECO.evidencias_de_desempeno ? infoECO.evidencias_de_desempeno.join('<br>') : ''}</div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="dic-link-container">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * PLANTILLA CUANDO EL ÁREA PRINCIPAL ES SOCIOEMOCIONAL
   */
  function plantillaSocioemocional(item) {
    return `
      <div class="item-malla">
        <h3>${item.competencia || 'Competencia Socioemocional'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Eje Central:</strong> <div>${item.eje_central || ''}</div></div>
          <div class="campo"><strong>Habilidades:</strong> 
            <div>${item.Habilidades ? item.Habilidades.join('<br>') : ''}</div>
          </div>
          <div class="campo"><strong>Evidencias de Desempeño:</strong> 
            <div>${item.evidencias_de_desempeno ? item.evidencias_de_desempeno.join('<br>') : ''}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Vincula la funcionalidad de abrir/cerrar acordeones
   */
  function vincularAcordeones() {
    document.querySelectorAll('.acordeon-header').forEach(header => {
      header.onclick = function() {
        const panel = this.nextElementSibling;
        const estaAbierto = panel.classList.contains('abierto');
        
        // Cerrar otros acordeones en el mismo bloque para evitar saturación
        const padre = this.closest('.item-malla-contenido');
        padre.querySelectorAll('.acordeon-panel').forEach(p => p.classList.remove('abierto'));
        
        // Alternar estado
        if (!estaAbierto) panel.classList.add('abierto');
      };
    });
  }

  /**
   * Muestra/Oculta el spinner de carga
   */
  function setCargando(estado) {
    if (!loading) return;
    if (estado) {
      loading.classList.add('mostrar-flex');
    } else {
      loading.classList.remove('mostrar-flex');
    }
  }

  return { renderizar, setCargando };
})();
