"use strict";

const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

if (menuButton && mobileNav) {
  const closeMenu = (restoreFocus = false) => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
    mobileNav.hidden = true;
    if (restoreFocus) menuButton.focus();
  };
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    mobileNav.hidden = !open;
  });
  mobileNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") closeMenu(true);
  });
  document.addEventListener("pointerdown", (event) => {
    if (menuButton.getAttribute("aria-expanded") === "true" && event.target instanceof Node &&
        !menuButton.contains(event.target) && !mobileNav.contains(event.target)) closeMenu();
  });
  const query = window.matchMedia("(min-width: 701px)");
  query.addEventListener?.("change", () => closeMenu());
}

const demoStage = document.getElementById("demo-stage");
const demoSwitch = document.getElementById("demo-switch");
const demoStatus = document.getElementById("demo-status-text");
const demoTitle = document.getElementById("demo-title");
const demoDescription = document.getElementById("demo-description");
const demoSupport = document.getElementById("demo-support");
const demoLive = document.getElementById("demo-live");
const demoButtons = [...document.querySelectorAll("[data-demo-state]")];
const demoStates = Object.freeze({
  off: {
    label: "VPN выключен",
    title: "Всё под твоим контролем.",
    description: "Нажми на логотип на экране, чтобы увидеть демонстрацию подключения.",
    support: "Нажмите, чтобы подключиться",
  },
  connecting: {
    label: "Подключение…",
    title: "Подключение видно сразу.",
    description: "Демо показывает переход между состояниями — без реального VPN-туннеля.",
    support: "Визуальная демонстрация подключения",
  },
  on: {
    label: "VPN запущен",
    title: "Никаких лишних действий.",
    description: "Интерфейс показывает состояние VPN. На сайте это только макет, а не подключённая сеть.",
    support: "Состояние показано в демо",
  },
});
let demoState = "off";
let demoTimer = null;

function cancelDemoTimer() {
  if (demoTimer !== null) {
    window.clearTimeout(demoTimer);
    demoTimer = null;
  }
}
function setDemoState(next) {
  if (!demoStage || !demoStates[next] || !demoSwitch || !demoStatus || !demoTitle || !demoDescription || !demoSupport) return;
  demoState = next;
  demoStage.dataset.state = next;
  demoStatus.textContent = demoStates[next].label;
  demoTitle.textContent = demoStates[next].title;
  demoDescription.textContent = demoStates[next].description;
  demoSupport.textContent = demoStates[next].support;
  demoSwitch.setAttribute("aria-pressed", String(next === "on"));
  demoSwitch.setAttribute("aria-label", next === "on" ? "Выключить демонстрацию подключения" : "Показать демонстрацию подключения");
  demoButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.demoState === next)));
  if (demoLive) demoLive.textContent = "Демонстрация: " + demoStates[next].label + ". VPN на сайте не подключается.";
}
if (demoSwitch) {
  demoSwitch.addEventListener("click", () => {
    cancelDemoTimer();
    if (demoState !== "off") return setDemoState("off");
    setDemoState("connecting");
    demoTimer = window.setTimeout(() => {
      demoTimer = null;
      setDemoState("on");
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 150 : 950);
  });
  demoButtons.forEach(button => button.addEventListener("click", () => {
    cancelDemoTimer();
    setDemoState(button.dataset.demoState);
  }));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && demoState === "connecting") {
      cancelDemoTimer();
      setDemoState("off");
    }
  });
  window.addEventListener("pagehide", cancelDemoTimer);
}

// Pricing is a static reflection of the documented bot tariff table, not a checkout.
// Always show the total upfront charge; the bot remains the payment source of truth.
const periodMonths = Object.freeze({1: 1, 3: 4, 6: 8, 12: 15});
const baseMonthlyRub = Object.freeze({1: 89, 3: 79, 6: 69, 12: 59});
const deviceSurchargeRub = Object.freeze({2: 0, 5: 20, 10: 40});
const pricingCards = [...document.querySelectorAll(".plan[data-months]")];
const tierButtons = [...document.querySelectorAll("[data-tier]")];
const rub = new Intl.NumberFormat("ru-RU");
function selectDeviceTier(tier) {
  if (!Object.hasOwn(deviceSurchargeRub, tier)) return;
  const extra = deviceSurchargeRub[tier];
  tierButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.tier === String(tier))));
  for (const card of pricingCards) {
    const months = Number(card.dataset.months);
    if (!Object.hasOwn(baseMonthlyRub, months)) continue;
    const monthly = baseMonthlyRub[months] + extra;
    const total = monthly * periodMonths[months];
    card.querySelector(".plan-price").textContent = rub.format(monthly);
    card.querySelector(".plan-total strong").textContent = rub.format(total) + " ₽";
  }
}
tierButtons.forEach(button => button.addEventListener("click", () => selectDeviceTier(Number(button.dataset.tier))));
selectDeviceTier(2);
