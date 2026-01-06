// js/render-engine.js

window.RenderEngine = (function() {

  const containerMalla = document.getElementById('contenedor-malla');
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const loading = document.getElementById('loading-overlay');

  let contextoActual = { areaId: '', grado: '', periodo: '' };

  function renderizar(items, areaId, grado, periodo) {
    contextoActual = { areaId, grado, periodo };
    resPrincipal.classList.remove('ocultar');
    herramientas.classList.remove('herramientas-ocultas');
    dibujarHTML(items);
    vincularAcordeones();
  }

  function dibujarHTML(items) {
    containerMalla.innerHTML = '';
    if (!items || items.length === 0) {
      containerMalla.innerHTML = '<p class="sin-resultados">No se hallaron registros.</p>';
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

  function plantillaAcademica(item, grado, periodo) {
    // 1. Cruce Socioemocional
    const socioData = window.MallasData?.["Proyecto Socioemocional"]?.[grado]?.["4_periodos"]?.periodos?.[periodo];
    const infoSocio = socioData && socioData.length > 0 ? socioData[0] : null;

    // 2. Cruce Orientación Metodológica (DCE Externo)
    const nombreArea = window.APP_CONFIG.AREAS[contextoActual.areaId].nombre;
    const tareasDCE = window.MallasData?.[`Tareas_DCE_${nombreArea}`]?.[grado]?.["4_periodos"]?.periodos?.[periodo];
    const tareaEspecifica = tareasDCE ? tareasDCE[item.componente] : (item.tareas_dce || null);

    return `
      <div class="item-malla">
        <h3>${item.componente || 'General'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estándar Curricular:</strong><div>${item.estandar || ''}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : (item.dba || '')}</div></div>
          <div class="campo"><strong>Evidencias:</strong><div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : (item.evidencias || '')}</div></div>
          <div class="campo"><strong>Saberes:</strong><div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : (item.saberes || '')}</div></div>

          <!-- ACORDEÓN DCE -->
          ${tareaEspecifica ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <span class="indicador-mano">👉</span>
                <div class="acordeon-icono-btn dce-color">💡</div>
                <div class="acordeon-titulo dce-texto">Caja de Orientaciones Metodológicas</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">${tareaEspecifica}</div>
              </div>
            </div>
          ` : ''}

          <!-- ACORDEÓN ECO -->
          ${infoSocio ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <span class="indicador-mano">👉</span>
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
        
        // Cerrar otros
        const padre = this.closest('.item-malla-contenido');
        padre.querySelectorAll('.acordeon-panel').forEach(p => p.classList.remove('abierto'));
        padre.querySelectorAll('.indicador-mano').forEach(m => m.style.visibility = 'visible');

        if (!estaAbierto) {
          panel.classList.add('abierto');
          this.querySelector('.indicador-mano').style.visibility = 'hidden';
        }
      };
    });
  }

  function setCargando(estado) {
    const loader = document.getElementById('loading-overlay');
    if (loader) estado ? loader.classList.remove('loading-oculto') : loader.classList.add('loading-oculto');
  }

  return { renderizar, setCargando };
})();
