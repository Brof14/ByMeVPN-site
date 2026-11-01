"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("site-nav");
const year = document.getElementById("year");
const demoToggle = document.getElementById("demo-toggle");
const demoScreen = document.getElementById("demo-screen");
const demoState = document.getElementById("demo-state-visible");
const demoHint = document.getElementById("demo-hint");
const demoAnnouncement = document.getElementById("demo-announcement");
const cinematicStage = document.querySelector(".cinematic-stage");
const androidReleaseCard = document.querySelector(".android-download-card");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document
  .querySelectorAll(
    ".brand img, .app-brand img, .footer-brand img, .shield-mark img",
  )
  .forEach((image) => {
    const showFallback = () =>
      image
        .closest(".brand, .app-brand, .footer-brand, .shield-mark")
        ?.classList.add("logo-fallback");
    image.addEventListener("error", showFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) showFallback();
  });

if (year) year.textContent = String(new Date().getFullYear());

if (menuToggle && menu) {
  const setMenuOpen = (open) => {
    menu.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      open ? "Закрыть меню" : "Открыть меню",
    );
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a"))
      setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuToggle.getAttribute("aria-expanded") === "true"
    ) {
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
    demoToggle.setAttribute(
      "aria-label",
      `Показать состояние VPN: ${connected ? "выключен" : "запущен"}`,
    );
    demoScreen.dataset.state = connected ? "connected" : "off";
    demoState.textContent = label;
    demoHint.textContent = connected
      ? "Демо: реальное подключение не запускается"
      : "Нажмите, чтобы подключиться";
    demoAnnouncement.textContent = `Демо: отображается состояние «${label}». Реальное подключение не запускалось.`;
  });
}

if (androidReleaseCard) {
  const isHttpsUrl = (value) => {
    try {
      return new URL(value).protocol === "https:" ? new URL(value) : null;
    } catch {
      return null;
    }
  };
  const playUrl = isHttpsUrl(androidReleaseCard.dataset.playUrl);
  const apkUrl = isHttpsUrl(androidReleaseCard.dataset.apkUrl);
  const trustedPlayUrl =
    playUrl?.hostname === "play.google.com" &&
    playUrl.pathname === "/store/apps/details"
      ? playUrl
      : null;
  const trustedApkUrl =
    apkUrl?.hostname === "bymevpn.duckdns.org" &&
    /^\/app\/[a-zA-Z0-9_-]+\.apk$/i.test(apkUrl.pathname)
      ? apkUrl
      : null;
  const sha256 = androidReleaseCard.dataset.apkSha256 ?? "";
  const version = (androidReleaseCard.dataset.version ?? "")
    .trim()
    .slice(0, 40);
  const apkIsVerified = trustedApkUrl && /^[a-f\d]{64}$/i.test(sha256);
  const releaseLinks = document.getElementById("android-release-links");
  const unavailable = androidReleaseCard.querySelector(".release-unavailable");
  const status = document.getElementById("release-status-text");
  const distributionNote = document.getElementById("android-distribution-note");
  const releaseSummary = androidReleaseCard.querySelector(
    ".release-card-main > div:first-child > p:last-child",
  );

  if (trustedPlayUrl || apkIsVerified) {
    androidReleaseCard.dataset.releaseState = "available";
    if (releaseLinks) releaseLinks.hidden = false;
    if (unavailable) unavailable.hidden = true;
    if (status) status.textContent = "Официальная загрузка доступна.";
    if (releaseSummary)
      releaseSummary.textContent = "Установите ByMeVPN по официальной ссылке.";
    if (distributionNote)
      distributionNote.textContent = "Только официальные ссылки на приложение";

    const storeLink = document.getElementById("android-play-link");
    if (storeLink && trustedPlayUrl) {
      storeLink.href = trustedPlayUrl.href;
      storeLink.hidden = false;
    }

    const apkLink = document.getElementById("android-apk-link");
    if (apkLink && apkIsVerified) {
      apkLink.href = trustedApkUrl.href;
      apkLink.hidden = false;
    }

    const versionLabel = document.getElementById("android-release-version");
    if (versionLabel && version) {
      versionLabel.textContent = `Версия ${version}`;
      versionLabel.hidden = false;
    }

    const checksumLabel = document.getElementById("android-release-checksum");
    if (checksumLabel && apkIsVerified) {
      checksumLabel.textContent = `SHA-256: ${sha256.toLowerCase()}`;
      checksumLabel.hidden = false;
    }
  }
}

if (!reducedMotion.matches) {
  if (cinematicStage && window.matchMedia("(pointer: fine)").matches) {
    cinematicStage.addEventListener("pointermove", (event) => {
      const bounds = cinematicStage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      cinematicStage.style.setProperty("--parallax-x", `${x * -12}px`);
      cinematicStage.style.setProperty("--parallax-y", `${y * -10}px`);
    });
    cinematicStage.addEventListener("pointerleave", () => {
      cinematicStage.style.setProperty("--parallax-x", "0px");
      cinematicStage.style.setProperty("--parallax-y", "0px");
    });
  }
}
