// js/render-socio.js

/**
 * Renderiza la malla del Proyecto Socioemocional.
 * Mapea las claves específicas de este JSON (Habilidades, eje_central, etc.)
 */
window.renderSocioemocional = function(items) {
  const container = document.getElementById('tabla-body-socio');
  if (!container) return;

  // Limpiar contenido previo
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se encontraron resultados para esta selección socioemocional.</p>';
    return;
  }

  // Generar el HTML vertical adaptado a Socioemocional
  container.innerHTML = items.map(item => `
    <div class="item-malla socioemocional">
      <h3>${item.competencia_anual || 'Autonomía y Responsabilidad'}</h3>
      
      ${item.estandar ? `
        <div class="campo">
          <strong>Estándar:</strong>
          <div>${item.estandar}</div>
        </div>
      ` : ''}
      
      ${item.competencia ? `
        <div class="campo">
          <strong>Competencia:</strong>
          <div>${item.competencia}</div>
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
          <strong>Habilidades:</strong>
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
  `).join('');

  // Funcionalidad de copia para Socioemocional
  document.querySelectorAll('.item-malla.socioemocional').forEach(card => {
    card.addEventListener('click', function() {
      copiarContenidoSocio(this);
    });
  });
};

/**
 * Copia el contenido con feedback visual en tonos naranja (temática socioemocional)
 */
function copiarContenidoSocio(elemento) {
  const seleccion = window.getSelection();
  const rango = document.createRange();
  rango.selectNodeContents(elemento);
  seleccion.removeAllRanges();
  seleccion.addRange(rango);

  try {
    document.execCommand('copy');
    const colorOriginal = elemento.style.backgroundColor;
    // Feedback: Naranja muy claro acorde al CSS
    elemento.style.backgroundColor = '#fff3e0'; 
    setTimeout(() => {
      elemento.style.backgroundColor = colorOriginal;
      seleccion.removeAllRanges();
    }, 1000);
  } catch (err) {
    console.error('No se pudo copiar');
  }
}
