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
        const body = await res.json().catch(() => null);
        if (res.ok && body && body.success === 'true') {
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
})();