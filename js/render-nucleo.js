// js/render-nucleo.js

// Función global para renderizar mallas del núcleo común (Matemáticas, Lenguaje, etc.)
window.renderTablaMallas = function(items) {
  const container = document.getElementById('tabla-body-nucleo');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se encontraron resultados.</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item-malla">
      <h3>${item.componente || 'Sin componente'}</h3>
      
      ${item.estandar ? `
        <div class="campo">
          <strong>Estándar:</strong>
          <div>${item.estandar}</div>
        </div>
      ` : ''}
      
      ${item.dba ? `
        <div class="campo">
          <strong>DBA:</strong>
          <div>${item.dba}</div>
        </div>
      ` : ''}
      
      ${item["derecho_basico"] ? `
        <div class="campo">
          <strong>Derecho Básico:</strong>
          <div>${item["derecho_basico"]}</div>
        </div>
      ` : ''}
      
      ${item["evidencias_de_desempeno"] || item.evidencias ? `
        <div class="campo">
          <strong>Evidencias de desempeño:</strong>
          <div>${item["evidencias_de_desempeno"] || item.evidencias}</div>
        </div>
      ` : ''}
      
      ${item.saberes ? `
        <div class="campo">
          <strong>Saberes:</strong>
          <div>${item.saberes}</div>
        </div>
      ` : ''}
      
      ${item.fuente ? `
        <div class="campo fuente">
          <strong>Fuente:</strong>
          <div>${item.fuente}</div>
        </div>
      ` : ''}
    </div>
  `).join('');

  // Hacer todas las cards seleccionables para copiar
  document.querySelectorAll('.item-malla').forEach(card => {
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
    // Feedback visual
    element.style.background = '#e8f5e8';
    setTimeout(() => {
      element.style.background = '';
    }, 1000);
  } catch (err) {
    console.warn('No se pudo copiar automáticamente');
  }
}

// Estilo para "sin resultados"
const style = document.createElement('style');
style.textContent = `
  .sin-resultados {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
    font-style: italic;
  }
`;
document.head.appendChild(style);
