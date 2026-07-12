<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Encógelo — acortador de enlaces</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Space+Mono:wght@400;700&display=swap');

:root{
  --kraft:#C9A876;
  --kraft-dark:#B5924F;
  --paper:#F2E9D8;
  --ink:#241E17;
  --ink-soft:#5C5346;
  --stamp:#B33A2E;
  --stamp-dark:#8C2B22;
}
*{box-sizing:border-box;}
body{
  margin:0;
  font-family:'Space Mono', monospace;
  background: var(--kraft);
  background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px);
  color: var(--ink);
  padding: 40px 20px 60px;
  min-height: 100vh;
}
.wrap{ max-width: 620px; margin: 0 auto; }
.eyebrow{ font-size:12px; letter-spacing:3px; text-transform:uppercase; color:var(--ink-soft); margin:0 0 4px; }
h1{ font-family:'Special Elite', monospace; font-size:34px; margin:0 0 6px; letter-spacing:1px; }
.sub{ font-size:13px; color:var(--ink-soft); margin:0 0 28px; line-height:1.6; max-width:480px; }
.panel{ background:var(--paper); border:2px solid var(--ink); padding:22px; position:relative; margin-bottom:24px; }
.panel::before{ content:""; position:absolute; inset:6px; border:1px dashed var(--kraft-dark); pointer-events:none; }
.field-label{ font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--ink-soft); display:block; margin-bottom:6px; }
input[type=url]{ width:100%; font-family:'Space Mono', monospace; font-size:14px; padding:12px; border:1.5px solid var(--ink); background:#fff; color:var(--ink); outline:none; }
input[type=url]:focus{ border-color:var(--stamp); box-shadow:0 0 0 2px rgba(179,58,46,0.15); }
.error{ color:var(--stamp-dark); font-size:12px; margin-top:8px; min-height:16px; }
.btn{ font-family:'Space Mono', monospace; font-weight:700; font-size:13px; letter-spacing:1.5px; text-transform:uppercase; background:var(--ink); color:var(--paper); border:none; padding:13px 22px; cursor:pointer; margin-top:14px; transition:transform .08s ease, background .15s ease; }
.btn:hover{ background:var(--stamp-dark); }
.btn:active{ transform:scale(0.97); }
.btn:disabled{ opacity:0.5; cursor:not-allowed; }
.label-card{ margin-top:4px; border:2px solid var(--ink); background:var(--paper); padding:20px; display:none; position:relative; }
.label-card.show{ display:block; }
.orig-url{ font-size:12px; color:var(--ink-soft); word-break:break-all; line-height:1.5; margin-bottom:14px; }
.short-link-box{ display:flex; gap:8px; align-items:center; border-top:1px dashed var(--kraft-dark); padding-top:14px; }
.short-link{ flex:1; font-size:15px; font-weight:700; color:var(--stamp-dark); background:#fff; border:1.5px solid var(--ink); padding:10px 12px; }
.icon-btn{ border:1.5px solid var(--ink); background:#fff; padding:0 14px; height:42px; cursor:pointer; font-family:'Space Mono'; font-size:11px; flex-shrink:0; }
.icon-btn:hover{ background:rgba(0,0,0,0.06); }
.hist-head{ display:flex; justify-content:space-between; align-items:baseline; margin:30px 0 10px; }
.hist-head h2{ font-family:'Special Elite', monospace; font-size:17px; margin:0; }
.hist-item{ display:flex; justify-content:space-between; align-items:center; gap:10px; background:var(--paper); border:1px solid var(--ink); padding:10px 14px; margin-bottom:8px; font-size:12px; }
.hist-left{ min-width:0; }
.hist-code{ font-weight:700; color:var(--stamp-dark); }
.hist-orig{ color:var(--ink-soft); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:300px; }
.hist-clicks{ color:var(--ink-soft); }
.hist-actions{ display:flex; gap:6px; flex-shrink:0; }
.hist-actions button{ font-family:'Space Mono'; font-size:10px; border:1px solid var(--ink); background:#fff; padding:5px 8px; cursor:pointer; }
.hist-actions button:hover{ background:rgba(0,0,0,0.06); }
.empty{ font-size:12px; color:var(--ink-soft); padding:14px 0; }
.toast{ position:fixed; bottom:20px; left:50%; transform:translateX(-50%) translateY(20px); background:var(--ink); color:var(--paper); font-family:'Space Mono'; font-size:12px; padding:10px 18px; opacity:0; transition:all .25s ease; pointer-events:none; }
.toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">paquete / rastreo de enlaces</p>
  <h1>Encógelo.</h1>
  <p class="sub">Pega una URL larga y recibe un enlace corto real, funcional desde cualquier navegador.</p>

  <div class="panel">
    <label class="field-label" for="url-input">Url original</label>
    <input type="url" id="url-input" placeholder="https://ejemplo.com/una/ruta/muy/larga" />
    <div class="error" id="error-msg"></div>
    <button class="btn" id="shrink-btn">Generar enlace →</button>
  </div>

  <div class="label-card" id="result-card">
    <div class="orig-url" id="result-orig"></div>

    <span class="field-label">Enlace corto (para Beacons y redes)</span>
    <div class="short-link-box">
      <input class="short-link" id="public-short-link" readonly />
      <button class="icon-btn" id="copy-public-btn">COPIAR</button>
      <button class="icon-btn" id="open-btn">ABRIR</button>
    </div>

    <span class="field-label" style="margin-top:14px; display:block;">Enlace propio (con estadísticas)</span>
    <div class="short-link-box">
      <input class="short-link" id="short-link" readonly style="font-size:13px;" />
      <button class="icon-btn" id="copy-btn">COPIAR</button>
    </div>
  </div>

  <div class="hist-head">
    <h2>Enlaces recientes</h2>
  </div>
  <div id="hist-list"><p class="empty">Cargando…</p></div>
</div>

<div class="toast" id="toast"></div>

<script>
const urlInput = document.getElementById('url-input');
const errorMsg = document.getElementById('error-msg');
const shrinkBtn = document.getElementById('shrink-btn');
const resultCard = document.getElementById('result-card');
const resultOrig = document.getElementById('result-orig');
const shortLinkInput = document.getElementById('short-link');
const publicShortLinkInput = document.getElementById('public-short-link');
const copyBtn = document.getElementById('copy-btn');
const copyPublicBtn = document.getElementById('copy-public-btn');
const openBtn = document.getElementById('open-btn');
const histList = document.getElementById('hist-list');
const toast = document.getElementById('toast');

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 1800);
}

async function loadHistory(){
  try{
    const res = await fetch('/api/links');
    const links = await res.json();
    if(!links.length){
      histList.innerHTML = '<p class="empty">Todavía no hay enlaces creados.</p>';
      return;
    }
    histList.innerHTML = '';
    links.forEach(item=>{
      const row = document.createElement('div');
      row.className = 'hist-item';
      const displayUrl = item.publicShortUrl || item.shortUrl;
      row.innerHTML = `
        <div class="hist-left">
          <div class="hist-code">${displayUrl.replace(/^https?:\/\//,'')}</div>
          <div class="hist-orig">${item.url}</div>
        </div>
        <div class="hist-clicks">${item.clicks} clics</div>
        <div class="hist-actions">
          <button data-act="copy">copiar</button>
          <button data-act="del">borrar</button>
        </div>
      `;
      row.querySelector('[data-act=copy]').onclick = ()=>{
        navigator.clipboard.writeText(displayUrl);
        showToast('Enlace copiado');
      };
      row.querySelector('[data-act=del]').onclick = async ()=>{
        await fetch('/api/links/' + item.code, { method:'DELETE' });
        loadHistory();
      };
      histList.appendChild(row);
    });
  }catch(e){
    histList.innerHTML = '<p class="empty">No se pudo cargar el historial.</p>';
  }
}

async function shrinkUrl(){
  errorMsg.textContent = '';
  const raw = urlInput.value.trim();
  if(!raw){ errorMsg.textContent = 'Escribe una url para continuar.'; return; }

  shrinkBtn.disabled = true;
  shrinkBtn.textContent = 'Generando…';

  try{
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: raw })
    });
    const data = await res.json();

    if(!res.ok){
      errorMsg.textContent = data.error || 'Ocurrió un error.';
      return;
    }

    resultOrig.textContent = data.url;
    shortLinkInput.value = data.shortUrl;
    publicShortLinkInput.value = data.publicShortUrl || data.shortUrl;
    resultCard.classList.add('show');
    urlInput.value = '';
    loadHistory();
  }catch(e){
    errorMsg.textContent = 'No se pudo conectar con el servidor.';
  }finally{
    shrinkBtn.disabled = false;
    shrinkBtn.textContent = 'Generar enlace →';
  }
}

shrinkBtn.addEventListener('click', shrinkUrl);
urlInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') shrinkUrl(); });
copyBtn.addEventListener('click', ()=>{
  navigator.clipboard.writeText(shortLinkInput.value);
  showToast('Enlace copiado');
});
copyPublicBtn.addEventListener('click', ()=>{
  navigator.clipboard.writeText(publicShortLinkInput.value);
  showToast('Enlace copiado');
});
openBtn.addEventListener('click', ()=>{ window.open(resultOrig.textContent, '_blank'); });

loadHistory();
</script>
</body>
</html>
