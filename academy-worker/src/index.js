// 777XSZ Academy: Cloudflare Worker + D1 + private R2.
// Prototype. Keep course HTML off GitHub Pages before claiming private access.
const enc = new TextEncoder();
const html = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const random = n => { const b=crypto.getRandomValues(new Uint8Array(n)); return [...b].map(x=>x.toString(16).padStart(2,'0')).join(''); };
async function sha(s) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join(''); }
async function derive(password,salt) {
  const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:310000,hash:'SHA-256'},key,256);
  return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function safeEqual(a,b){ if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0; }
const headers={'content-type':'text/html; charset=utf-8','cache-control':'no-store, private','x-content-type-options':'nosniff','referrer-policy':'same-origin','x-frame-options':'DENY','content-security-policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
const response=(body,status=200,extra={})=>new Response(body,{status,headers:{...headers,...extra}});
const redirect=(path,cookie)=>new Response(null,{status:303,headers:{location:path,'cache-control':'no-store',...(cookie?{'set-cookie':cookie}:{})}});
const cookie=(value,maxAge)=>'academy_session='+value+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+maxAge;
function page(title,body){return response('<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+html(title)+' · 777XSZ Academy</title><style>body{font:16px/1.6 system-ui;background:#092d27;color:#f8efdd;margin:0}main{max-width:780px;margin:6vh auto;padding:24px;background:#153e34;border:1px solid #ac945c;border-radius:16px}h1,a{color:#e4c586}input,button{display:block;width:100%;box-sizing:border-box;margin:8px 0 16px;padding:12px;border-radius:8px}button{background:#c6a66d;cursor:pointer}nav a{margin-right:18px}</style></head><body><main><nav><a href="/">Академия</a><a href="/logout">Выйти</a></nav>'+body+'</main></body></html>');}
function form(action,label,csrf){return '<form action="'+action+'" method="post"><input type="hidden" name="csrf" value="'+html(csrf)+'"><label>Email<input type="email" name="email" maxlength="254" required autocomplete="email"></label><label>Пароль<input type="password" name="password" minlength="12" required autocomplete="'+(action==='/register'?'new-password':'current-password')+'"></label><button>'+label+'</button></form>';}
async function current(request,env) {
  const value=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('academy_session='));
  if(!value)return null;
  const token=value.split('=')[1];if(!/^[a-f0-9]{64}$/.test(token))return null;
  return env.DB.prepare('SELECT u.id,u.email,u.role,u.approved FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(await sha(token),Date.now()).first();
}
async function csrfFor(request,env) {
  // Stateless double-submit token tied to a host-only cookie; HMAC avoids trusting arbitrary cookie values.
  let seed=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('academy_csrf='))?.split('=')[1];
  if(!seed||!/^[a-f0-9]{48}$/.test(seed))seed=random(24);
  const key=await crypto.subtle.importKey('raw',enc.encode(env.CSRF_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signature=await crypto.subtle.sign('HMAC',key,enc.encode(seed));
  const mac=[...new Uint8Array(signature)].map(x=>x.toString(16).padStart(2,'0')).join('');
  return {seed,token:seed+'.'+mac};
}
async function validCsrf(request,env,formData) {
  const supplied=String(formData.get('csrf')||'');
  const seed=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('academy_csrf='))?.split('=')[1]||'';
  if(!/^[a-f0-9]{48}$/.test(seed))return false;
  const expected=(await csrfFor(request,env)).token;
  return safeEqual(supplied,expected);
}
function csrfCookie(seed){return 'academy_csrf='+seed+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=7200';}
function withCsrf(res,seed){const h=new Headers(res.headers);h.append('set-cookie',csrfCookie(seed));return new Response(res.body,{status:res.status,headers:h});}
export default {async fetch(request,env){
  if(!env.DB||!env.COURSES||!env.CSRF_SECRET||!env.RATE_SECRET)return response('Configuration missing',503);
  const url=new URL(request.url),path=url.pathname;
  const user=await current(request,env);
  if(request.method==='GET'&&path==='/logout')return redirect('/'); // logout requires POST
  if(request.method==='POST'){
    const data=await request.formData();
    if(!(await validCsrf(request,env,data)))return response('Invalid form token',403);
    if(path==='/logout'){
      const token=(request.headers.get('cookie')||'').match(/(?:^|;\s*)academy_session=([a-f0-9]{64})/)?.[1];
      if(token)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha(token)).run();
      return redirect('/',cookie('',0));
    }
    if(path==='/register'){
      const email=String(data.get('email')||'').trim().toLowerCase(),password=String(data.get('password')||'');
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>254||password.length<12||password.length>1024)return response('Invalid registration data',400);
      const salt=random(24),hash=await derive(password,salt);
      await env.DB.prepare("INSERT OR IGNORE INTO users(id,email,password_hash,salt,role,approved) VALUES(?,?,?,?,'student',0)").bind(crypto.randomUUID(),email,hash,salt).run();
      return page('Заявка','<h1>Заявка принята</h1><p>Если адрес ещё не зарегистрирован, аккаунт ожидает личного одобрения владельца.</p>');
    }
    if(path==='/login'){
      const email=String(data.get('email')||'').trim().toLowerCase(),password=String(data.get('password')||'');
      const ip=request.headers.get('cf-connecting-ip')||'unknown',key=await sha(ip+'|'+env.RATE_SECRET);
      await env.DB.prepare('DELETE FROM login_attempts WHERE created_at<?').bind(Date.now()-900000).run();
      const count=await env.DB.prepare('SELECT COUNT(*) n FROM login_attempts WHERE key=? AND created_at>?').bind(key,Date.now()-900000).first();
      if(count.n>=8)return response('Слишком много попыток входа',429);
      await env.DB.prepare('INSERT INTO login_attempts(key,created_at) VALUES(?,?)').bind(key,Date.now()).run();
      const found=await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
      const candidate=await derive(password.slice(0,1024),found?.salt||'invalid-salt');
      if(!found||!safeEqual(candidate,found.password_hash))return response('Неверный email или пароль',401);
      const token=random(32);
      await env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(await sha(token),found.id,Date.now()+7*86400000).run();
      return redirect('/',cookie(token,7*86400));
    }
    if(!user||user.role!=='admin')return response('Forbidden',403);
    if(path==='/admin/approve'||path==='/admin/revoke'){
      const id=String(data.get('id')||'');
      await env.DB.prepare("UPDATE users SET approved=? WHERE id=? AND role='student'").bind(path.endsWith('approve')?1:0,id).run();
      return redirect('/admin');
    }
    return response('Not found',404);
  }
  const csrf=await csrfFor(request,env);
  if(!user){
    if(path==='/register')return withCsrf(page('Регистрация','<h1>Подать заявку</h1><p>Доступ выдаётся владельцем лично.</p>'+form('/register','Зарегистрироваться',csrf.token)),csrf.seed);
    return withCsrf(page('Вход','<h1>Вход в 777XSZ Academy</h1>'+form('/login','Войти',csrf.token)+'<p><a href="/register">Подать заявку</a></p>'),csrf.seed);
  }
  if(!user.approved)return response('<h1>Ожидается подтверждение администратора</h1>',403);
  if(path==='/admin'&&user.role==='admin'){
    const rows=await env.DB.prepare("SELECT id,email,approved FROM users WHERE role='student' ORDER BY approved,id DESC LIMIT 200").all();
    const body=rows.results.map(u=>'<p>'+html(u.email)+' · '+(u.approved?'Одобрен':'Ожидает')+'</p><form method="post" action="/admin/'+(u.approved?'revoke':'approve')+'"><input type="hidden" name="csrf" value="'+html(csrf.token)+'"><input type="hidden" name="id" value="'+html(u.id)+'"><button>'+(u.approved?'Отозвать':'Одобрить')+'</button></form>').join('');
    return withCsrf(page('Ученики','<h1>Одобрение учеников</h1>'+body),csrf.seed);
  }
  if(path.startsWith('/read/')){
    const slug=path.slice(6);
    if(!/^[a-z0-9-]{2,80}$/.test(slug))return response('Not found',404);
    const object=await env.COURSES.get('courses/'+slug+'/index.html');
    if(!object)return response('Not found',404);
    return response(object.body,200,{'content-type':'text/html; charset=utf-8'});
  }
  if(path==='/'){
    const items=(await env.COURSES.list({prefix:'courses/',limit:100})).objects.filter(o=>/^courses\/[a-z0-9-]+\/index\.html$/.test(o.key));
    const links=items.map(o=>{const slug=o.key.split('/')[1];return '<li><a href="/read/'+slug+'">'+html(slug.replace(/-/g,' '))+'</a></li>';}).join('');
    return page('Курсы','<h1>777XSZ Academy</h1><p>'+html(user.email)+'</p>'+(user.role==='admin'?'<a href="/admin">Управление учениками</a>':'')+'<ul>'+links+'</ul><form action="/logout" method="post"><input type="hidden" name="csrf" value="'+html(csrf.token)+'"><button>Выйти</button></form>');
  }
  return response('Not found',404);
}};