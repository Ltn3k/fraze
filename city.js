// Moje město – prototyp (kapitoly 1–3)
// Fráze → mince 🪙, slovíčka → suroviny 📦. Za ně se ve městě staví a nakupuje,
// a každá akce ve městě se „řekne“ v cizím jazyce.
(function(){
const A=window.APP;
const $=s=>document.querySelector(s);
const esc=A.esc,norm=A.norm,noAcc=A.noAcc;
const S=()=>A.S;
const lang=()=>S().lang;
const LNAME={en:"anglicky",es:"španělsky"};
const ART={en:/^(the|a|an|to|some) /,es:/^(el|la|los|las|un|una|unos|unas) /};
const RW={f:10,w:5},BONUS=20,PET_COST=30,SHOP_COST={c:100,r:50},DECAY=4; // hlad / hodinu
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a};

// ── kapitoly ──
const W=(cs,en,es,n)=>({t:"w",cs,en,es,n});
const F=(cs,en,es,n)=>({t:"f",cs,en,es,n});
const CH=[
 {title:"Nový domov",
  intro:g=>`Právě ses přistěhoval${g} do malého městečka. Kolem domu je zatím jen mlha a neznáš tu ani slovo. Nauč se první slova a uvidíš, co je kolem.`,
  done:"Mlha se zvedla! Vidíš celé městečko a volné parcely.",
  items:[
   W("muž",["man"],["el hombre"]),W("žena",["woman"],["la mujer"]),W("dům",["house","home"],["la casa"]),
   W("mapa",["map"],["el mapa"],{es:"Mapa je mužského rodu."}),W("peníze",["money"],["el dinero"]),W("město",["town","city"],["el pueblo","la ciudad"]),
   F("To je můj dům.",["This is my house.","That's my house.","This is my home.","It's my house."],["Esta es mi casa.","Es mi casa."]),
   F("Kde je mapa?",["Where is the map?","Where's the map?"],["¿Dónde está el mapa?"]),
   F("Nemám peníze.",["I don't have money.","I have no money.","I don't have any money.","I haven't got any money."],["No tengo dinero."]),
   F("To město je malé.",["The town is small.","This town is small.","The city is small.","This city is small."],["El pueblo es pequeño.","Este pueblo es pequeño.","La ciudad es pequeña.","Esta ciudad es pequeña."])]},
 {title:"Mazlíček",
  intro:g=>`Sám${g?"a":""} v novém domě? To nejde. Nauč se, jak se řekne pes a kočka, a vezmi si domů parťáka.`,
  done:"Teď si můžeš adoptovat mazlíčka!",
  items:[
   W("pes",["dog"],["el perro"]),W("kočka",["cat"],["el gato","la gata"]),W("zvíře",["animal","pet"],["el animal","la mascota"]),
   W("jméno",["name"],["el nombre"]),W("jídlo",["food"],["la comida"]),W("voda",["water"],["el agua"],{es:"Agua je ženského rodu, ale má člen el."}),
   F("Chci psa.",["I want a dog.","I'd like a dog."],["Quiero un perro."]),
   F("Chci kočku.",["I want a cat.","I'd like a cat."],["Quiero un gato.","Quiero una gata."]),
   F("Jak se jmenuje?",["What's its name?","What is its name?","What's his name?","What's her name?","What is his name?","What is her name?"],["¿Cómo se llama?"]),
   F("Můj pes má hlad.",["My dog is hungry."],["Mi perro tiene hambre."],{es:"Hlad se „má“: tener hambre."})]},
 {title:"Obchod",
  intro:()=>"Tvůj mazlíček bude mít brzy hlad a ve městě není jediný obchod. Nauč se nakupovat a postav ho.",
  done:"Můžeš postavit obchod!",
  items:[
   W("obchod",["shop","store"],["la tienda"]),W("chléb",["bread"],["el pan"]),W("mléko",["milk"],["la leche"]),
   W("granule",["pet food","dog food","cat food","kibble"],["el pienso","la comida para mascotas","la comida para perros","la comida para gatos"],{en:"Pet food = jídlo pro zvířata.",es:"Pienso = granule (Španělsko)."}),
   W("cena",["price"],["el precio"]),W("koupit",["buy"],["comprar"]),
   F("Kde je obchod?",["Where is the shop?","Where's the shop?","Where is the store?","Where's the store?"],["¿Dónde está la tienda?"]),
   F("Kolik to stojí?",["How much is it?","How much does it cost?","How much is this?","How much is that?"],["¿Cuánto cuesta?","¿Cuánto es?"]),
   F("Chci koupit mléko.",["I want to buy milk.","I'd like to buy milk.","I want to buy some milk.","I'd like to buy some milk."],["Quiero comprar leche."]),
   F("Máte jídlo pro psa?",["Do you have dog food?","Have you got dog food?","Do you have food for dogs?","Do you have any dog food?"],["¿Tiene comida para perros?","¿Tienen comida para perros?","¿Tiene pienso para perros?"])]}
];
const PLOTS=[
 {id:"shop",name:"Obchod",ch:3},{id:"fruit",name:"Ovoce a zelenina",ch:4},{id:"bus",name:"Zastávka",ch:5},{id:"cafe",name:"Kavárna",ch:6},
 {id:"park",name:"Park",ch:7},{id:"school",name:"Škola",ch:8},{id:"doctor",name:"Lékař",ch:9},{id:"station",name:"Nádraží",ch:10}];
const FOOD={
 granule:{cs:"granule",price:10,feed:100,en:CH[2].items[3].en,es:CH[2].items[3].es},
 mleko:{cs:"mléko",price:5,feed:40,en:["milk"],es:["la leche"]},
 chleb:{cs:"chléb",price:5,feed:25,en:["bread"],es:["el pan"]}};
const PET={dog:{en:["dog","I want a dog"],es:["el perro","quiero un perro"]},cat:{en:["cat","I want a cat"],es:["el gato","la gata","quiero un gato","quiero una gata"]}};

// ── stav ──
const C=()=>{const s=S();s.city=s.city||{};const c=s.city[s.lang]||(s.city[s.lang]={ch:1,coins:0,res:0,food:{granule:0,mleko:0,chleb:0},pet:null,b:{},fog:true});return c};
const av=()=>S().city&&S().city.avatar;
const gs=()=>av()&&av().g==="f"?"a":"";
const save=()=>A.save();
function hunger(){const p=C().pet;if(!p)return 0;return Math.max(0,Math.round(p.h-(Date.now()-p.ts)/36e5*DECAY))}
function setHunger(v){const p=C().pet;p.h=Math.min(100,v);p.ts=Date.now();save()}

// ── kontrola odpovědi ──
function check(raw,answers,strip){
 const L=lang(),n=s=>{let t=norm(s).t;if(strip)t=t.replace(ART[L],"");return t};
 const i=n(raw);if(!i)return{s:"empty"};let best=null;
 for(const a of answers){const t=n(a);if(i===t)return{s:"ok",a};if(noAcc(i)===noAcc(t))best={s:"accent",a}}
 return best||{s:"bad"};
}

// ── grafika ──
const HOUSE=`<ellipse cx="0" cy="40" rx="48" ry="8" fill="rgba(0,0,0,.12)"/><rect x="-36" y="-8" width="72" height="48" rx="5" fill="#fff4da" stroke="#c9a46a" stroke-width="2"/><path d="M-46 -6 L0 -46 L46 -6Z" fill="#e0614f" stroke="#b8473a" stroke-width="2" stroke-linejoin="round"/><rect x="20" y="-38" width="10" height="16" fill="#b8473a"/><rect x="-8" y="14" width="16" height="26" rx="3" fill="#9b6334"/><rect x="-28" y="4" width="15" height="13" rx="2" fill="#a8dcf7" stroke="#c9a46a" stroke-width="2"/><rect x="13" y="4" width="15" height="13" rx="2" fill="#a8dcf7" stroke="#c9a46a" stroke-width="2"/>`;
const SHOP=(L)=>`<ellipse cx="0" cy="30" rx="40" ry="7" fill="rgba(0,0,0,.12)"/><rect x="-32" y="-12" width="64" height="42" rx="4" fill="#fff" stroke="#c9a46a" stroke-width="2"/>${[0,1,2,3,4,5].map(k=>`<path d="M${-34+k*11.4} -14 h11.4 v10 a5.7 5.7 0 0 1 -11.4 0z" fill="${k%2?"#fff":"#2f9e6a"}" stroke="#25805a" stroke-width="1"/>`).join("")}<rect x="-26" y="-30" width="52" height="15" rx="3" fill="#25805a"/><text x="0" y="-19" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${L==="es"?"TIENDA":"SHOP"}</text><rect x="-7" y="8" width="14" height="22" rx="2" fill="#9b6334"/><rect x="-26" y="6" width="14" height="12" rx="2" fill="#a8dcf7"/><rect x="12" y="6" width="14" height="12" rx="2" fill="#a8dcf7"/>`;
function AV(g){
 const shirt=g==="f"?"#e86f9a":"#4a7bd6",hair="#6b4226",skin="#f3c9a0";
 return `<ellipse cx="50" cy="132" rx="26" ry="6" fill="rgba(0,0,0,.15)"/>
 <rect x="39" y="98" width="9" height="32" rx="4" fill="#3b3f58"/><rect x="52" y="98" width="9" height="32" rx="4" fill="#3b3f58"/>
 <path d="M34 70 L20 92" stroke="${skin}" stroke-width="8" stroke-linecap="round"/><path d="M66 70 L80 92" stroke="${skin}" stroke-width="8" stroke-linecap="round"/>
 ${g==="f"?`<path d="M36 62 h28 l10 44 h-48z" fill="${shirt}"/>`:`<rect x="31" y="62" width="38" height="42" rx="12" fill="${shirt}"/>`}
 ${g==="f"?`<path d="M25 46 Q22 14 50 15 Q78 14 75 46 L76 74 Q66 66 68 46 Q62 30 50 30 Q38 30 32 46 Q34 66 24 74Z" fill="${hair}"/>`:""}
 <circle cx="50" cy="42" r="22" fill="${skin}"/>
 ${g==="f"?`<path d="M28 40 Q30 18 50 18 Q70 18 72 40 Q60 30 50 30 Q40 30 28 40Z" fill="${hair}"/>`:`<path d="M27 40 Q28 16 50 17 Q73 16 73 40 Q66 27 50 29 Q35 27 27 40Z" fill="${hair}"/>`}
 <circle cx="42" cy="44" r="2.8" fill="#2a1d14"/><circle cx="58" cy="44" r="2.8" fill="#2a1d14"/>
 <path d="M43 52 Q50 58 57 52" stroke="#2a1d14" stroke-width="2.5" fill="none" stroke-linecap="round"/>
 <circle cx="36" cy="51" r="4" fill="#f77" opacity=".35"/><circle cx="64" cy="51" r="4" fill="#f77" opacity=".35"/>`;
}
function PETSVG(k){
 if(k==="dog")return `<ellipse cx="42" cy="76" rx="26" ry="5" fill="rgba(0,0,0,.15)"/><path d="M66 52 q14 -8 10 -22" stroke="#c98b4f" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="30" y="58" width="8" height="18" rx="4" fill="#b87a40"/><rect x="54" y="58" width="8" height="18" rx="4" fill="#b87a40"/><ellipse cx="48" cy="56" rx="24" ry="15" fill="#c98b4f"/><circle cx="26" cy="38" r="17" fill="#d9a066"/><ellipse cx="12" cy="40" rx="6" ry="12" fill="#8a5a2b"/><ellipse cx="40" cy="38" rx="6" ry="12" fill="#8a5a2b"/><circle cx="21" cy="36" r="2.6" fill="#2a1d14"/><circle cx="31" cy="36" r="2.6" fill="#2a1d14"/><ellipse cx="26" cy="45" rx="4.5" ry="3.2" fill="#2a1d14"/><path d="M22 50 q4 4 8 0" stroke="#2a1d14" stroke-width="2" fill="none" stroke-linecap="round"/>`;
 return `<ellipse cx="42" cy="76" rx="24" ry="5" fill="rgba(0,0,0,.15)"/><path d="M64 66 Q84 60 74 38" stroke="#e98a3a" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="46" cy="60" rx="22" ry="16" fill="#f0a050"/><path d="M12 30 L16 8 L30 22Z M44 30 L40 8 L26 22Z" fill="#f0a050"/><circle cx="28" cy="36" r="17" fill="#f0a050"/><path d="M17 33 q4 -4 8 0 M31 33 q4 -4 8 0" stroke="#2a1d14" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M25 41 h6 l-3 3z" fill="#e0607a"/><path d="M8 40 H20 M8 46 L20 44 M36 40 H48 M36 44 L48 46" stroke="#2a1d14" stroke-width="1.3" opacity=".6"/>`;
}
const LOCK=`<path d="M-6 -2 v-5 a6 6 0 0 1 12 0 v5" stroke="#6f8f63" stroke-width="2.4" fill="none"/><rect x="-9" y="-3" width="18" height="13" rx="3" fill="#6f8f63"/>`;
const pos=i=>{const a=(-90+i*45)*Math.PI/180;return[200+140*Math.cos(a),205+138*Math.sin(a)]};

function mapSVG(){
 const c=C(),a=av(),p=c.pet,L=lang(),out=[];
 out.push(`<rect width="400" height="410" rx="28" fill="#c4e6aa"/>`);
 [[30,40],[372,60],[24,360],[376,372],[110,384],[300,22],[60,200],[345,215]].forEach(([x,y],k)=>out.push(`<g transform="translate(${x},${y})"><circle r="${12+k%3*3}" fill="#8fc77a"/><circle r="${7+k%2*3}" cx="-4" cy="-4" fill="#a6d690"/></g>`));
 PLOTS.forEach((_,i)=>{const[x,y]=pos(i);out.push(`<line x1="200" y1="205" x2="${x}" y2="${y}" stroke="#eedfbb" stroke-width="16" stroke-linecap="round"/>`)});
 PLOTS.forEach((pl,i)=>{
  const[x,y]=pos(i),built=c.b[pl.id],can=c.ch>pl.ch;
  if(built)out.push(`<g class="tap pop" data-act="${pl.id}" transform="translate(${x},${y})">${SHOP(L)}</g>`);
  else if(can)out.push(`<g class="tap pulse" data-act="build-${pl.id}" transform="translate(${x},${y})"><rect x="-38" y="-30" width="76" height="60" rx="12" fill="#f6ebcb" stroke="#c9a46a" stroke-width="2.5" stroke-dasharray="6 5"/><text y="4" text-anchor="middle" font-size="26" font-weight="700" fill="#b08a4e">+</text><text y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#8a6a36">${pl.name}</text></g>`);
  else out.push(`<g class="tap" data-act="locked-${i}" transform="translate(${x},${y})"><rect x="-38" y="-30" width="76" height="60" rx="12" fill="rgba(255,255,255,.45)" stroke="#9fc08c" stroke-width="2" stroke-dasharray="4 4"/><g transform="translate(0,-6)">${LOCK}</g><text y="21" text-anchor="middle" font-size="12" font-weight="700" fill="#5f7d54">Kap. ${pl.ch}</text></g>`);
 });
 out.push(`<g class="tap" data-act="house" transform="translate(200,196)">${HOUSE}</g>`);
 if(a)out.push(`<g class="tap" data-act="house" transform="translate(228,206) scale(.42)">${AV(a.g)}</g>`);
 if(p){const h=hunger();out.push(`<g class="tap petg" data-act="pet" transform="translate(132,212) scale(.62)">${PETSVG(p.kind)}${h<40?`<g transform="translate(46,-6)"><circle r="14" fill="#fff" stroke="#e0614f" stroke-width="3"/><text y="6" text-anchor="middle" font-size="18" font-weight="700" fill="#e0614f">!</text></g>`:""}</g>`)}
 if(c.fog||c.unfog){
  out.push(`<defs><mask id="fm"><rect width="400" height="410" fill="#fff"/><circle cx="200" cy="200" r="82" fill="#000"/></mask></defs><g class="${c.unfog?"fogout":""}" mask="url(#fm)"><rect width="400" height="410" rx="28" fill="#eef2f7" opacity=".97"/>${[[90,90],[300,80],[80,300],[320,320],[200,360],[200,40],[40,190],[360,200]].map(([x,y])=>`<g transform="translate(${x},${y})" fill="#fff"><circle r="34"/><circle cx="-30" cy="10" r="24"/><circle cx="30" cy="10" r="26"/></g>`).join("")}</g>`);
 }
 return `<svg class="map" viewBox="0 0 400 410" role="img" aria-label="Mapa městečka">${out.join("")}</svg>`;
}

// ── modální okno ──
const modal=$("#cmodal"),mbody=$("#cmodalBody");
function openModal(html,bind){mbody.innerHTML=html;modal.hidden=false;if(bind)bind(mbody)}
function closeModal(){modal.hidden=true;mbody.innerHTML=""}
modal.addEventListener("click",e=>{if(e.target===modal||e.target.closest("[data-close]"))closeModal()});
// zeptá se na slovo/větu v cizím jazyce
function askWord({title,top="",cs,answers,strip=true,okText="Potvrdit",onOk}){
 let tries=0;
 openModal(`${top}<h2>${title}</h2><p>Napiš ${LNAME[lang()]}: <b class="ask">${esc(cs)}</b></p>
  <textarea rows="1" class="ain" lang="${lang()}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"></textarea>
  <p class="amsg"></p><div class="row2"><button class="btn ghost" data-close>Zrušit</button><button class="btn" id="aok">${okText}</button></div>`,b=>{
  const inp=b.querySelector(".ain"),msg=b.querySelector(".amsg");
  const go=()=>{const r=check(inp.value,answers,strip);
   if(r.s==="ok"||r.s==="accent"){onOk(r)}
   else if(r.s!=="empty"){tries++;inp.classList.remove("shake");void inp.offsetWidth;inp.classList.add("shake");msg.innerHTML=tries>=2?`Správně: <b>${esc(answers[0])}</b>`:"Zkus to znovu."}};
  b.querySelector("#aok").onclick=go;
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();go()}});
  setTimeout(()=>inp.focus(),50);
 });
}

