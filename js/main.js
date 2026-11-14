/**
 * PSS Global — Enterprise Interaction Engine
 * Apple-grade fluid interactions, mobile drawer, interactive tabs, form UX
 */

(function () {
  "use strict";

  // 1. Scroll-Aware Glassmorphic Header Elevation
  const header = document.querySelector(".site-header");
  function handleScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile Drawer Navigation with Scrim & Keyboard Trap
  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  const scrim = document.querySelector(".drawer-scrim");

  function openDrawer() {
    if (!drawer || !toggleBtn) return;
    toggleBtn.classList.add("is-active");
    toggleBtn.setAttribute("aria-expanded", "true");
    drawer.classList.add("is-open");
    if (scrim) scrim.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!drawer || !toggleBtn) return;
    toggleBtn.classList.remove("is-active");
    toggleBtn.setAttribute("aria-expanded", "false");
    drawer.classList.remove("is-open");
    if (scrim) scrim.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      const isOpen = drawer.classList.contains("is-open");
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (scrim) {
    scrim.addEventListener("click", closeDrawer);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) {
      closeDrawer();
    }
  });

  // Close drawer when link clicked
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeDrawer);
    });
  }

  // 3. Segmented Control / Interactive Tab Switching (Apple Style)
  const tabContainers = document.querySelectorAll("[data-tabs]");
  tabContainers.forEach(function (container) {
    const buttons = container.querySelectorAll(".segmented-btn");
    const targetGroup = container.getAttribute("data-tabs");
    const panels = document.querySelectorAll(`[data-tab-group="${targetGroup}"]`);

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const selectedTab = btn.getAttribute("data-tab-target");

        panels.forEach(function (panel) {
          const panelCategory = panel.getAttribute("data-tab-category");
          if (selectedTab === "all" || panelCategory === selectedTab) {
            panel.style.display = "";
            panel.style.opacity = "0";
            panel.style.transform = "translateY(8px)";
            requestAnimationFrame(() => {
              panel.style.transition = "opacity 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1)";
              panel.style.opacity = "1";
              panel.style.transform = "translateY(0)";
            });
          } else {
            panel.style.display = "none";
          }
        });
      });
    });
  });

  // 4. Automatic Dynamic Year
  const yearEls = document.querySelectorAll(".current-year");
  const currentYear = new Date().getFullYear();
  yearEls.forEach(function (el) {
    el.textContent = currentYear;
  });

  // 5. Client Enquiry Form Handler (Resend Integration)
  const enquiryForm = document.getElementById("enquiry-form");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const statusBox = document.getElementById("form-status");
      const submitBtn = document.getElementById("submit-btn");
      const btnText = document.getElementById("btn-text");
      const btnSpinner = document.getElementById("btn-spinner");

      const nameVal = document.getElementById("name").value.trim();
      const companyVal = document.getElementById("company").value.trim();
      const emailVal = document.getElementById("email").value.trim();
      const phoneVal = document.getElementById("phone").value.trim();
      const serviceVal = document.getElementById("service").value;
      const messageVal = document.getElementById("message").value.trim();

      // Client-side quick check
      if (!nameVal || !emailVal || !serviceVal || !messageVal) {
        if (statusBox) {
          statusBox.className = "status-error";
          statusBox.style.display = "block";
          statusBox.innerHTML = "<strong>Please fill in all required fields</strong> (Name, Work Email, Service Requirement, and Details).";
        }
        return;
      }

      // Button Loading State
      if (submitBtn) submitBtn.disabled = true;
      if (btnSpinner) btnSpinner.style.display = "inline-block";
      if (btnText) btnText.textContent = "Transmitting Enquiry...";
      if (statusBox) statusBox.style.display = "none";

      const payload = {
        name: nameVal,
        company: companyVal,
        email: emailVal,
        phone: phoneVal,
        service: serviceVal,
        message: messageVal
      };

      try {
        const response = await fetch("send-enquiry.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          enquiryForm.reset();
          if (statusBox) {
            statusBox.className = "status-success";
            statusBox.style.display = "block";
            statusBox.innerHTML = `
              <div style="display:flex; align-items:flex-start; gap:12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" style="flex-shrink:0; margin-top:2px;"><polyline points="20 6 9 17 4 12"/></svg>
                <div>
                  <strong style="color:#065f46; font-size:0.98rem; display:block; margin-bottom:4px;">Enquiry Dispatched Successfully</strong>
                  <p style="margin:0; font-size:0.9rem; color:#047857; line-height:1.5;">${result.message || "Thank you. Your requirement has been routed directly to our leadership team. We will review your scope and get in touch promptly."}</p>
                </div>
              </div>
            `;
          }
          if (btnText) btnText.textContent = "Enquiry Submitted";
          setTimeout(() => {
            if (submitBtn) submitBtn.disabled = false;
            if (btnText) btnText.textContent = "Submit Client Enquiry";
            if (btnSpinner) btnSpinner.style.display = "none";
          }, 4000);
        } else {
          throw new Error(result.error || "Failed to transmit enquiry. Please reach out via email directly.");
        }
      } catch (err) {
        if (statusBox) {
          statusBox.className = "status-error";
          statusBox.style.display = "block";
          statusBox.innerHTML = `<strong>Submission Error:</strong> ${err.message || "Unable to send enquiry. Please contact us directly at contact@pssglobal.co.in"}`;
        }
        if (submitBtn) submitBtn.disabled = false;
        if (btnSpinner) btnSpinner.style.display = "none";
        if (btnText) btnText.textContent = "Submit Client Enquiry";
      }
    });
  }

  // ==========================================================================
  // 6. MULTIMODAL FEEDBACK (Rule 13: Motion, Sound & Haptics on the SAME Frame)
  // ==========================================================================
  let audioCtx = null;
  function playTactileFeedback(type = "light") {
    // 1. Physical Haptics (Navigator Vibration API)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (type === "medium") {
        navigator.vibrate(10);
      } else if (type === "success") {
        navigator.vibrate([8, 40, 12]);
      } else {
        navigator.vibrate(6);
      }
    }

    // 2. Subtle Web Audio API Synthetic Tactile Click (Zero external assets, 0 latency)
    try {
      if (!audioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) audioCtx = new AudioClass();
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      if (audioCtx) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === "snap" || type === "medium") {
          osc.frequency.setValueAtTime(650, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.02);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
          osc.start(now);
          osc.stop(now + 0.02);
        } else {
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(280, now + 0.012);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
          osc.start(now);
          osc.stop(now + 0.012);
        }
      }
    } catch (_) {}
  }

  // 01 Respond on press: scale .97 · 100ms. Feedback on touch-down, never on release.
  // 10 Gesture details: ~10px cancellation threshold
  document.querySelectorAll(".btn, .ios-segment-btn, .ios-social-btn, .btn-close-ios").forEach(function (btn) {
    let startX = 0, startY = 0;
    
    btn.addEventListener("pointerdown", function (e) {
      startX = e.clientX;
      startY = e.clientY;
      btn.classList.add("is-pressed");
      playTactileFeedback("light");
    }, { passive: true });

    btn.addEventListener("pointermove", function (e) {
      if (btn.classList.contains("is-pressed")) {
        // ~10px hysteresis threshold to cancel active highlight if finger drifts
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist > 10) {
          btn.classList.remove("is-pressed");
        }
      }
    }, { passive: true });

    btn.addEventListener("pointerup", function () {
      btn.classList.remove("is-pressed");
    }, { passive: true });

    btn.addEventListener("pointercancel", function () {
      btn.classList.remove("is-pressed");
    }, { passive: true });
  });

  // ==========================================================================
  // 7. WWDC FLUID SPRING ENGINE (Rules 02, 03, 04, 05, 06, 07, 08, 09, 10, 11)
  // ==========================================================================

  // 04 Springs, not curves: Analytical Second-Order Differential Spring Solver
  // damping (zeta): 1.0 = critically damped (no overshoot), 0.8 = underdamped bounce
  // response (tau): seconds to reach target (0.35s)
  class SpringPhysics {
    constructor(damping = 1.0, response = 0.35) {
      this.zeta = damping;
      this.response = response;
      this.omega = (2 * Math.PI) / response;
    }

    solve(t, initialDisplacement, initialVelocity) {
      const z = this.zeta;
      const w = this.omega;
      const x0 = initialDisplacement;
      const v0 = initialVelocity;

      if (Math.abs(z - 1.0) < 1e-4) {
        // Critically damped (zeta == 1.0)
        const c1 = x0;
        const c2 = v0 + w * x0;
        const decay = Math.exp(-w * t);
        const x = (c1 + c2 * t) * decay;
        const v = (c2 - w * (c1 + c2 * t)) * decay;
        return { x, v };
      } else if (z < 1.0) {
        // Underdamped (zeta < 1.0)
        const wd = w * Math.sqrt(1 - z * z);
        const c1 = x0;
        const c2 = (v0 + z * w * x0) / wd;
        const decay = Math.exp(-z * w * t);
        const sin = Math.sin(wd * t);
        const cos = Math.cos(wd * t);
        const x = decay * (c1 * cos + c2 * sin);
        const v = decay * (- (z * w * (c1 * cos + c2 * sin)) + (-c1 * wd * sin + c2 * wd * cos));
        return { x, v };
      } else {
        // Overdamped (zeta > 1.0)
        const s = Math.sqrt(z * z - 1);
        const r1 = -w * (z - s);
        const r2 = -w * (z + s);
        const c2 = (v0 - r1 * x0) / (r2 - r1);
        const c1 = x0 - c2;
        const x = c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
        const v = c1 * r1 * Math.exp(r1 * t) + c2 * r2 * Math.exp(r2 * t);
        return { x, v };
      }
    }
  }

  // 09 Rubber-banding: Edges resist softly instead of stopping dead
  function rubberband(overshoot, dimension, constant = 0.55) {
    return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
  }

  // 06 Momentum: Predict where a throw would land
  function projectMomentum(initialVelocity, decelerationRate = 0.998) {
    return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
  }

  const modalScrim = document.getElementById("signup-modal-scrim");
  const modalSheet = document.getElementById("signup-modal-sheet");
  const modalCloseBtn = document.getElementById("signup-modal-close");
  const modalOpenTriggers = document.querySelectorAll('[data-open-modal="signup-modal"]');
  const grabberArea = document.querySelector(".ios-sheet-grabber-area");

  let isSheetOpen = false;
  let isDragging = false;
  let hasPassedDragThreshold = false;
  let startPointerY = 0;
  let grabOffsetY = 0; // 02 Keep your grab point
  let currentSheetY = 0; // Live presentation value
  let pointerHistory = [];
  let sheetHeight = 520;
  let activeSpringRaf = null;

  // 03 Interruptibility: cancel active spring mid-flight from current live position
  function cancelRunningSpring() {
    if (activeSpringRaf) {
      cancelAnimationFrame(activeSpringRaf);
      activeSpringRaf = null;
    }
  }

  // Run interruptible spring physics loop
  function runSpringAnimation({ toY, initialVel = 0, damping = 1.0, response = 0.35, onComplete }) {
    cancelRunningSpring();

    // 14 Reduced motion check
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentSheetY = toY;
      modalSheet.style.transform = toY === 0 ? "translateY(0)" : `translateY(${toY}px)`;
      if (modalScrim) modalScrim.style.opacity = toY === 0 ? "1" : "0";
      if (onComplete) onComplete();
      return;
    }

    const spring = new SpringPhysics(damping, response);
    const startY = currentSheetY;
    const initialDisplacement = startY - toY;
    const startTime = performance.now();

    function frame(now) {
      const t = (now - startTime) / 1000;
      const res = spring.solve(t, initialDisplacement, initialVel);
      currentSheetY = toY + res.x;

      // 08 Hint the direction: subtle scale telegraphing collapse
      const progress = Math.min(1, Math.max(0, currentSheetY / sheetHeight));
      const scaleHint = (1 - 0.04 * progress).toFixed(4);

      modalSheet.style.transform = `translateY(${currentSheetY.toFixed(2)}px) scale(${scaleHint})`;

      if (modalScrim) {
        const scrimAlpha = Math.max(0, 1 - (currentSheetY / (sheetHeight * 0.9)));
        modalScrim.style.opacity = scrimAlpha.toFixed(3);
      }

      // Settle check
      if (Math.abs(res.x) < 0.25 && Math.abs(res.v) < 8) {
        currentSheetY = toY;
        modalSheet.style.transform = toY === 0 ? "translateY(0) scale(1)" : `translateY(${toY}px)`;
        activeSpringRaf = null;
        if (onComplete) onComplete();
      } else {
        activeSpringRaf = requestAnimationFrame(frame);
      }
    }

    activeSpringRaf = requestAnimationFrame(frame);
  }

  // 07 Spatial consistency: Anchor interactions to their trigger source
  function setSpatialOrigin(triggerEl) {
    if (!triggerEl || !modalSheet || window.innerWidth <= 768) return;
    const triggerRect = triggerEl.getBoundingClientRect();
    const modalRect = modalSheet.getBoundingClientRect();
    const modalCenterX = window.innerWidth / 2;
    const modalCenterY = window.innerHeight / 2;
    
    // Calculate relative offset of trigger to modal center
    const originX = ((triggerRect.left + triggerRect.width / 2) - (modalCenterX - modalRect.width / 2));
    const originY = ((triggerRect.top + triggerRect.height / 2) - (modalCenterY - modalRect.height / 2));
    modalSheet.style.transformOrigin = `${originX}px ${originY}px`;
  }

  function openSignupModal(triggerEl) {
    if (!modalSheet || !modalScrim) return;
    cancelRunningSpring();
    isSheetOpen = true;
    sheetHeight = modalSheet.offsetHeight || 520;

    // Anchor desktop presentation to trigger
    if (triggerEl) setSpatialOrigin(triggerEl);

    playTactileFeedback("medium");
    modalScrim.classList.add("is-open");
    modalSheet.classList.add("is-open");
    document.body.style.overflow = "hidden";

    if (window.innerWidth <= 768) {
      // Start from 100% offscreen and spring to resting 0
      currentSheetY = sheetHeight;
      modalSheet.style.transform = `translateY(${sheetHeight}px)`;
      runSpringAnimation({
        toY: 0,
        initialVel: 0,
        damping: 1.0, // critically damped
        response: 0.36
      });
    }

    // Auto-focus first field after settle on desktop
    setTimeout(() => {
      const firstInput = modalSheet.querySelector("input:not([type='hidden'])");
      if (firstInput && window.innerWidth > 768) {
        firstInput.focus();
      }
    }, 280);
  }

  function closeSignupModal() {
    if (!modalSheet || !modalScrim || !isSheetOpen) return;
    isSheetOpen = false;
    playTactileFeedback("light");

    if (window.innerWidth <= 768) {
      // 07 Spatial consistency: Leave the way it came in
      runSpringAnimation({
        toY: sheetHeight,
        initialVel: 0,
        damping: 1.0,
        response: 0.32,
        onComplete: cleanupAfterClose
      });
    } else {
      modalScrim.classList.remove("is-open");
      modalSheet.classList.remove("is-open");
      cleanupAfterClose();
    }
  }

  function cleanupAfterClose() {
    cancelRunningSpring();
    modalScrim.classList.remove("is-open");
    modalSheet.classList.remove("is-open");
    modalSheet.classList.remove("is-dragging");
    modalSheet.style.transform = "";
    modalSheet.style.transformOrigin = "";
    if (modalScrim) modalScrim.style.opacity = "";
    document.body.style.overflow = "";
    currentSheetY = 0;
  }

  // Open triggers
  modalOpenTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      openSignupModal(trigger);
    });
  });

  // Close triggers
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeSignupModal();
    });
  }

  if (modalScrim) {
    modalScrim.addEventListener("click", function () {
      closeSignupModal();
    });
  }

  // Keyboard accessibility
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isSheetOpen) {
      closeSignupModal();
    }
  });

  // ==========================================================================
  // DIRECT MANIPULATION GESTURE CONTROLLER (Rules 02, 03, 05, 06, 08, 09, 10)
  // ==========================================================================
  if (grabberArea && modalSheet) {
    grabberArea.addEventListener("pointerdown", onPointerDown);
  }

  function onPointerDown(e) {
    if (window.innerWidth > 768 || !isSheetOpen) return;

    // 03 Interruptible: Interrupt ongoing spring instantly
    cancelRunningSpring();

    // 02 Direct manipulation: Pointer capture & keep grab point
    grabberArea.setPointerCapture(e.pointerId);
    isDragging = true;
    hasPassedDragThreshold = false;
    modalSheet.classList.add("is-dragging");

    startPointerY = e.clientY;
    const sheetRect = modalSheet.getBoundingClientRect();
    grabOffsetY = e.clientY - sheetRect.top; // Respect grab point

    pointerHistory = [{ t: performance.now(), y: e.clientY }];

    grabberArea.addEventListener("pointermove", onPointerMove);
    grabberArea.addEventListener("pointerup", onPointerUp);
    grabberArea.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerMove(e) {
    if (!isDragging) return;

    const deltaY = e.clientY - startPointerY;

    // 10 Gesture details: ~10px hysteresis threshold before drag commits
    if (!hasPassedDragThreshold) {
      if (Math.abs(deltaY) > 8) {
        hasPassedDragThreshold = true;
      } else {
        return;
      }
    }

    const now = performance.now();
    pointerHistory.push({ t: now, y: e.clientY });
    if (pointerHistory.length > 5) pointerHistory.shift();

    if (deltaY < 0) {
      // 09 Rubber-banding: Edges resist softly past boundary (constant 0.55)
      const dampedY = rubberband(deltaY, sheetHeight, 0.55);
      currentSheetY = dampedY;
      modalSheet.style.transform = `translateY(${dampedY.toFixed(2)}px)`;
    } else {
      // 02 Move 1:1 with finger
      currentSheetY = deltaY;
      // 08 Hint direction: subtle scale hint while pulling down
      const progress = Math.min(1, currentSheetY / sheetHeight);
      const scaleHint = (1 - 0.04 * progress).toFixed(4);
      modalSheet.style.transform = `translateY(${currentSheetY.toFixed(2)}px) scale(${scaleHint})`;

      if (modalScrim) {
        const scrimAlpha = Math.max(0, 1 - (currentSheetY / (sheetHeight * 0.9)));
        modalScrim.style.opacity = scrimAlpha.toFixed(3);
      }
    }
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    modalSheet.classList.remove("is-dragging");

    grabberArea.removeEventListener("pointermove", onPointerMove);
    grabberArea.removeEventListener("pointerup", onPointerUp);
    grabberArea.removeEventListener("pointercancel", onPointerUp);

    // 05 Velocity handoff: Calculate flick speed
    let releaseVelocity = 0;
    if (pointerHistory.length >= 2) {
      const first = pointerHistory[0];
      const last = pointerHistory[pointerHistory.length - 1];
      const dt = (last.t - first.t) / 1000;
      if (dt > 0) {
        releaseVelocity = (last.y - first.y) / dt; // px/sec
      }
    }

    // 06 Momentum projection: Predict where a throw lands (d ≈ 0.998)
    const projectedOffset = currentSheetY + projectMomentum(releaseVelocity, 0.998);

    // Decision rule: Decide reverse vs commit using velocity sign + projected endpoint
    const isDownwardFlick = releaseVelocity > 450;
    const isProjectedPastThreshold = projectedOffset > sheetHeight * 0.4;
    const isDraggedPastThreshold = currentSheetY > sheetHeight * 0.35;

    if (isDownwardFlick || isProjectedPastThreshold || isDraggedPastThreshold) {
      // Dismiss along same path with velocity handoff
      playTactileFeedback("light");
      isSheetOpen = false;
      runSpringAnimation({
        toY: sheetHeight,
        initialVel: releaseVelocity,
        damping: releaseVelocity > 400 ? 0.82 : 1.0, // slight bounce on momentum flick
        response: 0.32,
        onComplete: cleanupAfterClose
      });
    } else {
      // Spring back to resting state (critically damped, no overshoot)
      playTactileFeedback("snap");
      runSpringAnimation({
        toY: 0,
        initialVel: releaseVelocity,
        damping: 1.0, // 04 Critically damped default
        response: 0.35
      });
    }
  }

  // 8. Apple Segmented Control Switcher
  const segmentBtns = document.querySelectorAll(".ios-segment-btn");
  segmentBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      segmentBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      playTactileFeedback("medium");

      const role = btn.getAttribute("data-role");
      const companyField = document.getElementById("ios-field-company-row");
      const roleLabel = document.getElementById("ios-label-role");
      const roleInput = document.getElementById("ios-signup-role");

      if (roleInput) roleInput.value = role;

      if (companyField) {
        if (role === "candidate") {
          companyField.style.display = "none";
          if (roleLabel) roleLabel.textContent = "Desired Job Title / Skill";
        } else {
          companyField.style.display = "flex";
          if (roleLabel) roleLabel.textContent = "Work Email";
        }
      }
    });
  });

  // 9. iOS Signup Form Submission Handler
  const signupForm = document.getElementById("ios-signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const submitBtn = signupForm.querySelector(".btn-ios-submit");
      const submitText = submitBtn ? submitBtn.querySelector("span") : null;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.75";
      }
      if (submitText) {
        submitText.textContent = "Creating Account...";
      }

      playTactileFeedback("medium");

      setTimeout(() => {
        playTactileFeedback("success");
        const bodyContent = document.getElementById("ios-modal-body-content");
        if (bodyContent) {
          bodyContent.innerHTML = `
            <div class="ios-modal-success">
              <div class="ios-success-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 6px; color: var(--pss-navy-950);">Welcome to PSS Global</h3>
              <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5;">Your account profile has been initiated. Our team will verify your credentials and send a confirmation to your inbox.</p>
              <button type="button" class="btn btn-primary btn-pill" id="ios-success-done" style="width: 100%; padding: 12px 20px;">Done</button>
            </div>
          `;
          const doneBtn = document.getElementById("ios-success-done");
          if (doneBtn) {
            doneBtn.addEventListener("click", closeSignupModal);
          }
        }
      }, 1000);
    });
  }

})();
