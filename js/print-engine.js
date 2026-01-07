// FILE: js/print-engine.js | VERSION: v6.6 Stable

document.addEventListener('DOMContentLoaded', () => {
  const btnImprimir = document.getElementById('btn-imprimir');
  
  if (btnImprimir) {
    btnImprimir.addEventListener('click', () => {
      const areaSelect = document.getElementById('area');
      const gradoSelect = document.getElementById('grado');
      const periodoSelect = document.getElementById('periodo');
      
      const fechaTxt = document.getElementById('print-fecha-txt');
      
      const nombreArea = areaSelect.options[areaSelect.selectedIndex]?.text || "";
      const nombreGrado = gradoSelect.options[gradoSelect.selectedIndex]?.text || "";
      const nombrePeriodo = periodoSelect.options[periodoSelect.selectedIndex]?.text || "";
      
      const ahora = new Date();
      fechaTxt.textContent = `Área: ${nombreArea} | Grado: ${nombreGrado} | Periodo: ${nombrePeriodo} | Fecha: ${ahora.toLocaleDateString()}`;

      // Pequeña espera para asegurar que el DOM se actualice antes de imprimir
      setTimeout(() => {
          window.print();
      }, 300);
    });
  }
});
// END OF FILE: js/print-engine.js | VERSION: v6.6 Stable
