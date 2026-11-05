'use strict';

var EXT = ['webp', 'png', 'jpg', 'jpeg', 'gif'], GIF1 = ['gif', 'webp', 'png', 'jpg', 'jpeg'];
var AM = [['Dinosaurio','🦖'],['Unicornio','🦄'],['Niño','👦'],['Monito','🐵'],['Gatito','🐱'],['Estrella','⭐']];
var EM = [
  ['😄','Feliz','#fde9c8','¡Qué bueno que estés feliz! Comparte esa alegría.','voz_feliz'],
  ['😌','Tranquilo','#e3f1d3','Qué bien. Respira y disfruta la calma.','voz_tranquilo'],
  ['😟','Preocupado','#f3d9ef','Está bien sentirse así. Respiremos juntos.','voz_preocupado'],
  ['😢','Triste','#e6ecf4','Estoy aquí contigo. Un abrazo grande.','voz_triste'],
  ['😡','Enojado','#fbd5d5','Es normal. Vamos a respirar despacio.','voz_enojado'],
  ['😰','Nervioso','#ffe3c9','Tranquilo. Inhala despacio, yo te acompaño.','voz_nervioso']
];
var JG = [
  ['Infla el globo','Respira y presiona','🎈',1,'sfx_globo_inflar','Toca el globo despacito: crece con cada toque'],
  ['Burbujas de calma','Toca y relájate','🫧',10,'sfx_burbuja','Revienta las 10 burbujas, una a una'],
  ['Colores de calma','Pinta el arcoíris','🌈',7,'sfx_arcoiris_1','Elige un color y toca una franja para pintarla'],
  ['Pececitos tranquilos','Explora y disfruta','🐠',10,'sfx_pez','Toca a los 10 pececitos para hacerlos felices'],
  ['Atrapa las estrellas','Recoge las estrellas','⭐',7,'sfx_estrella','Atrapa las 7 estrellas para tu cielo'],
  ['Rompecabezas','Arma y relaja','🧩',9,'sfx_pieza','Toca una imagen y arma el rompecabezas']
];
var JI = ['🎈','🫧','🌈','🐠','⭐','🧩'];
var ACT = [
  ['🦋','Abrazo de mariposa','Cruza los brazos y da palmaditas suaves en tus hombros.'],
  ['🖐️','Cuenta 5 cosas','Busca 5 cosas que puedas ver a tu alrededor.'],
  ['🎨','Dibuja tu calma','Dibuja algo que te haga sentir tranquilo.'],
  ['🕯️','Sopla la vela','Imagina una vela frente a ti y sóplala despacito 5 veces.'],
  ['🐱','Estírate como un gato','Sube los brazos lo más alto que puedas y bájalos muy despacio.']
];
var NAV = [['home','🏠','Inicio'],['resp','🌿','Respirar'],['jue','🎮','Jugar'],['ami','🧸','Mi amigo'],['emo','💙','Emociones'],['est','🏆','Logros'],['cfg','⚙️','Ajustes']];
var PZ = [[2,2],[2,2],[2,2],[2,3],[2,3],[2,3],[3,3],[3,3],[3,3]];
var RESP = ['resp_inhalar', 'resp_sostener', 'resp_exhalar'];
var SOLO = ['nombre', 'gracias'];

