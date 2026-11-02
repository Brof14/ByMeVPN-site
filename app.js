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

if (demoScreen && demoToggle && demoState && demoHint && demoAnnouncement) {
  const stateText = {
    off: "VPN выключен",
    connecting: "Подключение…",
    connected: "VPN запущен",
  };
  let connectionState = "off";
  let serverSheetOpen = false;
  let selectedServerName = "Сервер не выбран";
  let connectionTimer;
  let previousFocus = null;

  const announce = (message) => {
    demoAnnouncement.textContent = `Демо интерфейса: ${message} Реальное подключение не запускалось.`;
  };

  const activeScene = () => serverSheetOpen ? "servers" : connectionState;

  const render = ({ announcement = "", updateScene = true } = {}) => {
    const scene = activeScene();
    demoScreen.dataset.state = scene;
    demoState.textContent = stateText[connectionState];
    demoHint.textContent = connectionState === "off"
      ? "Нажмите, чтобы подключиться"
      : connectionState === "connecting"
        ? "Устанавливаем туннель"
        : "Соединение с сервером проверено";
    demoToggle.setAttribute("aria-pressed", String(connectionState === "connected"));
    demoToggle.setAttribute("aria-label", connectionState === "connected"
      ? "Завершить демонстрацию подключения"
      : "Показать демонстрацию подключения");
    if (serverSheet) serverSheet.hidden = !serverSheetOpen;
    if (serverOpen) serverOpen.setAttribute("aria-expanded", String(serverSheetOpen));
    if (selectedServer) selectedServer.textContent = selectedServerName;
    if (autoServer) autoServer.setAttribute("aria-pressed", String(selectedServerName === "Автоматически"));

    if (updateScene) {
      sceneButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.demoScene === scene));
      });
      scenes.forEach((item) => item.classList.toggle("is-current", item.dataset.scene === scene));
    }
    if (announcement) announce(announcement);
  };

  const setConnectionState = (state, { announcement = "", updateScene = true } = {}) => {
    window.clearTimeout(connectionTimer);
    connectionState = state;
    render({ announcement, updateScene });
  };

  const openServers = ({ announcement = "", updateScene = true, focus = false } = {}) => {
    window.clearTimeout(connectionTimer);
    previousFocus = document.activeElement;
    serverSheetOpen = true;
    render({ announcement, updateScene });
    if (focus) serverClose?.focus();
  };

  const closeServers = ({ announcement = "", updateScene = true, restoreFocus = false } = {}) => {
    serverSheetOpen = false;
    render({ announcement, updateScene });
    if (restoreFocus && previousFocus instanceof HTMLElement) previousFocus.focus();
  };

  demoToggle.addEventListener("click", () => {
    if (connectionState === "connected" || connectionState === "connecting") {
      closeServers({ updateScene: false });
      setConnectionState("off", { announcement: "VPN выключен." });
      return;
    }
    closeServers({ updateScene: false });
    setConnectionState("connecting", { announcement: "Показано состояние подключения." });
    connectionTimer = window.setTimeout(() => {
      connectionState = "connected";
      render({ announcement: "VPN запущен. Это только демонстрация." });
    }, 720);
  });

  serverOpen?.addEventListener("click", () => {
    openServers({ announcement: "Открыт выбор сервера.", focus: true });
  });
  serverClose?.addEventListener("click", () => {
    closeServers({ announcement: "Выбор сервера закрыт.", restoreFocus: true });
  });
  autoServer?.addEventListener("click", () => {
    selectedServerName = "Автоматически";
    closeServers({ announcement: "Выбран автоматический сервер.", restoreFocus: true });
  });

  sceneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const requested = button.dataset.demoScene;
      if (requested === "servers") {
        openServers({ announcement: "Показан выбор сервера." });
      } else {
        closeServers({ updateScene: false });
        setConnectionState(requested, {
          announcement: `Показано состояние «${stateText[requested]}».`,
        });
      }
      document.querySelector(`[data-scene="${requested}"]`)
        ?.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && serverSheetOpen) {
      closeServers({ announcement: "Выбор сервера закрыт.", restoreFocus: true });
    }
  });

  const sceneObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const scene = visible.target.dataset.scene;
    if (scene === "servers") {
      serverSheetOpen = true;
    } else {
      serverSheetOpen = false;
      connectionState = scene;
    }
    render({ announcement: "" });
  }, { rootMargin: "-35% 0px -35% 0px", threshold: [0.05, 0.25, 0.5] });
  scenes.forEach((scene) => sceneObserver.observe(scene));
  render();
}

if (revealItems.length && "IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-revealed"));
}
