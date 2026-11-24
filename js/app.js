const $=s=>document.querySelector(s),R=document.documentElement;
const T={ar:{brk:"عاجل",h1:"العالم كما يحدث، في مكان واحد",sub:"آخر الأخبار والتحليلات من WARM MEDIA.",cta:"أحدث الأخبار",latest:"أحدث الأخبار",world:"الأخبار العالمية",cm:"التعليقات",send:"نشر",ph:"اكتب تعليقك…",ft:"© 2026 WARM MEDIA. جميع الحقوق محفوظة.",set:"الإعدادات",c1:"اللون الأساسي",c2:"اللون الثانوي",d3:"الكرة الأرضية ثلاثية الأبعاد",fx:"المؤثرات البصرية",reset:"إعادة الضبط",read:"اقرأ الخبر",reply:"رد",del:"حذف",like:"إعجاب",pin:"مميز",now:"الآن",views:"مشاهدة",nav:["الرئيسية","عاجل","عالمي","محلي","تقنية","اقتصاد","رياضة","تحليلات"],
th:{red:"أسود وأحمر",gold:"أسود وذهبي",blue:"أسود وأزرق",purple:"بنفسجي داكن",light:"الوضع الفاتح"},saved:"تم الحفظ",
a_login:"دخول لوحة الإدارة",a_first:"أنشئ كلمة مرور للوحة الإدارة (٤ أحرف على الأقل).",a_enter:"دخول",a_short:"كلمة المرور قصيرة",a_bad:"كلمة المرور غير صحيحة",a_art:"الأخبار",a_cm:"إدارة التعليقات",a_new:"خبر جديد",a_edit:"تعديل",a_title:"عنوان الخبر",a_au:"اسم الكاتب",a_body:"نص الخبر",a_img:"صورة الخبر",a_br:"خبر عاجل",a_save:"حفظ الخبر",a_need:"اكتب عنوان الخبر",exit:"العودة للموقع",noNews:"لا توجد أخبار منشورة بعد.",noCm:"لا توجد تعليقات بعد.",cats:["عالمي","محلي","تقنية","اقتصاد","رياضة","تحليلات"]},
en:{brk:"BREAKING",h1:"The world as it happens, in one place",sub:"The latest news and analysis from WARM MEDIA.",cta:"Latest news",latest:"Latest news",world:"World news",cm:"Comments",send:"Post",ph:"Write your comment…",ft:"© 2026 WARM MEDIA. All rights reserved.",set:"Settings",c1:"Primary color",c2:"Secondary color",d3:"3D globe",fx:"Visual effects",reset:"Reset",read:"Read story",reply:"Reply",del:"Delete",like:"Like",pin:"Featured",now:"Just now",views:"views",nav:["Home","Breaking","World","Local","Tech","Economy","Sports","Analysis"],
th:{red:"Black & Red",gold:"Black & Gold",blue:"Black & Blue",purple:"Dark Purple",light:"Light Mode"},saved:"Saved",
a_login:"Admin sign in",a_first:"Create an admin passcode (4+ characters).",a_enter:"Sign in",a_short:"Passcode too short",a_bad:"Wrong passcode",a_art:"Articles",a_cm:"Comments",a_new:"New article",a_edit:"Edit",a_title:"Headline",a_au:"Author name",a_body:"Article text",a_img:"Cover image",a_br:"Breaking news",a_save:"Save article",a_need:"Enter a headline",exit:"Back to site",noNews:"No articles published yet.",noCm:"No comments yet.",cats:["World","Local","Tech","Economy","Sports","Analysis"]}};
const TH={red:["#ff2a2a","#7a0b12"],gold:["#f5b82e","#6b4a05"],blue:["#2a8bff","#0b2f6e"],purple:["#a24bff","#3b0b7a"],light:["#e0182d","#7a0b12"]};
const hues={red:"#2a0508",gold:"#241a05",blue:"#05142a",purple:"#16052a",light:"#ece3e4"};
let st={lang:"ar",theme:"red",p:TH.red[0],s:TH.red[1],d3:true,fx:true};
try{Object.assign(st,JSON.parse(localStorage.getItem("wm")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("wm",JSON.stringify(st))}catch(e){}};
const L=()=>T[st.lang];
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)).join(",");
function paint(){
 R.style.setProperty("--p",st.p);R.style.setProperty("--s",st.s);R.style.setProperty("--glow","rgba("+hex2rgb(st.p)+",.45)");
 R.style.setProperty("--bg2",hues[st.theme]||hues.red);
 R.dataset.theme=st.theme==="light"?"light":"dark";
 $("#p1").value=st.p;$("#p2").value=st.s;$("#t3").checked=st.d3;$("#tf").checked=st.fx;
 R.style.setProperty("--fx",st.fx?1:0);
 $("#globe").style.display=st.d3?"block":"none";
}
function text(){
 const l=L();R.lang=st.lang;R.dir=st.lang==="ar"?"rtl":"ltr";$("#lang").textContent=st.lang==="ar"?"EN":"ع";
 document.querySelectorAll("[data-t]").forEach(e=>e.textContent=l[e.dataset.t]);
 document.querySelectorAll("[data-ph]").forEach(e=>e.placeholder=l[e.dataset.ph]);
 const ids=["top","latest","world","latest","latest","latest","latest","comments"];
 $("#nav").innerHTML=l.nav.map((n,i)=>`<a href="#${ids[i]}">${n}</a>`).join("");
 const ic=p=>`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
 $("#bnav").innerHTML=`<i class="pill"></i><a href="#top" aria-label="${l.nav[0]}">${ic('<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>')}</a><a href="#latest" aria-label="${l.latest}">${ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/>')}</a><a href="#world" aria-label="${l.world}">${ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>')}</a><a href="#comments" aria-label="${l.cm}">${ic('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>')}</a><button id="bset" aria-label="${l.set}">${ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>')}</button>`;
 $("#bset").onclick=()=>{$("#panel").classList.add("open");mv(4)};
 spy();
 $("#ths").innerHTML=Object.keys(TH).map(k=>`<button data-k="${k}" class="${k===st.theme?"on":""}">${l.th[k]}</button>`).join("");
 const card=a=>`<article class="card" data-id="${a.id}"><div class="img" style="${a.img?`background:url(${a.img}) center/cover`:"background:linear-gradient(135deg,var(--s),#0a0a0e 75%)"}">${a.br?`<span class="tag-b">${l.brk}</span>`:""}</div><div class="bd"><span class="cat">${l.cats[a.cat]}</span><h3>${esc(a.title)}</h3><div class="meta">${a.au?`<span>${esc(a.au)}</span>`:""}<span>${new Date(a.ts).toLocaleDateString(st.lang==="ar"?"ar":"en",{dateStyle:"medium"})}</span></div><span class="more">${l.read}</span></div></article>`;
 const S=[...A].sort((x,y)=>y.ts-x.ts),Wd=S.filter(a=>a.cat===0),B=S.filter(a=>a.br);
 $("#g1").innerHTML=S.map(card).join("")||`<p class="empty">${l.noNews}</p>`;
 $("#g2").innerHTML=Wd.map(card).join("");$("#world").hidden=!Wd.length;
 $("#ticker").hidden=!B.length;$("#tk").textContent=B.map(a=>a.title).join("   •   ");
 tilt();renderC();
}
function tilt(){document.querySelectorAll(".card").forEach(c=>{
 c.onpointermove=e=>{if(!st.fx||e.pointerType==="touch")return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`rotateY(${x*10}deg) rotateX(${-y*10}deg) translateZ(8px)`};
 c.onpointerleave=()=>c.style.transform=""})}