function ld(k){ try { return localStorage.getItem('mmc_' + k); } catch (e) { return null; } }
function sv(k, v){ try { localStorage.setItem('mmc_' + k, v); } catch (e) {} }
function $(s){ return document.querySelector(s); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

var S = {
  scr: 'home', stars: 0, am: 0, tmp: null, em: null, pj: 0,
  set: JSON.parse(ld('set') || '{"son":1,"voz":1,"ani":1,"hc":0,"dk":0,"red":0}'),
  mode: 'nino', t: null, files: [], up: '', al: null, alst: '', anm: '', sol: []
};
function ncnt(o){ o = o || {}; return { resp: o.resp || 0, jue: o.jue || [], pz: o.pz || 0, emo: o.emo || [], days: o.days || [], act: o.act || 0, seen: o.seen || 0 }; }
var cnt = ncnt();
var today = new Date().toDateString();
S.acc = window.SUPABASE_URL ? 'cargando' : 'fuera';
try { var ses = ld('t'); if (ses && !window.SUPABASE_URL) { S.t = { email: ses, rol: 'docente' }; S.acc = 'ok'; } } catch (e) {}

var AUD = {}, VOZ = null;
function stopVoz(){
  if (VOZ) { try { VOZ.stop(); } catch (e) {} VOZ = null; }
  for (var k in AUD) if (k.indexOf('voz_') === 0) { try { AUD[k].pause(); } catch (e) {} }
}
var ACX = null, BUF = {};
function acx(){
  if (!ACX) {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try { ACX = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }
  return ACX;
}
function cargaBuf(n){
  var c = acx(); if (!c || BUF[n]) return; BUF[n] = null;
  fetch('assets/audio/' + n + '.mp3').then(function(r){ if (!r.ok) throw 0; return r.arrayBuffer(); })
    .then(function(b){ return new Promise(function(ok, no){ c.decodeAudioData(b, ok, no); }); })
    .then(function(d){ BUF[n] = d; }).catch(function(){ delete BUF[n]; });
}
var SFX = ['boton', 'amigo', 'globo_inflar', 'globo_volar', 'burbuja', 'arcoiris_1', 'arcoiris_2', 'arcoiris_3', 'arcoiris_4', 'arcoiris_5', 'arcoiris_6', 'arcoiris_7', 'arcoiris_fin', 'pez', 'estrella', 'pieza', 'rompe_ok', 'actividad', 'estrella_ganada', 'logro'].map(function(x){ return 'sfx_' + x; });
var VOCES = ['listo', 'inhala', 'mantener', 'exhala', 'muybien', 'feliz', 'tranquilo', 'preocupado', 'triste', 'enojado', 'nervioso', 'gracias', 'nombre'].map(function(x){ return 'voz_' + x; });
function desbloquear(){
  var c = acx(); if (!c) return;
  try { if (c.state !== 'running') c.resume(); } catch (e) {}
  if (!S.bufs) { S.bufs = 1; VOCES.concat(SFX).forEach(cargaBuf); }
}
['pointerdown', 'keydown', 'touchend'].forEach(function(ev){ document.addEventListener(ev, desbloquear, true); });
function precarga(){
  if (S.pre) return; S.pre = 1;
  var n9 = [1, 2, 3, 4, 5, 6, 7, 8, 9], I = [1, 2, 3, 4, 5, 6].map(function(i){ return ['assets/img/avatar' + i, GIF1]; })
    .concat(RESP.map(function(x){ return ['assets/img/' + x, GIF1]; }),
      ['globo', 'fondo_peces', 'fondo_burbujas', 'fondo_estrellas'].concat(n9.map(function(i){ return 'rompecabezas' + i + '_m'; }), n9.map(function(i){ return 'rompecabezas' + i; })).map(function(x){ return ['assets/img/' + x, EXT]; }));
  var A = VOCES.concat(SFX).map(function(x){ return 'assets/audio/' + x + '.mp3'; }), i = 0, j = 0, au = 0;
  function sigI(){ if (i >= I.length) { if (!au) { au = 1; sigA(); } return; } var q = I[i++]; probe(q[0], q[1]).then(sigI); }
  function sigA(){ if (j >= A.length) return; fetch(A[j++]).then(function(r){ return r.blob(); }).catch(function(){}).then(function(){ setTimeout(sigA, 30); }); }
  sigI(); sigI(); sigI();
}
function snd(n){
  var voz = n.indexOf('voz_') === 0;
  if (voz ? !S.set.voz : !S.set.son) return;
  if (voz) stopVoz();
  var c = ACX;
  if (BUF[n] && c) {
    try {
      if (c.state !== 'running') c.resume();
      var src = c.createBufferSource(), g = c.createGain();
      src.buffer = BUF[n]; g.gain.value = (!voz && S.set.red) ? 0.4 : 1; src.connect(g); g.connect(c.destination); src.start(0);
      if (voz) { VOZ = src; src.onended = function(){ if (VOZ === src) VOZ = null; }; }
      return;
    } catch (e) {}
  }
  if (c && BUF[n] === undefined) cargaBuf(n);
  var a = AUD[n] || (AUD[n] = new Audio('assets/audio/' + n + '.mp3'));
  a.volume = (!voz && S.set.red) ? 0.4 : 1;
  try { a.currentTime = 0; var p = a.play(); if (p && p.catch) p.catch(function(){}); } catch (e) {}
}
function sonando(){
  if (VOZ) return true;
  for (var k in AUD) if (k.indexOf('voz_') === 0 && !AUD[k].paused && !AUD[k].ended) return true;
  return false;
}
function vdur(n){
  if (BUF[n]) return Promise.resolve(BUF[n].duration);
  return new Promise(function(res){
    var a = AUD[n] || (AUD[n] = new Audio('assets/audio/' + n + '.mp3')), done = false;
    if (a.duration > 0 && isFinite(a.duration)) return res(a.duration);
    function fin(v){ if (!done) { done = true; res(v > 0 && isFinite(v) ? v : 0); } }
    a.addEventListener('loadedmetadata', function(){ fin(a.duration); }, { once: true });
    a.addEventListener('error', function(){ fin(0); }, { once: true });
    a.preload = 'metadata'; try { a.load(); } catch (e) {}
    setTimeout(function(){ fin(0); }, 1500);
  });
}

var RES = {};
function pic(base, emoji, gif){
  var r = RES[base];
  if (r) return '<img class="pic" alt="" decoding="async" src="' + r + '">';
  if (r === '') return emoji ? '<span class="e">' + emoji + '</span>' : '';
  var o = gif ? GIF1 : EXT;
  return '<img class="pic" alt="" decoding="async" src="' + base + '.' + o[0] + '" data-b="' + base + '" data-o="' + o.join(',') + '" data-i="0" data-fb="' + (emoji || '') + '" onload="okp(this)" onerror="nx(this)">';
}
function okp(el){ if (el.dataset.b) RES[el.dataset.b] = el.getAttribute('src'); }
function nx(el){
  var o = el.dataset.o.split(','), i = +el.dataset.i + 1;
  if (i < o.length) { el.dataset.i = i; el.src = el.dataset.b + '.' + o[i]; return; }
  RES[el.dataset.b] = '';
  if (!el.dataset.fb) el.remove();
  else { var s = document.createElement('span'); s.className = 'e'; s.textContent = el.dataset.fb; el.replaceWith(s); }
}
function probe(base, o){
  if (RES[base] !== undefined) return Promise.resolve(RES[base]);
  o = o || GIF1;
  return new Promise(function(ok){
    var i = 0;
    (function t(){
      if (i >= o.length) { RES[base] = ''; return ok(''); }
      var u = base + '.' + o[i++], im = new Image();
      im.onload = function(){ RES[base] = u; ok(u); };
      im.onerror = t; im.src = u;
    })();
  });
}
function avatar(i){ return pic('assets/img/avatar' + (i + 1), AM[i][1], 1).replace('class="pic"', 'class="pic ava"'); }
function mascot(){ return avatar(S.am); }

function applySet(c){
  c = c || S.set;
  var r = document.documentElement.classList;
  r.toggle('hc', !!c.hc); r.toggle('dk', !!c.dk); r.toggle('red', !!c.red); r.toggle('calm', !!c.red || !c.ani);
}
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function calm(){ return S.set.red || !S.set.ani; }
function savec(){ if (S.al) { S.al.progreso = cnt; alSync(); } }
function star(){ S.stars++; if (S.al) { S.al.estrellas = S.stars; alSync(); } snd('sfx_estrella_ganada'); }
function pillUp(){ document.querySelectorAll('.pill').forEach(function(p){ p.textContent = '⭐ ' + S.stars; }); }
function go(s){
  stopVoz();
  if (S.scr === 'cfg' && s !== 'cfg') { S.draft = null; applySet(S.set); }
  if (s === 'cfg') { S.draft = clone(S.set); S.saved = 0; }
  S.scr = s; draw();
}

function uidt(){ return (S.t && (S.t.id || S.t.email)) || ''; }
function alInit(){
  var a = null; try { localStorage.removeItem('mmc_nino'); a = JSON.parse(ld(ninoKey()) || 'null'); } catch (x) {}
  S.alst = 'ok';
  if (a && a.nombre) usarAl(a); else { S.al = null; S.scr = 'nombre'; S.tmp = null; S.anm = ''; }
  draw();
  if (S.scr === 'nombre') snd('voz_nombre');
}
function usarAl(a){
  a.avatar = Math.min(5, Math.max(0, +a.avatar || 0)); a.estrellas = +a.estrellas || 0;
  S.al = a; S.am = a.avatar; S.stars = a.estrellas; cnt = a.progreso = ncnt(a.progreso);
  if (cnt.days.indexOf(today) < 0) cnt.days.push(today);
  alSync(); S.scr = 'home'; S.em = null; S.tmp = null;
}
function ninoKey(){ return 'nino_' + uidt(); }
function alSync(){ if (S.al && uidt()) sv(ninoKey(), JSON.stringify(S.al)); }
function irNombre(){ S.tmp = S.al ? S.al.avatar : null; S.anm = S.al ? S.al.nombre : ''; go('nombre'); snd('voz_nombre'); }
function otroNino(){
  try { localStorage.removeItem('mmc_' + ninoKey()); } catch (x) {}
  S.al = null; cnt = ncnt(); S.stars = 0; S.am = 0; S.mode = 'nino'; S.tmp = null; S.anm = ''; S.scr = 'nombre'; draw(); snd('voz_nombre');
}
function nuevoAl(){
  var inp = $('#anm'), n = ((inp && inp.value) || '').trim().replace(/\s+/g, ' ').slice(0, 30), e = $('#nerr');
  if (!n) { e.textContent = 'Escribe tu nombre arriba ✏️'; inp.focus(); return; }
  if (S.tmp === null) { e.textContent = 'Toca el amigo que más te guste 👆'; return; }
  if (S.al) { S.al.nombre = n; S.al.avatar = S.tmp; usarAl(S.al); }
  else usarAl({ nombre: n, avatar: S.tmp, estrellas: 0, progreso: ncnt() });
  S.anm = ''; S.scr = 'gracias'; draw(); snd('voz_gracias');
}
function finGracias(){ clearTimeout(S.gt); if (S.scr === 'gracias') { S.scr = 'home'; draw(); } }

function head(t, sub, back){
  return '<header>' + (back ? '<button class="ib" data-g="home" aria-label="Volver">←</button>' : '') +
    '<h1>' + t + '</h1>' + (back ? '<span class="pill">⭐ ' + S.stars + '</span>' : '') + '</header>' +
    (sub ? '<p class="sub">' + sub + '</p>' : '');
}
function cargando(){ return '<header><h1>Mi Mundo de Calma 🌈</h1></header><main><div class="card gcen"><div class="mascot">🌈</div><p>Cargando…</p></div></main>'; }
function draw(){
  cancelAnimationFrame(S.raf); S.raf = 0;
  var h = '', s = S.scr, doc = S.mode === 'doc';
  if (S.acc !== 'ok') { $('#app').innerHTML = gate(); return; }
  if (S.alst !== 'ok') { $('#app').innerHTML = cargando(); return; }
  if (S.t && doc) h += '<div class="tbar">🧑‍🏫 ' + esc(S.t.nombre || S.t.email) +
    '<button class="sm" data-m="nino">Ver la app</button>' +
    '<button class="sm g" data-m="out">Cerrar sesión</button></div>';
  if (doc) h += panel();
  else if (s === 'pin') h += pinScr();
  else {
    if (!S.al && SOLO.indexOf(s) < 0) s = S.scr = 'nombre';
    if (SOLO.indexOf(s) >= 0) h += scr(s);
    else if (s === 'play') h += '<main class="juego"><button class="volver" id="volver" aria-label="Volver">←</button><div class="arena full" id="ar"></div></main>';
    else h += '<main>' + scr(s) + '</main><nav aria-label="Menú">' + NAV.map(function(n){
      return '<button data-g="' + n[0] + '"' + (s === n[0] ? ' class="on" aria-current="page"' : '') + '><span>' + n[1] + '</span>' + n[2] + '</button>';
    }).join('') + '</nav>';
  }
  $('#app').innerHTML = h;
  after(s);
}
function docBtn(){ return '<button class="dbtn" id="tbtn" aria-label="Zona del docente">🧑‍🏫<span>Docente</span></button>'; }
function scr(s){
  if (s === 'home') return '<header><button class="chg" id="cnom">✏️ Cambiar nombre</button><span class="pill">⭐ ' + S.stars + '</span><span style="flex:1"></span>' + docBtn() + '</header>' +
    '<h1 class="hola">¡Hola, ' + esc(S.al ? S.al.nombre : 'amigo') + '! 👋</h1>' +
    '<div class="hero1"><span class="mascot">' + mascot() + '</span><span>¿Qué quieres hacer hoy?</span></div>' +
    '<button class="kb k1 wide" data-g="resp"><i>💙</i>Necesito calmarme</button>' +
    '<div class="kgrid"><button class="kb k2" data-g="jue"><i>🎮</i>Jugar</button>' +
    '<button class="kb k3" data-g="act"><i>🎨</i>Actividades</button>' +
    '<button class="kb k4" data-g="emo"><i>💛</i>Emociones</button>' +
    '<button class="kb k5" data-g="ami"><i>🧸</i>Mi amigo</button></div>';
  if (s === 'nombre') return '<header>' + (S.al ? '<button class="ib" data-g="home" aria-label="Volver">←</button>' : '') +
    '<h1>Ingresa tu nombre</h1><button class="ib" data-voz="voz_nombre" aria-label="Escuchar">🔊</button></header><main>' +
    '<input class="field nmf" id="anm" maxlength="30" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Escribe tu nombre aquí" value="' + esc(S.anm) + '">' +
    '<h2 class="ttl">Elige tu amigo</h2><div class="friends">' + AM.map(function(a, i){
      return '<button data-a="' + i + '" aria-pressed="' + (S.tmp === i) + '">' + avatar(i) + a[0] + '</button>';
    }).join('') + '</div><div id="nerr" class="lerr" role="alert" style="text-align:center"></div>' +
    '<button class="btn big" id="nsel">Seleccionar este personaje</button></main>';
  if (s === 'gracias') return '<main class="grw"><div class="grav">' + mascot() + '</div><h1 class="hola" style="text-align:center">¡Gracias por elegirme!</h1>' +
    '<p class="sub" style="font-size:18px">Ahora soy tu amigo, ' + esc(S.al ? S.al.nombre : '') + ' 💙</p><button class="btn big" id="grok" style="max-width:360px">¡Vamos!</button></main>';
  if (s === 'resp') return head('Respira conmigo', '', 1) + '<div class="bwrap"><div class="breathe" id="br" data-k="am">' + mascot() + '</div>' +
    '<span class="bb b0 on" id="b0" role="status" aria-live="polite">Cuando estés listo, toca el botón</span>' +
    '<span class="bb b1" id="b1"></span><span class="bb b2" id="b2"></span><span class="bb b3" id="b3"></span></div>' +
    '<p class="sub" style="margin-top:12px">Estoy aquí contigo 💙</p><button class="btn big" id="bgo">Empezar a respirar</button>';
  if (s === 'jue') return head('Mis juegos', 'Juega, diviértete y relájate', 1) + '<div class="kgrid">' + JG.map(function(g, i){
    return '<button class="kb k' + (i % 6 + 1) + '" data-j="' + i + '"><i>' + JI[i] + '</i>' + g[0] + '</button>';
  }).join('') + '</div>';
  if (s === 'ami') { var sel = S.tmp === null ? S.am : S.tmp;
    return head('Elige tu amigo', '¿Con quién quieres compartir?', 1) + '<div class="friends">' + AM.map(function(a, i){
      return '<button data-a="' + i + '" aria-pressed="' + (sel === i) + '">' + avatar(i) + a[0] + '</button>';
    }).join('') + '</div><button class="btn big" id="elegir">Seleccionar este personaje</button>'; }
  if (s === 'emo') return head('¿Cómo te sientes hoy?', 'Elige la emoción que mejor te describe', 1) + '<div class="emo">' + EM.map(function(e, i){
    return '<button data-e="' + i + '" style="background:' + e[2] + '" aria-pressed="' + (S.em === i) + '"><i>' + e[0] + '</i>' + e[1] + '</button>';
  }).join('') + '</div>' + (S.em !== null ? '<div class="bubble" style="margin-top:14px"><span>' + mascot() + '</span>' + EM[S.em][3] + '</div>' +
    '<button class="btn big" style="margin-top:12px" data-g="' + (S.em > 1 ? 'resp' : 'jue') + '">' + (S.em > 1 ? '🌿 Respiremos juntos' : '🎮 ¡A jugar!') + '</button>' : '');
  if (s === 'act') return head('Actividades', 'Explora y aprende', 1) + ACT.map(function(a, i){
    return '<div class="card acard"><b class="at">' + a[0] + ' ' + a[1] + '</b><p>' + a[2] + '</p><button class="btn big" data-fin="' + i + '">¡Lo hice!</button></div>';
  }).join('');
  if (s === 'est') return estrellas();
  if (s === 'cfg') { var C = S.draft || S.set;
    var K = [['son','🔊','Sonidos','Efectos de los juegos y botones'],['voz','🗣️','Voz','Tus audios al respirar y con las emociones'],
             ['ani','🎬','Animaciones','Movimiento suave en juegos y pantallas'],['hc','🔆','Alto contraste','Bordes gruesos y colores muy nítidos'],
             ['dk','🌙','Modo oscuro','Fondo oscuro, menos brillo'],['red','🎯','Reducir estímulos','Sin movimiento, colores suaves y sonidos bajos']];
    return head('Configuración', 'Los cambios se ven al momento; toca Guardar para conservarlos', 1) + '<div class="card">' + K.map(function(k){
      return '<div class="row"><span style="font-size:22px">' + k[1] + '</span><span class="t">' + k[2] + '<small style="display:block;font-weight:600;color:var(--soft)">' + k[3] + '</small></span><button class="sw" role="switch" data-k="' + k[0] + '" aria-checked="' + !!C[k[0]] + '" aria-label="' + k[2] + '"></button></div>';
    }).join('') + '</div>' + (S.saved ? '<div class="card" role="status" style="text-align:center;font-weight:800">¡Guardado! ✓</div>' : '') +
    '<button class="btn big" id="save">Guardar cambios</button>'; }
  return '';
}
function estrellas(){
  var L = [['🌱','Primera sesión',cnt.days.length,1],['🌿','Respira 3 veces',cnt.resp,3],['🎮','Juega los 6 juegos',cnt.jue.length,6],
           ['🧩','Resuelve 3 rompecabezas',cnt.pz,3],['💙','Prueba 4 emociones distintas',cnt.emo.length,4],
           ['🎨','Haz 3 actividades de calma',cnt.act,3],['📅','Usa la app 3 días',cnt.days.length,3]];
  var un = L.filter(function(l){ return l[2] >= l[3]; }).length;
  if (un > cnt.seen) { cnt.seen = un; savec(); setTimeout(function(){ snd('sfx_logro'); }, 200); }
  return head('Mis logros', 'Cada paso cuenta', 1) + '<div class="card stars">' +
    [[5,'⭐','Primera meta'],[10,'🌟','Excelente'],[20,'🏅','Campeón']].map(function(m){
      return '<div style="opacity:' + (S.stars >= m[0] ? 1 : .4) + '"><span>' + m[1] + '</span>' + m[0] + '<br><small>' + m[2] + '</small></div>'; }).join('') +
    '</div><h3>Mis logros</h3>' + L.map(function(l){
      var ok = l[2] >= l[3], p = Math.min(100, l[2] / l[3] * 100);
      return '<div class="card row"><span style="font-size:26px">' + (ok ? l[0] : '🔒') + '</span><span class="t">' + l[1] +
        '<div class="bar2"><div style="width:' + p + '%"></div></div><small style="color:var(--soft)">' + Math.min(l[2], l[3]) + ' de ' + l[3] + '</small></span>' + (ok ? '✓' : '') + '</div>';
    }).join('') + '<div class="bubble" style="background:#fdebc6;color:#5b4310"><span>' + mascot() + '</span>¡Vas muy bien!</div>';
}
function after(s){
  if (s === 'resp') { var b = $('#bgo'); if (b) b.onclick = breathe; }
  if (s === 'play') arena();
  if (s === 'gracias') {
    clearTimeout(S.gt);
    vdur('voz_gracias').then(function(d){ if (S.scr !== 'gracias') return; clearTimeout(S.gt); S.gt = setTimeout(finGracias, Math.min(6000, Math.max(2500, d * 1000 + 700))); });
  }
}
function actividad(t){
  if (t.disabled) return;
  cnt.act++; savec(); star(); pillUp();
  if (S.set.voz) snd('voz_muybien'); else snd('sfx_actividad');
  t.disabled = true; t.classList.add('ok'); t.textContent = '✓ ¡Muy bien! +1 ⭐';
  if (!calm()) t.closest('.card').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 500, easing: 'ease-out' });
}

