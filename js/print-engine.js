// FILE: js/print-engine.js | VERSION: v7.8 Stable

document.addEventListener('DOMContentLoaded', () => {
  const btnImprimir = document.getElementById('btn-imprimir');
  
  if (btnImprimir) {
    btnImprimir.addEventListener('click', () => {
      // 1. Captura de metadatos de los selectores
      const areaSelect = document.getElementById('area');
      const gradoSelect = document.getElementById('grado');
      const periodoSelect = document.getElementById('periodo');
      
      const fechaTxt = document.getElementById('print-fecha-txt');
      
      // 2. Obtención de textos seleccionados
      const areaNom = areaSelect.options[areaSelect.selectedIndex]?.text || "No especificada";
      const gradoNom = gradoSelect.options[gradoSelect.selectedIndex]?.text || "No especificado";
      const periodoNom = periodoSelect.options[periodoSelect.selectedIndex]?.text || "";
      
      const ahora = new Date();
      const fechaFormateada = ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString();

      // 3. Población del encabezado oculto
      if (fechaTxt) {
          fechaTxt.innerHTML = `<strong>ÁREA:</strong> ${areaNom} | <strong>GRADO:</strong> ${gradoNom} | <strong>PERIODO:</strong> ${periodoNom} <br> <strong>FECHA DE CONSULTA:</strong> ${fechaFormateada}`;
      }

      // 4. Disparo del diálogo de impresión con pequeña espera para sincronía
      setTimeout(() => {
          window.print();
      }, 400);
    });
  }
});
// END OF FILE: js/print-engine.js | VERSION: v7.8 Stable
