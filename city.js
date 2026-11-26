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
function AV(g,look){
 look=look||P().look||{};const shirt=look.shirt||(g==="f"?"#e86f9a":"#4a7bd6"),hair=look.hair||"#6b4226",skin="#f3c9a0";
 return `<ellipse cx="50" cy="132" rx="26" ry="6" fill="rgba(0,0,0,.15)"/><rect x="39" y="98" width="9" height="32" rx="4" fill="#3b3f58"/><rect x="52" y="98" width="9" height="32" rx="4" fill="#3b3f58"/><path d="M34 70 L20 92" stroke="${skin}" stroke-width="8" stroke-linecap="round"/><path d="M66 70 L80 92" stroke="${skin}" stroke-width="8" stroke-linecap="round"/>${g==="f"?`<path d="M36 62 h28 l10 44 h-48z" fill="${shirt}"/><path d="M25 46 Q22 14 50 15 Q78 14 75 46 L76 74 Q66 66 68 46 Q62 30 50 30 Q38 30 32 46 Q34 66 24 74Z" fill="${hair}"/>`:`<rect x="31" y="62" width="38" height="42" rx="12" fill="${shirt}"/>`}<circle cx="50" cy="42" r="22" fill="${skin}"/>${g==="f"?`<path d="M28 40 Q30 18 50 18 Q70 18 72 40 Q60 30 50 30 Q40 30 28 40Z" fill="${hair}"/>`:`<path d="M27 40 Q28 16 50 17 Q73 16 73 40 Q66 27 50 29 Q35 27 27 40Z" fill="${hair}"/>`}<circle cx="42" cy="44" r="2.8" fill="#2a1d14"/><circle cx="58" cy="44" r="2.8" fill="#2a1d14"/><path d="M43 52 Q50 58 57 52" stroke="#2a1d14" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="36" cy="51" r="4" fill="#f77" opacity=".35"/><circle cx="64" cy="51" r="4" fill="#f77" opacity=".35"/>`;
}
function PETSVG(k,collar){
 const col=collar?(k==="dog"?`<path d="M28 52 q9 7 18 -1" stroke="#e0614f" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="37" cy="57" r="3.2" fill="#ffd23f"/>`:`<path d="M17 50 q11 7 22 0" stroke="#3566d6" stroke-width="4.5" fill="none" stroke-linecap="round"/><circle cx="28" cy="55" r="3" fill="#ffd23f"/>`):"";
 if(k==="dog")return `<ellipse cx="42" cy="76" rx="26" ry="5" fill="rgba(0,0,0,.15)"/><path d="M66 52 q14 -8 10 -22" stroke="#c98b4f" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="30" y="58" width="8" height="18" rx="4" fill="#b87a40"/><rect x="54" y="58" width="8" height="18" rx="4" fill="#b87a40"/><ellipse cx="48" cy="56" rx="24" ry="15" fill="#c98b4f"/><circle cx="26" cy="38" r="17" fill="#d9a066"/><ellipse cx="12" cy="40" rx="6" ry="12" fill="#8a5a2b"/><ellipse cx="40" cy="38" rx="6" ry="12" fill="#8a5a2b"/><circle cx="21" cy="36" r="2.6" fill="#2a1d14"/><circle cx="31" cy="36" r="2.6" fill="#2a1d14"/><ellipse cx="26" cy="45" rx="4.5" ry="3.2" fill="#2a1d14"/><path d="M22 50 q4 4 8 0" stroke="#2a1d14" stroke-width="2" fill="none" stroke-linecap="round"/>`+col;
 return `<ellipse cx="42" cy="76" rx="24" ry="5" fill="rgba(0,0,0,.15)"/><path d="M64 66 Q84 60 74 38" stroke="#e98a3a" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="46" cy="60" rx="22" ry="16" fill="#f0a050"/><path d="M12 30 L16 8 L30 22Z M44 30 L40 8 L26 22Z" fill="#f0a050"/><circle cx="28" cy="36" r="17" fill="#f0a050"/><path d="M17 33 q4 -4 8 0 M31 33 q4 -4 8 0" stroke="#2a1d14" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M25 41 h6 l-3 3z" fill="#e0607a"/><path d="M8 40 H20 M8 46 L20 44 M36 40 H48 M36 44 L48 46" stroke="#2a1d14" stroke-width="1.3" opacity=".6"/><ellipse cx="36" cy="74" rx="7" ry="4" fill="#e98a3a"/><ellipse cx="56" cy="74" rx="7" ry="4" fill="#e98a3a"/>`+col;
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
  if(built)out.push(`<g class="tap" data-act="${pl.id}" transform="translate(${x},${y})">${SHOP(shopLbl())}${c.lv<=7?`<g transform="translate(24,16)"><rect x="-17" y="-8" width="34" height="14" rx="3" fill="#fff" stroke="#c9a46a"/><text y="3" text-anchor="middle" font-size="8" font-weight="700" fill="#b8473a">${Lg==="es"?"VACÍA":"EMPTY"}</text></g>`:""}</g>`);
  else if(can)out.push(`<g class="tap pulse" data-act="build-${pl.id}" transform="translate(${x},${y})"><rect x="-38" y="-30" width="76" height="60" rx="12" fill="#f6ebcb" stroke="#c9a46a" stroke-width="2.5" stroke-dasharray="6 5"/><text y="4" text-anchor="middle" font-size="26" font-weight="700" fill="#b08a4e">+</text><text y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#8a6a36">${pl[Lg]}</text></g>`);
  else out.push(`<g class="tap" data-act="locked-${i}" transform="translate(${x},${y})"><rect x="-38" y="-30" width="76" height="60" rx="12" fill="rgba(255,255,255,.45)" stroke="#9fc08c" stroke-width="2" stroke-dasharray="4 4"/><g transform="translate(0,-6)">${LOCK}</g><text y="21" text-anchor="middle" font-size="12" font-weight="700" fill="#5f7d54">${Lg==="es"?"Nivel":"Level"} ${pl.lv}</text></g>`);
 });
 out.push(`<g class="tap" data-act="house" transform="translate(200,196)">${HOUSE}</g>`);
 if(p.g)out.push(`<g class="tap" data-act="me" transform="translate(228,206) scale(.42)">${AV(p.g)}</g>`);
 if(c.own&&c.own.home)out.push(`<g transform="translate(104,250)">${c.pet&&c.pet.kind==="cat"?`<ellipse cy="10" rx="20" ry="8" fill="#e86f9a"/><ellipse cy="7" rx="14" ry="5" fill="#f7d3e4"/>`:`<path d="M-20 2 L0 -16 L20 2Z" fill="#b8473a"/><rect x="-16" y="2" width="32" height="20" fill="#c98b4f"/><path d="M-6 22 v-9 a6 6 0 0 1 12 0 v9z" fill="#3a2a1a"/>`}</g>`);
 if(c.pet){const h=hunger();out.push(`<g class="tap" data-act="pet" transform="translate(132,212) scale(.62)">${PETSVG(c.pet.kind,c.own&&c.own.collar)}${c.lv>5&&h<40?`<g transform="translate(46,-6)"><circle r="14" fill="#fff" stroke="#e0614f" stroke-width="3"/><text y="6" text-anchor="middle" font-size="18" font-weight="700" fill="#e0614f">!</text></g>`:""}</g>`);
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
 if(a==="feed")return petModal();
 if(a==="tomap"){view="map";return render()}
 if(a.startsWith("fbuy-")){const id=a.slice(5);return converse(FURN[id],()=>{C().own[id]=true})}
 if(a.startsWith("pbuy-")){const id=a.slice(5);return converse(petItem(id),()=>{C().own[id]=true})}
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
function labelGame(el,{svg,vb,targets,onDone,locked}){
 const[x0,y0,w,h]=vb;let mode="study",placed=0,mistakes=0,sel=null;
 const lab=t=>`<b>${esc(t.label)}</b><small>${esc(t.cs)}</small>`;
 function draw(){
  placed=0;mistakes=0;sel=null;
  const sw=w/400;
  const lines=targets.map(t=>`<line x1="${t.ax}" y1="${t.ay}" x2="${t.lx}" y2="${t.ly}" stroke="#2a1d14" stroke-width="${1.3*sw}" stroke-dasharray="${4*sw} ${3*sw}" opacity=".5"/><circle cx="${t.ax}" cy="${t.ay}" r="${3.4*sw}" fill="#fff" stroke="#2a1d14" stroke-width="${1.2*sw}"/>`).join("");
  el.innerHTML=`<div class="scene" style="aspect-ratio:${w}/${h}"><svg viewBox="${vb.join(" ")}">${svg(mode)}${lines}</svg>${targets.map((t,i)=>`<div class="frame${mode==="study"?" ok":""}" data-i="${i}" style="left:${(t.lx-x0)/w*100}%;top:${(t.ly-y0)/h*100}%">${mode==="study"?lab(t):"&nbsp;"}</div>`).join("")}</div>
   ${mode==="test"?`<div class="tray">${shuffle(targets.map((_,i)=>i)).map(i=>`<button class="chipl" data-i="${i}">${esc(targets[i].label)}</button>`).join("")}</div><p class="small" style="text-align:center">Přetáhni štítek na správné místo (nebo klepni na štítek a pak na rámeček).</p>`:""}
   <div class="gbtns">${mode==="study"?`<button class="btn" id="gTest">🙈 ${ui("hide")}</button>`:`<button class="btn ghost" id="gStudy">🏷️ ${ui("show")}</button>`}</div>`;
  const t1=el.querySelector("#gTest"),t2=el.querySelector("#gStudy");
  if(t1)t1.onclick=()=>{if(locked&&locked())return;mode="test";draw()};
  if(t2)t2.onclick=()=>{mode="study";draw()};
  el.querySelectorAll(".frame").forEach(f=>f.onclick=()=>{const t=targets[+f.dataset.i];if(mode==="study"||f.classList.contains("ok"))return A.say(t.label);if(sel)attempt(+sel.dataset.i,f,sel)});
  el.querySelectorAll(".chipl").forEach(ch=>ch.addEventListener("pointerdown",e=>{
   e.preventDefault();const i=+ch.dataset.i,g=ch.cloneNode(true);g.classList.add("drag");document.body.appendChild(g);
   const sx=e.clientX,sy=e.clientY;let moved=false;
   const mv=ev=>{if(Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>6)moved=true;g.style.left=ev.clientX+"px";g.style.top=ev.clientY+"px"};mv(e);
   const up=ev=>{document.removeEventListener("pointermove",mv);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);g.remove();
    if(!moved){el.querySelectorAll(".chipl").forEach(x=>x.classList.toggle("sel",x===ch&&!x.classList.contains("sel")));sel=ch.classList.contains("sel")?ch:null;return}
    const fr=[...el.querySelectorAll(".frame:not(.ok)")].find(f=>{const r=f.getBoundingClientRect();return ev.clientX>=r.left-10&&ev.clientX<=r.right+10&&ev.clientY>=r.top-10&&ev.clientY<=r.bottom+10});
    if(fr)attempt(i,fr,ch)};
   document.addEventListener("pointermove",mv);document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);
  }));
 }
 function attempt(i,fr,ch){
  sel=null;el.querySelectorAll(".chipl").forEach(x=>x.classList.remove("sel"));
  if(+fr.dataset.i===i){fr.classList.add("ok");fr.innerHTML=lab(targets[i]);ch.remove();A.say(targets[i].label);placed++;if(placed===targets.length)setTimeout(()=>onDone(mistakes),600)}
  else{mistakes++;fr.classList.remove("no");void fr.offsetWidth;fr.classList.add("no");A.toast("Tam to nepatří")}
 }
 draw();
}
const T3=(k,cs,en,es,ax,ay,lx,ly)=>({k,cs,en,es,ax,ay,lx,ly});
const withLabel=arr=>arr.map(t=>({...t,label:t[L()]}));