function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
var PHASES = [
  { key: 'inhale', label: 'INHALA', text: 'Toma aire por la nariz', voice: 'voz_inhala' },
  { key: 'hold',   label: 'MANTÉN', text: 'Mantenlo',               voice: 'voz_mantener' },
  { key: 'exhale', label: 'EXHALA', text: 'Exhala lentamente',      voice: 'voz_exhala' }
];
async function breathe(){
  var br = $('#br'), btn = $('#bgo'); if (!br || !btn) return;
  var id = S.rid = (S.rid || 0) + 1;
  function alive(){ return S.rid === id && br.isConnected; }
  var B = { ready: $('#b0'), inhale: $('#b1'), hold: $('#b2'), exhale: $('#b3') };
  function only(k){ for (var q in B) B[q].classList.toggle('on', q === k); }
  function phase(k){ if (k) br.dataset.phase = k; else delete br.dataset.phase; }
  function pon(g){
    var k = g || 'am';
    if (br.dataset.k === k) return;
    br.innerHTML = g ? '<img class="pic rg" alt="" src="' + g + '?v=' + Date.now() + '">' : mascot();
    br.dataset.k = k; void br.firstChild.offsetWidth;
  }
  function idle(msg){ B.ready.innerHTML = msg; only('ready'); pon(''); phase(null); btn.textContent = 'Empezar a respirar'; btn.classList.remove('sec'); btn.onclick = breathe; }
  btn.textContent = 'Parar'; btn.classList.add('sec');
  btn.onclick = function(){ S.rid++; stopVoz(); idle('Cuando estés listo, toca el botón'); };
  B.ready.textContent = '¿Listo? Empezamos'; only('ready'); snd('voz_listo');
  var t0 = Date.now(), secs = 3, espera = 2000;
  var G = await Promise.all(RESP.map(function(b){ return probe('assets/img/' + b); }));
  if (!alive()) return;
  if (S.set.voz) {
    var ds = await Promise.all([vdur('voz_listo'), vdur('voz_inhala'), vdur('voz_mantener')]);
    if (!alive()) return;
    secs = Math.min(5, Math.max(3, Math.ceil(Math.max(ds[1], ds[2]) - 0.05)));
    espera = Math.min(3500, Math.max(2000, Math.round(ds[0] * 1000) + 150));
  }
  await wait(Math.max(0, espera - (Date.now() - t0))); if (!alive()) return;
  br.style.setProperty('--ph', secs + 's');
  for (var i = 0; i < PHASES.length; i++) {
    var p = PHASES[i], el = B[p.key];
    pon(G[i]);
    el.innerHTML = '<b>' + p.label + '</b><em>' + p.text + '</em><span class="cn">' + secs + '</span>';
    only(p.key); phase(p.key); snd(p.voice);
    for (var n = secs; n > 0; n--) {
      el.querySelector('.cn').textContent = n;
      await wait(1000); if (!alive()) return;
    }
  }
  if (S.set.voz) {
    for (var k = 0; sonando() && k < 20; k++) { await wait(100); if (!alive()) return; }
  }
  cnt.resp++; savec(); star(); snd('voz_muybien'); pillUp();
  idle('¡Muy bien! Lo lograste<br>+1 ⭐'); btn.textContent = 'Respirar otra vez';
}

function win(ar, msg){
  if (cnt.jue.indexOf(S.pj) < 0) cnt.jue.push(S.pj);
  savec(); star(); S.pzv = 0; ar.classList.remove('noche', 'burb'); ar.style.background = '';
  ar.innerHTML = '<div class="cen"><div class="mascot" style="padding:40px 10px 14px;animation:pop .6s ease">🎉<br><b style="font-size:22px">' + (msg || '¡Muy bien!') + '</b><br><small>+1 ⭐</small></div>' +
    '<div style="padding:0 20px 20px;display:grid;gap:12px;max-width:520px;margin:0 auto"><button class="btn big" style="position:static" data-j="' + S.pj + '">Jugar otra vez</button>' +
    '<button class="btn sec big" style="position:static" data-g="jue">Mis juegos</button></div></div>';
}
function arena(){
  var g = JG[S.pj], ar = $('#ar');
  if (S.pj === 0) return globo(ar);
  if (S.pj === 2) return arcoiris(ar);
  if (S.pj === 3) return peces(ar);
  if (S.pj === 5) return pzGallery(ar);
  if (S.pj === 1) return burbujas(ar, g);
  return fugaces(ar, g);
}
function burbujas(ar, g){
  var N = g[3], left = N, W = ar.clientWidth || 340, H = ar.clientHeight || 380, last = 0, bs = [];
  ar.classList.add('burb'); ar.style.background = 'linear-gradient(#7dd3fc,#0ea5e9)';
  ar.innerHTML = pic('assets/img/fondo_burbujas', '').replace('class="pic"', 'class="pic bg"');
  var k = !S.set.ani ? 0 : (S.set.red ? .5 : 1);
  cancelAnimationFrame(S.raf);
  for (var i = 0; i < N; i++) (function(){
    var sz = 64 + Math.random() * 46, an = Math.random() * 6.283, sp = (130 - sz) * (.7 + Math.random() * .7) * 1.5;
    var el = document.createElement('button'); el.className = 'mv'; el.setAttribute('aria-label', 'Tocar');
    el.style.width = el.style.height = sz + 'px'; el.style.fontSize = (sz * .85) + 'px';
    el.innerHTML = '<span class="fi">' + g[2] + '</span>';
    var b = { el: el, fi: el.firstChild, sz: sz, x: Math.random() * (W - sz), y: Math.random() * (H - sz), vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, done: 0 };
    el.style.transform = 'translate(' + b.x + 'px,' + b.y + 'px)';
    el.onclick = function(){
      if (b.done) return; b.done = 1; snd(g[4]); el.style.pointerEvents = 'none';
      b.fi.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.7)', opacity: 0 }], { duration: 450, fill: 'forwards' });
      setTimeout(function(){ el.remove(); }, 450);
      if (!--left) { cancelAnimationFrame(S.raf); setTimeout(function(){ win(ar); }, 500); }
    };
    bs.push(b); ar.appendChild(el);
  })();
  if (!k) return;
  function frame(ts){
    if (!ar.isConnected) return;
    var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    bs.forEach(function(b){
      if (b.done) return;
      b.x += b.vx * k * dt; b.y += b.vy * k * dt;
      if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); } else if (b.x > W - b.sz) { b.x = W - b.sz; b.vx = -Math.abs(b.vx); }
      if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); } else if (b.y > H - b.sz) { b.y = H - b.sz; b.vy = -Math.abs(b.vy); }
      b.el.style.transform = 'translate(' + b.x + 'px,' + b.y + 'px)';
    });
    S.raf = requestAnimationFrame(frame);
  }
  S.raf = requestAnimationFrame(frame);
}
var ESTRELLA = '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><path d="M50 4 L62 36 L96 37 L69 58 L79 92 L50 72 L21 92 L31 58 L4 37 L38 36 Z" fill="#facc15" stroke="#eab308" stroke-width="4" stroke-linejoin="round"/>' +
  '<ellipse cx="40" cy="50" rx="5" ry="7" fill="#1e293b"/><ellipse cx="60" cy="50" rx="5" ry="7" fill="#1e293b"/><circle cx="41.5" cy="47.5" r="1.8" fill="#fff"/><circle cx="61.5" cy="47.5" r="1.8" fill="#fff"/>' +
  '<path d="M42 62 Q50 69 58 62" stroke="#1e293b" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="33" cy="61" r="4" fill="#fb923c" opacity=".6"/><circle cx="67" cy="61" r="4" fill="#fb923c" opacity=".6"/></svg>';
function fugaces(ar, g){
  var N = g[3], caught = 0, W = ar.clientWidth || 340, H = ar.clientHeight || 380, last = 0, lastSp = 0, act = [];
  ar.classList.add('noche');
  ar.innerHTML = pic('assets/img/fondo_estrellas', '').replace('class="pic"', 'class="pic bg"');
  var k = !S.set.ani ? 0 : (S.set.red ? .5 : 1);
  cancelAnimationFrame(S.raf);
  function atrapada(st){
    if (st.done) return; st.done = 1; snd(g[4]); st.el.style.pointerEvents = 'none'; act.splice(act.indexOf(st), 1);
    st.fi.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.9)', opacity: 0 }], { duration: 450, fill: 'forwards' });
    if (st.tail) st.tail.style.display = 'none';
    setTimeout(function(){ st.el.remove(); }, 450);
    if (++caught >= N) { cancelAnimationFrame(S.raf); setTimeout(function(){ win(ar); }, 600); }
  }
  function nueva(quieta){
    var sz = 70 + Math.random() * 20, st = { sz: sz, age: 0, done: 0 };
    var el = document.createElement('button'); el.className = 'mv star'; el.setAttribute('aria-label', 'Estrella');
    el.style.width = el.style.height = sz + 'px'; el.style.fontSize = (sz * .85) + 'px';
    el.innerHTML = (quieta ? '' : '<span class="tail"></span>') + '<span class="fi">' + ESTRELLA + '</span>';
    st.el = el; st.fi = el.querySelector('.fi'); st.tail = el.querySelector('.tail');
    if (quieta) { st.x = Math.random() * (W - sz); st.y = Math.random() * (H - sz); }
    else {
      var lado = Math.floor(Math.random() * 4), m = sz + 30, tx = W * (.2 + Math.random() * .6), ty = H * (.2 + Math.random() * .6);
      if (lado === 0) { st.x = -m; st.y = Math.random() * H; } else if (lado === 1) { st.x = W + m; st.y = Math.random() * H; }
      else if (lado === 2) { st.x = Math.random() * W; st.y = -m; } else { st.x = Math.random() * W; st.y = H + m; }
      var dx = tx - st.x, dy = ty - st.y, d = Math.hypot(dx, dy) || 1, sp = (60 + Math.random() * 80) * 1.5 * k;
      st.vx = dx / d * sp; st.vy = dy / d * sp;
      st.tail.style.transform = 'rotate(' + (Math.atan2(st.vy, st.vx) * 57.3) + 'deg)';
    }
    el.style.transform = 'translate(' + st.x + 'px,' + st.y + 'px)';
    el.onclick = function(){ atrapada(st); };
    act.push(st); ar.appendChild(el);
  }
  if (!k) { for (var i = 0; i < N; i++) nueva(true); return; }
  function frame(ts){
    if (!ar.isConnected) return;
    var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    for (var j = act.length - 1; j >= 0; j--) {
      var st = act[j]; st.age += dt; st.x += st.vx * dt; st.y += st.vy * dt;
      st.el.style.transform = 'translate(' + st.x + 'px,' + st.y + 'px)';
      if (st.age > .6 && (st.x < -st.sz - 20 || st.x > W + 20 || st.y < -st.sz - 20 || st.y > H + 20)) { st.el.remove(); act.splice(j, 1); }
    }
    if (act.length < 3 && ts - lastSp > 650 && caught + act.length < N + 4) { lastSp = ts; nueva(false); }
    S.raf = requestAnimationFrame(frame);
  }
  S.raf = requestAnimationFrame(frame);
}
var CARA = '<svg class="cara" viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="30" cy="26" rx="8" ry="11" fill="#1e293b"/><ellipse cx="70" cy="26" rx="8" ry="11" fill="#1e293b"/>' +
  '<circle cx="33" cy="21" r="3.2" fill="#fff"/><circle cx="73" cy="21" r="3.2" fill="#fff"/><circle cx="16" cy="46" r="7" fill="#fda4af" opacity=".75"/><circle cx="84" cy="46" r="7" fill="#fda4af" opacity=".75"/>' +
  '<path d="M34 48 Q50 64 66 48" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';
function globo(ar){
  var c = 0, N = 6, tremble = null;
  ar.innerHTML = '<div id="gt" style="position:absolute;top:14px;left:0;right:0;text-align:center;font-weight:800;font-size:18px">Toca el globo despacito: 0 de ' + N + '</div>' +
    '<button id="bl" aria-label="Inflar el globo"><span id="bi" style="display:block;position:relative">' + pic('assets/img/globo', '🎈') + CARA + '</span></button>';
  var b = $('#bl'), bi = $('#bi');
  b.style.cssText = 'position:absolute;left:50%;bottom:20px;font-size:90px;transform:translateX(-50%) scale(1);transform-origin:50% 100%;transition:transform 1.2s cubic-bezier(.3,1.5,.5,1);';
  function fly(){
    snd('sfx_globo_volar');
    b.style.transition = 'transform 2.6s ease-in,opacity 2.6s ease-in';
    b.style.transform = 'translateX(-50%) translateY(-340px) scale(' + (1 + N * .4) + ')'; b.style.opacity = '0';
    setTimeout(function(){ win(ar, '¡El globo voló al cielo!'); }, 2400);
  }
  b.onclick = function(){
    if (c >= N) return; c++; snd('sfx_globo_inflar');
    b.style.transform = 'translateX(-50%) scale(' + (1 + c * .4) + ')';
    if (!calm()) bi.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.14,.9)' }, { transform: 'scale(.94,1.08)' }, { transform: 'scale(1,1)' }], { duration: 600, easing: 'ease-out' });
    $('#gt').textContent = c < N ? 'Toca el globo despacito: ' + c + ' de ' + N : '¡Está enorme!';
    if (c === N - 1 && !calm()) tremble = bi.animate([{ rotate: '-2deg' }, { rotate: '2deg' }], { duration: 280, direction: 'alternate', iterations: Infinity });
    if (c >= N) { if (tremble) tremble.cancel(); setTimeout(fly, 1200); }
  };
}