/* comments (persisted locally in this prototype) */
let C=[];try{C=JSON.parse(localStorage.getItem("wmc")||"null")||[]}catch(e){}

const saveC=()=>{try{localStorage.setItem("wmc",JSON.stringify(C))}catch(e){}};
function renderC(){
 const l=L(),f=ts=>new Date(ts).toLocaleString(st.lang==="ar"?"ar":"en",{dateStyle:"medium",timeStyle:"short"});
 const one=c=>`<div class="cm ${c.pin?"pin":""} ${c.par?"rep":""}"><div class="av">${c.u[0].toUpperCase()}</div><div class="b"><div class="h"><b>${c.u}</b> ${c.pin?"★ "+l.pin:""}${Date.now()-c.ts<6e4?`<span class="new">NEW</span>`:""}<br>${f(c.ts)}</div><div>${c.t.replace(/</g,"&lt;")}</div><div class="act"><button data-a="like" data-i="${c.id}">♥ ${c.lk}</button>${c.par?"":`<button data-a="rep" data-i="${c.id}">${l.reply}</button>`}${c.me?`<button data-a="del" data-i="${c.id}">${l.del}</button>`:""}</div></div></div>`;
 const top=C.filter(c=>!c.par).sort((a,b)=>b.pin-a.pin||b.ts-a.ts);
 $("#cl").innerHTML=top.map(c=>one(c)+C.filter(r=>r.par===c.id).sort((a,b)=>a.ts-b.ts).map(one).join("")).join("")||`<p class="empty">${l.noCm}</p>`;
}
let replyTo=0;
$("#cs").onclick=()=>{const v=$("#ci").value.trim();if(!v)return;C.push({id:Date.now(),u:st.lang==="ar"?"زائر":"Guest",t:v,ts:Date.now(),lk:0,pin:0,par:replyTo,me:1});replyTo=0;$("#ci").value="";saveC();renderC()};
$("#ci").onkeydown=e=>{if(e.key==="Enter")$("#cs").click()};
$("#cl").onclick=e=>{const b=e.target.closest("button");if(!b)return;const id=+b.dataset.i,c=C.find(x=>x.id===id);
 if(b.dataset.a==="like"){c.lk++}else if(b.dataset.a==="del"){C=C.filter(x=>x.id!==id&&x.par!==id)}else{replyTo=id;$("#ci").focus();return}
 saveC();renderC()};
