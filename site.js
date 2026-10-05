(() => {
  'use strict';
  const menu = document.querySelector('.site-menu');
  if (menu) {
    document.addEventListener('click', e => { if (!menu.contains(e.target) || e.target.closest('nav a')) menu.open = false; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
  }
  function track(name, position) {
    const params = { position, page_path: location.pathname };
    // Never send form values, contacts, or WhatsApp URLs to counters.
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    if (typeof window.ym === 'function') window.ym(113389386, 'reachGoal', name, params);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const href = a.getAttribute('href'); const position = a.dataset.track || 'page';
    if (href.startsWith('tel:')) track('phone_click', position);
    else if (/^https:\/\/wa\.me\//i.test(href)) track('whatsapp_click', position);
  });
  const form = document.getElementById('request-form'); if (!form) return;
  form.addEventListener('focusin', () => track('request_start', 'form'), { once: true });
  for (const el of form.querySelectorAll('input,textarea,select')) el.addEventListener('input', () => el.setCustomValidity(''));
  form.addEventListener('submit', e => {
    e.preventDefault();
    for (const name of ['area', 'problem']) {
      const el = form.elements[name];
      if (!el.value.trim()) el.setCustomValidity(name === 'area' ? 'Укажите площадь или «не знаю».' : 'Опишите задачу объекта.');
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const lines = ['Здравствуйте! Нужен расчёт для коммерческого объекта.', 'Объект: ' + data.get('object'), 'Площадь: ' + String(data.get('area')).trim(), 'Задача: ' + String(data.get('problem')).trim()];
    const source = new URLSearchParams(location.search).get('utm_source');
    if (['instagram', 'threads', 'tiktok', 'youtube', 'facebook', 'google', 'yandex'].includes(source)) lines.push('Источник: ' + source);
    track('quote_whatsapp_open', 'form');
    document.getElementById('request-status').textContent = 'Открываем WhatsApp. Чтобы передать запрос, отправьте подготовленное сообщение.';
    location.assign('https://wa.me/77760001966?text=' + encodeURIComponent(lines.join('\n')));
  });
})();