var RB = [['rojo','#ef4444'],['naranja','#f97316'],['amarillo','#facc15'],['verde','#22c55e'],['azul','#3b82f6'],['añil','#6366f1'],['violeta','#a855f7']];
function arcoiris(ar){
  var cx = 150, cy = 168, R0 = 136, W = 17, sel = 0, pint = [], busy = 0, i;
  function arc(k){ var r = R0 - k * W; return 'M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy; }
  var svg = '<svg viewBox="0 0 300 185" class="rb" aria-hidden="true">' +
    '<g id="cielo" style="opacity:0;transition:opacity .9s"><circle cx="262" cy="34" r="20" fill="#fde047"/><ellipse cx="40" cy="170" rx="30" ry="12" fill="#fff"/><ellipse cx="62" cy="160" rx="22" ry="14" fill="#fff"/><ellipse cx="262" cy="172" rx="28" ry="11" fill="#fff"/></g>';
  for (i = 0; i < 7; i++) svg += '<path d="' + arc(i) + '" fill="none" stroke="#cbd5e1" stroke-opacity=".55" stroke-width="' + (W - 1) + '"/>' +
    '<path id="rp' + i + '" class="rbp" d="' + arc(i) + '" fill="none" stroke="#cbd5e1" stroke-width="' + (W - 1) + '" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>' +
    '<path data-s="' + i + '" d="' + arc(i) + '" fill="none" stroke="transparent" stroke-width="' + (W + 2) + '" style="cursor:pointer"/>';
  svg += '</svg>';
  var dots = '';
  for (i = 0; i < 7; i++) dots += '<button class="dot" data-c="' + i + '" style="background:' + RB[i][1] + '" aria-label="Color ' + RB[i][0] + '"></button>';
  ar.innerHTML = '<div class="rbwrap cen"><div id="rbm" class="rbmsg" role="status"></div>' + svg + '<div class="dots">' + dots + '</div></div>';
  function msg(t){ $('#rbm').textContent = t; }
  function mark(){ ar.querySelectorAll('.dot').forEach(function(d, k){ d.classList.toggle('next', k === sel); }); }
  function color(k){ if (busy) return; sel = k; snd('sfx_arcoiris_' + (k + 1)); mark(); msg('Color ' + RB[k][0] + ': toca una franja'); }
  function pintar(k){
    if (busy) return;
    var p = $('#rp' + k), nuevo = pint.indexOf(k) < 0;
    p.style.stroke = RB[sel][1]; p.style.strokeDashoffset = 0; snd('sfx_arcoiris_' + (sel + 1));
    if (nuevo) pint.push(k);
    var falta = 7 - pint.length;
    if (falta) msg(falta === 1 ? '¡Muy bien! Falta 1 franja' : '¡Muy bien! Faltan ' + falta + ' franjas');
    else {
      busy = 1; msg('¡Tu arcoíris está completo!'); $('#cielo').style.opacity = 1;
      setTimeout(function(){ snd('sfx_arcoiris_fin'); }, 500);
      setTimeout(function(){ win(ar, '¡Qué bonito arcoíris!'); }, 2000);
    }
  }
  ar.querySelectorAll('[data-c]').forEach(function(e){ e.onclick = function(){ color(+e.dataset.c); }; });
  ar.querySelectorAll('[data-s]').forEach(function(e){ e.onclick = function(){ pintar(+e.dataset.s); }; });
  msg('Elige un color y toca una franja'); mark();
}

var FE = '<circle cx="52" cy="15" r="4.5" fill="#fff"/><circle cx="53.4" cy="15" r="2.3" fill="#1e293b"/>';
var PECES = [
  '<path d="M17 20 L2 7 Q7 20 2 33 Z" fill="#f97316" stroke="#1f2937" stroke-width="1.4"/><ellipse cx="37" cy="20" rx="23" ry="13" fill="#f97316" stroke="#1f2937" stroke-width="1.4"/>' +
    '<path d="M25 9 Q21 20 25 31 L31 32.5 Q27 20 31 7.5 Z" fill="#fff" stroke="#1f2937" stroke-width="1.2"/><path d="M42 7.5 Q38 20 42 32.5 L47 31 Q44 20 47 9 Z" fill="#fff" stroke="#1f2937" stroke-width="1.2"/>' + FE +
    '<path d="M58 23 Q55 26 51 24" stroke="#1f2937" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  '<path d="M18 20 L5 12 L5 28 Z" fill="#eab308"/><g fill="#a16207"><path d="M36 2 L33 7 L39 7 Z"/><path d="M47 6 L42 9 L47 11 Z"/><path d="M25 6 L30 9 L25 11 Z"/><path d="M36 38 L33 33 L39 33 Z"/><path d="M47 34 L42 31 L47 29 Z"/><path d="M25 34 L30 31 L25 29 Z"/></g>' +
    '<circle cx="36" cy="20" r="15" fill="#facc15"/><ellipse cx="36" cy="27" rx="10" ry="6" fill="#fef9c3"/><circle cx="44" cy="14" r="5" fill="#fff"/><circle cx="45.5" cy="14" r="2.6" fill="#1e293b"/><circle cx="51" cy="21" r="2" fill="#a16207"/>',
  '<path d="M20 20 L6 11 L6 29 Z" fill="#fde047"/><path d="M38 1 Q28 8 30 20 Q28 32 38 39 Q52 30 58 20 Q52 10 38 1 Z" fill="#fef3c7" stroke="#facc15" stroke-width="1.2"/>' +
    '<path d="M36 4 L36 36" stroke="#1f2937" stroke-width="3"/><path d="M46 8 L46 32" stroke="#1f2937" stroke-width="2.5"/><circle cx="52" cy="17" r="3.8" fill="#fff"/><circle cx="53.2" cy="17" r="2" fill="#1e293b"/>',
  '<path d="M17 20 L3 8 L7 20 L3 32 Z" fill="#facc15"/><ellipse cx="37" cy="20" rx="23" ry="14" fill="#2563eb"/><path d="M24 12 Q36 6 48 14 Q38 18 30 26 Q26 20 24 12 Z" fill="#1e3a8a"/>' + FE +
    '<path d="M58 23 Q55 26 51 24" stroke="#0f172a" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  '<path d="M24 20 Q6 0 2 6 Q8 20 2 34 Q6 40 24 20 Z" fill="#f472b6" opacity=".85"/><path d="M34 9 Q30 0 22 2 Q28 8 30 12 Z M34 31 Q30 40 22 38 Q28 32 30 28 Z" fill="#ec4899" opacity=".8"/>' +
    '<ellipse cx="40" cy="20" rx="18" ry="10" fill="#a855f7"/>' + FE + '<path d="M58 22 Q55 25 51 23" stroke="#3b0764" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
];
PECES.push(
  '<path d="M21 20 Q6 3 1 9 Q8 20 1 31 Q6 37 21 20 Z" fill="#fb923c"/><ellipse cx="40" cy="21" rx="19" ry="13" fill="#f59e0b"/><path d="M33 9 Q40 0 48 9 Z" fill="#fb923c"/><path d="M38 30 Q42 38 46 31 Z" fill="#fb923c"/>' + FE +
    '<path d="M58 24 Q55 27 51 25" stroke="#7c2d12" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  '<path d="M13 22 L1 13 L4 22 L1 31 Z" fill="#78716c"/><ellipse cx="36" cy="22" rx="25" ry="11" fill="#a8a29e"/><ellipse cx="38" cy="27" rx="18" ry="5" fill="#e7e5e4"/><path d="M30 12 L36 6 L40 12 Z" fill="#78716c"/>' +
    '<circle cx="50" cy="18" r="3.4" fill="#fff"/><circle cx="51" cy="18" r="1.8" fill="#1e293b"/><path d="M58 24 Q62 30 63 36 M57 25 Q60 32 59 38 M58 22 Q63 22 64 26" stroke="#44403c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  '<path d="M15 20 L2 9 L5 20 L2 31 Z" fill="#f472b6"/><ellipse cx="36" cy="20" rx="23" ry="14" fill="#14b8a6"/><path d="M26 10 Q30 20 26 30 M34 8 Q38 20 34 32 M42 9 Q45 20 42 31" stroke="#0f766e" stroke-width="1.5" fill="none"/>' +
    '<path d="M30 6 Q36 0 44 7 Z" fill="#f472b6"/><path d="M57 16 Q64 20 57 25 Z" fill="#fde68a"/>' + FE,
  '<path d="M27 6 L31 0 L38 5 Z" fill="#64748b"/><path d="M27 34 L31 40 L38 35 Z" fill="#64748b"/><path d="M18 11 Q12 20 18 29 Z" fill="#64748b"/><circle cx="34" cy="20" r="17" fill="#94a3b8"/>' +
    '<path d="M24 12 Q34 20 24 28" stroke="#cbd5e1" stroke-width="2" fill="none"/><circle cx="44" cy="15" r="4" fill="#fff"/><circle cx="45.2" cy="15" r="2.1" fill="#1e293b"/><circle cx="49" cy="22" r="1.6" fill="#475569"/>',
  '<path d="M9 20 L1 10 L3 20 L1 30 Z" fill="#1e3a8a"/><path d="M6 20 Q18 9 40 11 Q50 13 52 20 Q50 27 40 29 Q18 31 6 20 Z" fill="#1d4ed8"/><path d="M12 22 Q26 28 46 24 Q30 27 12 22 Z" fill="#bfdbfe"/>' +
    '<path d="M22 12 L28 3 L32 11 Z" fill="#1e3a8a"/><path d="M50 18.5 L63.5 20 L50 21.5 Z" fill="#334155"/><circle cx="44" cy="17" r="3.4" fill="#fff"/><circle cx="45" cy="17" r="1.8" fill="#1e293b"/>'
);
var PNOM = ['Pez payaso', 'Pez globo', 'Pez ángel', 'Pez cirujano', 'Pez betta', 'Pez dorado', 'Pez gato', 'Pez loro', 'Pez luna', 'Pez espada'];
function fishSVG(i){ return '<svg viewBox="0 0 64 40" width="92" height="58" aria-hidden="true">' + PECES[i] + '</svg>'; }
function peces(ar){
  var N = PECES.length, W = ar.clientWidth || 340, H = ar.clientHeight || 380, caught = 0, last = 0, fishes = [];
  var k = !S.set.ani ? 0 : (S.set.red ? .5 : 1);
  ar.innerHTML = pic('assets/img/fondo_peces', '').replace('class="pic"', 'class="pic bg"') +
    '<div id="pc" class="pc">Pececitos felices: 0 de ' + N + '</div>';
  ar.style.background = 'linear-gradient(#7dd3fc,#0369a1)';
  function target(f){ f.tx = Math.random() * (W - 96); f.ty = 46 + Math.random() * (H - 130); }
  function burst(f){
    if (calm()) return;
    for (var q = 0; q < 4; q++) {
      var bu = document.createElement('span'); bu.className = 'bub';
      bu.style.left = (f.x + 40 + Math.random() * 24) + 'px'; bu.style.top = (f.y + 10) + 'px'; ar.appendChild(bu);
      var an = bu.animate([{ transform: 'translateY(0)', opacity: .9 }, { transform: 'translateY(-' + (50 + Math.random() * 40) + 'px)', opacity: 0 }], { duration: 900 + q * 120, easing: 'ease-out' });
      an.onfinish = (function(el){ return function(){ el.remove(); }; })(bu);
    }
  }
  for (var i = 0; i < N; i++) (function(i){
    var el = document.createElement('button');
    el.className = 'fish'; el.setAttribute('aria-label', PNOM[i]);
    el.innerHTML = '<span class="fi">' + fishSVG(i) + '</span>';
    var f = { el: el, fi: el.firstChild, x: Math.random() * (W - 96), y: 46 + Math.random() * (H - 130), sp: 38 + i * 14, dir: 1, ph: Math.random() * 6, done: 0 };
    f.sp = 34 + (i % 5) * 12 + Math.random() * 10;
    target(f); fishes.push(f); ar.appendChild(el);
    el.style.transform = 'translate(' + f.x + 'px,' + f.y + 'px)';
    el.onclick = function(){
      snd('sfx_pez'); burst(f);
      if (!calm()) f.fi.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 700, easing: 'ease-in-out' });
      if (f.done) return;
      f.done = 1; caught++; el.insertAdjacentHTML('beforeend', '<span class="hrt">💗</span>');
      $('#pc').textContent = 'Pececitos felices: ' + caught + ' de ' + N;
      if (caught === N) { cancelAnimationFrame(S.raf); setTimeout(function(){ win(ar, '¡Los ' + N + ' pececitos están felices!'); }, 900); }
    };
  })(i);
  function frame(ts){
    if (!ar.isConnected) return;
    var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    fishes.forEach(function(f){
      var dx = f.tx - f.x, dy = f.ty - f.y, d = Math.hypot(dx, dy);
      if (d < 6) target(f);
      else {
        var v = f.sp * k * dt; f.x += dx / d * v; f.y += dy / d * v;
        if (Math.abs(dx) > 4) { var nd = dx > 0 ? 1 : -1; if (nd !== f.dir) { f.dir = nd; f.fi.style.transform = 'scaleX(' + nd + ')'; } }
      }
      f.el.style.transform = 'translate(' + f.x + 'px,' + (f.y + (k ? Math.sin(ts / 600 + f.ph) * 4 : 0)) + 'px)';
    });
    S.raf = requestAnimationFrame(frame);
  }
  S.raf = requestAnimationFrame(frame);
}

