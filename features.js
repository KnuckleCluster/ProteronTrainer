st.xp=st.xp||0;st.badges=st.badges||{};st.streak=st.streak||{n:0,day:""};st.nohint=st.nohint||0;
let attempts=0,hintsUsed=0,pi=0,passed=false;
const RANKS=[[0,"Rookie"],[100,"Developer"],[250,"Senior"],[450,"Architect"]],rank=()=>RANKS.filter(r=>st.xp>=r[0]).pop()[1];
const BADGES=[["first","First Blood","Complete your first mission",()=>Object.keys(st.done).length>=1],["primer","Primer Cleared","Finish the primer",()=>st.badges.primer],["nohint","Clean Run","Pass a mission with no hints",()=>st.nohint>0],["debug","Debugger","Fix 3 broken requests",()=>LEVELS.filter(l=>l.track==="debug"&&st.done[l.id]).length>=3],["auth","Key Master","Beat Basic, API key and token missions",()=>["gatekeeper","apikey","chain"].every(i=>st.done[i])],["boss","Boss Slayer","Beat Boss Rush",()=>st.done.boss],["all","Completionist","Complete everything",()=>LEVELS.every(l=>st.done[l.id])]];
function grantBadges(){const n=[];BADGES.forEach(b=>{if(!st.badges[b[0]]&&b[3]()){st.badges[b[0]]=1;n.push(b[1]);}});return n;}
function renderStats(){$("stats").innerHTML=`<span class="chip">${st.xp} XP</span><span class="chip">${rank()}</span><span class="chip">&#128293; ${st.streak.n}</span><button class="pill" id="pbtn">Profile</button>`;$("pbtn").onclick=openProfile;}
function updateStreak(){const t=new Date().toDateString();if(st.streak.day===t)return;st.streak.n=new Date(Date.now()-864e5).toDateString()===st.streak.day?st.streak.n+1:1;st.streak.day=t;}
function explainStatus(c){const s=STATUS[c];$("banner").className="banner "+(c<400?"good":"bad");
 $("banner").innerHTML=`<b>${c} ${s?s[0]:""}</b> ${s?s[1]:c<400?"Success or redirect.":c<500?"Client error: the request needs fixing.":"Server error: not your fault, retry later."}`;$("banner").classList.toggle("hidden",st.mode==="practice");}
function onResult(q,res,r){
 const msg=cur.check(q,res);attempts++;coach();explainStatus(r.status);
 $("verdict").textContent=msg?"Not yet: "+msg:"Mission complete! \u2605";$("verdict").className=msg?"bad":"good";
 if(msg){if(st.mode==="practice"&&attempts>=3)$("hint").classList.remove("hidden");if(attempts>=2&&st.mode!=="practice")$("verdict").textContent+="  (Stuck? Hints cost a little XP.)";return;}
 passed=true;coach();let gain=0,badges=[];
 if(!st.done[cur.id]){gain=Math.max(5,cur.stars*20-hintsUsed*8);st.xp+=gain;st.done[cur.id]=true;if(!hintsUsed)st.nohint++;updateStreak();badges=grantBadges();}
 save();renderNav();renderStats();showRecap(gain,badges);burst($("verdict"));
}
function showRecap(gain,badges){const L=LEARNED[cur.id]||["",""];
 $("recap").innerHTML=`<b>${gain?"+"+gain+" XP":"Replay complete"}</b>${badges.length?` &middot; New badge: ${badges.join(", ")}`:""}<p><b>You learned:</b> ${L[0]}</p><p class="muted">Real world: ${L[1]}</p><button class="btn" id="nextbtn">Next mission &rarr;</button> <button class="link" id="mapbtn">Journey map</button>`;
 $("recap").classList.remove("hidden");$("nextbtn").onclick=nextMission;$("mapbtn").onclick=openMap;}
function nextMission(){const i=LEVELS.indexOf(cur),n=LEVELS.slice(i+1).concat(LEVELS.slice(0,i)).find(l=>!st.done[l.id]&&unlocked(l));if(n){cur=n;last=null;load();}else openProfile();}
function useHint(){if(hintsUsed>=2)return;hintsUsed++;const t=[`<b>Think about it:</b> ${cur.explain}`,`<b>Hint:</b> ${cur.hint}`];
 $("hintbox").innerHTML=t.slice(0,hintsUsed).map(x=>`<div class="hint">${x}</div>`).join("");$("hint").textContent=hintsUsed>=2?"No more hints":`Another hint (${hintsUsed}/2 used)`;}