// ── oslava ──
const EXCL={en:["Nice!","Awesome!","Well done!"],es:["¡Olé!","¡Genial!","¡Bravo!"]};
function party(label,big,sub,art){
 const old=$("#lvl");if(old)old.remove();
 const col=["#ff5c8a","#ffd23f","#4cc26a","#2b5bd7","#ff8a3d","#9b5cff"];
 const conf=Array.from({length:50},()=>{const a=Math.random()*Math.PI*2,d=120+Math.random()*180;return `<i class="cf" style="--x:${(Math.cos(a)*d)|0}px;--y:${(Math.sin(a)*d-50)|0}px;--r:${(Math.random()*720-360)|0}deg;background:${pick(col)};animation-delay:${(Math.random()*.2).toFixed(2)}s"></i>`}).join("");
 const o=document.createElement("div");o.id="lvl";
 o.innerHTML=`<div class="lv-box">${conf}<div class="lv-say">${esc(pick(EXCL[lang()]))}</div><div class="lv-crit">${art}</div><div class="lv-shadow"></div><div class="lv-label">${label}</div><div class="lv-num" style="font-size:clamp(40px,12vw,64px)">${big}</div><div class="lv-sub">${sub}</div></div>`;
 document.body.appendChild(o);
 const close=()=>{if(!o.isConnected||o.classList.contains("out"))return;o.classList.add("out");setTimeout(()=>o.remove(),350)};
 o.addEventListener("pointerdown",close);setTimeout(close,4200);
}
function fly(el,text){
 const r=el.getBoundingClientRect(),f=document.createElement("div");f.className="fly";f.textContent=text;
 f.style.left=(r.left+r.width/2)+"px";f.style.top=(r.top)+"px";document.body.appendChild(f);setTimeout(()=>f.remove(),1100);
 const pill=$("#cRes");if(pill){pill.classList.remove("bump");void pill.offsetWidth;pill.classList.add("bump")}
}

