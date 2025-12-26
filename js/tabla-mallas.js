// js/tabla-mallas.js

// Renderiza resultados como TABLAS 2xN por componente
function renderTablaMallas(items) {
  const tbody = document.getElementById('tabla-body');
  if (!tbody) return;

  tbody.innerHTML = items.map(item => crearTablaComponenteHTML(item)).join('');

  // botones Copiar de cada tabla
  Array.from(document.querySelectorAll('.btn-copiar-componente')).forEach(btn => {
    btn.addEventListener('click', e => {
      const tabla = e.target.closest('.tabla-componente');
      copiarTablaComponente(tabla);
    });
  });
}

function crearTablaComponenteHTML(item) {
  const dba = item.dba || [];
  const evidencias = item.evidencias || [];
  const saberes = item.saberes || [];

  return `
    <tr>
      <td colspan="9">
        <table class="tabla-componente">
          <!-- Fila de encabezado: nombre del componente -->
          <tr>
            <th colspan="2" class="componente-header">
              <span class="componente-nombre">${item.componente || ''}</span>
              <button type="button" class="btn-copiar-componente">Copiar</button>
            </th>
          </tr>

          <!-- ESTANDAR -->
          <tr>
            <td class="celda-label">
              <span class="emoji">📘</span>
              <span class="texto-label">ESTANDAR</span>
            </td>
            <td class="celda-contenido">
              ${item.estandar || ''}
            </td>
          </tr>

          <!-- DBA -->
          <tr>
            <td class="celda-label">
              <span class="emoji">☝️</span>
              <span class="texto-label">DBA</span>
            </td>
            <td class="celda-contenido">
              <ul>
                ${dba.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </td>
          </tr>

          <!-- EVIDENCIAS -->
          <tr>
            <td class="celda-label">
              <span class="emoji">✅</span>
              <span class="texto-label">EVIDENCIAS</span>
            </td>
            <td class="celda-contenido">
              <ul>
                ${evidencias.map(e => `<li>${e}</li>`).join('')}
              </ul>
            </td>
          </tr>

          <!-- SABERES -->
          <tr>
            <td class="celda-label">
              <span class="emoji">📋</span>
              <span class="texto-label">SABERES</span>
            </td>
            <td class="celda-contenido">
              <ul>
                ${saberes.map(s => `<li>${s}</li>`).join('')}
              </ul>
            </td>
          </tr>

          <!-- SOCIOEMOCIONAL -->
          <tr>
            <td class="celda-label">
              <span class="emoji">🧠</span>
              <span class="texto-label">SOCIOEMOCIONAL</span>
            </td>
            <td class="celda-contenido">
              ${item.socioemocional ?? ''}
            </td>
          </tr>

          <!-- TAREAS DCE -->
          <tr>
            <td class="celda-label">
              <span class="emoji">📈</span>
              <span class="texto-label">TAREAS DCE</span>
            </td>
            <td class="celda-contenido">
              ${item.tareas_dce ?? ''}
            </td>
          </tr>

          <!-- FUENTE -->
          <tr>
            <td class="celda-label">
              <span class="emoji">📖</span>
              <span class="texto-label">FUENTE</span>
            </td>
            <td class="celda-contenido">
              ${item.fuente ?? ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function copiarTablaComponente(tabla) {
  if (!tabla) return;
  const text = tabla.innerText.replace(/\n\s*\n/g, '\n').trim();
  navigator.clipboard.writeText(text).then(() => {
    tabla.classList.add('copiable');
    setTimeout(() => tabla.classList.remove('copiable'), 800);
  });
}
