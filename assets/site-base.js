(() => {
  'use strict';
  const q = (sel,scope=document) => scope.querySelector(sel);
  const qa = (sel,scope=document) => [...scope.querySelectorAll(sel)];

  const toggle = q('.nav-toggle');
  const mobileNav = q('#mobile-nav');
  if(toggle && mobileNav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      mobileNav.hidden = !open;
    };
    toggle.addEventListener('click', () => setOpen(mobileNav.hidden));
    qa('a',mobileNav).forEach(a => a.addEventListener('click',()=>setOpen(false)));
    document.addEventListener('keydown',e => {if(e.key==='Escape')setOpen(false)});
  }

  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    qa('.section-heading,.problem-item,.service-card,.flow-demo,.product-shell,.other-card,.founder-card,.faq-list,.final-cta-inner,.detail-block').forEach(el=>el.classList.add('reveal'));
    const reveal = new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('is-visible');reveal.unobserve(e.target)}
    }),{threshold:.09,rootMargin:'0px 0px -24px 0px'});
    qa('.reveal').forEach(el=>reveal.observe(el));
  }

  const filterButtons = qa('[data-filter]');
  if(filterButtons.length){
    const cards = qa('#catalog-grid .service-card');
    const count = q('#catalog-count');
    filterButtons.forEach(button=>button.addEventListener('click',()=>{
      const category=button.dataset.filter;
      filterButtons.forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});
      let n=0;
      cards.forEach(card=>{const show=category==='all'||card.dataset.serviceCategory===category;card.hidden=!show;if(show)n++});
      if(count)count.textContent=String(n);
      const empty=q('.catalog-empty');if(empty)empty.hidden=n>0;
    }));
  }

  const flow = qa('.flow-tab');
  const flowDescription = q('#flow-description');
  const descriptions = [
    'Клиент оставляет вопрос через удобный канал связи.',
    'Обращение быстро обрабатывается. Если нужна помощь, вопрос передаётся сотруднику.',
    'Команда видит новую заявку и понимает, что нужно сделать дальше.'
  ];
  if(flow.length && flowDescription) {
    const activate=(i)=>{flow.forEach((b,n)=>{b.classList.toggle('active',n===i);b.setAttribute('aria-selected',String(n===i))});flowDescription.textContent=descriptions[i];};
    flow.forEach((button,i)=>{
      button.addEventListener('click',()=>activate(i));
      button.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
        e.preventDefault();const next=(i+(e.key==='ArrowRight'?1:-1)+flow.length)%flow.length;flow[next].focus();activate(next);
      }});
    });
  }

  const form=q('#inquiry-form');
  if(form){
    const result=q('#inquiry-result'),preview=q('#inquiry-preview');
    let message='';
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(!form.reportValidity())return;
      const name=q('#inquiry-name').value.trim();
      const business=q('#inquiry-business').value.trim();
      const task=q('#inquiry-task').value.trim();
      if(!name||!task){const field=q(!name?'#inquiry-name':'#inquiry-task');field.setCustomValidity('Заполните поле текстом');field.reportValidity();field.addEventListener('input',()=>field.setCustomValidity(''),{once:true});return;}
      message=`Здравствуйте, Айдархан! Меня зовут ${name}.\n${business?`Сфера бизнеса: ${business}.\n`:''}Задача: ${task}\n\nПишу с сайта 777xsz.`;
      preview.textContent=message;
      const whatsapp=q('#whatsapp-inquiry');
      if(whatsapp)whatsapp.href=`https://wa.me/77760001966?text=${encodeURIComponent(message)}`;
      form.hidden=true;result.hidden=false;
      result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
    });
    q('#edit-inquiry')?.addEventListener('click',()=>{result.hidden=true;form.hidden=false;q('#inquiry-task').focus()});
    q('#copy-inquiry')?.addEventListener('click',async e=>{
      const button=e.currentTarget;
      try{
        if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(message);
        else {const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(preview);selection.removeAllRanges();selection.addRange(range);document.execCommand('copy');selection.removeAllRanges();}
        q('span',button).textContent='Скопировано ✓';
      }catch{q('span',button).textContent='Выделите текст ниже';}
    });
  }

  // The static hero artwork replaces the previous GPU-intensive WebGL animation.
})();
