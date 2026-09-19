/**
 * SepCare Design System — Interactive Showcase JavaScript
 * Powers dynamic icon galleries, interactive status switchers,
 * time-filter chart updates, copy-to-clipboard tokens, and responsive preview modes.
 */

document.addEventListener('DOMContentLoaded', () => {
  initIconGallery();
  initStatusCardSwitcher();
  initSegmentedControls();
  initTokenCopy();
  initResponsiveFrame();
  initChartInteractions();
});

/**
 * 01 — Icon Gallery Generation & Size Switcher
 */
function initIconGallery() {
  const container = document.getElementById('scIconGallery');
  if (!container || !window.SepCareIconCategories || !window.SepCareIcons) return;

  let currentSize = 24;
  const sizeButtons = document.querySelectorAll('[data-icon-size]');

  function renderGallery(size) {
    container.innerHTML = '';
    
    Object.entries(window.SepCareIconCategories).forEach(([category, iconNames]) => {
      const catSection = document.createElement('div');
      catSection.className = 'sc-icon-cat-group';
      
      const catTitle = document.createElement('h4');
      catTitle.className = 'sc-icon-cat-title';
      catTitle.textContent = category;
      catSection.appendChild(catTitle);

      const grid = document.createElement('div');
      grid.className = 'sc-icon-grid';

      iconNames.forEach(name => {
        const item = document.createElement('div');
        item.className = 'sc-icon-card';
        item.title = `Click to copy icon name: ${name}`;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');

        const iconSvg = window.renderSepCareIcon(name, size, 'sc-gallery-icon');
        item.innerHTML = `
          <div class="sc-icon-preview">${iconSvg}</div>
          <span class="sc-icon-name">${name}</span>
          <span class="sc-icon-size-tag">${size}px</span>
        `;

        item.addEventListener('click', () => {
          copyToClipboard(name, `Copied icon name: "${name}"`);
        });

        grid.appendChild(item);
      });

      catSection.appendChild(grid);
      container.appendChild(catSection);
    });
  }

  // Size switcher buttons
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('sc-segmented-btn--active'));
      btn.classList.add('sc-segmented-btn--active');
      currentSize = parseInt(btn.getAttribute('data-icon-size'), 10) || 24;
      renderGallery(currentSize);
    });
  });

  // Initial render
  renderGallery(currentSize);
}

/**
 * 02 — Interactive Status Hero Card Switcher
 */
function initStatusCardSwitcher() {
  const statusCard = document.getElementById('scLiveStatusCard');
  const buttons = document.querySelectorAll('[data-status-toggle]');
  if (!statusCard || !buttons.length) return;

  const states = {
    safe: {
      pillClass: 'sc-status-pill--safe',
      cardClass: 'sc-status-card--safe',
      pillText: '● SAFE',
      meta: 'Updated 2 min ago',
      desc: 'Monitoring readings are currently within the expected neonatal baseline range.',
      vitals: { hr: '132 bpm', temp: '36.7 °C', movement: 'Stable' },
      actionHtml: `<button class="sc-btn sc-btn--secondary" style="font-size:13px; padding:8px 14px;">View 24h Trend</button>`
    },
    caution: {
      pillClass: 'sc-status-pill--caution',
      cardClass: 'sc-status-card--caution',
      pillText: '▲ CAUTION',
      meta: 'Detected 4 min ago',
      desc: 'Mild thermoregulation irregularity detected. Keep baby warm and check vitals in 15 minutes.',
      vitals: { hr: '164 bpm', temp: '35.9 °C', movement: 'Restless' },
      actionHtml: `<button class="sc-btn sc-btn--secondary" style="font-size:13px; padding:8px 14px;">Recheck Temperature</button>`
    },
    critical: {
      pillClass: 'sc-status-pill--critical',
      cardClass: 'sc-status-card--critical',
      pillText: '✕ CRITICAL',
      meta: 'Immediate Sepsis Triage Triggered',
      desc: 'Significant physiological deviation detected. Immediate clinical assessment advised.',
      vitals: { hr: '188 bpm', temp: '38.4 °C', movement: 'Lethargic' },
      actionHtml: `<button class="sc-btn sc-btn--critical" style="font-size:13px; padding:8px 16px;">Contact Healthcare Provider</button>`
    }
  };

  function setStatus(statusKey) {
    const data = states[statusKey];
    if (!data) return;

    // Reset card classes
    statusCard.classList.remove('sc-status-card--safe', 'sc-status-card--caution', 'sc-status-card--critical');
    statusCard.classList.add(data.cardClass);

    // Update Pill
    const pill = statusCard.querySelector('.sc-status-pill');
    if (pill) {
      pill.className = `sc-status-pill ${data.pillClass}`;
      pill.innerHTML = data.pillText;
    }

    // Update Meta & Description
    const metaEl = statusCard.querySelector('.sc-status-card__meta');
    if (metaEl) metaEl.textContent = data.meta;

    const descEl = statusCard.querySelector('.sc-status-card__description');
    if (descEl) descEl.textContent = data.desc;

    // Update Vitals
    const hrEl = document.getElementById('scStatusHr');
    const tempEl = document.getElementById('scStatusTemp');
    const movEl = document.getElementById('scStatusMov');
    if (hrEl) hrEl.textContent = data.vitals.hr;
    if (tempEl) tempEl.textContent = data.vitals.temp;
    if (movEl) movEl.textContent = data.vitals.movement;

    // Update Action Button
    const footerAction = statusCard.querySelector('.sc-status-card__footer-action');
    if (footerAction) footerAction.innerHTML = data.actionHtml;
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('sc-segmented-btn--active'));
      btn.classList.add('sc-segmented-btn--active');
      const target = btn.getAttribute('data-status-toggle');
      setStatus(target);
    });
  });
}

