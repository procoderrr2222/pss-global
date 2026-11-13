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

})();
