// =====================================================
// public-render.js
// Responsable de:
//  · Cargar contenido_global → pintar Misión, Visión, etc.
//  · Cargar paquetes         → generar tarjetas de precios
//  · Cargar portafolio       → galería de proyectos
//  · Cargar galeria          → fotos por servicio
// NADA está hardcodeado. Todo viene de Supabase.
// =====================================================

import { sb, TABLES } from './supabase-client.js';

// ── Punto de entrada: llamar desde index.html ──────
export async function renderAll() {
  await Promise.all([
    renderContenidoGlobal(),
    renderPaquetes(),
    renderPortafolio(),
    renderGaleria(),
  ]);
  // Activar animaciones scroll-reveal después de pintar
  initReveal();
}

// ═══════════════════════════════════════════════════
// 1. CONTENIDO GLOBAL (Misión, Visión, textos varios)
// Tabla: contenido_global { clave, valor }
// ═══════════════════════════════════════════════════
export async function renderContenidoGlobal() {
  const { data, error } = await sb
    .from(TABLES.CONTENIDO)
    .select('clave, valor');

  if (error) { console.warn('contenido_global:', error.message); return; }

  // Convertir array en mapa { clave: valor }
  const mapa = Object.fromEntries(data.map(r => [r.clave, r.valor]));

  // Pintar cada elemento que tenga el atributo data-clave="..."
  // Ejemplo HTML: <p data-clave="mision">Cargando...</p>
  document.querySelectorAll('[data-clave]').forEach(el => {
    const val = mapa[el.dataset.clave];
    if (val !== undefined) el.textContent = val;
  });
}

// ═══════════════════════════════════════════════════
// 2. PAQUETES / PLANES DE PRECIOS
// Tabla: paquetes { id, servicio, nombre, precio, caracteristicas[], activo }
// Genera las tarjetas dinámicamente con .map()
// ═══════════════════════════════════════════════════
export async function renderPaquetes(filtroServicio = null) {
  const query = sb
    .from(TABLES.PAQUETES)
    .select('*')
    .eq('activo', true)
    .order('precio', { ascending: true });

  if (filtroServicio) query.eq('servicio', filtroServicio);

  const { data, error } = await query;
  if (error) { console.warn('paquetes:', error.message); return; }

  // Agrupar por servicio: { cctv: [...], pos: [...], ... }
  const grupos = data.reduce((acc, p) => {
    const svc = (p.servicio || 'general').toLowerCase();
    if (!acc[svc]) acc[svc] = [];
    acc[svc].push(p);
    return acc;
  }, {});

  // Para cada contenedor data-precios="cctv" etc., pintamos las tarjetas
  document.querySelectorAll('[data-precios]').forEach(container => {
    const svc = container.dataset.precios;
    const planes = grupos[svc] || [];
    container.innerHTML = planes.length
      ? planes.map((p, i) => buildPriceCard(p, i)).join('')
      : '<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:40px 0;">Sin planes disponibles en este momento.</p>';
  });
}

// Construye el HTML de una tarjeta de precio
function buildPriceCard(p, index) {
  const isFeatured = index === 1 || p.destacado;
  const features   = Array.isArray(p.caracteristicas) ? p.caracteristicas : [];
  const precio     = Number(p.precio).toLocaleString('es-MX');

  return `
    <div class="price-card ${isFeatured ? 'featured' : ''}">
      <div class="badge badge-cyan" style="margin-bottom:14px;">
        ${p.nombre.toUpperCase()}${isFeatured ? ' ⭐' : ''}
      </div>
      <div class="stat-n" style="margin-bottom:4px;">$${precio}</div>
      <div style="color:var(--muted);font-size:.78rem;margin-bottom:20px;">MXN</div>
      <ul style="display:flex;flex-direction:column;gap:10px;flex:1;margin-bottom:24px;">
        ${features.map(f => `<li class="feature-tag">${f}</li>`).join('')}
      </ul>
      <button
        class="${isFeatured ? 'btn-cta' : 'btn-ghost'} w-full py-2.5 rounded-xl"
        style="padding:10px;border-radius:12px;"
        onclick="document.getElementById('quote-modal').classList.add('open');document.body.style.overflow='hidden';">
        <span style="font-family:'Orbitron',monospace;font-size:.6rem;letter-spacing:.1em;">COTIZAR</span>
      </button>
    </div>`;
}