function pzGallery(ar){
  S.pzv = 0;
  var h = '<div class="cen"><div class="pzhd">Elige una imagen</div>';
  [['4 piezas', 0], ['6 piezas', 3], ['9 piezas', 6]].forEach(function(f){
    h += '<div class="pzrow"><span class="pzlab">' + f[0] + '</span><div class="pzgal">';
    for (var i = f[1] + 1; i <= f[1] + 3; i++) h += '<button data-pz="' + i + '" aria-label="Rompecabezas ' + i + ', ' + f[0] + '">' + pic('assets/img/rompecabezas' + i + '_m', '🧩') + '</button>';
    h += '</div></div>';
  });
  ar.innerHTML = h + '</div>';
  ar.querySelectorAll('[data-pz]').forEach(function(b){ b.onclick = function(){ snd('sfx_boton'); pzLoad(ar, +b.dataset.pz); }; });
}
function pzLoad(ar, num){
  var i = 0, base = 'assets/img/rompecabezas' + num, R = PZ[num - 1][0], C = PZ[num - 1][1];
  (function tryNext(){
    if (i >= EXT.length) return pzPlay(ar, num, R, C, placeholder(num));
    var im = new Image();
    im.onload = function(){ pzPlay(ar, num, R, C, im.src, im); };
    im.onerror = function(){ i++; tryNext(); };
    im.src = base + '.' + EXT[i];
  })();
}
function placeholder(num){
  var c = document.createElement('canvas'); c.width = c.height = 600; var x = c.getContext('2d');
  var g = x.createLinearGradient(0, 0, 600, 600);
  var P = [['#ffd180','#ff8a65'],['#b2ebf2','#4dd0e1'],['#c5e1a5','#66bb6a'],['#f8bbd0','#ec407a'],['#d1c4e9','#7e57c2'],['#fff59d','#fbc02d'],['#b3e5fc','#29b6f6'],['#ffccbc','#ff7043'],['#dcedc8','#9ccc65']][(num - 1) % 9];
  g.addColorStop(0, P[0]); g.addColorStop(1, P[1]); x.fillStyle = g; x.fillRect(0, 0, 600, 600);
  x.font = '260px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(['🦖','🐠','🌈','🦋','🐱','🌳','🚀','🐢','🍓'][(num - 1) % 9], 300, 260);
  x.font = 'bold 90px sans-serif'; x.fillStyle = 'rgba(255,255,255,.9)'; x.fillText('' + num, 300, 500);
  return c.toDataURL('image/png');
}
function pzSide(p, A, B, s, T){
  if (!s) return p.lineTo(B[0], B[1]);
  var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, m = L / 2;
  var q = [[-.09,0],[-.05,.09],[-.21,.12],[-.19,.22],[-.17,.32],[.17,.32],[.19,.22],[.21,.12],[.05,.09],[.09,0]].map(function(o){
    return [A[0] + ux * (m + o[0] * T) + uy * s * o[1] * T, A[1] + uy * (m + o[0] * T) - ux * s * o[1] * T];
  });
  p.lineTo(q[0][0], q[0][1]);
  for (var k = 1; k < 10; k += 3) p.bezierCurveTo(q[k][0], q[k][1], q[k + 1][0], q[k + 1][1], q[k + 2][0], q[k + 2][1]);
  p.lineTo(B[0], B[1]);
}
function pzPath(pw, ph, M, T, e){
  var p = new Path2D(), P = [[M, M], [M + pw, M], [M + pw, M + ph], [M, M + ph]];
  p.moveTo(M, M);
  for (var k = 0; k < 4; k++) pzSide(p, P[k], P[(k + 1) % 4], e[k], T);
  p.closePath(); return p;
}
function pzPlay(ar, num, R, C, src, im){
  if (!im) { im = new Image(); im.onload = function(){ pzPlay(ar, num, R, C, src, im); }; im.src = src; return; }
  S.pzv = 1;
  ar.innerHTML = '<div class="pzwrap cen"><div class="pzb" id="pzb"></div>' +
    '<p class="pzmsg">Arrastra cada pieza a su lugar · <span id="pzc">0</span> de ' + (R * C) + '</p></div>';
  var bd = $('#pzb'), W = bd.clientWidth, H = Math.max(240, ar.clientHeight - 76), land = W > H * 1.3, a = im.naturalWidth / im.naturalHeight;
  bd.style.height = H + 'px';
  var fH = land ? Math.min(H - 24, (W * .5 - 24) / a) : Math.min(H * .5, (W - 24) / a), fW = fH * a, fx = land ? 12 : (W - fW) / 2, fy = 12;
  var pw = fW / C, ph = fH / R, T = Math.min(pw, ph), M = Math.ceil(T * .3) + 3, cw = pw + 2 * M, ch = ph + 2 * M;
  var d = Math.min(2, devicePixelRatio || 1), hit = document.createElement('canvas').getContext('2d');
  bd.innerHTML = '<div class="pzf" style="left:' + fx + 'px;top:' + fy + 'px;width:' + fW + 'px;height:' + fH + 'px"><img alt="" src="' + src + '"></div>' +
    '<img class="pzfull" alt="Modelo" src="' + src + '" style="left:' + fx + 'px;top:' + fy + 'px;width:' + fW + 'px;height:' + fH + 'px">';
  var rnd = function(){ return Math.random() < .5 ? 1 : -1; }, Hz = [], Vt = [], P = [], r, c, z = 10, done = 0, locked = false;
  for (r = 0; r < R; r++) { Hz.push([]); Vt.push([]); for (c = 0; c < C; c++) { Hz[r].push(rnd()); Vt[r].push(rnd()); } }
  var top = fy + fH + 10, yMin = top + ch <= H ? top - M / 2 : 0;
  for (r = 0; r < R; r++) for (c = 0; c < C; c++) {
    var e = [r ? -Vt[r - 1][c] : 0, c < C - 1 ? Hz[r][c] : 0, r < R - 1 ? Vt[r][c] : 0, c ? -Hz[r][c - 1] : 0];
    var path = pzPath(pw, ph, M, T, e), cv = document.createElement('canvas'), x = cv.getContext('2d');
    cv.width = cw * d; cv.height = ch * d; cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    cv.setAttribute('aria-label', 'Pieza');
    x.scale(d, d); x.save(); x.clip(path); x.drawImage(im, M - c * pw, M - r * ph, fW, fH); x.restore();
    x.lineWidth = 2.5; x.strokeStyle = 'rgba(0,0,0,.25)'; x.stroke(path);
    x.lineWidth = 1.2; x.strokeStyle = 'rgba(255,255,255,.9)'; x.stroke(path);
    var pc = { cv: cv, path: path, tx: fx + c * pw - M, ty: fy + r * ph - M, ok: false,
               x: land ? W * .5 + Math.random() * Math.max(0, W * .5 - cw) : Math.random() * (W - cw), y: land ? Math.random() * Math.max(0, H - ch) : yMin + Math.random() * Math.max(0, H - ch - yMin) };
    cv.style.left = pc.x + 'px'; cv.style.top = pc.y + 'px'; cv.style.zIndex = ++z;
    bd.appendChild(cv); P.push(pc);
  }
  var drag = null, ox = 0, oy = 0;
  function pt(ev){ var b = bd.getBoundingClientRect(); return [ev.clientX - b.left, ev.clientY - b.top]; }
  bd.addEventListener('pointerdown', function(ev){
    if (locked) return;
    var q = pt(ev), best = null;
    P.forEach(function(p){
      if (!p.ok && hit.isPointInPath(p.path, q[0] - p.x, q[1] - p.y) && (!best || +p.cv.style.zIndex > +best.cv.style.zIndex)) best = p;
    });
    if (!best) return;
    ev.preventDefault(); drag = best; ox = q[0] - best.x; oy = q[1] - best.y;
    best.cv.style.zIndex = ++z; best.cv.classList.add('drag'); bd.setPointerCapture(ev.pointerId);
  });
  bd.addEventListener('pointermove', function(ev){
    if (!drag) return;
    var q = pt(ev);
    drag.x = Math.max(-M, Math.min(W - cw + M, q[0] - ox)); drag.y = Math.max(-M, Math.min(H - ch + M, q[1] - oy));
    drag.cv.style.left = drag.x + 'px'; drag.cv.style.top = drag.y + 'px';
  });
  function drop(){
    if (!drag) return;
    var p = drag; drag = null; p.cv.classList.remove('drag');
    if (Math.hypot(p.x - p.tx, p.y - p.ty) > T * .3 + 6) return;
    p.ok = true; p.x = p.tx; p.y = p.ty; p.cv.classList.add('ok'); p.cv.style.zIndex = 1;
    p.cv.style.left = p.x + 'px'; p.cv.style.top = p.y + 'px'; snd('sfx_pieza');
    $('#pzc').textContent = ++done;
    if (done === P.length) {
      locked = true; bd.classList.add('done'); snd('sfx_rompe_ok');
      setTimeout(function(){ cnt.pz++; win(ar, '¡Armaste la imagen!'); }, 1200);
    }
  }
  bd.addEventListener('pointerup', drop); bd.addEventListener('pointercancel', drop);
}

