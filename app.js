"use strict";

// No tracking, payment, account or VPN network operations are performed on this website.
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
if (menuButton && mobileNav) {
  const closeMenu = (focus = false) => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
    mobileNav.hidden = true;
    if (focus) menuButton.focus();
  };
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    mobileNav.hidden = !open;
  });
  mobileNav.addEventListener("click", event => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") closeMenu(true);
  });
  document.addEventListener("pointerdown", event => {
    if (event.target instanceof Node && !menuButton.contains(event.target) && !mobileNav.contains(event.target)) closeMenu();
  });
  window.matchMedia("(min-width: 761px)").addEventListener?.("change", () => closeMenu());
}

// Product UI demo. A visual-only state machine, never a VPN connection.
const demoStage = document.getElementById("demo-stage");
const demoSwitch = document.getElementById("demo-switch");
const demoLabel = document.getElementById("demo-status-text");
const demoHeading = document.getElementById("demo-heading");
const demoDescription = document.getElementById("demo-description");
const demoSupport = document.getElementById("demo-support");
const demoLive = document.getElementById("demo-live");
const demoControls = [...document.querySelectorAll("[data-demo-state]")];
const states = Object.freeze({
  off: {
    label: "VPN выключен",
    heading: "Ты управляешь подключением.",
    description: "Нажми на большой логотип в телефоне, чтобы увидеть изменение состояния.",
    support: "Нажми, чтобы подключиться",
  },
  connecting: {
    label: "Подключение…",
    heading: "Каждый этап виден.",
    description: "Макет показывает переход между состояниями подключения.",
    support: "Демонстрация подключения",
  },
  on: {
    label: "VPN запущен",
    heading: "Всё на своём месте.",
    description: "Интерфейс отображает состояние VPN. Это только демо, не подключение к серверу.",
    support: "Состояние показано в демо",
  },
});
let demoState = "off";
let demoTimer = null;
function cancelDemo() {
  if (demoTimer !== null) {
    window.clearTimeout(demoTimer);
    demoTimer = null;
  }
}
function setDemoState(next) {
  if (!states[next] || !demoStage || !demoSwitch || !demoLabel || !demoHeading || !demoDescription || !demoSupport) return;
  demoState = next;
  demoStage.dataset.state = next;
  demoLabel.textContent = states[next].label;
  demoHeading.textContent = states[next].heading;
  demoDescription.textContent = states[next].description;
  demoSupport.textContent = states[next].support;
  demoControls.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.demoState === next)));
  demoSwitch.setAttribute("aria-pressed", String(next === "on"));
  demoSwitch.setAttribute("aria-label", next === "on" ? "Отключить демонстрацию" : "Показать демонстрацию подключения");
  if (demoLive) demoLive.textContent = "Демонстрация: " + states[next].label + ". VPN не подключается.";
}
if (demoSwitch) {
  demoSwitch.addEventListener("click", () => {
    cancelDemo();
    if (demoState !== "off") return setDemoState("off");
    setDemoState("connecting");
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 120 : 900;
    demoTimer = window.setTimeout(() => { demoTimer = null; setDemoState("on"); }, duration);
  });
  demoControls.forEach(button => {
    button.addEventListener("click", () => {
      cancelDemo();
      setDemoState(button.dataset.demoState);
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && demoState === "connecting") {
      cancelDemo();
      setDemoState("off");
    }
  });
  window.addEventListener("pagehide", cancelDemo);
}

// A static tariff preview from ByMeVPN_bot/constants.py; the bot controls the real checkout.
const periodMonths = Object.freeze({1: 1, 3: 4, 6: 8, 12: 15});
const baseMonthlyRub = Object.freeze({1: 89, 3: 79, 6: 69, 12: 59});
const deviceSurchargeRub = Object.freeze({2: 0, 5: 20, 10: 40});
const cards = [...document.querySelectorAll(".plan[data-months]")];
const tierButtons = [...document.querySelectorAll("[data-tier]")];
const formatRub = new Intl.NumberFormat("ru-RU");
function setTier(devices) {
  if (!Object.hasOwn(deviceSurchargeRub, devices)) return;
  tierButtons.forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.tier) === devices)));
  for (const card of cards) {
    const term = Number(card.dataset.months);
    if (!Object.hasOwn(baseMonthlyRub, term)) continue;
    const monthly = baseMonthlyRub[term] + deviceSurchargeRub[devices];
    const upfront = monthly * periodMonths[term];
    card.querySelector(".plan-price").textContent = formatRub.format(monthly);
    card.querySelector(".plan-total strong").textContent = formatRub.format(upfront) + " ₽";
  }
}
tierButtons.forEach(button => button.addEventListener("click", () => setTier(Number(button.dataset.tier))));
setTier(2);
