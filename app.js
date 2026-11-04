"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("site-nav");
const year = document.getElementById("year");
const demoScreen = document.getElementById("demo-screen");
const demoToggle = document.getElementById("demo-toggle");
const demoState = document.getElementById("demo-state-visible");
const demoHint = document.getElementById("demo-hint");
const demoAnnouncement = document.getElementById("demo-announcement");
const serverOpen = document.getElementById("server-open");
const serverSheet = document.getElementById("server-sheet");
const serverClose = document.getElementById("server-close");
const autoServer = document.getElementById("auto-server");
const selectedServer = document.getElementById("selected-server");
const sceneButtons = [...document.querySelectorAll("[data-demo-scene]")];
const scenes = [...document.querySelectorAll("[data-scene]")];
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
    ) setMenuOpen(false);
  });
  window.matchMedia("(min-width: 761px)").addEventListener?.("change", () => setMenuOpen(false));
}

if (demoScreen && demoToggle && demoState && demoHint && demoAnnouncement && scenes.length) {
  const stateText = {
    off: "VPN выключен",
    connecting: "Подключение…",
    connected: "VPN запущен",
  };
  let connectionState = "off";
  let activeScene = "off";
  let serverSheetOpen = false;
  let selectedServerName = "Сервер не выбран";
  let connectionTimer = 0;
  let frame = 0;
  let previousFocus = null;
  let serverReturnScene = "off";

  const announce = (message) => {
    demoAnnouncement.textContent = `Демо интерфейса: ${message} Реальное подключение не запускалось.`;
  };

  const cancelConnectionTimer = () => {
    const wasConnecting = Boolean(connectionTimer) && connectionState === "connecting";
    window.clearTimeout(connectionTimer);
    connectionTimer = 0;
    if (wasConnecting) {
      connectionState = "off";
      render();
    }
  };

  const render = (announcement = "") => {
    const state = serverSheetOpen ? "servers" : connectionState;
    demoScreen.dataset.state = state;
    demoState.textContent = stateText[connectionState];
    demoHint.textContent = connectionState === "off"
      ? "Нажмите, чтобы подключиться"
      : connectionState === "connecting"
        ? "Демонстрация подключения"
        : "Демонстрация активного состояния";
    demoToggle.setAttribute("aria-pressed", String(connectionState === "connected"));
    demoToggle.setAttribute("aria-label", connectionState === "connected"
      ? "Завершить демонстрацию подключения"
      : "Показать демонстрацию подключения");
    if (serverSheet) serverSheet.hidden = !serverSheetOpen;
    if (serverOpen) serverOpen.setAttribute("aria-expanded", String(serverSheetOpen));
    if (selectedServer) selectedServer.textContent = selectedServerName;
    if (autoServer) autoServer.setAttribute("aria-pressed", String(selectedServerName === "Автоматически"));
    sceneButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.demoScene === activeScene));
    });
    scenes.forEach((item) => {
      item.classList.toggle("is-current", item.dataset.scene === activeScene);
    });
    if (announcement) announce(announcement);
  };

  const scrollToScene = (sceneId) => {
    const target = scenes.find((scene) => scene.dataset.scene === sceneId);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - (window.innerHeight - target.offsetHeight) / 2;
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  };

  const activateScene = (sceneId, { scroll = false, announcement = "" } = {}) => {
    if (!scenes.some((scene) => scene.dataset.scene === sceneId)) return;
    cancelConnectionTimer();
    activeScene = sceneId;
    serverSheetOpen = sceneId === "servers";
    if (sceneId === "servers") serverReturnScene = connectionState;
    else connectionState = sceneId;
    render(announcement);
    if (scroll) scrollToScene(sceneId);
  };

  const syncSceneToScroll = () => {
    frame = 0;
    const track = document.getElementById("story-track");
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    if (trackRect.bottom <= 0 || trackRect.top >= window.innerHeight) return;
    const focusY = window.innerHeight * 0.5;
    const nearest = scenes.reduce((best, scene) => {
      const rect = scene.getBoundingClientRect();
      const distance = Math.abs((rect.top + rect.bottom) / 2 - focusY);
      return distance < best.distance ? { scene, distance } : best;
    }, { scene: scenes[0], distance: Number.POSITIVE_INFINITY }).scene;
    if (nearest.dataset.scene !== activeScene) activateScene(nearest.dataset.scene);
  };

  const scheduleSceneSync = () => {
    if (!frame) frame = window.requestAnimationFrame(syncSceneToScroll);
  };

  window.addEventListener("scroll", scheduleSceneSync, { passive: true });
  window.addEventListener("resize", scheduleSceneSync, { passive: true });
  window.addEventListener("wheel", cancelConnectionTimer, { passive: true });
  window.addEventListener("touchstart", cancelConnectionTimer, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (["PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp", " "].includes(event.key)) {
      cancelConnectionTimer();
    }
    if (event.key === "Escape" && serverSheetOpen) {
      activateScene(serverReturnScene, { scroll: true, announcement: "Выбор сервера закрыт." });
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    }
  });

  demoToggle.addEventListener("click", () => {
    if (connectionState === "connected" || connectionState === "connecting") {
      activateScene("off", { scroll: true, announcement: "VPN выключен." });
      return;
    }
    activateScene("connecting", { scroll: true, announcement: "Показано состояние подключения." });
    connectionTimer = window.setTimeout(() => {
      connectionTimer = 0;
      activateScene("connected", { scroll: true, announcement: "VPN запущен. Это только демонстрация." });
    }, 720);
  });

  serverOpen?.addEventListener("click", () => {
    previousFocus = document.activeElement;
    serverReturnScene = activeScene === "servers" ? connectionState : activeScene;
    activateScene("servers", { scroll: true, announcement: "Открыт выбор сервера." });
    serverClose?.focus();
  });
  serverClose?.addEventListener("click", () => {
    activateScene(serverReturnScene, { scroll: true, announcement: "Выбор сервера закрыт." });
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  });
  autoServer?.addEventListener("click", () => {
    selectedServerName = "Автоматически";
    activateScene(serverReturnScene, { scroll: true, announcement: "Выбран автоматический сервер." });
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  });

  sceneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const requested = button.dataset.demoScene;
      activateScene(requested, {
        scroll: true,
        announcement: `Показана сцена «${button.textContent.trim().replace(/^\d+\s*/, "") }».`,
      });
    });
  });

  render();
  scheduleSceneSync();
}

if (revealItems.length && "IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
  document.documentElement.classList.add("reveal-enabled");
}
