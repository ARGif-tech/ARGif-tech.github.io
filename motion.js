(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('.motion-toggle');
  let manualPause = false;
  const sync = () => {
    const paused = manualPause || preference.matches;
    document.body.classList.toggle('motion-paused', paused);
    if (button) {button.setAttribute('aria-pressed', String(paused));button.textContent = paused ? 'Анимация отключена' : 'Пауза анимации';}
    if(paused) document.querySelectorAll('.reveal-pending').forEach(el => el.classList.replace('reveal-pending','revealed'));
  };
  if(button) button.addEventListener('click', () => {manualPause = !manualPause;sync();});
  preference.addEventListener('change',sync);sync();
  if(!preference.matches && 'IntersectionObserver' in window){
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.replace('reveal-pending','revealed');observer.unobserve(entry.target);}}),{threshold:0.08});
    document.querySelectorAll('.section-heading,.value-grid,.document-grid,.steps>li,.object-card').forEach(el => {el.classList.add('reveal-pending');observer.observe(el);});
  }
  const hints = {
    'Кафе или ресторан':'Кухня, зал, хранение продуктов и режим работы. Укажите, в каких зонах заметили признаки.',
    'Склад или производство':'Товар, упаковка, ворота, погрузка и доступ к зонам. Укажите признаки и примерную площадь.',
    'Магазин':'Торговый зал, подсобные помещения и хранение товара. Укажите, где обнаружили проблему.',
    'Офис или бизнес-центр':'Рабочие зоны, общие помещения и режим доступа. Укажите задачу и время работы объекта.',
    'Гостиница':'Номера, общие зоны, кухня и режим заселения. Укажите, какие помещения затронуты.'
  };
  let selected = 'Кафе или ресторан';
  document.querySelectorAll('[data-object]').forEach(b => b.addEventListener('click', () => {
    selected = b.dataset.object;
    document.querySelectorAll('[data-object]').forEach(other => other.setAttribute('aria-pressed',String(other === b)));
    document.getElementById('choice-title').textContent = selected;
    document.getElementById('choice-hint').textContent = hints[selected];
    const field = document.getElementById('object');if(field) field.value = selected;
    if(typeof window.gtag === 'function') window.gtag('event','object_select',{object_type:selected,page_path:location.pathname});
  }));
  document.getElementById('choice-cta')?.addEventListener('click',()=>{const field=document.getElementById('object');if(field)field.value=selected;});
})();
