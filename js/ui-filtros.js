document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');

  // Cargar grados al inicio desde el Config
  areaSel.addEventListener('change', () => {
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    window.APP_CONFIG.GRADOS.forEach(g => {
      const opt = document.createElement('option'); opt.value = g;
      opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
      gradoSel.appendChild(opt);
    });
    gradoSel.disabled = false;
  });

  gradoSel.addEventListener('change', () => {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= 4; i++) {
      const opt = document.createElement('option'); opt.value = String(i); opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
  });

  periodoSel.addEventListener('change', async () => {
    window.RenderEngine.setCargando(true);
    // DESCARGA LOS DATOS AQUÍ
    await asegurarDatosGrado(areaSel.value, gradoSel.value);
    
    // Poblar componentes
    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const malla = window.MallasData[config.nombre][gradoSel.value][tipo];
    const items = malla.periodos[periodoSel.value] || [];
    
    compSel.innerHTML = '<option value="todos">Todos</option>';
    [...new Set(items.map(it => it.componente || it.competencia))].forEach(n => {
      if(n) { const opt = document.createElement('option'); opt.value = n; opt.textContent = n; compSel.appendChild(opt); }
    });
    compSel.disabled = false;
    window.RenderEngine.setCargando(false);
  });

  btnBuscar.addEventListener('click', () => {
    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const malla = window.MallasData[config.nombre][gradoSel.value][tipo];
    const items = malla.periodos[periodoSel.value] || [];
    const filtrados = compSel.value === "todos" ? items : items.filter(it => (it.componente || it.competencia) === compSel.value);

    window.RenderEngine.renderizar(filtrados, areaSel.value, gradoSel.value, periodoSel.value);
    
    const resPrincipal = document.getElementById('resultados-principal');
    resPrincipal.className = `resultados mostrar-block ${config.clase}`;
  });
});
