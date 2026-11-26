// Moje město – hra (levely 1–7)
// Každý level: 1) 3 nová slova, každé 3× správně  2) 3 věty se stejnými slovy, každá 3× správně.
// Kolo = max 6 karet (3 nové + až 3 starší na opakování). Po levelu se ve městě odemkne to, co ses naučil.
// Texty hry jsou v cizím jazyce; česká nápověda zmizí, jakmile dané slovo umíš.
(function(){
const A=window.APP;
const $=s=>document.querySelector(s);
const esc=A.esc,norm=A.norm,noAcc=A.noAcc;
const S=()=>A.S,L=()=>S().lang;
const NEED=3,REVIEW=3,BONUS=5,RW={w:1,s:2},COST={pet:50,shop:150},DECAY=4;
const ART={en:/^(the|a|an|to|some) /,es:/^(el|la|los|las|un|una|unos|unas) /};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a};

// ── obsah levelů ──
const W=(id,cs,en,es,pic,n)=>({t:"w",id,cs,en,es,pic,n});
const T=(cs,en,es,pic,n)=>({t:"s",cs,en,es,pic,n});
const LV=[
 {t:{en:"Hello!",es:"¡Hola!",cs:"Ahoj!"},
  story:{en:"Welcome to your new town! First: who are you?",es:"¡Bienvenido a tu nuevo pueblo! Primero: ¿quién eres?",cs:"Vítej ve svém novém městě! Nejdřív: kdo jsi?"},
  done:{en:"Now choose: man or woman?",es:"Ahora elige: ¿hombre o mujer?",cs:"Teď vyber: muž, nebo žena?"},
  w:[W("name","jméno",["name"],["el nombre"],"🏷️"),W("man","muž",["man"],["el hombre"],"m"),W("woman","žena",["woman"],["la mujer"],"f")],
  s:[T("Toto je muž.",["This is a man.","That is a man.","It is a man.","It's a man."],["Este es un hombre.","Es un hombre."],"m"),
     T("Toto je žena.",["This is a woman.","That is a woman.","It is a woman.","It's a woman."],["Esta es una mujer.","Es una mujer."],"f"),
     T(c=>`Moje jméno je ${c.name}.`,c=>[`My name is ${c.name}.`,`I'm ${c.name}.`,`I am ${c.name}.`],c=>[`Me llamo ${c.name}.`,`Mi nombre es ${c.name}.`,`Soy ${c.name}.`],"🏷️")]},
 {t:{en:"My house",es:"Mi casa",cs:"Můj dům"},
  story:{en:"This is your house. Around it there is only fog.",es:"Esta es tu casa. Alrededor solo hay niebla.",cs:"Tohle je tvůj dům. Kolem je zatím jen mlha."},
  done:{en:"You have a map! The fog is gone.",es:"¡Tienes un mapa! La niebla se fue.",cs:"Máš mapu! Mlha zmizela."},
  w:[W("house","dům",["house","home"],["la casa"],"house"),W("map","mapa",["map"],["el mapa"],"🗺️",{es:"Mapa je mužského rodu: el mapa."}),W("back","zpět",["back"],["atrás"],"↩️")],
  s:[T("Toto je můj dům.",["This is my house.","This is my home.","That is my house.","That's my house.","It is my house.","It's my house."],["Esta es mi casa.","Es mi casa."],"house"),
     T("Kde je mapa?",["Where is the map?","Where's the map?"],["¿Dónde está el mapa?"],"🗺️"),
     T("Jdi zpátky.",["Go back."],["Vuelve.","Vuelve atrás.","Ve atrás.","Regresa."],"↩️",{es:"Volver / regresar = vrátit se."})]},
 {t:{en:"Money",es:"Dinero",cs:"Peníze"},
  story:{en:"You want to build a town. You need money.",es:"Quieres construir un pueblo. Necesitas dinero.",cs:"Chceš postavit město. Potřebuješ peníze."},
  done:{en:"You have a wallet!",es:"¡Tienes una cartera!",cs:"Máš peněženku!"},
  w:[W("coin","mince",["coin","coins"],["la moneda","las monedas"],"🪙"),W("buy","koupit",["buy"],["comprar"],"🛒"),W("build","stavět",["build"],["construir"],"🔨")],
  s:[T("Mám deset mincí.",["I have ten coins.","I have 10 coins.","I've got ten coins.","I've got 10 coins."],["Tengo diez monedas.","Tengo 10 monedas."],"🪙"),
     T("Chci něco koupit.",["I want to buy something.","I'd like to buy something."],["Quiero comprar algo."],"🛒"),
     T("Chci postavit dům.",["I want to build a house.","I'd like to build a house."],["Quiero construir una casa."],"🔨")]},
 {t:{en:"A pet",es:"Una mascota",cs:"Mazlíček"},
  story:{en:"Your house is quiet. You want a friend.",es:"Tu casa está en silencio. Quieres un amigo.",cs:"V domě je ticho. Chceš kamaráda."},
  done:{en:"Now you can adopt a pet!",es:"¡Ahora puedes adoptar una mascota!",cs:"Teď si můžeš adoptovat mazlíčka!"},
  w:[W("dog","pes",["dog"],["el perro"],"dog"),W("cat","kočka",["cat"],["el gato","la gata"],"cat"),W("animal","zvíře",["animal","pet"],["el animal","la mascota"],"🐾",{en:"Pet = domácí mazlíček."})],
  s:[T("Chci psa.",["I want a dog.","I'd like a dog."],["Quiero un perro."],"dog"),
     T("Chci kočku.",["I want a cat.","I'd like a cat."],["Quiero un gato.","Quiero una gata."],"cat"),
     T("To zvíře je moje.",["This animal is mine.","That animal is mine.","The animal is mine.","This is my animal.","This is my pet."],["Este animal es mío.","Ese animal es mío.","El animal es mío.","Es mi animal.","Es mi mascota."],"🐾")]},
 {t:{en:"Food",es:"Comida",cs:"Jídlo"},
  story:{en:"Your pet looks at you. It wants something.",es:"Tu mascota te mira. Quiere algo.",cs:"Mazlíček se na tebe dívá. Něco chce."},
  done:{en:"You have a bowl and some food!",es:"¡Tienes un cuenco y un poco de comida!",cs:"Máš misku a trochu jídla!"},
  w:[W("food","jídlo",["food"],["la comida"],"🍽️"),W("water","voda",["water"],["el agua"],"💧",{es:"Agua je ženského rodu, ale má člen el."}),W("hungry","hladový",["hungry"],["hambriento","hambrienta"],"😋",{es:"Mít hlad = tener hambre."})],
  s:[T(c=>c.pet==="cat"?"Moje kočka má hlad.":"Můj pes má hlad.",c=>[c.pet==="cat"?"My cat is hungry.":"My dog is hungry."],c=>c.pet==="cat"?["Mi gato tiene hambre.","Mi gata tiene hambre."]:["Mi perro tiene hambre."],c=>c.pet||"dog",{es:"Hlad se „má“: tener hambre."}),
     T("Potřebuji jídlo.",["I need food.","I need some food."],["Necesito comida."],"🍽️"),
     T("Tady máš vodu.",["Here is some water.","Here's some water.","Here is water.","Here's water.","Here you have water."],["Aquí tienes agua.","Aquí hay agua."],"💧")]},
 {t:{en:"The shop",es:"La tienda",cs:"Obchod"},
  story:{en:"The food is almost gone. The town needs a shop.",es:"Casi no queda comida. El pueblo necesita una tienda.",cs:"Jídlo skoro došlo. Město potřebuje obchod."},
  done:{en:"Now you can build a shop!",es:"¡Ahora puedes construir una tienda!",cs:"Teď můžeš postavit obchod!"},
  w:[W("shop","obchod",["shop","store"],["la tienda"],"shop",{en:"Shop = Británie, store = USA."}),W("price","cena",["price"],["el precio"],"🏷️"),W("open","otevřeno",["open"],["abierto","abierta"],"🔓")],
  s:[T("Kde je obchod?",["Where is the shop?","Where's the shop?","Where is the store?","Where's the store?"],["¿Dónde está la tienda?"],"shop"),
     T("Kolik to stojí?",["How much is it?","How much does it cost?","What is the price?","What's the price?","How much is this?"],["¿Cuánto cuesta?","¿Cuánto es?","¿Cuál es el precio?"],"🏷️"),
     T("Obchod je otevřený.",["The shop is open.","The store is open."],["La tienda está abierta."],"🔓")]},
 {t:{en:"Shopping",es:"De compras",cs:"Nakupování"},
  story:{en:"Your shop is open, but the shelves are empty. Let's learn what to buy.",es:"Tu tienda está abierta, pero no hay nada. Vamos a aprender qué comprar.",cs:"Obchod je otevřený, ale regály jsou prázdné. Nauč se, co nakupovat."},
  done:{en:"The shop has food now! Go shopping.",es:"¡Ya hay comida en la tienda! Ve de compras.",cs:"V obchodě je zboží! Jdi nakoupit."},
  w:[W("bread","chléb",["bread"],["el pan"],"🍞"),W("milk","mléko",["milk"],["la leche"],"🥛"),W("petfood","granule",["pet food","dog food","cat food"],["la comida para mascotas","el pienso"],"🦴",{en:"Pet food = jídlo pro zvířata.",es:"Pienso = granule (Španělsko)."})],
  s:[T("Chci koupit chléb.",["I want to buy bread.","I'd like to buy bread.","I want to buy some bread.","I'd like to buy some bread."],["Quiero comprar pan."],"🍞"),
     T("Máte mléko?",["Do you have milk?","Have you got milk?","Do you have any milk?","Have you got any milk?"],["¿Tiene leche?","¿Tienen leche?","¿Hay leche?"],"🥛"),
     T("Potřebuji granule.",["I need pet food.","I need some pet food.","I need dog food.","I need cat food."],["Necesito comida para mascotas.","Necesito pienso."],"🦴")]}
];
LV.forEach((lv,i)=>{lv.w.forEach(it=>{it.lv=i+1});lv.s.forEach((it,k)=>{it.lv=i+1;it.id=`l${i+1}s${k}`})});
const ALL=LV.flatMap(l=>l.w.concat(l.s)),BYID=Object.fromEntries(ALL.map(i=>[i.id,i]));
const GOODS={bread:{price:5,feed:25,pic:"🍞"},milk:{price:5,feed:35,pic:"🥛"},petfood:{price:10,feed:100,pic:"🦴"}};
const PLOTS=[{id:"shop",en:"Shop",es:"Tienda",lv:6},{id:"market",en:"Market",es:"Mercado",lv:8},{id:"bus",en:"Bus stop",es:"Parada",lv:9},{id:"cafe",en:"Café",es:"Café",lv:10},{id:"zoo",en:"Zoo",es:"Zoo",lv:3},{id:"school",en:"School",es:"Escuela",lv:12},{id:"doctor",en:"Doctor",es:"Médico",lv:13},{id:"station",en:"Station",es:"Estación",lv:14}];

// ── texty rozhraní (cizí jazyk + česky, dokud slovo neumíš) ──
const UI={back:["Back","Atrás","Zpět","back"],map:["Map","Mapa","Mapa","map"],level:["Level","Nivel","Level"],words:["Words","Palabras","Slova"],sents:["Sentences","Frases","Věty"],
 next:["Next","Siguiente","Další"],close:["Close","Cerrar","Zavřít"],start:["Start","Empezar","Začít"],ok:["OK","OK","Potvrdit"],buy:["Buy","Comprar","Koupit","buy"],build:["Build","Construir","Stavět","build"],
 coins:["Coins","Monedas","Mince","coin"],food:["Food","Comida","Jídlo","food"],water:["Water","Agua","Voda","water"],shop:["Shop","Tienda","Obchod","shop"],price:["Price","Precio","Cena","price"],
 hungry:["Hungry","Hambriento","Hladový","hungry"],pet:["Pet","Mascota","Mazlíček","animal"],house:["House","Casa","Dům","house"],name:["Name","Nombre","Jméno","name"],
 soon:["Coming soon","Muy pronto","Připravujeme"],practice:["Practice","Practicar","Procvičit"],adopt:["Adopt","Adoptar","Adoptovat"],
 new:["new","nueva","nové"],done:["Done!","¡Hecho!","Hotovo!"],ask:["How much is it?","¿Cuánto cuesta?","Kolik to stojí?"]};
function st(id){const c=C();return c.st[id]||(c.st[id]={c:0,w:0})}
const known=id=>!!id&&st(id).c>=NEED;
function ui(k){const u=UI[k],i=L()==="es"?1:0;return `<span class="ui">${esc(u[i])}${known(u[3])?"":`<small>${esc(u[2])}</small>`}</span>`}
const bi=o=>`<span class="bi">${esc(o[L()])}<small>${esc(o.cs)}</small></span>`;
const writeIn=()=>L()==="es"?{es:"Escribe en español:",cs:"Napiš španělsky:"}:{en:"Write in English:",cs:"Napiš anglicky:"};

// ── stav ──
const P=()=>{const s=S();return s.cityP||(s.cityP={})};
function C(){const s=S();s.city2=s.city2||{};return s.city2[s.lang]||(s.city2[s.lang]={lv:1,part:"w",coins:0,st:{},pet:null,b:{},food:0,goods:{bread:0,milk:0,petfood:0}})}
const save=()=>A.save();
const ctx=()=>({name:P().name||"Alex",pet:C().pet&&C().pet.kind,g:P().g});
const tx=(it,f)=>{const v=it[f];return typeof v==="function"?v(ctx()):v};
const wallet=()=>C().lv>3;
// odměny: 1. dokončení plně, 2. polovina, 3. a další čtvrtina (zlomky mincí se sčítají)
const MULT=[1,.5,.25];
const runs=key=>{const r=(C().runs||{})[key];return r!=null?r:((C().quiz||{})[key]?1:0)};
const mult=key=>key==="practice"?.25:MULT[Math.min(runs(key),2)];
function pay(base,key){const c=C(),v=base*mult(key);c.cfrac=(c.cfrac||0)+v;const add=Math.floor(c.cfrac+1e-9);c.cfrac-=add;c.coins+=add;return v}
function finishRun(key){const c=C();c.runs=c.runs||{};c.runs[key]=runs(key)+1;save()}
const fmt=v=>String(Math.round(v*100)/100).replace(".",",");
function hunger(){const p=C().pet;if(!p||!p.ts)return 100;return Math.max(0,Math.round(p.h-(Date.now()-p.ts)/36e5*DECAY))}
function pending(){const c=C();if(c.lv>1&&!P().g)return"avatar";if(c.lv>4&&!c.pet)return"pet";if(c.lv>6&&!c.b.shop)return"shop";return null}

// ── kontrola ──
function check(raw,answers,strip){
 const n=s=>{let t=norm(s).t;if(strip)t=t.replace(ART[L()],"");return t};
 const i=n(raw);if(!i)return{s:"empty"};let best=null;
 for(const a of answers){const t=n(a);if(i===t)return{s:"ok",a};if(noAcc(i)===noAcc(t))best={s:"accent",a}}
 return best||{s:"bad"};
}

// ── grafika ──
const HOUSE=`<ellipse cx="0" cy="40" rx="48" ry="8" fill="rgba(0,0,0,.12)"/><rect x="-36" y="-8" width="72" height="48" rx="5" fill="#fff4da" stroke="#c9a46a" stroke-width="2"/><path d="M-46 -6 L0 -46 L46 -6Z" fill="#e0614f" stroke="#b8473a" stroke-width="2" stroke-linejoin="round"/><rect x="20" y="-38" width="10" height="16" fill="#b8473a"/><rect x="-8" y="14" width="16" height="26" rx="3" fill="#9b6334"/><rect x="-28" y="4" width="15" height="13" rx="2" fill="#a8dcf7" stroke="#c9a46a" stroke-width="2"/><rect x="13" y="4" width="15" height="13" rx="2" fill="#a8dcf7" stroke="#c9a46a" stroke-width="2"/>`;
const SHOP=(lbl)=>`<ellipse cx="0" cy="30" rx="40" ry="7" fill="rgba(0,0,0,.12)"/><rect x="-32" y="-12" width="64" height="42" rx="4" fill="#fff" stroke="#c9a46a" stroke-width="2"/>${[0,1,2,3,4,5].map(k=>`<path d="M${-34+k*11.4} -14 h11.4 v10 a5.7 5.7 0 0 1 -11.4 0z" fill="${k%2?"#fff":"#2f9e6a"}" stroke="#25805a" stroke-width="1"/>`).join("")}<rect x="-28" y="-30" width="56" height="15" rx="3" fill="#25805a"/><text x="0" y="-19" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${lbl}</text><rect x="-7" y="8" width="14" height="22" rx="2" fill="#9b6334"/><rect x="-26" y="6" width="14" height="12" rx="2" fill="#a8dcf7"/><rect x="12" y="6" width="14" height="12" rx="2" fill="#a8dcf7"/>`;
function AV(g,look){
 look=look||P().look||{};const shirt=look.shirt||(g==="f"?"#e86f9a":"#4a7bd6"),hair=look.hair||"#6b4226",skin="#f3c9a0";
 return `<ellipse cx="50" cy="132" rx="26" ry="6" fill="rgba(0,0,0,.15)"/><rect x="39" y="98" width="9" height="32" rx="4" fill="${look.trousers||"#3b3f58"}"/><rect x="52" y="98" width="9" height="32" rx="4" fill="${look.trousers||"#3b3f58"}"/>${look.shoes?`<ellipse cx="42" cy="130" rx="8" ry="4.5" fill="${look.shoes}" stroke="#bbb"/><ellipse cx="58" cy="130" rx="8" ry="4.5" fill="${look.shoes}" stroke="#bbb"/>`:""}<path d="M34 70 L20 92" stroke="${skin}" stroke-width="8" stroke-linecap="round"/><path d="M66 70 L80 92" stroke="${skin}" stroke-width="8" stroke-linecap="round"/>${g==="f"?`<path d="M36 62 h28 l10 44 h-48z" fill="${shirt}"/><path d="M25 46 Q22 14 50 15 Q78 14 75 46 L76 74 Q66 66 68 46 Q62 30 50 30 Q38 30 32 46 Q34 66 24 74Z" fill="${hair}"/>`:`<rect x="31" y="62" width="38" height="42" rx="12" fill="${shirt}"/>`}<circle cx="50" cy="42" r="22" fill="${skin}"/>${g==="f"?`<path d="M28 40 Q30 18 50 18 Q70 18 72 40 Q60 30 50 30 Q40 30 28 40Z" fill="${hair}"/>`:`<path d="M27 40 Q28 16 50 17 Q73 16 73 40 Q66 27 50 29 Q35 27 27 40Z" fill="${hair}"/>`}<circle cx="42" cy="44" r="${look.eye?3.6:2.8}" fill="${look.eye||"#2a1d14"}"/><circle cx="58" cy="44" r="${look.eye?3.6:2.8}" fill="${look.eye||"#2a1d14"}"/>${look.nose?`<ellipse cx="50" cy="49" rx="${look.nose==="big"?5.5:3}" ry="${look.nose==="big"?4.5:2.5}" fill="#e3a07a"/>`:""}${look.lips==="small"?`<path d="M46 54 Q50 58 54 54 Z" fill="#e0614f"/>`:look.lips?`<path d="M42 51 Q50 61 58 51 Z" fill="${look.lips}"/>`:`<path d="M43 52 Q50 58 57 52" stroke="#2a1d14" stroke-width="2.5" fill="none" stroke-linecap="round"/>`}${look.glasses?`<circle cx="42" cy="44" r="7" fill="rgba(255,255,255,.25)" stroke="#2a1d14" stroke-width="2"/><circle cx="58" cy="44" r="7" fill="rgba(255,255,255,.25)" stroke="#2a1d14" stroke-width="2"/><path d="M49 44 h2 M35 43 l-6 -2 M65 43 l6 -2" stroke="#2a1d14" stroke-width="2"/>`:""}${look.hat?`<path d="M27 32 Q28 10 50 10 Q72 10 73 32 Z" fill="${look.hat}"/><path d="M68 30 h18 a3.5 3.5 0 0 1 0 7 h-18z" fill="${look.hat}"/>`:""}<circle cx="36" cy="51" r="4" fill="#f77" opacity=".35"/><circle cx="64" cy="51" r="4" fill="#f77" opacity=".35"/>`;
}
function PETSVG(k,collar,pal,ex){
 const X=ex?`<circle cx="-5" cy="84" r="6" fill="#e0614f"/><path d="M78 82 h24 a12 7 0 0 1 -24 0z" fill="#3b6fd8"/><ellipse cx="90" cy="82" rx="12" ry="2.5" fill="#8a5a2b"/>`+(k==="dog"?`<g transform="translate(6,52) rotate(-20)"><rect x="-8" y="-2" width="16" height="4" rx="2" fill="#fff" stroke="#bbb"/><circle cx="-8" cy="-2" r="2.6" fill="#fff" stroke="#bbb"/><circle cx="-8" cy="2" r="2.6" fill="#fff" stroke="#bbb"/><circle cx="8" cy="-2" r="2.6" fill="#fff" stroke="#bbb"/><circle cx="8" cy="2" r="2.6" fill="#fff" stroke="#bbb"/></g>`:`<g transform="translate(8,66)"><ellipse rx="7" ry="3.5" fill="#7fa7c9"/><path d="M6 0 l6 -4 v8z" fill="#7fa7c9"/><circle cx="-4" cy="-1" r="1" fill="#222"/></g>`):"";
 const P0=k==="dog"?{fur:"#c98b4f",head:"#d9a066",leg:"#b87a40",ear:"#8a5a2b",tail:"#c98b4f",eye:null,nose:"#2a1d14"}:{fur:"#f0a050",head:"#f0a050",leg:"#e98a3a",ear:null,tail:"#e98a3a",eye:null,nose:"#e0607a"};
 const q=Object.assign({},P0,pal||{});
 const col=collar?(k==="dog"?`<path d="M28 52 q9 7 18 -1" stroke="#e0614f" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="37" cy="57" r="3.2" fill="#ffd23f"/>`:`<path d="M17 50 q11 7 22 0" stroke="#3566d6" stroke-width="4.5" fill="none" stroke-linecap="round"/><circle cx="28" cy="55" r="3" fill="#ffd23f"/>`):"";
 if(k==="dog")return `<ellipse cx="42" cy="76" rx="26" ry="5" fill="rgba(0,0,0,.15)"/><path d="M66 52 q14 -8 10 -22" stroke="${q.tail}" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="30" y="58" width="8" height="18" rx="4" fill="${q.leg}"/><rect x="54" y="58" width="8" height="18" rx="4" fill="${q.leg}"/>${q.paw?`<ellipse cx="34" cy="76" rx="6" ry="3.5" fill="${q.paw}" stroke="#ccc"/><ellipse cx="58" cy="76" rx="6" ry="3.5" fill="${q.paw}" stroke="#ccc"/>`:""}<ellipse cx="48" cy="56" rx="24" ry="15" fill="${q.fur}"/><circle cx="26" cy="38" r="17" fill="${q.head}"/><ellipse cx="12" cy="40" rx="6" ry="12" fill="${q.ear}"/><ellipse cx="40" cy="38" rx="6" ry="12" fill="${q.ear}"/>${q.eye?`<circle cx="21" cy="36" r="3.4" fill="${q.eye}"/><circle cx="31" cy="36" r="3.4" fill="${q.eye}"/>`:`<circle cx="21" cy="36" r="2.6" fill="#2a1d14"/><circle cx="31" cy="36" r="2.6" fill="#2a1d14"/>`}<ellipse cx="26" cy="45" rx="4.5" ry="3.2" fill="${q.nose}"/>${q.tongue?`<ellipse cx="26" cy="54" rx="3.5" ry="4.5" fill="${q.tongue}"/>`:""}<path d="M22 50 q4 4 8 0" stroke="#2a1d14" stroke-width="2" fill="none" stroke-linecap="round"/>`+col+X;
 return `<ellipse cx="42" cy="76" rx="24" ry="5" fill="rgba(0,0,0,.15)"/><path d="M64 66 Q84 60 74 38" stroke="${q.tail}" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="46" cy="60" rx="22" ry="16" fill="${q.fur}"/><path d="M12 30 L16 8 L30 22Z M44 30 L40 8 L26 22Z" fill="${q.head}"/>${q.ear?`<path d="M15 24 L17 13 L24 21Z M41 24 L39 13 L32 21Z" fill="${q.ear}"/>`:""}<circle cx="28" cy="36" r="17" fill="${q.head}"/>${q.eye?`<circle cx="21" cy="33" r="3.4" fill="${q.eye}"/><circle cx="35" cy="33" r="3.4" fill="${q.eye}"/>`:`<path d="M17 33 q4 -4 8 0 M31 33 q4 -4 8 0" stroke="#2a1d14" stroke-width="2.5" fill="none" stroke-linecap="round"/>`}<path d="M25 41 h6 l-3 3z" fill="${q.nose}"/><path d="M8 40 H20 M8 46 L20 44 M36 40 H48 M36 44 L48 46" stroke="#2a1d14" stroke-width="1.3" opacity=".6"/><ellipse cx="36" cy="74" rx="7" ry="4" fill="${q.paw||q.leg}" ${q.paw?'stroke="#ccc"':""}/><ellipse cx="56" cy="74" rx="7" ry="4" fill="${q.paw||q.leg}" ${q.paw?'stroke="#ccc"':""}/>`+col+X;
}
const shopLbl=()=>L()==="es"?"TIENDA":"SHOP";
function pic(p){
 if(typeof p==="function")p=p(ctx());
 if(p==="m"||p==="f")return `<svg viewBox="0 0 100 140">${AV(p,{})}</svg>`;
 if(p==="house")return `<svg viewBox="-50 -50 100 95">${HOUSE}</svg>`;
 if(p==="shop")return `<svg viewBox="-42 -36 84 72">${SHOP(shopLbl())}</svg>`;
 if(p==="dog"||p==="cat")return `<svg viewBox="0 0 90 84">${PETSVG(p)}</svg>`;
 return `<span class="emo">${p}</span>`;
}
const LOCK=`<path d="M-6 -2 v-5 a6 6 0 0 1 12 0 v5" stroke="#6f8f63" stroke-width="2.4" fill="none"/><rect x="-9" y="-3" width="18" height="13" rx="3" fill="#6f8f63"/>`;
const pos=i=>{const a=(-90+i*45)*Math.PI/180;return[200+140*Math.cos(a),205+138*Math.sin(a)]};

function mapSVG(){
 const c=C(),p=P(),Lg=L(),out=[];
 out.push(`<rect width="400" height="410" rx="28" fill="#c4e6aa"/>`);
 [[30,40],[372,60],[24,360],[376,372],[110,384],[300,22],[60,200],[345,215]].forEach(([x,y],k)=>out.push(`<g transform="translate(${x},${y})"><circle r="${12+k%3*3}" fill="#8fc77a"/><circle r="${7+k%2*3}" cx="-4" cy="-4" fill="#a6d690"/></g>`));
 PLOTS.forEach((_,i)=>{const[x,y]=pos(i);out.push(`<line x1="200" y1="205" x2="${x}" y2="${y}" stroke="#eedfbb" stroke-width="16" stroke-linecap="round"/>`)});
 PLOTS.forEach((pl,i)=>{
  const[x,y]=pos(i),built=c.b[pl.id],can=c.lv>pl.lv;
  if(pl.id==="zoo"&&c.lv>=3)out.push(`<g class="tap" data-act="zoo" transform="translate(${x},${y})"><ellipse cy="28" rx="40" ry="6" fill="rgba(0,0,0,.12)"/><rect x="-36" y="-14" width="72" height="42" rx="8" fill="#8fc77a" stroke="#4c9a5a" stroke-width="2"/><path d="M-30 -14 q30 -26 60 0" fill="#ffd23f" stroke="#c9a46a" stroke-width="2"/><text y="-12" text-anchor="middle" font-size="12" font-weight="800" fill="#7a4b24">ZOO</text><text y="12" text-anchor="middle" font-size="18" dominant-baseline="central">🦁🐘</text></g>`);
  else if(built)out.push(`<g class="tap" data-act="${pl.id}" transform="translate(${x},${y})">${SHOP(shopLbl())}${c.lv<=7?`<g transform="translate(24,16)"><rect x="-17" y="-8" width="34" height="14" rx="3" fill="#fff" stroke="#c9a46a"/><text y="3" text-anchor="middle" font-size="8" font-weight="700" fill="#b8473a">${Lg==="es"?"VACÍA":"EMPTY"}</text></g>`:""}</g>`);
  else if(can)out.push(`<g class="tap pulse" data-act="build-${pl.id}" transform="translate(${x},${y})"><rect x="-38" y="-30" width="76" height="60" rx="12" fill="#f6ebcb" stroke="#c9a46a" stroke-width="2.5" stroke-dasharray="6 5"/><text y="4" text-anchor="middle" font-size="26" font-weight="700" fill="#b08a4e">+</text><text y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#8a6a36">${pl[Lg]}</text></g>`);
  else out.push(`<g class="tap" data-act="locked-${i}" transform="translate(${x},${y})"><rect x="-38" y="-30" width="76" height="60" rx="12" fill="rgba(255,255,255,.45)" stroke="#9fc08c" stroke-width="2" stroke-dasharray="4 4"/><g transform="translate(0,-6)">${LOCK}</g><text y="21" text-anchor="middle" font-size="12" font-weight="700" fill="#5f7d54">${Lg==="es"?"Nivel":"Level"} ${pl.lv}</text></g>`);
 });
 out.push(`<g class="tap" data-act="house" transform="translate(200,196)">${HOUSE}</g>`);
 if(p.g)out.push(`<g class="tap" data-act="me" transform="translate(228,206) scale(.42)">${AV(p.g)}</g>`);
 if(c.own&&c.own.home)out.push(`<g transform="translate(104,250)">${c.pet&&c.pet.kind==="cat"?`<ellipse cy="10" rx="20" ry="8" fill="#e86f9a"/><ellipse cy="7" rx="14" ry="5" fill="#f7d3e4"/>`:`<path d="M-20 2 L0 -16 L20 2Z" fill="#b8473a"/><rect x="-16" y="2" width="32" height="20" fill="#c98b4f"/><path d="M-6 22 v-9 a6 6 0 0 1 12 0 v9z" fill="#3a2a1a"/>`}</g>`);
 if(c.pet){const h=hunger();out.push(`<g class="tap" data-act="pet" transform="translate(132,212) scale(.62)">${PETSVG(c.pet.kind,c.own&&c.own.collar,FURC[c.fur])}${c.lv>5&&h<40?`<g transform="translate(46,-6)"><circle r="14" fill="#fff" stroke="#e0614f" stroke-width="3"/><text y="6" text-anchor="middle" font-size="18" font-weight="700" fill="#e0614f">!</text></g>`:""}</g>`);
  if(c.lv>5)out.push(`<g transform="translate(118,262)"><ellipse rx="14" ry="5" fill="#5b8fd6"/><ellipse cy="-2" rx="11" ry="3" fill="${c.food?"#b8864a":"#cfe0f5"}"/></g>`)}
 if(c.lv<=2||c.unfog){
  out.push(`<defs><mask id="fm"><rect width="400" height="410" fill="#fff"/><circle cx="200" cy="200" r="82" fill="#000"/></mask></defs><g class="${c.unfog?"fogout":""}" mask="url(#fm)"><rect width="400" height="410" rx="28" fill="#eef2f7" opacity=".97"/>${[[90,90],[300,80],[80,300],[320,320],[200,360],[200,40],[40,190],[360,200]].map(([x,y])=>`<g transform="translate(${x},${y})" fill="#fff"><circle r="34"/><circle cx="-30" cy="10" r="24"/><circle cx="30" cy="10" r="26"/></g>`).join("")}</g>`);
 }
 return `<svg class="map" viewBox="0 0 400 410" role="img" aria-label="Map">${out.join("")}</svg>`;
}

// ── modální okno ──
const modal=$("#cmodal"),mbody=$("#cmodalBody");
function openModal(html,bind){mbody.innerHTML=html;modal.hidden=false;if(bind)bind(mbody)}
function closeModal(){modal.hidden=true;mbody.innerHTML=""}
modal.addEventListener("click",e=>{if(e.target===modal||e.target.closest("[data-close]"))closeModal()});
function askWord({title,top="",cs,answers,strip=true,okHtml,onOk}){
 let tries=0;
 openModal(`${top}<h2>${title}</h2><p>${bi(writeIn())} <b class="ask">${esc(cs)}</b></p>
  <textarea rows="1" class="ain" lang="${L()}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"></textarea>
  <p class="amsg"></p><div class="row2"><button class="btn ghost" data-close>${ui("close")}</button><button class="btn" id="aok">${okHtml||ui("ok")}</button></div>`,b=>{
  const inp=b.querySelector(".ain"),msg=b.querySelector(".amsg");
  const go=()=>{const r=check(inp.value,answers,strip);
   if(r.s==="ok"||r.s==="accent")onOk(r);
   else if(r.s!=="empty"){tries++;inp.classList.remove("shake");void inp.offsetWidth;inp.classList.add("shake");msg.innerHTML=tries>=2?`Správně: <b>${esc(answers[0])}</b>`:"Zkus to znovu."}};
  b.querySelector("#aok").onclick=go;
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();go()}});
  setTimeout(()=>inp.focus(),50);
 });
}
function info(title,text,btn="close",then){openModal(`<h2>${title}</h2><p>${text}</p><button class="btn wide" id="iok">${ui(btn)}</button>`,b=>b.querySelector("#iok").onclick=()=>{closeModal();then&&then()})}