var SB_URL = String(window.SUPABASE_URL || '').replace(/\/+$/, ''), SB_KEY = window.SUPABASE_KEY || '';
var NUBE = !!(SB_URL && SB_KEY), SB = null, BUCKET = 'materiales';
function sbCargar(){
  if (SB) return SB;
  return SB = new Promise(function(res, rej){
    var t = document.createElement('script');
    t.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
    t.onload = function(){
      try { res(supabase.createClient(SB_URL, SB_KEY, { auth: { storage: window.localStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })); }
      catch (x) { SB = null; rej(x); }
    };
    t.onerror = function(){ SB = null; rej(new Error('No hay conexión con el servicio de cuentas. Revisa tu internet.')); };
    document.head.appendChild(t);
  });
}
function sbMsg(x){
  var m = String((x && x.message) || ''), c = (x && x.code) || '';
  if (c === 'invalid_credentials' || /invalid login/i.test(m)) return 'Correo o contraseña incorrectos.';
  if (/rate limit/i.test(m) || c === 'over_email_send_rate_limit' || c === 'over_request_rate_limit') return 'Se enviaron demasiados correos o intentos. Espera unos minutos e inténtalo de nuevo.';
  if (c === 'weak_password' || /at least \d+ char/i.test(m)) return 'La contraseña debe tener al menos 6 caracteres.';
  if (c === 'user_already_exists' || /already registered/i.test(m)) return 'Ya existe una cuenta con ese correo. Usa la pestaña "Entrar".';
  if (c === 'email_address_invalid' || /invalid.*email|email.*invalid/i.test(m)) return 'Ese correo no es válido.';
  if (/failed to fetch|network/i.test(m)) return 'No hay conexión a internet.';
  return 'No se pudo completar. Inténtalo de nuevo.';
}
function dominioOk(em){
  var D = window.APPMIA_DOMINIOS || []; if (!D.length) return true;
  return D.some(function(x){ x = String(x).toLowerCase().replace(/^@/, ''); return em.slice(-(x.length + 1)) === '@' + x; });
}
function volverUrl(){ return location.origin + location.pathname; }
async function nubeAcceso(reg, em, pw, meta){
  var sb = await sbCargar();
  if (reg) {
    var r = await sb.auth.signUp({ email: em, password: pw, options: { emailRedirectTo: volverUrl(), data: meta || {} } });
    if (r.error) throw new Error(sbMsg(r.error));
    if (r.data.user && r.data.user.identities && r.data.user.identities.length === 0) throw new Error(sbMsg({ code: 'user_already_exists' }));
    if (r.data.session) return null;
    return 'Te enviamos un correo a ' + em + '. Abre el mensaje, toca el enlace para confirmar y luego entra con tu correo y contraseña. Revisa también la carpeta de spam.';
  }
  var s2 = await sb.auth.signInWithPassword({ email: em, password: pw });
  if (s2.error) {
    if (s2.error.code === 'email_not_confirmed' || /not confirmed/i.test(s2.error.message || '')) {
      try { await sb.auth.resend({ type: 'signup', email: em, options: { emailRedirectTo: volverUrl() } }); } catch (x) {}
      throw new Error('Aún no confirmas tu correo. Te reenviamos el enlace: ábrelo y vuelve a entrar.');
    }
    throw new Error(sbMsg(s2.error));
  }
  return null;
}
async function olvido(){
  var em = ($('#em') || {}).value.trim().toLowerCase(), e = $('#lerr');
  if (!/^\S+@\S+\.\S+$/.test(em)) { e.className = 'lerr'; e.textContent = 'Escribe tu correo arriba y vuelve a tocar "¿Olvidaste tu contraseña?"'; $('#em').focus(); return; }
  try {
    var sb = await sbCargar(), r = await sb.auth.resetPasswordForEmail(em, { redirectTo: volverUrl() });
    if (r.error && /rate limit/i.test(r.error.message || '')) { e.className = 'lerr'; e.textContent = sbMsg(r.error); return; }
  } catch (x) { e.className = 'lerr'; e.textContent = x.message || sbMsg(x); return; }
  e.className = 'lok'; e.textContent = 'Si ese correo tiene cuenta, le enviamos un enlace para crear una contraseña nueva.';
}
function nuevaClave(){
  return '<header><h1>Nueva contraseña</h1></header><main><form class="card" id="nf" novalidate>' +
    '<label class="lab" for="np">Nueva contraseña (mínimo 6 caracteres)</label><input class="field" id="np" type="password" autocomplete="new-password">' +
    '<label class="lab" for="np2">Repite la contraseña</label><input class="field" id="np2" type="password" autocomplete="new-password">' +
    '<div id="lerr" class="lerr" role="alert"></div><button class="btn" type="submit" id="nsub">Guardar contraseña</button></form></main>';
}
async function guardarClave(e){
  e.preventDefault();
  var p1 = $('#np').value, q = $('#lerr');
  function err(m){ q.className = 'lerr'; q.textContent = m; }
  if (p1.length < 6) return err('La contraseña debe tener al menos 6 caracteres.');
  if (p1 !== $('#np2').value) return err('Las contraseñas no coinciden.');
  $('#nsub').disabled = true;
  try {
    var sb = await sbCargar(), r = await sb.auth.updateUser({ password: p1 });
    if (r.error) throw r.error;
    S.scr = 'home'; S.t = null; S.acc = 'cargando'; draw();
    try { history.replaceState(null, '', location.pathname); } catch (x) {}
    cargarPerfil();
  } catch (x) { $('#nsub').disabled = false; err(sbMsg(x)); }
}
var VINO = /access_token|type=(signup|recovery|magiclink)|error_code|error_description/.test((location.hash || '') + (location.search || ''));
var RECUP = /type=recovery/.test(location.hash || '');
async function cargarPerfil(){
  if (S.cp) return; S.cp = 1;
  try {
    var sb = await sbCargar(), ses = (await sb.auth.getSession()).data.session;
    if (!ses) { S.t = null; S.acc = 'fuera'; return; }
    var r = await sb.from('perfiles').select('*').eq('id', ses.user.id).maybeSingle();
    if (r.error) throw r.error;
    var p = r.data || { estado: 'aprobado', rol: 'docente' };
    S.t = { email: ses.user.email, id: ses.user.id, rol: p.rol, nombre: p.nombre || '', salon: p.salon || '', estado: p.estado };
    S.acc = p.estado === 'rechazado' ? 'rechazada' : 'ok';
    if (S.acc === 'ok') {
      await pinSync(sb, ses.user.id);
      S.mode = 'nino'; S.scr = 'home';
      alInit();
    }
  } catch (x) { S.acc = 'error'; }
  finally { S.cp = 0; draw(); }
}
async function cargarCuentas(){
  if (!NUBE || !S.t || S.t.rol !== 'directora') return;
  try { var sb = await sbCargar(), r = await sb.from('perfiles').select('*').order('nombre', { ascending: true }); if (!r.error) S.sol = r.data || []; } catch (x) {}
  if (S.mode === 'doc') draw();
}
function cuentas(){
  if (!S.t || S.t.rol !== 'directora') return '';
  function clave(x){
    if (S.rpok && S.rpok.id === x.id) return '<div class="lok" role="status" style="margin-top:10px">Contraseña temporal: <b>' + esc(S.rpok.pw) + '</b><br>Entrégasela a ' + esc(x.nombre || 'el docente') + '. Con ella ya puede entrar.</div>';
    if (S.rp === x.id) return '<div style="margin-top:10px"><label class="lab" for="rpw">Contraseña temporal (mínimo 6 caracteres)</label>' +
      '<input class="field" id="rpw" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="' + esc(S.rpv || '') + '">' +
      '<div class="lerr" role="alert">' + esc(S.rpe || '') + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="sm" data-rps="' + esc(x.id) + '">Guardar</button><button class="sm g" data-rpc="1">Cancelar</button></div></div>';
    return '';
  }
  return '<h3>Cuentas de la escuela (' + S.sol.length + ')</h3>' + (S.sol.length ? S.sol.map(function(x){
    return '<div class="card"><div class="t"><b style="display:block">' + esc(x.nombre || '(sin nombre)') + (x.rol === 'directora' ? ' <span class="tag">Directora</span>' : '') + '</b>' +
      '<small>' + esc(x.email) + ' · ' + esc(x.salon || 'sin salón') + '</small></div>' +
      (x.id !== S.t.id ? '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="sm g" data-rp="' + esc(x.id) + '">🔑 Nueva contraseña</button></div>' : '') + clave(x) + '</div>';
  }).join('') : '<div class="card" style="text-align:center;color:var(--soft)">Cargando cuentas…</div>');
}
function genClave(){
  var a = 'abcdefghjkmnpqrstuvwxyz23456789', b = new Uint8Array(8), o = '', i;
  try { crypto.getRandomValues(b); } catch (e) { for (i = 0; i < 8; i++) b[i] = Math.floor(Math.random() * 256); }
  for (i = 0; i < 8; i++) o += a[b[i] % a.length];
  return o;
}
async function restablecer(id){
  var pw = (($('#rpw') || {}).value || '').trim();
  S.rpv = pw;
  if (pw.length < 6) { S.rpe = 'Escribe al menos 6 caracteres.'; draw(); return; }
  S.rpe = 'Guardando…'; draw();
  try {
    var sb = await sbCargar(), r = await sb.functions.invoke('restablecer-clave', { body: { id: id, password: pw } });
    if (r.error) {
      var m = '';
      try { var j = await r.error.context.json(); m = j && j.error; } catch (x) {}
      throw new Error(m || (/not found|404/i.test(r.error.message || '') ? 'La función de contraseñas aún no está instalada en Supabase.' : 'No se pudo cambiar la contraseña. Inténtalo de nuevo.'));
    }
    if (r.data && r.data.error) throw new Error(r.data.error);
    S.rpok = { id: id, pw: pw }; S.rp = ''; S.rpe = ''; S.rpv = '';
  } catch (x) { S.rpe = x.message || 'No se pudo cambiar la contraseña.'; }
  draw();
}
function sbInit(){
  if (!NUBE) return;
  setTimeout(function(){ if (S.acc === 'cargando') { S.acc = 'fuera'; draw(); } }, 8000);
  sbCargar().then(function(sb){
    sb.auth.onAuthStateChange(function(ev, ses){
      setTimeout(function(){
        if (ev === 'PASSWORD_RECOVERY') { S.scr = 'nueva'; S.acc = 'fuera'; draw(); }
        else if (ev === 'SIGNED_OUT') { if (S.acc !== 'fuera') { S.t = null; S.acc = 'fuera'; draw(); } }
        else if ((ev === 'SIGNED_IN' || ev === 'INITIAL_SESSION') && !RECUP) {
          if (ses) { if (!S.t) cargarPerfil(); }
          else if (ev === 'INITIAL_SESSION') { S.acc = 'fuera'; draw(); }
        }
      }, 0);
    });
    if (/error_code|error_description/.test(location.hash || '')) {
      S.acc = 'fuera'; S.lmode = 'in'; S.lmsg = 'Ese enlace venció o ya se usó. Intenta entrar con tu correo y contraseña; si aún no confirmas, te enviaremos otro enlace.'; draw();
      try { history.replaceState(null, '', location.pathname); } catch (x) {}
    } else if (VINO) { try { history.replaceState(null, '', location.pathname); } catch (x) {} }
  }).catch(function(){ S.acc = 'fuera'; draw(); });
}
async function nubeFiles(){
  try {
    var sb = await sbCargar(), r = await sb.from('materiales').select('*').order('creado', { ascending: false });
    if (r.error) throw r.error;
    var L = r.data || [], urls = {};
    if (L.length) {
      var u = await sb.storage.from(BUCKET).createSignedUrls(L.map(function(x){ return x.ruta; }), 3600);
      (u.data || []).forEach(function(q){ urls[q.path] = q.signedUrl; });
    }
    S.files = L.map(function(x){ return { id: x.id, name: x.nombre, type: x.tipo, size: x.tamano, ruta: x.ruta, url: urls[x.ruta] || '' }; });
  } catch (x) { S.up = 'No se pudieron cargar tus archivos. Revisa tu internet e inicia sesión de nuevo si persiste.'; }
  draw();
}
async function nubeSubir(f){
  var sb = await sbCargar(), ses = (await sb.auth.getSession()).data.session;
  if (!ses) throw new Error('Tu sesión venció. Cierra sesión y vuelve a entrar.');
  var ruta = ses.user.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '.' + (ext(f) || 'bin');
  var up = await sb.storage.from(BUCKET).upload(ruta, f, { contentType: f.type || 'application/octet-stream', upsert: false });
  if (up.error) throw up.error;
  var ins = await sb.from('materiales').insert({ nombre: f.name, tipo: f.type || '', tamano: f.size, ruta: ruta });
  if (ins.error) { await sb.storage.from(BUCKET).remove([ruta]); throw ins.error; }
}
async function nubeBorrar(f){
  var sb = await sbCargar();
  await sb.storage.from(BUCKET).remove([f.ruta]);
  await sb.from('materiales').delete().eq('id', f.id);
}
function login(){
  var reg = S.lmode === 'reg';
  return '<header><h1>Mi Mundo de Calma 🌈</h1></header><p class="sub">Acceso para docentes</p><main>' +
    '<div class="lseg" role="group" aria-label="Elegir acción"><button type="button" data-lm="in" aria-pressed="' + !reg + '">Entrar</button>' +
    '<button type="button" data-lm="reg" aria-pressed="' + reg + '">Crear cuenta</button></div>' +
    '<form class="card" id="lf" novalidate>' +
    (reg ? '<label class="lab" for="nm">Nombre completo</label><input class="field" id="nm" autocomplete="name" maxlength="80" placeholder="Ana Pérez" value="' + esc(S.lnm || '') + '">' +
           '<label class="lab" for="sl">Salón o grado</label><input class="field" id="sl" maxlength="40" placeholder="3.º A" value="' + esc(S.lsl || '') + '">' : '') +
    '<label class="lab" for="em">Correo</label>' +
    '<input class="field" id="em" type="email" inputmode="email" autocomplete="email" autocapitalize="none" placeholder="nombre@escuela.edu" value="' + esc(S.lemail || '') + '">' +
    '<label class="lab" for="pw">Contraseña' + (reg ? ' (mínimo 6 caracteres)' : '') + '</label>' +
    '<div class="pwrow"><input class="field" id="pw" type="password" autocomplete="' + (reg ? 'new-password' : 'current-password') + '">' +
    '<button type="button" class="sm g" id="showpw" aria-pressed="false" aria-label="Mostrar contraseña">Ver</button></div>' +
    (reg ? '<label class="lab" for="pw2">Repite la contraseña</label><input class="field" id="pw2" type="password" autocomplete="new-password">' : '') +
    (NUBE && !reg ? '<button type="button" class="lnk" id="forgot">¿Olvidaste tu contraseña?</button>' : '') +
    '<div id="lerr" class="' + (S.lmsg ? 'lok' : 'lerr') + '" role="alert">' + esc(S.lmsg || '') + '</div>' +
    '<button class="btn" type="submit" id="lsub">' + (reg ? 'Crear cuenta' : 'Entrar') + '</button></form>' +
    (NUBE ? '' : '<p class="sub">Las cuentas se guardan en este dispositivo.</p>') + '</main>';
}
function gate(){
  if (S.scr === 'nueva') return nuevaClave();
  var hd = '<header><h1>Mi Mundo de Calma 🌈</h1></header>';
  if (S.acc === 'cargando') return cargando();
  if (S.acc === 'rechazada') return hd + '<main><div class="card gcen"><div class="mascot">🚫</div><h2>Sin acceso</h2>' +
    '<p>Tu cuenta no tiene acceso a la app. Habla con la directora si crees que es un error.</p>' +
    '<button class="btn sec" data-m="out">Cerrar sesión</button></div></main>';
  if (S.acc === 'error') return hd + '<main><div class="card gcen"><div class="mascot">📡</div><h2>Sin conexión</h2><p>No pudimos conectar. Revisa tu internet e inténtalo otra vez.</p>' +
    '<button class="btn" id="chk">Reintentar</button><button class="btn sec" data-m="out" style="margin-top:8px">Cerrar sesión</button></div></main>';
  return login();
}
function idb(){
  return new Promise(function(res, rej){
    var r = indexedDB.open('appmia', 2);
    r.onupgradeneeded = function(){
      var db = r.result;
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'id', autoIncrement: true }).createIndex('email', 'email');
      if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'email' });
    };
    r.onsuccess = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); };
  });
}
function dbReq(mode, fn, store){
  store = store || 'files';
  return idb().then(function(d){ return new Promise(function(res, rej){
    var q = fn(d.transaction(store, mode).objectStore(store)); q.onsuccess = function(){ res(q.result); }; q.onerror = function(){ rej(q.error); };
  }); });
}
var ITER = 150000;
function toB64(u8){ var s = ''; u8.forEach(function(c){ s += String.fromCharCode(c); }); return btoa(s); }
function fromB64(t){ return Uint8Array.from(atob(t), function(c){ return c.charCodeAt(0); }); }
async function huella(pw, salt, iters){
  if (!window.crypto || !crypto.subtle) throw new Error('Este navegador no permite crear cuentas aquí. Abre la app con Chrome o desde su enlace web (https).');
  var k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: iters }, k, 256));
}
function igual(a, b){ if (a.length !== b.length) return false; var r = 0; for (var i = 0; i < a.length; i++) r |= a[i] ^ b[i]; return r === 0; }
async function registrar(em, pw){
  var ya = await dbReq('readonly', function(st){ return st.get(em); }, 'users');
  if (ya) throw new Error('Ya existe una cuenta con ese correo. Usa la pestaña "Entrar".');
  var salt = crypto.getRandomValues(new Uint8Array(16)), h = await huella(pw, salt, ITER);
  await dbReq('readwrite', function(st){ return st.add({ email: em, salt: toB64(salt), hash: toB64(h), iters: ITER, creada: Date.now() }); }, 'users');
}
var fallos = {};
async function entrar(em, pw){
  var f = fallos[em] || (fallos[em] = { n: 0, hasta: 0 });
  var resta = Math.ceil((f.hasta - Date.now()) / 1000);
  if (resta > 0) throw new Error('Demasiados intentos. Espera ' + resta + ' segundos.');
  var u = await dbReq('readonly', function(st){ return st.get(em); }, 'users');
  var ok = false;
  if (u) ok = igual(await huella(pw, fromB64(u.salt), u.iters), fromB64(u.hash));
  if (!ok) {
    if (++f.n >= 5) { f.n = 0; f.hasta = Date.now() + 30000; throw new Error('Demasiados intentos. Espera 30 segundos.'); }
    throw new Error('Correo o contraseña incorrectos.');
  }
  f.n = 0;
}
async function enviarLogin(e){
  e.preventDefault();
  var reg = S.lmode === 'reg', em = $('#em').value.trim().toLowerCase(), pw = $('#pw').value, btn = $('#lsub');
  S.lemail = em; S.lnm = ($('#nm') || {}).value || ''; S.lsl = ($('#sl') || {}).value || '';
  function err(m, f){ var q = $('#lerr'); q.className = 'lerr'; q.textContent = m; if (f) $(f).focus(); }
  S.lmsg = '';
  if (!/^\S+@\S+\.\S+$/.test(em)) return err('Escribe un correo válido, por ejemplo nombre@escuela.edu', '#em');
  if (!pw) return err('Escribe tu contraseña.', '#pw');
  if (reg && S.lnm.trim().length < 3) return err('Escribe tu nombre completo.', '#nm');
  if (reg && !S.lsl.trim()) return err('Escribe tu salón o grado.', '#sl');
  if (reg && pw.length < 6) return err('La contraseña debe tener al menos 6 caracteres.', '#pw');
  if (reg && pw !== $('#pw2').value) return err('Las contraseñas no coinciden.', '#pw2');
  if (reg && NUBE && !dominioOk(em)) return err('Solo se permiten correos de: ' + (window.APPMIA_DOMINIOS || []).join(', '), '#em');
  btn.disabled = true; btn.textContent = 'Un momento…'; $('#lerr').textContent = '';
  try {
    if (NUBE) {
      var aviso = await nubeAcceso(reg, em, pw, { nombre: S.lnm.trim().slice(0, 80), salon: S.lsl.trim().slice(0, 40) });
      if (aviso) { S.lmsg = aviso; S.lmode = 'in'; draw(); return; }
    } else if (reg) await registrar(em, pw); else await entrar(em, pw);
  } catch (x) {
    btn.disabled = false; btn.textContent = reg ? 'Crear cuenta' : 'Entrar';
    return err(x && x.message ? x.message : 'No se pudo completar. Inténtalo de nuevo.');
  }
  S.lemail = ''; S.lmode = 'in'; S.lmsg = ''; S.lnm = ''; S.lsl = '';
  if (NUBE) { S.acc = 'cargando'; draw(); cargarPerfil(); }
  else { S.t = { email: em, rol: 'docente' }; S.acc = 'ok'; S.mode = 'nino'; S.scr = 'home'; sv('t', em); alInit(); }
}
function loadFiles(){
  if (!S.t) return;
  if (NUBE) return nubeFiles();
  dbReq('readonly', function(st){ return st.index('email').getAll(S.t.email); }).then(function(L){
    S.files = L.sort(function(a, b){ return b.t - a.t; }).map(function(f){ f.url = URL.createObjectURL(f.blob); return f; });
    draw();
  }).catch(function(){ S.up = 'No se pudo abrir el almacenamiento del navegador.'; draw(); });
}
async function pinHash(p){
  var salt = crypto.getRandomValues(new Uint8Array(16));
  try { return { s: toB64(salt), h: toB64(await huella(p + '|' + uidt(), salt, 20000)) }; } catch (e) { return { b: btoa(p + '|' + uidt()) }; }
}
async function pinOk(p){
  var r = null; try { r = JSON.parse(ld('pin_' + uidt()) || 'null'); } catch (e) {}
  if (!r) return false;
  if (r.b) return r.b === btoa(p + '|' + uidt());
  try { return igual(await huella(p + '|' + uidt(), fromB64(r.s), 20000), fromB64(r.h)); } catch (e) { return false; }
}
async function pinSync(sb, uid){
  try {
    var q = await sb.from('pines').select('pin').eq('id', uid).maybeSingle();
    if (q.error) return;
    if (q.data && q.data.pin) sv('pin_' + uid, q.data.pin);
    else { var loc = ld('pin_' + uid); if (loc) await sb.from('pines').upsert({ id: uid, pin: loc }); }
  } catch (e) {}
}
async function pinSube(h){
  try { var sb = await sbCargar(); await sb.from('pines').upsert({ id: S.t.id, pin: h }); } catch (e) {}
}
function abrirDocente(){
  if (!S.t) return;
  S.pin = ''; S.perr = ''; S.pinfails = 0; S.pm = ld('pin_' + uidt()) ? 'entrar' : 'crear1'; S.scr = 'pin'; stopVoz(); draw();
}
function entrarDocente(){
  S.mode = 'doc'; S.scr = 'home'; S.pm = ''; S.pin = ''; S.perr = '';
  cargarCuentas(); loadFiles();
}
function pinScr(){
  var back = '<button class="ib" data-pin="salir" aria-label="Volver">←</button>';
  if (S.pm === 'olvido') return '<header>' + back + '<h1>Restablecer PIN</h1></header><main><form class="card" id="pf" novalidate>' +
    '<p>Escribe la contraseña de tu cuenta para crear un PIN nuevo.</p><label class="lab" for="pwp">Contraseña</label>' +
    '<input class="field" id="pwp" type="password" autocomplete="current-password"><div id="lerr" class="lerr" role="alert"></div>' +
    '<button class="btn" type="submit">Continuar</button></form></main>';
  var T = { crear1: 'Crea tu PIN', crear2: 'Repite tu PIN', entrar: 'Zona del docente' }[S.pm];
  var sub = { crear1: 'Elige 4 números. Los niños no deben conocerlo.', crear2: 'Escríbelo otra vez para confirmar.', entrar: 'Escribe tu PIN de 4 números.' }[S.pm];
  var dots = '', i; for (i = 0; i < 4; i++) dots += '<i class="pd' + (i < S.pin.length ? ' on' : '') + '"></i>';
  var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(function(k){
    return k === '' ? '<span></span>' : '<button type="button" class="pk" data-pin="' + k + '" aria-label="' + (k === '⌫' ? 'Borrar' : k) + '">' + k + '</button>';
  }).join('');
  return '<header>' + back + '<h1>' + T + '</h1></header><p class="sub">' + sub + '</p><main><div class="pdots" aria-live="polite">' + dots + '</div>' +
    '<div class="lerr" role="alert" style="text-align:center">' + esc(S.perr || '') + '</div><div class="pad">' + keys + '</div>' +
    (S.pm === 'entrar' ? '<button class="lnk" type="button" data-pin="olvido" style="margin:12px auto">¿Olvidaste tu PIN?</button>' : '') + '</main>';
}
async function pinKey(k){
  if (k === 'salir') { S.scr = 'home'; S.pm = ''; S.pin = ''; S.perr = ''; draw(); return; }
  if (k === 'olvido') { S.pm = 'olvido'; S.perr = ''; draw(); return; }
  var lock = +ld('pinlock') || 0;
  if (Date.now() < lock) { S.perr = 'Espera ' + Math.ceil((lock - Date.now()) / 1000) + ' segundos.'; draw(); return; }
  S.perr = '';
  if (k === '⌫') S.pin = S.pin.slice(0, -1); else if (S.pin.length < 4) S.pin += k;
  if (S.pin.length < 4) { draw(); return; }
  var p = S.pin; S.pin = '';
  if (S.pm === 'crear1') { S.pin1 = p; S.pm = 'crear2'; draw(); return; }
  if (S.pm === 'crear2') {
    if (p !== S.pin1) { S.pm = 'crear1'; S.perr = 'Los PIN no coinciden. Inténtalo de nuevo.'; draw(); return; }
    var hh = JSON.stringify(await pinHash(p)); sv('pin_' + uidt(), hh); if (NUBE) await pinSube(hh);
    entrarDocente(); return;
  }
  if (await pinOk(p)) { entrarDocente(); return; }
  if (++S.pinfails >= 3) { S.pinfails = 0; sv('pinlock', Date.now() + 30000); S.perr = 'Demasiados intentos. Espera 30 segundos.'; }
  else S.perr = 'PIN incorrecto.';
  draw();
}
async function pinReset(e){
  e.preventDefault();
  var pw = $('#pwp').value, q = $('#lerr');
  if (!pw) { q.textContent = 'Escribe tu contraseña.'; return; }
  try {
    if (NUBE) { var sb = await sbCargar(), r = await sb.auth.signInWithPassword({ email: S.t.email, password: pw }); if (r.error) throw r.error; }
    else await entrar(S.t.email, pw);
  } catch (x) { q.textContent = NUBE ? sbMsg(x) : (x.message || 'Contraseña incorrecta.'); return; }
  S.pm = 'crear1'; S.pin = ''; S.perr = ''; draw();
}

