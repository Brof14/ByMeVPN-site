"use strict";

// This marketing page has no access to user sessions, VPN tunnels or payment APIs.
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const menu = document.querySelector(".menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
if (menu && mobileNav) {
  const close = (focus = false) => {
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Открыть меню");
    mobileNav.hidden = true;
    if (focus) menu.focus();
  };
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    mobileNav.hidden = !open;
  });
  mobileNav.addEventListener("click", event => {
    if (event.target instanceof Element && event.target.closest("a")) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") close(true);
  });
  document.addEventListener("pointerdown", event => {
    if (event.target instanceof Node && !menu.contains(event.target) && !mobileNav.contains(event.target)) close();
  });
  window.matchMedia("(min-width: 741px)").addEventListener?.("change", () => close());
}

// These screens are V2 design references from the Android repository;
// each image contains illustrative, not live, subscription and connection data.
const screens = Object.freeze({
  on: {
    src: "assets/app/home-on.png",
    title: "Подключение",
    alt: "Дизайн-макет главного экрана ByMeVPN со статусом подключённого VPN",
    description: "Крупная кнопка, статус соединения и выбранный сервер."
  },
  servers: {
    src: "assets/app/servers.png",
    title: "Серверы",
    alt: "Дизайн-макет выбора сервера в приложении ByMeVPN",
    description: "Автоматический выбор или список серверов, доступных по подписке."
  },
  account: {
    src: "assets/app/account.png",
    title: "Аккаунт",
    alt: "Дизайн-макет аккаунта ByMeVPN со сроком подписки",
    description: "Срок доступа, лимит устройств и сведения о подписке."
  },
  settings: {
    src: "assets/app/settings.png",
    title: "Настройки",
    alt: "Дизайн-макет настроек ByMeVPN",
    description: "Параметры приложения собраны отдельно от главного экрана."
  },
  pricing: {
    src: "assets/app/pricing.png",
    title: "Тарифы",
    alt: "Дизайн-макет выбора тарифа внутри приложения ByMeVPN",
    description: "Срок подписки и количество устройств перед покупкой."
  }
});
const stage = document.getElementById("demo-stage");
const preview = document.getElementById("demo-screen");
const screenDesc = document.getElementById("screen-description");
const screenTitle = document.getElementById("screen-title");
const live = document.getElementById("demo-live");
const selectors = [...document.querySelectorAll(".display-tabs button[data-screen]")];
function selectScreen(key) {
  const next = screens[key];
  if (!next || !stage || !preview || !screenDesc) return;
  stage.dataset.screen = key;
  preview.src = next.src;
  preview.alt = next.alt;
  screenDesc.textContent = next.description;
  if (screenTitle) screenTitle.textContent = next.title + ".";
  preview.classList.remove("preview-swap");
  void preview.offsetWidth;
  preview.classList.add("preview-swap");
  selectors.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.screen === key)));
  if (live) live.textContent = "Показан дизайн-макет экрана: " + next.title + ". Данные примерные, VPN не подключается.";
}
selectors.forEach(button => {
  button.addEventListener("click", () => selectScreen(button.dataset.screen));
});

// Snapshot of the source tariff constants, NOT a quote from the live backend.
const periodMonths = Object.freeze({1: 1, 3: 4, 6: 8, 12: 15});
const baseMonthlyRub = Object.freeze({1: 89, 3: 79, 6: 69, 12: 59});
const deviceSurchargeRub = Object.freeze({2: 0, 5: 20, 10: 40});
const planRows = [...document.querySelectorAll(".plan[data-months]")];
const deviceButtons = [...document.querySelectorAll(".device-options button[data-tier]")];
const rub = new Intl.NumberFormat("ru-RU");
function selectTier(devices) {
  if (!Object.hasOwn(deviceSurchargeRub, devices)) return;
  const extra = deviceSurchargeRub[devices];
  deviceButtons.forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.tier) === devices)));
  for (const row of planRows) {
    const term = Number(row.dataset.months);
    if (!Object.hasOwn(baseMonthlyRub, term)) continue;
    const monthly = baseMonthlyRub[term] + extra;
    const total = monthly * periodMonths[term];
    row.querySelector(".plan-price").textContent = rub.format(monthly);
    row.querySelector(".plan-total strong").textContent = rub.format(total) + " ₽";
  }
}
deviceButtons.forEach(button => button.addEventListener("click", () => selectTier(Number(button.dataset.tier))));
selectTier(2);
