/* Aibot — chat assistant of Aidarkhan Ramazanov (777xsz) on 777xsz.shop. Answers 24/7 through aibot-777xsz.pages.dev.
   No account, no tracking: the conversation lives only in this browser tab (sessionStorage); orders go to WhatsApp. */
(function () {
  if (window.__aibot) return; window.__aibot = true;
  var API = 'https://aibot-777xsz.pages.dev/api/chat';
  var WA = 'https://wa.me/77760001966';
  var lang = (document.documentElement.lang || 'ru').slice(0, 2);
  var T = {
    ru: { open: 'Спросить Айбота', title: 'Айбот', sub: 'AI-ассистент Айдархана · отвечает 24/7', hello: 'Здравствуйте! Я Айбот, AI-ассистент Айдархана Рамазанова. Спросите про AI-ботов, автоматизацию, сайты или контент — отвечу сразу.',
          ph: 'Ваш вопрос…', send: 'Отправить', wa: 'Написать Айдархану в WhatsApp', typing: 'Айбот печатает…', err: 'Не получилось ответить. Напишите Айдархану в WhatsApp.',
          close: 'Закрыть чат', note: 'Айбот — AI-ассистент, может ошибаться. Цены и сроки Айдархан обсуждает лично.', waText: 'Здравствуйте, Айдархан! Пишу с сайта 777xsz.shop.',
          quick: ['Что вы делаете?', 'Нужен AI-бот для Instagram', 'Сколько стоит?'] },
    kk: { open: 'Айботтан сұрау', title: 'Айбот', sub: 'Айдарханның AI-ассистенті · 24/7', hello: 'Сәлеметсіз бе! Мен Айботпын, Айдархан Рамазановтың AI-ассистентімін. AI-боттар, автоматтандыру, сайттар туралы сұраңыз.',
          ph: 'Сұрағыңыз…', send: 'Жіберу', wa: 'Айдарханға WhatsApp арқылы жазу', typing: 'Айбот жазып жатыр…', err: 'Жауап бере алмадым. Айдарханға WhatsApp арқылы жазыңыз.',
          close: 'Чатты жабу', note: 'Айбот — AI-ассистент, қателесуі мүмкін. Бағасын Айдархан жеке талқылайды.', waText: 'Сәлеметсіз бе, Айдархан! 777xsz.shop сайтынан жазып отырмын.',
          quick: ['Не істейсіздер?', 'Instagram-ға AI-бот керек', 'Бағасы қанша?'] },
    en: { open: 'Ask Aibot', title: 'Aibot', sub: "Aidarkhan's AI assistant · 24/7", hello: "Hi! I'm Aibot, Aidarkhan Ramazanov's AI assistant. Ask about AI bots, automation, websites or content — I reply instantly.",
          ph: 'Your question…', send: 'Send', wa: 'Message Aidarkhan on WhatsApp', typing: 'Aibot is typing…', err: 'Could not answer. Please message Aidarkhan on WhatsApp.',
          close: 'Close chat', note: 'Aibot is an AI assistant and can make mistakes. Aidarkhan discusses prices personally.', waText: 'Hello Aidarkhan! I am writing from 777xsz.shop.',
          quick: ['What do you do?', 'I need an Instagram AI bot', 'How much does it cost?'] }
  }[lang === 'kk' || lang === 'en' ? lang : 'ru'];

  var css = '#aibot-btn{position:fixed;right:18px;bottom:18px;z-index:60;display:flex;align-items:center;gap:10px;padding:10px 16px 10px 10px;border-radius:999px;border:1px solid rgba(198,164,91,.55);background:#123F35;color:#F5F3EC;font:600 15px/1 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.35)}' +
    '#aibot-btn:hover{background:#174d41}#aibot-btn img{width:34px;height:34px;border-radius:50%;object-fit:cover;border:1px solid #C6A45B}#aibot-btn .dot{width:9px;height:9px;border-radius:50%;background:#28A879;box-shadow:0 0 0 3px rgba(40,168,121,.25)}' +
    '#aibot{position:fixed;right:18px;bottom:18px;z-index:61;width:min(380px,calc(100vw - 24px));height:min(600px,calc(100vh - 36px));display:none;flex-direction:column;background:#10201d;color:#F5F3EC;border:1px solid rgba(223,227,213,.14);border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.5);font:15px/1.5 Inter,system-ui,sans-serif;overflow:hidden}' +
    '#aibot.open{display:flex}#aibot header{display:flex;align-items:center;gap:10px;padding:14px 14px 12px;border-bottom:1px solid rgba(223,227,213,.14);background:#123F35}#aibot header img{width:38px;height:38px;border-radius:50%;object-fit:cover;border:1px solid #C6A45B}' +
    '#aibot header b{display:block;font-size:16px}#aibot header small{display:block;color:#a7b6ac;font-size:12px}#aibot header button{margin-left:auto;background:none;border:0;color:#F5F3EC;font-size:22px;line-height:1;cursor:pointer;padding:6px 8px;border-radius:8px}#aibot header button:hover{background:rgba(255,255,255,.08)}' +
    '#aibot .log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}#aibot .m{max-width:86%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere}#aibot .bot{background:#162622;border:1px solid rgba(223,227,213,.1);align-self:flex-start;border-bottom-left-radius:4px}' +
    '#aibot .me{background:#28A879;color:#06110e;align-self:flex-end;border-bottom-right-radius:4px}#aibot .typing{color:#a7b6ac;font-style:italic}#aibot .quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 8px}#aibot .quick button{background:none;border:1px solid rgba(198,164,91,.5);color:#F5F3EC;border-radius:999px;padding:6px 10px;font:13px Inter,system-ui,sans-serif;cursor:pointer}' +
    '#aibot .wa{display:block;margin:0 14px 8px;text-align:center;padding:9px;border-radius:10px;background:#1f8f5f;color:#fff;text-decoration:none;font-weight:600;font-size:14px}#aibot .wa:hover{background:#25a56e}' +
    '#aibot form{display:flex;gap:8px;padding:10px 14px 6px;border-top:1px solid rgba(223,227,213,.14)}#aibot textarea{flex:1;resize:none;height:42px;max-height:110px;padding:10px 12px;border-radius:10px;border:1px solid rgba(223,227,213,.2);background:#0E1A18;color:#F5F3EC;font:15px/1.4 Inter,system-ui,sans-serif}' +
    '#aibot textarea:focus,#aibot button:focus-visible,#aibot-btn:focus-visible{outline:2px solid #C6A45B;outline-offset:2px}#aibot form button{border:0;border-radius:10px;padding:0 14px;background:#C6A45B;color:#0E1A18;font-weight:700;cursor:pointer}#aibot form button:disabled{opacity:.5;cursor:wait}' +
    '#aibot .note{padding:0 14px 10px;color:#a7b6ac;font-size:11px;line-height:1.35}' +
    '@media (max-width:520px){#aibot{right:0;bottom:0;width:100vw;height:min(100dvh,100vh);border-radius:0}#aibot-btn{right:12px;bottom:12px}#aibot-btn span.t{display:none}#aibot-btn{padding:8px}}';
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var avatar = '/images/aidarkhan-ramazanov.webp';
  var btn = document.createElement('button');
  btn.id = 'aibot-btn'; btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-label', T.open);
  btn.innerHTML = '<img src="' + avatar + '" alt=""><span class="t"></span><span class="dot" aria-hidden="true"></span>';
  btn.querySelector('.t').textContent = T.open;

  var box = document.createElement('section');
  box.id = 'aibot'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'false'); box.setAttribute('aria-label', T.title);
  box.innerHTML = '<header><img src="' + avatar + '" alt=""><div><b></b><small></small></div><button type="button" class="x">×</button></header>' +
    '<div class="log" aria-live="polite"></div><div class="quick"></div><a class="wa" target="_blank" rel="noopener"></a>' +
    '<form><textarea rows="1" maxlength="1000" required></textarea><button type="submit"></button></form><div class="note"></div>';
  box.querySelector('header b').textContent = T.title; box.querySelector('header small').textContent = T.sub;
  box.querySelector('.x').setAttribute('aria-label', T.close);
  var log = box.querySelector('.log'), quick = box.querySelector('.quick'), form = box.querySelector('form'), input = box.querySelector('textarea'), send = form.querySelector('button'), wa = box.querySelector('.wa');
  input.placeholder = T.ph; input.setAttribute('aria-label', T.ph); send.textContent = T.send; box.querySelector('.note').textContent = T.note; wa.textContent = T.wa;

  var KEY = 'aibot:' + lang, history = [];
  try { history = JSON.parse(sessionStorage.getItem(KEY) || '[]') || []; } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-24))); } catch (e) {} }
  function waLink() {
    var lastQ = ''; for (var i = history.length - 1; i >= 0; i--) if (history[i].role === 'user') { lastQ = history[i].text; break; }
    wa.href = WA + '?text=' + encodeURIComponent(T.waText + (lastQ ? '\n' + lastQ.slice(0, 300) : ''));
  }
  function bubble(role, text, cls) {
    var d = document.createElement('div'); d.className = 'm ' + (role === 'user' ? 'me' : 'bot') + (cls ? ' ' + cls : ''); d.textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function render() {
    log.innerHTML = ''; bubble('assistant', T.hello);
    history.forEach(function (m) { bubble(m.role, m.text); });
    quick.innerHTML = '';
    if (!history.length) T.quick.forEach(function (q) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.onclick = function () { ask(q); }; quick.appendChild(b);
    });
    waLink();
  }
  var busy = false;
  function ask(text) {
    text = (text || '').trim(); if (!text || busy) return;
    busy = true; send.disabled = true; quick.innerHTML = '';
    history.push({ role: 'user', text: text.slice(0, 1000) }); save(); bubble('user', text); input.value = ''; waLink();
    var typing = bubble('assistant', T.typing, 'typing');
    var ctrl = window.AbortController ? new AbortController() : null, timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 60000);
    fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lang: lang, messages: history.slice(-12) }), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (d) { typing.remove(); var reply = d && d.reply ? d.reply : T.err; history.push({ role: 'assistant', text: reply }); save(); bubble('assistant', reply); })
      .catch(function () { typing.remove(); bubble('assistant', T.err); })
      .then(function () { clearTimeout(timer); busy = false; send.disabled = false; input.focus(); });
  }
  function open() { box.classList.add('open'); btn.style.display = 'none'; render(); setTimeout(function () { input.focus(); }, 30); }
  function close() { box.classList.remove('open'); btn.style.display = ''; btn.focus(); }
  btn.onclick = open; box.querySelector('.x').onclick = close;
  box.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input.value); } });
  document.body.appendChild(btn); document.body.appendChild(box);
})();
