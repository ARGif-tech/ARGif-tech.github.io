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

  // Homepage video: local copy hosted with the AR Works site.
  if (document.body.classList.contains('home')) {
    const hero = document.querySelector('.hero');
    if (hero && !document.getElementById('arworks-video')) {
      const style = document.createElement('style');
      style.textContent = `
        #arworks-video .video-wrap{display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:38px;align-items:center}
        #arworks-video .video-frame{width:100%;max-width:420px;margin:0 auto;border-radius:24px;overflow:hidden;background:#050807;box-shadow:0 22px 60px rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.10)}
        #arworks-video video{display:block;width:100%;aspect-ratio:9/16;object-fit:cover;background:#050807}
        #arworks-video .video-copy{max-width:650px}
        #arworks-video .video-copy p{font-size:1.05rem;line-height:1.65}
        #arworks-video .video-copy .btn{margin-top:10px}
        @media (max-width:760px){#arworks-video .video-wrap{grid-template-columns:1fr;gap:24px}#arworks-video .video-frame{max-width:360px}#arworks-video .video-copy{text-align:left}}
      `;
      document.head.appendChild(style);

      const section = document.createElement('section');
      section.id = 'arworks-video';
      section.innerHTML = `
        <div class="w">
          <div class="ey">AR Works в работе</div>
          <div class="video-wrap">
            <div class="video-frame">
              <video controls playsinline preload="metadata" poster="/ar-works-social-v2.png" aria-label="Видео AR Works о санитарном обслуживании бизнеса">
                <source src="/ar-works-business.mp4" type="video/mp4">
                Ваш браузер не поддерживает воспроизведение видео.
              </video>
            </div>
            <div class="video-copy">
              <h2>Санитарное обслуживание бизнеса в Астане</h2>
              <p class="muted">Дезинсекция, дератизация, дезинфекция и озонирование для кафе, ресторанов, магазинов, складов, производств и других организаций. Разовые работы или регулярное обслуживание под задачи объекта.</p>
              <p class="muted">Для предварительного расчёта достаточно указать тип объекта, площадь и проблему.</p>
              <a class="btn primary" data-track="whatsapp-video" href="https://wa.me/77760001966?text=Здравствуйте%2C%20посмотрел%20видео%20на%20сайте%20AR%20Works.%20Нужен%20расчёт%20для%20организации">Получить расчёт в WhatsApp</a>
            </div>
          </div>
        </div>`;
      hero.insertAdjacentElement('afterend', section);

      const video = section.querySelector('video');
      if (video) video.addEventListener('play', () => track('video_play', 'home'), { once: true });
    }
  }

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