// ── oslava ──
const EXCL={en:["Nice!","Awesome!","Well done!"],es:["¡Olé!","¡Genial!","¡Bravo!"]};
function party(label,big,sub,art,ms=4200){
 const old=$("#lvl");if(old)old.remove();
 const col=["#ff5c8a","#ffd23f","#4cc26a","#2b5bd7","#ff8a3d","#9b5cff"];
 const conf=Array.from({length:50},()=>{const a=Math.random()*Math.PI*2,d=120+Math.random()*180;return `<i class="cf" style="--x:${(Math.cos(a)*d)|0}px;--y:${(Math.sin(a)*d-50)|0}px;--r:${(Math.random()*720-360)|0}deg;background:${pick(col)};animation-delay:${(Math.random()*.2).toFixed(2)}s"></i>`}).join("");
 const o=document.createElement("div");o.id="lvl";
 o.innerHTML=`<div class="lv-box">${conf}<div class="lv-say">${esc(pick(EXCL[L()]))}</div><div class="lv-crit">${art}</div><div class="lv-shadow"></div><div class="lv-label">${label}</div><div class="lv-num" style="font-size:clamp(34px,10vw,56px)">${big}</div><div class="lv-sub">${sub}</div></div>`;
 document.body.appendChild(o);
 return new Promise(res=>{const close=()=>{if(!o.isConnected||o.classList.contains("out"))return;o.classList.add("out");setTimeout(()=>{o.remove();res()},350)};o.addEventListener("pointerdown",close);setTimeout(close,ms)});
}
function fly(el,text){
 const r=el.getBoundingClientRect(),f=document.createElement("div");f.className="fly";f.textContent=text;
 f.style.left=(r.left+r.width/2)+"px";f.style.top=r.top+"px";document.body.appendChild(f);setTimeout(()=>f.remove(),1100);
 const pill=$("#cRes");if(pill){pill.classList.remove("bump");void pill.offsetWidth;pill.classList.add("bump")}
}

// ── obrazovky ──
let view="map",LS=null,nextT=null;
const body=()=>$("#cityBody");
function resHTML(){const c=C(),out=[];if(wallet())out.push(`<span title="Coins / mince">🪙 ${c.coins}</span>`);if(c.lv>5)out.push(`<span title="Food / jídlo">🍽️ ${c.food}</span>`);if(c.lv>7)out.push(`<span title="Pet food / granule">🦴 ${c.goods.petfood}</span>`);return out.join("")}
function render(){
 $("#cBack").innerHTML=ui("back");
 $("#cRes").innerHTML=P().name?resHTML():"";
 if(!P().name)return renderStart();
 if(view==="lesson"&&LS)return renderLesson();
 if(view==="house")return renderHouse();
 if(view==="me")return renderMe();
 if(view==="petv")return renderPetV();
 if(view==="zoo")return renderZoo();
 renderMap();
}
function renderStart(){
 body().innerHTML=`<div class="setup"><div class="startpic">${pic("house")}</div><h1>${bi({en:"Your new town",es:"Tu nuevo pueblo",cs:"Tvoje nové město"})}</h1>
  <p class="lead">Hra, ve které se učíš ${L()==="es"?"španělsky":"anglicky"} a s každým levelem buduješ vlastní městečko. Texty hry jsou ${L()==="es"?"španělsky":"anglicky"}; český překlad pod nimi zmizí, jakmile slovo umíš.</p>
  <p><b>${bi({en:"What is your name?",es:"¿Cómo te llamas?",cs:"Jak se jmenuješ?"})}</b></p>
  <input class="tin" id="avName" maxlength="20" autocomplete="off" placeholder="Jakub"><button class="btn wide" id="avGo">${ui("start")}</button></div>`;
 const go=()=>{const n=$("#avName").value.trim();if(!n)return A.toast("Napiš svoje jméno");P().name=n;save();render();storyModal(1)};
 $("#avGo").onclick=go;$("#avName").addEventListener("keydown",e=>{if(e.key==="Enter")go()});
}
function storyModal(n){if(n>LV.length)return;const lv=LV[n-1];info(`${ui("level")} ${n}: ${bi(lv.t)}`,bi(lv.story),"start")}
function renderMap(){
 const c=C(),cards=[],pend=pending();
 if(pend==="avatar")cards.push(`<div class="ccard act"><div><b>${bi(LV[0].done)}</b></div><button class="btn" data-go="avatar">${ui("next")}</button></div>`);
 if(pend==="pet")cards.push(`<div class="ccard act"><div><b>${bi(LV[3].done)}</b><span>${COST.pet} 🪙</span></div><button class="btn" data-go="pet-adopt">${ui("adopt")}</button></div>`);
 if(pend==="shop")cards.push(`<div class="ccard act"><div><b>${bi(LV[5].done)}</b><span>${COST.shop} 🪙</span></div><button class="btn" data-go="build-shop">${ui("build")}</button></div>`);
 if(c.pet&&c.lv>5&&hunger()<40)cards.push(`<div class="ccard warn"><div><b>${bi({en:`${c.pet.name} is hungry!`,es:`¡${c.pet.name} tiene hambre!`,cs:`${c.pet.name} má hlad!`})}</b></div><button class="btn" data-go="pet">${ui("food")}</button></div>`);
 if(c.lv<=LV.length){
  const lv=LV[c.lv-1],nw=lv[c.part],prog=nw.reduce((a,i)=>a+Math.min(st(i.id).c,NEED),0);
  cards.push(`<div class="ccard main"><div><span class="kap">${ui("level")} ${c.lv} · ${ui(c.part==="w"?"words":"sents")}</span><b>${bi(lv.t)}</b><span>${bi(lv.story)}</span>
   <div class="pre">${nw.map(i=>`<span class="pchip">${pic(i.pic)}<i>${"●".repeat(Math.min(st(i.id).c,NEED))}${"○".repeat(NEED-Math.min(st(i.id).c,NEED))}</i></span>`).join("")}</div></div>
   ${pend?`<span class="small">Nejdřív dokonči úkol výš.</span>`:`<button class="btn" data-go="lesson">${ui(prog?"next":"start")}</button>`}</div>`);
 }else cards.push(`<div class="ccard"><div><span class="kap">${ui("level")} 8</span><b>${ui("soon")}</b><span>Další levely připravujeme. Zatím si procvičuj a vydělávej.</span></div><button class="btn" data-go="practice">${ui("practice")}</button></div>`);
 body().innerHTML=`<div class="mapwrap">${mapSVG()}</div><div class="cards">${cards.join("")}</div>`;
 if(c.unfog)setTimeout(()=>{c.unfog=false;save()},1700);
}
document.addEventListener("click",e=>{
 if(!e.target.closest("#cityBody"))return;
 const t=e.target.closest("[data-act],[data-go]");if(!t)return;
 const a=t.dataset.act||t.dataset.go;
 if(a==="lesson")return startLesson(false);
 if(a==="practice")return startLesson(true);
 if(a==="avatar")return chooseAvatar();
 if(a==="pet-adopt")return adopt();
 if(a==="build-shop")return build();
 if(a==="shop")return shop();
 if(a==="pet"){view="petv";return render()}
 if(a.startsWith("room-")){const r=ROOMS[+a.slice(5)];return A.toast(`${r[L()]} · ${L()==="es"?"nivel":"level"} ${r.lv}`)}
 if(a==="house"){view="house";return render()}
 if(a==="me"){view="me";return render()}
 if(a==="zoo"){view="zoo";return render()}
 if(a==="feed")return petModal();
 if(a==="tomap"){view="map";return render()}
 if(a.startsWith("fbuy-")){const id=a.slice(5);return converse(FURN[id],()=>{C().own[id]=true})}
 if(a.startsWith("pbuy-")){const id=a.slice(5);return converse(petItem(id),()=>{C().own[id]=true})}
 if(a.startsWith("tsel-")){const[,k,i]=a.split("-");const c=C();c.tsel=c.tsel||{};c.tsel[k]=+i;save();return render()}
 if(a.startsWith("wear-")){const lk=P().look||(P().look={}),k=a.slice(5);if(lk[k])delete lk[k];else lk[k]=k==="hat"?"#e0614f":true;save();return render()}
 if(a.startsWith("paint-")){C().paint=a.slice(6);save();return render()}
 if(a.startsWith("fur-")){C().fur=a.slice(4);save();return render()}
 if(a.startsWith("look-")){const[,k,v]=a.split("-");const lk=P().look||(P().look={});lk[k]=v;save();return render()}
 if(a.startsWith("locked-")){const pl=PLOTS[+a.slice(7)];return A.toast(`${pl[L()]} · ${L()==="es"?"nivel":"level"} ${pl.lv}`)}
});

