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
  initMobileMenu();
  initOrderModal();
  initBlogFilters();
  initScrollReveal();
  initStatCounters();
  initProcessAccordion();
  initFaqAccordion();
  initCookieBanner();
  initContactForm();
  initProcessCardGlow();
});

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
  };
  const close = () => {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
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
