// Coach, story, journey map, tour and little animations.
const CH={1:"Day One",2:"Finding Things",3:"Making Changes",4:"Locked Doors",5:"Launch Day"};
const KAI={
messenger:"Welcome to Pixel Press, rookie! Our homepage needs blog post #1. In API-land you ask with a GET. Point the URL at the post, hit Send, and read what comes back.",
user:"A reader commented as user 2 and marketing wants to say thanks. Same trick, different shelf: look up user #2 and find their name.",
filter:"Our editor only wants Author 3's posts. Don't haul all 100 and sort by hand. Ask the server to filter with a query parameter.",
pages:"The Pokedex page would choke on every Pokemon at once. APIs hand out data in pages: ask for 5, skipping the first 5.",
writer:"Time to publish! GET reads, POST creates. You'll send a JSON body describing the new post, and the server should answer 201 Created.",
patch:"Typo in a headline! Don't resend the whole post. PATCH lets you change just the title.",
gatekeeper:"Ops locked an internal door. Basic Auth means username and password, encoded and sent in the Authorization header. Credentials: ana / secret.",
apikey:"A partner API recognises us by a key in a header called X-API-Key. Ours is 12345. httpbin echoes what it received so you can verify.",
chain:"Two requests this time. Request 1 logs you in and hands you a token (a wristband). Request 2 shows that wristband to /auth/me, which only answers logged-in people. Your token is kept safe in the Token Wallet under the response.",
boss:"Final exam before launch: one request using a method, a query param, auth and a JSON body together. httpbin echoes everything back.",
d404:"Incident! The homepage is blank and a teammate's request returns 404. Reproduce it first, then hunt the typo.",
dverb:"Another incident: the Publish button runs but creates nothing. Check which verb the request uses.",
djson:"The server rejects a payload. Computers are picky, and JSON hates trailing commas.",
dbearer:"The token endpoint says nobody's home. Did the client even send its token?",
dauth:"Right credentials, still locked out. Maybe we're showing the wrong kind of ID. Read the URL for a clue.",
dform:"This legacy endpoint only understands form data, not JSON. Re-package name=Ana the way it expects."};
const AUTHN={basic:"Basic Auth",bearer:"Bearer Token",apikey:"API Key"};
const basicOK=q=>q.headers.authorization==="Basic "+btoa("ana:secret"),bearerOK=q=>/^Bearer\s+\S+/.test(q.headers.authorization||"");
const NEED={messenger:{u:"/posts/1"},user:{u:"/users/2"},filter:{p:{userId:"3"}},pages:{p:{limit:"5",offset:"5"}},
writer:{m:"POST",b:"json",bk:'"title"'},patch:{m:"PATCH",b:"json",bk:'"title"'},
gatekeeper:{a:"basic",ac:basicOK,acs:"username <code>ana</code>, password <code>secret</code>"},
apikey:{a:"apikey",ac:q=>q.headers["x-api-key"]==="12345",acs:"key <code>X-API-Key</code>, value <code>12345</code>, add to <b>Header</b>"},
boss:{m:"POST",p:{ref:"trainer"},a:"bearer",ac:bearerOK,acs:"any text as the token",b:"json",bk:'"ok"'},
d404:{u:"/posts/1"},dverb:{m:"POST"},djson:{bv:1},dbearer:{a:"bearer",ac:bearerOK,acs:"any text as the token"},
dauth:{a:"basic",ac:basicOK,acs:"username <code>ana</code>, password <code>secret</code>"},dform:{b:"form",bk:"name=Ana"}};
const wal=()=>!!(wallet.accessToken||wallet.token);
const CHAIN=[{say:"<b>Request 1, log in.</b> The form is already filled in (POST, emilys / emilyspass). Press <b>Send</b>. The reply holds an <code>accessToken</code>, and a <b>Token Wallet</b> appears under the response.",t:"#send",done:wal},
{say:"<b>Request 2 starts here.</b> Change the <b>method</b> to <b>GET</b>: you're asking a question now, not sending data.",t:"#method",done:q=>q.method==="GET"},
{say:"Change the <b>URL</b> to <code>https://dummyjson.com/auth/me</code>. This endpoint answers 'who am I?', but only for logged-in users.",t:"#url",done:q=>q.url.includes("/auth/me")},
{say:"Open <b>Authorization</b>, choose <b>Bearer Token</b>, and type <code>{{accessToken}}</code> in the token box (the app swaps in your wallet token). Or just click <b>Use as Bearer</b> in the wallet.",t:"[data-t=auth]",done:bearerOK},
{say:"Press <b>Send</b>. A <b>200</b> with your profile (name, email...) beats the level. A 401 means the token was missing or wrong.",t:"#send",done:()=>passed}];
function steps(l){if(l.id==="chain")return CHAIN;const n=NEED[l.id]||{},s=l.start,S=[],dbg=l.track==="debug";
 if(dbg)S.push({say:"Press <b>Send</b> first and read the banner. Reproduce the bug before fixing it.",t:"#send",done:()=>attempts>=1});
 if(n.m&&s.method!==n.m)S.push({say:`Change the <b>method</b> to <b>${n.m}</b>.`,t:"#method",done:q=>q.method===n.m});
 if(n.u&&!s.url.includes(n.u))S.push({say:`Fix the <b>URL</b> so it contains <code>${n.u}</code>.`,t:"#url",done:q=>q.url.includes(n.u)});
 Object.entries(n.p||{}).forEach(([k,v])=>S.push({say:`Open <b>Params</b> and add <code>${k}</code> = <code>${v}</code>.`,t:"[data-t=params]",done:q=>q.url.includes(`${k}=${v}`)}));
 if(n.a&&s.auth.type!==n.a)S.push({say:`Open <b>Authorization</b> and choose <b>${AUTHN[n.a]}</b>.`,t:"[data-t=auth]",done:()=>$("authType").value===n.a});
 if(n.ac)S.push({say:`Fill in: ${n.acs}.`,t:"#authFields",done:n.ac});
 if(n.b&&s.body.type!==n.b)S.push({say:`Open <b>Body</b> and choose <b>${n.b==="json"?"raw (JSON)":"x-www-form-urlencoded"}</b>.`,t:"[data-t=body]",done:()=>$("bodyType").value===n.b});
 if(n.bk)S.push({say:n.b==="form"?`Add the field <code>name</code> = <code>Ana</code>.`:`Type a JSON body that contains <code>${n.bk}</code>, e.g. <code>{"title":"Hi","userId":1}</code>.`,t:n.b==="form"?"#form":"#bodyText",done:q=>q.body.includes(n.bk)});
 if(n.bv)S.push({say:"Fix the <b>JSON syntax</b> in the Body tab. Look at what follows the last value.",t:"#bodyText",done:q=>{try{JSON.parse(q.body);return true}catch(e){return false}}});
 S.push({say:dbg?"Press <b>Send</b> again to test your fix.":"Press <b>Send</b>.",t:"#send",done:()=>attempts>=(dbg?2:1)});return S;}
