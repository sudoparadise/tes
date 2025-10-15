(function(){
const $ = (id)=>document.getElementById(id);

function el(tag, props={}, children=[]){
const n=document.createElement(tag);
Object.entries(props).forEach(([k,v])=>{
if (k==='class') n.className=v;
else if (k==='text') n.textContent=v;
else n.setAttribute(k,v);
});
children.forEach(c=>n.appendChild(c));
return n;
}

function makeInput(def){
const w = el('div', {class:'field'});
const label = el('label', {text:${def.tag} — ${def.label||''}${def.required?' *':''}});
const input = el('input', {id:f_${def.tag}, placeholder:def.tag});
const help = el('div', {class:'help', text:(def.help||'')});
w.appendChild(label); w.appendChild(input); w.appendChild(help);
return w;
}

function renderForm(profile){
const reqWrap = $('required-fields'); reqWrap.innerHTML='';
const optWrap = $('optional-fields'); optWrap.innerHTML='';

text
for (const sf of profile.subfiles){
  for (const def of sf.fields){
    const node = makeInput(def);
    if (def.required) reqWrap.appendChild(node); else optWrap.appendChild(node);
  }
}
$('aamva').value = profile.aamvaVersion ?? 10;
}

function collectInputs(profile){
const values = {};
for (const sf of profile.subfiles){
for (const def of sf.fields){
const el = $('f_'+def.tag);
values[def.tag] = el ? el.value : '';
}
}
return values;
}

function showDiag(obj){
$('diag').textContent = typeof obj==='string' ? obj : JSON.stringify(obj,null,2);
}
function msg(text, cls){ const s=$('status'); s.textContent=text; s.className='muted '+(cls||'') }

function renderBarcode(text){
const canvas=$('barcode');
try{
BWIPJS.toCanvas(canvas, { bcid:'pdf417', text, scale:2, columns:6, security:2, includetext:false, parse:false });
msg('Rendered','ok');
}catch(e){
msg('Render error: '+(e.message||e),'err');
}
}

function populateJurisdictions(){
const sel=$('jurisdiction'); sel.innerHTML='';
for (const p of JURISDICTION_PROFILES.list){
const opt = document.createElement('option');
opt.value=p.id; opt.textContent=${p.id} — ${p.label};
sel.appendChild(opt);
}
sel.value=JURISDICTION_PROFILES.list.id;
}

function currentProfile(){
const id=$('jurisdiction').value;
return JURISDICTION_PROFILES.map[id];
}

function selfCheck(profile){
const fix = (window.GOLDEN_FIXTURES && window.GOLDEN_FIXTURES[profile.id]) || [];
if (!fix.length){ showDiag('No fixtures for '+profile.id); return; }
const errs=[];
for (const fx of fix){
try{
const { payload } = AAMVA_BUILDER.buildPayload(profile, fx.input, {
aamvaVersion: profile.aamvaVersion,
jurisdictionVersion: profile.jurisdictionVersion,
entries: 1
});
if (payload !== fx.raw){
errs.push({case:fx.name||'case', diff:'payload mismatch'});
}
}catch(e){
errs.push({case:fx.name||'case', error:e.message||String(e)});
}
}
if (errs.length){ showDiag(errs); msg('Self‑check failed','err'); }
else { showDiag('All fixtures passed'); msg('Self‑check passed','ok'); }
}

window.addEventListener('DOMContentLoaded', ()=>{
populateJurisdictions();
renderForm(currentProfile());

text
$('jurisdiction').addEventListener('change', ()=>{ renderForm(currentProfile()); showDiag(''); msg('','') });

$('build').addEventListener('click', ()=>{
  try{
    const p=currentProfile();
    const user=collectInputs(p);
    const { payload } = AAMVA_BUILDER.buildPayload(p, user, {
      aamvaVersion:Number($('aamva').value||p.aamvaVersion),
      jurisdictionVersion:p.jurisdictionVersion,
      entries:Number($('entries').value||1)
    });
    $('payload').value = payload;
    showDiag({length:payload.length, preview:payload.slice(0,64)+'…'});
    msg('Payload built','ok');
  }catch(e){ msg(e.message||String(e),'err'); }
});

$('render').addEventListener('click', ()=>{
  const text = $('payload').value;
  if (!text){ msg('Build a payload first','warn'); return; }
  renderBarcode(text);
});

$('download').addEventListener('click', ()=>{
  const c=$('barcode');
  const a=document.createElement('a');
  a.href=c.toDataURL('image/png'); a.download='pdf417.png'; a.click();
});

$('selfcheck').addEventListener('click', ()=> selfCheck(currentProfile()));
});
})();