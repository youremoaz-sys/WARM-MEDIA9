const $=s=>document.querySelector(s),R=document.documentElement;
const T={ar:{login:"دخول لوحة الإدارة",first:"أنشئ كلمة مرور للوحة الإدارة (٤ أحرف على الأقل).",enter:"دخول",short:"كلمة المرور قصيرة",bad:"كلمة المرور غير صحيحة",art:"الأخبار",cm:"إدارة التعليقات",new:"خبر جديد",edit:"تعديل",title:"عنوان الخبر",au:"اسم الكاتب",body:"نص الخبر",img:"صورة الخبر",br:"خبر عاجل",save:"حفظ الخبر",need:"اكتب عنوان الخبر",exit:"العودة للموقع",noNews:"لا توجد أخبار منشورة بعد.",noCm:"لا توجد تعليقات بعد.",del:"حذف",pin:"مميز",saved:"تم الحفظ",out:"خروج",nA:"الأخبار",nB:"العاجل",nC:"التعليقات",sure:"متأكد من الحذف؟",cats:["عالمي","محلي","تقنية","اقتصاد","رياضة","تحليلات"],panel:"لوحة الإدارة"},
en:{login:"Admin sign in",first:"Create an admin passcode (4+ characters).",enter:"Sign in",short:"Passcode too short",bad:"Wrong passcode",art:"Articles",cm:"Comments",new:"New article",edit:"Edit",title:"Headline",au:"Author name",body:"Article text",img:"Cover image",br:"Breaking news",save:"Save article",need:"Enter a headline",exit:"Back to site",noNews:"No articles published yet.",noCm:"No comments yet.",del:"Delete",pin:"Featured",saved:"Saved",out:"Sign out",nA:"Articles",nB:"Breaking",nC:"Comments",sure:"Delete this item?",cats:["World","Local","Tech","Economy","Sports","Analysis"],panel:"Admin panel"}};
/* same storage keys as the public site (wm = settings, wma = articles, wmc = comments, wmk = passcode hash) */
let st={lang:"ar",theme:"red",p:"#ff2a2a",s:"#7a0b12"};
try{Object.assign(st,JSON.parse(localStorage.getItem("wm")||"{}"))}catch(e){}
let A=[],C=[];
const load=()=>{try{A=JSON.parse(localStorage.getItem("wma")||"[]")}catch(e){A=[]}try{C=JSON.parse(localStorage.getItem("wmc")||"[]")}catch(e){C=[]}};
const saveA=()=>{try{localStorage.setItem("wma",JSON.stringify(A))}catch(e){toast("Storage full")}};
const saveC=()=>{try{localStorage.setItem("wmc",JSON.stringify(C))}catch(e){}};
const saveSt=()=>{try{localStorage.setItem("wm",JSON.stringify(st))}catch(e){}};
const L=()=>T[st.lang];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");setTimeout(()=>t.classList.remove("on"),1400)};
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)).join(",");
const hues={red:"#2a0508",gold:"#241a05",blue:"#05142a",purple:"#16052a",light:"#ece3e4"};
function paint(){R.style.setProperty("--p",st.p);R.style.setProperty("--s",st.s);R.style.setProperty("--glow","rgba("+hex2rgb(st.p)+",.45)");R.style.setProperty("--bg2",hues[st.theme]||hues.red);R.dataset.theme=st.theme==="light"?"light":"dark";R.lang=st.lang;R.dir=st.lang==="ar"?"rtl":"ltr"}
const hash=async s=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,"0")).join("");
let unl=false,tab=0,eid=0,imgD="";
try{unl=sessionStorage.getItem("wms")==="1"}catch(e){}
const logo='<a class="logo" href="index.html"><span class="w">W</span><span class="nm">ARM<small>MEDIA</small></span></a>';
function render(){
 load();paint();const l=L(),el=$("#ad");let pk="";try{pk=localStorage.getItem("wmk")||""}catch(e){}
 if(!unl){el.innerHTML=`<div class="gate">${logo}<h2 style="margin:6px 0 0">${l.login}</h2>${pk?"":`<p style="margin:0;color:var(--mut)">${l.first}</p>`}<input id="pw" type="password" autocomplete="off"><button class="btn" id="pgo">${l.enter}</button><a href="index.html" style="color:var(--p);font-size:.9rem">${l.exit}</a></div>`;
  const go=async()=>{const v=$("#pw").value;if(v.length<4)return toast(l.short);const h=await hash(v);if(pk&&h!==pk)return toast(l.bad);if(!pk){try{localStorage.setItem("wmk",h)}catch(e){}}unl=true;try{sessionStorage.setItem("wms","1")}catch(e){}render()};
  $("#pgo").onclick=go;$("#pw").onkeydown=e=>{if(e.key==="Enter")go()};return}
 const f=eid?(A.find(x=>x.id===eid)||{}):{};
 const head=`<div class="top">${logo}<div class="acts"><button class="ib" id="lg">${st.lang==="ar"?"EN":"ع"}</button><a class="btn ghost" href="index.html">${l.exit}</a><button class="btn" id="lo">${l.out}</button></div></div>
 <div class="stats"><div class="stat"><b>${A.length}</b><span>${l.nA}</span></div><div class="stat"><b>${A.filter(a=>a.br).length}</b><span>${l.nB}</span></div><div class="stat"><b>${C.length}</b><span>${l.nC}</span></div></div>
 <div class="tabs"><button data-tab="0" class="${tab?"":"on"}">${l.art}</button><button data-tab="1" class="${tab?"on":""}">${l.cm}</button></div>`;
 let body;
 if(!tab)body=`<div class="fm"><input id="at" placeholder="${l.title}" value="${esc(f.title||"")}"><select id="ac">${l.cats.map((c,i)=>`<option value="${i}" ${f.cat===i?"selected":""}>${c}</option>`).join("")}</select><input id="aa" placeholder="${l.au}" value="${esc(f.au||"")}"><textarea id="abd" rows="7" placeholder="${l.body}">${esc(f.body||"")}</textarea><label>${l.img}<input id="af" type="file" accept="image/*"></label><div id="ap" class="rimg" style="${f.img?`background:url(${f.img}) center/cover`:"display:none"}"></div><label><input id="ab" type="checkbox" ${f.br?"checked":""}> ${l.br}</label><div class="acts"><button class="btn" id="asv">${l.save}</button>${eid?`<button class="btn ghost" data-new="1">${l.new}</button>`:""}</div></div>`+([...A].sort((x,y)=>y.ts-x.ts).map(a=>`<div class="li"><span>${esc(a.title)}</span><span><button data-ed="${a.id}">${l.edit}</button><button data-dl="${a.id}">${l.del}</button></span></div>`).join("")||`<p class="empty">${l.noNews}</p>`);
 else body=[...C].sort((x,y)=>y.ts-x.ts).map(c=>`<div class="li"><span><b>${esc(c.u)}</b>: ${esc(c.t)}</span><span><button data-pn="${c.id}">${c.pin?"★":"☆"} ${l.pin}</button><button data-cd="${c.id}">${l.del}</button></span></div>`).join("")||`<p class="empty">${l.noCm}</p>`;
 el.innerHTML=head+body}