/* settings */
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");setTimeout(()=>t.classList.remove("on"),1400)};
$("#gear").onclick=()=>$("#panel").classList.add("open");$("#x").onclick=()=>$("#panel").classList.remove("open");
$("#lang").onclick=()=>{st.lang=st.lang==="ar"?"en":"ar";save();text()};
$("#ths").onclick=e=>{const k=e.target.dataset.k;if(!k)return;st.theme=k;st.p=TH[k][0];st.s=TH[k][1];save();paint();text();buildMap()};
$("#p1").oninput=e=>{st.p=e.target.value;save();paint()};$("#p2").oninput=e=>{st.s=e.target.value;save();paint()};
$("#t3").onchange=e=>{st.d3=e.target.checked;save();paint()};$("#tf").onchange=e=>{st.fx=e.target.checked;save();paint()};
$("#rs").onclick=()=>{st={lang:st.lang,theme:"red",p:TH.red[0],s:TH.red[1],d3:true,fx:true};save();paint();text();toast(L().saved)};
/* globe: orthographic projection, graticule + news hubs + moving arcs */
const cv=$("#globe"),g=cv.getContext("2d");let W,H,rot=0;
const hubs=[[40.7,-74],[51.5,-.1],[25.2,55.3],[35.7,139.7],[-33.9,151.2],[30,31.2],[-23.5,-46.6],[28.6,77.2],[55.7,37.6],[1.35,103.8]];
const arcs=[[0,1],[1,2],[2,3],[3,4],[5,1],[0,6],[7,9],[8,1]];
function rs(){const d=Math.min(devicePixelRatio||1,innerWidth<700?1.5:2);W=cv.width=innerWidth*d;H=cv.height=innerHeight*d}
addEventListener("resize",rs);rs();
function pr(lat,lon,r,cx,cy){const la=lat*Math.PI/180,lo=lon*Math.PI/180+rot,x=Math.cos(la)*Math.sin(lo),y=Math.sin(la),z=Math.cos(la)*Math.cos(lo);return{x:cx+x*r,y:cy-y*r,z}}
function draw(){
 if(st.d3){const r=Math.min(W,H)*(W<H?.46:.42),cx=W*(W<H?.5:(R.dir==="rtl"?.3:.7)),cy=H*(W<H?.3:.45),col=getComputedStyle(R).getPropertyValue("--p").trim()||"#ff2a2a";
 g.clearRect(0,0,W,H);
 const gr=g.createRadialGradient(cx,cy,r*.2,cx,cy,r*1.15);gr.addColorStop(0,"rgba(0,0,0,0)");gr.addColorStop(.85,"rgba(0,0,0,0)");gr.addColorStop(1,col+"55");g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r*1.15,0,7);g.fill();
 g.strokeStyle=col+"40";g.lineWidth=1;g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();
 g.strokeStyle=col+"33";
 for(let la=-60;la<=60;la+=30){g.beginPath();let f=1;for(let lo=-180;lo<=180;lo+=6){const p=pr(la,lo,r,cx,cy);if(p.z<0){f=1;continue}f?g.moveTo(p.x,p.y):g.lineTo(p.x,p.y);f=0}g.stroke()}
 for(let lo=-180;lo<180;lo+=30){g.beginPath();let f=1;for(let la=-90;la<=90;la+=6){const p=pr(la,lo,r,cx,cy);if(p.z<0){f=1;continue}f?g.moveTo(p.x,p.y):g.lineTo(p.x,p.y);f=0}g.stroke()}
 if(st.fx){const t=Date.now()/1500;arcs.forEach(([a,b],i)=>{const A=hubs[a],B=hubs[b];g.strokeStyle=col+"aa";g.beginPath();let f=1,k=(t+i*.3)%1;for(let u=0;u<=1;u+=.04){if(u>k||u<k-.35)continue;const la=A[0]+(B[0]-A[0])*u,lo=A[1]+(B[1]-A[1])*u,p=pr(la,lo,r*(1+.12*Math.sin(Math.PI*u)),cx,cy);if(p.z<0){f=1;continue}f?g.moveTo(p.x,p.y):g.lineTo(p.x,p.y);f=0}g.stroke()})}
 hubs.forEach((h,i)=>{const p=pr(h[0],h[1],r,cx,cy);if(p.z<0)return;const s=3+(st.fx?Math.sin(Date.now()/400+i)*1.2:0);g.fillStyle=col;g.shadowColor=col;g.shadowBlur=14;g.beginPath();g.arc(p.x,p.y,s*devicePixelRatio/1.3,0,7);g.fill();g.shadowBlur=0});
 rot+=.0025}
 requestAnimationFrame(draw)}
