// js/render-engine.js

/**
 * MOTOR DE RENDERIZADO UNIFICADO v4.1
 * Gestiona acordeones con pulso, cruce de subcarpetas y botones institucionales.
 */
window.RenderEngine = (function() {

  const containerMalla = document.getElementById('contenedor-malla');
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const loading = document.getElementById('loading-overlay');

  let contextoActual = { areaId: '', grado: '', periodo: '' };

  /**
   * FUNCIÓN MAESTRA DE DIBUJADO
   */
  function renderizar(items, areaId, grado, periodo) {
    contextoActual = { areaId, grado, periodo };

    // Activar visibilidad de capas usando las nuevas clases del CSS v4.1
    resPrincipal.classList.add('mostrar-block');
    herramientas.classList.add('mostrar-flex');
    
    dibujarHTML(items);
    vincularAcordeones();
  }

  function dibujarHTML(items) {
    containerMalla.innerHTML = '';
    if (!items || items.length === 0) {
      containerMalla.innerHTML = '<p class="sin-resultados">No se hallaron registros coincidentes.</p>';
      return;
    }
    containerMalla.innerHTML = items.map(item => {
      if (contextoActual.areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item);
      } else {
        return plantillaAcademica(item, contextoActual.grado, contextoActual.periodo);
      }
    }).join('');
  }

  /**
   * PLANTILLA ACADÉMICA: Cruce con subcarpeta 'tareas_dce' y Proyecto ECO
   */
  function plantillaAcademica(item, grado, periodo) {
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    
    // 1. Cruce con Proyecto ECO
    const socioData = window.MallasData?.["Proyecto Socioemocional"]?.[grado]?.[tipo]?.periodos?.[periodo];
    const infoSocio = socioData && socioData.length > 0 ? socioData[0] : null;

    // 2. Cruce con Orientación Metodológica (Tareas en subcarpeta)
    const nombreArea = window.APP_CONFIG.AREAS[contextoActual.areaId].nombre;
    const llaveT = `Tareas_DCE_${nombreArea}`;
    const tareasPeriodo = window.MallasData?.[llaveT]?.[grado]?.[tipo]?.periodos?.[periodo];
    
    let contenidoDCE = item.tareas_dce || null;

    if (tareasPeriodo) {
      // Normalización para asegurar el cruce exacto de nombres
      const norm = (t) => String(t).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const compBuscado = norm(item.componente || '');
      const llaveEncontrada = Object.keys(tareasPeriodo).find(k => norm(k) === compBuscado);
      if (llaveEncontrada) contenidoDCE = tareasPeriodo[llaveEncontrada];
    }

    return `
      <div class="item-malla">
        <h3>${item.componente || 'General'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estándar Curricular:</strong><div>${item.estandar || ''}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : (item.dba || '')}</div></div>
          <div class="campo"><strong>Evidencias:</strong><div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : (item.evidencias || '')}</div></div>
          <div class="campo"><strong>Saberes:</strong><div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : (item.saberes || '')}</div></div>

          <!-- ACORDEÓN DCE (METODOLOGÍA) -->
          ${contenidoDCE ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn dce-color">💡</div>
                <div class="acordeon-titulo dce-texto">Caja de Orientaciones Metodológicas</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">${contenidoDCE}</div>
              </div>
            </div>
          ` : ''}

          <!-- ACORDEÓN ECO (TRANSVERSAL) -->
          ${infoSocio ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn eco-color">🧠</div>
                <div class="acordeon-titulo eco-texto">Responsabilidad Socioemocional Proyecto ECO</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="eco-badge">Cátedra ECO</div>
                  <div class="campo"><strong>Eje Central:</strong><div>${infoSocio.eje_central || ''}</div></div>
                  <div class="campo"><strong>Habilidades:</strong><div>${infoSocio.Habilidades ? infoSocio.Habilidades.join('<br>') : ''}</div></div>
                  <div class="campo"><strong>Evidencias ECO:</strong><div>${infoSocio.evidencias_de_desempeno ? infoSocio.evidencias_de_desempeno.join('<br>') : ''}</div></div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- BOTÓN DICCIONARIO (TEAL) -->
          <div class="dic-link-container">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  function plantillaSocioemocional(item) {
    return `
      <div class="item-malla">
        <h3>${item.competencia || 'Competencia ECO'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Eje Central:</strong><div>${item.eje_central || ''}</div></div>
          <div class="campo"><strong>Habilidades:</strong><div>${item.Habilidades ? item.Habilidades.join('<br>') : ''}</div></div>
          <div class="campo"><strong>Evidencias:</strong><div>${item.evidencias_de_desempeno ? item.evidencias_de_desempeno.join('<br>') : ''}</div></div>
        </div>
      </div>
    `;
  }

  function vincularAcordeones() {
    document.querySelectorAll('.acordeon-header').forEach(header => {
      header.onclick = function() {
        const panel = this.nextElementSibling;
        const estaAbierto = panel.classList.contains('abierto');
        // Limpieza: cerramos otros acordeones del mismo bloque
        const padre = this.closest('.item-malla-contenido');
        padre.querySelectorAll('.acordeon-panel').forEach(p => p.classList.remove('abierto'));
        if (!estaAbierto) panel.classList.add('abierto');
      };
    });
  }

  function setCargando(estado) {
    if (!loading) return;
    if (estado) {
      loading.classList.add('mostrar-flex');
      resPrincipal.classList.remove('mostrar-block');
    } else {
      loading.classList.remove('mostrar-flex');
    }
  }

  return { renderizar, setCargando };
})();
