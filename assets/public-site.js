(()=>{'use strict';
const $=id=>document.getElementById(id),root=document.documentElement;
const menu=document.querySelector('.studio-mobile');
if(menu){menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus()}});document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});}
const wa='https://wa.me/77760001966?text=',money=new Intl.NumberFormat('ru-KZ',{maximumFractionDigits:0});
const quote=$('studio-quote-form'),type=$('studio-quote-type'),task=$('studio-quote-task'),price=$('studio-quote-price');
const prices={web:'от 500 000 ₸',crm:'от 390 000 ₸',ai:'аудит от 550 000 ₸',auto:'от 550 000 ₸',video:'от 85 000 ₸',design:'от 35 000 ₸',seo:'от 200 000 ₸',training:'По договорённости',other:'По договорённости'};
if(quote&&type&&task&&price){const show=()=>{price.hidden=!type.value;price.textContent=type.value?'Предварительно: '+prices[type.value]:''};type.addEventListener('change',show);show();task.addEventListener('input',()=>task.setCustomValidity(''));quote.addEventListener('submit',e=>{e.preventDefault();if(!task.value.trim()){task.setCustomValidity('Опишите задачу');task.reportValidity();return;}$('studio-quote-notice').textContent='Открываю WhatsApp. Проверьте сообщение перед отправкой.';location.href=wa+encodeURIComponent('Здравствуйте! Хочу обсудить проект 777xsz.\nУслуга: '+type.options[type.selectedIndex].text+'\nЗадача: '+task.value.trim())});}
const brief=$('brief'),service=$('service'),briefTask=$('task');
if(brief&&service&&briefTask){document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>{service.value=a.dataset.service}));document.querySelectorAll('[data-task]').forEach((b,i)=>b.addEventListener('click',()=>{service.value=['Внедрение ИИ в бизнес','CRM и приложения','Сайт и 3D','Обучение работе с ИИ'][i]||'';if(!briefTask.value.trim()||briefTask.dataset.example===briefTask.value){briefTask.value=b.dataset.task;briefTask.dataset.example=briefTask.value}briefTask.focus()}));brief.addEventListener('submit',e=>{e.preventDefault();if(!briefTask.value.trim()){$('notice').textContent='Введите описание задачи.';return;}$('notice').textContent='Открываю WhatsApp. Проверьте сообщение перед отправкой.';location.href=wa+encodeURIComponent(['Проект: '+service.value,'Компания: '+($('company').value.trim()||'Не указана'),'Задача: '+briefTask.value.trim()].join('\n'))});}
const fields=['hours','rate','share','cost','monthly'];
if(fields.every(id=>$(id))&&$('saving')&&$('payback')){const value=id=>{const e=$(id);return Math.min(Number(e.max),Math.max(0,Number(e.value)||0))};const calculate=()=>{const net=value('hours')*value('rate')*value('share')/100-value('monthly');$('saving').textContent=money.format(net)+' ₸';$('payback').textContent=net>0?new Intl.NumberFormat('ru-KZ',{maximumFractionDigits:1}).format(value('cost')/net)+' мес.':'Нет'};fields.forEach(id=>$(id).addEventListener('input',calculate));calculate();}
const search=$('course-search'),results=$('course-results');if(search&&results){const cards=[...document.querySelectorAll('#available .card')];search.addEventListener('input',()=>{const q=search.value.toLocaleLowerCase('ru').trim();let n=0;cards.forEach(c=>{const show=c.textContent.toLocaleLowerCase('ru').includes(q);c.hidden=!show;if(show)n++});results.textContent='Найдено: '+n+' из '+cards.length})}
const solutionData={"leads":["CRM и автоматизация продаж","Разберём источники обращений, этапы сделки и повторные контакты. Настроим воронку и распределение заявок.","Настройка CRM от 390 000 ₸","bitrix24","CRM и приложения"],"web":["Разработка сайта","Спроектируем предложение, структуру, мобильный интерфейс и удобный путь к заявке.","Лендинг от 500 000 ₸","web-development","Сайт и 3D"],"routine":["ИИ и автоматизация","Определим операции, которые можно передать системе, проверим доступы и оценим возможную экономию.","Аудит ИИ от 550 000 ₸","ai-solutions","Внедрение ИИ в бизнес"],"media":["Видео и графика","Согласуем аудиторию, формат, визуальную концепцию и материалы для рекламной кампании.","Графика от 35 000 ₸, монтаж от 85 000 ₸","digital-production","Видеопродакшн"],"search":["SEO и GEO","Проверим доступность страниц, структуру, поисковые запросы и содержание. Определим измеримые критерии видимости.","Технический аудит от 200 000 ₸","seo-geo","Продвижение в поиске"]};const solutionButtons=[...document.querySelectorAll('[data-solution]')];if(solutionButtons.length){solutionButtons.forEach(b=>b.addEventListener('click',()=>{const d=solutionData[b.dataset.solution];if(!d)return;solutionButtons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('solution-title').textContent=d[0];$('solution-desc').textContent=d[1];$('solution-price').textContent=d[2];$('solution-link').href='/services/'+d[3]+'/';$('solution-contact').dataset.service=d[4];}));}
// One motion controller. GIFs render independently of CSS timing.
const media=matchMedia('(prefers-reduced-motion: reduce)');let off=media.matches;const active=new Set(),progress=document.createElement('div');progress.className='xm-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
const pics=[...document.querySelectorAll('picture.xm-native')].map(p=>{const source=p.querySelector('source[data-xm-still]'),img=p.querySelector('img');return source&&img?{source,img,still:source.getAttribute('srcset'),loop:img.getAttribute('src')}:null}).filter(Boolean);
function sync(){off=media.matches;root.classList.remove('xm-disabled','xm-user-on');root.classList.toggle('xm-gentle',off);for(const p of pics){p.source.media='not all';const target=off?p.still:p.loop;if(p.img.getAttribute('src')!==target)p.img.setAttribute('src',target);}if(off){for(const a of active)a.cancel();active.clear()}requestProgress();}
let raf=0;function updateProgress(){raf=0;const max=root.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max>0?Math.max(0,Math.min(1,scrollY/max)):0)+')'}function requestProgress(){if(!raf)raf=requestAnimationFrame(updateProgress)}
if(media.addEventListener)media.addEventListener('change',sync);else if(media.addListener)media.addListener(sync);
addEventListener('scroll',requestProgress,{passive:true});addEventListener('resize',requestProgress,{passive:true});sync();
if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;io.unobserve(e.target);if(off||document.hidden||typeof e.target.animate!=='function')continue;const a=e.target.animate([{opacity:.74,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out'});active.add(a);a.onfinish=a.oncancel=()=>active.delete(a)}},{threshold:.1});document.querySelectorAll('.studio-section-head,.studio-service,.studio-project,.studio-process-grid article,.seo-grid>article,.service-scope .tile,.seo-author,.studio-usecases article,.card').forEach(e=>io.observe(e));}
document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const a of active)a.cancel();active.clear()}else requestProgress()});
})();
// v25: explicit frame updates for visible artwork and decorative rails.
// Keep text, layout, prices, form inputs and hit targets stationary.
(()=>{
 const root=document.documentElement,media=matchMedia('(prefers-reduced-motion: reduce)');
 const rails=[...document.querySelectorAll('.studio-service,.seo-grid>article,.service-scope .tile,.studio-process-grid article,.studio-usecases article,.card,.solution-result,.xprice-summary,.seo-author,.studio-mini,.price-menu,.studio-demo,.studio-learning,.studio-experience,.xm-detail-scene,.xm-mini-scene')].filter(e=>!e.closest('.xprice-fields,form,details'));
 const visual=[...document.querySelectorAll('.signature-stage,.offer-art,.studio-service-art,.xm-detail-scene,.xm-mini-scene,.studio-book,.glyph')];
 const all=[...new Set([...rails,...visual])];
 const visible=new Set(), observers=[];
 const railMap=new Map();
 for(const e of rails){
  e.classList.add('xsz-live-frame');
  const r=document.createElement('span');r.className='xsz-live-rail';r.setAttribute('aria-hidden','true');
  const b=document.createElement('i');r.append(b);e.append(r);railMap.set(e,b);
 }
 for(const e of visual){e.classList.add('xsz-live-visual')}
 if('IntersectionObserver'in window){const ob=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target)}},{rootMargin:'90px'});all.forEach(e=>ob.observe(e));observers.push(ob)}else all.forEach(e=>visible.add(e));
 const nodes=[...document.querySelectorAll('.signature-cube,.signature-orbits,.signature-chip,.signature-chart,.signature-server-bars,.signature-pulse,.signature-signal,.signature-icons,.oa-flow,.oa-pulse,.oa-playhead')];
 const nodeParent=new Map(nodes.map(e=>[e,e.closest('.signature-stage,.offer-art')]));
 let timer=null,frames=0,start=performance.now();
 const f=n=>Number(n).toFixed(3);
 function tick(){
  if(document.hidden)return;
  const t=(performance.now()-start)/1000,gentle=media.matches;
  for(const e of visible){
   const index=all.indexOf(e),p=t*1.45+index*.79,w=(1-Math.cos(p))*.5;
   e.style.setProperty('--xsz-motion-light',f(.22+.67*w));
   const rail=railMap.get(e);if(rail){rail.style.opacity=f(.35+.65*w);rail.style.transform=gentle?'none':'translateX('+f((t*22+index*37)%220-80)+'%)';}
  }
  for(const e of nodes){
   if(!visible.has(nodeParent.get(e)))continue;
   const w=(1-Math.cos(t*1.8))*.5;
   e.classList.add('xsz-frame-driven');
   if(e.classList.contains('signature-cube'))e.style.transform=gentle?'none':'translateY('+f(-13*w)+'px)';
   else if(e.classList.contains('signature-orbits'))e.style.transform=gentle?'none':'rotate('+f(t*13%360)+'deg)';
   else if(e.classList.contains('signature-chart'))e.style.strokeDashoffset=gentle?'0':f(1-w);
   else if(e.classList.contains('signature-server-bars')||e.classList.contains('signature-signal')||e.classList.contains('oa-flow')){e.style.strokeDashoffset=gentle?'0':f(-t*26%100);e.style.opacity=f(.55+.45*w);}
   else if(e.classList.contains('oa-playhead'))e.style.transform=gentle?'none':'translateX('+f(t*70%300)+'px)';
   else e.style.opacity=f(.53+.47*w);
  }
  root.dataset.artFrames=String(++frames);
 }
 function sync(){if(document.hidden){if(timer!==null)clearInterval(timer);timer=null;}else if(timer===null){tick();timer=setInterval(tick,40);}}
 root.classList.add('xsz-live-motion');document.addEventListener('visibilitychange',sync);window.addEventListener('pageshow',sync);sync();
})();