function coach(){document.querySelectorAll(".spot").forEach(e=>e.classList.remove("spot"));if(st.mode!=="beginner")return;
 let q;try{q=build()}catch(e){return}
 const S=cur._steps||(cur._steps=steps(cur)),idx=S.findIndex(s=>!s.done(q));
 $("learn").innerHTML=`<b>Your game plan</b><ol class="plan">${S.map((s,i)=>`<li class="${idx<0||i<idx?"ok":i===idx?"now":""}">${s.say}</li>`).join("")}</ol>`;
 if(idx>=0){const el=document.querySelector(S[idx].t);el&&el.classList.add("spot");}}
function type(el,t){clearInterval(el._t);el.textContent="";let i=0;el._t=setInterval(()=>{el.textContent=t.slice(0,++i);if(i>=t.length)clearInterval(el._t);},13);}
function renderBrief(){const m=st.mode;
 $("brief").innerHTML=`<div class="chap">${cur.track==="debug"?"Incident Room":"Chapter "+cur.stars+" &middot; "+CH[cur.stars]}</div><div class="stars big">${stars(cur.stars)}</div><h2>${cur.title}</h2><p class="muted">${m==="refresher"?cur.scenario:cur.story}</p>`+(m==="beginner"?`<div class="kai"><span class="av">K</span><div class="bub" id="kai"></div></div>`:"")+`<div class="mission"><b>Mission</b> ${cur.task}</div>`;
 if(m==="beginner")type($("kai"),KAI[cur.id]||"");}
function wire(s){$("wire").className="wire "+s;}
function burst(el){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 for(let i=0;i<18;i++){const p=document.createElement("i"),a=Math.random()*6.28,d=40+Math.random()*80;p.className="conf";p.style.cssText=`left:${cx}px;top:${cy}px;--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d}px;background:hsl(${Math.random()*360},85%,62%)`;document.body.append(p);setTimeout(()=>p.remove(),900);}}
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2400);}

// journey map
function unlocked(l){if(st.mode!=="beginner")return true;const ms=LEVELS.filter(x=>x.track!=="debug");
 if(l.track==="debug")return ms.filter(x=>st.done[x.id]).length>=3;const i=ms.indexOf(l);return i<=0||!!st.done[ms[i-1].id];}
