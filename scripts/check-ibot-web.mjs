import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('index.html'), js = read('assets/ibot-app.js'), css = read('assets/ibot-app.css');
const commercial=html.includes('commercial-v8');
if(commercial){for(const route of ['ai-bot/index.html','ar-app/index.html']){const old=read(route);assert.match(old,/http-equiv="refresh" content="0;url=\/#implementation"/);assert.ok(!old.includes('id="messageInput"'));}assert.ok(!html.includes('assets/ibot-app.js'));assert.ok(!html.includes('id="messageInput"'));}else{
assert.match(html, /<html lang="ru">/);
assert.match(html, /<title>iBot/);
assert.equal((html.match(/<h1\b/g)||[]).length, 1, 'one h1');
assert.ok(html.includes('assets/ibot-app.css'), 'CSS referenced');
assert.ok(html.includes('assets/ibot-app.js'), 'JS referenced');
for (const id of ['sidebar', 'openSidebar', 'newChat', 'messageInput', 'composer', 'sendButton', 'messages', 'chatHistory', 'connection', 'gatewayNotice', 'retryConnection', 'statusDialog']) {
  assert.ok(html.includes('id="' + id + '"'), 'missing element: ' + id);
}
}
assert.match(js, /\/api\/health/);
assert.match(js, /\/api\/chat/);
assert.match(js, /X-CSRF-Token/);
assert.match(js, /credentials: 'same-origin'/);
assert.match(js, /state\.authenticated/);
assert.match(js, /service !== 'ibot'/);
assert.match(js, /replaceChildren/);
assert.ok(!/innerHTML\s*=/.test(js), 'never insert assistant content as HTML');
assert.ok(!/localStorage|sessionStorage/.test(js.replace(/\/\*[\s\S]*?\*\//g,'')), 'no browser message persistence');
if(!commercial){
assert.ok(!/gtag|metrika|webvisor|yandex|aibot-777xsz\.pages\.dev/i.test(html), 'no legacy analytics, widget or API');
assert.ok(!/<script[^>]+src="https?:\/\//.test(html), 'no third-party scripts');
assert.ok(!/<script(?:\s|>)/.test(html.replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/g,'')), 'no inline scripts');
}
assert.match(css, /Public iBot dark visual identity/, 'desktop-inspired dark theme');
if(!commercial){
for (const forbidden of [
  'CRM', 'Медиастудия', 'Мастерская', 'Активные процессы', 'Состояние системы',
  'CPU', 'RAM', 'Хранилище', 'В работе', 'Последние результаты',
  '127.0.0.1', '8766', 'PIXEL', 'tunnel_pull', 'tunnel_push'
]) {
  assert.ok(!html.includes(forbidden), 'internal-only label found in public UI: ' + forbidden);
}
assert.match(html, /Недавние беседы/, 'chat history visible');
assert.match(html, /Чат с iBot/, 'public chat is central');
for (const hidden of ['Автопубликация', 'Автопостинг', 'Создать видео', 'Сделай ролик', 'Развить бизнес', 'Написать код', 'CRM', 'Мастерская', 'Задачи', 'Модули', 'Аналитика', 'Прикрепить файл', 'Голосовое общение']) {
  assert.ok(!html.includes(hidden), 'owner-only or inactive feature surfaced: ' + hidden);
}
assert.ok(!html.includes('id="attachButton"') && !html.includes('id="voiceButton"'), 'no inactive upload or voice tools');
assert.ok(!js.includes('els.attach.addEventListener') && !js.includes('els.voice.addEventListener'), 'no listeners for removed controls');
assert.match(html, /Объяснить тему/);
assert.match(html, /Перевести текст/);
}
assert.match(css, /@media\(max-width:760px\)/, 'mobile layout');
assert.match(css, /prefers-reduced-motion/, 'reduced motion');
console.log('iBot web static smoke checks passed. These checks do NOT prove browser behavior or live connectivity.');