let A=[];try{A=JSON.parse(localStorage.getItem("wma")||"[]")}catch(e){}
const saveA=()=>{try{localStorage.setItem("wma",JSON.stringify(A))}catch(e){toast("Storage full")}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function mv(i){const b=$("#bnav"),it=[...b.querySelectorAll("a,button")],t=it[i],p=b.querySelector(".pill");if(!t||!p||!t.offsetWidth)return;it.forEach(x=>x.classList.toggle("on",x===t));p.style.width=t.offsetWidth+"px";p.style.transform=`translateX(${t.offsetLeft}px)`}
function spy(){if($("#panel").classList.contains("open"))return;let k=0;["top","latest","world","comments"].forEach((id,i)=>{const e=document.getElementById(id);if(e&&!e.hidden&&e.getBoundingClientRect().top<innerHeight*.45)k=i});mv(k)}
addEventListener("scroll",spy,{passive:true});addEventListener("resize",spy);$("#x").addEventListener("click",spy);
/* reader */
document.addEventListener("click",e=>{const c=e.target.closest(".card[data-id]");if(!c)return;const a=A.find(x=>x.id===+c.dataset.id),l=L();if(!a)return;$("#reader").innerHTML=`<div class="rd"><button class="ib" id="rx" style="position:absolute;top:12px;inset-inline-end:12px;z-index:2">✕</button>${a.img?`<div class="rimg" style="background:url(${a.img}) center/cover"></div>`:""}<div class="rt"><span class="cat">${l.cats[a.cat]}</span>${a.br?` <span class="tag-b">${l.brk}</span>`:""}<div class="rh">${esc(a.title)}</div><div class="meta">${esc(a.au||"")} ${new Date(a.ts).toLocaleString(st.lang==="ar"?"ar":"en",{dateStyle:"medium",timeStyle:"short"})}</div><div class="rb">${esc(a.body||"")}</div></div></div>`;$("#reader").hidden=false});
$("#reader").onclick=e=>{if(e.target.id==="reader"||e.target.closest("#rx"))$("#reader").hidden=true};
addEventListener("keydown",e=>{if(e.key==="Escape")$("#reader").hidden=true});
/* admin lives in admin.html */
if(location.hash==="#admin")location.replace("admin.html");

/* dotted world map for the glass bar */
const LAND=[
[[-168,66],[-162,70],[-140,70],[-125,70],[-95,72],[-82,68],[-65,62],[-56,52],[-66,45],[-70,42],[-76,35],[-81,31],[-80,25],[-83,29],[-90,29],[-97,26],[-98,19],[-92,18],[-87,21],[-83,10],[-79,8],[-86,12],[-92,15],[-105,20],[-110,24],[-115,30],[-110,23],[-118,34],[-124,40],[-124,48],[-135,58],[-150,60],[-165,60]],
[[-55,60],[-45,60],[-20,70],[-20,82],[-60,82],[-70,76]],
[[-80,10],[-72,12],[-62,10],[-50,0],[-35,-6],[-40,-22],[-48,-28],[-58,-38],[-65,-42],[-68,-52],[-72,-52],[-75,-45],[-72,-30],[-70,-18],[-76,-14],[-81,-5]],
[[-10,36],[-9,43],[-2,44],[-4,48],[2,51],[8,54],[10,57],[5,60],[12,66],[20,70],[30,70],[40,66],[30,60],[28,55],[38,50],[40,45],[28,41],[24,38],[16,40],[12,44],[8,44],[3,43],[-6,36]],
[[-17,21],[-10,30],[-6,36],[10,37],[20,32],[32,31],[35,28],[43,12],[51,12],[40,-3],[40,-15],[35,-25],[27,-34],[18,-34],[12,-18],[9,-1],[9,4],[-8,4],[-17,14]],
[[28,41],[36,37],[43,37],[48,30],[57,25],[67,25],[72,20],[77,8],[80,14],[88,22],[92,22],[98,16],[100,2],[105,10],[110,20],[122,30],[122,40],[130,42],[140,46],[142,52],[155,52],[160,60],[180,66],[170,70],[140,72],[110,77],[80,73],[60,70],[40,66],[40,45]],
[[35,30],[43,30],[48,30],[56,24],[59,22],[52,16],[43,12],[35,28]],
[[130,31],[135,34],[141,36],[142,42],[145,44],[141,45],[139,38],[132,34]],
[[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[131,-31],[115,-34]],
[[95,5],[106,-6],[104,-6],[95,2]],[[109,2],[117,7],[119,0],[116,-4],[110,-3]],[[106,-6],[114,-8],[114,-7],[106,-5]],
[[-5,50],[1,51],[-2,58],[-6,57]],[[44,-25],[50,-15],[49,-12],[44,-17]],[[167,-46],[174,-41],[178,-38],[172,-35],[168,-44]]
];
const inPoly=(x,y,p)=>{let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
function buildMap(){
 const BH=58,LAT0=72,LAT1=-48,k=4,h=BH*k,w=Math.round(h*360/(LAT0-LAT1)),c=document.createElement("canvas");c.width=w;c.height=h;
 const x=c.getContext("2d"),step=12;x.fillStyle=st.theme==="light"?"#3a1218":"#ffffff";
 for(let py=step/2;py<h;py+=step){const lat=LAT0-py/h*(LAT0-LAT1);
  for(let px=step/2;px<w;px+=step){const lon=px/w*360-180;
   if(LAND.some(p=>inPoly(lon,lat,p))){x.globalAlpha=.9;x.beginPath();x.arc(px,py,2.6,0,7);x.fill()}}}
 R.style.setProperty("--map",`url(${c.toDataURL("image/png")})`);R.style.setProperty("--mapw",(BH*w/h)+"px")}
paint();text();buildMap();draw();
addEventListener("load",()=>setTimeout(()=>$("#loader").classList.add("off"),1200));
setTimeout(()=>$("#loader").classList.add("off"),2500);