function pick(id){const l=LEVELS.find(x=>x.id===id);if(!unlocked(l)){toast(l.track==="debug"?"Beat 3 missions to unlock the Incident Room.":"Finish the previous mission to unlock this stop.");return;}startLevel(l);}
function startLevel(l){cur=l;last=null;show(true);load();if(st.mode==="beginner"&&!st.toured){st.toured=1;save();setTimeout(tour,500);}}
function openMap(){hideExtra();["intro","app","primer"].forEach(i=>$(i).classList.add("hidden"));$("map").classList.remove("hidden");drawMap();renderModes();renderStats();}
function drawMap(){const here=LEVELS.find(l=>!st.done[l.id]&&unlocked(l));
 const G=[["mission","The Pixel Press Journey","You're the new intern at Pixel Press. Kai, your mentor, briefs you at every stop. Follow the path."],["debug","The Incident Room","Things are on fire. Reproduce each bug, then fix it. Unlocks after 3 missions."]];
 $("map").innerHTML=`<div class="maphead"><span class="chip">${MODES[st.mode][0]} mode</span><h1>Choose your next stop</h1></div>`+G.map(([t,h,p])=>{const L=LEVELS.filter(l=>(l.track||"mission")===t);
  return `<div class="zone"><h2>${h}</h2><p class="muted">${st.mode==="beginner"?p:"Every stop is open in this mode."}</p><div class="path" style="height:${L.length*120+50}px"><svg></svg>${L.map((l,i)=>{const x=50+27*Math.sin(i*1.25),y=i*120+24,s=st.done[l.id]?"done":!unlocked(l)?"locked":l===here?"cur":"open";
   return `<button class="node ${s}" data-id="${l.id}" style="left:${x}%;top:${y}px">${l===here?'<em class="here">you are here</em>':""}<span class="orb">${s==="done"?"&#10003;":s==="locked"?"&#128274;":i+1}</span><b>${l.title}</b><span class="stars">${stars(l.stars)}</span></button>`;}).join("")}</div></div>`;}).join("");
 $("map").querySelectorAll(".node").forEach(b=>b.onclick=()=>pick(b.dataset.id));
 $("map").querySelectorAll(".path").forEach(p=>{const ns=[...p.querySelectorAll(".node")],W=p.clientWidth,pts=ns.map(n=>[parseFloat(n.style.left)/100*W,parseFloat(n.style.top)+32]);
  const d=a=>a.reduce((s,q,i)=>i?s+`C${a[i-1][0]},${(a[i-1][1]+q[1])/2} ${q[0]},${(a[i-1][1]+q[1])/2} ${q[0]},${q[1]}`:`M${q[0]},${q[1]}`,"");
  let k=0;while(k<ns.length&&ns[k].classList.contains("done"))k++;
  p.querySelector("svg").innerHTML=`<path class="base" d="${d(pts)}"/>`+(k>0?`<path class="prog" d="${d(pts.slice(0,Math.min(k+1,pts.length)))}"/>`:"");});}
addEventListener("resize",()=>{if(!$("map").classList.contains("hidden"))drawMap();});

// guided tour
const TOUR=[["#method","This is the <b>method</b>: what you want to do. GET reads, POST creates, DELETE removes."],["#url","The <b>URL</b> says where the request goes."],["#tabs","These tabs hold the details. <b>Params</b> filter, <b>Authorization</b> proves who you are, <b>Headers</b> are metadata, <b>Body</b> is the data you send."],["#pv","This is the real HTTP text your request becomes. Hover the colours to see what each part is."],["#send","<b>Send</b> fires it for real."],["#wire","Watch your request travel to the server and back."],["#out","The server's answer appears here, with a plain-English status banner above it."]];
let tourI=0;
function tour(){tourI=0;tourStep();}
function tourStep(){document.querySelectorAll(".spot").forEach(e=>e.classList.remove("spot"));const p=$("pop");
 while(tourI<TOUR.length){const el=document.querySelector(TOUR[tourI][0]);if(el&&el.offsetParent)break;tourI++;}
 if(tourI>=TOUR.length){p.classList.add("hidden");coach();return;}
 const el=document.querySelector(TOUR[tourI][0]);el.classList.add("spot");el.scrollIntoView&&el.scrollIntoView({block:"center",behavior:"smooth"});
 $("poptxt").innerHTML=`<span class="num">TOUR ${tourI+1} / ${TOUR.length}</span><br>`+TOUR[tourI][1];$("popnext").textContent=tourI===TOUR.length-1?"Got it":"Next";p.classList.remove("hidden");
 setTimeout(()=>{const r=el.getBoundingClientRect();p.style.top=Math.min(innerHeight-190,Math.max(70,r.bottom+12))+"px";p.style.left=Math.max(12,Math.min(innerWidth-340,r.left))+"px";},400);}
document.body.insertAdjacentHTML("beforeend",`<div id="toast" class="toast"></div><div id="pop" class="pop hidden"><p id="poptxt"></p><div class="row between"><button class="link" id="popskip">Skip tour</button><button class="btn sm" id="popnext">Next</button></div></div>`);
$("popnext").onclick=()=>{tourI++;tourStep();};$("popskip").onclick=()=>{$("pop").classList.add("hidden");coach();};
$("tomap").onclick=openMap;$("tourbtn").onclick=tour;
