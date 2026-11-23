/* iBot web shell, v1.
   Conversations exist only in page memory until a secure authenticated backend exists.
   Never send requests to a third-party endpoint from the browser. Never fabricate replies. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const els = {
    sidebar: $('sidebar'), overlay: $('sidebarOverlay'), openSidebar: $('openSidebar'),
    closeSidebar: $('closeSidebar'), newChat: $('newChat'), navChats: $('navChats'),
    history: $('chatHistory'), historyCount: $('historyCount'), welcome: $('welcome'),
    messages: $('messages'), wrap: $('conversationWrap'), announcer: $('announcer'),
    form: $('composer'), input: $('messageInput'), send: $('sendButton'),
    notice: $('gatewayNotice'), noticeText: $('gatewayNoticeText'), retry: $('retryConnection'),
    connection: $('connection'), connectionLabel: $('connectionLabel'),
    accountButton: $('accountButton'), accountStatus: $('accountStatus'),
    help: $('helpButton'),
    dialog: $('statusDialog'), dialogCopy: $('dialogCopy')
  };
  const state = {
    connected: false, authenticated: false, csrf: '', capabilities: new Set(),
    checking: false, sending: false, chats: [], selected: null, request: null
  };

  const uuid = () => (window.crypto && window.crypto.randomUUID)
    ? window.crypto.randomUUID()
    : ('ibot-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
  const notify = text => { els.announcer.textContent = text; };
  const rememberScroll = () => { els.wrap.scrollTop = els.wrap.scrollHeight; };
  function closeMenu() {
    els.sidebar.classList.remove('open');
    els.overlay.classList.remove('open');
    els.openSidebar.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    els.sidebar.classList.add('open');
    els.overlay.classList.add('open');
    els.openSidebar.setAttribute('aria-expanded', 'true');
    els.newChat.focus();
  }
  function showStatus(message) {
    if (message) els.dialogCopy.textContent = message;
    if (typeof els.dialog.showModal === 'function') els.dialog.showModal();
    else notify(message || els.dialogCopy.textContent);
  }
  function showNotice(message) {
    els.noticeText.textContent = message;
    els.notice.hidden = false;
    notify(message);
  }
  function setConnected(label, kind, account) {
    els.connection.className = 'connection ' + kind;
    els.connectionLabel.textContent = label;
    els.accountStatus.textContent = account;
  }
  async function health() {
    if (state.checking) return;
    state.checking = true;
    state.connected = false;
    state.authenticated = false;
    state.csrf = '';
    state.capabilities = new Set();
    setConnected('Проверка соединения', '', 'Подключение...');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6500);
    try {
      const res = await fetch('/api/health', {
        method: 'GET', headers: { Accept: 'application/json' },
        credentials: 'same-origin', cache: 'no-store', redirect: 'error',
        signal: ctrl.signal
      });
      if (!res.ok || !(res.headers.get('content-type') || '').includes('application/json')) {
        throw new Error('Сервер API не отвечает корректно');
      }
      const data = await res.json();
      if (!data || data.service !== 'ibot' || data.ready !== true) {
        throw new Error('iBot не готов');
      }
      state.connected = true;
      state.authenticated = data.authenticated === true;
      state.csrf = typeof data.csrfToken === 'string' ? data.csrfToken : '';
      state.capabilities = new Set(Array.isArray(data.capabilities) ? data.capabilities.filter(v => typeof v === 'string') : []);
      if (state.authenticated && state.csrf && state.capabilities.has('chat')) {
        setConnected('iBot подключён', 'online', 'Авторизован');
        els.notice.hidden = true;
      } else {
        state.authenticated = false;
        setConnected('Недоступен', 'offline', 'Требуется вход');
        showNotice('Для переписки необходим вход в iBot. Пока сообщения не отправляются.');
      }
    } catch (error) {
      state.connected = false;
      setConnected('Недоступен', 'offline', 'Нет соединения');
      showNotice('iBot сейчас недоступен. Сообщения не отправляются.');
    } finally {
      clearTimeout(timer);
      state.checking = false;
    }
  }
  const currentChat = () => state.chats.find(c => c.id === state.selected);
  function newChat(prefill = '') {
    if (state.sending) return;
    state.selected = null;
    els.input.value = prefill;
    resizeComposer();
    render();
    closeMenu();
    els.input.focus();
  }
  function selectChat(id) {
    if (state.sending) return;
    if (!state.chats.some(c => c.id === id)) return;
    state.selected = id;
    render();
    closeMenu();
  }
  function clearChat(id) {
    if (state.sending) return;
    state.chats = state.chats.filter(c => c.id !== id);
    if (state.selected === id) state.selected = null;
    render();
  }
  function renderHistory() {
    els.history.replaceChildren();
    els.historyCount.textContent = String(state.chats.length);
    if (!state.chats.length) {
      const empty = document.createElement('div');
      empty.className = 'history-empty';
      empty.textContent = 'История появится здесь после первого сообщения. Пока беседы не сохраняются на сервере.';
      els.history.append(empty);
      return;
    }
    state.chats.slice().reverse().forEach(chat => {
      const item = document.createElement('div');
      item.className = 'history-item' + (chat.id === state.selected ? ' active' : '');
      const button = document.createElement('button');
      button.className = 'history-open';
      button.type = 'button';
      button.title = chat.title;
      button.textContent = chat.title;
      button.addEventListener('click', () => selectChat(chat.id));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'history-delete';
      remove.title = 'Закрыть беседу';
      remove.setAttribute('aria-label', 'Закрыть беседу: ' + chat.title);
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('viewBox', '0 0 24 24');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M4 7h16M10 4h4M7 7l1 13h8l1-13');
      icon.append(path);
      remove.append(icon);
      remove.addEventListener('click', () => clearChat(chat.id));
      item.append(button, remove);
      els.history.append(item);
    });
  }
  function addMessage(message) {
    const row = document.createElement('div');
    row.className = 'message ' + message.role + (message.pending ? ' pending' : '');
    if (message.role === 'assistant') {
      const avatar = document.createElement('div');
      avatar.className = 'bubble-avatar';
      avatar.setAttribute('aria-label', 'iBot');
      avatar.textContent = 'i';
      row.append(avatar);
    }
    const body = document.createElement('div');
    body.className = 'message-body';
    body.textContent = message.pending ? 'Думаю' : message.text;
    if (message.pending) {
      const dots = document.createElement('span');
      dots.className = 'dots';
      dots.setAttribute('aria-hidden', 'true');
      body.append(dots);
    }
    row.append(body);
    return row;
  }
  function renderMessages() {
    const chat = currentChat();
    if (!chat) {
      els.messages.hidden = true;
      els.welcome.hidden = false;
      els.messages.replaceChildren();
      return;
    }
    els.welcome.hidden = true;
    els.messages.hidden = false;
    const nodes = chat.messages.map(addMessage);
    els.messages.replaceChildren(...nodes);
    rememberScroll();
  }
  function render() {
    renderHistory();
    renderMessages();
    els.send.disabled = state.sending || !els.input.value.trim();
  }
  function resizeComposer() {
    els.input.style.height = 'auto';
    els.input.style.height = Math.min(els.input.scrollHeight, 200) + 'px';
    els.send.disabled = state.sending || !els.input.value.trim();
  }
  async function sendMessage() {
    const text = els.input.value.trim();
    if (!text || state.sending) return;
    if (!state.connected || !state.authenticated || !state.csrf || !state.capabilities.has('chat')) {
      showNotice('Сейчас отправка сообщений недоступна. Ваш текст останется в поле ввода.');
      return;
    }
    let chat = currentChat();
    if (!chat) {
      chat = { id: uuid(), title: text.slice(0, 48), messages: [] };
      state.chats.push(chat);
      state.selected = chat.id;
    }
    chat.messages.push({ role: 'user', text });
    const placeholder = { role: 'assistant', pending: true, text: '' };
    chat.messages.push(placeholder);
    els.input.value = '';
    state.sending = true;
    resizeComposer();
    render();

    const ctrl = new AbortController();
    state.request = ctrl;
    const timer = setTimeout(() => ctrl.abort(), 90000);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-Token': state.csrf },
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        signal: ctrl.signal,
        body: JSON.stringify({
          conversation_id: chat.id,
          message: text,
          messages: chat.messages.filter(m => !m.pending).slice(-16).map(m => ({ role: m.role, text: m.text }))
        })
      });
      if (res.status === 401 || res.status === 403) {
        state.authenticated = false;
        state.csrf = '';
        setConnected('Недоступен', 'offline', 'Сессия завершена');
        throw new Error('Сессия завершилась. Для продолжения потребуется повторный вход.');
      }
      if (!res.ok || !(res.headers.get('content-type') || '').includes('application/json')) {
        throw new Error('Сервер вернул ошибку. Сообщение не было успешно обработано.');
      }
      const data = await res.json();
      if (!data || typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('Сервер не вернул текст ответа.');
      }
      placeholder.pending = false;
      placeholder.text = data.reply.slice(0, 100000);
      notify('Ответ iBot получен');
    } catch (e) {
      const errorMessage = e.name === 'AbortError' ? 'Превышено время ожидания ответа iBot.' : (e.message || 'Не удалось связаться с iBot.');
      placeholder.pending = false;
      placeholder.text = 'Не удалось получить ответ. ' + errorMessage;
      showNotice(errorMessage);
    } finally {
      clearTimeout(timer);
      state.request = null;
      state.sending = false;
      render();
      els.input.focus();
    }
  }

  els.openSidebar.setAttribute('aria-expanded', 'false');
  els.openSidebar.addEventListener('click', openMenu);
  els.closeSidebar.addEventListener('click', closeMenu);
  els.overlay.addEventListener('click', closeMenu);
  els.newChat.addEventListener('click', () => newChat());
  els.navChats.addEventListener('click', () => newChat());
  els.help.addEventListener('click', () => showStatus());
  els.accountButton.addEventListener('click', () => showStatus());
  els.retry.addEventListener('click', health);
  document.querySelectorAll('[data-suggest]').forEach(btn => {
    btn.addEventListener('click', () => {
      els.input.value = btn.getAttribute('data-suggest') || '';
      resizeComposer();
      closeMenu();
      els.input.focus();
    });
  });
  els.input.addEventListener('input', resizeComposer);
  els.input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  });
  els.form.addEventListener('submit', e => { e.preventDefault(); sendMessage(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      newChat();
    }
  });
  // Public GitHub Pages is a static host. This check intentionally fails closed
  // until the domain is routed through an authenticated API gateway.
  render();
  resizeComposer();
  health();
})();