(() => {
  'use strict';
  const video=document.querySelector('.cinema-video');
  if(!video)return;
  const hero=document.querySelector('.cinema-hero'),stage=document.querySelector('.cinema-stage');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const saveData=navigator.connection?.saveData;
  let visible=true;
  const sync=()=>{
    const paused=document.body.classList.contains('motion-paused')||preference.matches||document.hidden||!visible||saveData;
    if(paused){video.pause();return;}
    if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}
    video.play().catch(()=>{ /* Poster remains visible if autoplay is denied. */ });
  };
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.02}).observe(hero);
    const chapterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){document.querySelectorAll('.story-chapter').forEach(el=>el.classList.toggle('is-active',el===entry.target));}
    }),{rootMargin:'-15% 0px -30% 0px',threshold:.15});
    document.querySelectorAll('.story-chapter').forEach(el=>chapterObserver.observe(el));
  }
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    hero.addEventListener('pointermove',event=>{
      if(preference.matches||document.body.classList.contains('motion-paused'))return;
      const r=hero.getBoundingClientRect();
      stage.style.setProperty('--tilt-x',((event.clientX-r.left)/r.width-.5)*14+'px');
      stage.style.setProperty('--tilt-y',((event.clientY-r.top)/r.height-.5)*10+'px');
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{stage.style.setProperty('--tilt-x','0px');stage.style.setProperty('--tilt-y','0px');});
  }
  sync();
})();
