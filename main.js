/* ==========================================================================
   Студия Некрасов — общий скрипт сайта (без сборки, без зависимостей).
   Подключается на всех страницах через <script src="main.js" defer></script>.
   ========================================================================== */

// ↓↓↓ ВСТАВЬТЕ СЮДА ВАШ КЛЮЧ С САЙТА web3forms.com ↓↓↓
const WEB3FORMS_KEY = 'ВСТАВЬТЕ_ВАШ_КЛЮЧ_СЮДА';
// ↑↑↑ Один ключ на весь сайт — менять только здесь ↑↑↑

function sendToWeb3Forms(fields) {
  return fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...fields }),
  }).then((r) => r.json());
}

document.addEventListener('DOMContentLoaded', () => {
  initIntroCleanup();
  initSmoothScroll();
  initMobileMenu();
  initOrderModal();
  initBlogFilters();
  initCustomSelect();
  initScrollReveal();
  initBgParallax();
  initStatCounters();
  initProcessAccordion();
  initFaqAccordion();
  initCookieBanner();
  initContactForm();
  initProcessCardGlow();
});

/* ---------- Снятие классов входной анимации после её завершения ---------- */
/* Без этого animation-fill-mode: both навсегда «замораживает» transform
   элемента на конечном кадре анимации и глушит все последующие hover-эффекты. */
function initIntroCleanup() {
  const introClasses = ['intro', 'intro-hero', 'intro-rise', 'intro-rise-slow', 'intro-pop'];
  document.querySelectorAll('.intro').forEach((el) => {
    el.addEventListener('animationend', () => {
      el.classList.remove(...introClasses);
    }, { once: true });
  });

  document.querySelectorAll('.h1-reveal').forEach((el) => {
    el.addEventListener('animationend', () => {
      el.classList.remove('h1-reveal');
    }, { once: true });
  });
}

/* ---------- Плавный скролл (Lenis) ---------- */
function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* ---------- Параллакс фоновых пятен-свечений ---------- */
function initBgParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const targets = [
    { el: document.querySelector('.bg-glow__mid-left'), speed: 0.10, base: '' },
    { el: document.querySelector('.bg-glow__mid-right'), speed: 0.14, base: '' },
    { el: document.querySelector('.bg-glow__bottom'), speed: 0.08, base: 'translateX(-50%)' },
    { el: document.querySelector('.bg-glow--page > div:nth-child(1)'), speed: 0.10, base: '' },
    { el: document.querySelector('.bg-glow--page > div:nth-child(2)'), speed: 0.14, base: '' },
  ].filter((t) => t.el);
  if (!targets.length) return;

  function update(scrollY) {
    targets.forEach((t) => {
      const offset = scrollY * t.speed;
      t.el.style.transform = t.base ? `${t.base} translateY(${offset}px)` : `translateY(${offset}px)`;
    });
  }

  if (window.lenis) {
    window.lenis.on('scroll', ({ scroll }) => update(scroll));
  } else {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(window.scrollY); ticking = false; });
    }, { passive: true });
  }
}

/* ---------- Фильтр статей в блоге ---------- */
function initBlogFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.article-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.getAttribute('data-filter');
      cards.forEach((card) => {
        const show = filter === 'all' || card.getAttribute('data-category') === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ---------- Мобильное меню ---------- */
function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.mobile-menu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => menu.classList.toggle('is-open'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.remove('is-open')));
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') && !menu.contains(e.target) && !burger.contains(e.target)) {
      menu.classList.remove('is-open');
    }
  });
}

