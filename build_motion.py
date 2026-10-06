"""Enhance the static AR Works pages. Run after build_site.py."""
from pathlib import Path
import re
ROOT=Path(__file__).parent
ART='''<div class="motion-system" aria-label="Объект, задача и условия — основа обсуждения обслуживания"><div class="system-top"><span>AR WORKS / СИСТЕМНЫЙ ПОДХОД</span><button class="motion-toggle" type="button" aria-pressed="false">Пауза анимации</button></div><div class="orbital" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit orbit-three"></div><div class="scan-beam"></div><div class="orb-core"><span>AR</span><small>WORKS</small></div><span class="orbit-node node-one">01 / ОБЪЕКТ</span><span class="orbit-node node-two">02 / ЗАДАЧА</span><span class="orbit-node node-three">03 / УСЛОВИЯ</span></div><div class="system-bottom"><span>От отдельных признаков<br>к задаче всего объекта</span><span class="system-arrow" aria-hidden="true">↗</span></div></div>'''
CHOOSER='''<section id="object-choice" class="choice-section"><div class="wrap"><div class="section-heading"><div><p class="ey">Ваш объект — отправная точка</p><h2>Разные объекты.<br>Разные условия.</h2></div><p class="muted">Выберите помещение — подскажем, какие детали включить в первый запрос.</p></div><div class="object-choices" role="group" aria-label="Выберите тип объекта"><button type="button" data-object="Кафе или ресторан" aria-pressed="true">Кафе / ресторан</button><button type="button" data-object="Склад или производство" aria-pressed="false">Склад / производство</button><button type="button" data-object="Магазин" aria-pressed="false">Магазин</button><button type="button" data-object="Офис или бизнес-центр" aria-pressed="false">Офис</button><button type="button" data-object="Гостиница" aria-pressed="false">Гостиница</button></div><div class="choice-panel"><div><span class="num">ЧТО ВАЖНО УЧЕСТЬ</span><h3 id="choice-title">Кафе или ресторан</h3><p id="choice-hint" aria-live="polite">Кухня, зал, хранение продуктов и режим работы. Укажите, в каких зонах заметили признаки.</p></div><a class="button primary" id="choice-cta" href="#request">Обсудить этот объект <span aria-hidden="true">↗</span></a></div></div></section>'''
VALUE='''<section class="value-section"><div class="wrap value-grid"><div><p class="ey">Для владельца и управляющего</p><h2>Важна не только<br>обработка.<br><span>Важен порядок.</span></h2><p class="muted">Когда на объекте появились признаки проблемы, важно понять её масштаб, условия работ и следующий шаг.</p></div><div class="value-list"><article><span>01</span><div><h3>Задача всего объекта</h3><p>Уточните зоны, признаки и ранее принятые меры — одного описания «увидели таракана» недостаточно для выбора решения.</p></div></article><article><span>02</span><div><h3>Условия до начала работ</h3><p>Объём, стоимость, подготовка, ограничения и документы — вопросы для согласования по вашему объекту.</p></div></article><article><span>03</span><div><h3>Первый шаг без сложной анкеты</h3><p>Тип объекта, примерная площадь и задача. Можно сразу написать в WhatsApp.</p></div></article></div></div></section>'''
def enhance():
    for name in ['index.html','dlya-organizatsiy.html','dezinsektsiya.html','deratizatsiya.html','dezinfektsiya.html','ozonirovanie.html','cafe-restaurants.html','warehouses.html']:
        path=ROOT/name
        page=path.read_text()
        if 'motion.css?v=20261006' in page: continue
        page=page.replace('</head>','<link rel="stylesheet" href="/motion.css?v=20261006"><script src="/motion.js?v=20261006" defer></script></head>')
        page=re.sub(r'<div class="control-art".*?</div></div>',ART+'</div>',page,count=1,flags=re.S)
        page=page.replace('<body>','<body class="motion-page">')
        page=page.replace('Обсудить объект и расчёт <span','Обсудить обслуживание <span')
        page=page.replace('Как строится порядок действий','Как подойти к задаче')
        page=page.replace('Четыре услуги.<br>Разные задачи.','Одна компания.<br>Четыре направления.')
        page=page.replace('Метод и ограничения необходимо согласовать до работ.','Метод, подготовку и ограничения согласуем по условиям объекта.')
        page=page.replace('Для расчёта: тип объекта, примерная площадь и задача.','Не знаете точную площадь? Укажите приблизительную.')
        page=page.replace('Подготовить сообщение <span','Обсудить в WhatsApp <span')
        if name=='index.html':
            page=page.replace('Санитарная ситуация.<br><span>Понятный порядок действий.</span>','Бизнес занят делом.<br><span>Санитарные задачи —<br>AR Works.</span>')
            page=page.replace('<p class="lead">Дезинсекция, дератизация, дезинфекция и озонирование для бизнеса и организаций в Астане и пригороде.</p>','<p class="lead">Дезинсекция, дератизация, дезинфекция и озонирование для коммерческих объектов. Начнём с вашей задачи, зон и режима работы.</p><p class="hero-detail">Кафе · магазины · склады · офисы · гостиницы</p>')
            page=page.replace('<section id="services">',CHOOSER+'<section id="services">',1)
            page=page.replace('<section id="process">',VALUE+'<section id="process">',1)
        path.write_text(page)
    print('Motion added to 8 pages')
if __name__=='__main__': enhance()
