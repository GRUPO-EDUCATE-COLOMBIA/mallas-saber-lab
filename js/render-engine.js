// js/render-engine.js - v5.9 STABLE (Integridad Total de Datos)

window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  /**
   * Valida si un dato existe y tiene contenido.
   * Si no, devuelve el mensaje de "revisión" en itálica y gris.
   */
  function validarDato(dato) {
    const mensajeRevision = '<em style="color: #888; font-weight: 400;">Información en proceso de revisión...</em>';
    
    if (dato === null || dato === undefined || dato === "") {
      return mensajeRevision;
    }
    
    if (Array.isArray(dato)) {
      return dato.length > 0 ? dato.join('<br><br>') : mensajeRevision;
    }
    
    return dato;
  }

  /**
   * Renderizador Principal
   */
  function renderizar(items, areaId, grado, periodo) {
    // Mostrar herramientas (impresión)
    document.getElementById('herramientas-resultados').classList.add('mostrar-flex');
    
    containerMalla.innerHTML = items.map(item => {
      if (areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item, grado);
      } else {
        return plantillaAcademica(item, areaId, grado, periodo);
      }
    }).join('');

    vincularAcordeones();
  }

  /**
   * PLANTILLA ACADÉMICA (Matemáticas, Lenguaje, etc.)
   * Integra Capa Académica + Capa DCE + Capa ECO
   */
  function plantillaAcademica(item, areaId, grado, periodo) {
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const nombreArea = window.APP_CONFIG.AREAS[areaId].nombre;
    const colorArea = window.APP_CONFIG.AREAS[areaId].color;

    // --- DATA JOINING: CAPA DCE (ORIENTACIONES MÉDICAS) ---
    const llaveT = `Tareas_DCE_${nombreArea}`;
    const dceData = window.MallasData[llaveT]?.[grado]?.[tipo];
    const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    const infoDCE = dcePer?.componentes?.find(c => c.nombre === (item.componente || item.competencia));

    // --- DATA JOINING: CAPA ECO (TRANSVERSAL SOCIOEMOCIONAL) ---
    const nombreEco = window.APP_CONFIG.AREAS["proyecto-socioemocional"].nombre;
    const ecoData = window.MallasData[nombreEco]?.[grado]?.[tipo];
    const ecoPer = ecoData?.periodos?.[periodo];
    const infoECO = ecoPer && ecoPer.length > 0 ? ecoPer[0] : null;

    return `
      <div class="item-malla">
        <h3>${item.componente || item.competencia || 'General'}</h3>
        
        <div class="item-malla-contenido">
          <!-- 1. BLOQUE ACADÉMICO BASE -->
          <div class="campo"><strong>Estándar Curricular:</strong><div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${validarDato(item.dba)}</div></div>
          <div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${validarDato(item.evidencias)}</div></div>
          <div class="campo"><strong>Saberes / Contenidos:</strong><div>${validarDato(item.saberes)}</div></div>

          <!-- 2. BLOQUE DCE (GUÍA DIDÁCTICA COMPLETA) -->
          ${infoDCE ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn" style="background-color:${colorArea};">💡</div>
                <div class="acordeon-titulo" style="color:${colorArea};">GUÍA DIDÁCTICA: ${infoDCE.la_estrategia || 'Estrategia de Área'}</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="campo"><strong>La Estrategia:</strong><div>${validarDato(infoDCE.la_estrategia)}</div></div>
                  <div class="campo"><strong>Un Reto Sugerido:</strong><div>${validarDato(infoDCE.un_reto_sugerido)}</div></div>
                  
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

          <!-- 3. BLOQUE ECO (TRANSVERSAL SOCIOEMOCIONAL COMPLETO) -->
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

          <!-- 4. RECURSOS ADICIONALES -->
          <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 15px;">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * PLANTILLA CUANDO SE CONSULTA DIRECTAMENTE EL ÁREA SOCIOEMOCIONAL
   */
  function plantillaSocioemocional(item, grado) {
    return `
      <div class="item-malla">
        <h3>${item.competencia || 'Competencia Socioemocional'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estandar de Formación:</strong> <div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>Eje Central del Proceso:</strong> <div>${validarDato(item.eje_central)}</div></div>
          
          <div class="campo"><strong>Habilidades a Fortalecer:</strong> 
            <div style="background: #f8f4fb; padding: 15px; border-radius: 8px; border-left: 5px solid var(--eco-purple);">
              ${validarDato(item.Habilidades)}
            </div>
          </div>
          
          <div class="campo"><strong>Evidencias de Desempeño ECO:</strong> 
            <div>${validarDato(item.evidencias_de_desempeno)}</div>
          </div>

          <div class="campo"><strong>Orientación Batería:</strong> <div>${validarDato(item.orientacion_bateria)}</div></div>

          <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 15px;">
             <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Lógica de Interacción de Acordeones
   */
  function vincularAcordeones() {
    document.querySelectorAll('.acordeon-header').forEach(h => {
      h.onclick = function() {
        const panel = this.nextElementSibling;
        const abierto = panel.classList.contains('abierto');
        
        // Opcional: Cerrar otros acordeones del mismo item para mantener limpieza
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
