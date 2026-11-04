'use strict';

const menuButton = document.querySelector('.mobile-menu-button');
const mobileNav = document.getElementById('mobile-nav');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

if (menuButton && mobileNav) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    mobileNav.hidden = true;
  };
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
    mobileNav.hidden = isOpen;
  });
  mobileNav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menuButton.focus();
    }
  });
  document.addEventListener('click', e => {
    if (!menuButton.contains(e.target) && !mobileNav.contains(e.target)) closeMenu();
  });
  window.matchMedia('(min-width: 701px)').addEventListener?.('change', closeMenu);
}

// Animate visible content only. The default CSS leaves *all* content visible.
const revealNodes = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  }, { threshold: 0.14, rootMargin: '0px 0px -25px 0px' });
  revealNodes.forEach(node => observer.observe(node));
}

// The product demo never performs network requests and cannot control a VPN.
const theater = document.getElementById('demo-theater');
const toggle = document.getElementById('demo-switch');
const stateLabel = document.getElementById('demo-status-text');
const statusSide = document.getElementById('demo-side-status');
const heading = document.getElementById('demo-heading');
const description = document.getElementById('demo-description');
const support = document.getElementById('demo-support');
const steps = document.querySelectorAll('.step');
let connectTimer = null;
let state = 'off';
const states = {
  off: {
    label: 'VPN выключен', side: 'Отключено',
    heading: 'Ты управляешь подключением.',
    description: 'Нажми на кнопку в телефоне, чтобы увидеть, как меняется состояние подключения.',
    support: 'Нажмите, чтобы подключиться'
  },
  connecting: {
    label: 'Подключение…', side: 'Подключение',
    heading: 'Всё происходит на глазах.',
    description: 'Интерфейс показывает процесс подключения — без скрытых действий.',
    support: 'Устанавливаем соединение'
  },
  on: {
    label: 'VPN запущен', side: 'Подключено',
    heading: 'И вот ты на связи.',
    description: 'Состояние соединения видно сразу. Это демонстрация визуального интерфейса.',
    support: 'Состояние показано в демо'
  }
};
function setDemoState(next) {
  if (!theater || !states[next]) return;
  state = next;
  theater.dataset.status = next;
  stateLabel.textContent = states[next].label;
  statusSide.textContent = states[next].side;
  heading.textContent = states[next].heading;
  description.textContent = states[next].description;
  support.textContent = states[next].support;
  toggle.setAttribute('aria-pressed', String(next === 'on'));
  toggle.setAttribute('aria-label', next === 'on' ? 'Выключить демонстрацию подключения' : 'Показать подключение VPN');
  steps.forEach(step => step.classList.toggle('active', step.dataset.step === next));
}
if (toggle) {
  toggle.addEventListener('click', () => {
    window.clearTimeout(connectTimer);
    if (state !== 'off') { setDemoState('off'); return; }
    setDemoState('connecting');
    connectTimer = window.setTimeout(() => { setDemoState('on'); connectTimer = null; }, 1150);
  });
  window.addEventListener('pagehide', () => window.clearTimeout(connectTimer));
}
