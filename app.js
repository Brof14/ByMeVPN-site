"use strict";

const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("site-nav");
const year = document.getElementById("year");
const demoToggle = document.querySelector(".demo-toggle");
const demoMockup = document.getElementById("demo-mockup");
const demoCopy = document.getElementById("demo-disclosure-copy");

if (year) year.textContent = String(new Date().getFullYear());

if (demoToggle && demoMockup && demoCopy) {
  const applyDemoState = (state) => {
    const connected = state === "connected";
    demoMockup.dataset.demoState = state;
    demoMockup.classList.toggle("is-connected", connected);
    demoMockup.classList.toggle("is-disconnected", !connected);
    demoToggle.setAttribute("aria-pressed", String(!connected));
    demoToggle.textContent = connected ? "Показать отключённое состояние" : "Показать подключённое состояние";

    const stateNode = demoMockup.querySelector(".phone-state");
    const captionNode = demoMockup.querySelector(".phone-caption");
    const indicator = demoMockup.querySelector(".connected-indicator");

    if (stateNode) {
      stateNode.innerHTML = connected
        ? '<span class="state-check" aria-hidden="true">✓</span> VPN подключён'
        : '<span class="state-check" aria-hidden="true">•</span> VPN отключён';
    }

    if (captionNode) {
      captionNode.textContent = connected
        ? "Соединение с сервером проверено"
        : "Демо-состояние без сетевого кода";
    }

    if (indicator) {
      indicator.textContent = connected ? "● онлайн" : "◌ офлайн";
      indicator.style.color = connected ? "#69d3bc" : "#9cacbd";
    }

    demoCopy.textContent = connected
      ? "Показано подключённое состояние. Демо-режим не запускает VPN и не отправляет сетевые запросы. Условия и указанный способ отмены привязаны к текущему предложению."
      : "Показано отключённое состояние. Демо-режим не запускает VPN и не отправляет сетевые запросы. Условия и указанный способ отмены привязаны к текущему предложению.";
  };

  demoToggle.addEventListener("click", () => {
    const nextState = demoMockup.dataset.demoState === "connected" ? "disconnected" : "connected";
    applyDemoState(nextState);
  });

  applyDemoState("connected");
}

if (toggle && menu) {
  const setOpen = (open) => {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });

  const media = window.matchMedia("(min-width: 821px)");
  media.addEventListener?.("change", () => setOpen(false));
}
