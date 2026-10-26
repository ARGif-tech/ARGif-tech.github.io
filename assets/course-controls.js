/* 777XSZ course reading controls: enhancement only; lessons stay readable without JS. */
(()=>{'use strict';
const article=document.querySelector('.reader-layout .article');
if(!article)return;
const lessons=Array.from(article.querySelectorAll('.lesson[id]'));
if(!lessons.length)return;
const key='777xsz:course:'+location.pathname;
const toolbar=document.createElement('nav');toolbar.className='xsz-course-controls';toolbar.setAttribute('aria-label','Навигация по книге');
toolbar.innerHTML='<div class="xsz-course-controls__top"><strong>Читать как книгу</strong><span class="xsz-course-position" aria-live="polite"></span></div><div class="xsz-course-controls__actions"><button type="button" data-xsz="prev">Предыдущая глава</button><button type="button" data-xsz="bookmark">Запомнить главу</button><button type="button" data-xsz="resume">Продолжить чтение</button><button type="button" data-xsz="next">Следующая глава</button></div>';
article.insertBefore(toolbar,article.firstChild);
let current=0;
try{const id=localStorage.getItem(key);const found=lessons.findIndex(l=>l.id===id);if(found>=0)current=found}catch(_){}
function refresh(){toolbar.querySelector('.xsz-course-position').textContent='Глава '+(current+1)+' из '+lessons.length;toolbar.querySelector('[data-xsz="prev"]').disabled=current===0;toolbar.querySelector('[data-xsz="next"]').disabled=current===lessons.length-1}
function go(i){current=Math.max(0,Math.min(lessons.length-1,i));refresh();lessons[current].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});history.replaceState(null,'','#'+encodeURIComponent(lessons[current].id))}
toolbar.addEventListener('click',e=>{const button=e.target.closest('button[data-xsz]');if(!button)return;switch(button.dataset.xsz){case'prev':go(current-1);break;case'next':go(current+1);break;case'bookmark':try{localStorage.setItem(key,lessons[current].id);button.textContent='Глава сохранена';setTimeout(()=>button.textContent='Запомнить главу',1800)}catch(_){button.textContent='Не удалось сохранить'}break;case'resume':{let id;try{id=localStorage.getItem(key)}catch(_){}const i=lessons.findIndex(l=>l.id===id);go(i<0?0:i);break}}});
const toc=document.querySelector('.reader-layout .toc');if(toc)toc.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=decodeURIComponent(a.hash.slice(1));const i=lessons.findIndex(l=>l.id===id);if(i>=0){current=i;refresh()}});
const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(!visible.length)return;const i=lessons.indexOf(visible[0].target);if(i>=0){current=i;refresh()}},{rootMargin:'-15% 0px -60% 0px',threshold:[0,.1,.5]});lessons.forEach(l=>observer.observe(l));
refresh();
})();