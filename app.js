const roomOrder = ['home', 'about', 'works', 'index'];
const roomLabels = { home: 'HOME', about: 'ABOUT ME', works: 'WORKS', index: 'INDEX' };
const routeByRoom = { home: '#home', about: '#about', works: '#works', index: '#index' };
const roomByHash = { '#home': 'home', '#about': 'about', '#works': 'works', '#index': 'index' };
const rooms = [...document.querySelectorAll('.room')];
const roomLinks = [...document.querySelectorAll('[data-room-target]')];
const routeLinks = [...document.querySelectorAll('[data-route]')];
const curtain = document.querySelector('.transition-curtain');
const counter = document.querySelector('#room-counter');
let activeRoom = roomByHash[window.location.hash] || (window.location.hash === '' ? 'home' : null);
let transitionTimer;

function showRoom(roomName, { push = true, immediate = false } = {}) {
  if (!roomName || !roomOrder.includes(roomName)) {
    showNotFound();
    return;
  }

  const index = roomOrder.indexOf(roomName);
  const update = () => {
    rooms.forEach((room) => {
      const isActive = room.dataset.room === roomName;
      room.classList.toggle('is-active', isActive);
      room.setAttribute('aria-hidden', String(!isActive));
    });
    roomLinks.forEach((link) => {
      const isActive = link.dataset.roomTarget === roomName;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    counter.textContent = String(index + 1).padStart(2, '0');
    activeRoom = roomName;
    document.title = `${roomLabels[roomName]} — Marco Sarmiento`;
    if (push && window.location.hash !== routeByRoom[roomName]) window.location.hash = routeByRoom[roomName];
    document.querySelector('.stage').scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (immediate || !activeRoom || activeRoom === roomName || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }

  clearTimeout(transitionTimer);
  curtain.classList.remove('is-active');
  void curtain.offsetWidth;
  curtain.classList.add('is-active');
  transitionTimer = window.setTimeout(update, 185);
}

function showNotFound() {
  rooms.forEach((room) => {
    room.classList.toggle('is-active', room.id === 'room-not-found');
    room.setAttribute('aria-hidden', String(room.id !== 'room-not-found'));
  });
  roomLinks.forEach((link) => {
    link.classList.remove('is-active');
    link.removeAttribute('aria-current');
  });
  activeRoom = null;
  counter.textContent = '??';
  document.title = 'Signal not found — Marco Sarmiento';
}

function routeFromElement(element) {
  const target = element.dataset.route || element.getAttribute('href') || '#home';
  return roomByHash[target];
}

routeLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetRoom = routeFromElement(link);
    if (!targetRoom || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showRoom(targetRoom);
  });
});

window.addEventListener('hashchange', () => {
  const nextRoom = roomByHash[window.location.hash] || (window.location.hash === '' ? 'home' : null);
  if (nextRoom) showRoom(nextRoom, { push: false });
  else showNotFound();
});

window.addEventListener('keydown', (event) => {
  const tagName = document.activeElement?.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return;
  const currentIndex = Math.max(0, roomOrder.indexOf(activeRoom));
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    showRoom(roomOrder[(currentIndex + 1) % roomOrder.length]);
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    showRoom(roomOrder[(currentIndex - 1 + roomOrder.length) % roomOrder.length]);
  }
  if (/^[1-4]$/.test(event.key)) showRoom(roomOrder[Number(event.key) - 1]);
});

