"use strict";

// Marketing-site interactions only. No VPN, account, payment or tracking requests.
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
    const opened = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(opened));
    menuButton.setAttribute("aria-label", opened ? "Закрыть меню" : "Открыть меню");
    mobileNav.hidden = !opened;
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

// Source material: 2026 app V2 design PNGs committed under assets/app.
// Screens are *design references*; their data are example values, never account state.
const screens = Object.freeze({
  off: {
    path: "assets/app/home-off.png",
    title: "VPN выключен",
    alt: "Дизайн-макет главного экрана ByMeVPN с выключенным VPN",
    summary: "Кнопка подключения, текущий статус и информация о подписке — на одном экране.",
  },
  on: {
    path: "assets/app/home-on.png",
    title: "VPN подключён",
    alt: "Дизайн-макет главного экрана ByMeVPN в состоянии подключённого VPN",
    summary: "Пример того, как меняются кольцо и текст статуса при подключении. VPN на сайте не запускается.",
  },
  servers: {
    path: "assets/app/servers.png",
    title: "Выбор сервера",
    alt: "Дизайн-макет списка серверов ByMeVPN с автоматическим выбором",
    summary: "Автоматический выбор и список серверов. На изображении приведены демонстрационные узлы.",
  },
  account: {
    path: "assets/app/account.png",
    title: "Аккаунт",
    alt: "Дизайн-макет аккаунта ByMeVPN со сроком подписки и устройствами",
    summary: "Представление срока, устройств и продления. Числа на макете не связаны с реальным аккаунтом.",
  },
  settings: {
    path: "assets/app/settings.png",
    title: "Настройки",
    alt: "Дизайн-макет настроек ByMeVPN",
    summary: "Предусмотренные в дизайне настройки. Их фактическая доступность зависит от версии приложения.",
  },
  pricing: {
    path: "assets/app/pricing.png",
    title: "Тарифы",
    alt: "Дизайн-макет выбора тарифа внутри приложения ByMeVPN",
    summary: "Макет выбора срока и количества устройств. Актуальные суммы перед оплатой проверяются в боте.",
  },
});

const stage = document.getElementById("demo-stage");
const image = document.getElementById("demo-screen");
const description = document.getElementById("screen-description");
const live = document.getElementById("demo-live");
const buttons = [...document.querySelectorAll(".showcase-controls button[data-screen]")];
const preloaded = new Set();
function showScreen(name) {
  const item = screens[name];
  if (!item || !image || !stage || !description) return;
  image.src = item.path;
  image.alt = item.alt;
  stage.dataset.screen = name;
  description.textContent = item.summary;
  buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.screen === name)));
  if (live) live.textContent = "Показан дизайн-макет: " + item.title + ". Демонстрационные данные.";
}
buttons.forEach(button => {
  button.addEventListener("click", () => showScreen(button.dataset.screen));
  button.addEventListener("mouseenter", () => {
    const item = screens[button.dataset.screen];
    if (item && !preloaded.has(item.path)) {
      const preload = new Image();
      preload.src = item.path;
      preloaded.add(item.path);
    }
  }, { once: true });
});

// Static presentation of documented bot price constants. Actual checkout is in the bot.
const periodMonths = Object.freeze({1: 1, 3: 4, 6: 8, 12: 15});
const baseMonthlyRub = Object.freeze({1: 89, 3: 79, 6: 69, 12: 59});
const deviceSurchargeRub = Object.freeze({2: 0, 5: 20, 10: 40});
const plans = [...document.querySelectorAll(".plan[data-months]")];
const tiers = [...document.querySelectorAll("[data-tier]")];
const format = new Intl.NumberFormat("ru-RU");
function setTier(devices) {
  if (!Object.hasOwn(deviceSurchargeRub, devices)) return;
  tiers.forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.tier) === devices)));
  for (const card of plans) {
    const months = Number(card.dataset.months);
    if (!Object.hasOwn(baseMonthlyRub, months)) continue;
    const monthly = baseMonthlyRub[months] + deviceSurchargeRub[devices];
    card.querySelector(".plan-price").textContent = format.format(monthly);
    card.querySelector(".plan-total strong").textContent = format.format(monthly * periodMonths[months]) + " ₽";
  }
}
tiers.forEach(button => button.addEventListener("click", () => setTier(Number(button.dataset.tier))));
setTier(2);