// ── lekce ──
function weighted(pool,n){
 const items=pool.map(i=>{const s=st(i.id);return{i,w:1+Math.max(0,NEED-s.c)*1.5+Math.min(s.w,4)*.6+i.lv*.3}}),out=[];
 while(out.length<n&&items.length){let r=Math.random()*items.reduce((a,b)=>a+b.w,0),k=0;while((r-=items[k].w)>0&&k<items.length-1)k++;out.push(items.splice(k,1)[0].i)}
 return out;
}
function roundItems(practice){
 const c=C();
 if(practice)return shuffle(weighted(ALL.filter(i=>i.lv<c.lv),6));
 const nw=LV[c.lv-1][c.part],older=LV.slice(0,c.lv-1).flatMap(l=>l[c.part]);
 return shuffle(nw.concat(weighted(older,REVIEW)));
}
function startLesson(practice){
 const c=C();if(!practice&&(pending()||c.lv>LV.length))return;
 clearTimeout(nextT);LS={practice,lang:L(),items:roundItems(practice)};view="lesson";render();window.scrollTo({top:0});
}
function renderLesson(){
 const c=C(),Lg=L(),lv=LV[Math.min(c.lv,LV.length)-1];
 const head=LS.practice?ui("practice"):`${ui("level")} ${c.lv} · ${ui(c.part==="w"?"words":"sents")}`;
 body().innerHTML=`<div class="lhead"><button class="btn ghost sm" id="lBack">← ${ui("map")}</button><div><span class="kap">${head}</span>${LS.practice?"":`<b>${bi(lv.t)}</b>`}</div></div><div id="lList"></div><p class="help">Podrž český text pro nápovědu (bez odměny) · Enter = zkontrolovat</p>`;
 $("#lBack").onclick=()=>{clearTimeout(nextT);view="map";LS=null;render()};
 const list=$("#lList"),cards=[];
 LS.items.forEach(it=>{
  const isNew=!LS.practice&&it.lv===c.lv,ans=tx(it,Lg),rew=RW[it.t],el=document.createElement("div"),s0=st(it.id);
  el.className="card cc";
  el.innerHTML=`<div class="crow"><div class="cpic">${pic(it.pic)}</div><div class="cs">${esc(tx(it,"cs"))}</div></div><div class="meta"><span class="dots">${[0,1,2].map(k=>`<i class="${k<s0.c?"on":""}"></i>`).join("")}</span>${isNew?`<span class="tag new">${ui("new")}</span>`:""}${L()==="es"&&s0.c>=2?`<span class="tag st">přesně s diakritikou</span>`:""}${ans.length>1?`<span class="tag">${ans.length} ${ans.length>=5?"variant":"varianty"}</span>`:""}</div>
  <div class="field"><textarea rows="1" lang="${Lg}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="next"></textarea><div class="reveal">${esc(ans[0])}</div><button class="say" aria-label="Play">${A.SPK}</button></div><div class="msg"></div><div class="mini"></div><div class="info"></div>`;
  list.appendChild(el);
  const inp=el.querySelector("textarea"),cs=el.querySelector(".crow"),stt={done:false,peek:false,wrong:false};cards.push({el,inp,stt});
  let tm;const end=()=>{clearTimeout(tm);el.classList.remove("peek")};
  cs.addEventListener("pointerdown",()=>{if(stt.done)return;tm=setTimeout(()=>{el.classList.add("peek");stt.peek=true},450)});
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>cs.addEventListener(ev,end));
  cs.addEventListener("contextmenu",e=>e.preventDefault());
  const fit=()=>{inp.style.height="auto";inp.style.height=inp.scrollHeight+"px"};
  const win=r=>{
   stt.done=true;inp.readOnly=true;el.classList.remove("bad");el.classList.add("ok");
   const s=st(it.id);
   if(!stt.peek){s.c++;const v=pay(rew,LS.practice?"practice":"L"+c.lv);if(wallet())fly(el,`+${fmt(v)} 🪙`);$("#cRes").innerHTML=resHTML()}
   save();
   el.querySelector(".dots").innerHTML=[0,1,2].map(k=>`<i class="${k<s.c?"on":""}"></i>`).join("");
   const n=it.n&&it.n[Lg];
   el.querySelector(".info").innerHTML=(r.s==="accent"?`<div class="warn">Pozor na diakritiku: ${esc(r.a)}</div>`:"")+(ans.length>1?`<div class="vars">Dá se říct i: ${ans.map(v=>`<b>${esc(v)}</b>`).join(" / ")}</div>`:"")+(n?`<div>💡 ${esc(n)}</div>`:"");
   el.querySelector(".mini").innerHTML=`<span class="mcs">${esc(tx(it,"cs"))}</span><span class="man">${esc(r.a)}</span><button class="say" aria-label="Play">${A.SPK}</button>`;
   el.querySelector(".mini").onclick=e=>{if(e.target.closest(".say"))A.say(r.a);else el.classList.toggle("open")};
   const next=cards.find(x=>!x.stt.done);
   if(next&&document.activeElement===inp)next.inp.focus({preventScroll:true});
   setTimeout(()=>{el.classList.add("compact");if(next)next.inp.scrollIntoView({block:"center",behavior:"smooth"})},600);
   if(cards.every(x=>x.stt.done))nextT=setTimeout(roundDone,900);
  };
  const strict=()=>L()==="es"&&st(it.id).c>=2,msg=el.querySelector(".msg");
  inp.addEventListener("input",()=>{inp.value=inp.value.replace(/\s*\n\s*/g," ");fit();if(stt.done)return;el.classList.remove("bad");msg.textContent="";msg.classList.remove("strict");const r=check(inp.value,ans,it.t==="w");if(r.s==="ok"||(r.s==="accent"&&!strict()))win(r)});
  const judge=()=>{if(stt.done)return;const r=check(inp.value,ans,it.t==="w");if(r.s==="empty")return;const sa=r.s==="accent"&&strict();if(r.s==="ok"||(r.s==="accent"&&!sa))return win(r);el.classList.remove("bad");void el.offsetWidth;el.classList.add("bad");msg.classList.toggle("strict",sa);if(sa)msg.innerHTML=`Oprav diakritiku: ${[...r.a].map(ch=>noAcc(ch)!==ch?`<u>${esc(ch)}</u>`:esc(ch)).join("")}`;if(!stt.wrong){stt.wrong=true;st(it.id).w++;save()}};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();judge()}});
  inp.addEventListener("blur",judge);
  el.querySelector(".say").onclick=()=>A.say(ans[0]);
 });
}
function roundDone(){
 if(!LS)return;const c=C();
 if(LS.practice){A.toast(L()==="es"?"Otra ronda":"Next round");return startLesson(true)}
 const nw=LV[c.lv-1][c.part];
 if(!nw.every(i=>st(i.id).c>=NEED)){A.toast(L()==="es"?"Otra ronda":"Next round");return startLesson(false)}
 if(c.part==="w"){
  c.part="s";save();
  return info(`${ui("words")}: ${ui("done")}`,bi({en:"Now: sentences with the same words.",es:"Ahora: frases con las mismas palabras.",cs:"Teď věty se stejnými slovy."}),"next",()=>startLesson(false));
 }
 levelDone();
}
function levelDone(){
 const c=C(),n=c.lv,lv=LV[n-1];
 c.lv++;c.part="w";c.coins+=BONUS;
 if(n===2)c.unfog=true;
 if(n===5){c.food=2;if(c.pet){c.pet.h=60;c.pet.ts=Date.now()}}
 save();view="map";LS=null;render();window.scrollTo({top:0});
 let sub=bi(lv.done);
 if(n===3)sub=bi({en:`You have ${c.coins} coins!`,es:`¡Tienes ${c.coins} monedas!`,cs:`Máš ${c.coins} mincí, které sis zatím vydělal${P().g==="f"?"a":""}!`});
 party(`${L()==="es"?"NIVEL":"LEVEL"} ${n}`,`✓ ${esc(lv.t[L()])}`,sub,A.CRIT[n%A.CRIT.length]).then(()=>{
  if(view!=="map")return;
  const pend=pending();
  if(pend==="avatar")return chooseAvatar();
  if(pend==="pet")return adopt();
  if(pend==="shop")return build();
  storyModal(c.lv);
 });
}

