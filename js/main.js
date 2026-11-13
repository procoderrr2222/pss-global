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

})();
