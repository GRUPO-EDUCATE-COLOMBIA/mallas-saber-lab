// js/render-engine.js

window.RenderEngine = (function() {

  const containerMalla = document.getElementById('contenedor-malla');
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const inputBusqueda = document.getElementById('input-busqueda');
  const loading = document.getElementById('loading-overlay');
  const btnImprimir = document.getElementById('btn-imprimir');

  let itemsActuales = [];
  let contextoActual = { areaId: '', grado: '', periodo: '' };

  function renderizar(items, areaId, grado, periodo) {
    itemsActuales = items; // Guardamos los items de la consulta original
    contextoActual = { areaId, grado, periodo };
    inputBusqueda.value = ''; // Limpiar buscador al hacer nueva consulta

    resPrincipal.classList.remove('ocultar');
    herramientas.classList.remove('herramientas-ocultas');
    
    dibujarHTML(items);
  }

  function dibujarHTML(items) {
    containerMalla.innerHTML = '';

    if (!items || items.length === 0) {
      containerMalla.innerHTML = '<p class="sin-resultados">No se hallaron registros coincidentes.</p>';
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

    return `
      <div class="item-malla">
        <h3>${item.componente || 'General'}</h3>
        <div class="item-malla-contenido">
          ${item.estandar ? `<div class="campo"><strong>Estándar Curricular:</strong><div>${item.estandar}</div></div>` : ''}
          ${item.dba ? `<div class="campo"><strong>DBA:</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : item.dba}</div></div>` : ''}
          ${item.evidencias ? `<div class="campo"><strong>Evidencias:</strong><div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : item.evidencias}</div></div>` : ''}
          ${item.saberes ? `<div class="campo"><strong>Saberes:</strong><div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : item.saberes}</div></div>` : ''}
          ${item.tareas_dce ? `<div class="campo"><strong>Tareas DCE:</strong><div>${item.tareas_dce}</div></div>` : ''}
          ${bloqueECO}
          <div class="dic-link-container">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  function plantillaSocioemocional(item) {
    const habs = item.Habilidades ? item.Habilidades.map(h => `<li>${h}</li>`).join('') : '';
    const evids = item.evidencias_de_desempeno ? item.evidencias_de_desempeno.map(e => `<li>${e}</li>`).join('') : '';
    return `
      <div class="item-malla">
        <h3>${item.competencia || 'Competencia ECO'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Eje Central:</strong><div>${item.eje_central || ''}</div></div>
          <div class="campo"><strong>Habilidades:</strong><ul>${habs}</ul></div>
          <div class="campo"><strong>Evidencias:</strong><ul>${evids}</ul></div>
        </div>
      </div>
    `;
  }

  // --- LÓGICA DE BÚSQUEDA CORREGIDA ---
  inputBusqueda.addEventListener('keyup', () => {
    const term = inputBusqueda.value.toLowerCase();
    
    // Filtramos sobre la copia de items guardada en la consulta original
    const filtrados = itemsActuales.filter(item => {
      const contenidoTextual = JSON.stringify(item).toLowerCase();
      return contenidoTextual.includes(term);
    });

    dibujarHTML(filtrados);
  });

  function setCargando(estado) {
    if (estado) {
      loading.classList.remove('loading-oculto');
      resPrincipal.classList.add('ocultar');
      herramientas.classList.add('herramientas-ocultas');
    } else {
      loading.classList.add('loading-oculto');
    }
  }

  btnImprimir.addEventListener('click', () => window.print());

  return { renderizar, setCargando };

})();
