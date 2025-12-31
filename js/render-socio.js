// js/render-socio.js

// Función global para renderizar mallas del Proyecto Socioemocional
window.renderSocioemocional = function(items) {
  const container = document.getElementById('tabla-body-socio');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se encontraron resultados.</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item-malla socioemocional">
      <h3>${item.competencia_anual || 'Sin competencia anual'}</h3>
      
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
          <ul>${item.Habilidades.map(habilidad => `<li>${habilidad}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      ${item["evidencias_de_desempeno"] && item["evidencias_de_desempeno"].length > 0 ? `
        <div class="campo">
          <strong>Evidencias de desempeño:</strong>
          <ul>${item["evidencias_de_desempeno"].map(ev => `<li>${ev}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      ${item["orientacion_bateria"] ? `
        <div class="campo fuente">
          <strong>Orientación Batería:</strong>
          <div>${item["orientacion_bateria"]}</div>
        </div>
      ` : ''}
    </div>
  `).join('');

  // Hacer todas las cards seleccionables para copiar
  document.querySelectorAll('.item-malla.socioemocional').forEach(card => {
    card.addEventListener('click', function() {
      selectText(this);
    });
  });
};

function selectText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  try {
    document.execCommand('copy');
    // Feedback visual (naranja para socioemocional)
    element.style.background = '#fff3e0';
    setTimeout(() => {
      element.style.background = '';
    }, 1000);
  } catch (err) {
    console.warn('No se pudo copiar automáticamente');
  }
}

// Estilo para "sin resultados" (reutilizado)
if (!document.querySelector('style[data-sin-resultados]')) {
  const style = document.createElement('style');
  style.textContent = `
    .sin-resultados {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
      font-style: italic;
    }
  `;
  style.setAttribute('data-sin-resultados', 'true');
  document.head.appendChild(style);
}