// ── akce ve městě ──
function chooseAvatar(){
 const ans=L()==="es"?{m:["el hombre","soy un hombre"],f:["la mujer","soy una mujer"]}:{m:["man","I am a man","I'm a man"],f:["woman","I am a woman","I'm a woman"]};
 askWord({title:bi({en:"Man or woman?",es:"¿Hombre o mujer?",cs:"Muž, nebo žena?"}),top:`<div class="petpick"><svg viewBox="0 0 100 140">${AV("m")}</svg><svg viewBox="0 0 100 140">${AV("f")}</svg></div>`,cs:"muž / žena",answers:ans.m.concat(ans.f),onOk:r=>{
  P().g=ans.f.includes(r.a)?"f":"m";save();closeModal();render();
  party(bi({en:"THIS IS YOU",es:"ESTE ERES TÚ",cs:"TOHLE JSI TY"}),esc(P().name),bi({en:"Welcome home!",es:"¡Bienvenido a casa!",cs:"Vítej doma!"}),`<svg viewBox="0 0 100 140" style="width:100%;height:100%">${AV(P().g)}</svg>`,3000).then(()=>storyModal(C().lv));
 }});
}
function adopt(){
 const c=C();
 if(c.coins<COST.pet)return info(bi({en:"Not enough coins",es:"No tienes suficientes monedas",cs:"Málo mincí"}),`${COST.pet} 🪙 · ${bi({en:`You have ${c.coins}.`,es:`Tienes ${c.coins}.`,cs:`Máš ${c.coins}. Procvičuj a vyděláš si.`})}`);
 const ans=L()==="es"?{dog:["el perro","quiero un perro"],cat:["el gato","la gata","quiero un gato","quiero una gata"]}:{dog:["dog","I want a dog"],cat:["cat","I want a cat"]};
 askWord({title:bi({en:"A dog or a cat?",es:"¿Un perro o un gato?",cs:"Pes, nebo kočka?"}),top:`<div class="petpick"><svg viewBox="0 0 90 84">${PETSVG("dog")}</svg><svg viewBox="0 0 90 84">${PETSVG("cat")}</svg></div>`,cs:"pes / kočka",answers:ans.dog.concat(ans.cat),okHtml:`${ui("adopt")} · ${COST.pet} 🪙`,onOk:r=>{
  const kind=ans.dog.includes(r.a)?"dog":"cat";
  openModal(`<div class="petpick"><svg viewBox="0 0 90 84">${PETSVG(kind)}</svg></div><h2>${bi({en:"What is its name?",es:"¿Cómo se llama?",cs:"Jak se jmenuje?"})}</h2><input class="tin" id="petName" maxlength="16" placeholder="${kind==="dog"?"Rex":"Micka"}"><button class="btn wide" id="petOk">${ui("ok")}</button>`,b=>{
   const go=()=>{const name=b.querySelector("#petName").value.trim()||(kind==="dog"?"Rex":"Micka");
    c.coins-=COST.pet;c.pet={kind,name,h:100,ts:0};save();closeModal();render();
    party(bi({en:"NEW FRIEND",es:"NUEVO AMIGO",cs:"NOVÝ PARŤÁK"}),esc(name),bi(kind==="dog"?{en:"This is your dog!",es:"¡Este es tu perro!",cs:"Tohle je tvůj pes!"}:{en:"This is your cat!",es:"¡Este es tu gato!",cs:"Tohle je tvoje kočka!"}),`<svg viewBox="0 0 90 84" style="width:100%;height:100%">${PETSVG(kind)}</svg>`,3200).then(()=>storyModal(C().lv))};
   b.querySelector("#petOk").onclick=go;b.querySelector("#petName").addEventListener("keydown",e=>{if(e.key==="Enter")go()});setTimeout(()=>b.querySelector("#petName").focus(),50);
  })}});
}
function build(){
 const c=C();
 if(c.coins<COST.shop)return info(bi({en:"Not enough coins",es:"No tienes suficientes monedas",cs:"Málo mincí"}),`${COST.shop} 🪙 · ${bi({en:`You have ${c.coins}.`,es:`Tienes ${c.coins}.`,cs:`Máš ${c.coins}. Procvičuj a vyděláš si.`})}`);
 askWord({title:`${ui("build")}: ${COST.shop} 🪙`,top:`<div class="petpick"><svg viewBox="-42 -36 84 72">${SHOP(shopLbl())}</svg></div><p class="small">Řekni stavitelům, co mají postavit.</p>`,cs:"obchod",answers:BYID.shop[L()],okHtml:ui("build"),onOk:()=>{
  c.coins-=COST.shop;c.b.shop=true;save();closeModal();render();
  party(bi({en:"NEW BUILDING",es:"NUEVO EDIFICIO",cs:"NOVÁ BUDOVA"}),`<svg viewBox="-42 -36 84 72" style="height:1.6em">${SHOP(shopLbl())}</svg>`,bi({en:"The shop is open, but it is empty.",es:"La tienda está abierta, pero está vacía.",cs:"Obchod je otevřený, ale je prázdný."}),A.CRIT[1],3200).then(()=>storyModal(C().lv));
 }});
}
function shop(knowPrice){
 const c=C(),Lg=L();
 const greet={en:"Hello! What would you like?",es:"¡Hola! ¿Qué desea?",cs:"Dobrý den! Co si přejete?"};
 if(c.lv<=7)return openModal(`<div class="shopk"><div class="sk">${A.CRIT[1]}</div><div class="bub">${bi({en:"Hello! Sorry, the shelves are empty.",es:"¡Hola! Lo siento, no hay nada.",cs:"Dobrý den! Promiň, regály jsou zatím prázdné."})}</div></div><p class="small">Zboží přibude po levelu 7.</p><button class="btn ghost wide" data-close>${ui("close")}</button>`);
 openModal(`<div class="shopk"><div class="sk">${A.CRIT[1]}</div><div class="bub">${bi(greet)}</div></div>
  <p class="small">🪙 ${c.coins} · 🍞 ${c.goods.bread} · 🥛 ${c.goods.milk} · 🦴 ${c.goods.petfood}</p>
  <div class="items">${Object.entries(GOODS).map(([k,g])=>`<button class="item" data-buy="${k}"><span class="emo">${g.pic}</span><b>${esc(BYID[k].cs)}</b><span>${knowPrice?g.price+" 🪙":"? 🪙"}</span></button>`).join("")}</div>
  ${knowPrice?"":`<button class="btn ghost wide" id="askPrice">💬 ${ui("ask")}</button>`}<button class="btn ghost wide" data-close style="margin-top:8px">${ui("back")}</button>`,b=>{
  const ap=b.querySelector("#askPrice"),q=LV[5].s[1];
  if(ap)ap.onclick=()=>askWord({title:bi({en:"Ask the shopkeeper",es:"Pregunta al tendero",cs:"Zeptej se prodavače"}),cs:q.cs,answers:q[Lg],strip:false,onOk:()=>{A.say(q[Lg][0]);shop(true)}});
  b.querySelectorAll("[data-buy]").forEach(btn=>btn.onclick=()=>{
   const k=btn.dataset.buy,g=GOODS[k];
   if(!knowPrice)return A.toast("Nejdřív se zeptej na cenu.");
   if(c.coins<g.price)return A.toast(`${g.price} 🪙`);
   askWord({title:bi({en:"What would you like?",es:"¿Qué desea?",cs:"Co si přejete?"}),cs:BYID[k].cs,answers:BYID[k][Lg],okHtml:`${ui("buy")} · ${g.price} 🪙`,onOk:()=>{c.coins-=g.price;c.goods[k]++;save();render();A.toast(`${g.pic} +1`);shop(true)}});
  });
 });
}
function petModal(){
 const c=C(),p=c.pet;if(!p)return;const h=hunger(),fed=c.lv>5;
 const feed=v=>{p.h=Math.min(100,hunger()+v);p.ts=Date.now();save();A.toast(pick(["Mňam!","Ňam ňam!",L()==="es"?"¡Gracias!":"Thank you!"]));petModal();render()};
 openModal(`<div class="petpick"><svg viewBox="0 0 90 84" class="${h<40?"":"happy"}">${PETSVG(p.kind)}</svg></div><h2>${esc(p.name)}</h2>
  ${fed?`<p>${ui("hungry")}</p><div class="hbar"><div style="width:${100-h}%;background:${h<40?"#e0614f":"#3fae5a"}"></div></div>
  <div class="items" style="margin-top:12px">
   <button class="item" data-f="food" ${c.food?"":"disabled"}><span class="emo">🍽️</span><b>${ui("food")}</b><span>${c.food}×</span></button>
   <button class="item" data-f="water"><span class="emo">💧</span><b>${ui("water")}</b><span>∞</span></button>
   ${c.lv>7?Object.entries(GOODS).map(([k,g])=>`<button class="item" data-f="${k}" ${c.goods[k]?"":"disabled"}><span class="emo">${g.pic}</span><b>${esc(BYID[k].cs)}</b><span>${c.goods[k]}×</span></button>`).join(""):""}
  </div>`:`<p>${bi({en:"Your pet is happy.",es:"Tu mascota está feliz.",cs:"Mazlíček je spokojený."})}</p>`}
  <button class="btn ghost wide" data-close style="margin-top:12px">${ui("close")}</button>`,b=>{
  b.querySelectorAll("[data-f]").forEach(btn=>btn.onclick=()=>{const k=btn.dataset.f;
   if(k==="food"){c.food--;feed(60)}else if(k==="water")feed(5);else{c.goods[k]--;feed(GOODS[k].feed)}});
 });
}
// ── štítková hra (přetahování) ──
const UI2={hide:["Hide labels","Ocultar","Schovat štítky"],show:["Show labels","Mostrar","Ukázat štítky"],hair:["Hair","Pelo","Vlasy"],shirt:["T-shirt","Camiseta","Tričko"],feedB:["Food","Comida","Jídlo","food"]};
Object.assign(UI,UI2);
function topicGame(el,{key,svg,vb,targets,sents,onDone,qa}){
 const c=C(),qs=c.qs||(c.qs={}),stt=qs[key]||(qs[key]={step:1}),q=c.quiz||(c.quiz={}),Lg=L();
 const done=!!q[key],[x0,y0,w,h]=vb,sw=w/400;
 let step=done?0:stt.step,practice=false;
 const lab=t=>`<b>${esc(t.label)}</b><small>${esc(t.cs)}</small>`;
 const SN=[{en:"Learn",es:"Aprende",cs:"Uč se"},{en:"Drag",es:"Arrastra",cs:"Přetáhni"},{en:"Write",es:"Escribe",cs:"Napiš"},{en:"Fill in",es:"Completa",cs:"Doplň"},{en:"Sentences",es:"Frases",cs:"Věty"}];
 const bar=()=>done?"":`<div class="steps">${SN.map((s,i)=>`<span class="${i+1<step?"ok":i+1===step?"on":""}">${i+1<step?"✓":`${i+1}.`} ${esc(s[Lg])}<small>${esc(s.cs)}</small></span>`).join("")}</div>`;
 const lines=targets.map(t=>`<line x1="${t.ax}" y1="${t.ay}" x2="${t.lx}" y2="${t.ly}" stroke="#2a1d14" stroke-width="${1.3*sw}" stroke-dasharray="${4*sw} ${3*sw}" opacity=".5"/><circle cx="${t.ax}" cy="${t.ay}" r="${3.4*sw}" fill="#fff" stroke="#2a1d14" stroke-width="${1.2*sw}"/>`).join("");
 const scene=(ghost,frame)=>`<div class="scene" style="aspect-ratio:${w}/${h}"><svg viewBox="${vb.join(" ")}">${svg(ghost)}${lines}</svg>${targets.map((t,i)=>{const f=frame(t,i);return `<div class="frame ${f[0]}" data-i="${i}" style="left:${(t.lx-x0)/w*100}%;top:${(t.ly-y0)/h*100}%">${f[1]}</div>`}).join("")}</div>`;
 const go=n=>{step=n;if(!done){stt.step=n;save()}practice=false;draw()};
 const btn=(id,cls,html)=>`<button class="btn ${cls}" id="${id}">${html}</button>`;
 const draw=()=>[study,study,drag,write,fill,sentences][Math.min(step,5)]();
 function study(){
  el.innerHTML=bar()+scene(done,t=>["ok",`${lab(t)} <span class="spk">🔊</span>`])
   +`<p class="small" style="text-align:center">${done?`Hotovo ✓ · procvičení přetahováním: ${fmt(8*mult(key))} 🪙 (každé další opakování méně).`:"Klepni na štítek a poslechni si výslovnost. Pak pokračuj."}</p><div class="gbtns">${done?btn("gP","ghost",`🙈 ${ui("practice")}`):btn("gN","",`${ui("next")} →`)}</div>`;
  el.querySelectorAll(".frame").forEach(f=>f.onclick=()=>A.say(targets[+f.dataset.i].label));
  const n=el.querySelector("#gN");if(n)n.onclick=()=>go(2);
  const p=el.querySelector("#gP");if(p)p.onclick=()=>{practice=true;step=2;draw()};
 }
 function drag(){
  let placed=0,sel=null;
  el.innerHTML=bar()+scene(false,()=>["","&nbsp;"])+`<div class="tray">${shuffle(targets.map((_,i)=>i)).map(i=>`<button class="chipl" data-i="${i}">${esc(targets[i].label)}</button>`).join("")}</div><p class="small" style="text-align:center">Přetáhni štítek na správné místo (nebo klepni na štítek a pak na rámeček).</p>`;
  const attempt=(i,fr,ch)=>{sel=null;el.querySelectorAll(".chipl").forEach(x=>x.classList.remove("sel"));
   if(+fr.dataset.i===i){fr.classList.add("ok");fr.innerHTML=lab(targets[i]);ch.remove();A.say(targets[i].label);if(++placed===targets.length)setTimeout(()=>{if(practice){const v=pay(8,key);finishRun(key);A.toast(`+${fmt(v)} 🪙 · příště ${fmt(8*mult(key))} 🪙`);step=0;render()}else go(3)},700)}
   else{fr.classList.remove("no");void fr.offsetWidth;fr.classList.add("no");A.toast("Tam to nepatří")}};
  el.querySelectorAll(".frame").forEach(f=>f.onclick=()=>{if(sel&&!f.classList.contains("ok"))attempt(+sel.dataset.i,f,sel)});
  el.querySelectorAll(".chipl").forEach(ch=>ch.addEventListener("pointerdown",e=>{
   e.preventDefault();const i=+ch.dataset.i,g=ch.cloneNode(true);g.classList.add("drag");document.body.appendChild(g);
   const sx=e.clientX,sy=e.clientY;let moved=false;
   const mv=ev=>{if(Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>6)moved=true;g.style.left=ev.clientX+"px";g.style.top=ev.clientY+"px"};mv(e);
   const up=ev=>{document.removeEventListener("pointermove",mv);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);g.remove();
    if(!moved){const was=ch.classList.contains("sel");el.querySelectorAll(".chipl").forEach(x=>x.classList.remove("sel"));if(!was){ch.classList.add("sel");sel=ch}else sel=null;return}
    const fr=[...el.querySelectorAll(".frame:not(.ok)")].find(f=>{const r=f.getBoundingClientRect();return ev.clientX>=r.left-10&&ev.clientX<=r.right+10&&ev.clientY>=r.top-10&&ev.clientY<=r.bottom+10});
    if(fr)attempt(i,fr,ch)};
   document.addEventListener("pointermove",mv);document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);
  }));
 }
 // jedno pole s textem + kontrola; použito pro krok 3 a 4
 function askBox(html,answers,onOk,hint){
  let tries=0;
  el.insertAdjacentHTML("beforeend",`<div class="wbox">${html}<textarea rows="1" class="ain" lang="${Lg}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"></textarea><p class="amsg"></p>${btn("wOk","wide",ui("ok"))}</div>`);
  const inp=el.querySelector(".wbox .ain"),msg=el.querySelector(".wbox .amsg");
  const ok=()=>{const r=check(inp.value,answers,true);if(r.s==="empty")return;
   if(r.s==="ok"||r.s==="accent"){if(r.s==="accent")A.toast(`Pozor na diakritiku: ${r.a}`);onOk(r)}
   else{tries++;inp.classList.remove("shake");void inp.offsetWidth;inp.classList.add("shake");msg.innerHTML=tries>=2?`Správně: <b>${esc(answers[0])}</b>${hint?` (${esc(hint)})`:""}`:"Zkus to znovu."}};
  el.querySelector("#wOk").onclick=ok;inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();ok()}});
  setTimeout(()=>inp.focus({preventScroll:true}),50);
 }
 function write(){
  const order=shuffle(targets.map((_,i)=>i)),filled={};let k=0;
  const paint=()=>{
   const cur=order[k],t=targets[cur];
   el.innerHTML=bar()+scene(false,(t,i)=>filled[i]?["ok",lab(t)]:i===cur?["cur","?"]:["","&nbsp;"]);
   askBox(`<p>${bi({en:"What is it? Write it.",es:"¿Qué es? Escríbelo.",cs:"Co to je? Napiš to."})} <span class="small">(${k+1}/${targets.length})</span></p>`,[t.label],()=>{filled[cur]=1;A.say(t.label);k++;if(k===targets.length)setTimeout(()=>go(4),600);else paint()},t.cs);
  };
  paint();
 }
 function fill(){
  const order=shuffle(sents.slice());let k=0;
  const paint=()=>{
   const s=order[k],g=typeof s.g[Lg]==="function"?s.g[Lg](ctx()):s.g[Lg],[pre,post]=g[0].split("_");
   el.innerHTML=bar()+scene(false,(t,i)=>i===s.ti?["cur",lab(t)]:["ok",lab(t)]);
   askBox(`<p>${bi({en:"Fill in the missing word.",es:"Completa la palabra.",cs:"Doplň chybějící slovo."})} <span class="small">(${k+1}/${order.length})</span></p><p class="gcs">${esc(tx(s,"cs"))}</p><p class="gap">${esc(pre)}<span>?</span>${esc(post)}</p>`,g[1],r=>{A.say(tx(s,Lg)[0]);k++;if(k===order.length)setTimeout(()=>go(5),600);else paint()});
  };
  paint();
 }
 function sentences(){
  el.innerHTML=bar()+scene(false,t=>["ok",lab(t)])+`<p class="small" style="text-align:center;margin-top:10px">${bi({en:"Now write the whole sentence. Each one 3× correct.",es:"Ahora escribe la frase entera. Cada una 3× bien.",cs:"Teď napiš celou větu. Každou 3× správně."})}</p><div id="sl"></div>`;
  const list=el.querySelector("#sl"),cards=[];
  shuffle(sents.slice()).forEach(it=>{
   const ans=tx(it,Lg),s0=st(it.id),cel=document.createElement("div");cel.className="card cc";
   cel.innerHTML=`<div class="cs">${esc(tx(it,"cs"))}</div><div class="meta"><span class="dots">${[0,1,2].map(j=>`<i class="${j<s0.c?"on":""}"></i>`).join("")}</span>${Lg==="es"&&s0.c>=2?`<span class="tag st">přesně s diakritikou</span>`:""}</div>
    <div class="field"><textarea rows="1" lang="${Lg}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="next"></textarea><div class="reveal">${esc(ans[0])}</div><button class="say" aria-label="Play">${A.SPK}</button></div><div class="msg"></div><div class="mini"></div><div class="info"></div>`;
   list.appendChild(cel);
   const inp=cel.querySelector("textarea"),cs=cel.querySelector(".cs"),msg=cel.querySelector(".msg"),S2={done:false,peek:false,wrong:false};cards.push({inp,S2});
   let tm;const end=()=>{clearTimeout(tm);cel.classList.remove("peek")};
   cs.addEventListener("pointerdown",()=>{if(S2.done)return;tm=setTimeout(()=>{cel.classList.add("peek");S2.peek=true},450)});
   ["pointerup","pointerleave","pointercancel"].forEach(ev=>cs.addEventListener(ev,end));cs.addEventListener("contextmenu",e=>e.preventDefault());
   const strict=()=>Lg==="es"&&st(it.id).c>=2;
   const win=r=>{S2.done=true;inp.readOnly=true;cel.classList.remove("bad");cel.classList.add("ok");
    const s=st(it.id);if(!S2.peek){s.c++;fly(cel,`+${fmt(pay(RW.s,key))} 🪙`);$("#cRes").innerHTML=resHTML()}save();
    cel.querySelector(".dots").innerHTML=[0,1,2].map(j=>`<i class="${j<s.c?"on":""}"></i>`).join("");
    const nn=it.n&&it.n[Lg];cel.querySelector(".info").innerHTML=(r.s==="accent"?`<div class="warn">Pozor na diakritiku: ${esc(r.a)}</div>`:"")+(ans.length>1?`<div class="vars">Dá se říct i: ${ans.map(v=>`<b>${esc(v)}</b>`).join(" / ")}</div>`:"")+(nn?`<div>💡 ${esc(nn)}</div>`:"");
    cel.querySelector(".mini").innerHTML=`<span class="mcs">${esc(tx(it,"cs"))}</span><span class="man">${esc(r.a)}</span><button class="say" aria-label="Play">${A.SPK}</button>`;
    cel.querySelector(".mini").onclick=e=>{if(e.target.closest(".say"))A.say(r.a);else cel.classList.toggle("open")};
    const next=cards.find(x=>!x.S2.done);if(next&&document.activeElement===inp)next.inp.focus({preventScroll:true});
    setTimeout(()=>{cel.classList.add("compact");if(next)next.inp.scrollIntoView({block:"center",behavior:"smooth"})},600);
    if(cards.every(x=>x.S2.done))setTimeout(()=>{if(sents.every(x=>st(x.id).c>=NEED)){delete qs[key];save();onDone(true)}else{A.toast(Lg==="es"?"Otra ronda":"Next round");sentences();window.scrollTo({top:el.offsetTop})}},900)};
   inp.addEventListener("input",()=>{inp.value=inp.value.replace(/\s*\n\s*/g," ");inp.style.height="auto";inp.style.height=inp.scrollHeight+"px";if(S2.done)return;cel.classList.remove("bad");msg.textContent="";msg.classList.remove("strict");const r=check(inp.value,ans,false);if(r.s==="ok"||(r.s==="accent"&&!strict()))win(r)});
   const judge=()=>{if(S2.done)return;const r=check(inp.value,ans,false);if(r.s==="empty")return;const sa=r.s==="accent"&&strict();if(r.s==="ok"||(r.s==="accent"&&!sa))return win(r);
    cel.classList.remove("bad");void cel.offsetWidth;cel.classList.add("bad");msg.classList.toggle("strict",sa);if(sa)msg.innerHTML=`Oprav diakritiku: ${[...r.a].map(ch=>noAcc(ch)!==ch?`<u>${esc(ch)}</u>`:esc(ch)).join("")}`;if(!S2.wrong){S2.wrong=true;st(it.id).w++;save()}};
   inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();judge()}});inp.addEventListener("blur",judge);
   cel.querySelector(".say").onclick=()=>A.say(ans[0]);
  });
 }
 // ── kvíz: otázky a odpovědi v cizím jazyce ──
 function qaRun(){
  let order=shuffle(qa.slice()),k=0,tries=0,shown=false;
  const paint=()=>{
   const it=order[k],q=typeof it.q==="function"?it.q(ctx()):it.q,ans=typeof it.a[Lg]==="function"?it.a[Lg](ctx()):it.a[Lg];
   const t=it.ti!=null?targets[it.ti]:null;
   el.innerHTML=`<div class="scene" style="aspect-ratio:${w}/${h}"><svg viewBox="${vb.join(" ")}">${svg(false)}${t?`<line x1="${t.ax}" y1="${t.ay}" x2="${t.lx}" y2="${t.ly}" stroke="#2a1d14" stroke-width="${1.3*sw}" stroke-dasharray="${4*sw} ${3*sw}" opacity=".6"/><circle cx="${t.ax}" cy="${t.ay}" r="${3.6*sw}" fill="#fff" stroke="#2a1d14" stroke-width="${1.2*sw}"/>`:""}</svg>${t?`<div class="frame cur" style="left:${(t.lx-x0)/w*100}%;top:${(t.ly-y0)/h*100}%">?</div>`:""}</div>
    <div class="wbox"><p class="small">${bi({en:"Answer the question.",es:"Responde a la pregunta.",cs:"Odpověz na otázku."})} · ${k+1}/${order.length} · <span class="dots">${[0,1,2].map(j=>`<i class="${j<st(it.id).c?"on":""}"></i>`).join("")}</span></p>
     <p class="qq">${esc(q[Lg])} <button class="say" id="qSay" aria-label="Play">${A.SPK}</button></p><p class="small" id="qcs"><a href="#" id="qShow">💡 Co to znamená?</a></p>
     <textarea rows="1" class="ain" lang="${Lg}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"></textarea><p class="amsg"></p>${btn("qOk","wide",ui("ok"))}</div>`;
   const inp=el.querySelector(".ain"),msg=el.querySelector(".amsg");
   el.querySelector("#qSay").onclick=()=>A.say(q[Lg]);
   el.querySelector("#qShow").onclick=e=>{e.preventDefault();el.querySelector("#qcs").textContent="💡 "+q.cs};
   const ok=()=>{const r=check(inp.value,ans,false);if(r.s==="empty")return;
    if(r.s==="ok"||r.s==="accent"){
     if(!shown){const s=st(it.id);s.c++;fly(inp,`+${fmt(pay(RW.s,key))} 🪙`);$("#cRes").innerHTML=resHTML();save()}
     A.say(r.a);if(r.s==="accent")A.toast(`Pozor na diakritiku: ${r.a}`);
     k++;tries=0;shown=false;
     if(k<order.length)return setTimeout(paint,500);
     if(qa.every(x=>st(x.id).c>=NEED)){delete qs[key];save();if(done){finishRun(key);A.toast("Hotovo ✓");return setTimeout(render,500)}return setTimeout(()=>onDone(true),500)}
     A.toast(Lg==="es"?"Otra ronda":"Next round");order=shuffle(qa.slice());k=0;return setTimeout(paint,700);
    }
    tries++;inp.classList.remove("shake");void inp.offsetWidth;inp.classList.add("shake");
    if(tries>=2){shown=true;msg.innerHTML=`Například: <b>${esc(ans[0])}</b> (napiš to a pokračuj, bez odměny)`}else msg.textContent="Zkus to znovu.";
    st(it.id).w++;save()};
   el.querySelector("#qOk").onclick=ok;inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();ok()}});
   setTimeout(()=>inp.focus({preventScroll:true}),50);
  };
  paint();
 }
 if(qa){
  if(done){el.innerHTML=`<p class="small" style="text-align:center">Hotovo ✓ · opakování: ${fmt(RW.s*mult(key))} 🪙 za odpověď (každé další opakování méně).</p><div class="gbtns">${btn("qAgain","",`🔁 ${ui("practice")}`)}</div>`;el.querySelector("#qAgain").onclick=qaRun;return}
  return qaRun();
 }

 draw();
}

// ── věty pro témata (stejné vzorce u domu, postavy i mazlíčka) ──
// ── věty pro témata: stejná gramatika na stejném levelu u domu, postavy i mazlíčka ──
// L1 věci (This is / That is / Here is / I see / Where is? / We have) · L2 jak to vypadá (X is + přídavné jméno)
// L3 co mám (I have / it has + přídavné jméno před slovem) · L4 kolik (čísla, množné číslo)
const XC=[[/^That is /,"That's "],[/^It is /,"It's "],[/^Here is /,"Here's "],[/^Where is /,"Where's "],[/^There is /,"There's "],[/^I have /,"I've got "],[/^We have /,"We've got "],[/^It has /,"It's got "],[/^My (dog|cat) has /,"My $1's got "],[/^I see /,"I can see "]];
const E=(...a)=>a.flatMap(s=>[s,...XC.filter(([r])=>r.test(s)).map(([r,b])=>s.replace(r,b))]);
const SX=(id,ti,cs,en,es,gen,ges,n)=>({id,ti,cs,en,es,g:{en:gen,es:ges},n});
const T3=(k,cs,en,es,ax,ay,lx,ly)=>({k,cs,en,es,ax,ay,lx,ly});
const WD={white:["bílá","white","blanco"],blue:["modrá","blue","azul"],green:["zelená","green","verde"],brown:["hnědá","brown","marrón"],black:["černá","black","negro"],red:["červená","red","rojo"],
 big:["velký","big","grande"],small:["malý","small","pequeño"],long:["dlouhý","long","largo"],short:["krátký","short","corto"],
 one:["jeden","one","uno"],two:["dva","two","dos"],three:["tři","three","tres"],four:["čtyři","four","cuatro"],five:["pět","five","cinco"]};
const TW=(k,ax,ay,lx,ly)=>T3(k,WD[k][0],WD[k][1],WD[k][2],ax,ay,lx,ly);
const withLabel=arr=>arr.map(t=>({...t,label:t[L()]}));
const AG={es:"Přídavné jméno se ve španělštině shoduje s rodem: rojo → roja, negro → negra, pequeño → pequeña."};
const COLS={white:WD.white,blue:WD.blue,green:WD.green,brown:WD.brown,black:WD.black,red:WD.red};