function afterLoad(){attempts=0;hintsUsed=0;passed=false;wallet={};renderWallet();$("recap").classList.add("hidden");$("banner").classList.add("hidden");$("hint").textContent="Show hint (costs 8 XP)";
 $("code").classList.toggle("hidden",st.mode==="practice");renderStats();codegen();coach();}
function resetAll(){st.done={};st.xp=0;st.badges={};st.nohint=0;st.streak={n:0,day:""};save();cur=LEVELS[0];load();}
function codegen(){try{const q=build(),H=Object.entries(q.headers),hb=q.body&&q.method!=="GET",hj=JSON.stringify(Object.fromEntries(H)),k=$("lang").value;let s;
 if(k==="curl")s=`curl -X ${q.method} '${q.url}'`+H.map(([a,b])=>` \\\n  -H '${a}: ${b}'`).join("")+(hb?` \\\n  -d '${q.body}'`:"");
 else if(k==="python")s=`import requests\n\nr = requests.request(\n    "${q.method}", "${q.url}",\n    headers=${hj},`+(hb?`\n    data=${JSON.stringify(q.body)},`:"")+`\n    timeout=10,\n)\nprint(r.status_code)\nprint(r.text)`;
 else s=`const res = await fetch("${q.url}", {\n  method: "${q.method}",\n  headers: ${hj},`+(hb?`\n  body: ${JSON.stringify(q.body)},`:"")+`\n});\nconsole.log(res.status, await res.text());`;
 $("codeout").textContent=s;}catch(e){$("codeout").textContent="Fill in a valid URL first.";}}
$("lang").onchange=codegen;$("copy").onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText($("codeout").textContent);$("copy").textContent="Copied!";setTimeout(()=>$("copy").textContent="Copy",1200);};
function openProfile(){const nx=RANKS.find(r=>r[0]>st.xp);
 $("profile").innerHTML=`<div class="card modal"><button class="x2" id="pclose">&times;</button><h2>${rank()}</h2><p class="muted">${st.xp} XP${nx?` &middot; ${nx[0]-st.xp} to ${nx[1]}`:" &middot; max rank"} &middot; streak ${st.streak.n} day(s) &middot; ${Object.keys(st.done).length}/${LEVELS.length} missions</p><div class="badges">${BADGES.map(b=>`<div class="badge ${st.badges[b[0]]?"on":""}"><b>${b[1]}</b><span>${b[2]}</span></div>`).join("")}</div></div>`;
 $("profile").classList.remove("hidden");$("pclose").onclick=()=>$("profile").classList.add("hidden");}
function openPrimer(){hideExtra();$("intro").classList.add("hidden");$("app").classList.add("hidden");$("primer").classList.remove("hidden");pi=0;drawPrimer();renderModes();}
function drawPrimer(){const p=PRIMER[pi],lastS=pi===PRIMER.length-1;
 $("primer").innerHTML=`<div class="card pslide"><span class="num">PRIMER &middot; STEP ${pi+1} / ${PRIMER.length}</span><div class="pbar"><i style="width:${(pi+1)/PRIMER.length*100}%"></i></div><h2>${p.t}</h2>${p.h}<div class="quiz"><b>Quick check:</b> ${p.q[0]}<div class="opts">${p.q[1].map((o,i)=>`<button class="pill opt" data-i="${i}"><b>${"ABC"[i]}</b>${o}</button>`).join("")}</div><div id="qfb" class="qfb"></div></div><button class="btn" id="pnext" disabled>${lastS?"Finish":"Next"} &rarr;</button></div>`;
 const opts=[...document.querySelectorAll(".opt")];
 opts.forEach(b=>b.onclick=()=>{if(b.disabled)return;const ok=+b.dataset.i===p.q[2];
  if(ok){b.classList.add("right");opts.forEach(o=>{o.disabled=true;if(o!==b)o.classList.add("dim");});burst(b);$("pnext").disabled=false;}
  else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");}
  $("qfb").textContent=ok?"Correct! "+p.q[3]:"Not quite. Re-read the card above and try another.";$("qfb").className="qfb show "+(ok?"good":"bad");});
 $("pnext").onclick=()=>lastS?finishPrimer():(pi++,drawPrimer());}
function finishPrimer(){if(!st.badges.primer){st.xp+=30;st.badges.primer=1;save();}setMode("beginner");}
$("modecards").insertAdjacentHTML("afterbegin",`<button class="card mode" id="pcard"><span class="num">00</span><h3>Primer</h3><p>New to APIs? A 2-minute interactive crash course. Start here.</p><span class="go">Begin &rarr;</span></button>`);$("pcard").onclick=openPrimer;renderStats();