/* ---------- Модалка «Обсудить проект» ---------- */
function initOrderModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;
  const box = overlay.querySelector('.modal-box');

  const open = (e) => {
    if (e) e.preventDefault();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
  };
  const close = () => {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
  };

  document.querySelectorAll('[data-open-modal]').forEach((el) => el.addEventListener('click', open));
  overlay.querySelectorAll('[data-close-modal]').forEach((el) => el.addEventListener('click', close));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  if (box) box.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  const form = overlay.querySelector('.modal-form');
  if (!form) return;
  const sentLabel = '✓ Отправлено!';
  const submitBtn = form.querySelector('button[type="submit"]');
  const defaultLabel = submitBtn ? submitBtn.textContent : '';
  const agreeInput = form.querySelector('[name="mAgree"]');
  const agreeLabel = form.querySelector('.form-checkbox-label');
  const agreeError = form.querySelector('[data-agree-error]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.mName.value.trim();
    const phone = form.elements.mPhone.value.trim();
    const sphere = form.elements.mSphere.value;
    const task = form.elements.mTask.value.trim();

    if (!name || !phone) return;
    if (!agreeInput.checked) {
      agreeLabel.classList.add('has-error');
      if (agreeError) agreeError.style.display = 'block';
      return;
    }
    agreeLabel.classList.remove('has-error');
    if (agreeError) agreeError.style.display = 'none';

    if (submitBtn) { submitBtn.textContent = sentLabel; submitBtn.disabled = true; }
    sendToWeb3Forms({
      subject: 'Новая заявка (быстрая форма) — ' + name,
      Имя: name,
      Телефон: phone,
      Сфера_услуг: sphere || '(не указано)',
      О_проекте: task || '(не указано)',
    }).then(() => {
      setTimeout(() => { window.location.href = 'thank-you.html'; }, 800);
    }).catch((err) => {
      console.error('Network error:', err);
      alert('Ошибка сети. Попробуйте снова.');
      if (submitBtn) { submitBtn.textContent = defaultLabel; submitBtn.disabled = false; }
    });
  });

  if (agreeInput) {
    agreeInput.addEventListener('change', () => {
      if (agreeInput.checked) {
        agreeLabel.classList.remove('has-error');
        if (agreeError) agreeError.style.display = 'none';
      }
    });
  }
}

/* ---------- Появление блоков при скролле ---------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('[data-reveal]');
  if (!reveals.length) return;

  // Ступенчатая задержка для соседних элементов одной секции.
  const delayIndex = new Map();
  reveals.forEach((el) => {
    const parent = el.parentElement;
    const idx = delayIndex.get(parent) || 0;
    delayIndex.set(parent, idx + 1);
    el.style.transitionDelay = Math.min(idx * 0.09, 0.45) + 's';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach((el) => io.observe(el));

  // Подстраховка: если IntersectionObserver почему-то не сработал сразу.
  setTimeout(() => reveals.forEach((el) => el.classList.add('is-visible')), 1600);
}

/* ---------- Анимированные счётчики статистики ---------- */
function initStatCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-count')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => io.observe(el));
}

/* ---------- Аккордеон «Процесс работы» ---------- */
function initProcessAccordion() {
  document.querySelectorAll('.process-card').forEach((card) => {
    card.addEventListener('click', () => card.classList.toggle('is-open'));
  });
}

/* Курсор-подсветка на карточках процесса (следует за мышью через --mx/--my) */
function initProcessCardGlow() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest ? e.target.closest('.process-card') : null;
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
}

/* ---------- Аккордеон FAQ ---------- */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('click', () => item.classList.toggle('is-open'));
  });
}

