<?php
declare(strict_types=1);
/**
 * 777XSZ Academy protected reader. Deploy on a PHP 8.1+ host, NOT GitHub Pages.
 * Required environment: ACADEMY_DATA_DIR (absolute private path outside webroot).
 * Initialise first admin via CLI: php index.php create-admin email@example.com
 */
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store, private');
header('Content-Security-Policy: default-src \'self\'; style-src \'self\' \'unsafe-inline\'; form-action \'self\'; base-uri \'none\'; frame-ancestors \'none\'');
if (PHP_SAPI !== 'cli' && (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') && ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') !== 'https') {
    http_response_code(400); exit('HTTPS required');
}
$dataDir = getenv('ACADEMY_DATA_DIR') ?: '';
if ($dataDir === '' || !is_dir($dataDir) || !is_writable($dataDir)) { http_response_code(503); exit('Private storage is not configured'); }
$db = new PDO('sqlite:' . $dataDir . '/academy.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$db->exec('PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON');
$db->exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT \'student\', approved INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
$db->exec('CREATE TABLE IF NOT EXISTS attempts (ip_hash TEXT NOT NULL, at INTEGER NOT NULL)');
$db->exec('CREATE INDEX IF NOT EXISTS attempts_idx ON attempts(ip_hash,at)');
function clean(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function page(string $title, string $body): never {
    echo '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'.clean($title).' | 777XSZ Academy</title><style>body{margin:0;background:#092d27;color:#f6eedb;font:16px/1.6 system-ui}main{max-width:760px;margin:5vh auto;padding:32px;background:#123d33;border:1px solid #a88d59;border-radius:16px}h1{color:#e1c38b}input,button{display:block;box-sizing:border-box;width:100%;padding:12px;margin:8px 0 16px;border-radius:8px;border:1px solid #bba878}button{background:#c8aa6c;color:#17291f;font-weight:bold;cursor:pointer}a{color:#e1c38b}nav a{margin-right:20px}.error{color:#ffc3b6}</style></head><body><main><nav><a href="?">777XSZ Academy</a><a href="?action=logout">Выйти</a></nav>'.$body.'</main></body></html>'; exit;
}
if (PHP_SAPI === 'cli') {
    if (($argv[1] ?? '') !== 'create-admin' || !filter_var($argv[2] ?? '', FILTER_VALIDATE_EMAIL)) { fwrite(STDERR, "Usage: php index.php create-admin email@example.com\n"); exit(2); }
    $email = strtolower(trim($argv[2]));
    fwrite(STDOUT, "Admin password: "); $pass = trim((string)fgets(STDIN));
    if (strlen($pass) < 14) { fwrite(STDERR, "Use at least 14 characters\n"); exit(2); }
    $q=$db->prepare("INSERT INTO users(email,password_hash,role,approved) VALUES(?,?,'admin',1)");
    $q->execute([$email,password_hash($pass,PASSWORD_DEFAULT)]);
    fwrite(STDOUT,"Admin created\n"); exit;
}
session_name('xsz_academy');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>true,'httponly'=>true,'samesite'=>'Lax']);
ini_set('session.use_strict_mode','1');
session_start();
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
function token(): string { return '<input type="hidden" name="csrf" value="'.clean($_SESSION['csrf']).'">'; }
function verify(): void { if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) { http_response_code(403); exit('Invalid request'); } }
function current(PDO $db): ?array {
    if (empty($_SESSION['uid'])) return null;
    $q=$db->prepare('SELECT id,email,role,approved FROM users WHERE id=?'); $q->execute([$_SESSION['uid']]); return $q->fetch(PDO::FETCH_ASSOC) ?: null;
}
function form(string $action,string $label,bool $email=true): string {
    return '<form method="post" action="?action='.clean($action).'">'.token().($email?'<label>Email<input type="email" name="email" maxlength="254" autocomplete="email" required></label>':'').'<label>Пароль<input type="password" name="password" minlength="12" autocomplete="'.($action==='register'?'new-password':'current-password').'" required></label><button>'.clean($label).'</button></form>';
}
$action = $_GET['action'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify();
    if ($action === 'register') {
        $email=strtolower(trim((string)($_POST['email']??''))); $pass=(string)($_POST['password']??'');
        if (!filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>254 || strlen($pass)<12 || strlen($pass)>1024) page('Регистрация','<p class="error">Проверьте адрес и пароль (от 12 символов).</p>');
        try { $q=$db->prepare('INSERT INTO users(email,password_hash) VALUES(?,?)'); $q->execute([$email,password_hash($pass,PASSWORD_DEFAULT)]); } catch (PDOException $e) { /* avoid account enumeration */ }
        page('Заявка отправлена','<h1>Запрос получен</h1><p>Если регистрация прошла успешно, аккаунт ожидает личного подтверждения администратора. До подтверждения уроки закрыты.</p><a href="?action=login">Войти</a>');
    }
    if ($action === 'login') {
        $ip=hash('sha256',($_SERVER['REMOTE_ADDR']??'unknown').'|'.(getenv('ACADEMY_RATE_SECRET')?:''));
        $db->prepare('DELETE FROM attempts WHERE at<?')->execute([time()-900]);
        $q=$db->prepare('SELECT COUNT(*) FROM attempts WHERE ip_hash=? AND at>?'); $q->execute([$ip,time()-900]);
        if ((int)$q->fetchColumn() >= 8) { http_response_code(429); page('Ограничение входа','<p>Слишком много попыток. Попробуйте через 15 минут.</p>'); }
        $q=$db->prepare('INSERT INTO attempts(ip_hash,at) VALUES(?,?)'); $q->execute([$ip,time()]);
        $email=strtolower(trim((string)($_POST['email']??'')));
        $q=$db->prepare('SELECT * FROM users WHERE email=?'); $q->execute([$email]); $u=$q->fetch(PDO::FETCH_ASSOC);
        if (!$u || !password_verify((string)($_POST['password']??''),$u['password_hash'])) { http_response_code(401); page('Вход','<p class="error">Неверные данные для входа.</p>'.form('login','Войти')); }
        session_regenerate_id(true); $_SESSION['uid']=$u['id']; header('Location: ?'); exit;
    }
    $u=current($db);
    if (!$u || $u['role']!=='admin') { http_response_code(403); exit('Forbidden'); }
    if ($action === 'approve' || $action === 'revoke') {
        $target=filter_var($_POST['user_id']??null,FILTER_VALIDATE_INT);
        if (!$target || (int)$target===(int)$u['id']) { http_response_code(400); exit('Invalid user'); }
        $q=$db->prepare("UPDATE users SET approved=? WHERE id=? AND role='student'"); $q->execute([$action==='approve'?1:0,$target]);
        header('Location: ?action=admin'); exit;
    }
}
if ($action==='logout') { $_SESSION=[]; session_destroy(); header('Location: ?'); exit; }
$u=current($db);
if (!$u) {
    if ($action==='register') page('Регистрация','<h1>Заявка на обучение</h1><p>Каждый аккаунт проверяется владельцем лично.</p>'.form('register','Отправить заявку').'<a href="?action=login">Уже есть аккаунт?</a>');
    page('Вход','<h1>Вход в академию</h1>'.form('login','Войти').'<a href="?action=register">Подать заявку</a>');
}
if ($action==='admin' && $u['role']==='admin') {
    $rows=$db->query("SELECT id,email,approved FROM users WHERE role='student' ORDER BY approved ASC,id DESC LIMIT 200")->fetchAll(PDO::FETCH_ASSOC);
    $html='<h1>Управление учениками</h1>';
    foreach ($rows as $row) {
        $next=$row['approved']?'revoke':'approve';
        $html.='<p>'.clean($row['email']).' · '.($row['approved']?'Доступ открыт':'Ожидает').'</p><form method="post" action="?action='.$next.'">'.token().'<input type="hidden" name="user_id" value="'.(int)$row['id'].'"><button>'.($row['approved']?'Отозвать доступ':'Одобрить доступ').'</button></form>';
    }
    page('Ученики',$html);
}
if (!$u['approved']) { http_response_code(403); page('Ожидание','<h1>Заявка ожидает подтверждения</h1><p>Доступ к урокам откроется только после решения администратора.</p>'); }
if ($action==='read') {
    $slug=(string)($_GET['course']??'');
    if (!preg_match('/^[a-z0-9-]{2,80}$/D',$slug)) { http_response_code(404); exit('Not found'); }
    $root=realpath($dataDir.'/courses'); $file=realpath($dataDir.'/courses/'.$slug.'/index.html');
    if (!$root || !$file || !str_starts_with($file,$root.DIRECTORY_SEPARATOR) || !is_file($file)) { http_response_code(404); exit('Not found'); }
    // This serves original course HTML from PRIVATE storage, never a public static URL.
    header('Content-Type: text/html; charset=utf-8');
    $html=(string)file_get_contents($file);
    // Existing course HTML has absolute asset paths; deploy those assets publicly, but never lessons.
    echo $html; exit;
}
$root=$dataDir.'/courses'; $links='';
foreach (glob($root.'/*/index.html')?:[] as $file) {
    $slug=basename(dirname($file));
    if (preg_match('/^[a-z0-9-]+$/',$slug)) $links.='<li><a href="?action=read&amp;course='.rawurlencode($slug).'">'.clean(str_replace('-',' ',$slug)).'</a></li>';
}
page('Курсы','<h1>777XSZ Academy</h1><p>Аккаунт: '.clean($u['email']).'</p>'.($u['role']==='admin'?'<p><a href="?action=admin">Одобрение учеников</a></p>':'').'<ul>'.$links.'</ul>');