// ═══════════════════════════════════════════════════
// 3. PORTAFOLIO / PROYECTOS
// Tabla: portafolio { id, titulo, categoria, imagen_url, descripcion }
// ═══════════════════════════════════════════════════
export async function renderPortafolio(filtroCategoria = null) {
  const query = sb
    .from(TABLES.PORTAFOLIO)
    .select('*')
    .order('id', { ascending: false });

  if (filtroCategoria) query.eq('categoria', filtroCategoria);

  const { data, error } = await query;
  if (error) { console.warn('portafolio:', error.message); return; }

  document.querySelectorAll('[data-portafolio]').forEach(container => {
    const cat = container.dataset.portafolio; // 'all' o categoría específica
    const items = cat === 'all' ? data : data.filter(p => p.categoria === cat);

    container.innerHTML = items.length
      ? items.map(buildPortafolioCard).join('')
      : buildEmptyState('No hay proyectos en esta categoría aún.');
  });
}

function buildPortafolioCard(p) {
  return `
    <div class="gallery-img" style="flex-direction:column;gap:0;overflow:hidden;position:relative;">
      ${p.imagen_url
        ? `<img src="${p.imagen_url}" alt="${p.titulo}" loading="lazy"
               style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;"/>`
        : buildPlaceholderSVG()}
      <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%);
                  display:flex;flex-direction:column;justify-content:flex-end;padding:14px;">
        <div style="font-family:'Orbitron',monospace;font-size:.6rem;letter-spacing:.12em;color:var(--c1);margin-bottom:3px;">${p.categoria || ''}</div>
        <div style="font-weight:700;font-size:.92rem;color:#fff;">${p.titulo}</div>
        ${p.descripcion ? `<div style="font-size:.78rem;color:rgba(255,255,255,.6);margin-top:3px;">${p.descripcion}</div>` : ''}
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════
// 4. GALERÍA GENERAL
// Tabla: galeria { id, servicio, imagen_url }
// ═══════════════════════════════════════════════════
export async function renderGaleria(filtroServicio = null) {
  const query = sb
    .from(TABLES.GALERIA)
    .select('*')
    .order('id', { ascending: false });

  if (filtroServicio) query.eq('servicio', filtroServicio);

  const { data, error } = await query;
  if (error) { console.warn('galeria:', error.message); return; }

  document.querySelectorAll('[data-galeria]').forEach(container => {
    const svc   = container.dataset.galeria;
    const items = svc === 'all' ? data : data.filter(g => g.servicio === svc);

    container.innerHTML = items.length
      ? items.map(g => `
          <div class="gallery-img">
            ${g.imagen_url
              ? `<img src="${g.imagen_url}" alt="Instalación PROTEC" loading="lazy"
                     style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;"/>`
              : buildPlaceholderSVG()}
          </div>`).join('')
      : buildEmptyState('Galería en construcción.');
  });
}

// ═══════════════════════════════════════════════════
// Helpers privados
// ═══════════════════════════════════════════════════
function buildEmptyState(msg) {
  return `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--muted);">
    <div style="font-family:'Orbitron',monospace;font-size:.65rem;letter-spacing:.15em;">${msg}</div>
  </div>`;
}

function buildPlaceholderSVG() {
  return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(200,200,200,.25)" stroke-width="1">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21,15 16,10 5,21"/>
  </svg>`;
}

// ── Scroll Reveal ──────────────────────────────────
export function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}