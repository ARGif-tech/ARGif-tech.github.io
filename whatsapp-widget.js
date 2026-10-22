/* 777xsz: WhatsApp link for public 777xsz pages. */
(function(){
'use strict';
if(window.__wa777xsz)return;
window.__wa777xsz=true;
function setup(){
 if(document.getElementById('wa777-button'))return;
 var locale=(document.documentElement.lang||'ru').slice(0,2).toLowerCase();
 var l={
 ru:{title:'Написать в WhatsApp',msg:'Здравствуйте! Пишу с сайта 777xsz.shop. Хочу узнать об услугах.'},
 kk:{title:'WhatsApp арқылы жазу',msg:'Сәлеметсіз бе! 777xsz.shop сайтынан жазып отырмын. Қызметтер туралы білгім келеді.'},
 en:{title:'Message on WhatsApp',msg:'Hello! I found you on 777xsz.shop and would like to ask about your services.'}
 }[locale]||{title:'Написать в WhatsApp',msg:'Здравствуйте! Пишу с сайта 777xsz.shop.'};
 var a=document.createElement('a');a.id='wa777-button';
 a.href='https://wa.me/77760001966?text='+encodeURIComponent(l.msg);
 a.target='_blank';a.rel='noopener noreferrer';
 a.setAttribute('aria-label',l.title);a.setAttribute('title',l.title);
 a.innerHTML='<svg viewBox="0 0 32 32" width="29" height="29" fill="currentColor" aria-hidden="true"><path d="M16.05 2.4a13.55 13.55 0 0 0-11.5 20.7L2.7 29.3l6.4-1.7a13.6 13.6 0 1 0 6.95-25.2Zm0 24.7a11.15 11.15 0 0 1-5.7-1.56l-.4-.24-3.8 1 1.02-3.7-.27-.43a11.16 11.16 0 1 1 9.15 4.93Zm6.12-8.33c-.34-.17-1.98-.98-2.29-1.09-.31-.11-.53-.17-.75.17-.22.34-.86 1.08-1.05 1.3-.2.22-.39.25-.73.08-.34-.17-1.42-.52-2.7-1.67-.99-.88-1.66-1.97-1.85-2.31-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.58.17-.19.22-.34.34-.56.11-.22.05-.42-.03-.59-.08-.17-.75-1.8-1.03-2.47-.27-.64-.54-.55-.75-.56h-.64c-.22 0-.58.08-.89.42-.31.34-1.17 1.14-1.17 2.78s1.2 3.23 1.37 3.45c.17.22 2.36 3.59 5.72 5.04.8.35 1.42.56 1.91.72.8.26 1.53.22 2.11.14.64-.1 1.98-.81 2.25-1.59.28-.78.28-1.45.2-1.59-.09-.14-.31-.22-.65-.39Z"/></svg><span>WhatsApp</span>';
 var css=document.createElement('style');css.id='wa777-css';
 css.textContent='#wa777-button{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom,0px));right:18px;z-index:65;display:flex;align-items:center;gap:9px;min-height:54px;padding:11px 15px;background:#25D366;color:#082411!important;border-radius:30px;font:750 14px/1.1 system-ui,Arial,sans-serif;text-decoration:none!important;box-shadow:0 6px 24px #0006;border:1px solid #d9ffe03d}#wa777-button:hover{background:#40e87f;transform:translateY(-2px)}#wa777-button:focus-visible{outline:3px solid #C6A45B;outline-offset:3px}#wa777-button.wa777-chat{bottom:calc(88px + env(safe-area-inset-bottom,0px))}@media(max-width:390px){#wa777-button{padding:10px 12px;min-height:50px;font-size:13px}#wa777-button svg{width:25px;height:25px}}body:has(#aibot.open) #wa777-button{display:none!important}@media print{#wa777-button{display:none!important}}';
 document.head.appendChild(css);document.body.appendChild(a);
 function adjust(){if(document.getElementById('aibot-btn')){a.classList.add('wa777-chat');return true}return false}
 if(!adjust()&&window.MutationObserver){
 var observer=new MutationObserver(function(){if(adjust())observer.disconnect()});
 observer.observe(document.body,{childList:true});
 window.addEventListener('load',function(){adjust();setTimeout(function(){observer.disconnect()},3000)},{once:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
