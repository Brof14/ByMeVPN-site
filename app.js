"use strict";

const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("site-nav");
const year = document.getElementById("year");

if (year) year.textContent = String(new Date().getFullYear());

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