const works = [
  {
    kicker: 'CASE_01 / INFRASTRUCTURE',
    title: 'Homelab',
    emphasis: ' Node Map',
    description: 'A visual map for a small home network: services, machines, and the spaces between them made legible at a glance.',
    stack: 'Linux / Proxmox / SVG',
    result: 'A clearer way to see the system.',
    art: `<svg viewBox="0 0 640 380" role="img" aria-label="Line drawing of connected homelab nodes"><g class="art-line-soft"><path d="M54 80H180L232 128H335L382 82H582"/><path d="M54 300H192L246 247H370L424 296H582"/><path d="M112 50V175L164 224V340"/><path d="M516 48V169L466 220V342"/></g><g class="art-line"><rect x="244" y="132" width="150" height="105" rx="2"/><path d="M263 155h112M263 177h76M263 199h46"/><circle class="art-node" cx="222" cy="122" r="9"/><circle class="art-node" cx="416" cy="122" r="9"/><circle class="art-node" cx="224" cy="248" r="9"/><circle class="art-node" cx="416" cy="248" r="9"/><path d="M231 122h13M394 122h13M233 248h11M394 248h13"/><circle class="art-pulse" cx="322" cy="124" r="4"/></g></svg>`
  },
  {
    kicker: 'CASE_02 / WEB PRESENCE',
    title: 'Neocities',
    emphasis: ' Field Notes',
    description: 'A hand-built corner of the web for testing layout, typography, and the feeling of making a page from first principles.',
    stack: 'HTML / CSS / Git',
    result: 'A small site with a point of view.',
    art: `<svg viewBox="0 0 640 380" role="img" aria-label="Line drawing of a small web page window"><g class="art-line-soft"><path d="M70 76H570M70 108H570M118 150h142M118 177h205M118 204h169M118 231h176"/><path d="M385 150h135v96H385z"/><path d="M70 76v230h500V76"/></g><g class="art-line"><path d="M111 92h8M129 92h8M147 92h8"/><circle class="art-node" cx="340" cy="190" r="58"/><path d="M301 204l25-25 19 18 21-33 31 41"/><circle class="art-pulse" cx="340" cy="190" r="4"/><path d="M385 278H520"/></g></svg>`
  },
  {
    kicker: 'CASE_03 / FRONTEND STUDY',
    title: 'Interface',
    emphasis: ' Experiments',
    description: 'A collection of small frontend studies exploring motion, responsive composition, and how interfaces explain their own state.',
    stack: 'JavaScript / CSS / SVG',
    result: 'Less decoration. More signal.',
    art: `<svg viewBox="0 0 640 380" role="img" aria-label="Line drawing of an interface study"><g class="art-line-soft"><path d="M80 72h480v238H80z"/><path d="M80 112h480M112 150h104M112 177h70M112 204h132"/><path d="M310 149h210M310 173h150M310 197h184"/><path d="M112 260h408"/></g><g class="art-line"><rect x="111" y="230" width="118" height="22"/><rect x="310" y="230" width="210" height="22"/><path d="M256 149v72"/><circle class="art-node" cx="256" cy="185" r="15"/><circle class="art-pulse" cx="256" cy="185" r="4"/><path d="M80 72l28-28M560 72l28-28"/></g></svg>`
  }
];

const artStage = document.querySelector('#work-art');
const workCounter = document.querySelector('#work-counter');
const workKicker = document.querySelector('#work-kicker');
const workTitle = document.querySelector('#work-title');
const workTitleEm = document.querySelector('#work-title-em');
const workDescription = document.querySelector('#work-description');
const workStack = document.querySelector('#work-stack');
const workResult = document.querySelector('#work-result');
let workIndex = 0;

function renderWork(nextIndex) {
  workIndex = (nextIndex + works.length) % works.length;
  const work = works[workIndex];
  artStage.innerHTML = work.art;
  workCounter.textContent = `${String(workIndex + 1).padStart(2, '0')} / ${String(works.length).padStart(2, '0')}`;
  workKicker.textContent = work.kicker;
  workTitle.textContent = work.title;
  workTitleEm.textContent = work.emphasis;
  workDescription.textContent = work.description;
  workStack.textContent = work.stack;
  workResult.textContent = work.result;
}

document.querySelector('#work-prev').addEventListener('click', () => renderWork(workIndex - 1));
document.querySelector('#work-next').addEventListener('click', () => renderWork(workIndex + 1));
window.addEventListener('keydown', (event) => {
  if (activeRoom !== 'works') return;
  if (event.key === '[') renderWork(workIndex - 1);
  if (event.key === ']') renderWork(workIndex + 1);
});

const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let cursorX = -100;
let cursorY = -100;
window.addEventListener('pointermove', (event) => {
  cursorX = event.clientX;
  cursorY = event.clientY;
  cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
  cursorRing.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
});
document.querySelectorAll('a, button').forEach((element) => {
  element.addEventListener('pointerenter', () => cursorRing.classList.add('is-hover'));
  element.addEventListener('pointerleave', () => cursorRing.classList.remove('is-hover'));
});

renderWork(0);
if (activeRoom) showRoom(activeRoom, { push: false, immediate: true });
else if (!window.location.hash || window.location.hash === '#home') showRoom('home', { push: false, immediate: true });
else showNotFound();