$("#ad").onclick=e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset,l=L();
 if(b.id==="lg"){st.lang=st.lang==="ar"?"en":"ar";saveSt();render()}
 else if(b.id==="lo"){unl=false;try{sessionStorage.removeItem("wms")}catch(e){}render()}
 else if(d.tab!==undefined){tab=+d.tab;eid=0;imgD="";render()}
 else if(d.ed){eid=+d.ed;imgD="";render();scrollTo(0,0)}
 else if(d.new){eid=0;imgD="";render()}
 else if(d.dl){if(!confirm(l.sure))return;A=A.filter(x=>x.id!==+d.dl);saveA();render()}
 else if(d.pn){const c=C.find(x=>x.id===+d.pn);c.pin=c.pin?0:1;saveC();render()}
 else if(d.cd){if(!confirm(l.sure))return;C=C.filter(x=>x.id!==+d.cd&&x.par!==+d.cd);saveC();render()}
 else if(b.id==="asv"){const t=$("#at").value.trim();if(!t)return toast(l.need);const f=eid?(A.find(x=>x.id===eid)||{}):{},o={title:t,cat:+$("#ac").value,au:$("#aa").value.trim(),br:$("#ab").checked,body:$("#abd").value,img:imgD||f.img||""};if(eid&&f.id)Object.assign(f,o);else A.push({id:Date.now(),ts:Date.now(),...o});eid=0;imgD="";saveA();render();toast(l.saved)}};
$("#ad").onchange=e=>{if(e.target.id!=="af")return;const fl=e.target.files[0];if(!fl)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/im.width),c=document.createElement("canvas");c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);imgD=c.toDataURL("image/jpeg",.72);const p=$("#ap");p.style.display="block";p.style.background=`url(${imgD}) center/cover`};im.src=r.result};r.readAsDataURL(fl)};
render();
