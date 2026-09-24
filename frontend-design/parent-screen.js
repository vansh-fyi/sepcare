/**
 * SepCare — Parent Screen Interactive Logic
 * Version: 1.0.0
 * External script powering parent-needs-attention.html and parent-critical.html.
 * Adheres strictly to frontend-design/AGENTS.md (no inline scripts).
 */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initCareSettingToggle();
  initChecklist();
  initModals();
  initTelemetryInteractive();
});

/* ==========================================================================
   01 — LIVE MOBILE STATUS BAR CLOCK
   ========================================================================== */
function initClock() {
  const clockEl = document.getElementById('scLiveClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    clockEl.textContent = `${hours}:${minutes}`;
  }

  update();
  setInterval(update, 30000);
}

/* ==========================================================================
   02 — CARE SETTING TOGGLER (AT HOME vs AT HOSPITAL)
   ========================================================================== */
function initCareSettingToggle() {
  const toggleButtons = document.querySelectorAll('[data-care-setting]');
  if (!toggleButtons.length) return;

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetSetting = btn.getAttribute('data-care-setting'); // 'home' or 'hospital'

      // Update active toggle buttons
      toggleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update dynamic subtitles
      const subtitleEl = document.getElementById('scCareSettingSubtitle');
      if (subtitleEl) {
        subtitleEl.textContent = targetSetting === 'hospital' 
          ? 'Current care setting: At Hospital' 
          : 'Current care setting: At home';
      }

      // If on Critical Screen, toggle between Home and Hospital view containers
      const homeContainer = document.getElementById('scCriticalHomeContent');
      const hospitalContainer = document.getElementById('scCriticalHospitalContent');

      if (homeContainer && hospitalContainer) {
        if (targetSetting === 'hospital') {
          homeContainer.style.display = 'none';
          hospitalContainer.style.display = 'block';
          triggerToast('Switched to: In-Hospital Emergency Protocol');
        } else {
          homeContainer.style.display = 'block';
          hospitalContainer.style.display = 'none';
          triggerToast('Switched to: At-Home Emergency Protocol');
        }
      } else {
        triggerToast(`Care setting updated to: ${targetSetting === 'hospital' ? 'In Hospital' : 'At Home'}`);
      }
    });
  });
}

/* ==========================================================================
   03 — INTERACTIVE "WHAT TO DO NEXT" CHECKLIST
   ========================================================================== */
function initChecklist() {
  const items = document.querySelectorAll('.sc-checklist-item');
  const counterEl = document.getElementById('scChecklistCount');
  const barEl = document.getElementById('scProgressBarFill');

  if (!items.length) return;

  function updateProgress() {
    const checkedCount = document.querySelectorAll('.sc-checklist-item.checked').length;
    const totalCount = items.length;

    if (counterEl) {
      counterEl.textContent = `${checkedCount} of ${totalCount} completed`;
    }
    if (barEl) {
      const percentage = (checkedCount / totalCount) * 100;
      barEl.style.width = `${percentage}%`;
      if (checkedCount === totalCount) {
        barEl.style.backgroundColor = '#16A34A';
      } else {
        barEl.style.backgroundColor = '#0EA5E9';
      }
    }

    if (checkedCount === totalCount) {
      triggerToast('All guidance steps completed. Keep monitoring baby Aarav.');
    }
  }

  items.forEach(item => {
    item.addEventListener('click', () => {
      const isChecked = item.classList.toggle('checked');
      const label = item.querySelector('.sc-checklist-label');
      const text = label ? label.textContent.trim() : 'Step';

      if (isChecked) {
        triggerToast(`Checked: ${text.slice(0, 26)}...`);
      }
      updateProgress();
    });
  });

  // Action button "See what to do next" scrolls smoothly to checklist
  const seeWhatBtn = document.getElementById('scSeeWhatToDoBtn');
  const checklistCard = document.getElementById('scChecklistCard');
  if (seeWhatBtn && checklistCard) {
    seeWhatBtn.addEventListener('click', () => {
      checklistCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      checklistCard.style.transition = 'box-shadow 0.4s ease, transform 0.4s ease';
      checklistCard.style.boxShadow = '0 0 0 3px #F59E0B, 0 10px 28px rgba(245, 158, 11, 0.2)';
      checklistCard.style.transform = 'translateY(-2px)';
      setTimeout(() => {
        checklistCard.style.boxShadow = '';
        checklistCard.style.transform = '';
      }, 1800);
    });
  }
}

/* ==========================================================================
   04 — MODAL CONTROLS & BOTTOM SHEETS
   ========================================================================== */
function initModals() {
  const backdrops = document.querySelectorAll('.sc-modal-backdrop');

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
  }

  // Bind Open Buttons
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-open-modal');
      openModal(modalId);
    });
  });

  // Bind Close Buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.sc-modal-backdrop');
      closeModal(modal);
    });
  });

  // Click on Backdrop to Close
  backdrops.forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // Keyboard Escape to Close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      backdrops.forEach(closeModal);
    }
  });
}

/* ==========================================================================
   05 — TELEMETRY SELECTION & SIMULATION
   ========================================================================== */
function initTelemetryInteractive() {
  const telemetryItems = document.querySelectorAll('[data-telemetry-status]');
  telemetryItems.forEach(item => {
    item.addEventListener('click', () => {
      const status = item.getAttribute('data-telemetry-status');
      if (status === 'live') {
        triggerToast('Continuous BLE stream active • Ankle band transmitting');
      } else if (status === 'fit-check') {
        const modal = document.getElementById('scGuidanceModal');
        if (modal) {
          modal.classList.add('active');
        } else {
          triggerToast('Band Fit Check: Ensure 1-finger gap between cuff and ankle.');
        }
      } else if (status === 'just-now') {
        triggerToast('Latest packet received 4 seconds ago. Signal: Strong.');
      } else if (status === 'disconnect') {
        triggerToast('Demo Note: Simulating sensor reconnection...');
      } else {
        triggerToast(`Telemetry status: ${item.textContent.trim()}`);
      }
    });
  });
}

/* ==========================================================================
   06 — TOAST NOTIFICATION COMPONENT
   ========================================================================== */
let toastTimeout;
function triggerToast(message) {
  let toast = document.getElementById('scParentToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'scParentToast';
    toast.className = 'sc-parent-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span style="color:#38BDF8;">●</span> <span>${message}</span>`;
  toast.classList.add('active');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('active');
  }, 2600);
}

// Expose triggerToast globally for any custom triggers
window.triggerParentToast = triggerToast;
