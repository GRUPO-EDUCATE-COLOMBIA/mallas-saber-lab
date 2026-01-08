// FILE: js/render-engine.js | VERSION: v7.6 Stable

window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  function validarDato(dato) {
    const msg = '<em style="color:#999;font-weight:400;">Información en proceso de revisión...</em>';
    if (!dato || dato === "") return msg;
    if (Array.isArray(dato)) return dato.length > 0 ? dato.join('<br><br>') : msg;
    return dato;
  }

  function renderizar(items, areaId, grado, periodo) {
    const resSec = document.getElementById('resultados-principal');
    if (resSec) resSec.classList.add('mostrar-block');
    if (!containerMalla) return;

    containerMalla.innerHTML = items.map(item => {
      if (areaId === "proyecto-socioemocional") return plantillaSocioemocional(item, grado);
      return plantillaAcademica(item, areaId, grado, periodo);
    }).join('');
  }

  /**
   * PLANTILLA ACADÉMICA CON FICHAS DOBLES DE CIERRE
   */
  function plantillaAcademica(item, areaId, grado, periodo) {
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const config = window.APP_CONFIG.AREAS[areaId];
    const llaveNormal = normalizarTexto(config.nombre);
    
    // CRUCE DCE (Normalizado)
    const llaveDCE = `tareas_dce_${llaveNormal}`;
    const dceData = window.MallasData[llaveDCE]?.[grado]?.[tipo];
    const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    const infoDCE = dcePer?.componentes?.find(c => normalizarTexto(c.nombre) === normalizarTexto(item.componente || item.competencia));

    // CRUCE ECO (Normalizado)
    const llaveEco = normalizarTexto(window.APP_CONFIG.AREAS["proyecto-socioemocional"].nombre);
    const ecoPer = window.MallasData[llaveEco]?.[grado]?.[tipo]?.periodos?.[periodo];
    const infoECO = (ecoPer && Array.isArray(ecoPer) && ecoPer.length > 0) ? ecoPer[0] : null;

    return `
      <div class="item-malla">
        <!-- FRANJA DE TÍTULO PRINCIPAL -->
        <div class="franja-titulo-principal" style="background-color: ${config.color};">
            ${item.componente || item.competencia || 'General'}
        </div>
        
        <div class="item-malla-contenido">
          <!-- BLOQUE ACADÉMICO -->
          <div class="campo"><strong>Estándar Curricular:</strong><div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${validarDato(item.dba)}</div></div>
          <div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${validarDato(item.evidencias)}</div></div>
          <div class="campo"><strong>Saberes / Contenidos:</strong><div>${validarDato(item.saberes)}</div></div>

          <!-- CONTENEDOR DE FICHAS DOBLES DE CIERRE (HITO 3) -->
          <div class="contenedor-fichas-cierre">
            
            <!-- FICHA 1: GUÍA DIDÁCTICA (DCE) -->
            <div class="ficha-cierre ficha-dce">
              <div class="ficha-header ficha-header-dce">
                <span>💡</span> GUÍA DIDÁCTICA: ${infoDCE ? infoDCE.la_estrategia : 'En proceso'}
              </div>
              <div class="ficha-body">
                <div class="campo"><strong>Reto Sugerido:</strong><div>${validarDato(infoDCE?.un_reto_sugerido)}</div></div>
                <div class="campo"><strong>Ruta de Exploración:</strong>
                  <ul style="margin-left:20px; list-style:circle;">
                    <li><strong>Explorar:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.explorar)}</li>
                    <li><strong>Visual:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.visual)}</li>
                    <li><strong>Producción:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.produccion)}</li>
                  </ul>
                </div>
                <div class="campo"><strong>Para Pensar:</strong><div>${validarDato(infoDCE?.para_pensar)}</div></div>
                <div class="campo"><strong>Pistas del Éxito:</strong><div>${validarDato(infoDCE?.pistas_del_exito)}</div></div>
                <div class="campo"><strong>Un Refuerzo:</strong><div>${validarDato(infoDCE?.un_refuerzo)}</div></div>
              </div>
            </div>

            <!-- FICHA 2: RESPONSABILIDAD ECO (ECO) -->
            <div class="ficha-cierre ficha-eco">
              <div class="ficha-header ficha-header-eco">
                <span>🧠</span> RESPONSABILIDAD SOCIOEMOCIONAL ECO
              </div>
              <div class="ficha-body">
                <div class="campo"><strong>Eje Central:</strong><div>${validarDato(infoECO?.eje_central)}</div></div>
                <div class="campo"><strong>Habilidades:</strong><div>${validarDato(infoECO?.Habilidades)}</div></div>
                <div class="campo"><strong>Evidencias de Desempeño:</strong><div>${validarDato(infoECO?.evidencias_de_desempeno)}</div></div>
              </div>
            </div>

          </div><!-- Fin Contenedor Fichas -->

          <div style="text-align:center; margin-top:2rem;">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  function plantillaSocioemocional(item, grado) {
    return `
      <div class="item-malla">
        <div class="franja-titulo-principal" style="background-color: var(--eco-purple);">
            ${item.competencia || 'Competencia Socioemocional'}
        </div>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estandar de Formación:</strong> <div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>Eje Central del Proceso:</strong> <div>${validarDato(item.eje_central)}</div></div>
          <div class="campo"><strong>Habilidades a Fortalecer:</strong> <div style="background:white; padding:20px; border-radius:10px; border:1px solid #eee; border-left:5px solid var(--eco-purple);">${validarDato(item.Habilidades)}</div></div>
          <div class="campo"><strong>Evidencias ECO:</strong> <div>${validarDato(item.evidencias_de_desempeno)}</div></div>
          <div style="text-align:center; margin-top:2rem;">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  function setCargando(estado) { 
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.classList.toggle('mostrar-flex', estado);
  }

  return { renderizar, setCargando };
})();
// END OF FILE: js/render-engine.js | VERSION: v7.6 Stable