// ── obrazovky ──
let view="map",LS=null;
const body=()=>$("#cityBody");
function resHTML(){const c=C(),f=c.food,fc=f.granule+f.mleko+f.chleb;
 return `<span title="Mince (za fráze)">🪙 ${c.coins}</span><span title="Suroviny (za slovíčka)">📦 ${c.res}</span>${c.b.shop?`<span title="Spíž">🍖 ${fc}</span>`:""}`}
function render(){
 $("#cRes").innerHTML=av()?resHTML():"";
 if(!av())return renderSetup();
 if(view==="lesson"&&LS)return renderLesson();
 renderMap();
}
function renderSetup(){
 let g="m";
 body().innerHTML=`<div class="setup"><h1>Moje město</h1><p class="lead">Přistěhuješ se do prázdného městečka. Každé naučené slovo a věta ti pomůže ho vybudovat.</p>
 <p><b>Kdo jsi?</b></p><div class="avs"><button class="avc on" data-g="m"><svg viewBox="0 0 100 140">${AV("m")}</svg><b>Muž</b></button><button class="avc" data-g="f"><svg viewBox="0 0 100 140">${AV("f")}</svg><b>Žena</b></button></div>
 <input class="tin" id="avName" maxlength="20" placeholder="Tvoje jméno (nepovinné)"><button class="btn wide" id="avGo">Začít hrát</button></div>`;
 body().querySelectorAll(".avc").forEach(b=>b.onclick=()=>{g=b.dataset.g;body().querySelectorAll(".avc").forEach(x=>x.classList.toggle("on",x===b))});
 $("#avGo").onclick=()=>{const s=S();s.city=s.city||{};s.city.avatar={g,name:$("#avName").value.trim()};save();render();
  openModal(`<h2>Kapitola 1: ${CH[0].title}</h2><p>${CH[0].intro(gs())}</p><button class="btn wide" data-close>Jdeme na to</button>`)};
}
function renderMap(){
 const c=C(),cards=[];
 // akce, které čekají
 if(c.ch>2&&!c.pet)cards.push(`<div class="ccard act"><div><b>🐾 Adoptuj mazlíčka</b><span>Psa, nebo kočku? Stojí ${PET_COST} 🪙.</span></div><button class="btn" data-go="adopt">Vybrat</button></div>`);
 if(c.ch>3&&!c.b.shop)cards.push(`<div class="ccard act"><div><b>🏪 Postav obchod</b><span>${SHOP_COST.c} 🪙 + ${SHOP_COST.r} 📦 · klepni na parcelu s plusem</span></div><button class="btn" data-go="build-shop">Postavit</button></div>`);
 if(c.pet&&hunger()<40)cards.push(`<div class="ccard warn"><div><b>${c.pet.kind==="dog"?"🐶":"🐱"} ${esc(c.pet.name)} má hlad</b><span>${c.b.shop?"Nakrm ho ze spíže nebo nakup v obchodě.":"Ve městě zatím není obchod."}</span></div><button class="btn" data-go="pet">Ukázat</button></div>`);
 // kapitola
 if(c.ch<=CH.length){const ch=CH[c.ch-1];cards.push(`<div class="ccard main"><div><span class="kap">Kapitola ${c.ch}</span><b>${ch.title}</b><span>${ch.intro(gs())}</span><span class="small">${ch.items.filter(i=>i.t==="w").length} slov → 📦 · ${ch.items.filter(i=>i.t==="f").length} frází → 🪙</span></div><button class="btn" data-go="lesson-${c.ch}">Začít lekci</button></div>`)}
 else cards.push(`<div class="ccard"><div><span class="kap">Kapitola 4</span><b>Ovoce a zelenina</b><span>Připravujeme. Zatím si vydělávej opakováním kapitol.</span></div></div>`);
 const done=Math.min(c.ch-1,CH.length);
 body().innerHTML=`<div class="mapwrap">${mapSVG()}</div><div class="cards">${cards.join("")}</div>
  ${done?`<p class="small" style="margin:16px 0 6px">Procvičit znovu (½ odměny):</p><div class="chips">${CH.slice(0,done).map((ch,k)=>`<button class="chip" data-go="lesson-${k+1}">↻ ${k+1}. ${ch.title}</button>`).join("")}</div>`:""}`;
 if(c.unfog){setTimeout(()=>{c.unfog=false;save()},1700)}
}
body().addEventListener("click",e=>{
 const t=e.target.closest("[data-act],[data-go]");if(!t)return;
 const a=t.dataset.act||t.dataset.go,c=C();
 if(a.startsWith("lesson-"))return startLesson(+a.slice(7));
 if(a==="adopt")return adopt();
 if(a==="build-shop")return build();
 if(a==="shop")return shop();
 if(a==="pet")return petModal();
 if(a==="house")return houseModal();
 if(a.startsWith("locked-")){const pl=PLOTS[+a.slice(7)];return A.toast(`${pl.name} · odemkne se v kapitole ${pl.ch}`)}
});

