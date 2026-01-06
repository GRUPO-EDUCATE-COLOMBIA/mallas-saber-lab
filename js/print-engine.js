// js/print-engine.js - v5.0 (Motor de Generación de Fichas)

document.addEventListener('DOMContentLoaded', () => {
  const btnImprimir = document.getElementById('btn-imprimir');
  
  if (btnImprimir) {
    btnImprimir.addEventListener('click', () => {
      prepararYImprimir();
    });
  }

  function prepararYImprimir() {
    // 1. Capturar elementos de metadatos
    const areaSelect = document.getElementById('area');
    const gradoSelect = document.getElementById('grado');
    const periodoSelect = document.getElementById('periodo');
    
    const tituloArea = document.getElementById('print-titulo-area');
    const fechaTxt = document.getElementById('print-fecha-txt');
    
    // 2. Poblar el encabezado de impresión
    const nombreArea = areaSelect.options[areaSelect.selectedIndex]?.text || "Área No Definida";
    const nombreGrado = gradoSelect.options[gradoSelect.selectedIndex]?.text || "";
    const nombrePeriodo = periodoSelect.options[periodoSelect.selectedIndex]?.text || "";
    
    tituloArea.textContent = `REPORTE: ${nombreArea.toUpperCase()} - ${nombreGrado.toUpperCase()}`;
    
    const ahora = new Date();
    fechaTxt.textContent = `Fecha de consulta: ${ahora.toLocaleDateString()} | ${ahora.toLocaleTimeString()} | Período: ${nombrePeriodo}`;

    // 3. LA MAGIA: Abrir todos los acordeones automáticamente
    // Esto asegura que el contenido de ECO y DCE sea visible en el papel
    const paneles = document.querySelectorAll('.acordeon-panel');
    paneles.forEach(panel => {
      panel.classList.add('abierto');
    });

    // 4. Disparar el diálogo de impresión del sistema
    // El CSS (@media print) se encargará de limpiar el resto
    window.print();

    // 5. Opcional: Podríamos cerrar los acordeones después de imprimir, 
    // pero usualmente el docente prefiere dejarlos abiertos tras la consulta.
    console.log("🖨️ Ficha de consulta generada exitosamente.");
  }
});