var OFI = /^(pptx?|ppsx?|potx?|docx?|xlsx?)$/;
function ext(f){ return ((f.name || '').split('.').pop() || '').toLowerCase(); }
function kind(f){
  var t = f.type || '';
  if (t.indexOf('image') === 0) return ['img', 'Imagen'];
  if (t.indexOf('video') === 0) return ['vid', 'Video'];
  return ['otro', ({ pdf:'PDF', ppt:'Presentación', pptx:'Presentación', pps:'Presentación', ppsx:'Presentación', potx:'Presentación', doc:'Documento', docx:'Documento', xls:'Hoja de cálculo', xlsx:'Hoja de cálculo', txt:'Texto' })[ext(f)] || 'Archivo'];
}
function proyectable(f){ var e = ext(f); return kind(f)[0] !== 'otro' || e === 'pdf' || e === 'txt' || OFI.test(e); }
function thumb(f){
  var k = kind(f)[0], e = ext(f);
  if (k === 'img') return '<img alt="" src="' + f.url + '">';
  if (k === 'vid') return '<video src="' + f.url + '" muted preload="metadata"></video>';
  return e === 'pdf' ? '📕' : /^(pptx?|ppsx?|potx)$/.test(e) ? '📊' : /^docx?$/.test(e) ? '📝' : /^xlsx?$/.test(e) ? '📈' : '📄';
}
function sz(b){ return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
function alPanel(){
  return '<h3>Alumno en esta tablet</h3><div class="card row"><span class="mini">' + (S.al ? avatar(S.al.avatar) : '🙂') + '</span><span class="t">' +
    (S.al ? esc(S.al.nombre) + '<small style="display:block;color:var(--soft)">⭐ ' + S.al.estrellas + '</small>' : 'Nadie todavía') +
    '</span><button class="sm" data-m="otro">Otro niño</button></div>';
}
function panel(){
  return '<header><h1>Mi profe</h1></header><p class="sub">Sube, muestra y descarga los materiales de tu clase</p><main>' +
    '<label class="drop" id="dz"><input type="file" id="up" multiple accept="image/*,video/*,.pdf,.ppt,.pptx,.pps,.ppsx,.doc,.docx,.xls,.xlsx,.txt"><span style="font-size:30px">📎</span><br>Toca para elegir o arrastra aquí tus archivos<br>' +
    '<small style="font-weight:600;color:var(--soft)">Máximo 50 MB por archivo. Imágenes, videos, PDF, PowerPoint, Word y Excel se proyectan en pantalla. PowerPoint y Word hasta 10 MB; si pesa más, guárdalo como PDF.</small></label>' +
    (S.up ? '<div class="card" role="status" style="margin-top:12px;font-weight:800">' + esc(S.up) + '</div>' : '') +
    '<h3>Mis materiales (' + S.files.length + ')</h3>' +
    (S.files.length ? S.files.map(function(f, i){
      return '<div class="card"><div class="file"><div class="th">' + thumb(f) + '</div><div class="t"><b>' + esc(f.name) + '</b><small>' + kind(f)[1] + ' · ' + sz(f.size) + '</small></div></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' + (proyectable(f) ? '<button class="sm" data-p="' + i + '">▶ Proyectar</button>' : '') +
        '<button class="sm g" data-dl="' + i + '">⬇ Descargar</button><button class="sm g" data-d="' + i + '" aria-label="Eliminar">🗑</button></div></div>';
    }).join('') : '<div class="card" style="text-align:center;color:var(--soft)">Aún no hay materiales. Sube tu primer archivo.</div>') +
    alPanel() + cuentas() + '</main>';
}
async function upl(L){
  var ok = 0, i = 0;
  for (var f of L) {
    i++;
    if (f.size > 52428800) { S.up = '«' + f.name + '» pesa más de 50 MB'; draw(); continue; }
    S.up = 'Subiendo ' + i + ' de ' + L.length + ': ' + f.name; draw();
    try { if (NUBE) await nubeSubir(f); else await dbReq('readwrite', function(st){ return st.add({ email: S.t.email, name: f.name, type: f.type, size: f.size, blob: f, t: Date.now() }); }); ok++; }
    catch (e) { S.up = (e && e.message && /sesión/.test(e.message)) ? e.message : 'No se pudo guardar «' + f.name + '»'; draw(); return; }
  }
  S.up = ok ? '✓ ' + ok + ' archivo' + (ok > 1 ? 's' : '') + ' guardado' + (ok > 1 ? 's' : '') : S.up;
  loadFiles();
}
var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/', pdfP = null;
function pdfLib(){
  if (window.pdfjsLib && pdfjsLib.GlobalWorkerOptions.workerSrc) return Promise.resolve(pdfjsLib);
  return pdfP || (pdfP = new Promise(function(res, rej){
    var t = document.createElement('script'); t.src = PDFJS + 'pdf.min.js';
    t.onerror = function(){ pdfP = null; rej(new Error('lib')); };
    t.onload = function(){
      fetch(PDFJS + 'pdf.worker.min.js').then(function(r){ if (!r.ok) throw 0; return r.blob(); }).then(function(b){
        pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(b); res(pdfjsLib);
      }).catch(function(){ pdfP = null; rej(new Error('worker')); });
    };
    document.head.appendChild(t);
  }));
}
var PV = null;
async function pdfDraw(){
  var v = PV; if (!v) return; var tk = ++v.tk;
  var pg = await v.doc.getPage(v.n); if (PV !== v || tk !== v.tk) return;
  var box = $('#pdfc'), vp0 = pg.getViewport({ scale: 1 });
  var fit = Math.min((box.clientWidth - 16) / vp0.width, (box.clientHeight - 16) / vp0.height) || 1, sc = fit * v.z, dpr = window.devicePixelRatio || 1;
  var vp = pg.getViewport({ scale: sc * dpr }), cv = document.createElement('canvas');
  cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height); cv.style.width = Math.floor(vp.width / dpr) + 'px'; cv.style.height = Math.floor(vp.height / dpr) + 'px';
  await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
  if (PV !== v || tk !== v.tk) return;
  box.innerHTML = ''; box.appendChild(cv);
  $('#pnum').textContent = v.n + ' / ' + v.doc.numPages;
  $('#pprev').disabled = v.n <= 1; $('#pnext').disabled = v.n >= v.doc.numPages;
}
function pdfGo(d){ if (!PV) return; var n = Math.min(PV.doc.numPages, Math.max(1, PV.n + d)); if (n !== PV.n) { PV.n = n; pdfDraw(); } }
function pdfZoom(d){ if (!PV) return; PV.z = Math.min(4, Math.max(.5, PV.z + d)); pdfDraw(); }
async function pdfShow(f){
  var body = $('#pb'); PV = null;
  body.innerHTML = '<div class="pdfv"><div class="pdfbar"><button class="sm" id="pprev" aria-label="Página anterior">◀</button><span id="pnum">Cargando…</span>' +
    '<button class="sm" id="pnext" aria-label="Página siguiente">▶</button><button class="sm g" id="pzo" aria-label="Alejar">−</button><button class="sm g" id="pzi" aria-label="Acercar">+</button></div>' +
    '<div class="pdfc" id="pdfc"><p class="pdfmsg">Abriendo el PDF…</p></div></div>';
  try {
    var u = f.blob ? '' : await urlFresca(f);
    var lib = await pdfLib(), doc = await lib.getDocument({ data: new Uint8Array(f.blob ? await f.blob.arrayBuffer() : await (await fetch(u)).arrayBuffer()) }).promise;
    PV = { doc: doc, n: 1, z: 1, tk: 0 }; await pdfDraw();
  } catch (x) {
    PV = null;
    body.innerHTML = '<div class="pdfv"><div class="pdfc"><iframe title="' + esc(f.name) + '" src="' + f.url + '"></iframe></div></div>';
  }
}
async function urlFresca(f){
  if (!NUBE || !f.ruta) return f.url;
  try { var sb = await sbCargar(), r = await sb.storage.from(BUCKET).createSignedUrl(f.ruta, 3600); if (!r.error && r.data && r.data.signedUrl) return r.data.signedUrl; } catch (x) {}
  return f.url;
}
async function ofiShow(f){
  var body = $('#pb');
  body.innerHTML = '<div class="ofimsg">Abriendo ' + esc(kind(f)[1].toLowerCase()) + '…</div>';
  var u = await urlFresca(f);
  if ($('#proj').style.display !== 'flex') return;
  if (!/^https:/.test(u || '')) {
    body.innerHTML = '<div class="ofimsg"><p>Para proyectar PowerPoint, Word o Excel la app necesita la nube y conexión a internet.</p><p>Otra opción: guarda el archivo como PDF y súbelo; el PDF se proyecta siempre.</p></div>';
    return;
  }
  body.innerHTML = '<iframe class="ofi" title="' + esc(f.name) + '" allowfullscreen src="https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(u) + '"></iframe>';
}
async function show(f){
  var k = kind(f)[0], e = ext(f), body = $('#pb'); PV = null;
  $('#pn').textContent = f.name; $('#proj').style.display = 'flex';
  if (e === 'pdf') return pdfShow(f);
  if (OFI.test(e)) return ofiShow(f);
  if (e === 'txt') {
    body.innerHTML = '<div class="ofimsg">Abriendo…</div>';
    try { var t = f.blob ? await f.blob.text() : await (await fetch(await urlFresca(f))).text(); body.innerHTML = '<pre class="txtv">' + esc(t) + '</pre>'; }
    catch (x) { body.innerHTML = '<div class="ofimsg">No se pudo abrir el texto.</div>'; }
    return;
  }
  body.innerHTML = k === 'img' ? '<img alt="' + esc(f.name) + '" src="' + f.url + '">' : '<video controls autoplay src="' + f.url + '"></video>';
}
async function dl(f){
  var u = f.url;
  if (!f.blob) { try { u = URL.createObjectURL(await (await fetch(await urlFresca(f))).blob()); } catch (x) {} }
  var a = document.createElement('a'); a.href = u; a.download = f.name; document.body.appendChild(a); a.click(); a.remove();
}

