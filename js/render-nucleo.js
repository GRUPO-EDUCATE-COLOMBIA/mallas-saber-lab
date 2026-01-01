// js/render-nucleo.js

/**
 * Renderiza la malla de las áreas del Núcleo Común con integración ECO.
 * @param {Array} items - Los componentes académicos a mostrar.
 * @param {String} grado - El grado seleccionado para el cruce y diccionario.
 * @param {String} periodo - El período seleccionado para el cruce de datos.
 */
window.renderTablaMallas = function(items, grado, periodo) {
  const container = document.getElementById('tabla-body');
  if (!container) return;

  // Limpiar contenido previo
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se hallaron registros para los criterios seleccionados.</p>';
    return;
  }

  // --- LÓGICA DE INTEGRACIÓN SOCIOEMOCIONAL ECO ---
  const areaSocioNombre = "Proyecto Socioemocional";
  const tipoMalla = "4_periodos"; // Estándar para este requerimiento
  
  // Accedemos a los datos socioemocionales cargados en memoria que coincidan con grado y periodo
  const socioDataRaw = window.MallasData?.[areaSocioNombre]?.[grado]?.[tipoMalla]?.periodos?.[periodo];
  
  // Tomamos el primer bloque socioemocional del periodo (Responsabilidad Transversal)
  const infoSocio = socioDataRaw && socioDataRaw.length > 0 ? socioDataRaw[0] : null;

  // --- LÓGICA DE ENLACE AL DICCIONARIO ECO (Solo grados 1 a 5) ---
  let urlDiccionario = null;
  const gradoNum = parseInt(grado);
  if (gradoNum >= 1 && gradoNum <= 5) {
    // La ruta se construye según lo solicitado: eco/diccionario/eco_dic_[grado].html
    urlDiccionario = `eco/diccionario/eco_dic_${gradoNum}.html`;
  }

  // Generar HTML con la integración
  container.innerHTML = items.map(item => {
    
    // 1. Preparar bloque de integración Socioemocional
    let contenidoSocioHTML = '';
    if (infoSocio) {
      contenidoSocioHTML = `
        <div class="seccion-eco-integrada">
          <div class="eco-badge">Aporte Socioemocional ECO</div>
          <div class="eco-campo-dato"><strong>Eje Central:</strong> ${infoSocio.eje_central || 'No definido'}</div>
          <div class="eco-campo-dato"><strong>Habilidades:</strong> ${infoSocio.Habilidades ? infoSocio.Habilidades.join(' • ') : 'No definidas'}</div>
          <div class="eco-campo-dato"><strong>Evidencias de Desempeño:</strong> ${infoSocio.evidencias_de_desempeno ? infoSocio.evidencias_de_desempeno.join(' • ') : 'No definidas'}</div>
        </div>
      `;
    } else {
      contenidoSocioHTML = '<p class="texto-vacio">Información socioemocional no disponible para este período.</p>';
    }

    // 2. Preparar bloque de Diccionario
    let contenidoDiccionarioHTML = '';
    if (urlDiccionario) {
      contenidoDiccionarioHTML = `
        <div class="dic-link-container">
          <a href="${urlDiccionario}" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO - Grado ${gradoNum}°</a>
        </div>
      `;
    } else {
      contenidoDiccionarioHTML = '<p class="texto-vacio">El diccionario ECO está disponible de 1° a 5° grado.</p>';
    }

    return `
      <div class="item-malla">
        <!-- Primera fila: Nombre del Componente centrado -->
        <h3>${item.componente || 'General'}</h3>
        
        <div class="item-malla-contenido">
          
          <!-- Bloques Académicos -->
          <div class="campo">
            <strong>Estándar Curricular:</strong>
            <div>${item.estandar || 'No disponible'}</div>
          </div>
          
          <div class="campo">
            <strong>Derechos Básicos de Aprendizaje (DBA):</strong>
            <div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : (item.dba || 'No disponible')}</div>
          </div>
          
          <div class="campo">
            <strong>Evidencias de Aprendizaje:</strong>
            <div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : (item.evidencias || 'No disponible')}</div>
          </div>
          
          <div class="campo">
            <strong>Saberes y Temas Principales:</strong>
            <div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : (item.saberes || 'No disponible')}</div>
          </div>

          <!-- INTEGRACIÓN CÁTEDRA SOCIOEMOCIONAL ECO -->
          <div class="campo integracion-eco">
            <strong class="label-eco">Responsabilidad Socioemocional (Proyecto ECO):</strong>
            ${contenidoSocioHTML}
          </div>

          <!-- ENLACE AL DICCIONARIO ECO -->
          <div class="campo integracion-diccionario">
            <strong class="label-eco">Recursos Pedagógicos:</strong>
            ${contenidoDiccionarioHTML}
          </div>

        </div>
      </div>
    `;
  }).join('');
};
