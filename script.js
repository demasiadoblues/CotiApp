let currentStep = 1;
const totalSteps = 6;

// Inclusiones por tipo (se marcarán y deshabilitarán)
const INCLUDED_BY_TYPE = {
  'Landing': ['Chat WhatsApp','Formulario de contacto','SEO inicial'],
  'Corporativo': ['Chat WhatsApp','Formulario de contacto','SEO inicial','Blog'],
  'Ecommerce': ['Chat WhatsApp','Formulario de contacto','SEO inicial'],
  'Personalizado': [] // en Personalizado todo libre por defecto
};

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

/* Helpers de visibilidad y utilidades */
function isElementVisible(el){
  if(!el) return false;
  const cs = window.getComputedStyle(el);
  return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
}

function hideAllExtrasGroups() {
  const groups = ['extrasGroupPersonalizado','extrasGroupLanding','extrasGroupCorporativo','extrasGroupEcommerce'];
  groups.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });
}

function clearHiddenGroupChecks() {
  const allGrids = document.querySelectorAll('.checkbox-grid');
  allGrids.forEach(grid => {
    if(!isElementVisible(grid)) {
      grid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.disabled = false;
        cb.closest('label')?.classList.remove('disabled');
      });
    }
  });
}

/* Aplica defaults SOLO dentro del grupo visible correspondiente */
function applyIncludedDefaults(tipo) {
  // quitar disabled de todos primero
  document.querySelectorAll('#step2 .checkbox-grid input[type="checkbox"]').forEach(cb => {
    cb.disabled = false;
    cb.closest('label')?.classList.remove('disabled');
  });

  if(!INCLUDED_BY_TYPE[tipo] || INCLUDED_BY_TYPE[tipo].length === 0) return;

  // determinar el id del grupo visible
  const map = {
    'Landing': 'extrasGroupLanding',
    'Corporativo': 'extrasGroupCorporativo',
    'Ecommerce': 'extrasGroupEcommerce',
    'Personalizado': 'extrasGroupPersonalizado'
  };
  const groupId = map[tipo];
  const groupEl = document.getElementById(groupId);
  if(!groupEl) return;

  const included = INCLUDED_BY_TYPE[tipo];
  included.forEach(name => {
    // buscar checkbox por value dentro del grupo visible
    const cb = Array.from(groupEl.querySelectorAll('input[type="checkbox"]')).find(i => i.value === name);
    if(cb){
      cb.checked = true;
      cb.disabled = true;
      cb.closest('label')?.classList.add('disabled');
    }
  });
}

function updateExtrasVisibility() {
  const tipo = document.getElementById('tipoSitio').value;
  hideAllExtrasGroups();

  if(tipo === 'Personalizado') {
    document.getElementById('extrasGroupPersonalizado').style.display = 'grid';
  } else if(tipo === 'Landing') {
    document.getElementById('extrasGroupLanding').style.display = 'grid';
  } else if(tipo === 'Corporativo') {
    document.getElementById('extrasGroupCorporativo').style.display = 'grid';
  } else if(tipo === 'Ecommerce') {
    document.getElementById('extrasGroupEcommerce').style.display = 'grid';
  }

  // primero limpiar checks de grupos ocultos
  clearHiddenGroupChecks();

  // luego aplicar defaults SOLO en el grupo visible
  applyIncludedDefaults(tipo);
}

/* Obtener solo extras visibles y que NO estén disabled (sumar solo opcionales) */
function getVisibleExtrasChecked() {
  const allCheckboxes = Array.from(document.querySelectorAll('#step2 input[type="checkbox"]'));
  return allCheckboxes.filter(cb => {
    const grid = cb.closest('.checkbox-grid');
    return grid && isElementVisible(grid) && cb.checked && !cb.disabled;
  });
}

/* Paso 5: resumen sin valores */
function generateResumen(){
  const tipoSelect = document.getElementById('tipoSitio');
  const tipo = tipoSelect.value;

  const extrasChecked = Array.from(document.querySelectorAll('#step2 input[type="checkbox"]:checked'))
    .filter(cb => cb.closest('.checkbox-grid') && isElementVisible(cb.closest('.checkbox-grid')));

  const extras = extrasChecked.map(i => i.value);

  const diseno = document.querySelector('input[name="diseno"]:checked')?.value || '';
  const tiempo = document.getElementById('tiempoEntrega').value;

  const resumenEl = document.getElementById('resumen');
  resumenEl.innerHTML = `
    <div><strong>Tipo:</strong> ${tipo}</div>
    <div><strong>Extras seleccionados (${extras.length}):</strong> ${extras.length ? extras.join(', ') : 'Ninguno'}</div>
    <div><strong>Diseño:</strong> ${diseno}</div>
    <div><strong>Tiempo de entrega:</strong> ${tiempo}</div>
  `;
}