document.addEventListener('click', function(e){
  var t = e.target.closest('[data-g],[data-j],[data-a],[data-e],[data-k],[data-fin],[data-m],[data-p],[data-d],[data-dl],[data-lm],[data-voz],#showpw,#forgot,#tbtn,#chk,[data-pin],[data-rp],[data-rps],[data-rpc],#elegir,#save,#cnom,#nsel,#grok,#volver');
  if (!t) return;
  var D = t.dataset;
  if (t.id === 'tbtn') return abrirDocente();
  if (D.pin !== undefined) return pinKey(D.pin);
  if (t.id === 'chk') { S.acc = 'cargando'; draw(); return cargarPerfil(); }
  if (D.rp) { S.rp = D.rp; S.rpok = null; S.rpe = ''; S.rpv = genClave(); return draw(); }
  if (D.rpc) { S.rp = ''; S.rpe = ''; return draw(); }
  if (D.rps) return restablecer(D.rps);
  if (t.id === 'cnom') { snd('sfx_boton'); return irNombre(); }
  if (t.id === 'volver') { snd('sfx_boton'); if (S.pj === 5 && S.pzv) return pzGallery($('#ar')); return go('jue'); }
  if (t.id === 'nsel') return nuevoAl();
  if (t.id === 'grok') return finGracias();
  if (D.voz) return snd(D.voz);
  if (D.g) { snd('sfx_boton'); S.tmp = null; go(D.g); }
  else if (D.j !== undefined) { snd('sfx_boton'); S.pj = +D.j; go('play'); }
  else if (D.a !== undefined) {
    S.tmp = +D.a; snd('sfx_amigo');
    document.querySelectorAll('.friends button').forEach(function(q){ q.setAttribute('aria-pressed', String(+q.dataset.a === S.tmp)); });
    var ne = $('#nerr'); if (ne) ne.textContent = '';
  }
  else if (t.id === 'elegir') {
    if (S.tmp !== null && S.al) { S.am = S.tmp; S.al.avatar = S.am; alSync(); }
    S.tmp = null; go('gracias'); snd('voz_gracias');
  }
  else if (D.e !== undefined) { S.em = +D.e; if (cnt.emo.indexOf(S.em) < 0) { cnt.emo.push(S.em); savec(); } snd(EM[S.em][4]); draw(); }
  else if (D.k) { var C = S.draft || S.set; C[D.k] = C[D.k] ? 0 : 1; S.saved = 0; applySet(C); draw(); }
  else if (t.id === 'save') { S.set = clone(S.draft || S.set); sv('set', JSON.stringify(S.set)); S.draft = clone(S.set); S.saved = 1; applySet(S.set); draw(); }
  else if (D.fin !== undefined) actividad(t);
  else if (D.m) {
    if (D.m === 'out') {
      if (NUBE) sbCargar().then(function(sb){ return sb.auth.signOut(); }).catch(function(){});
      try { localStorage.removeItem('mmc_' + ninoKey()); } catch (x) {}
      S.t = null; S.files = []; S.sol = []; S.rp = ''; S.rpok = null; S.mode = 'nino'; S.scr = 'home'; S.acc = 'fuera';
      S.al = null; S.alst = ''; cnt = ncnt(); S.stars = 0;
      try { localStorage.removeItem('mmc_t'); } catch (x) {}
    }
    else if (D.m === 'otro') return otroNino();
    else { S.mode = D.m; if (D.m === 'doc') { loadFiles(); return; } }
    draw();
  }
  else if (D.p !== undefined) show(S.files[+D.p]);
  else if (D.dl !== undefined) dl(S.files[+D.dl]);
  else if (D.d !== undefined) { var f = S.files[+D.d]; (NUBE ? nubeBorrar(f) : dbReq('readwrite', function(st){ return st.delete(f.id); })).then(loadFiles); }
  else if (t.id === 'forgot') olvido();
  else if (D.lm) { S.lemail = ($('#em') || {}).value || S.lemail; S.lnm = ($('#nm') || {}).value || S.lnm; S.lsl = ($('#sl') || {}).value || S.lsl; S.lmode = D.lm; S.lmsg = ''; draw(); }
  else if (t.id === 'showpw') {
    var on = t.getAttribute('aria-pressed') !== 'true';
    ['#pw', '#pw2'].forEach(function(q){ var i = $(q); if (i) i.type = on ? 'text' : 'password'; });
    t.setAttribute('aria-pressed', on); t.textContent = on ? 'Ocultar' : 'Ver';
  }
});
document.addEventListener('click', function(e){
  var i = e.target.id; if (i === 'pprev') pdfGo(-1); else if (i === 'pnext') pdfGo(1); else if (i === 'pzi') pdfZoom(.25); else if (i === 'pzo') pdfZoom(-.25);
});
document.addEventListener('input', function(e){ if (e.target.id === 'anm') { S.anm = e.target.value; var ne = $('#nerr'); if (ne) ne.textContent = ''; } });
window.addEventListener('resize', function(){ if (PV) pdfDraw(); });
document.addEventListener('submit', function(e){ if (e.target.id === 'lf') enviarLogin(e); else if (e.target.id === 'nf') guardarClave(e); else if (e.target.id === 'pf') pinReset(e); });
document.addEventListener('change', function(e){ if (e.target.id === 'up') upl(Array.prototype.slice.call(e.target.files)); });
document.addEventListener('dragover', function(e){ if (e.target.closest && e.target.closest('#dz')) e.preventDefault(); });
document.addEventListener('drop', function(e){ if (e.target.closest && e.target.closest('#dz')) { e.preventDefault(); upl(Array.prototype.slice.call(e.dataTransfer.files)); } });
$('#px').onclick = function(){ PV = null; $('#proj').style.display = 'none'; $('#pb').innerHTML = ''; if (document.fullscreenElement) document.exitFullscreen(); };
$('#pf').onclick = function(){ try { $('#proj').requestFullscreen(); } catch (e) {} };
document.addEventListener('keydown', function(e){
  if (e.key === 'Enter' && e.target.id === 'anm') { e.preventDefault(); e.target.blur(); return; }
  if (PV && $('#proj').style.display === 'flex') { if (e.key === 'ArrowRight' || e.key === 'PageDown') pdfGo(1); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') pdfGo(-1); }
  if (e.key === 'Escape' && $('#proj').style.display === 'flex') $('#px').click(); });

applySet(S.set);
draw();
precarga();
if (S.acc === 'ok' && !NUBE) alInit();
sbInit();

if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
  window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
}
