let currentStep = 1;
const totalSteps = 6;
const discountPlantilla = 50000;
const fastSurcharge = 50000; // recargo por 5 días

function setProgress(step){
  const pct = Math.round((step / totalSteps) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
}

function showStep(step){
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + step).classList.add('active');
  setProgress(step);
  const firstInput = document.getElementById('step' + step).querySelector('select, input');
  if(firstInput) firstInput.focus();
}

function validateBeforeNext(){
  if(currentStep === 3){
    const chosen = document.querySelector('input[name="diseno"]:checked');
    if(!chosen){ alert("Debes elegir una opción de diseño para continuar."); return false; }
  }
  if(currentStep === 4){
    const tiempo = document.getElementById('tiempoEntrega').value;
    if(!tiempo){ alert("Debes elegir un tiempo de entrega para continuar."); return false; }
  }
  return true;
}

function nextStep(){
  if(!validateBeforeNext()) return;
  if(currentStep < totalSteps){
    currentStep++;
    if(currentStep === 5) generateResumen();
    if(currentStep === 6) calcularPrecio();
    showStep(currentStep);
  }
}

function prevStep(){
  if(currentStep > 1){
    currentStep--;
    showStep(currentStep);
  }
}

function generateResumen(){
  const tipoSelect = document.getElementById('tipoSitio');
  const tipo = tipoSelect.value;
  const basePrice = parseInt(tipoSelect.selectedOptions[0].dataset.precio, 10);

  const extrasChecked = Array.from(document.querySelectorAll('#extrasGroup input[type="checkbox"]:checked'));
  const extras = extrasChecked.map(i => i.value);
  const extrasTotal = extrasChecked.reduce((sum, el) => {
    const p = parseInt(el.dataset.precio || el.getAttribute('data-precio') || 0, 10);
    return sum + (isNaN(p) ? 0 : p);
  }, 0);

  const diseno = document.querySelector('input[name="diseno"]:checked')?.value || '';
  const tiempo = document.getElementById('tiempoEntrega').value;

  const resumenEl = document.getElementById('resumen');
  resumenEl.innerHTML = `
    <div><strong>Tipo:</strong> ${tipo}</div>
    <div><strong>Precio base:</strong> $${basePrice.toLocaleString()}</div>
    <div><strong>Extras (${extras.length}):</strong> ${extras.length ? extras.join(', ') : 'Ninguno'}</div>
    <div><strong>Total extras:</strong> $${extrasTotal.toLocaleString()}</div>
    <div><strong>Diseño:</strong> ${diseno}</div>
    <div><strong>Tiempo de entrega:</strong> ${tiempo}</div>
  `;
}

function calcularPrecio(){
  const tipoSelect = document.getElementById('tipoSitio');
  const basePrice = parseInt(tipoSelect.selectedOptions[0].dataset.precio, 10);

  const extrasChecked = Array.from(document.querySelectorAll('#extrasGroup input[type="checkbox"]:checked'));
  const extras = extrasChecked.map(i => i.value);
  const extrasTotal = extrasChecked.reduce((sum, el) => {
    const p = parseInt(el.dataset.precio || el.getAttribute('data-precio') || 0, 10);
    return sum + (isNaN(p) ? 0 : p);
  }, 0);

  const diseno = document.querySelector('input[name="diseno"]:checked')?.value || '';
  const tiempo = document.getElementById('tiempoEntrega').value;

  let total = basePrice + extrasTotal;

  // descuento por plantilla
  if(diseno === 'Basico'){
    total = total - discountPlantilla;
  }

  // recargo por entrega rápida (solo si eligieron Rápido)
  if(tiempo === 'Rápido'){
    total = total + fastSurcharge;
  }

  document.getElementById('precioFinal').innerText = "Precio estimado: $" + total.toLocaleString();

  const mensaje = `Hola, quiero cotizar un sitio web de $${total.toLocaleString()} con estas características: Tipo: ${tipoSelect.value}; Extras: ${extras.length ? extras.join(', ') : 'Ninguno'}; Diseño: ${diseno}; Entrega: ${tiempo}.`;
  const waNumber = "5491138876974"; // <-- reemplazá por tu número con código de país
  const waUrl = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(mensaje);
  document.getElementById('whatsappLink').href = waUrl;
}

function resetAll(){
  currentStep = 1;
  document.getElementById('tipoSitio').selectedIndex = 0;
  document.getElementById('tiempoEntrega').selectedIndex = 0;
  document.querySelectorAll('#extrasGroup input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="diseno"]').forEach(r => r.checked = false);
  document.getElementById('resumen').innerHTML = '';
  document.getElementById('precioFinal').innerText = '';
  document.getElementById('whatsappLink').href = '#';
  showStep(currentStep);
}

// Inicializar y exponer funciones para botones inline
showStep(currentStep);
window.nextStep = nextStep;
window.prevStep = prevStep;
window.resetAll = resetAll;

