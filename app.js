"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("site-nav");
const year = document.getElementById("year");
const demoToggle = document.getElementById("demo-toggle");
const demoScreen = document.getElementById("demo-screen");
const demoState = document.getElementById("demo-state-visible");
const demoHint = document.getElementById("demo-hint");
const demoAnnouncement = document.getElementById("demo-announcement");

document.querySelectorAll(".brand img, .app-brand img, .footer-brand img, .shield-mark img").forEach((image) => {
  const showFallback = () => image.closest(".brand, .app-brand, .footer-brand, .shield-mark")?.classList.add("logo-fallback");
  image.addEventListener("error", showFallback, { once: true });
  if (image.complete && image.naturalWidth === 0) showFallback();
});

if (year) year.textContent = String(new Date().getFullYear());

if (menuToggle && menu) {
  const setMenuOpen = (open) => {
    menu.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      menuToggle.getAttribute("aria-expanded") === "true" &&
      event.target instanceof Node &&
      !menu.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  const desktopNav = window.matchMedia("(min-width: 821px)");
  desktopNav.addEventListener?.("change", () => setMenuOpen(false));
}

if (demoToggle && demoScreen && demoState && demoHint && demoAnnouncement) {
  demoToggle.addEventListener("click", () => {
    const connected = demoToggle.getAttribute("aria-pressed") !== "true";
    const label = connected ? "VPN запущен" : "VPN выключен";

    demoToggle.setAttribute("aria-pressed", String(connected));
    demoToggle.textContent = `Показать VPN: ${connected ? "выключен" : "запущен"}`;
    demoScreen.dataset.state = connected ? "connected" : "off";
    demoState.textContent = label;
    demoHint.textContent = connected ? "Демо, без реального подключения" : "Нажмите, чтобы подключиться";
    demoAnnouncement.textContent = `Демо: отображается состояние «${label}». Реальное подключение не запускалось.`;
  });
}
