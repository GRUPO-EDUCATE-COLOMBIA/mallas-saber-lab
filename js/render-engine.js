// FILE: js/render-engine.js | VERSION: v6.4 Stable

window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  function validarDato(dato) {
    const mensajeRevision = '<em style="color: #888; font-weight: 400;">Información en proceso de revisión...</em>';
    if (dato === null || dato === undefined || dato === "") return mensajeRevision;
    if (Array.isArray(dato)) return dato.length > 0 ? dato.join('<br><br>') : mensajeRevision;
    return dato;
  }

  function renderizar(items, areaId, grado, periodo) {
    // DOBLE VERIFICACIÓN: Evitar error si el ID no existe en el HTML
    const herramientas = document.getElementById('herramientas-resultados');
    if (herramientas) {
        herramientas.classList.add('mostrar-flex');
    }
    
    if (!containerMalla) return;

    containerMalla.innerHTML = items.map(item => {
      if (areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item, grado);
      } else {
        return plantillaAcademica(item, areaId, grado, periodo);
      }
    }).join('');

    vincularAcordeones();
  }

  function plantillaAcademica(item, areaId, grado, periodo) {
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const nombreArea = window.APP_CONFIG.AREAS[areaId].nombre;
    const colorArea = window.APP_CONFIG.AREAS[areaId].color;

    const llaveT = `Tareas_DCE_${nombreArea}`;
    const dceData = window.MallasData[llaveT]?.[grado]?.[tipo];
    const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    const infoDCE = dcePer?.componentes?.find(c => c.nombre === (item.componente || item.competencia));

    const nombreEco = window.APP_CONFIG.AREAS["proyecto-socioemocional"].nombre;
    const ecoData = window.MallasData[nombreEco]?.[grado]?.[tipo];
    const ecoPer = ecoData?.periodos?.[periodo];
    const infoECO = ecoPer && ecoPer.length > 0 ? ecoPer[0] : null;

    return `
      <div class="item-malla">
        <h3>${item.componente || item.competencia || 'General'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estándar Curricular:</strong><div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${validarDato(item.dba)}</div></div>
          <div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${validarDato(item.evidencias)}</div></div>
          <div class="campo"><strong>Saberes / Contenidos:</strong><div>${validarDato(item.saberes)}</div></div>

          ${infoDCE ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn" style="background-color:${colorArea};">💡</div>
                <div class="acordeon-titulo" style="color:${colorArea};">GUÍA DIDÁCTICA: ${infoDCE.la_estrategia || 'Estrategia'}</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="campo"><strong>La Estrategia:</strong><div>${validarDato(infoDCE.la_estrategia)}</div></div>
                  <div class="campo"><strong>Reto Sugerido:</strong><div>${validarDato(infoDCE.un_reto_sugerido)}</div></div>
                  <div class="campo"><strong>Ruta de Exploración:</strong>
                    <ul style="margin-left:20px; list-style:square;">
                      <li><strong>Explorar:</strong> ${validarDato(infoDCE.ruta_de_exploracion?.explorar)}</li>
                      <li><strong>Visual:</strong> ${validarDato(infoDCE.ruta_de_exploracion?.visual)}</li>
                      <li><strong>Producción:</strong> ${validarDato(infoDCE.ruta_de_exploracion?.produccion)}</li>
                    </ul>
                  </div>
                  <div class="campo"><strong>Para Pensar:</strong><div>${validarDato(infoDCE.para_pensar)}</div></div>
                  <div class="campo"><strong>Pistas del Éxito:</strong><div>${validarDato(infoDCE.pistas_del_exito)}</div></div>
                  <div class="campo"><strong>Un Refuerzo:</strong><div>${validarDato(infoDCE.un_refuerzo)}</div></div>
                </div>
              </div>
            </div>` : ''}

          ${infoECO ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn" style="background-color:var(--eco-purple);">🧠</div>
                <div class="acordeon-titulo" style="color:var(--eco-purple);">RESPONSABILIDAD SOCIOEMOCIONAL ECO</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="campo"><strong>Eje Central:</strong><div>${validarDato(infoECO.eje_central)}</div></div>
                  <div class="campo"><strong>Habilidades a Desarrollar:</strong><div>${validarDato(infoECO.Habilidades)}</div></div>
                  <div class="campo"><strong>Evidencias de Desempeño:</strong><div>${validarDato(infoECO.evidencias_de_desempeno)}</div></div>
                </div>
              </div>
            </div>` : ''}

          <div style="margin-top: 15px;">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  function plantillaSocioemocional(item, grado) {
    return `
      <div class="item-malla">
        <h3>${item.competencia || 'Competencia Socioemocional'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estandar:</strong> <div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>Eje Central:</strong> <div>${validarDato(item.eje_central)}</div></div>
          <div class="campo"><strong>Habilidades:</strong> <div style="background:#f8f4fb; padding:10px; border-radius:8px;">${validarDato(item.Habilidades)}</div></div>
          <div class="campo"><strong>Evidencias ECO:</strong> <div>${validarDato(item.evidencias_de_desempeno)}</div></div>
          <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
        </div>
      </div>
    `;
  }

  function vincularAcordeones() {
    document.querySelectorAll('.acordeon-header').forEach(h => {
      h.onclick = function() {
        const panel = this.nextElementSibling;
        const abierto = panel.classList.contains('abierto');
        this.closest('.item-malla-contenido').querySelectorAll('.acordeon-panel').forEach(p => p.classList.remove('abierto'));
        if (!abierto) panel.classList.add('abierto');
      };
    });
  }

  function setCargando(estado) { 
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.classList.toggle('mostrar-flex', estado);
  }

  return { renderizar, setCargando };
})();
// END OF FILE: js/render-engine.js | VERSION: v6.4 Stable
