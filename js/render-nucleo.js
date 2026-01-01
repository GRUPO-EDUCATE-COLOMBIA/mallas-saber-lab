// js/render-nucleo.js
window.renderTablaMallas = function(items) {
  const container = document.getElementById('tabla-body');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se encontraron resultados.</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item-malla">
      <h3>${item.componente || 'Sin componente'}</h3>
      ${item.estandar ? `<div class="campo"><strong>Estándar:</strong> ${item.estandar}</div>` : ''}
      ${item.dba ? `<div class="campo"><strong>DBA:</strong> ${Array.isArray(item.dba) ? item.dba.join('<br>') : item.dba}</div>` : ''}
      ${item.evidencias ? `<div class="campo"><strong>Evidencias:</strong> ${Array.isArray(item.evidencias) ? item.evidencias.join('<br>') : item.evidencias}</div>` : ''}
      ${item.saberes ? `<div class="campo"><strong>Saberes:</strong> ${Array.isArray(item.saberes) ? item.saberes.join('<br>') : item.saberes}</div>` : ''}
    </div>
  `).join('');

  document.querySelectorAll('.item-malla').forEach(card => {
    card.addEventListener('click', function() {
      const range = document.createRange();
      range.selectNodeContents(this);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      this.style.background = '#e8f5e8';
      setTimeout(() => this.style.background = '', 1000);
    });
  });
};
