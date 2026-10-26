/* 777xsz accessible book reader. Provide trusted chapter data as an array. */
(function(){
"use strict";
window.XSZBookReader=function(root,book){
 if(!root||!book||!Array.isArray(book.chapters)||!book.chapters.length) return;
 const chapters=book.chapters.filter(c=>c&&typeof c.title==="string"&&typeof c.text==="string");
 if(!chapters.length)return;
 const key="777xsz:reading:"+String(book.id||"book");
 let index=0, font=17;
 try{index=Math.min(chapters.length-1,Math.max(0,Number(localStorage.getItem(key))||0));font=Math.min(24,Math.max(15,Number(localStorage.getItem(key+":font"))||17))}catch(e){}
 root.classList.add("xsz-reader");
 root.innerHTML='<div class="xsz-reader__top"><strong class="xsz-reader__book-title"></strong><div><button type="button" data-action="toc" aria-expanded="false">Оглавление</button> <button type="button" data-action="smaller" aria-label="Уменьшить шрифт">А−</button> <button type="button" data-action="larger" aria-label="Увеличить шрифт">А+</button></div></div><nav class="xsz-reader__toc" aria-label="Главы книги" aria-hidden="true"></nav><div class="xsz-reader__pages"><section class="xsz-reader__page" aria-hidden="true"><div><span class="xsz-reader__meta">777XSZ · Библиотека</span><h2 class="xsz-reader__cover-title"></h2><p class="xsz-reader__subtitle"></p></div><span class="xsz-reader__meta">Авторские материалы</span></section><article class="xsz-reader__page"><div><span class="xsz-reader__meta xsz-reader__chapter-number"></span><h2 class="xsz-reader__chapter-title"></h2><p class="xsz-reader__chapter-text"></p></div><span class="xsz-reader__meta xsz-reader__page-number"></span></article></div><nav class="xsz-reader__bottom" aria-label="Перелистывание"><button type="button" data-action="prev">Назад</button><span class="xsz-reader__progress" aria-live="polite"></span><button type="button" data-action="next">Далее</button></nav>';
 const q=s=>root.querySelector(s),toc=q(".xsz-reader__toc");
 q(".xsz-reader__book-title").textContent=book.title||"Книга";
 q(".xsz-reader__cover-title").textContent=book.title||"Книга";
 q(".xsz-reader__subtitle").textContent=book.subtitle||"";
 chapters.forEach((chapter,i)=>{const b=document.createElement("button");b.type="button";b.textContent=(i+1)+". "+chapter.title;b.addEventListener("click",()=>{index=i;render();toggle(false)});toc.appendChild(b)});
 function toggle(open){toc.setAttribute("aria-hidden",String(!open));q('[data-action="toc"]').setAttribute("aria-expanded",String(open))}
 function render(){const c=chapters[index];q(".xsz-reader__chapter-number").textContent="Глава "+(index+1);q(".xsz-reader__chapter-title").textContent=c.title;q(".xsz-reader__chapter-text").textContent=c.text;q(".xsz-reader__page-number").textContent="777XSZ · "+(index+1);q(".xsz-reader__progress").textContent=(index+1)+" / "+chapters.length;q('[data-action="prev"]').disabled=index===0;q('[data-action="next"]').disabled=index===chapters.length-1;root.style.setProperty("--reader-font",font+"px");try{localStorage.setItem(key,String(index));localStorage.setItem(key+":font",String(font))}catch(e){}}
 root.addEventListener("click",e=>{const b=e.target.closest("button[data-action]");if(!b)return;switch(b.dataset.action){case "prev":if(index>0)index--;break;case "next":if(index<chapters.length-1)index++;break;case "smaller":font=Math.max(15,font-1);break;case "larger":font=Math.min(24,font+1);break;case "toc":toggle(toc.getAttribute("aria-hidden")==="true");return}render()});
 root.addEventListener("keydown",e=>{if(e.target.closest("button,input,textarea,select"))return;if(e.key==="ArrowRight"&&index<chapters.length-1){index++;render()}else if(e.key==="ArrowLeft"&&index>0){index--;render()}});
 render();
};
})();