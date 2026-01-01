// js/render-nucleo.js

/**
 * Renderiza la malla de las áreas del Núcleo Común.
 * Diseño: Cabecera centrada y contenido vertical protegido.
 */
window.renderTablaMallas = function(items) {
  const container = document.getElementById('tabla-body');
  if (!container) return;

  // Limpiar contenido previo
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se hallaron registros para los criterios seleccionados.</p>';
    return;
  }

  // Generar HTML con la nueva estructura de "Fila de Encabezado"
  container.innerHTML = items.map(item => `
    <div class="item-malla">
      <!-- Primera fila: Nombre del Componente centrado -->
      <h3>${item.componente || 'General'}</h3>
      
      <!-- Contenedor del contenido con fondo sutil -->
      <div class="item-malla-contenido">
        
        ${item.estandar ? `
          <div class="campo">
            <strong>Estándar Curricular:</strong>
            <div>${item.estandar}</div>
          </div>
        ` : ''}
        
        ${item.dba && item.dba.length > 0 ? `
          <div class="campo">
            <strong>Derechos Básicos de Aprendizaje (DBA):</strong>
            <div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : item.dba}</div>
          </div>
        ` : ''}
        
        ${item.evidencias && item.evidencias.length > 0 ? `
          <div class="campo">
            <strong>Evidencias de Aprendizaje:</strong>
            <div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : item.evidencias}</div>
          </div>
        ` : ''}
        
        ${item.saberes && item.saberes.length > 0 ? `
          <div class="campo">
            <strong>Saberes y Temas Principales:</strong>
            <div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : item.saberes}</div>
          </div>
        ` : ''}

        ${item.tareas_dce ? `
          <div class="campo">
            <strong>Tareas DCE:</strong>
            <div>${item.tareas_dce}</div>
          </div>
        ` : ''}

        ${item.fuente ? `
          <div class="campo fuente-data">
            <strong>Fuente Consultada:</strong>
            <div>${item.fuente}</div>
          </div>
        ` : ''}

      </div>
    </div>
  `).join('');

  // NOTA: Se ha eliminado toda lógica de 'click' para copia de texto.
  // El contenedor hereda el bloqueo de selección definido en el CSS.
};