// ── dům ──
const ROOMS=[{id:"living",en:"Living room",es:"Salón",cs:"Obývák",lv:1},{id:"kitchen",en:"Kitchen",es:"Cocina",cs:"Kuchyň",lv:8},{id:"bedroom",en:"Bedroom",es:"Dormitorio",cs:"Ložnice",lv:9},{id:"bathroom",en:"Bathroom",es:"Baño",cs:"Koupelna",lv:10},{id:"garage",en:"Garage",es:"Garaje",cs:"Garáž",lv:11}];
const ROOM_P=[[230,60,230,22],[70,90,70,22],[350,130,350,22],[60,272,52,276],[215,204,200,276],[288,222,335,276]];
const TOPIC={
 living:[
  {t:{en:"Things",es:"Cosas",cs:"Věci"},targets:[T3("wall","zeď","wall","la pared",...ROOM_P[0]),T3("window","okno","window","la ventana",...ROOM_P[1]),T3("door","dveře","door","la puerta",...ROOM_P[2]),T3("floor","podlaha","floor","el suelo",...ROOM_P[3]),T3("table","stůl","table","la mesa",...ROOM_P[4]),T3("chair","židle","chair","la silla",...ROOM_P[5])],
   sents:[SX("h1_0",0,"Toto je zeď.",E("This is a wall.","This is the wall."),["Esta es la pared.","Es la pared.","Esta es una pared."],["This is a _.",["wall"]],["Esta es la _.",["pared"]]),
    SX("h1_1",1,"Vidím okno.",E("I see a window."),["Veo una ventana."],["I see a _.",["window"]],["Veo una _.",["ventana"]],{en:"I see = vidím.",es:"Veo = vidím."}),
    SX("h1_2",2,"Tady jsou moje dveře.",E("Here is my door."),["Aquí está mi puerta."],["Here is my _.",["door"]],["Aquí está mi _.",["puerta"]],{en:"Here is = tady je. Dveře = the door (jednotné číslo)."}),
    SX("h1_3",3,"To je podlaha.",E("That is the floor.","That is a floor."),["Ese es el suelo.","Es el suelo."],["That is the _.",["floor"]],["Ese es el _.",["suelo"]],{en:"This = tohle (blízko), that = tamto (dál)."}),
    SX("h1_4",4,"Máme stůl.",E("We have a table."),["Tenemos una mesa."],["We have a _.",["table"]],["Tenemos una _.",["mesa"]],{en:"We have = máme.",es:"Tenemos = máme."}),
    SX("h1_5",5,"Kde je židle?",E("Where is the chair?"),["¿Dónde está la silla?"],["Where is the _?",["chair"]],["¿Dónde está la _?",["silla"]])]},
  {t:{en:"Looks",es:"Aspecto",cs:"Jak vypadá"},targets:[TW("white",...ROOM_P[0]),TW("big",...ROOM_P[1]),TW("green",...ROOM_P[2]),TW("brown",...ROOM_P[3]),TW("small",...ROOM_P[4]),TW("red",...ROOM_P[5])],
   sents:[SX("h2_0",0,"Zeď je bílá.",E("The wall is white."),["La pared es blanca."],["The wall is _.",["white"]],["La pared es _.",["blanca"]],AG),
    SX("h2_1",1,"Okno je velké.",E("The window is big."),["La ventana es grande."],["The window is _.",["big"]],["La ventana es _.",["grande"]]),
    SX("h2_2",2,"Vidím zelené dveře.",E("I see a green door."),["Veo una puerta verde."],["I see a _ door.",["green"]],["Veo una puerta _.",["verde"]],{en:"Přídavné jméno je před slovem: a green door.",es:"Přídavné jméno je za slovem: una puerta verde."}),
    SX("h2_3",3,"Podlaha je hnědá.",E("The floor is brown."),["El suelo es marrón."],["The floor is _.",["brown"]],["El suelo es _.",["marrón"]]),
    SX("h2_4",4,"Stůl je malý.",E("The table is small."),["La mesa es pequeña."],["The table is _.",["small"]],["La mesa es _.",["pequeña"]],AG),
    SX("h2_5",5,"To je červená židle.",E("That is a red chair."),["Esa es una silla roja.","Es una silla roja."],["That is a _ chair.",["red"]],["Esa es una silla _.",["roja"]],AG)]},
  {t:{en:"I have",es:"Tengo",cs:"Mám"},targets:[T3("clock","hodiny","clock","el reloj",265,52,265,20),T3("book","kniha","book","el libro",190,194,128,150),T3("cup","hrnek","cup","la taza",243,190,262,140),T3("bag","taška","bag","la bolsa",100,246,52,276),T3("ball","míč","ball","la pelota",355,262,330,276)],
   sents:[SX("h3_0",0,"Máme hodiny.",E("We have a clock."),["Tenemos un reloj."],["We have a _.",["clock"]],["Tenemos un _.",["reloj"]],{en:"Hodiny na zdi = a clock (jednotné číslo)."}),
    SX("h3_1",1,"Mám knihu.",E("I have a book."),["Tengo un libro."],["I have a _.",["book"]],["Tengo un _.",["libro"]],{en:"I have = mám.",es:"Tengo = mám."}),
    SX("h3_2",2,"Mám bílý hrnek.",E("I have a white cup."),["Tengo una taza blanca."],["I have a _ cup.",["white"]],["Tengo una taza _.",["blanca"]],AG),
    SX("h3_3",3,"Taška je černá.",E("The bag is black."),["La bolsa es negra."],["The bag is _.",["black"]],["La bolsa es _.",["negra"]],AG),
    SX("h3_4",4,"Máme červený míč.",E("We have a red ball."),["Tenemos una pelota roja."],["We have a red _.",["ball"]],["Tenemos una _ roja.",["pelota"]])]},
  {t:{en:"How many",es:"Cuántos",cs:"Kolik"},targets:[TW("one",350,130,350,22),TW("two",288,222,335,276),TW("three",190,186,128,150),TW("four",215,236,200,276),TW("five",70,118,70,22)],
   sents:[SX("h4_0",0,"Jsou tu jedny dveře.",E("There is one door.","There is a door."),["Hay una puerta."],["There is _ door.",["one","a"]],["Hay _ puerta.",["una"]],{en:"There is = je tu / nachází se.",es:"Hay = je tu / jsou tu."}),
    SX("h4_1",1,"Máme dvě židle.",E("We have two chairs."),["Tenemos dos sillas."],["We have _ chairs.",["two"]],["Tenemos _ sillas.",["dos"]],{en:"Množné číslo: chair → chairs.",es:"Množné číslo: silla → sillas."}),
    SX("h4_2",2,"Mám tři knihy.",E("I have three books."),["Tengo tres libros."],["I have _ books.",["three"]],["Tengo _ libros.",["tres"]]),
    SX("h4_3",3,"Stůl má čtyři nohy.",E("The table has four legs."),["La mesa tiene cuatro patas."],["The table has _ legs.",["four"]],["La mesa tiene _ patas.",["cuatro"]],{en:"Has = má (on, ona, ono).",es:"Nohy stolu = patas."}),
    SX("h4_4",4,"Vidím pět květin.",E("I see five flowers."),["Veo cinco flores."],["I see _ flowers.",["five"]],["Veo _ flores.",["cinco"]])]}],
 body:[
  {t:{en:"My body",es:"Mi cuerpo",cs:"Moje tělo"},targets:[T3("hair","vlasy","hair","el pelo",50,20,-35,14),T3("eye","oko","eye","el ojo",42,44,-35,46),T3("hand","ruka","hand","la mano",20,92,-35,92),T3("head","hlava","head","la cabeza",71,34,135,16),T3("mouth","pusa","mouth","la boca",54,54,135,54),T3("leg","noha","leg","la pierna",57,118,135,112)],
   sents:[SX("b1_0",0,"Toto jsou moje vlasy.",E("This is my hair."),["Este es mi pelo.","Es mi pelo."],["This is my _.",["hair"]],["Este es mi _.",["pelo"]],{en:"Hair je jednotné číslo: this is my hair."}),
    SX("b1_1",1,"To je oko.",E("That is an eye."),["Ese es un ojo.","Es un ojo."],["That is an _.",["eye"]],["Ese es un _.",["ojo"]],{en:"Před samohláskou se píše an: an eye."}),
    SX("b1_2",2,"Vidím ruku.",E("I see a hand."),["Veo una mano."],["I see a _.",["hand"]],["Veo una _.",["mano"]],{es:"Mano je ženského rodu: la mano."}),
    SX("b1_3",3,"Tady je moje hlava.",E("Here is my head."),["Aquí está mi cabeza."],["Here is my _.",["head"]],["Aquí está mi _.",["cabeza"]]),
    SX("b1_4",4,"Kde je moje pusa?",E("Where is my mouth?"),["¿Dónde está mi boca?"],["Where is my _?",["mouth"]],["¿Dónde está mi _?",["boca"]]),
    SX("b1_5",5,"Toto je noha.",E("This is a leg."),["Esta es una pierna.","Es una pierna."],["This is a _.",["leg"]],["Esta es una _.",["pierna"]])]},
  {t:{en:"Looks",es:"Aspecto",cs:"Jak vypadám"},look:{shirt:"#e0614f",eye:"#3b6fd8",nose:"big",lips:"small"},
   targets:g=>[TW(g==="f"?"long":"short",50,20,-35,14),TW("blue",42,44,-35,46),TW("red",38,80,-35,92),TW("big",50,49,135,26),TW("small",50,55,135,64)],
   sents:[SX("b2_0",0,c=>c.g==="f"?"Moje vlasy jsou dlouhé.":"Moje vlasy jsou krátké.",c=>E(`My hair is ${c.g==="f"?"long":"short"}.`),c=>[`Mi pelo es ${c.g==="f"?"largo":"corto"}.`],c=>["My hair is _.",[c.g==="f"?"long":"short"]],c=>["Mi pelo es _.",[c.g==="f"?"largo":"corto"]]),
    SX("b2_1",1,"Oko je modré.",E("The eye is blue."),["El ojo es azul."],["The eye is _.",["blue"]],["El ojo es _.",["azul"]]),
    SX("b2_2",3,"Můj nos je velký.",E("My nose is big."),["Mi nariz es grande."],["My nose is _.",["big"]],["Mi nariz es _.",["grande"]]),
    SX("b2_3",4,"Pusa je malá.",E("The mouth is small."),["La boca es pequeña."],["The mouth is _.",["small"]],["La boca es _.",["pequeña"]],AG),
    SX("b2_4",2,"Vidím červené tričko.",E("I see a red T-shirt.","I see a red shirt."),["Veo una camiseta roja."],["I see a _ T-shirt.",["red"]],["Veo una camiseta _.",["roja"]],{en:"T-shirt = tričko.",es:"Camiseta = tričko."})]},
  {t:{en:"Clothes",es:"Ropa",cs:"Oblečení"},look:{hat:"#e0614f",glasses:true,shirt:"#4a7bd6",trousers:"#2a2a2a",shoes:"#ffffff"},
   targets:[T3("hat","čepice","hat","la gorra",50,16,-35,10),T3("glasses","brýle","glasses","las gafas",42,44,-35,44),T3("tshirt","tričko","T-shirt","la camiseta",38,80,-35,88),T3("trousers","kalhoty","trousers","los pantalones",57,110,135,96),T3("shoes","boty","shoes","los zapatos",58,131,135,128)],
   sents:[SX("b3_0",0,"Mám čepici.",E("I have a hat.","I have a cap."),["Tengo una gorra."],["I have a _.",["hat","cap"]],["Tengo una _.",["gorra"]],{en:"I have = mám."}),
    SX("b3_1",1,"Mám brýle.",E("I have glasses."),["Tengo gafas.","Tengo unas gafas."],["I have _.",["glasses"]],["Tengo _.",["gafas"]],{en:"Glasses jsou vždy množné číslo, bez a.",es:"Gafas jsou vždy množné číslo."}),
    SX("b3_2",2,"Moje tričko je modré.",E("My T-shirt is blue.","My shirt is blue."),["Mi camiseta es azul."],["My _ is blue.",["T-shirt","shirt"]],["Mi _ es azul.",["camiseta"]]),
    SX("b3_3",3,"Mám černé kalhoty.",E("I have black trousers.","I have black pants."),["Tengo pantalones negros.","Tengo unos pantalones negros."],["I have black _.",["trousers","pants"]],["Tengo _ negros.",["pantalones"]],{en:"Trousers = Británie, pants = USA. Vždy množné číslo."}),
    SX("b3_4",4,"Mám bílé boty.",E("I have white shoes."),["Tengo zapatos blancos.","Tengo unos zapatos blancos."],["I have white _.",["shoes"]],["Tengo _ blancos.",["zapatos"]])]},
  {t:{en:"How many",es:"Cuántos",cs:"Kolik"},
   targets:[T3("eyes","oči","eyes","los ojos",50,44,-35,40),T3("hands","ruce","hands","las manos",20,92,-35,92),T3("fingers","prsty","fingers","los dedos",82,95,135,80),T3("legs","nohy","legs","las piernas",50,115,135,118)],
   sents:[SX("b4_0",0,"Mám dvě oči.",E("I have two eyes."),["Tengo dos ojos."],["I have two _.",["eyes"]],["Tengo dos _.",["ojos"]],{en:"Množné číslo: eye → eyes.",es:"Množné číslo: ojo → ojos."}),
    SX("b4_1",1,"Mám dvě ruce.",E("I have two hands."),["Tengo dos manos."],["I have two _.",["hands"]],["Tengo dos _.",["manos"]]),
    SX("b4_2",2,"Mám deset prstů.",E("I have ten fingers."),["Tengo diez dedos."],["I have _ fingers.",["ten"]],["Tengo _ dedos.",["diez"]],{en:"Ten = deset.",es:"Diez = deset."}),
    SX("b4_3",3,"Mám dvě nohy.",E("I have two legs."),["Tengo dos piernas."],["I have two _.",["legs"]],["Tengo dos _.",["piernas"]])]}],
 pet:[
  {t:{en:"Body",es:"Cuerpo",cs:"Tělo"},targets:k=>k==="cat"?[T3("head","hlava","head","la cabeza",28,24,-32,6),T3("eye","oko","eye","el ojo",21,33,-32,32),T3("nose","nos","nose","la nariz",28,42,-32,58),T3("ear","ucho","ear","la oreja",41,13,122,10),T3("tail","ocas","tail","la cola",77,46,122,36),T3("paw","tlapka","paw","la pata",56,75,122,66)]
     :[T3("head","hlava","head","la cabeza",24,24,-32,6),T3("eye","oko","eye","el ojo",21,36,-32,32),T3("nose","nos","nose","la nariz",26,45,-32,58),T3("ear","ucho","ear","la oreja",41,42,122,10),T3("tail","ocas","tail","la cola",74,32,122,36),T3("paw","tlapka","paw","la pata",58,75,122,66)],
   sents:[SX("p1_0",0,"Toto je hlava.",E("This is the head.","This is a head."),["Esta es la cabeza.","Es la cabeza."],["This is the _.",["head"]],["Esta es la _.",["cabeza"]]),
    SX("p1_1",1,"Vidím oko.",E("I see an eye."),["Veo un ojo."],["I see an _.",["eye"]],["Veo un _.",["ojo"]]),
    SX("p1_2",2,"Kde je nos?",E("Where is the nose?"),["¿Dónde está la nariz?"],["Where is the _?",["nose"]],["¿Dónde está la _?",["nariz"]],{es:"Nariz je ženského rodu."}),
    SX("p1_3",3,"Tady je ucho.",E("Here is the ear.","Here is an ear."),["Aquí está la oreja."],["Here is the _.",["ear"]],["Aquí está la _.",["oreja"]]),
    SX("p1_4",4,"To je ocas.",E("That is the tail.","That is a tail."),["Esa es la cola.","Es la cola."],["That is the _.",["tail"]],["Esa es la _.",["cola"]]),
    SX("p1_5",5,"Toto je tlapka.",E("This is a paw.","This is the paw."),["Esta es una pata.","Es una pata."],["This is a _.",["paw"]],["Esta es una _.",["pata"]])]},
  {t:{en:"Looks",es:"Aspecto",cs:"Jak vypadá"},pal:{eye:"#3b6fd8",nose:"#1a1a1a",fur:"#b87a40",head:"#c98b4f",leg:"#a86f3a",tail:"#b87a40"},
   targets:k=>k==="cat"?[TW("long",77,46,122,10),TW("big",41,13,-32,6),TW("black",28,42,-32,58),TW("blue",21,33,-32,32),TW("brown",48,60,122,40)]
     :[TW("long",74,32,122,10),TW("big",12,42,-32,6),TW("black",26,45,-32,58),TW("blue",21,36,-32,32),TW("brown",52,58,122,40)],
   sents:[SX("p2_0",0,"Ocas je dlouhý.",E("The tail is long."),["La cola es larga."],["The tail is _.",["long"]],["La cola es _.",["larga"]],AG),
    SX("p2_1",1,"Ucho je velké.",E("The ear is big."),["La oreja es grande."],["The ear is _.",["big"]],["La oreja es _.",["grande"]]),
    SX("p2_2",2,"Nos je černý.",E("The nose is black."),["La nariz es negra."],["The nose is _.",["black"]],["La nariz es _.",["negra"]],AG),
    SX("p2_3",3,"Vidím modré oko.",E("I see a blue eye."),["Veo un ojo azul."],["I see a _ eye.",["blue"]],["Veo un ojo _.",["azul"]]),
    SX("p2_4",4,c=>c.pet==="cat"?"Moje kočka je hnědá.":"Můj pes je hnědý.",c=>E(`My ${c.pet||"dog"} is brown.`),c=>c.pet==="cat"?["Mi gato es marrón.","Mi gata es marrón."]:["Mi perro es marrón."],c=>[`My ${c.pet||"dog"} is _.`,["brown"]],c=>[c.pet==="cat"?"Mi gato es _.":"Mi perro es _.",["marrón"]])]},
  {t:{en:"It has",es:"Tiene",cs:"Má"},vb:[-70,-5,230,100],collar:true,ex:true,
   targets:k=>[T3("collar","obojek","collar","el collar",k==="cat"?28:37,k==="cat"?55:57,-45,8),k==="cat"?T3("fish","ryba","fish","el pez",8,66,-45,38):T3("bone","kost","bone","el hueso",6,52,-45,38),T3("ball","míč","ball","la pelota",-5,84,-45,70),T3("fur","srst","fur","el pelo",k==="cat"?48:52,k==="cat"?60:58,135,14),T3("bowl","miska","bowl","el cuenco",90,84,135,70)],
   sents:[SX("p3_0",0,c=>c.pet==="cat"?"Moje kočka má obojek.":"Můj pes má obojek.",c=>E(`My ${c.pet||"dog"} has a collar.`),c=>[c.pet==="cat"?"Mi gato tiene un collar.":"Mi perro tiene un collar."],c=>[`My ${c.pet||"dog"} has a _.`,["collar"]],c=>[c.pet==="cat"?"Mi gato tiene un _.":"Mi perro tiene un _.",["collar"]],{en:"Has = má (on, ona, ono): I have, ale it has.",es:"Tiene = má."}),
    SX("p3_1",1,c=>c.pet==="cat"?"Má rybu.":"Má kost.",c=>E(c.pet==="cat"?"It has a fish.":"It has a bone."),c=>[c.pet==="cat"?"Tiene un pez.":"Tiene un hueso."],c=>["It has a _.",[c.pet==="cat"?"fish":"bone"]],c=>["Tiene un _.",[c.pet==="cat"?"pez":"hueso"]]),
    SX("p3_2",2,"Míč je červený.",E("The ball is red."),["La pelota es roja."],["The _ is red.",["ball"]],["La _ es roja.",["pelota"]]),
    SX("p3_3",3,"Má hnědou srst.",E("It has brown fur."),["Tiene el pelo marrón.","Tiene pelo marrón."],["It has brown _.",["fur"]],["Tiene el _ marrón.",["pelo"]],{en:"Fur = srst (bez a).",es:"Srst = el pelo."}),
    SX("p3_4",4,"Miska je modrá.",E("The bowl is blue."),["El cuenco es azul."],["The _ is blue.",["bowl"]],["El _ es azul.",["cuenco"]])]},
  {t:{en:"How many",es:"Cuántos",cs:"Kolik"},
   targets:k=>k==="cat"?[T3("ears","uši","ears","las orejas",16,18,-32,6),T3("eyes","oči","eyes","los ojos",28,33,-32,34),T3("tail","ocas","tail","la cola",77,46,122,14),T3("paws","tlapky","paws","las patas",46,75,122,66)]
     :[T3("ears","uši","ears","las orejas",12,42,-32,6),T3("eyes","oči","eyes","los ojos",26,36,-32,34),T3("tail","ocas","tail","la cola",74,32,122,14),T3("paws","tlapky","paws","las patas",46,76,122,66)],
   sents:[SX("p4_0",3,c=>c.pet==="cat"?"Moje kočka má čtyři tlapky.":"Můj pes má čtyři tlapky.",c=>E(`My ${c.pet||"dog"} has four paws.`),c=>[c.pet==="cat"?"Mi gato tiene cuatro patas.":"Mi perro tiene cuatro patas."],c=>[`My ${c.pet||"dog"} has four _.`,["paws"]],c=>[c.pet==="cat"?"Mi gato tiene cuatro _.":"Mi perro tiene cuatro _.",["patas"]]),
    SX("p4_1",0,"Má dvě uši.",E("It has two ears."),["Tiene dos orejas."],["It has two _.",["ears"]],["Tiene dos _.",["orejas"]],{en:"Množné číslo: ear → ears."}),
    SX("p4_2",1,"Má dvě oči.",E("It has two eyes."),["Tiene dos ojos."],["It has two _.",["eyes"]],["Tiene dos _.",["ojos"]]),
    SX("p4_3",2,"Má jeden ocas.",E("It has one tail.","It has a tail."),["Tiene una cola."],["It has _ tail.",["one","a"]],["Tiene _ cola.",["una"]])]}]};
