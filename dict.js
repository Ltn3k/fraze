// ── Slovník: 10 stran po 20 slovech, režimy čtení / psaní / přiřazování ──
(function(){
const A=()=>window.APP,PER=20,PAGES=10;
const $=s=>document.querySelector(s);
const WORDS=()=>window.SLOVA_T.flat().slice(0,PER*PAGES);
const st=()=>{const S=A().S;S.dict=S.dict||{p:0,m:"r"};return S.dict};
const lang=()=>A().S.lang;
const tr=w=>(lang()==="es"?w[2]:w[1]);
const ART={en:/^(the|a|an|to) /,es:/^(el|la|los|las|un|una|unos|unas|lo) /};
const clean=(s,l,acc)=>{let t=A().norm(s).t.replace(ART[l],"");return acc?t:A().noAcc(t)};
const ok=(v,w)=>tr(w).some(a=>clean(a,lang(),true)===clean(v,lang(),true))||(lang()==="es"&&tr(w).some(a=>clean(a,"es")===clean(v,"es"))&&"acc");
let solved=new Set(),sel=null,order=[];
function flash(){const f=document.createElement("div");f.className="okflash";f.textContent="✓";document.body.appendChild(f);setTimeout(()=>f.remove(),650)}
function page(){const p=st().p;return WORDS().slice(p*PER,p*PER+PER).map((w,i)=>({w,i:p*PER+i}))}
function head(){const d=st(),M=[["r","📖","Číst"],["w","✏️","Napiš"],["m","🔀","Přiřaď"]];
 return `<div class="thead"><button class="ib" id="dClose" aria-label="Zpět">←</button><div class="tt"><b>Slovník</b><small>${lang()==="es"?"čeština · španělština":"čeština · angličtina"}</small></div></div>
 <div class="dbar"><button class="ib" id="dPrev" ${d.p?"":"disabled"} aria-label="Předchozí strana">‹</button><div class="dmodes">${M.map(([k,i,t])=>`<button data-dm="${k}" class="${d.m===k?"on":""}">${i} ${t}</button>`).join("")}</div><button class="ib" id="dNext" ${d.p<PAGES-1?"":"disabled"} aria-label="Další strana">›</button></div>
 <div class="dinfo"><span>Strana ${d.p+1}/${PAGES}</span>${d.m==="r"?"":`<span id="dScore">${solved.size}/${PER}</span>`}</div>`}
function render(){
 const d=st(),el=$("#dictBody"),P=page();
 if(d.m==="r")el.innerHTML=head()+`<div class="dlist">${P.map(({w})=>`<div class="drow"><span class="cz">${A().esc(w[0])}</span><button class="en say1" data-say="${A().esc(tr(w)[0])}">${A().esc(tr(w)[0])} <i>🔊</i></button></div>`).join("")}</div>`;
 else if(d.m==="w")el.innerHTML=head()+`<p class="small dhelp">Napiš překlad. Správně = hned zezelená. Podrž české slovo pro nápovědu.</p><div class="dlist">${P.map(({w,i})=>`<div class="drow${solved.has(i)?" ok":""}" data-i="${i}"><span class="cz hold" data-i="${i}">${A().esc(w[0])}</span>${solved.has(i)?`<span class="en done">${A().esc(tr(w)[0])}</span>`:`<input class="din" data-i="${i}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…">`}</div>`).join("")}</div>`;
 else{
  if(!order.length)order=P.map(x=>x.i).sort(()=>Math.random()-.5);
  el.innerHTML=head()+`<p class="small dhelp">Přetáhni překlad na české slovo (nebo klepni na překlad a pak na slovo).</p><div class="dlist">${P.map(({w,i})=>`<div class="drow drop${solved.has(i)?" ok":""}" data-i="${i}"><span class="cz">${A().esc(w[0])}</span><span class="slot">${solved.has(i)?A().esc(tr(w)[0]):""}</span></div>`).join("")}</div>
  <div class="dtray">${order.filter(i=>!solved.has(i)).map(i=>`<button class="dchip${sel===i?" sel":""}" data-i="${i}">${A().esc(tr(WORDS()[i])[0])}</button>`).join("")||`<b>Hotovo! 🎉</b> <button class="btn sm" id="dAgain">Znovu</button>`}</div>`;
 }
 bind();
}
function setPage(p){st().p=p;solved=new Set();order=[];sel=null;A().save();render();window.scrollTo({top:0})}
function bind(){
 const el=$("#dictBody");
 $("#dClose").onclick=()=>window.showScreen("app");
 $("#dPrev").onclick=()=>setPage(st().p-1);$("#dNext").onclick=()=>setPage(st().p+1);
 el.querySelectorAll("[data-dm]").forEach(b=>b.onclick=()=>{st().m=b.dataset.dm;solved=new Set();order=[];sel=null;A().save();render()});
 el.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>A().say(b.dataset.say));
 el.querySelectorAll(".din").forEach(inp=>inp.addEventListener("input",()=>{
  const i=+inp.dataset.i,w=WORDS()[i],r=ok(inp.value,w);
  if(r===true){solved.add(i);flash();A().say(tr(w)[0]);const row=inp.closest(".drow");row.classList.add("ok");inp.outerHTML=`<span class="en done">${A().esc(tr(w)[0])}</span>`;$("#dScore").textContent=`${solved.size}/${PER}`;
   const nx=el.querySelector(".din");if(nx)nx.focus({preventScroll:false});else A().toast("Strana hotová! 🎉")}
  else inp.classList.toggle("acc",r==="acc");
 }));
 el.querySelectorAll(".hold").forEach(h=>{let t;const i=+h.dataset.i,show=()=>{h.dataset.cz=h.textContent;h.textContent=tr(WORDS()[i])[0];h.classList.add("peek")},hide=()=>{clearTimeout(t);if(h.dataset.cz){h.textContent=h.dataset.cz;delete h.dataset.cz;h.classList.remove("peek")}};
  h.addEventListener("pointerdown",e=>{e.preventDefault();t=setTimeout(show,350)});["pointerup","pointerleave","pointercancel"].forEach(ev=>h.addEventListener(ev,hide));h.addEventListener("contextmenu",e=>e.preventDefault())});
 const again=$("#dAgain");if(again)again.onclick=()=>{solved=new Set();order=[];render()};
 // přiřazování
 const tryDrop=(i,row)=>{if(!row||row.classList.contains("ok"))return false;const j=+row.dataset.i;
  if(i===j){solved.add(i);sel=null;flash();A().say(tr(WORDS()[i])[0]);render();return true}
  row.classList.add("bad");setTimeout(()=>row.classList.remove("bad"),400);sel=null;return false};
 el.querySelectorAll(".drop").forEach(r=>r.onclick=()=>{if(sel!=null&&!tryDrop(sel,r))render()});
 el.querySelectorAll(".dchip").forEach(ch=>{
  const i=+ch.dataset.i;let g=null,sx,sy,moved=false,raf;
  ch.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY;moved=false;ch.setPointerCapture(e.pointerId)});
  ch.addEventListener("pointermove",e=>{if(sx==null)return;if(!moved&&Math.hypot(e.clientX-sx,e.clientY-sy)<8)return;
   if(!moved){moved=true;g=ch.cloneNode(true);g.classList.add("ghostchip");document.body.appendChild(g)}
   g.style.left=e.clientX+"px";g.style.top=e.clientY+"px";
   const H=innerHeight;cancelAnimationFrame(raf);const sc=()=>{const y=parseFloat(g.style.top);const v=y<90?-8:y>H-160&&y<H-0?8:0;if(v){scrollBy(0,v);raf=requestAnimationFrame(sc)}};sc();
   el.querySelectorAll(".drop.hov").forEach(x=>x.classList.remove("hov"));g.style.display="none";const r=document.elementFromPoint(e.clientX,e.clientY);g.style.display="";const row=r&&r.closest(".drop");if(row)row.classList.add("hov")});
  ch.addEventListener("pointerup",e=>{cancelAnimationFrame(raf);sx=null;
   if(!moved){sel=sel===i?null:i;render();return}
   g.style.display="none";const r=document.elementFromPoint(e.clientX,e.clientY);g.remove();
   if(!tryDrop(i,r&&r.closest(".drop")))render()});
 });
}
window.Dict={render:()=>{solved=new Set();order=[];sel=null;render()}};
})();
