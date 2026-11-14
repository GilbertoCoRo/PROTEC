/* PROTEC — Marca sincronizada.
   Lee el MISMO registro que usa el cotizador (configuracion_empresa / datos_empresa)
   y coloca logotipo y nombre en todos los [data-brand-mark] / [data-brand-name] del sitio
   y en el membrete de la hoja de cotización (#cotLogoImg) si aún no tiene imagen. */
(function () {
  'use strict';
  var C = window.PROTEC_CONFIG;
  var marks = document.querySelectorAll('[data-brand-mark]');
  var names = document.querySelectorAll('[data-brand-name]');
  var cot = document.getElementById('cotLogoImg');
  if (!C || (!marks.length && !names.length && !cot)) return;

  var LOGO_OK = /^(data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[A-Za-z0-9+\/=]+|https:\/\/[^\s"'<>]+)$/;
  var CACHE = 'protec_brand', TTL = 5 * 60 * 1000;
  var isAdmin = !!document.querySelector('.sidebar');

  function apply(cfg) {
    if (!cfg) return;
    var empresa = typeof cfg.empresa === 'string' ? cfg.empresa.trim().slice(0, 60) : '';
    if (empresa) names.forEach(function (n) { n.textContent = empresa; });
    if (typeof cfg.logo === 'string' && LOGO_OK.test(cfg.logo)) {
      marks.forEach(function (m) {
        var img = new Image();
        img.alt = empresa || 'Logotipo';
        img.decoding = 'async';
        img.onload = function () { m.textContent = ''; m.appendChild(img); m.classList.add('has-logo'); };
        img.src = cfg.logo;
      });
      if (cot && !cot.getAttribute('src')) { cot.src = cfg.logo; cot.style.display = 'block'; }
    }
  }

  if (!isAdmin) {
    try { var c = JSON.parse(sessionStorage.getItem(CACHE) || 'null'); if (c && Date.now() - c.t < TTL) { apply(c.v); return; } } catch (e) {}
  }

  fetch(C.url + '/rest/v1/configuracion_empresa?select=valor&clave=eq.datos_empresa', {
    headers: { apikey: C.anonKey, Authorization: 'Bearer ' + C.anonKey }
  }).then(function (r) { return r.ok ? r.json() : []; })
    .then(function (rows) {
      var v = rows && rows[0] && rows[0].valor;
      if (!v) return;
      apply(v);
      if (!isAdmin) { try { sessionStorage.setItem(CACHE, JSON.stringify({ t: Date.now(), v: { empresa: v.empresa, logo: v.logo } })); } catch (e) {} }
    }).catch(function () {});
})();
