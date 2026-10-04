(() => {
  'use strict';
  const menu = document.querySelector('.site-menu');
  if (menu) {
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) || event.target.closest('nav a')) menu.open = false;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
  }

  function track(eventName, position) {
    // Never send the message, contact details or a WhatsApp URL to analytics.
    const params = { position, page_path: window.location.pathname };
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    if (typeof window.ym === 'function') window.ym(113389386, 'reachGoal', eventName, params);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const action = link.dataset.track || '';
    const position = action.includes('-') ? action.substring(action.indexOf('-') + 1) : 'page';
    if (href.startsWith('tel:')) track('phone_click', position);
    else if (/^https:\/\/wa\.me\//i.test(href)) track('whatsapp_click', position);
  });

  const form = document.getElementById('request-form');
  if (form) form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const value = (name) => String(values.get(name) || '').trim();
    if (!value('problem')) {
      form.elements.problem.setCustomValidity('Опишите задачу объекта.');
      form.elements.problem.reportValidity();
      return;
    }
    const lines = ['Здравствуйте! Нужен расчёт и коммерческое предложение для организации.'];
    if (value('company')) lines.push('Компания: ' + value('company'));
    lines.push('Объект: ' + value('object'), 'Площадь: ' + value('area') + ' м²', 'Формат: ' + value('service'), 'Задача: ' + value('problem'));
    if (value('contact')) lines.push('Контакт для КП: ' + value('contact'));
    track('quote_whatsapp_open', 'request');
    document.getElementById('request-status').textContent = 'Открываем WhatsApp. Отправьте подготовленное сообщение, чтобы передать заявку.';
    window.location.assign('https://wa.me/77760001966?text=' + encodeURIComponent(lines.join('\n')));
  });
  if (form) form.elements.problem.addEventListener('input', () => form.elements.problem.setCustomValidity(''));
})();
