/* P223 — main.js
 * Selector de idioma (es/en/zh), reveal on scroll y manejo del formulario. */

(function () {
  'use strict';

  const STORAGE_KEY = 'p223-lang';

  /* ---------- Idioma ---------- */
  const langBtns = document.querySelectorAll('.lang-btn');
  const defaultLang = 'es';

  function setLang(lang) {
    if (!I18N[lang]) lang = defaultLang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(lang, key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(lang, key));
    });

    langBtns.forEach(function (btn) {
      const active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* privado */ }
  }

  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-lang'));
    });
  });

  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* privado */ }
  setLang(stored || defaultLang);

  /* ---------- Reveal on scroll ---------- */
  const faders = document.querySelectorAll('.section, .plan, .contact-grid');
  faders.forEach(function (el) { el.classList.add('fade'); });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    faders.forEach(function (el) { io.observe(el); });
  } else {
    faders.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Formulario (FormSubmit AJAX) ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      const note = document.getElementById('formNote');
      const lang = document.documentElement.lang || 'es';
      const ok = (lang === 'zh')
        ? '✓ 已收到消息，我们会尽快联系你。'
        : (lang === 'en'
          ? '✓ Message received. We will get back to you shortly.'
          : '✓ Mensaje recibido. Te contactamos pronto.');
      const fail = (lang === 'zh')
        ? '✗ 发送失败，请重试。'
        : (lang === 'en'
          ? '✗ Could not send. Please try again.'
          : '✗ No se pudo enviar. Intenta de nuevo.');

      const data = new FormData(form);
      data.append('_ajax', 'true');

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data,
        });
        // FormSubmit confirma envíos con HTTP 200 (JSON o página de gracias);
        // cualquier respuesta en rango 2xx indica que el lead fue recibido.
        if (res.ok) {
          note.textContent = ok;
          note.style.color = 'var(--verde)';
          form.reset();
        } else {
          note.textContent = fail;
          note.style.color = 'var(--rojo)';
        }
      } catch (e) {
        note.textContent = fail;
        note.style.color = 'var(--rojo)';
      }
    });
  }

  /* ---------- Lightbox para QRs (imagen grande) ---------- */
  // Las capturas de QR contienen el código + elementos alrededor, así que al
  // hacer clic se abre la imagen en grande ocupando ~90% de la altura, como
  // hace RutaPTY con sus secciones de donación.
  function openLightbox(src) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';

    const close = document.createElement('button');
    close.className = 'lightbox-close';
    close.setAttribute('aria-label', 'Cerrar');
    close.textContent = '✕';

    overlay.appendChild(img);
    overlay.appendChild(close);
    document.body.appendChild(overlay);

    function dismiss() { overlay.remove(); }
    close.addEventListener('click', function (e) { e.stopPropagation(); dismiss(); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) dismiss();
    });
  }

  document.querySelectorAll('.qr-zoom').forEach(function (el) {
    el.addEventListener('click', function () {
      openLightbox(el.getAttribute('src'));
    });
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.classList.add('is-zoomable');
  });

  // Botones de canal sin link directo todavía: abren el QR en grande
  // (p. ej. Binance Pay / Yappy) hasta que se disponga del enlace oficial.
  document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openLightbox(el.getAttribute('data-lightbox-src'));
    });
  });
})();