/* ---------- Cookie-баннер ---------- */
function initCookieBanner() {
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;

  if (localStorage.getItem('nk-cookies-accepted')) banner.classList.add('is-hidden');

  const accept = banner.querySelector('[data-accept-cookies]');
  const reject = banner.querySelector('[data-reject-cookies]');
  if (accept) accept.addEventListener('click', () => { localStorage.setItem('nk-cookies-accepted', 'true'); banner.classList.add('is-hidden'); });
  if (reject) reject.addEventListener('click', () => banner.classList.add('is-hidden'));

  document.querySelectorAll('[data-open-cookie-settings]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      banner.classList.remove('is-hidden');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  });
}

/* ---------- Кастомный select ---------- */
/* Нативный список опций select нельзя стилизовать кроссбраузерно (рисуется ОС),
   поэтому строим свой выпадающий список поверх скрытого select — он остаётся
   в форме как есть, меняется только то, что видит пользователь. */
function initCustomSelect() {
  document.querySelectorAll('select.form-input').forEach((select) => {
    const wrap = document.createElement('div');
    wrap.className = 'select-wrap';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="select-trigger__label"></span><span class="select-trigger__arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg></span>';
    wrap.appendChild(trigger);
    const label = trigger.querySelector('.select-trigger__label');

    const dropdown = document.createElement('div');
    dropdown.className = 'select-dropdown';
    dropdown.setAttribute('role', 'listbox');
    wrap.appendChild(dropdown);

    const options = [...select.options];
    const optionEls = options.map((opt) => {
      const el = document.createElement('div');
      el.className = 'select-option';
      el.setAttribute('role', 'option');
      el.textContent = opt.textContent;
      if (opt.disabled) el.style.display = 'none';
      dropdown.appendChild(el);
      return el;
    });

    function syncFromSelect() {
      const selected = options[select.selectedIndex];
      label.textContent = selected ? selected.textContent : '';
      trigger.classList.toggle('has-value', !!(selected && selected.value));
      optionEls.forEach((el, i) => el.classList.toggle('is-active', i === select.selectedIndex));
    }
    syncFromSelect();

    function close() {
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function open() {
      document.querySelectorAll('.select-wrap.is-open').forEach((w) => { if (w !== wrap) w.classList.remove('is-open'); });
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', () => {
      if (wrap.classList.contains('is-open')) close(); else open();
    });

    optionEls.forEach((el, i) => {
      el.addEventListener('click', () => {
        select.selectedIndex = i;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncFromSelect();
        close();
      });
    });

    select.addEventListener('change', syncFromSelect);
  });

  document.addEventListener('click', (e) => {
    document.querySelectorAll('.select-wrap.is-open').forEach((wrap) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('is-open');
        wrap.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.select-wrap.is-open').forEach((wrap) => {
      wrap.classList.remove('is-open');
      wrap.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Основная форма заявки на странице ---------- */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const card = form.closest('.contact-form-card');
  const successBlock = card ? card.querySelector('.form-success') : null;

  const fieldError = (name) => form.querySelector('[data-error-for="' + name + '"]');
  const clearErrors = () => form.querySelectorAll('.form-error').forEach((el) => { el.style.display = 'none'; el.textContent = ''; });
  const showError = (name, message) => {
    const el = fieldError(name);
    if (el) { el.textContent = message; el.style.display = 'block'; }
  };

  const agreeInput = form.querySelector('[name="agree"]');
  const agreeLabel = form.querySelector('.form-checkbox-label');
  const agreeError = form.querySelector('[data-agree-error]');

  if (agreeInput) {
    agreeInput.addEventListener('change', () => {
      if (agreeInput.checked) {
        agreeLabel.classList.remove('has-error');
        if (agreeError) agreeError.style.display = 'none';
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const name = form.elements.name.value.trim();
    const sphere = form.elements.sphere.value;
    const phone = form.elements.phone.value.trim();
    const brief = form.elements.brief.value.trim();
    const digits = phone.replace(/\D/g, '');

    let hasError = false;
    if (!name) { showError('name', 'Введите имя'); hasError = true; }
    if (!sphere) { showError('sphere', 'Выберите сферу услуг'); hasError = true; }
    if (!phone) { showError('phone', 'Введите номер'); hasError = true; }
    else if (digits.length < 7) { showError('phone', 'Проверьте номер'); hasError = true; }
    if (hasError) return;

    if (!agreeInput.checked) {
      agreeLabel.classList.add('has-error');
      if (agreeError) agreeError.style.display = 'block';
      return;
    }

    if (successBlock) { form.style.display = 'none'; successBlock.style.display = 'flex'; }

    sendToWeb3Forms({
      subject: 'Новая заявка с сайта — ' + name,
      Имя: name,
      Телефон: phone,
      Сфера_услуг: sphere,
      О_проекте: brief || '(не указано)',
    }).then((data) => {
      if (data.success) {
        setTimeout(() => { window.location.href = 'thank-you.html'; }, 800);
      } else {
        if (successBlock) { form.style.display = 'flex'; successBlock.style.display = 'none'; }
        alert('Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.');
        console.error('Web3Forms error:', data);
      }
    }).catch((err) => {
      if (successBlock) { form.style.display = 'flex'; successBlock.style.display = 'none'; }
      alert('Ошибка сети. Проверьте интернет и попробуйте снова.');
      console.error('Network error:', err);
    });
  });

  const resetBtn = successBlock ? successBlock.querySelector('[data-reset-form]') : null;
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      clearErrors();
      form.style.display = 'flex';
      successBlock.style.display = 'none';
    });
  }
}
