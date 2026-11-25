// Moje město – hra (levely 1–7)
// Každý level: 1) 3 nová slova, každé 3× správně  2) 3 věty se stejnými slovy, každá 3× správně.
// Kolo = max 6 karet (3 nové + až 3 starší na opakování). Po levelu se ve městě odemkne to, co ses naučil.
// Texty hry jsou v cizím jazyce; česká nápověda zmizí, jakmile dané slovo umíš.
(function(){
const A=window.APP;
const $=s=>document.querySelector(s);
const esc=A.esc,norm=A.norm,noAcc=A.noAcc;
const S=()=>A.S,L=()=>S().lang;
const NEED=3,REVIEW=3,BONUS=10,RW={w:1,s:3},COST={pet:50,shop:150},DECAY=4;
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
const PLOTS=[{id:"shop",en:"Shop",es:"Tienda",lv:6},{id:"market",en:"Market",es:"Mercado",lv:8},{id:"bus",en:"Bus stop",es:"Parada",lv:9},{id:"cafe",en:"Café",es:"Café",lv:10},{id:"park",en:"Park",es:"Parque",lv:11},{id:"school",en:"School",es:"Escuela",lv:12},{id:"doctor",en:"Doctor",es:"Médico",lv:13},{id:"station",en:"Station",es:"Estación",lv:14}];

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
const ctx=()=>({name:P().name||"Alex",pet:C().pet&&C().pet.kind});
const tx=(it,f)=>{const v=it[f];return typeof v==="function"?v(ctx()):v};
const wallet=()=>C().lv>3;
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
function AV(g){
 const shirt=g==="f"?"#e86f9a":"#4a7bd6",hair="#6b4226",skin="#f3c9a0";
 return `<ellipse cx="50" cy="132" rx="26" ry="6" fill="rgba(0,0,0,.15)"/><rect x="39" y="98" width="9" height="32" rx="4" fill="#3b3f58"/><rect x="52" y="98" width="9" height="32" rx="4" fill="#3b3f58"/><path d="M34 70 L20 92" stroke="${skin}" stroke-width="8" stroke-linecap="round"/><path d="M66 70 L80 92" stroke="${skin}" stroke-width="8" stroke-linecap="round"/>${g==="f"?`<path d="M36 62 h28 l10 44 h-48z" fill="${shirt}"/><path d="M25 46 Q22 14 50 15 Q78 14 75 46 L76 74 Q66 66 68 46 Q62 30 50 30 Q38 30 32 46 Q34 66 24 74Z" fill="${hair}"/>`:`<rect x="31" y="62" width="38" height="42" rx="12" fill="${shirt}"/>`}<circle cx="50" cy="42" r="22" fill="${skin}"/>${g==="f"?`<path d="M28 40 Q30 18 50 18 Q70 18 72 40 Q60 30 50 30 Q40 30 28 40Z" fill="${hair}"/>`:`<path d="M27 40 Q28 16 50 17 Q73 16 73 40 Q66 27 50 29 Q35 27 27 40Z" fill="${hair}"/>`}<circle cx="42" cy="44" r="2.8" fill="#2a1d14"/><circle cx="58" cy="44" r="2.8" fill="#2a1d14"/><path d="M43 52 Q50 58 57 52" stroke="#2a1d14" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="36" cy="51" r="4" fill="#f77" opacity=".35"/><circle cx="64" cy="51" r="4" fill="#f77" opacity=".35"/>`;
}
function PETSVG(k){
 if(k==="dog")return `<ellipse cx="42" cy="76" rx="26" ry="5" fill="rgba(0,0,0,.15)"/><path d="M66 52 q14 -8 10 -22" stroke="#c98b4f" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="30" y="58" width="8" height="18" rx="4" fill="#b87a40"/><rect x="54" y="58" width="8" height="18" rx="4" fill="#b87a40"/><ellipse cx="48" cy="56" rx="24" ry="15" fill="#c98b4f"/><circle cx="26" cy="38" r="17" fill="#d9a066"/><ellipse cx="12" cy="40" rx="6" ry="12" fill="#8a5a2b"/><ellipse cx="40" cy="38" rx="6" ry="12" fill="#8a5a2b"/><circle cx="21" cy="36" r="2.6" fill="#2a1d14"/><circle cx="31" cy="36" r="2.6" fill="#2a1d14"/><ellipse cx="26" cy="45" rx="4.5" ry="3.2" fill="#2a1d14"/><path d="M22 50 q4 4 8 0" stroke="#2a1d14" stroke-width="2" fill="none" stroke-linecap="round"/>`;
 return `<ellipse cx="42" cy="76" rx="24" ry="5" fill="rgba(0,0,0,.15)"/><path d="M64 66 Q84 60 74 38" stroke="#e98a3a" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="46" cy="60" rx="22" ry="16" fill="#f0a050"/><path d="M12 30 L16 8 L30 22Z M44 30 L40 8 L26 22Z" fill="#f0a050"/><circle cx="28" cy="36" r="17" fill="#f0a050"/><path d="M17 33 q4 -4 8 0 M31 33 q4 -4 8 0" stroke="#2a1d14" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M25 41 h6 l-3 3z" fill="#e0607a"/><path d="M8 40 H20 M8 46 L20 44 M36 40 H48 M36 44 L48 46" stroke="#2a1d14" stroke-width="1.3" opacity=".6"/>`;
}
const shopLbl=()=>L()==="es"?"TIENDA":"SHOP";
function pic(p){
 if(typeof p==="function")p=p(ctx());
 if(p==="m"||p==="f")return `<svg viewBox="0 0 100 140">${AV(p)}</svg>`;
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
  if(built)out.push(`<g class="tap" data-act="${pl.id}" transform="translate(${x},${y})">${SHOP(shopLbl())}${c.lv<=7?`<g transform="translate(24,16)"><rect x="-17" y="-8" width="34" height="14" rx="3" fill="#fff" stroke="#c9a46a"/><text y="3" text-anchor="middle" font-size="8" font-weight="700" fill="#b8473a">${Lg==="es"?"VACÍA":"EMPTY"}</text></g>`:""}</g>`);
  else if(can)out.push(`<g class="tap pulse" data-act="build-${pl.id}" transform="translate(${x},${y})"><rect x="-38" y="-30" width="76" height="60" rx="12" fill="#f6ebcb" stroke="#c9a46a" stroke-width="2.5" stroke-dasharray="6 5"/><text y="4" text-anchor="middle" font-size="26" font-weight="700" fill="#b08a4e">+</text><text y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#8a6a36">${pl[Lg]}</text></g>`);
  else out.push(`<g class="tap" data-act="locked-${i}" transform="translate(${x},${y})"><rect x="-38" y="-30" width="76" height="60" rx="12" fill="rgba(255,255,255,.45)" stroke="#9fc08c" stroke-width="2" stroke-dasharray="4 4"/><g transform="translate(0,-6)">${LOCK}</g><text y="21" text-anchor="middle" font-size="12" font-weight="700" fill="#5f7d54">${Lg==="es"?"Nivel":"Level"} ${pl.lv}</text></g>`);
 });
 out.push(`<g class="tap" data-act="house" transform="translate(200,196)">${HOUSE}</g>`);
 if(p.g)out.push(`<g class="tap" data-act="house" transform="translate(228,206) scale(.42)">${AV(p.g)}</g>`);
 if(c.pet){const h=hunger();out.push(`<g class="tap" data-act="pet" transform="translate(132,212) scale(.62)">${PETSVG(c.pet.kind)}${c.lv>5&&h<40?`<g transform="translate(46,-6)"><circle r="14" fill="#fff" stroke="#e0614f" stroke-width="3"/><text y="6" text-anchor="middle" font-size="18" font-weight="700" fill="#e0614f">!</text></g>`:""}</g>`);
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
 if(a==="pet")return petModal();
 if(a==="house")return houseModal();
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
  el.innerHTML=`<div class="crow"><div class="cpic">${pic(it.pic)}</div><div class="cs">${esc(tx(it,"cs"))}</div></div><div class="meta"><span class="dots">${[0,1,2].map(k=>`<i class="${k<s0.c?"on":""}"></i>`).join("")}</span>${isNew?`<span class="tag new">${ui("new")}</span>`:""}${ans.length>1?`<span class="tag">${ans.length} ${ans.length>=5?"variant":"varianty"}</span>`:""}</div>
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
   if(!stt.peek){s.c++;c.coins+=rew;if(wallet())fly(el,`+${rew} 🪙`);$("#cRes").innerHTML=resHTML()}
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
  inp.addEventListener("input",()=>{inp.value=inp.value.replace(/\s*\n\s*/g," ");fit();if(stt.done)return;el.classList.remove("bad");const r=check(inp.value,ans,it.t==="w");if(r.s==="ok"||r.s==="accent")win(r)});
  const judge=()=>{if(stt.done)return;const r=check(inp.value,ans,it.t==="w");if(r.s==="empty")return;if(r.s==="ok"||r.s==="accent")return win(r);el.classList.remove("bad");void el.offsetWidth;el.classList.add("bad");if(!stt.wrong){stt.wrong=true;st(it.id).w++;save()}};
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
function houseModal(){
 const p=P(),c=C();
 openModal(`<div class="petpick">${p.g?`<svg viewBox="0 0 100 140" style="height:120px">${AV(p.g)}</svg>`:""}<svg viewBox="-50 -50 100 95" style="height:110px">${HOUSE}</svg></div><h2>${esc(p.name||"")}</h2>
  <p>${bi({en:"This is my house.",es:"Esta es mi casa.",cs:"Tohle je můj dům."})}</p><p class="small">${ui("level")} ${Math.min(c.lv,LV.length)} / ${LV.length}</p><button class="btn wide" data-close>${ui("close")}</button>`);
}

window.City={render:()=>{if(view==="lesson"&&LS&&LS.lang!==L()){clearTimeout(nextT);view="map";LS=null}render()}};
})();