// ── dům ──
const ROOMS=[{id:"living",en:"Living room",es:"Salón",cs:"Obývák",lv:1},{id:"kitchen",en:"Kitchen",es:"Cocina",cs:"Kuchyň",lv:8},{id:"bedroom",en:"Bedroom",es:"Dormitorio",cs:"Ložnice",lv:9},{id:"bathroom",en:"Bathroom",es:"Baño",cs:"Koupelna",lv:10},{id:"garage",en:"Garage",es:"Garaje",cs:"Garáž",lv:11}];
const ROOM_T=[T3("wall","zeď","wall","la pared",230,60,230,22),T3("window","okno","window","la ventana",70,90,70,22),T3("door","dveře","door","la puerta",350,130,350,22),
 T3("floor","podlaha","floor","el suelo",60,272,52,276),T3("table","stůl","table","la mesa",215,204,200,276),T3("chair","židle","chair","la silla",288,222,335,276)];
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
function roomSVG(own,ghost){
 const o=[`<rect width="400" height="190" fill="#f6efe3"/><rect y="190" width="400" height="110" fill="#d9b38c"/>${[0,1,2,3,4,5,6,7,8].map(k=>`<line x1="${k*55}" y1="190" x2="${k*55-30}" y2="300" stroke="#c49a70" stroke-width="2"/>`).join("")}<rect y="186" width="400" height="6" fill="#c9a46a"/>`,
  `<rect x="30" y="50" width="80" height="80" rx="4" fill="#a8dcf7" stroke="#fff" stroke-width="6"/><line x1="70" y1="50" x2="70" y2="130" stroke="#fff" stroke-width="4"/><line x1="30" y1="90" x2="110" y2="90" stroke="#fff" stroke-width="4"/>`,
  `<rect x="320" y="70" width="60" height="120" rx="3" fill="#9b6334" stroke="#7a4b24" stroke-width="3"/><circle cx="370" cy="132" r="4" fill="#ffd23f"/>`];
 if(own.rug)o.push(FART.rug);
 o.push(`<rect x="170" y="200" width="90" height="9" rx="2" fill="#a8743f"/><rect x="176" y="209" width="6" height="36" fill="#8a5a2b"/><rect x="248" y="209" width="6" height="36" fill="#8a5a2b"/>`,
  `<rect x="296" y="180" width="7" height="45" rx="2" fill="#8a5a2b"/><rect x="272" y="218" width="31" height="6" rx="2" fill="#a8743f"/><rect x="274" y="224" width="4" height="28" fill="#8a5a2b"/><rect x="298" y="224" width="4" height="28" fill="#8a5a2b"/>`);
 ["sofa","tv","picture","lamp","plant"].forEach(k=>{if(own[k])o.push(FART[k])});
 if(ghost)Object.values(FURN).forEach(f=>{if(own[f.id])return;const[x,y,w,h]=f.g;o.push(`<g class="tap ghost" data-act="fbuy-${f.id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="rgba(255,255,255,.35)" stroke="#2f9e6a" stroke-width="2" stroke-dasharray="5 4"/><text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle" font-size="12" font-weight="700" fill="#25805a">+${f.price}</text></g>`)});
 return o.join("");
}
function renderHouse(){
 const c=C(),q=c.quiz||(c.quiz={}),own=c.own||(c.own={}),Lg=L();
 body().innerHTML=`<div class="lhead"><button class="btn ghost sm" data-go="tomap">← ${ui("map")}</button><div><span class="kap">${ui("house")}</span><b>${bi(ROOMS[0])}</b></div></div>
  <div class="chips" style="margin-bottom:12px">${ROOMS.map((r,i)=>`<button class="chip${i?"":" on"}" ${i?`data-act="room-${i}"`:""}>${i&&c.lv<=r.lv?"🔒 ":""}${esc(r[Lg])}</button>`).join("")}</div>
  <div id="game"></div><div class="cards" id="hinfo"></div>`;
 labelGame($("#game"),{vb:[0,0,400,300],targets:withLabel(ROOM_T),svg:m=>roomSVG(own,q.living&&m==="study"),onDone:mis=>{
  if(!q.living){q.living=true;c.coins+=20;save();render();party(bi({en:"LIVING ROOM",es:"SALÓN",cs:"OBÝVÁK"}),"+20 🪙",bi({en:"Now you can buy furniture! Tap a + in the room.",es:"¡Ya puedes comprar muebles! Toca un + en la sala.",cs:"Teď můžeš kupovat nábytek! Klepni na + v pokoji."}),A.CRIT[2],3600)}
  else{c.coins+=3;save();render();A.toast(`${mis?"Hotovo":"Bez chyby!"} +3 🪙`)}}});
 $("#hinfo").innerHTML=q.living?`<div class="ccard"><div><b>${bi({en:"Furniture",es:"Muebles",cs:"Nábytek"})}</b><span>Klepni na zelené + v pokoji. Koupíš to v obchodě, celý nákup proběhne ${Lg==="es"?"španělsky":"anglicky"}.</span>
   <div class="pre">${Object.values(FURN).map(f=>`<button class="pchip fbtn" ${own[f.id]?"disabled":`data-act="fbuy-${f.id}"`}><b>${esc(f[Lg][0])}</b><i>${own[f.id]?"✓":f.price+" 🪙"}</i></button>`).join("")}</div></div></div>`
  :`<div class="ccard main"><div><b>${bi({en:"Look at the labels. Then hide them and put them back.",es:"Mira las etiquetas. Luego escóndelas y ponlas en su sitio.",cs:"Prohlédni si štítky. Pak je schovej a vrať je na místo."})}</b><span>Klepnutím na štítek uslyšíš výslovnost. Odměna: 20 🪙 a možnost kupovat nábytek.</span></div></div>`;
}

