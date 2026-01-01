// js/render-socio.js

/**
 * Renderiza la malla del Proyecto Socioemocional.
 * Diseño: Cabecera centrada y contenido vertical protegido.
 */
window.renderSocioemocional = function(items) {
  const container = document.getElementById('tabla-body-socio');
  if (!container) return;

  // Limpiar contenido previo
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se hallaron registros para los criterios socioemocionales.</p>';
    return;
  }

  // Generar HTML con la estructura de "Fila de Encabezado" para Socioemocional
  container.innerHTML = items.map(item => `
    <div class="item-malla socioemocional">
      <!-- Primera fila: Competencia centrada -->
      <h3>${item.competencia || 'Competencia Socioemocional'}</h3>
      
      <!-- Contenedor del contenido con fondo sutil -->
      <div class="item-malla-contenido">
        
        ${item.competencia_anual ? `
          <div class="campo">
            <strong>Competencia Anual:</strong>
            <div>${item.competencia_anual}</div>
          </div>
        ` : ''}

        ${item.estandar ? `
          <div class="campo">
            <strong>Estándar de Formación:</strong>
            <div>${item.estandar}</div>
          </div>
        ` : ''}
        
        ${item.eje_central ? `
          <div class="campo">
            <strong>Eje Central:</strong>
            <div>${item.eje_central}</div>
          </div>
        ` : ''}
        
        ${item.Habilidades && item.Habilidades.length > 0 ? `
          <div class="campo">
            <strong>Habilidades Desarrolladas:</strong>
            <ul>
              ${item.Habilidades.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${item.evidencias_de_desempeno && item.evidencias_de_desempeno.length > 0 ? `
          <div class="campo">
            <strong>Evidencias de Desempeño:</strong>
            <ul>
              ${item.evidencias_de_desempeno.map(ev => `<li>${ev}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${item.orientacion_bateria ? `
          <div class="campo">
            <strong>Orientación Batería:</strong>
            <div>${item.orientacion_bateria}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  // NOTA: Se ha eliminado toda lógica de selección o copia.
  // La inhabilitación es gestionada por las reglas de CSS.
};
