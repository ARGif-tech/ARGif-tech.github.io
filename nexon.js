'use strict';
/* Товарные названия, варианты и цены из предоставленного каталога NEXON (2025).
 * Данные не синхронизируются со складом. Перед оформлением заказа уточняйте у менеджера. */
const PHONE = '77079197659'; // Номер из предоставленного каталога NEXON; WhatsApp уточняется
const categories = [
  {id:'Выключатели',title:'Выключатели',short:'Одно-, двух-, трёхклавишные',img:'assets/switch-white.svg'},
  {id:'Розетки',title:'Розетки',short:'С крышкой, двойные и стандартные',img:'assets/socket-white.svg'},
  {id:'Коммуникации',title:'TV, RJ45, HDMI и USB',short:'Для рабочих и жилых пространств',img:'assets/accessory.svg'},
  {id:'Рамки и управление',title:'Рамки и регуляторы',short:'1–5 постов и термостаты',img:'assets/frame.svg'}
];
const finishes=[{id:'Белый',slug:'white',swatch:'#f1f1ee'},{id:'Золото',slug:'gold',swatch:'#b9956b'},{id:'Платина',slug:'platinum',swatch:'#777983'},{id:'Карбон',slug:'carbon',swatch:'#262932'}];
const types=[
 ['Выключатель 1-клавишный','Выключатели'],
 ['Выключатель с подсветкой','Выключатели'],
 ['Выключатель 2-клавишный','Выключатели'],
 ['Выключатель 2-клавишный с подсветкой','Выключатели'],
 ['Выключатель 3-клавишный','Выключатели'],
 ['Выключатель перекрёстный 1-клавишный','Выключатели'],
 ['Выключатель проходной 1-клавишный','Выключатели'],
 ['Выключатель проходной 2-клавишный','Выключатели'],
 ['Розетка','Розетки'],
 ['Розетка двойная','Розетки'],
 ['Розетка с крышкой IP44','Розетки'],
 ['Розетка HDMI','Коммуникации'],
 ['Розетка RJ45','Коммуникации'],
 ['Розетка двойная RJ45 + RJ45','Коммуникации'],
 ['Розетка TV','Коммуникации'],
 ['Розетка USB + Type-C','Коммуникации'],
 ['Рамка 1-постовая','Рамки и управление'],
 ['Рамка 2-постовая','Рамки и управление'],
 ['Рамка 3-постовая','Рамки и управление'],
 ['Рамка 4-постовая','Рамки и управление'],
 ['Рамка 5-постовая','Рамки и управление'],
 ['Светорегулятор (диммер)','Рамки и управление'],
 ['Терморегулятор для тёплого пола','Рамки и управление']
];
const standardPrices=[1080,1620,1215,1755,1620,1485,1215,1485,1080,2430,1890,2430,1215,1755,1485,6750,450,790,1125,1465,2475,13500,30380];
const carbonPrices=[1215,1890,1350,1890,1755,1620,1350,1620,1215,2700,2025,2700,1350,1890,1620,7020,505,845,1240,1575,2590,14630,33750];
// Стартовая витрина: отобранные позиции из полного PDF-каталога.
const featuredSlots=[0,2,4,8,9,10,12,15,16,17];
const products=finishes.flatMap((finish,fi)=>featuredSlots.map(slot=>({
 id:fi*types.length+slot+1,name:`NEXON · ${types[slot][0]}, ${finish.id.toLowerCase()}`,
 category:types[slot][1],finish:finish.id,price:(finish.id==='Карбон'?carbonPrices:standardPrices)[slot],
 img:`assets/catalog-${finish.slug}.webp`,slot,tag:finish.id.toUpperCase(),spec:`Цвет: ${finish.id} · ${types[slot][1]}`,
 source:'https://nexon-electro.com/'
})));
const $ = (id)=>document.getElementById(id);
const formatPrice = p => p.price===null?'Цену уточняйте':p.price.toLocaleString('ru-RU')+' ₸';
const storage = {
  read(key,fallback){try{const val=JSON.parse(localStorage.getItem(key));return val===null?fallback:val}catch{return fallback}},
  write(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch{}}
};
const storedCart=storage.read('nexon-cart-v2',{});
const storedFavs=storage.read('nexon-favs-v2',[]);
const state={finish:'Все цвета',limit:24,category:'Все товары',search:'',sort:'default',favoritesOnly:false,cart:(storedCart && typeof storedCart==='object' && !Array.isArray(storedCart))?storedCart:{},favorites:new Set(Array.isArray(storedFavs)?storedFavs.map(Number):[]),overlay:null};
function imageMarkup(p){if(p.slot===null)return `<img src="${p.img}" alt="Иллюстрация регулятора" loading="lazy">`;const x=p.slot%7*100/6,y=Math.floor(p.slot/7)*50;return `<span class="catalog-sprite" role="img" aria-label="Фото товара из каталога NEXON" style="background-image:url('${p.img}');background-position:${x}% ${y}%"></span>`;}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function toast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2300);}
function updateCounts(){const count=Object.values(state.cart).reduce((s,n)=>s+Math.max(0,Number(n)||0),0);$('cartCount').textContent=count;$('cartCount').hidden=!count;$('favCount').textContent=state.favorites.size;$('favCount').hidden=!state.favorites.size;$('drawerCount').textContent=count;}
function categoryMarkup(c){return `<a class="category-card" href="#products" data-category="${esc(c.id)}"><h3>${esc(c.title)}</h3><span>Смотреть ↗</span><img src="${c.img}" alt="" loading="lazy"></a>`;}
function renderCategories(){ $('categoryGrid').innerHTML=categories.map(categoryMarkup).join('');$('menuCategories').innerHTML=categories.map(c=>`<a href="#products" class="menu-card" data-category="${esc(c.id)}"><img src="${c.img}" alt=""><div><b>${esc(c.title)}</b><small>${esc(c.short)}</small></div></a>`).join(''); }
function renderFilters(){const fin=$('finishChips');fin.innerHTML=[{id:'Все цвета',swatch:'linear-gradient(135deg,#fff 25%,#282c32 25%,#282c32 50%,#b9956b 50%,#b9956b 75%,#777983 75%)'},...finishes].map(f=>`<button type="button" class="finish-chip ${state.finish===f.id?'active':''}" data-finish="${f.id}" aria-pressed="${state.finish===f.id}"><i style="background:${f.swatch}"></i>${f.id}</button>`).join('');const data=[{id:'Все товары',title:'Все товары'},...categories];$('filterChips').innerHTML=data.map(c=>`<button type="button" class="filter-chip ${state.category===c.id?'active':''}" data-category="${esc(c.id)}" aria-pressed="${state.category===c.id}">${esc(c.title)}</button>`).join('');}
function filteredProducts(){const search=state.search.trim().toLocaleLowerCase('ru-RU');let out=products.filter(p=>(state.category==='Все товары'||p.category===state.category)&&(state.finish==='Все цвета'||p.finish===state.finish)&&(!state.favoritesOnly||state.favorites.has(p.id))&&(!search||`${p.name} ${p.category} ${p.spec} ${p.finish}`.toLocaleLowerCase('ru-RU').includes(search)));if(state.sort==='price-asc')out.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));else if(state.sort==='price-desc')out.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));else if(state.sort==='name')out.sort((a,b)=>a.name.localeCompare(b.name,'ru'));return out;}
function productMarkup(p){const added=Number(state.cart[p.id]||0)>0;const fav=state.favorites.has(p.id);return `<article class="product-card"><button type="button" class="favorite ${fav?'active':''}" data-action="fav" data-id="${p.id}" aria-label="${fav?'Удалить из избранного':'В избранное'}" aria-pressed="${fav}">${fav?'♥':'♡'}</button><button type="button" class="product-visual" data-action="open" data-id="${p.id}" aria-label="Открыть ${esc(p.name)}"><span class="product-badge">${p.tag}</span>${imageMarkup(p)}</button><div class="product-category">${esc(p.category)}</div><button type="button" class="product-title" data-action="open" data-id="${p.id}">${esc(p.name)}</button><div class="product-specs">${esc(p.spec)}${p.wholesale?' · Только оптом':''}</div><div class="product-bottom"><strong class="product-price ${p.price===null?'request':''}">${formatPrice(p)}</strong><button type="button" class="buy-button ${added?'added':''}" data-action="add" data-id="${p.id}" aria-label="Добавить в корзину: ${esc(p.name)}">${added?'✓':'+'}</button></div></article>`;}
function renderProducts(){const data=filteredProducts();$('productsGrid').innerHTML=data.slice(0,state.limit).map(productMarkup).join('');$('loadMore').hidden=data.length<=state.limit;$('emptyState').hidden=!!data.length;$('resultLabel').textContent=state.favoritesOnly?`Избранное · ${data.length} товаров`:`Найдено: ${data.length} товаров`;renderFilters();$('favoritesToggle').setAttribute('aria-pressed',String(state.favoritesOnly));$('favoritesToggle').style.color=state.favoritesOnly?'var(--blue)':'';}
function changeCategory(category){state.limit=24;state.category=category;state.favoritesOnly=false;closeCatalog();renderProducts();}
function toggleFavorite(id){if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);storage.write('nexon-favs-v2',[...state.favorites]);updateCounts();renderProducts();toast(state.favorites.has(id)?'Добавлено в избранное':'Удалено из избранного');}
function addToCart(id){state.cart[id]=(Number(state.cart[id])||0)+1;persistCart();renderProducts();toast('Товар добавлен в корзину');if($('productModal').classList.contains('open'))renderModal(id);}
function persistCart(){storage.write('nexon-cart-v2',state.cart);updateCounts();renderCart();}
function qty(id,delta){const n=Number(state.cart[id]||0)+delta;if(n<=0)delete state.cart[id];else state.cart[id]=Math.min(n,999);persistCart();renderProducts();}
function checkoutUrl(){const items=products.filter(p=>Number(state.cart[p.id])>0);if(!items.length)return `https://wa.me/${PHONE}`;let msg='Здравствуйте! Хочу уточнить наличие и оформить заявку NEXON Electric:\n\n';items.forEach(p=>msg+=`• ${p.name} — ${state.cart[p.id]} шт. (${formatPrice(p)}${p.wholesale?', оптом':''})\n`);let total=items.reduce((s,p)=>s+(p.price||0)*Number(state.cart[p.id]),0);let unknown=items.some(p=>p.price===null);msg+=`\nПредварительная сумма: ${total.toLocaleString('ru-RU')} ₸${unknown?' + позиции с ценой по запросу':''}.\nПросьба подтвердить актуальные цены, наличие и условия доставки.`;return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;}
function renderCart(){const items=products.filter(p=>Number(state.cart[p.id])>0);$('cartContents').innerHTML=items.length?items.map(p=>`<div class="cart-line">${imageMarkup(p)}<div class="cart-line-body"><p class="cart-line-title">${esc(p.name)}</p><div class="cart-line-price ${p.price===null?'request':''}">${formatPrice(p)}</div><div class="cart-line-controls"><button class="quantity-button" data-qty="-1" data-id="${p.id}" aria-label="Уменьшить количество">−</button><span class="quantity-value">${state.cart[p.id]}</span><button class="quantity-button" data-qty="1" data-id="${p.id}" aria-label="Увеличить количество">+</button><button class="remove-line" data-qty="remove" data-id="${p.id}">Удалить</button></div></div></div>`).join(''):'<div class="cart-empty"><div class="cart-empty-icon">◫</div><strong>Корзина пока пуста</strong><span>Добавьте интересующие товары из каталога.</span></div>';$('cartBottom').hidden=!items.length;let sum=items.reduce((s,p)=>s+(p.price||0)*Number(state.cart[p.id]),0);$('cartTotal').textContent=sum.toLocaleString('ru-RU')+' ₸'+(items.some(p=>p.price===null)?' + по запросу':'');$('checkoutButton').href=checkoutUrl();}
function renderModal(id){const p=products.find(p=>p.id===id);if(!p)return;$('productModalBody').innerHTML=`<div class="modal-grid"><div class="modal-image">${imageMarkup(p)}</div><div class="modal-body"><div class="product-category">${esc(p.category)}</div><h2 id="modalTitle">${esc(p.name)}</h2><p>${esc(p.spec)}. Условия продажи уточняйте у менеджера.</p><p>Фото из предоставленного каталога NEXON для этой модификации. Проверяйте характеристики и комплектацию при заказе.</p><div class="product-price ${p.price===null?'request':''}">${formatPrice(p)}</div><p>Указанная цена ориентировочная и подлежит подтверждению.</p><div class="modal-actions"><button type="button" data-action="add" data-id="${p.id}">+ В корзину</button><button type="button" class="modal-fav" data-action="fav" data-id="${p.id}">${state.favorites.has(id)?'♥ В избранном':'♡ В избранное'}</button></div><a class="modal-source" href="${p.source}" target="_blank" rel="noopener noreferrer">Категория в исходном каталоге ↗</a></div></div>`;}
function modalOpen(id){closeCatalog();renderModal(id);$('overlay').hidden=false;$('productModal').classList.add('open');$('productModal').setAttribute('aria-hidden','false');$('cartDrawer').classList.remove('open');$('cartDrawer').setAttribute('aria-hidden','true');state.overlay='product';document.body.classList.add('modal-open');$('closeProduct').focus();}
function cartOpen(){closeCatalog();$('overlay').hidden=false;$('productModal').classList.remove('open');$('productModal').setAttribute('aria-hidden','true');$('cartDrawer').classList.add('open');$('cartDrawer').setAttribute('aria-hidden','false');state.overlay='cart';document.body.classList.add('modal-open');renderCart();$('closeCart').focus();}
function closePanels(){state.overlay=null;$('overlay').hidden=true;$('cartDrawer').classList.remove('open');$('cartDrawer').setAttribute('aria-hidden','true');$('productModal').classList.remove('open');$('productModal').setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
function closeCatalog(){$('catalogMenu').hidden=true;$('catalogToggle').setAttribute('aria-expanded','false');}
function jumpToProducts(){document.getElementById('products').scrollIntoView({behavior:'smooth',block:'start'});}
function handleAction(action,id){if(!Number.isInteger(id))return;if(action==='add')addToCart(id);else if(action==='fav')toggleFavorite(id);else if(action==='open')modalOpen(id);}
renderCategories();renderProducts();updateCounts();renderCart();$('currentYear').textContent=new Date().getFullYear();$('finishChips').addEventListener('click',e=>{const b=e.target.closest('[data-finish]');if(!b)return;state.finish=b.dataset.finish;state.limit=24;renderProducts();});$('loadMore').addEventListener('click',()=>{state.limit+=24;renderProducts();});
$('catalogToggle').addEventListener('click',()=>{const open=$('catalogMenu').hidden;$('catalogMenu').hidden=!open;$('catalogToggle').setAttribute('aria-expanded',String(open));});
$('searchForm').addEventListener('submit',e=>{e.preventDefault();state.search=$('searchInput').value.trim();state.limit=24;state.favoritesOnly=false;renderProducts();closeCatalog();jumpToProducts();});
$('searchInput').addEventListener('input',()=>{state.search=$('searchInput').value.trim();state.limit=24;state.favoritesOnly=false;renderProducts();});
$('sortProducts').addEventListener('change',e=>{state.sort=e.target.value;renderProducts();});
$('favoritesToggle').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;state.category='Все товары';state.finish='Все цвета';state.limit=24;state.search='';$('searchInput').value='';renderProducts();jumpToProducts();});
$('cartToggle').addEventListener('click',cartOpen);$('closeCart').addEventListener('click',closePanels);$('closeProduct').addEventListener('click',closePanels);$('overlay').addEventListener('click',closePanels);
$('resetFilters').addEventListener('click',()=>{state.category='Все товары';state.finish='Все цвета';state.limit=24;state.favoritesOnly=false;state.search='';$('searchInput').value='';$('sortProducts').value='default';state.sort='default';renderProducts();});
document.addEventListener('click',e=>{const action=e.target.closest('[data-action]');if(action){handleAction(action.dataset.action,Number(action.dataset.id));return;}const category=e.target.closest('[data-category], [data-jump-category]');if(category){changeCategory(category.dataset.category||category.dataset.jumpCategory);return;}const q=e.target.closest('[data-qty]');if(q){const id=Number(q.dataset.id);if(q.dataset.qty==='remove'){delete state.cart[id];persistCart();renderProducts();}else qty(id,Number(q.dataset.qty));return;}if(!$('catalogMenu').hidden&&!e.target.closest('#catalogMenu,#catalogToggle'))closeCatalog();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePanels();closeCatalog();}});