const tKey=(k,i)=>i?`${k}${i+1}`:k;
const tDone=(k,i)=>!!(C().quiz||{})[tKey(k,i)];
function tCur(k){const c=C();c.tsel=c.tsel||{};const first=TOPIC[k].findIndex((_,i)=>!tDone(k,i));const lim=first<0?TOPIC[k].length-1:first;let s=c.tsel[k];if(s==null||s>lim)s=lim;return s}
function tChips(k){const cur=tCur(k),first=TOPIC[k].findIndex((_,i)=>!tDone(k,i)),Lg=L();
 return `<div class="chips tchips">${TOPIC[k].map((t,i)=>{const open=first<0||i<=first;return `<button class="chip${i===cur?" on":""}" ${open?`data-act="tsel-${k}-${i}"`:"disabled"}>${tDone(k,i)?"✓":open?"":"🔒"} ${i+1}. ${esc(t.t[Lg])}</button>`}).join("")}</div>`}
const FURN={
 sofa:{price:80,cs:"pohovka",cs4:"pohovku",en:["sofa","couch"],es:["sofá"],esA:"un",esD:"el",g:[16,185,138,56]},
 tv:{price:120,cs:"televize",cs4:"televizi",en:["TV","television"],es:["televisión","tele"],esA:"una",esD:"la",g:[146,90,68,50]},
 picture:{price:40,cs:"obraz",cs4:"obraz",en:["picture","painting"],es:["cuadro"],esA:"un",esD:"el",g:[248,76,48,38]},
 lamp:{price:50,cs:"lampa",cs4:"lampu",en:["lamp"],es:["lámpara"],esA:"una",esD:"la",g:[149,126,30,118]},
 plant:{price:30,cs:"květina",cs4:"květinu",en:["plant","flower"],es:["planta"],esA:"una",esD:"la",g:[200,158,30,42]},
 rug:{price:60,cs:"koberec",cs4:"koberec",en:["rug","carpet"],es:["alfombra"],esA:"una",esD:"la",g:[130,232,170,24]}};
Object.keys(FURN).forEach(k=>FURN[k].id=k);
const FART={
 rug:`<ellipse cx="215" cy="246" rx="84" ry="13" fill="#c13b79" opacity=".85"/><ellipse cx="215" cy="246" rx="60" ry="8" fill="#f7d3e4" opacity=".8"/>`,
 sofa:`<rect x="22" y="190" width="126" height="30" rx="10" fill="#4a7bd6"/><rect x="16" y="204" width="138" height="30" rx="10" fill="#3566d6"/><rect x="24" y="234" width="8" height="8" fill="#2a1d14"/><rect x="138" y="234" width="8" height="8" fill="#2a1d14"/>`,
 tv:`<rect x="148" y="92" width="64" height="40" rx="3" fill="#222"/><rect x="152" y="96" width="56" height="32" fill="#3b6fd8"/><path d="M160 122 l10 -10 l8 6 l12 -12 l14 16z" fill="#86a8ff"/>`,
 picture:`<rect x="250" y="78" width="44" height="34" fill="#c9a46a"/><rect x="254" y="82" width="36" height="26" fill="#bfe3ee"/><path d="M254 108 l12 -12 l8 8 l6 -5 l10 9z" fill="#4c9a5a"/><circle cx="282" cy="90" r="4" fill="#ffd23f"/>`,
 lamp:`<rect x="162" y="150" width="4" height="90" fill="#555"/><path d="M151 150 h26 l-6 -22 h-14z" fill="#ffd23f"/><ellipse cx="164" cy="241" rx="10" ry="3" fill="#555"/>`,
 plant:`<rect x="206" y="186" width="18" height="14" rx="2" fill="#c96a3a"/><path d="M215 186 q-14 -14 -6 -26 q6 10 6 26 q2 -18 12 -24 q4 14 -12 24z" fill="#3fae5a"/>`};
