// popup.js — Main popup logic for Bag Size Detective

const CM_PER_INCH = 2.54;

let currentUnit = 'cm';
let currentTab = 'personal';
let selectedDims = null; // { l_cm, w_cm, h_cm }

// --- Conversion helpers ---
function cmToIn(cm) {
  return Math.round((cm / CM_PER_INCH) * 10) / 10;
}

function inToCm(inches) {
  return Math.round(inches * CM_PER_INCH * 10) / 10;
}

function formatCm(l, w, h) {
  return `${l} x ${w} x ${h} cm`;
}

function formatIn(l, w, h) {
  return `${cmToIn(l)} x ${cmToIn(w)} x ${cmToIn(h)} in`;
}

// --- UI Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initUnitToggle();
  initTabs();
  initCheckButton();
  scanCurrentPage();
});

function initUnitToggle() {
  document.querySelectorAll('.unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentUnit = btn.dataset.unit;
    });
  });
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      if (selectedDims) renderResults();
    });
  });
}

function initCheckButton() {
  document.getElementById('btn-check').addEventListener('click', () => {
    const l = parseFloat(document.getElementById('input-l').value);
    const w = parseFloat(document.getElementById('input-w').value);
    const h = parseFloat(document.getElementById('input-h').value);

    if (!l || !w || !h || l <= 0 || w <= 0 || h <= 0) {
      alert('Please enter all three dimensions.');
      return;
    }

    let l_cm, w_cm, h_cm;
    if (currentUnit === 'in') {
      l_cm = inToCm(l);
      w_cm = inToCm(w);
      h_cm = inToCm(h);
    } else {
      l_cm = l;
      w_cm = w;
      h_cm = h;
    }

    // Sort descending
    const sorted = [l_cm, w_cm, h_cm].sort((a, b) => b - a);
    selectedDims = { l_cm: sorted[0], w_cm: sorted[1], h_cm: sorted[2] };
    showResults();
  });
}

// --- Page Scanning ---
function scanCurrentPage() {
  const detectedDiv = document.getElementById('detected-dims');
  const manualInput = document.getElementById('manual-input');

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      showNoDims(detectedDiv);
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, { action: 'scanPage' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.dimensions || response.dimensions.length === 0) {
        showNoDims(detectedDiv);
        return;
      }

      detectedDiv.innerHTML = '';
      const dims = response.dimensions;

      dims.forEach((dim, idx) => {
        const card = document.createElement('div');
        card.className = 'dim-card';

        let l_cm, w_cm, h_cm;
        if (dim.unit === 'in') {
          l_cm = inToCm(dim.l);
          w_cm = inToCm(dim.w);
          h_cm = inToCm(dim.h);
        } else {
          l_cm = dim.l;
          w_cm = dim.w;
          h_cm = dim.h;
        }

        const cmStr = formatCm(l_cm, w_cm, h_cm);
        const inStr = formatIn(l_cm, w_cm, h_cm);

        card.innerHTML = `
          <div class="dim-values">${cmStr}</div>
          <div class="dim-converted">${inStr}</div>
          <div class="dim-source">Found: "${dim.source}"</div>
        `;

        card.addEventListener('click', () => {
          document.querySelectorAll('.dim-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');

          const sorted = [l_cm, w_cm, h_cm].sort((a, b) => b - a);
          selectedDims = { l_cm: sorted[0], w_cm: sorted[1], h_cm: sorted[2] };
          showResults();
        });

        detectedDiv.appendChild(card);
      });

      // Auto-select if only one result
      if (dims.length === 1) {
        detectedDiv.querySelector('.dim-card').click();
      }
    });
  });
}

function showNoDims(container) {
  container.innerHTML = '<p class="no-dims-found">No dimensions detected on this page. Please enter manually below.</p>';
}

// --- Results ---
function showResults() {
  document.getElementById('results-section').classList.remove('hidden');
  renderBagSize();
  renderResults();
}

function renderBagSize() {
  const display = document.getElementById('bag-size-display');
  const { l_cm, w_cm, h_cm } = selectedDims;
  display.innerHTML = `
    <div class="size-line size-cm">${formatCm(l_cm, w_cm, h_cm)}</div>
    <div class="size-line size-in">${formatIn(l_cm, w_cm, h_cm)}</div>
  `;
}

function renderResults() {
  const list = document.getElementById('results-list');
  list.innerHTML = '';

  const { l_cm, w_cm, h_cm } = selectedDims;
  const bagDims = [l_cm, w_cm, h_cm].sort((a, b) => b - a);

  let passCount = 0;
  let failCount = 0;

  const rows = AIRLINES.map(airline => {
    const limit = currentTab === 'personal' ? airline.personal_item : airline.carry_on;
    const limitDims = [limit.l, limit.w, limit.h].sort((a, b) => b - a);

    // Compare each dimension (sorted descending)
    // Allow 0.5cm tolerance for rounding
    const tolerance = 0.5;
    const fits = bagDims[0] <= limitDims[0] + tolerance &&
                 bagDims[1] <= limitDims[1] + tolerance &&
                 bagDims[2] <= limitDims[2] + tolerance;

    if (fits) passCount++;
    else failCount++;

    const limitCmStr = formatCm(limitDims[0], limitDims[1], limitDims[2]);
    const limitInStr = formatIn(limitDims[0], limitDims[1], limitDims[2]);
    const typeLabel = currentTab === 'personal' ? 'Personal Item' : 'Carry-On';

    return {
      fits,
      html: `
        <div class="airline-row ${fits ? 'pass' : 'fail'}">
          <div class="airline-status">${fits ? '✅' : '❌'}</div>
          <div class="airline-info">
            <div class="airline-name">${airline.name}</div>
            <div class="airline-limit">${typeLabel}: ${limitCmStr}</div>
            <div class="airline-limit-detail">${limitInStr}</div>
          </div>
        </div>
      `
    };
  });

  // Show summary bar
  const summaryHtml = `
    <div class="summary-bar">
      <div class="summary-item summary-pass">✅ ${passCount} airlines OK</div>
      <div class="summary-item summary-fail">❌ ${failCount} airlines exceeded</div>
    </div>
  `;

  // Sort: pass first, then fail
  rows.sort((a, b) => (a.fits === b.fits ? 0 : a.fits ? -1 : 1));

  list.innerHTML = summaryHtml + rows.map(r => r.html).join('');
}
