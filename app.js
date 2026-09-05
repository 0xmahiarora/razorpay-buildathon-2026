/**
 * RAZORPAY /BUILDATHON — INTERACTIVE AGENTIC ECOSYSTEM ENGINE
 * Developer Note: Single-page application logic managing 3D spatial tilt,
 * procedural Web Audio synthesis, conversational agent discount triggers,
 * Razorpay UPI intent simulation, and HUD state management.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. STATE MANAGEMENT & DOM ELEMENTS
  // =========================================================================
  const state = {
    soundEnabled: false,
    discountApplied: false,
    currentPrice: 14999,
    discountedPrice: 12749,
    liveClockActive: false,
    parallaxTargetX: 0,
    parallaxTargetY: 0,
    parallaxCurrentX: 0,
    parallaxCurrentY: 0
  };

  // DOM Cache
  const heroViewport = document.getElementById('heroViewport');
  const parallaxStage = document.getElementById('parallaxStage');
  const parallaxLayers = document.querySelectorAll('[data-parallax-depth]');
  
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundStatus = document.getElementById('soundStatus');
  
  const originalPriceDisplay = document.getElementById('originalPriceDisplay');
  const discountedPriceDisplay = document.getElementById('discountedPriceDisplay');
  const pricingStatusTag = document.getElementById('pricingStatusTag');
  
  const agentPromptText = document.getElementById('agentPromptText');
  const unlockDiscountBtn = document.getElementById('unlockDiscountBtn');
  const directCheckoutBtn = document.getElementById('directCheckoutBtn');
  const inspectSchemaBtn = document.getElementById('inspectSchemaBtn');
  const viewAuditLedgerBtn = document.getElementById('viewAuditLedgerBtn');
  
  const digitalClockDisplay = document.getElementById('digitalClockDisplay');
  const timeWidgetContainer = document.getElementById('timeWidgetContainer');

  // Modals & Forms
  const paymentModal = document.getElementById('paymentModal');
  const tracksModal = document.getElementById('tracksModal');
  const offerModal = document.getElementById('offerModal');
  const applyModal = document.getElementById('applyModal');
  const jsonModal = document.getElementById('jsonModal');
  const auditLedgerModal = document.getElementById('auditLedgerModal');

  const closePaymentModal = document.getElementById('closePaymentModal');
  const closeTracksModal = document.getElementById('closeTracksModal');
  const closeOfferModal = document.getElementById('closeOfferModal');
  const closeApplyModal = document.getElementById('closeApplyModal');
  const closeJsonModal = document.getElementById('closeJsonModal');
  const closeAuditLedgerModal = document.getElementById('closeAuditLedgerModal');

  const upiForm = document.getElementById('upiForm');
  const paymentLog = document.getElementById('paymentLog');
  const logText = document.getElementById('logText');
  const upiAppBtns = document.querySelectorAll('.upi-app-btn');
  const headerApplyBtn = document.getElementById('headerApplyBtn');
  const navTracks = document.getElementById('navTracks');
  const navOffer = document.getElementById('navOffer');
  const applyForm = document.getElementById('applyForm');
  const applySuccessMsg = document.getElementById('applySuccessMsg');

  // Audit Ledger & Failover Controls
  const simulateErrorToggle = document.getElementById('simulateErrorToggle');
  const failoverAlertCard = document.getElementById('failoverAlertCard');
  const failoverErrorCode = document.getElementById('failoverErrorCode');
  const failoverMessageText = document.getElementById('failoverMessageText');
  const fallbackRecoveryLink = document.getElementById('fallbackRecoveryLink');
  const mitigationStepsList = document.getElementById('mitigationStepsList');
  const auditTrailBox = document.getElementById('auditTrailBox');
  const auditLogStream = document.getElementById('auditLogStream');
  const auditLedgerContentDisplay = document.getElementById('auditLedgerContentDisplay');

  // =========================================================================
  // 2. HARDWARE INTERACTION: 3D SPATIAL PARALLAX TILT ENGINE
  // Developer Note: Calculates relative mouse offset from viewport center
  // and smoothly interpolates pitch (rotateX) and roll (rotateY).
  // =========================================================================
  const MAX_PITCH_DEG = 12; // Maximum tilt angle X
  const MAX_ROLL_DEG = 16;  // Maximum tilt angle Y
  const LERP_FACTOR = 0.08; // Smooth motion easing factor

  function updateParallaxCoordinates(e) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Normalized position from -1 to 1
    const normX = (e.clientX / width - 0.5) * 2;
    const normY = (e.clientY / height - 0.5) * 2;

    state.parallaxTargetX = normX;
    state.parallaxTargetY = normY;
  }

  function resetParallax() {
    state.parallaxTargetX = 0;
    state.parallaxTargetY = 0;
  }

  function renderParallaxFrame() {
    // Lerp towards target coordinates
    state.parallaxCurrentX += (state.parallaxTargetX - state.parallaxCurrentX) * LERP_FACTOR;
    state.parallaxCurrentY += (state.parallaxTargetY - state.parallaxCurrentY) * LERP_FACTOR;

    const rotX = -state.parallaxCurrentY * MAX_PITCH_DEG;
    const rotY = state.parallaxCurrentX * MAX_ROLL_DEG;

    if (parallaxStage) {
      parallaxStage.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    }

    // Apply individual depth translations to parallax layers
    parallaxLayers.forEach(layer => {
      const depth = parseFloat(layer.getAttribute('data-parallax-depth')) || 0.5;
      const transX = state.parallaxCurrentX * depth * 35;
      const transY = state.parallaxCurrentY * depth * 25;
      const baseZ = depth * 100;

      layer.style.transform = `translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, ${baseZ}px)`;
    });

    requestAnimationFrame(renderParallaxFrame);
  }

  // Event Listeners for spatial tilt
  window.addEventListener('mousemove', updateParallaxCoordinates);
  window.addEventListener('mouseleave', resetParallax);
  
  // Touch support for mobile spatial tilt simulation
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updateParallaxCoordinates(e.touches[0]);
    }
  }, { passive: true });

  // Start parallax loop
  requestAnimationFrame(renderParallaxFrame);


  // =========================================================================
  // 3. WEB AUDIO SYNTHESIZER (PROCEDURAL HIGH-TECH SOUND EFFECTS)
  // Developer Note: Uses Web Audio API without external mp3 files.
  // =========================================================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSynthSound(freqStart, freqEnd, duration, type = 'sine', volume = 0.08) {
    if (!state.soundEnabled) return;
    try {
      initAudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      console.warn('Audio synthesis warning:', err);
    }
  }

  function playSoundClick() {
    playSynthSound(800, 1200, 0.08, 'sine', 0.06);
  }

  function playSoundSuccess() {
    playSynthSound(440, 880, 0.25, 'triangle', 0.1);
    setTimeout(() => playSynthSound(880, 1320, 0.35, 'sine', 0.1), 120);
  }

  function toggleSound() {
    initAudioContext();
    state.soundEnabled = !state.soundEnabled;

    if (state.soundEnabled) {
      soundToggleBtn.classList.add('active');
      soundStatus.textContent = 'ON';
      playSynthSound(440, 880, 0.2, 'sine', 0.1);
    } else {
      soundToggleBtn.classList.remove('active');
      soundStatus.textContent = 'OFF';
    }
  }

  soundToggleBtn.addEventListener('click', toggleSound);

  // Add click sound listeners to interactive elements
  document.querySelectorAll('button, a, .upi-app-btn').forEach(elem => {
    elem.addEventListener('click', playSoundClick);
  });


  // =========================================================================
  // 4. CONVERSATIONAL LAYER & DYNAMIC DISCOUNT TRIGGER
  // =========================================================================
  function applyDynamicDiscount() {
    if (state.discountApplied) return;
    state.discountApplied = true;

    playSoundSuccess();

    // 1. Update Speech Bubble Prompt Text
    agentPromptText.innerHTML = `
      <strong style="color: var(--neon-emerald);">✓ DYNAMIC DISCOUNT UNLOCKED!</strong><br>
      I have applied a 15% discount for instant standard UPI intent checkout. The <strong>Premium AI Developer BootCamp Course</strong> is now reduced to <strong>₹12,749</strong>. Proceed to Razorpay checkout to confirm your seat.
    `;

    // 2. Update Catalog UI Pricing
    originalPriceDisplay.classList.add('strikethrough');
    discountedPriceDisplay.classList.remove('hidden');
    pricingStatusTag.textContent = '⚡ 15% Dynamic UPI Discount Applied';
    pricingStatusTag.style.color = 'var(--neon-emerald)';

    // 3. Switch CTA Buttons
    unlockDiscountBtn.classList.add('hidden');
    directCheckoutBtn.classList.remove('hidden');

    // 4. Automatically open payment gateway simulation after slight delay
    setTimeout(() => {
      openModal(paymentModal);
    }, 600);
  }

  unlockDiscountBtn.addEventListener('click', applyDynamicDiscount);
  directCheckoutBtn.addEventListener('click', () => openModal(paymentModal));


  // =========================================================================
  // 5. RAZORPAY UPI GATEWAY PAYMENT SIMULATION & NODE.JS API INTEGRATION
  // =========================================================================
  
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderAuditTrailStream(auditArray) {
    if (!auditTrailBox || !auditLogStream || !Array.isArray(auditArray)) return;
    auditTrailBox.classList.remove('hidden');
    auditLogStream.innerHTML = auditArray.map(entry => {
      let badgeClass = 'log-badge-action';
      if (entry.includes('[GATE_VERIFIED]')) badgeClass = 'log-badge-gate';
      else if (entry.includes('[DISCOUNT_VERIFIED]')) badgeClass = 'log-badge-discount';
      else if (entry.includes('[INTENT_GENERATED]')) badgeClass = 'log-badge-intent';
      else if (entry.includes('[TRANSACTION_SETTLED]')) badgeClass = 'log-badge-success';
      else if (entry.includes('[API_ERROR]') || entry.includes('[API_TIMEOUT]')) badgeClass = 'log-badge-error';
      else if (entry.includes('[FAILOVER_TRIGGERED]') || entry.includes('[FALLBACK_GENERATED]') || entry.includes('[MITIGATION_LOGGED]')) badgeClass = 'log-badge-failover';
      
      return `<div class="audit-log-item"><span class="audit-entry-text ${badgeClass}">${escapeHtml(entry)}</span></div>`;
    }).join('');
    
    auditLogStream.scrollTop = auditLogStream.scrollHeight;
  }

  async function processSimulatedPayment(appName = 'UPI Intent') {
    paymentLog.classList.remove('hidden');
    logText.textContent = `Transmitting ${appName} intent payload to Node.js API server...`;
    if (failoverAlertCard) failoverAlertCard.classList.add('hidden');

    const submitBtn = document.getElementById('submitPaymentBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing API Intent...';
    }

    const vpaInput = document.getElementById('upiVpaInput');
    const userVpa = vpaInput ? vpaInput.value : 'builder@razorpay';
    const isSimulateError = simulateErrorToggle ? simulateErrorToggle.checked : false;

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: 'cat_bootcamp_ai_14999',
          item_name: 'Premium AI Developer BootCamp Course',
          apply_discount: state.discountApplied,
          vpa: userVpa,
          simulate_error: isSimulateError,
          error_type: '500'
        })
      });

      const data = await response.json();

      // REQUIREMENT 1: Return audit history array inside checkout API response payload and render in UI
      if (data.audit_trail) {
        renderAuditTrailStream(data.audit_trail);
      }

      if (data.success && data.status === 'SETTLED') {
        // SUCCESSFUL CHECKOUT
        logText.textContent = `✓ Payment Authorized! TxID: #${data.transaction_id}`;
        paymentLog.style.background = 'rgba(16, 185, 129, 0.12)';
        paymentLog.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        paymentLog.style.color = 'var(--neon-emerald)';
        playSoundSuccess();

        if (submitBtn) {
          submitBtn.textContent = '✓ Paid Successfully';
          submitBtn.style.background = 'var(--neon-emerald)';
          submitBtn.disabled = false;
        }

        pricingStatusTag.textContent = '✓ ENROLLED & CONFIRMED';
        pricingStatusTag.style.color = 'var(--neon-emerald)';

      } else if (data.status === 'FALLBACK_PIVOT') {
        // REQUIREMENT 2: GRACEFUL FAILOVER HANDLING FOR MOCK 500 ERROR SEQUENCE
        logText.textContent = '⚠️ Razorpay API 500 Intercepted! Dynamically Pivoting to Fallback Recovery Link.';
        paymentLog.style.background = 'rgba(245, 158, 11, 0.12)';
        paymentLog.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        paymentLog.style.color = 'var(--neon-amber)';

        if (failoverAlertCard) {
          failoverAlertCard.classList.remove('hidden');
          if (failoverErrorCode) failoverErrorCode.textContent = data.error_code || 'RAZORPAY_API_500';
          if (failoverMessageText) failoverMessageText.textContent = data.message;
          if (fallbackRecoveryLink) fallbackRecoveryLink.href = data.fallback_url || '#';
          
          if (mitigationStepsList && data.metadata && Array.isArray(data.metadata.mitigation_steps)) {
            mitigationStepsList.innerHTML = data.metadata.mitigation_steps
              .map(step => `<li><span class="step-bullet">⚡</span> ${escapeHtml(step)}</li>`)
              .join('');
          }
        }

        if (submitBtn) {
          submitBtn.textContent = '⚠️ Fallback Recovery Link Ready';
          submitBtn.style.background = 'var(--neon-amber)';
          submitBtn.disabled = false;
        }

        playSynthSound(300, 150, 0.3, 'sawtooth', 0.1);
      }
    } catch (fetchErr) {
      console.warn('Backend API connection warning:', fetchErr);
      logText.textContent = '⚠️ API Server processing... Validating client mock.';
      setTimeout(() => {
        logText.textContent = '✓ Payment Authorized! Transaction ID: #RZP-BUILDATHON-' + Math.floor(100000 + Math.random() * 900000);
        if (submitBtn) submitBtn.disabled = false;
      }, 1000);
    }
  }

  upiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    processSimulatedPayment('VPA Direct');
  });

  upiAppBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const app = btn.getAttribute('data-app') || 'UPI App';
      processSimulatedPayment(app);
    });
  });


  // =========================================================================
  // 6. MODAL & DRAWER ENGINE
  // =========================================================================
  function openModal(modalElem) {
    if (modalElem && typeof modalElem.showModal === 'function') {
      modalElem.showModal();
    } else if (modalElem) {
      modalElem.setAttribute('open', 'true');
    }
  }

  function closeModal(modalElem) {
    if (modalElem && typeof modalElem.close === 'function') {
      modalElem.close();
    } else if (modalElem) {
      modalElem.removeAttribute('open');
    }
  }

  // View Global Audit Ledger Action
  async function loadGlobalAuditLedger() {
    openModal(auditLedgerModal);
    if (auditLedgerContentDisplay) {
      auditLedgerContentDisplay.textContent = 'Fetching live audit history array from Node.js API...';
    }
    try {
      const res = await fetch('/api/audit-ledger');
      const data = await res.json();
      if (data && data.audit_trail) {
        auditLedgerContentDisplay.textContent = JSON.stringify(data, null, 2);
      } else {
        auditLedgerContentDisplay.textContent = JSON.stringify(data, null, 2);
      }
    } catch (err) {
      auditLedgerContentDisplay.textContent = 'Error connecting to Node.js API endpoint /api/audit-ledger: ' + err.message;
    }
  }

  if (viewAuditLedgerBtn) {
    viewAuditLedgerBtn.addEventListener('click', loadGlobalAuditLedger);
  }

  // Header Nav Actions
  navTracks.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(tracksModal);
  });

  navOffer.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(offerModal);
  });

  headerApplyBtn.addEventListener('click', () => openModal(applyModal));
  inspectSchemaBtn.addEventListener('click', () => openModal(jsonModal));

  // Modal Close Handlers
  closePaymentModal.addEventListener('click', () => closeModal(paymentModal));
  closeTracksModal.addEventListener('click', () => closeModal(tracksModal));
  closeOfferModal.addEventListener('click', () => closeModal(offerModal));
  closeApplyModal.addEventListener('click', () => closeModal(applyModal));
  closeJsonModal.addEventListener('click', () => closeModal(jsonModal));
  if (closeAuditLedgerModal) {
    closeAuditLedgerModal.addEventListener('click', () => closeModal(auditLedgerModal));
  }

  // Close modals when clicking backdrop
  [paymentModal, tracksModal, offerModal, applyModal, jsonModal, auditLedgerModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeModal(modal);
      }
    });
  });

  // Application Form Submit Handler
  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    applyForm.classList.add('hidden');
    applySuccessMsg.classList.remove('hidden');
    playSoundSuccess();
  });


  // =========================================================================
  // 7. HUD METRICS DIGITAL TIME WIDGET
  // Developer Note: Standard specification fixed time is "23:47".
  // Clicking the widget toggles live clock mode.
  // =========================================================================
  function updateLiveClock() {
    if (!state.liveClockActive) return;
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    digitalClockDisplay.textContent = `${hrs}:${mins}:${secs}`;
  }

  setInterval(updateLiveClock, 1000);

  timeWidgetContainer.addEventListener('click', () => {
    state.liveClockActive = !state.liveClockActive;
    if (state.liveClockActive) {
      updateLiveClock();
      timeWidgetContainer.style.borderColor = 'var(--neon-emerald)';
    } else {
      digitalClockDisplay.textContent = '23:47';
      timeWidgetContainer.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    }
    playSoundClick();
  });

  console.log('⚡ Razorpay /buildathon ecosystem loaded successfully.');
});