const PAINT=[["#f6efe3","white"],["#d6e6fb","blue"],["#dff2e3","green"],["#f8dcd6","red"]];
function roomSVG(own,ghost,wall,li=0){
 const o=[`<rect width="400" height="190" fill="${wall||"#f6efe3"}"/><rect y="190" width="400" height="110" fill="#d9b38c"/>${[0,1,2,3,4,5,6,7,8].map(k=>`<line x1="${k*55}" y1="190" x2="${k*55-30}" y2="300" stroke="#c49a70" stroke-width="2"/>`).join("")}<rect y="186" width="400" height="6" fill="#c9a46a"/>`,
  `<rect x="30" y="50" width="80" height="80" rx="4" fill="#8fc8f2" stroke="#fff" stroke-width="6"/><line x1="70" y1="50" x2="70" y2="130" stroke="#fff" stroke-width="4"/><line x1="30" y1="90" x2="110" y2="90" stroke="#fff" stroke-width="4"/>`,
  `<rect x="320" y="70" width="60" height="120" rx="3" fill="#3fae5a" stroke="#2f8a47" stroke-width="3"/><circle cx="370" cy="132" r="4" fill="#ffd23f"/>`];
 if(own.rug)o.push(FART.rug);
 o.push(`<rect x="170" y="200" width="90" height="9" rx="2" fill="#333"/><rect x="176" y="209" width="6" height="36" fill="#222"/><rect x="248" y="209" width="6" height="36" fill="#222"/>`,
  `<rect x="296" y="180" width="7" height="45" rx="2" fill="#c8453a"/><rect x="272" y="218" width="31" height="6" rx="2" fill="#e0614f"/><rect x="274" y="224" width="4" height="28" fill="#c8453a"/><rect x="298" y="224" width="4" height="28" fill="#c8453a"/>`);
 ["sofa","tv","picture","lamp","plant"].forEach(k=>{if(own[k])o.push(FART[k])});
 if(li>=2||tDone("living",2))o.push(`<g><circle cx="265" cy="52" r="15" fill="#fff" stroke="#2a1d14" stroke-width="3"/><path d="M265 52 V42 M265 52 H273" stroke="#2a1d14" stroke-width="2.5" stroke-linecap="round"/></g>`,
  li>=3?`<rect x="176" y="190" width="28" height="7" rx="1" fill="#3b6fd8"/><rect x="178" y="183" width="26" height="7" rx="1" fill="#e0614f"/><rect x="175" y="176" width="28" height="7" rx="1" fill="#3fae5a"/>`:`<rect x="178" y="189" width="26" height="9" rx="1" fill="#3b6fd8"/><rect x="178" y="189" width="4" height="9" fill="#2a4fa8"/>`,
  `<path d="M236 184 h14 v14 a3 3 0 0 1 -3 3 h-8 a3 3 0 0 1 -3 -3z" fill="#fff" stroke="#999"/><path d="M250 188 a4 4 0 0 1 0 8" stroke="#999" fill="none" stroke-width="2"/>`,
  `<path d="M88 238 h26 l3 22 h-32z" fill="#222"/><path d="M94 238 q7 -10 14 0" stroke="#222" stroke-width="3" fill="none"/>`,
  `<circle cx="355" cy="262" r="10" fill="#e0614f"/><path d="M346 258 q9 6 18 0" stroke="#fff" stroke-width="2" fill="none"/>`);
 if(li>=3)o.push(`<rect x="140" y="218" width="31" height="6" rx="2" fill="#e0614f"/><rect x="140" y="180" width="7" height="45" rx="2" fill="#c8453a"/><rect x="142" y="224" width="4" height="28" fill="#c8453a"/><rect x="166" y="224" width="4" height="28" fill="#c8453a"/>`,
  `<rect x="194" y="209" width="5" height="32" fill="#444"/><rect x="232" y="209" width="5" height="32" fill="#444"/>`,
  `<rect x="58" y="126" width="24" height="12" rx="2" fill="#c96a3a"/>${[52,61,70,79,88].map((x,j)=>`<line x1="70" y1="126" x2="${x}" y2="${108+(j%2)*4}" stroke="#3fae5a" stroke-width="2"/><circle cx="${x}" cy="${108+(j%2)*4}" r="4" fill="${["#e0614f","#ffd23f","#e86f9a","#ffd23f","#e0614f"][j]}"/>`).join("")}`);
 if(ghost)Object.values(FURN).forEach(f=>{if(own[f.id])return;const[x,y,w,h]=f.g;o.push(`<g class="tap ghost" data-act="fbuy-${f.id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="rgba(255,255,255,.35)" stroke="#2f9e6a" stroke-width="2" stroke-dasharray="5 4"/><text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle" font-size="12" font-weight="700" fill="#25805a">+${f.price}</text></g>`)});
 return o.join("");
}
const colName=k=>{const cl=WD[k];return `${esc(L()==="es"?cl[2]:cl[1])}<small>${cl[0]}</small>`};
function topicDone(k,i,title,sub,art){const c=C(),q=c.quiz||(c.quiz={});q[tKey(k,i)]=true;finishRun(tKey(k,i));c.coins+=20;c.tsel=c.tsel||{};delete c.tsel[k];save();render();party(title,"+20 🪙",sub,art,3600)}
function renderHouse(){
 const c=C(),own=c.own||(c.own={}),Lg=L(),i=tCur("living"),T=TOPIC.living[i];
 body().innerHTML=`<div class="lhead"><button class="btn ghost sm" data-go="tomap">← ${ui("map")}</button><div><span class="kap">${ui("house")}</span><b>${bi(ROOMS[0])}</b></div></div>
  <div class="chips" style="margin-bottom:8px">${ROOMS.map((r,j)=>`<button class="chip${j?"":" on"}" ${j?`data-act="room-${j}"`:""}>${j&&c.lv<=r.lv?"🔒 ":""}${esc(r[Lg])}</button>`).join("")}</div>
  ${tChips("living")}<div id="game"></div><div class="cards" id="hinfo"></div>`;
 topicGame($("#game"),{key:tKey("living",i),sents:T.sents,qa:T.qa,vb:[0,0,400,300],targets:withLabel(T.targets),svg:g=>roomSVG(own,g&&i===0,g?c.paint:null,g?0:i),
  onDone:()=>topicDone("living",i,`${ui("level")} ${i+1} ✓`,bi([{en:"Now you can buy furniture! Tap a + in the room.",es:"¡Ya puedes comprar muebles! Toca un + en la sala.",cs:"Teď můžeš kupovat nábytek! Klepni na + v pokoji."},{en:"Now you can paint the walls!",es:"¡Ya puedes pintar las paredes!",cs:"Teď můžeš malovat zdi!"},{en:"Your room has new things!",es:"¡Tu sala tiene cosas nuevas!",cs:"V pokoji přibyly nové věci!"},{en:"Great! More levels soon.",es:"¡Genial! Pronto más niveles.",cs:"Výborně! Další levely brzy."}][i]||{en:"Great job!",es:"¡Muy bien!",cs:"Výborně!"}),A.CRIT[2])});
 const cards=[];
 if(tDone("living",0))cards.push(`<div class="ccard"><div><b>${bi({en:"Furniture",es:"Muebles",cs:"Nábytek"})}</b><span>Klepni na zelené + v pokoji. Koupíš to v obchodě, celý nákup proběhne ${Lg==="es"?"španělsky":"anglicky"}.</span>
   <div class="pre">${Object.values(FURN).map(f=>`<button class="pchip fbtn" ${own[f.id]?"disabled":`data-act="fbuy-${f.id}"`}><b>${esc(f[Lg][0])}</b><i>${own[f.id]?"✓":f.price+" 🪙"}</i></button>`).join("")}</div></div></div>`);
 if(tDone("living",1))cards.push(`<div class="ccard"><div><b>${bi({en:"Paint the walls",es:"Pinta las paredes",cs:"Vymaluj zdi"})}</b><div class="swatches">${PAINT.map(p=>`<button class="sw2${(c.paint||"#f6efe3")===p[0]?" on":""}" data-act="paint-${p[0]}"><i style="background:${p[0]}"></i>${colName(p[1])}</button>`).join("")}</div></div></div>`);
 cards.push(`<div class="ccard main"><div><b>${ui("level")} ${i+1}: ${bi(T.t)}</b><span>${T.qa?"Odpovídej na otázky v cizím jazyce, každou 3× správně.":"1. štítky s výslovností · 2. přetáhni · 3. napiš slovo · 4. doplň slovo do věty · 5. napiš celou větu 3×."} ${tDone("living",i)?"Hotovo ✓":`Odměna: 20 🪙${[" a nákup nábytku"," a malování zdí","",""][i]||""}.`}</span></div></div>`);
 $("#hinfo").innerHTML=cards.join("");
}

// ── postava ──
const HAIRC=[["#6b4226","brown"],["#2a1d14","black"],["#c0522b","red"],["#e8e4dc","white"]];
const SHIRTC=[["#4a7bd6","blue"],["#e0614f","red"],["#3fae5a","green"],["#2a2a2a","black"],["#f4f4f4","white"]];
function renderMe(){
 const c=C(),p=P(),Lg=L(),lk=p.look||{},i=tCur("body"),T=TOPIC.body[i];
 body().innerHTML=`<div class="lhead"><button class="btn ghost sm" data-go="tomap">← ${ui("map")}</button><div><span class="kap">${esc(p.name||"")}</span><b>${bi({en:"Me",es:"Yo",cs:"Já"})}</b></div></div>${tChips("body")}<div id="game"></div><div class="cards" id="minfo"></div>`;
 topicGame($("#game"),{key:tKey("body",i),sents:T.sents,qa:T.qa,vb:[-75,0,250,145],targets:withLabel(typeof T.targets==="function"?T.targets(p.g):T.targets),svg:()=>AV(p.g||"m",T.look?Object.assign({},lk,T.look):undefined),
  onDone:()=>topicDone("body",i,`${ui("level")} ${i+1} ✓`,bi([{en:"Great! Next: how you look.",es:"¡Genial! Ahora: tu aspecto.",cs:"Výborně! Dál: jak vypadáš."},{en:"Now you can change your hair and T-shirt!",es:"¡Ya puedes cambiar tu pelo y tu camiseta!",cs:"Teď si můžeš změnit vlasy a tričko!"},{en:"Now you can wear a hat and glasses!",es:"¡Ya puedes llevar gorra y gafas!",cs:"Teď můžeš nosit čepici a brýle!"},{en:"Great! More levels soon.",es:"¡Genial! Pronto más niveles.",cs:"Výborně! Další levely brzy."}][i]||{en:"Great job!",es:"¡Muy bien!",cs:"Výborně!"}),`<svg viewBox="0 0 100 140" style="width:100%;height:100%">${AV(p.g||"m")}</svg>`)});
 const cards=[];
 if(tDone("body",1))cards.push(`<div class="ccard"><div><b>${ui("hair")}</b><div class="swatches">${HAIRC.map(h=>`<button class="sw2${(lk.hair||"#6b4226")===h[0]?" on":""}" data-act="look-hair-${h[0]}"><i style="background:${h[0]}"></i>${colName(h[1])}</button>`).join("")}</div>
   <b style="margin-top:10px">${ui("shirt")}</b><div class="swatches">${SHIRTC.map(h=>`<button class="sw2${(lk.shirt||(p.g==="f"?"#e86f9a":"#4a7bd6"))===h[0]?" on":""}" data-act="look-shirt-${h[0]}"><i style="background:${h[0]}"></i>${colName(h[1])}</button>`).join("")}</div>${tDone("body",2)?`<b style="margin-top:10px">${bi({en:"Hat and glasses",es:"Gorra y gafas",cs:"Čepice a brýle"})}</b><div class="swatches"><button class="sw2${lk.hat?" on":""}" data-act="wear-hat">🧢 ${esc(L()==="es"?"la gorra":"hat")}<small>čepice</small></button><button class="sw2${lk.glasses?" on":""}" data-act="wear-glasses">👓 ${esc(L()==="es"?"las gafas":"glasses")}<small>brýle</small></button></div>`:""}</div></div>`);
 cards.push(`<div class="ccard main"><div><b>${ui("level")} ${i+1}: ${bi(T.t)}</b><span>${T.qa?"Odpovídej na otázky v cizím jazyce, každou 3× správně.":"1. štítky · 2. přetáhni · 3. napiš slovo · 4. doplň do věty · 5. celá věta 3×."} ${tDone("body",i)?"Hotovo ✓":`Odměna: 20 🪙${["",", změna vlasů a trička",", čepice a brýle",""][i]||""}.`}</span></div></div>`);
 $("#minfo").innerHTML=cards.join("");
}

// ── mazlíček ──
const FURC={brown:null,white:{fur:"#f2efe8",head:"#fffdf8",leg:"#e3ddd2",ear:"#d8cfc2",tail:"#e3ddd2"},black:{fur:"#3a3a3a",head:"#4a4a4a",leg:"#2a2a2a",ear:"#1a1a1a",tail:"#2a2a2a"}};
const PAL2={ear:"#1a1a1a",eye:"#3b6fd8",paw:"#ffffff",tongue:"#e0614f",nose:"#e0614f",fur:"#b87a40",head:"#c98b4f",leg:"#a86f3a",tail:"#b87a40"};
function petItem(id){const k=C().pet&&C().pet.kind;
 if(id==="collar")return{id,price:40,cs:"obojek",cs4:"obojek",en:["collar"],es:["collar"],esA:"un",esD:"el"};
 return k==="cat"?{id,price:120,cs:"pelíšek",cs4:"pelíšek",en:["cat bed","pet bed","bed"],es:["cama para gatos","cama"],esA:"una",esD:"la"}:{id,price:120,cs:"psí bouda",cs4:"psí boudu",en:["dog house","kennel","doghouse"],es:["caseta","caseta para perros"],esA:"una",esD:"la"};}
function renderPetV(){
 const c=C(),own=c.own||(c.own={}),p=c.pet,Lg=L();if(!p){view="map";return render()}
 const i=tCur("pet"),T=TOPIC.pet[i];
 body().innerHTML=`<div class="lhead"><button class="btn ghost sm" data-go="tomap">← ${ui("map")}</button><div><span class="kap">${ui("pet")}</span><b>${esc(p.name)}</b></div>${c.lv>5?`<button class="btn sm" data-act="feed">🍽️ ${ui("food")}</button>`:""}</div>${tChips("pet")}<div id="game"></div><div class="cards" id="pinfo"></div>`;
 topicGame($("#game"),{key:tKey("pet",i),sents:T.sents,qa:T.qa,vb:T.vb||[-60,-5,210,90],targets:withLabel(T.targets(p.kind)),svg:()=>PETSVG(p.kind,own.collar||T.collar,T.pal||FURC[c.fur],T.ex),
  onDone:()=>topicDone("pet",i,`${ui("level")} ${i+1} ✓`,bi([{en:`Now you can buy things for ${p.name}!`,es:`¡Ya puedes comprar cosas para ${p.name}!`,cs:`Teď můžeš kupovat věci pro ${p.name}!`},{en:`Now you can choose ${p.name}'s color!`,es:`¡Ya puedes elegir el color de ${p.name}!`,cs:`Teď můžeš vybrat barvu srsti!`},{en:`${p.name} loves the new ball!`,es:`¡A ${p.name} le encanta la pelota!`,cs:`${p.name} má radost z míče!`},{en:"Great! More levels soon.",es:"¡Genial! Pronto más niveles.",cs:"Výborně! Další levely brzy."}][i]||{en:"Great job!",es:"¡Muy bien!",cs:"Výborně!"}),`<svg viewBox="0 0 90 84" style="width:100%;height:100%">${PETSVG(p.kind,own.collar,FURC[c.fur])}</svg>`)});
 const items=["collar","home"].map(petItem),cards=[];
 if(tDone("pet",0))cards.push(`<div class="ccard"><div><b>${bi({en:`Things for ${p.name}`,es:`Cosas para ${p.name}`,cs:`Věci pro ${p.name}`})}</b><span>Koupíš je v obchodě, celý nákup proběhne ${Lg==="es"?"španělsky":"anglicky"}.</span>
   <div class="pre">${items.map(f=>`<button class="pchip fbtn" ${own[f.id]?"disabled":`data-act="pbuy-${f.id}"`}><b>${esc(f[Lg][0])}</b><i>${own[f.id]?"✓":f.price+" 🪙"}</i></button>`).join("")}</div></div></div>`);
 if(tDone("pet",1))cards.push(`<div class="ccard"><div><b>${bi({en:"Fur color",es:"Color del pelo",cs:"Barva srsti"})}</b><div class="swatches">${Object.keys(FURC).map(k=>`<button class="sw2${(c.fur||"brown")===k?" on":""}" data-act="fur-${k}"><i style="background:${k==="brown"?(p.kind==="cat"?"#f0a050":"#c98b4f"):FURC[k].fur}"></i>${colName(k)}</button>`).join("")}</div></div></div>`);
 cards.push(`<div class="ccard main"><div><b>${ui("level")} ${i+1}: ${bi(T.t)}</b><span>${T.qa?"Odpovídej na otázky v cizím jazyce, každou 3× správně.":"1. štítky · 2. přetáhni · 3. napiš slovo · 4. doplň do věty · 5. celá věta 3×."} ${tDone("pet",i)?"Hotovo ✓":`Odměna: 20 🪙${[` a obojek a ${p.kind==="cat"?"pelíšek":"bouda"}`," a výběr barvy srsti","",""][i]||""}.`}</span></div></div>`);
 $("#pinfo").innerHTML=cards.join("");
}

// ── zoo ──
const ZP=[[80,100],[200,92],[320,100],[80,200],[200,200],[320,200]];
const ZT=(i,k,cs,en,es,emo,n=1)=>({...T3(k,cs,en,es,ZP[i][0],ZP[i][1]+22,ZP[i][0],ZP[i][1]+54),emo,n});
const ZBG={farm:["#c9e9a8","#9fd17d"],safari:["#f6e3a1","#e2c46a"],water:["#bfe3f7","#6fb6e6"],insects:["#d9f2c4","#a6d690"],reptiles:["#efe2c6","#cdb68a"],birds:["#dcefff","#bfe3a5"]};
TOPIC.zoo=[
 {t:{en:"Farm",es:"Granja",cs:"Farma"},bg:"farm",targets:[ZT(0,"cow","kráva","cow","la vaca","🐄"),ZT(1,"horse","kůň","horse","el caballo","🐎"),ZT(2,"pig","prase","pig","el cerdo","🐖"),ZT(3,"sheep","ovce","sheep","la oveja","🐑"),ZT(4,"chicken","slepice","chicken","la gallina","🐔"),ZT(5,"rabbit","králík","rabbit","el conejo","🐇")],
  sents:[SX("z1_0",0,"Toto je kráva.",E("This is a cow."),["Esta es una vaca.","Es una vaca."],["This is a _.",["cow"]],["Esta es una _.",["vaca"]]),
   SX("z1_1",1,"Vidím koně.",E("I see a horse."),["Veo un caballo."],["I see a _.",["horse"]],["Veo un _.",["caballo"]]),
   SX("z1_2",2,"Tady je prase.",E("Here is the pig.","Here is a pig."),["Aquí está el cerdo."],["Here is the _.",["pig"]],["Aquí está el _.",["cerdo"]]),
   SX("z1_3",3,"To je ovce.",E("That is a sheep."),["Esa es una oveja.","Es una oveja."],["That is a _.",["sheep"]],["Esa es una _.",["oveja"]],{en:"Sheep má stejný tvar i v množném čísle: one sheep, two sheep."}),
   SX("z1_4",4,"Kde je slepice?",E("Where is the chicken?","Where is the hen?"),["¿Dónde está la gallina?"],["Where is the _?",["chicken","hen"]],["¿Dónde está la _?",["gallina"]]),
   SX("z1_5",5,"Máme králíka.",E("We have a rabbit."),["Tenemos un conejo."],["We have a _.",["rabbit"]],["Tenemos un _.",["conejo"]])]},
 {t:{en:"Safari",es:"Safari",cs:"Safari"},bg:"safari",targets:[ZT(0,"lion","lev","lion","el león","🦁"),ZT(1,"elephant","slon","elephant","el elefante","🐘"),ZT(2,"giraffe","žirafa","giraffe","la jirafa","🦒"),ZT(3,"zebra","zebra","zebra","la cebra","🦓"),ZT(4,"monkey","opice","monkey","el mono","🐒"),ZT(5,"hippo","hroch","hippo","el hipopótamo","🦛")],
  sents:[SX("z2_0",0,"Vidím velkého lva.",E("I see a big lion."),["Veo un león grande."],["I see a big _.",["lion"]],["Veo un _ grande.",["león"]]),
   SX("z2_1",1,"Slon je šedý.",E("The elephant is grey.","The elephant is gray."),["El elefante es gris."],["The _ is grey.",["elephant"]],["El _ es gris.",["elefante"]],{en:"Grey = Británie, gray = USA. Před samohláskou: an elephant."}),
   SX("z2_2",2,"Žirafa je vysoká.",E("The giraffe is tall."),["La jirafa es alta."],["The _ is tall.",["giraffe"]],["La _ es alta.",["jirafa"]],{en:"Tall = vysoký (lidé, zvířata, stromy)."}),
   SX("z2_3",3,"Zebra je černobílá.",E("The zebra is black and white."),["La cebra es blanca y negra.","La cebra es negra y blanca."],["The _ is black and white.",["zebra"]],["La _ es blanca y negra.",["cebra"]],{en:"And = a."}),
   SX("z2_4",4,"Opice je malá.",E("The monkey is small."),["El mono es pequeño."],["The _ is small.",["monkey"]],["El _ es pequeño.",["mono"]]),
   SX("z2_5",5,"To je velký hroch.",E("That is a big hippo."),["Ese es un hipopótamo grande.","Es un hipopótamo grande."],["That is a big _.",["hippo"]],["Ese es un _ grande.",["hipopótamo"]])]},
 {t:{en:"Water",es:"Agua",cs:"Voda"},bg:"water",targets:[ZT(0,"fish","ryba","fish","el pez","🐟"),ZT(1,"dolphin","delfín","dolphin","el delfín","🐬"),ZT(2,"shark","žralok","shark","el tiburón","🦈"),ZT(3,"whale","velryba","whale","la ballena","🐋"),ZT(4,"octopus","chobotnice","octopus","el pulpo","🐙"),ZT(5,"crab","krab","crab","el cangrejo","🦀")],
  sents:[SX("z3_0",0,"Mám malou rybu.",E("I have a small fish."),["Tengo un pez pequeño."],["I have a small _.",["fish"]],["Tengo un _ pequeño.",["pez"]]),
   SX("z3_1",1,"Delfín má dlouhý nos.",E("The dolphin has a long nose."),["El delfín tiene una nariz larga."],["The _ has a long nose.",["dolphin"]],["El _ tiene una nariz larga.",["delfín"]]),
   SX("z3_2",2,"Žralok má velké zuby.",E("The shark has big teeth."),["El tiburón tiene dientes grandes."],["The _ has big teeth.",["shark"]],["El _ tiene dientes grandes.",["tiburón"]],{en:"Tooth = zub, teeth = zuby (nepravidelné množné číslo)."}),
   SX("z3_3",3,"Velryba má velký ocas.",E("The whale has a big tail."),["La ballena tiene una cola grande."],["The _ has a big tail.",["whale"]],["La _ tiene una cola grande.",["ballena"]]),
   SX("z3_4",4,"Chobotnice je červená.",E("The octopus is red."),["El pulpo es rojo."],["The _ is red.",["octopus"]],["El _ es rojo.",["pulpo"]]),
   SX("z3_5",5,"Vidím červeného kraba.",E("I see a red crab."),["Veo un cangrejo rojo."],["I see a red _.",["crab"]],["Veo un _ rojo.",["cangrejo"]])]},
 {t:{en:"Insects",es:"Insectos",cs:"Hmyz"},bg:"insects",targets:[ZT(0,"bee","včela","bee","la abeja","🐝",2),ZT(1,"ant","mravenec","ant","la hormiga","🐜",3),ZT(2,"spider","pavouk","spider","la araña","🕷️"),ZT(3,"butterfly","motýl","butterfly","la mariposa","🦋"),ZT(4,"ladybird","beruška","ladybird","la mariquita","🐞",4),ZT(5,"fly","moucha","fly","la mosca","🪰")],
  sents:[SX("z4_0",0,"Vidím dvě včely.",E("I see two bees."),["Veo dos abejas."],["I see two _.",["bees"]],["Veo dos _.",["abejas"]],{en:"Množné číslo: bee → bees."}),
   SX("z4_1",1,"Jsou tu tři mravenci.",E("There are three ants."),["Hay tres hormigas."],["There are three _.",["ants"]],["Hay tres _.",["hormigas"]],{en:"There is = je tu (jeden), there are = jsou tu (více)."}),
   SX("z4_2",2,"Pavouk má osm nohou.",E("The spider has eight legs.","A spider has eight legs."),["La araña tiene ocho patas."],["The _ has eight legs.",["spider"]],["La _ tiene ocho patas.",["araña"]],{en:"Eight = osm."}),
   SX("z4_3",3,"Motýl má čtyři křídla.",E("The butterfly has four wings.","A butterfly has four wings."),["La mariposa tiene cuatro alas."],["The _ has four wings.",["butterfly"]],["La _ tiene cuatro alas.",["mariposa"]],{en:"Wing = křídlo."}),
   SX("z4_4",4,"Vidím čtyři berušky.",E("I see four ladybirds.","I see four ladybugs."),["Veo cuatro mariquitas."],["I see four _.",["ladybirds","ladybugs"]],["Veo cuatro _.",["mariquitas"]],{en:"Ladybird = Británie, ladybug = USA. Y → ies? Ne, jen + s."}),
   SX("z4_5",5,"Je tu jedna moucha.",E("There is one fly.","There is a fly."),["Hay una mosca."],["There is one _.",["fly"]],["Hay una _.",["mosca"]])]},
 {t:{en:"Reptiles",es:"Reptiles",cs:"Plazi"},bg:"reptiles",targets:[ZT(0,"snake","had","snake","la serpiente","🐍"),ZT(1,"crocodile","krokodýl","crocodile","el cocodrilo","🐊"),ZT(2,"lizard","ještěrka","lizard","el lagarto","🦎"),ZT(3,"turtle","želva","turtle","la tortuga","🐢"),ZT(4,"frog","žába","frog","la rana","🐸"),ZT(5,"dinosaur","dinosaurus","dinosaur","el dinosaurio","🦖")],
  sents:[SX("z5_0",0,"Je had dlouhý?",E("Is the snake long?"),["¿Es larga la serpiente?","¿La serpiente es larga?"],["Is the _ long?",["snake"]],["¿Es larga la _?",["serpiente"]],{en:"Otázka: sloveso jde dopředu: The snake is long. → Is the snake long?"}),
   SX("z5_1",1,"Krokodýl není malý.",E("The crocodile is not small.","The crocodile isn't small."),["El cocodrilo no es pequeño."],["The _ is not small.",["crocodile"]],["El _ no es pequeño.",["cocodrilo"]],{en:"Zápor: is not = isn't.",es:"Zápor: no před slovesem."}),
   SX("z5_2",2,"Je ještěrka zelená?",E("Is the lizard green?"),["¿Es verde el lagarto?","¿El lagarto es verde?"],["Is the _ green?",["lizard"]],["¿Es verde el _?",["lagarto"]]),
   SX("z5_3",3,"Želva není rychlá.",E("The turtle is not fast.","The turtle isn't fast."),["La tortuga no es rápida."],["The _ is not fast.",["turtle"]],["La _ no es rápida.",["tortuga"]],{en:"Fast = rychlý."}),
   SX("z5_4",4,"Žába není velká.",E("The frog is not big.","The frog isn't big."),["La rana no es grande."],["The _ is not big.",["frog"]],["La _ no es grande.",["rana"]]),
   SX("z5_5",5,"Je to dinosaurus?",E("Is it a dinosaur?"),["¿Es un dinosaurio?"],["Is it a _?",["dinosaur"]],["¿Es un _?",["dinosaurio"]])]},
 {t:{en:"Birds",es:"Aves",cs:"Ptáci"},bg:"birds",targets:[ZT(0,"bird","pták","bird","el pájaro","🐦"),ZT(1,"penguin","tučňák","penguin","el pingüino","🐧"),ZT(2,"duck","kachna","duck","el pato","🦆"),ZT(3,"parrot","papoušek","parrot","el loro","🦜"),ZT(4,"owl","sova","owl","el búho","🦉"),ZT(5,"eagle","orel","eagle","el águila","🦅")],
  sents:[SX("z6_0",0,"Pták umí létat.",E("A bird can fly.","The bird can fly.","Birds can fly."),["Un pájaro puede volar.","El pájaro puede volar."],["A _ can fly.",["bird"]],["El _ puede volar.",["pájaro"]],{en:"Can = umí / může. Za can je sloveso bez to.",es:"Puede = může / umí."}),
   SX("z6_1",1,"Tučňák neumí létat.",E("A penguin can't fly.","A penguin cannot fly.","The penguin can't fly.","The penguin cannot fly.","Penguins can't fly."),["El pingüino no puede volar.","Un pingüino no puede volar."],["A _ can't fly.",["penguin"]],["El _ no puede volar.",["pingüino"]],{en:"Can't = cannot = neumí."}),
   SX("z6_2",2,"Kachna umí plavat.",E("A duck can swim.","The duck can swim.","Ducks can swim."),["El pato puede nadar.","Un pato puede nadar."],["A _ can swim.",["duck"]],["El _ puede nadar.",["pato"]],{en:"Swim = plavat."}),
   SX("z6_3",3,"Papoušek umí mluvit.",E("A parrot can talk.","A parrot can speak.","The parrot can talk.","The parrot can speak."),["El loro puede hablar.","Un loro puede hablar."],["A _ can talk.",["parrot"]],["El _ puede hablar.",["loro"]]),
   SX("z6_4",4,"Sova neumí plavat.",E("An owl can't swim.","An owl cannot swim.","The owl can't swim.","The owl cannot swim."),["El búho no puede nadar.","Un búho no puede nadar."],["An _ can't swim.",["owl"]],["El _ no puede nadar.",["búho"]]),
   SX("z6_5",5,"Umí orel létat?",E("Can an eagle fly?","Can the eagle fly?"),["¿Puede volar el águila?","¿El águila puede volar?"],["Can an _ fly?",["eagle"]],["¿Puede volar el _?",["águila"]],{en:"Otázka s can: Can + kdo + sloveso?",es:"Águila má člen el, i když je ženského rodu."})]}];
// ── kvízové levely (otázky v cizím jazyce) ──
const Q=(id,ti,q,a)=>({id,ti,q,a});
const QZ={en:"Quiz",es:"Preguntas",cs:"Kvíz"};
const WHAT={en:"What is this?",es:"¿Qué es esto?",cs:"Co je to?"};
const itIs=(w,e)=>[`It is ${an(w)}.`,`It's ${an(w)}.`,`${an(w)[0].toUpperCase()+an(w).slice(1)}.`,`${w[0].toUpperCase()+w.slice(1)}.`,`This is ${an(w)}.`,`That is ${an(w)}.`,`It's my ${w}.`,`It is my ${w}.`,`My ${w}.`];
const esIt=(art,w)=>[`Es ${art} ${w}.`,`${art[0].toUpperCase()+art.slice(1)} ${w}.`,`${w[0].toUpperCase()+w.slice(1)}.`,`Esto es ${art} ${w}.`,`Es mi ${w}.`,`Mi ${w}.`];
const an=w=>(/^[aeiou]/i.test(w)?"an ":"a ")+w;
const N=(en,es)=>({en:[en[0].toUpperCase()+en.slice(1)+".",`There are ${en}.`,en,en+"."],es:[es[0].toUpperCase()+es.slice(1)+".",`Hay ${es}.`,es]});
TOPIC.living.push({t:QZ,qa:[
  Q("h5_0",0,WHAT,{en:itIs("chair"),es:esIt("una","silla")}),
  Q("h5_1",1,{en:"What color is the door?",es:"¿De qué color es la puerta?",cs:"Jakou barvu mají dveře?"},{en:["Green.","It is green.","It's green.","The door is green."],es:["Verde.","Es verde.","La puerta es verde."]}),
  Q("h5_2",2,{en:"Is the table big?",es:"¿Es grande la mesa?",cs:"Je stůl velký?"},{en:["No, it isn't.","No.","No, it is not.","No, it's not.","No, it is small.","No, it's small.","No, the table is small."],es:["No.","No, no es grande.","No, es pequeña.","No, la mesa es pequeña."]}),
  Q("h5_3",null,{en:"How many chairs are there?",es:"¿Cuántas sillas hay?",cs:"Kolik je tu židlí?"},{en:["Two.","There are two chairs.","Two chairs.","2"],es:["Dos.","Hay dos sillas.","Dos sillas.","2"]}),
  Q("h5_4",3,{en:"What is on the wall?",es:"¿Qué hay en la pared?",cs:"Co je na zdi?"},{en:["A clock.","Clock.","It is a clock.","It's a clock.","There is a clock.","A clock is on the wall."],es:["Un reloj.","Reloj.","Hay un reloj.","Es un reloj."]}),
  Q("h5_5",null,{en:"How many legs does the table have?",es:"¿Cuántas patas tiene la mesa?",cs:"Kolik nohou má stůl?"},{en:["Four.","It has four legs.","Four legs.","4","The table has four legs."],es:["Cuatro.","Tiene cuatro patas.","Cuatro patas.","4"]})],
 targets:[T3("chair","židle","chair","la silla",288,222,335,276),T3("door","dveře","door","la puerta",350,130,350,22),T3("table","stůl","table","la mesa",215,204,200,276),T3("clock","hodiny","clock","el reloj",265,52,265,20)]});
TOPIC.body.push({t:QZ,look:{shirt:"#4a7bd6",trousers:"#2a2a2a",shoes:"#ffffff"},qa:[
  Q("b5_0",0,WHAT,{en:itIs("hand"),es:esIt("una","mano")}),
  Q("b5_1",null,{en:"How many eyes do you have?",es:"¿Cuántos ojos tienes?",cs:"Kolik máš očí?"},{en:["Two.","I have two eyes.","Two eyes.","2"],es:["Dos.","Tengo dos ojos.","Dos ojos.","2"]}),
  Q("b5_2",1,{en:"Is your hair long?",es:"¿Tienes el pelo largo?",cs:"Máš dlouhé vlasy?"},{en:c=>c.g==="f"?["Yes, it is.","Yes.","Yes, my hair is long.","Yes, it's long.","Yes, it is long."]:["No, it isn't.","No.","No, it is not.","No, it's short.","No, it is short.","No, my hair is short."],es:c=>c.g==="f"?["Sí.","Sí, es largo.","Sí, tengo el pelo largo."]:["No.","No, es corto.","No, tengo el pelo corto."]}),
  Q("b5_3",2,{en:"What color are your shoes?",es:"¿De qué color son tus zapatos?",cs:"Jakou barvu mají tvoje boty?"},{en:["White.","They are white.","They're white.","My shoes are white."],es:["Blancos.","Son blancos.","Mis zapatos son blancos."]}),
  Q("b5_4",null,{en:"How many fingers do you have?",es:"¿Cuántos dedos tienes?",cs:"Kolik máš prstů?"},{en:["Ten.","I have ten fingers.","Ten fingers.","10"],es:["Diez.","Tengo diez dedos.","Diez dedos.","10"]})],
 targets:[T3("hand","ruka","hand","la mano",20,92,-35,92),T3("hair","vlasy","hair","el pelo",50,20,-35,14),T3("shoes","boty","shoes","los zapatos",58,131,135,128)]});
TOPIC.pet.push({t:QZ,vb:[-70,-5,230,100],collar:true,ex:true,qa:[
  Q("p5_0",0,WHAT,{en:itIs("tail"),es:esIt("una","cola")}),
  Q("p5_1",null,c=>({en:`How many paws does your ${c.pet||"dog"} have?`,es:"¿Cuántas patas tiene tu mascota?",cs:"Kolik tlapek má tvůj mazlíček?"}),{en:c=>["Four.","It has four paws.","Four paws.","4",`My ${c.pet||"dog"} has four paws.`],es:["Cuatro.","Tiene cuatro patas.","Cuatro patas.","4"]}),
  Q("p5_2",1,{en:"What color is the ball?",es:"¿De qué color es la pelota?",cs:"Jakou barvu má míč?"},{en:["Red.","It is red.","It's red.","The ball is red."],es:["Roja.","Es roja.","La pelota es roja."]}),
  Q("p5_3",null,c=>({en:`Can your ${c.pet||"dog"} fly?`,es:"¿Puede volar tu mascota?",cs:"Umí tvůj mazlíček létat?"}),{en:["No, it can't.","No.","No, it cannot.","No, it can't fly."],es:["No.","No, no puede.","No, no puede volar."]}),
  Q("p5_4",0,{en:"Is the tail long?",es:"¿Es larga la cola?",cs:"Je ocas dlouhý?"},{en:["Yes, it is.","Yes.","Yes, it's long.","Yes, it is long.","Yes, the tail is long."],es:["Sí.","Sí, es larga.","Sí, la cola es larga."]})],
 targets:k=>[T3("tail","ocas","tail","la cola",k==="cat"?77:74,k==="cat"?46:32,135,14),T3("ball","míč","ball","la pelota",-5,84,-45,70)]});
TOPIC.zoo.push({t:QZ,bg:"farm",targets:[ZT(0,"lion","lev","lion","el león","🦁"),ZT(1,"giraffe","žirafa","giraffe","la jirafa","🦒"),ZT(2,"penguin","tučňák","penguin","el pingüino","🐧"),ZT(3,"bee","včela","bee","la abeja","🐝",2),ZT(4,"crab","krab","crab","el cangrejo","🦀"),ZT(5,"snake","had","snake","la serpiente","🐍")],qa:[
  Q("z7_0",0,WHAT,{en:itIs("lion"),es:esIt("un","león")}),
  Q("z7_1",1,{en:"Is the giraffe tall?",es:"¿Es alta la jirafa?",cs:"Je žirafa vysoká?"},{en:["Yes, it is.","Yes.","Yes, it's tall.","Yes, it is tall.","Yes, the giraffe is tall."],es:["Sí.","Sí, es alta.","Sí, la jirafa es alta."]}),
  Q("z7_2",2,{en:"Can a penguin fly?",es:"¿Puede volar un pingüino?",cs:"Umí tučňák létat?"},{en:["No, it can't.","No.","No, it cannot.","No, it can't fly.","No, a penguin can't fly."],es:["No.","No, no puede.","No, no puede volar.","No, el pingüino no puede volar."]}),
  Q("z7_3",3,{en:"How many bees are there?",es:"¿Cuántas abejas hay?",cs:"Kolik je tu včel?"},{en:["Two.","There are two bees.","Two bees.","2"],es:["Dos.","Hay dos abejas.","Dos abejas.","2"]}),
  Q("z7_4",4,{en:"What color is the crab?",es:"¿De qué color es el cangrejo?",cs:"Jakou barvu má krab?"},{en:["Red.","It is red.","It's red.","The crab is red."],es:["Rojo.","Es rojo.","El cangrejo es rojo."]}),
  Q("z7_5",5,{en:"Is the snake small?",es:"¿Es pequeña la serpiente?",cs:"Je had malý?"},{en:["No, it isn't.","No.","No, it is not.","No, it's not.","No, it is long.","No, it's long.","No, the snake is long."],es:["No.","No, no es pequeña.","No, es larga."]}),
  Q("z7_6",null,{en:"Can a duck swim?",es:"¿Puede nadar un pato?",cs:"Umí kachna plavat?"},{en:["Yes, it can.","Yes.","Yes, a duck can swim.","Yes, it can swim."],es:["Sí.","Sí, puede.","Sí, puede nadar.","Sí, el pato puede nadar."]}),
  Q("z7_7",null,{en:"How many legs does a spider have?",es:"¿Cuántas patas tiene una araña?",cs:"Kolik nohou má pavouk?"},{en:["Eight.","It has eight legs.","Eight legs.","8","A spider has eight legs."],es:["Ocho.","Tiene ocho patas.","Ocho patas.","8"]})]});
function zooSVG(i){
 const T=TOPIC.zoo[i],b=ZBG[T.bg];
 const deco={farm:`<path d="M0 160 h400" stroke="#c49a70" stroke-width="4"/>${[20,60,100,140,180,220,260,300,340,380].map(x=>`<rect x="${x-3}" y="146" width="6" height="22" fill="#c49a70"/>`).join("")}`,
  safari:`<circle cx="360" cy="40" r="22" fill="#ffd23f"/><path d="M20 150 q20 -30 40 0" fill="#7fae5a"/>`,
  water:[30,120,220,330].map(x=>`<path d="M${x} 150 q15 -8 30 0 t30 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`).join(""),
  insects:[40,140,250,360].map(x=>`<g transform="translate(${x},280)"><circle r="7" fill="#ffd23f"/>${[0,72,144,216,288].map(a=>`<ellipse cx="${10*Math.cos(a*Math.PI/180)}" cy="${10*Math.sin(a*Math.PI/180)}" rx="5" ry="3" transform="rotate(${a} ${10*Math.cos(a*Math.PI/180)} ${10*Math.sin(a*Math.PI/180)})" fill="#fff"/>`).join("")}</g>`).join(""),
  reptiles:`<ellipse cx="60" cy="280" rx="40" ry="12" fill="#b8a073"/><ellipse cx="330" cy="285" rx="50" ry="10" fill="#b8a073"/>`,
  birds:`<ellipse cx="80" cy="40" rx="34" ry="12" fill="#fff"/><ellipse cx="310" cy="56" rx="40" ry="13" fill="#fff"/>`}[T.bg];
 return `<rect width="400" height="300" fill="${b[0]}"/><rect y="150" width="400" height="150" fill="${b[1]}" opacity=".55"/>${deco}`+T.targets.map(t=>{
  const n=t.n||1,offs=n===1?[[0,0]]:n===2?[[-16,0],[16,4]]:n===3?[[-20,4],[0,-6],[20,4]]:[[-18,-10],[14,-10],[-14,10],[18,10]];
  return offs.map(([dx,dy])=>`<text x="${t.ax+dx}" y="${t.ay-22+dy}" font-size="${n===1?46:28}" text-anchor="middle" dominant-baseline="central">${t.emo}</text>`).join("")}).join("");
}
function renderZoo(){
 const c=C(),Lg=L(),i=tCur("zoo"),T=TOPIC.zoo[i];
 body().innerHTML=`<div class="lhead"><button class="btn ghost sm" data-go="tomap">← ${ui("map")}</button><div><span class="kap">ZOO</span><b>${bi(T.t)}</b></div></div>${tChips("zoo")}<div id="game"></div><div class="cards" id="zinfo"></div>`;
 topicGame($("#game"),{key:tKey("zoo",i),sents:T.sents,qa:T.qa,vb:[0,0,400,300],targets:withLabel(T.targets),svg:()=>zooSVG(i),
  onDone:()=>topicDone("zoo",i,`${ui("level")} ${i+1} ✓`,i<TOPIC.zoo.length-1?bi({en:`Next: ${TOPIC.zoo[i+1].t.en}!`,es:`Ahora: ${TOPIC.zoo[i+1].t.es}!`,cs:`Další výběh: ${TOPIC.zoo[i+1].t.cs}!`}):bi({en:"You know all the animals!",es:"¡Conoces todos los animales!",cs:"Znáš všechna zvířata!"}),`<svg viewBox="0 0 100 100" style="width:100%;height:100%"><text x="50" y="55" font-size="70" text-anchor="middle" dominant-baseline="central">${T.targets[0].emo}</text></svg>`)});
 $("#zinfo").innerHTML=`<div class="ccard main"><div><b>${ui("level")} ${i+1}: ${bi(T.t)}</b><span>${T.qa?"Odpovídej na otázky v cizím jazyce, každou 3× správně.":"1. štítky · 2. přetáhni · 3. napiš slovo · 4. doplň do věty · 5. celá věta 3×."} ${tDone("zoo",i)?"Hotovo ✓":i<TOPIC.zoo.length-1?"Odměna: 20 🪙 a další výběh.":"Odměna: 20 🪙."}</span></div></div>`;
}

// ── nákup jako rozhovor ──
const STAGES=["výběr ze 3 s překladem","výběr ze 4","doplň slovo","napiš s nápovědou","napiš sám"];
function converse(item,onBought){
 const c=C(),Lg=L();
 if(!c.b.shop)return info(bi({en:"You need a shop",es:"Necesitas una tienda",cs:"Potřebuješ obchod"}),bi({en:"Build a shop first (level 6).",es:"Primero construye una tienda (nivel 6).",cs:"Nejdřív postav obchod (level 6)."}));
 if(c.coins<item.price)return info(bi({en:"Not enough coins",es:"No tienes suficientes monedas",cs:"Málo mincí"}),`${item.price} 🪙 · ${bi({en:`You have ${c.coins}.`,es:`Tienes ${c.coins}.`,cs:`Máš ${c.coins}. Procvičuj lekce a štítky, vyděláš si.`})}`);
 const stage=Math.min(c.buys||0,4),nm=item[Lg],NAMES=nm.map(x=>noAcc(norm(x).t));
 const full=Lg==="en"?`${/^[aeiou]/i.test(nm[0])?"an":"a"} ${nm[0]}`:`${item.esA} ${nm[0]}`;
 const re=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),NM=`(${NAMES.map(re).join("|")})`;
 const n=s=>noAcc(norm(s).t);
 const T1=Lg==="en"?new RegExp(`^((hello|hi|good morning|good afternoon|good evening) )?(i want to buy|i would like to buy|id like to buy|i want|i would like|id like|can i have|can i buy|i need)( (a|an|the|some))? ${NM}( please)?$`)
                   :new RegExp(`^((hola|buenos dias|buenas tardes|buenas) )?(quiero comprar|quisiera comprar|me gustaria comprar|quiero|quisiera|me gustaria|necesito)( (un|una|el|la))? ${NM}( por favor)?$`);
 const T2=Lg==="en"?/^(here you are|here you go|here it is|thank you|thanks)( (thank you|thanks|here you are|here you go))?$/:/^(aqui tiene|aqui tienes|aqui esta|gracias)( (gracias|aqui tiene|aqui tienes))?$/;
 const T3r=Lg==="en"?/(goodbye|bye|see you)/:/(adios|hasta luego|hasta pronto|chao)/;
 const SK=Lg==="en"?[["Hello! Can I help you?","Dobrý den! Můžu vám pomoct?"],[`Here you are. It is ${item.price} coins.`,`Tady máte. Stojí to ${item.price} mincí.`],["Thank you! Goodbye!","Děkuji! Na shledanou!"]]
  :[["¡Hola! ¿En qué puedo ayudarle?","Dobrý den! Můžu vám pomoct?"],[`Aquí tiene. Son ${item.price} monedas.`,`Tady máte. Stojí to ${item.price} mincí.`],["¡Gracias! ¡Adiós!","Děkuji! Na shledanou!"]];
 const U=Lg==="en"?[
  {t:`Hello! I want to buy ${full}.`,cs:`Dobrý den! Chci koupit ${item.cs4}.`,pre:`Hello! I want to buy ${full.split(" ")[0]} `,post:".",blank:x=>NAMES.includes(n(x).replace(/^(a|an|the) /,"")),test:x=>T1.test(n(x)),
   d:[[`Goodbye! I want to sell ${full}.`,`Na shledanou! Chci prodat ${item.cs4}.`],[`Hello! I am ${full}.`,`Ahoj! Já jsem ${item.cs}.`],[`Where is the ${nm[0]}?`,`Kde je ${item.cs}?`]]},
  {t:"Here you are.",cs:"Tady máte (podávám peníze).",pre:"Here you ",post:".",blank:x=>["are","go"].includes(n(x)),test:x=>T2.test(n(x)),d:[["I am hungry.","Mám hlad."],["Where is the shop?","Kde je obchod?"],["How old are you?","Kolik ti je let?"]]},
  {t:"Goodbye!",cs:"Na shledanou!",pre:"",post:"!",blank:x=>["goodbye","bye"].includes(n(x)),test:x=>T3r.test(n(x)),d:[["Hello!","Ahoj!"],["How much is it?","Kolik to stojí?"],["I want a dog.","Chci psa."]]}]
 :[
  {t:`¡Hola! Quiero comprar ${full}.`,cs:`Dobrý den! Chci koupit ${item.cs4}.`,pre:`¡Hola! Quiero comprar ${item.esA} `,post:".",blank:x=>NAMES.includes(n(x).replace(/^(un|una|el|la) /,"")),test:x=>T1.test(n(x)),
   d:[[`¡Adiós! Quiero vender ${full}.`,`Na shledanou! Chci prodat ${item.cs4}.`],[`¡Hola! Soy ${full}.`,`Ahoj! Já jsem ${item.cs}.`],[`¿Dónde está ${item.esD} ${nm[0]}?`,`Kde je ${item.cs}?`]]},
  {t:"Aquí tiene.",cs:"Tady máte (podávám peníze).",pre:"Aquí ",post:".",blank:x=>["tiene","tienes"].includes(n(x)),test:x=>T2.test(n(x)),d:[["Tengo hambre.","Mám hlad."],["¿Dónde está la tienda?","Kde je obchod?"],["¿Cuántos años tienes?","Kolik ti je let?"]]},
  {t:"¡Adiós!",cs:"Na shledanou!",pre:"¡",post:"!",blank:x=>["adios","hasta luego"].includes(n(x)),test:x=>T3r.test(n(x)),d:[["¡Hola!","Ahoj!"],["¿Cuánto cuesta?","Kolik to stojí?"],["Quiero un perro.","Chci psa."]]}];
 let step=0,tries=0;const log=[];
 const skB=k=>`<div class="cb k"><span>${esc(SK[k][0])}</span>${stage<=1?`<small>${esc(SK[k][1])}</small>`:""}</div>`;
 log.push(skB(0));
 function draw(){
  const u=U[step];let inp="";
  if(stage<=1){const opts=shuffle([[u.t,u.cs,1]].concat(shuffle(u.d.slice()).slice(0,stage===0?2:3)));inp=`<div class="opts">${opts.map(o=>`<button class="opt" data-ok="${o[2]||0}">${esc(o[0])}${stage===0?`<small>${esc(o[1])}</small>`:""}</button>`).join("")}</div>`}
  else if(stage===2)inp=`<div class="fill">${esc(u.pre)}<input class="bl ain" autocomplete="off" autocapitalize="off" spellcheck="false" lang="${Lg}">${esc(u.post)}</div><button class="btn wide" id="cOk">${ui("ok")}</button>`;
  else inp=`${stage===3?`<p class="small">Nápověda: <b>${esc(u.t.split(" ").map(w=>w.replace(/^([¡¿]?.).*?([.!?]?)$/,"$1…$2")).join(" "))}</b> · ${esc(u.cs)}</p>`:`<p class="small" id="cHint">💡 <a href="#" id="cShow">Ukázat, co mám říct česky</a></p>`}<textarea rows="1" class="ain" lang="${Lg}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea><button class="btn wide" id="cOk">${ui("ok")}</button>`;
  openModal(`<div class="shopk"><div class="sk">${A.CRIT[1]}</div><div class="skh"><b>${bi({en:"Shopping",es:"De compras",cs:"Nákup"})}</b><span class="small">Nákup č. ${(c.buys||0)+1} · ${STAGES[stage]} · ${esc(nm[0])} ${item.price} 🪙</span></div></div>
   <div class="chat">${log.join("")}</div><p class="amsg"></p>${inp}<button class="btn ghost wide" data-close style="margin-top:8px">${ui("close")}</button>`,b=>{
   const msg=b.querySelector(".amsg");
   const good=text=>{log.push(`<div class="cb u">${esc(text)}</div>`);step++;tries=0;
    if(step<3){log.push(skB(step));A.say(SK[step][0]);draw()}else finish()};
   const bad=el=>{tries++;if(el){el.classList.remove("shake");void el.offsetWidth;el.classList.add("shake")}msg.innerHTML=tries>=2?`Správně: <b>${esc(u.t)}</b>`:"Zkus to znovu."};
   b.querySelectorAll(".opt").forEach(o=>o.onclick=()=>{if(o.dataset.ok==="1")good(u.t);else{o.classList.add("wrong");bad()}});
   const ok=b.querySelector("#cOk"),ta=b.querySelector(".ain");
   if(ok){const go=()=>{const v=ta.value;if(!v.trim())return;if(stage===2?u.blank(v):u.test(v))good(stage===2?u.pre+v.trim()+u.post:v.trim());else bad(ta)};ok.onclick=go;ta.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();go()}});setTimeout(()=>ta.focus(),50)}
   const sh=b.querySelector("#cShow");if(sh)sh.onclick=e=>{e.preventDefault();b.querySelector("#cHint").textContent="💡 "+u.cs};
   const ch=b.querySelector(".chat");ch.scrollTop=ch.scrollHeight;
  });
 }
 function finish(){
  c.coins-=item.price;c.buys=(c.buys||0)+1;c.own=c.own||{};onBought();save();
  log.push(skB(2));
  openModal(`<div class="chat">${log.join("")}</div><h2>${bi({en:"You bought it!",es:"¡Lo has comprado!",cs:"Koupeno!"})}</h2><p>${esc(nm[0])} · −${item.price} 🪙</p><p class="small">Další nákup bude těžší: ${STAGES[Math.min(c.buys,4)]}.</p><button class="btn wide" data-close>${ui("close")}</button>`);
  render();
 }
 A.say(SK[0][0]);draw();
}

window.City={render:()=>{if(view==="lesson"&&LS&&LS.lang!==L()){clearTimeout(nextT);view="map";LS=null}render()}};
})();