// ── lekce ──
function startLesson(id){
 const c=C();if(id>c.ch||id>CH.length)return;
 LS={id,lang:lang(),replay:id<c.ch,items:shuffle(CH[id-1].items.slice()),done:0,earned:{c:0,r:0}};view="lesson";render();window.scrollTo({top:0});
}
function renderLesson(){
 const ch=CH[LS.id-1],L=lang();
 body().innerHTML=`<div class="lhead"><button class="btn ghost sm" id="lBack">← Mapa</button><div><span class="kap">Kapitola ${LS.id}${LS.replay?" · opakování":""}</span><b>${ch.title}</b></div><span id="lProg">0/${LS.items.length}</span></div><div id="lList"></div><p class="help">Podrž českou větu pro nápovědu (bez odměny) · Enter = zkontrolovat</p>`;
 $("#lBack").onclick=()=>{view="map";LS=null;render()};
 const list=$("#lList");
 LS.items.forEach(it=>{
  const mult=LS.replay?.5:1,rew=Math.round(RW[it.t]*mult),el=document.createElement("div");
  el.className="card";
  el.innerHTML=`<div class="cs">${esc(it.cs)}</div><div class="meta"><span class="tag ${it.t==="f"?"new":""}">${it.t==="f"?`fráze · +${rew} 🪙`:`slovo · +${rew} 📦`}</span>${it[L].length>1?`<span class="tag">${it[L].length} ${it[L].length>=5?"variant":"varianty"}</span>`:""}</div>
  <div class="field"><textarea rows="1" lang="${L}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="next"></textarea><div class="reveal">${esc(it[L][0])}</div><button class="say" aria-label="Přehrát">${A.SPK}</button></div><div class="msg"></div><div class="mini"></div><div class="info"></div>`;
  list.appendChild(el);
  const inp=el.querySelector("textarea"),cs=el.querySelector(".cs"),st={done:false,peek:false};it._st=st;it._inp=inp;
  let tm;const end=()=>{clearTimeout(tm);el.classList.remove("peek")};
  cs.addEventListener("pointerdown",()=>{if(st.done)return;tm=setTimeout(()=>{el.classList.add("peek");st.peek=true},450)});
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>cs.addEventListener(ev,end));
  cs.addEventListener("contextmenu",e=>e.preventDefault());
  const fit=()=>{inp.style.height="auto";inp.style.height=inp.scrollHeight+"px"};
  const win=r=>{
   st.done=true;inp.readOnly=true;el.classList.remove("bad");el.classList.add("ok");
   if(!st.peek){const c=C();if(it.t==="f"){c.coins+=rew;LS.earned.c+=rew}else{c.res+=rew;LS.earned.r+=rew}save();fly(el,`+${rew} ${it.t==="f"?"🪙":"📦"}`);$("#cRes").innerHTML=resHTML()}
   const n=it.n&&it.n[L];
   el.querySelector(".info").innerHTML=(r.s==="accent"?`<div class="warn">Pozor na diakritiku: ${esc(r.a)}</div>`:"")+(it[L].length>1?`<div class="vars">Dá se říct i: ${it[L].map(v=>`<b>${esc(v)}</b>`).join(" / ")}</div>`:"")+(n?`<div>💡 ${esc(n)}</div>`:"");
   el.querySelector(".mini").innerHTML=`<span class="mcs">${esc(it.cs)}</span><span class="man">${esc(r.a)}</span><button class="say" aria-label="Přehrát">${A.SPK}</button>`;
   el.querySelector(".mini").onclick=e=>{if(e.target.closest(".say"))A.say(r.a);else el.classList.toggle("open")};
   LS.done++;$("#lProg").textContent=`${LS.done}/${LS.items.length}`;
   const next=LS.items.find(x=>!x._st.done);
   if(next&&document.activeElement===inp)next._inp.focus({preventScroll:true});
   setTimeout(()=>{el.classList.add("compact");if(next)next._inp.scrollIntoView({block:"center",behavior:"smooth"})},600);
   if(LS.done===LS.items.length)setTimeout(finishLesson,900);
  };
  inp.addEventListener("input",()=>{inp.value=inp.value.replace(/\s*\n\s*/g," ");fit();if(st.done)return;el.classList.remove("bad");el.querySelector(".msg").textContent="";const r=check(inp.value,it[L],it.t==="w");if(r.s==="ok"||r.s==="accent")win(r)});
  const judge=()=>{if(st.done)return;const r=check(inp.value,it[L],it.t==="w");if(r.s==="empty")return;if(r.s==="ok"||r.s==="accent")return win(r);el.classList.remove("bad");void el.offsetWidth;el.classList.add("bad")};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();judge()}});
  inp.addEventListener("blur",judge);
  el.querySelector(".say").onclick=()=>A.say(it[L][0]);
 });
}
function finishLesson(){
 const c=C(),id=LS.id,first=!LS.replay,e=LS.earned;
 if(first){c.coins+=BONUS;e.c+=BONUS;c.ch=id+1;if(id===1){c.fog=false;c.unfog=true}}
 save();view="map";LS=null;render();window.scrollTo({top:0});
 party(first?`KAPITOLA ${id} HOTOVÁ`:"OPAKOVÁNÍ HOTOVÉ",`+${e.c} 🪙 +${e.r} 📦`,first?CH[id-1].done:"Peníze a suroviny se hodí na další stavby.",A.CRIT[id%A.CRIT.length]);
 if(first&&id<CH.length)setTimeout(()=>{if(view==="map")openModal(`<h2>Kapitola ${id+1}: ${CH[id].title}</h2><p>${CH[id].intro(gs())}</p><button class="btn wide" data-close>Pokračovat</button>`)},4300);
}