/* Paso 6: cálculo final y presentación */
function calcularPrecio(){
  const tipoSelect = document.getElementById('tipoSitio');
  const basePrice = parseInt(tipoSelect.selectedOptions[0].dataset.precio, 10) || 0;

  // extras visibles y no disabled (opcionales)
  const extrasChecked = getVisibleExtrasChecked();
  const extras = extrasChecked.map(i => i.value);
  const extrasTotal = extrasChecked.reduce((sum, el) => {
    const p = parseInt(el.dataset.precio || el.getAttribute('data-precio') || 0, 10);
    return sum + (isNaN(p) ? 0 : p);
  }, 0);

  const diseno = document.querySelector('input[name="diseno"]:checked')?.value || '';
  const tiempoOption = document.getElementById('tiempoEntrega').selectedOptions[0];
  const tiempo = document.getElementById('tiempoEntrega').value;
  const tiempoSurcharge = parseInt(tiempoOption?.dataset?.precio || tiempoOption?.getAttribute('data-precio') || 0, 10) || 0;

  // Total base: tipo + extras opcionales + recargo por tiempo
  let total = basePrice + extrasTotal + tiempoSurcharge;

  // Plan en cuotas: 50% adicional sobre total, dividido en 12
  const totalWithSubscription = Math.round(total * 1.5);
  const monthly = Math.round(totalWithSubscription / 12);

  // Pago único con 33% OFF
  const oneTime = Math.round(total);

  // Renovación anual: usar valor fijo 160000 (según indicación)
  const renewalAnnual = 160000;

  // Construir HTML final
  const finalBox = document.getElementById('finalBox');
  finalBox.innerHTML = `
    <div class="plan">💳 Plan Suscripcion Anual:</div>
    <div style="font-size:20px;font-weight:700;color:#111;">$${monthly.toLocaleString()} por mes durante 12 meses</div>

    <div class="one-time">💰 Pago único con 33% OFF:</div>
    <div style="font-size:20px;font-weight:700;color:#111;">$${oneTime.toLocaleString()}</div>

    <div class="small-note">Este es el valor total que te da la cuenta de la calculadora.</div>
  `;

  const renewalNote = document.getElementById('renewalNote');
  renewalNote.innerText = `Renovación anual de Hosting+mantenimiento del segundo año: $${renewalAnnual.toLocaleString()} o Suscripción Mensual de $20.000 por mes`;

  // Mensaje WhatsApp con total base
  const mensaje = `Hola, quiero cotizar un sitio web. Total calculado: $${total.toLocaleString()}. Tipo: ${tipoSelect.value}; Extras opcionales: ${extras.length ? extras.join(', ') : 'Ninguno'}; Diseño: ${diseno}; Entrega: ${tiempo}.`;
  const waNumber = "5491138876974"; // tu número con código de país
  const waUrl = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(mensaje);
  document.getElementById('whatsappLink').href = waUrl;
}

function resetAll(){
  currentStep = 1;
  document.getElementById('tipoSitio').selectedIndex = 0;
  document.getElementById('tiempoEntrega').selectedIndex = 0;
  document.querySelectorAll('#step2 input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.disabled = false;
    cb.closest('label')?.classList.remove('disabled');
  });
  document.querySelectorAll('input[name="diseno"]').forEach(r => r.checked = false);
  document.getElementById('resumen').innerHTML = '';
  document.getElementById('finalBox').innerHTML = '';
  document.getElementById('renewalNote').innerText = '';
  document.getElementById('whatsappLink').href = '#';
  updateExtrasVisibility();
  showStep(currentStep);
}

/* Inicializar */
document.addEventListener('DOMContentLoaded', function(){
  updateExtrasVisibility();
  const tipoSelect = document.getElementById('tipoSitio');
  tipoSelect.addEventListener('change', updateExtrasVisibility);
});
window.nextStep = nextStep;
window.prevStep = prevStep;
window.resetAll = resetAll;

