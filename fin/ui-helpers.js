// =====================================================
// ui-helpers.js
// Utilidades de UI compartidas por index.html y admin.html:
//   · showNotif      — toast notifications
//   · openModal      — abrir/cerrar modales
//   · navigate       — SPA router
//   · showTab        — cambiar pestañas
//   · initNav        — navbar scroll + hamburguesa
// =====================================================

// ── Toast notification ─────────────────────────────
// color: 'green' | 'red' | 'yellow' | 'cyan'
export function showNotif(icon, title, msg, color = 'cyan') {
  const el = document.getElementById('notif');
  if (!el) return;

  const colors = {
    cyan:   'rgba(200,200,200,.12)',
    green:  'rgba(34,197,94,.12)',
    red:    'rgba(239,68,68,.12)',
    yellow: 'rgba(234,179,8,.12)',
  };
  el.style.background = colors[color] ?? colors.cyan;

  const setEl = (id, val) => { const e = el.querySelector(`#${id}`); if (e) e.textContent = val; };
  setEl('notif-icon',  icon);
  setEl('notif-title', title);
  setEl('notif-msg',   msg);

  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ── Modal open / close ─────────────────────────────
export function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
}

// ── SPA Router ────────────────────────────────────
// pageMap: { pageId: () => void } — callback opcional al activar
let _pageCallbacks = {};

export function registerPageCallback(pageId, fn) {
  _pageCallbacks[pageId] = fn;
}

export function navigate(pageId) {
  // Ocultar todas las páginas
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Activar la página destino
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');

  // Actualizar nav links
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });

  // Actualizar hash
  window.location.hash = pageId;

  // Cerrar menú móvil si está abierto
  closeMobileMenu();

  // Scroll al top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Callback si existe
  _pageCallbacks[pageId]?.();

  // Re-iniciar reveal para la nueva página
  setTimeout(reInitReveal, 80);
}

// ── Tab system ─────────────────────────────────────
// tabSets: { [prefix]: ['tab1','tab2',...] }
const _tabSets = {};

export function registerTabSet(prefix, tabs) {
  _tabSets[prefix] = tabs;
}

export function showTab(prefix, activeTab) {
  const tabs = _tabSets[prefix] ?? [];
  tabs.forEach(t => {
    // Contenido
    const content = document.getElementById(`${prefix}-${t}`);
    if (content) content.classList.toggle('hidden', t !== activeTab);

    // Sidebar link
    const sl = document.getElementById(`${prefix}-tab-${t}`);
    if (sl) sl.classList.toggle('active', t === activeTab);

    // Mobile tab button
    const mt = document.getElementById(`${prefix}-mobtab-${t}`);
    if (mt) mt.classList.toggle('active', t === activeTab);
  });
}

// ── Navbar scroll effect ───────────────────────────
export function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('solid', window.scrollY > 40);
  }, { passive: true });
}

// ── Hamburguesa móvil ──────────────────────────────
export function toggleMobileMenu() {
  const menu = document.getElementById('mob-menu');
  const btn  = document.getElementById('ham-btn');
  if (!menu || !btn) return;
  menu.classList.toggle('open');
  btn.classList.toggle('open');
}

export function closeMobileMenu() {
  document.getElementById('mob-menu')?.classList.remove('open');
  document.getElementById('ham-btn')?.classList.remove('open');
}

// ── 3D Tilt en cards ──────────────────────────────
export function applyTilt(card) {
  const inner = card.querySelector('.inner');
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    if (inner) inner.style.transform = `perspective(900px) rotateY(${x*14}deg) rotateX(${-y*14}deg)`;
    card.style.background = `radial-gradient(circle at ${(e.clientX-r.left)/r.width*100}%
      ${(e.clientY-r.top)/r.height*100}%, rgba(200,200,200,.06) 0%, var(--bg-card) 60%)`;
  });
  card.addEventListener('mouseleave', () => {
    if (inner) inner.style.transform = '';
    card.style.background = '';
  });
}

// ── Service cards tilt ─────────────────────────────
export function initServiceCardTilt() {
  document.querySelectorAll('.service-nav-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ── Hash-based routing on load ─────────────────────
export function initHashRouter(defaultPage = 'home') {
  const h = window.location.hash.replace('#', '') || defaultPage;
  navigate(h);

  window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '') || defaultPage;
    navigate(page);
  });
}

// ── Re-init scroll reveal ─────────────────────────
function reInitReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.on)').forEach(el => obs.observe(el));
}

// ── File drag-and-drop ────────────────────────────
export function initDropZone(areaId, inputId) {
  const area  = document.getElementById(areaId);
  const input = document.getElementById(inputId);
  if (!area || !input) return;

  area.addEventListener('click', () => input.click());
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('active'); });
  area.addEventListener('dragleave', () => area.classList.remove('active'));
  area.addEventListener('drop', e => {
    e.preventDefault(); area.classList.remove('active');
    if (e.dataTransfer.files[0]) {
      const dt = new DataTransfer();
      dt.items.add(e.dataTransfer.files[0]);
      input.files = dt.files;
      input.dispatchEvent(new Event('change'));
    }
  });
}