// ── akce ve městě ──
function adopt(){
 const c=C();
 if(c.coins<PET_COST)return openModal(`<h2>Málo mincí</h2><p>Adopce stojí ${PET_COST} 🪙, máš ${c.coins}. Procvič fráze z předchozích kapitol a vyděláš si.</p><button class="btn wide" data-close>OK</button>`);
 const L=lang(),all=PET.dog[L].concat(PET.cat[L]);
 askWord({title:"Koho si vezmeš domů?",top:`<div class="petpick"><svg viewBox="0 0 90 84">${PETSVG("dog")}</svg><svg viewBox="0 0 90 84">${PETSVG("cat")}</svg></div>`,cs:"pes, nebo kočka",answers:all,okText:`Adoptovat · ${PET_COST} 🪙`,onOk:r=>{
  const kind=PET.dog[L].includes(r.a)?"dog":"cat";
  openModal(`<div class="petpick"><svg viewBox="0 0 90 84">${PETSVG(kind)}</svg></div><h2>Jak se bude jmenovat?</h2><input class="tin" id="petName" maxlength="16" placeholder="${kind==="dog"?"Rex":"Micka"}"><button class="btn wide" id="petOk">Hotovo</button>`,b=>{
   const go=()=>{const name=b.querySelector("#petName").value.trim()||(kind==="dog"?"Rex":"Micka");
    c.coins-=PET_COST;c.pet={kind,name,h:70,ts:Date.now()};save();closeModal();render();
    party("NOVÝ PARŤÁK",esc(name),`${kind==="dog"?"Pes":"Kočka"} se nastěhoval${kind==="dog"?"":"a"} k tobě. Časem dostane hlad, tak mysli na obchod!`,`<svg viewBox="0 0 90 84" style="width:100%;height:100%">${PETSVG(kind)}</svg>`)};
   b.querySelector("#petOk").onclick=go;b.querySelector("#petName").addEventListener("keydown",e=>{if(e.key==="Enter")go()});setTimeout(()=>b.querySelector("#petName").focus(),50);
  })}});
}
function build(){
 const c=C();
 if(c.coins<SHOP_COST.c||c.res<SHOP_COST.r)return openModal(`<h2>Na obchod zatím nemáš</h2><p>Potřebuješ ${SHOP_COST.c} 🪙 a ${SHOP_COST.r} 📦. Máš ${c.coins} 🪙 a ${c.res} 📦. Zopakuj si kapitoly a vyděláš si.</p><button class="btn wide" data-close>OK</button>`);
 askWord({title:"Postavit obchod",top:`<div class="petpick"><svg viewBox="-45 -45 90 85">${SHOP(lang())}</svg></div><p class="small">Cena: ${SHOP_COST.c} 🪙 + ${SHOP_COST.r} 📦. Řekni stavitelům, co mají postavit:</p>`,cs:"obchod",answers:CH[2].items[0][lang()],okText:"Stavět!",onOk:()=>{
  c.coins-=SHOP_COST.c;c.res-=SHOP_COST.r;c.b.shop=true;save();closeModal();render();
  party("NOVÁ BUDOVA","🏪","Obchod je otevřený. Klepni na něj a nakup granule pro mazlíčka.",`<svg viewBox="-45 -45 90 85" style="width:100%;height:100%">${SHOP(lang())}</svg>`)}});
}
function shop(knowPrice){
 const c=C(),L=lang();
 const greet=L==="es"?["¡Hola! ¿Qué desea?","Dobrý den! Co si přejete?"]:["Hello! What would you like?","Dobrý den! Co si přejete?"];
 openModal(`<div class="shopk"><div class="sk">${A.CRIT[1]}</div><div class="bub"><b>${greet[0]}</b><span>${greet[1]}</span></div></div>
  <p class="small">Máš ${c.coins} 🪙 · ve spíži: granule ${c.food.granule}, mléko ${c.food.mleko}, chléb ${c.food.chleb}</p>
  <div class="items">${Object.entries(FOOD).map(([k,f])=>`<button class="item" data-buy="${k}"><b>${f.cs}</b><span>${knowPrice?f.price+" 🪙":"? 🪙"}</span></button>`).join("")}</div>
  ${knowPrice?"":`<button class="btn ghost wide" id="askPrice">💬 Zeptat se na cenu</button>`}<button class="btn ghost wide" data-close style="margin-top:8px">Odejít</button>`,b=>{
  const ap=b.querySelector("#askPrice");
  if(ap)ap.onclick=()=>askWord({title:"Zeptej se prodavače",cs:"Kolik to stojí?",answers:CH[2].items[7][L],strip:false,okText:"Zeptat se",onOk:()=>{A.say(CH[2].items[7][L][0]);shop(true)}});
  b.querySelectorAll("[data-buy]").forEach(btn=>btn.onclick=()=>{
   const k=btn.dataset.buy,f=FOOD[k];
   if(!knowPrice)return A.toast("Nejdřív se zeptej, kolik to stojí.");
   if(c.coins<f.price)return A.toast(`Málo mincí (${f.price} 🪙)`);
   askWord({title:"Co si dáte?",cs:f.cs,answers:f[L],okText:`Koupit · ${f.price} 🪙`,onOk:()=>{c.coins-=f.price;c.food[k]++;save();render();A.toast(`Koupeno: ${f.cs}`);shop(true)}});
  });
 });
}
function petModal(){
 const c=C(),p=c.pet;if(!p)return;const h=hunger(),f=c.food;
 openModal(`<div class="petpick"><svg viewBox="0 0 90 84" class="${h<40?"sad":"happy"}">${PETSVG(p.kind)}</svg></div><h2>${esc(p.name)}</h2>
  <p>Sytost</p><div class="hbar"><div style="width:${h}%;background:${h<40?"#e0614f":"#3fae5a"}"></div></div>
  <p class="small">${h<40?"Má hlad!":h<80?"Spokojen"+(p.kind==="dog"?"ý":"á")+".":"Je úplně"+" "+(p.kind==="dog"?"spokojený":"spokojená")+"."}</p>
  ${c.b.shop?`<div class="items">${Object.entries(FOOD).map(([k,fd])=>`<button class="item" data-feed="${k}" ${f[k]?"":"disabled"}><b>${fd.cs}</b><span>${f[k]} ks</span></button>`).join("")}</div>`:`<p>Nemáš čím krmit. Ve městě zatím není obchod.</p>`}
  <button class="btn ghost wide" data-close>Zavřít</button>`,b=>{
  b.querySelectorAll("[data-feed]").forEach(btn=>btn.onclick=()=>{const k=btn.dataset.feed;c.food[k]--;setHunger(hunger()+FOOD[k].feed);A.toast(pick(["Mňam!","Ňam ňam!","Děkuju!"]));petModal();render()});
 });
}
function houseModal(){
 const a=av(),c=C();
 openModal(`<div class="petpick"><svg viewBox="0 0 100 140" style="height:120px">${AV(a.g)}</svg></div><h2>${a.name?esc(a.name):"Tvůj dům"}</h2><p>Zatím malý, ale tvůj. Dokončené kapitoly: ${Math.min(c.ch-1,CH.length)} z ${CH.length}.</p><button class="btn ghost wide" id="chAv">Změnit postavu</button><button class="btn wide" data-close style="margin-top:8px">Zavřít</button>`,b=>{
  b.querySelector("#chAv").onclick=()=>{delete S().city.avatar;save();closeModal();render()};
 });
}

window.City={render:()=>{if(view==="lesson"&&LS&&LS.lang!==lang()){view="map";LS=null}render()},reset:()=>{view="map";LS=null}};
})();