// ── postava ──
const BODY_T=[T3("hair","vlasy","hair","el pelo",50,20,-35,14),T3("eye","oko","eye","el ojo",42,44,-35,46),T3("hand","ruka","hand","la mano",20,92,-35,92),
 T3("head","hlava","head","la cabeza",71,34,135,16),T3("mouth","pusa","mouth","la boca",54,54,135,54),T3("leg","noha","leg","la pierna",57,118,135,112)];
const HAIRC=[["#6b4226","brown","castaño","hnědé"],["#2a1d14","black","negro","černé"],["#e8c26a","blonde","rubio","blond"],["#c0522b","red","pelirrojo","zrzavé"]];
const SHIRTC=[["#4a7bd6","blue","azul","modré"],["#e0614f","red","rojo","červené"],["#3fae5a","green","verde","zelené"],["#f2c230","yellow","amarillo","žluté"],["#e86f9a","pink","rosa","růžové"]];
function renderMe(){
 const c=C(),q=c.quiz||(c.quiz={}),p=P(),Lg=L(),i=Lg==="es"?2:1,lk=p.look||{};
 body().innerHTML=`<div class="lhead"><button class="btn ghost sm" data-go="tomap">← ${ui("map")}</button><div><span class="kap">${esc(p.name||"")}</span><b>${bi({en:"My body",es:"Mi cuerpo",cs:"Moje tělo"})}</b></div></div><div id="game"></div><div class="cards" id="minfo"></div>`;
 labelGame($("#game"),{vb:[-75,0,250,145],targets:withLabel(BODY_T),svg:()=>AV(p.g||"m"),onDone:mis=>{
  if(!q.body){q.body=true;c.coins+=20;save();render();party(bi({en:"MY BODY",es:"MI CUERPO",cs:"MOJE TĚLO"}),"+20 🪙",bi({en:"Now you can change your look!",es:"¡Ya puedes cambiar tu aspecto!",cs:"Teď si můžeš změnit vzhled!"}),`<svg viewBox="0 0 100 140" style="width:100%;height:100%">${AV(p.g||"m")}</svg>`,3200)}
  else{c.coins+=3;save();render();A.toast("+3 🪙")}}});
 $("#minfo").innerHTML=q.body?`<div class="ccard"><div><b>${ui("hair")}</b><div class="swatches">${HAIRC.map(h=>`<button class="sw2${(lk.hair||"#6b4226")===h[0]?" on":""}" data-act="look-hair-${h[0]}"><i style="background:${h[0]}"></i>${esc(h[i])}<small>${h[3]}</small></button>`).join("")}</div>
   <b style="margin-top:10px">${ui("shirt")}</b><div class="swatches">${SHIRTC.map(h=>`<button class="sw2${(lk.shirt||(p.g==="f"?"#e86f9a":"#4a7bd6"))===h[0]?" on":""}" data-act="look-shirt-${h[0]}"><i style="background:${h[0]}"></i>${esc(h[i])}<small>${h[3]}</small></button>`).join("")}</div>
   <span class="small" style="margin-top:8px">Oblečení (clothes) přijde v dalším levelu.</span></div></div>`
  :`<div class="ccard main"><div><b>${bi({en:"Learn your body. Then hide the labels and put them back.",es:"Aprende tu cuerpo. Luego esconde las etiquetas y ponlas en su sitio.",cs:"Nauč se části těla. Pak štítky schovej a vrať na místo."})}</b><span>Odměna: 20 🪙 a možnost měnit vlasy a tričko.</span></div></div>`;
}

// ── mazlíček ──
const PET_T={dog:[T3("head","hlava","head","la cabeza",24,24,-32,6),T3("eye","oko","eye","el ojo",21,36,-32,32),T3("nose","nos","nose","la nariz",26,45,-32,58),
  T3("ear","ucho","ear","la oreja",41,42,122,10),T3("tail","ocas","tail","la cola",74,32,122,36),T3("paw","tlapka","paw","la pata",58,75,122,66)],
 cat:[T3("head","hlava","head","la cabeza",28,24,-32,6),T3("eye","oko","eye","el ojo",21,33,-32,32),T3("nose","nos","nose","la nariz",28,42,-32,58),
  T3("ear","ucho","ear","la oreja",41,13,122,10),T3("tail","ocas","tail","la cola",77,46,122,36),T3("paw","tlapka","paw","la pata",56,75,122,66)]};
function petItem(id){const k=C().pet&&C().pet.kind;
 if(id==="collar")return{id,price:40,cs:"obojek",cs4:"obojek",en:["collar"],es:["collar"],esA:"un",esD:"el"};
 return k==="cat"?{id,price:120,cs:"pelíšek",cs4:"pelíšek",en:["cat bed","pet bed","bed"],es:["cama para gatos","cama"],esA:"una",esD:"la"}:{id,price:120,cs:"psí bouda",cs4:"psí boudu",en:["dog house","kennel","doghouse"],es:["caseta","caseta para perros"],esA:"una",esD:"la"};}
function renderPetV(){
 const c=C(),q=c.quiz||(c.quiz={}),own=c.own||(c.own={}),p=c.pet,Lg=L();if(!p){view="map";return render()}
 body().innerHTML=`<div class="lhead"><button class="btn ghost sm" data-go="tomap">← ${ui("map")}</button><div><span class="kap">${ui("pet")}</span><b>${esc(p.name)}</b></div>${c.lv>5?`<button class="btn sm" data-act="feed">🍽️ ${ui("food")}</button>`:""}</div><div id="game"></div><div class="cards" id="pinfo"></div>`;
 labelGame($("#game"),{vb:[-60,-5,210,90],targets:withLabel(PET_T[p.kind]),svg:()=>PETSVG(p.kind,own.collar),onDone:()=>{
  if(!q.pet){q.pet=true;c.coins+=20;save();render();party(bi({en:"GOOD JOB",es:"¡MUY BIEN!",cs:"VÝBORNĚ"}),"+20 🪙",bi({en:`Now you can buy things for ${p.name}!`,es:`¡Ya puedes comprar cosas para ${p.name}!`,cs:`Teď můžeš kupovat věci pro ${p.name}!`}),`<svg viewBox="0 0 90 84" style="width:100%;height:100%">${PETSVG(p.kind,own.collar)}</svg>`,3200)}
  else{c.coins+=3;save();render();A.toast("+3 🪙")}}});
 const items=["collar","home"].map(petItem);
 $("#pinfo").innerHTML=q.pet?`<div class="ccard"><div><b>${bi({en:`Things for ${p.name}`,es:`Cosas para ${p.name}`,cs:`Věci pro ${p.name}`})}</b><span>Koupíš je v obchodě, celý nákup proběhne ${Lg==="es"?"španělsky":"anglicky"}.</span>
   <div class="pre">${items.map(f=>`<button class="pchip fbtn" ${own[f.id]?"disabled":`data-act="pbuy-${f.id}"`}><b>${esc(f[Lg][0])}</b><i>${own[f.id]?"✓":f.price+" 🪙"}</i></button>`).join("")}</div></div></div>`
  :`<div class="ccard main"><div><b>${bi({en:`Learn ${p.name}'s body. Then hide the labels and put them back.`,es:`Aprende el cuerpo de ${p.name}. Luego esconde las etiquetas.`,cs:`Nauč se části těla zvířete. Pak štítky schovej a vrať na místo.`})}</b><span>Odměna: 20 🪙 a možnost koupit obojek a ${p.kind==="cat"?"pelíšek":"boudu"}.</span></div></div>`;
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