/**
 * 03 — Segmented Control Interactions
 */
function initSegmentedControls() {
  document.querySelectorAll('.sc-segmented-control').forEach(ctrl => {
    // Avoid double-attaching to already handled controls
    if (ctrl.id === 'scStatusSegmented' || ctrl.id === 'scIconSizeSegmented') return;
    
    const btns = ctrl.querySelectorAll('.sc-segmented-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('sc-segmented-btn--active'));
        btn.classList.add('sc-segmented-btn--active');
      });
    });
  });
}

/**
 * 04 — Click-to-Copy for Tokens, Hex Codes, and Variables
 */
function initTokenCopy() {
  document.querySelectorAll('[data-copy-token]').forEach(el => {
    el.addEventListener('click', () => {
      const val = el.getAttribute('data-copy-token');
      copyToClipboard(val, `Copied: ${val}`);
    });
  });
}

function copyToClipboard(text, feedbackMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(feedbackMsg));
  } else {
    showToast(feedbackMsg);
  }
}

function showToast(msg) {
  let toast = document.getElementById('scToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'scToast';
    toast.className = 'sc-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('sc-toast--visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('sc-toast--visible');
  }, 2200);
}

/**
 * 05 — Responsive Viewport Switcher
 */
function initResponsiveFrame() {
  const frameContainer = document.getElementById('scResponsiveFrameWrap');
  const buttons = document.querySelectorAll('[data-viewport-mode]');
  if (!frameContainer || !buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('sc-segmented-btn--active'));
      btn.classList.add('sc-segmented-btn--active');
      const mode = btn.getAttribute('data-viewport-mode');

      frameContainer.classList.remove('sc-viewport--desktop', 'sc-viewport--tablet', 'sc-viewport--mobile');
      if (mode === 'mobile') {
        frameContainer.classList.add('sc-viewport--mobile');
      } else if (mode === 'tablet') {
        frameContainer.classList.add('sc-viewport--tablet');
      } else {
        frameContainer.classList.add('sc-viewport--desktop');
      }
    });
  });
}

/**
 * 06 — Chart Time Filter Interactions (Chart.js 5-Minute Time Series Engine)
 */
let scLiveChartInstance = null;

function initChartInteractions() {
  const canvas = document.getElementById('scLiveChartJs');
  const filterBtns = document.querySelectorAll('[data-chart-range]');

  if (canvas && typeof createSepCareTimeSeriesChart === 'function' && typeof Chart !== 'undefined') {
    // Initialize default 24h chart with 288 data points (every 5 minutes)
    scLiveChartInstance = createSepCareTimeSeriesChart(canvas, {
      points: 48, // 48 points x 5 min = 4 hours baseline window (smooth, high density)
      baseValue: 136,
      unit: 'bpm',
      label: 'Heart Rate',
      minTarget: 110,
      maxTarget: 160,
      lineColor: '#6F9FD5',
      areaColor: 'rgba(111, 159, 213, 0.14)',
      safeZoneColor: 'rgba(79, 175, 120, 0.08)',
      yMin: 90,
      yMax: 180
    });

    const rangePointsMap = {
      '2h': 24,   // 24 points x 5 min = 2 hours
      '6h': 72,   // 72 points x 5 min = 6 hours
      '12h': 144, // 144 points x 5 min = 12 hours
      '24h': 288  // 288 points x 5 min = 24 hours
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('sc-segmented-btn--active'));
        btn.classList.add('sc-segmented-btn--active');
        const range = btn.getAttribute('data-chart-range');
        const points = rangePointsMap[range] || 48;

        if (scLiveChartInstance && typeof generate5MinTelemetryData === 'function') {
          const newTelemetry = generate5MinTelemetryData(points, 136, 7);
          scLiveChartInstance.data.labels = newTelemetry.labels;
          scLiveChartInstance.data.datasets[0].data = newTelemetry.data;
          scLiveChartInstance.update();
        }
      });
    });
    return;
  }

  // Fallback if Chart.js is not loaded
  const chartPath = document.getElementById('scMainChartPath');
  const chartFill = document.getElementById('scMainChartFill');
  if (!filterBtns.length || !chartPath) return;

  const chartData = {
    '2h': { d: 'M 0 65 Q 40 45, 80 55 T 160 50 T 240 60 T 320 45 T 400 52', fill: 'M 0 65 Q 40 45, 80 55 T 160 50 T 240 60 T 320 45 T 400 52 L 400 120 L 0 120 Z' },
    '6h': { d: 'M 0 65 Q 40 45, 80 55 T 160 50 T 240 60 T 320 45 T 400 52', fill: 'M 0 65 Q 40 45, 80 55 T 160 50 T 240 60 T 320 45 T 400 52 L 400 120 L 0 120 Z' },
    '12h': { d: 'M 0 70 Q 50 60, 100 48 T 200 52 T 300 40 T 400 48', fill: 'M 0 70 Q 50 60, 100 48 T 200 52 T 300 40 T 400 48 L 400 120 L 0 120 Z' },
    '24h': { d: 'M 0 58 Q 60 70, 120 45 T 240 62 T 360 48 T 400 55', fill: 'M 0 58 Q 60 70, 120 45 T 240 62 T 360 48 T 400 55 L 400 120 L 0 120 Z' }
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('sc-segmented-btn--active'));
      btn.classList.add('sc-segmented-btn--active');
      const range = btn.getAttribute('data-chart-range');
      if (chartData[range]) {
        chartPath.setAttribute('d', chartData[range].d);
        if (chartFill) chartFill.setAttribute('d', chartData[range].fill);
      }
    });
  });
}
