const $=id=>document.getElementById(id),KEY="api-trainer-v3";
const MODES={beginner:["Beginner","Full guide: concepts, step-by-step, live raw-request view, hints and tooltips."],
 refresher:["Refresher","Scenario only, plus tooltips and hints. For devs who know the basics."],
 practice:["Practice","No guide. Just the mission and hover tooltips. Prove it."]};
const TABHELP={params:"Query parameters: key/value pairs appended to the URL after ?. Used to filter, search and page through results.",
 auth:"Authorization: proves who you are. Pick a type and the app builds the right header (or query param) for you.",
 headers:"Headers: metadata sent with the request, such as content type or credentials. Disabled rows are not sent.",
 body:"Body: the data you send. Used by POST, PUT and PATCH. JSON is the most common format; GET has no body."};
let st=JSON.parse(localStorage.getItem(KEY)||'{"done":{},"mode":"beginner"}'),cur=LEVELS[0],last=null,lastRes=null,wallet={};
const save=()=>localStorage.setItem(KEY,JSON.stringify(st)),stars=n=>"\u2605".repeat(n)+"\u2606".repeat(5-n);
const fill=s=>s.replace(/\{\{(?:last\.)?([\w.]+)\}\}/g,(_,p)=>{const v=wallet[p]!==undefined?wallet[p]:p.split(".").reduce((o,k)=>o&&o[k],last);return v==null?"":v;});
const inApp=()=>!$("app").classList.contains("hidden")||!$("map").classList.contains("hidden");
function show(app){hideExtra();$("primer").classList.add("hidden");$("map").classList.add("hidden");$("intro").classList.toggle("hidden",app);$("app").classList.toggle("hidden",!app);renderModes();}
function renderModes(){typeof navMark==="function"&&navMark();$("modes").innerHTML=Object.keys(MODES).map(m=>`<button class="pill ${m===st.mode&&inApp()?"on":""}" data-m="${m}">${MODES[m][0]}</button>`).join("");
 $("modes").querySelectorAll("button").forEach(b=>b.onclick=()=>setMode(b.dataset.m));}
function setMode(m){st.mode=m;save();openMap();}
$("modecards").innerHTML=Object.keys(MODES).map((m,i)=>`<button class="card mode" data-m="${m}"><span class="num">0${i+1}</span><h3>${MODES[m][0]}</h3><p>${MODES[m][1]}</p><span class="go">Start &rarr;</span></button>`).join("");
$("modecards").querySelectorAll("button").forEach(b=>b.onclick=()=>setMode(b.dataset.m));$("home").onclick=()=>show(false);

// key/value tables
function kvRow(k="",v="",on=true){const d=document.createElement("div");d.className="kv";d.innerHTML=`<input type=checkbox ${on?"checked":""}><input class=k placeholder=Key><input class=v placeholder=Value><button class=x>&times;</button>`;d.querySelector(".k").value=k;d.querySelector(".v").value=v;return d;}
function kvSet(id,rows){const el=$(id);el.innerHTML="";rows.concat([["",""]]).forEach(r=>el.append(kvRow(r[0],r[1])));}
const kvGet=id=>[...$(id).querySelectorAll(".kv")].filter(d=>d.querySelector("[type=checkbox]").checked&&d.querySelector(".k").value.trim()).map(d=>[d.querySelector(".k").value.trim(),d.querySelector(".v").value]);
document.addEventListener("click",e=>{const t=e.target;if(t.dataset.add)$(t.dataset.add).append(kvRow());if(t.classList.contains("x")){t.parentNode.remove();pv();}});

// auth
function renderAuth(a){$("authType").value=a.type;const f=$("authFields"),t=a.type;
 const i=(id,ph,v="")=>`<input id="${id}" placeholder="${ph}" value="${v}" spellcheck="false">`;
 f.innerHTML=t==="basic"?i("a-user","Username")+i("a-pass","Password"):t==="bearer"?i("a-token","Token (supports {{last.accessToken}})",a.token||""):
 t==="apikey"?i("a-key","Key name, e.g. X-API-Key")+i("a-val","Value")+`<select id="a-in"><option value="header">Add to Header</option><option value="query">Add to Query Params</option></select>`:
 `<p class="muted">This request does not use any authorization.</p>`;}
const g=id=>$(id)?fill($(id).value):"";
function build(){
 const headers={},params=kvGet("params").map(([k,v])=>[fill(k),fill(v)]);kvGet("headers").forEach(([k,v])=>headers[fill(k).toLowerCase()]=fill(v));
 const t=$("authType").value;
 if(t==="basic")headers.authorization="Basic "+btoa(g("a-user")+":"+g("a-pass"));
 if(t==="bearer")headers.authorization="Bearer "+g("a-token");
 if(t==="apikey"&&g("a-key"))($("a-in").value==="header"?headers[g("a-key").toLowerCase()]=g("a-val"):params.push([g("a-key"),g("a-val")]));
 const bt=$("bodyType").value;let body="";
 if(bt==="json"){body=fill($("bodyText").value);headers["content-type"]=headers["content-type"]||"application/json";}
 if(bt==="form"){body=new URLSearchParams(kvGet("form").map(([k,v])=>[fill(k),fill(v)])).toString();headers["content-type"]=headers["content-type"]||"application/x-www-form-urlencoded";}
 let url=fill($("url").value.trim());if(params.length)url+=(url.includes("?")?"&":"?")+new URLSearchParams(params);
 return{method:$("method").value,url,headers,body};
}
function pv(){codegen();coach();try{const q=build(),u=new URL(q.url),E=x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;");
 const hd=Object.entries(q.headers).map(([k,v])=>`<span class="hk" data-tip="Header: extra information about the request.">${E(k)}</span>: <span class="hv">${E(v)}</span>`).join("\n");
 $("preview").innerHTML=`<span class="pm" data-tip="Method: the action you want performed.">${q.method}</span> <span class="pp" data-tip="Path and query: which resource, plus any filters.">${E(u.pathname+u.search)}</span> HTTP/1.1\nHost: <span class="ph" data-tip="Host: the server receiving this request.">${E(u.host)}</span>\n${hd}`+(q.body&&q.method!=="GET"?`\n\n<span class="pb" data-tip="Body: the data you are sending.">${E(q.body)}</span>`:"");}catch(x){$("preview").textContent="Enter a full URL starting with https://";}}

// tabs
function tab(t){document.querySelectorAll("#tabs .tab").forEach(b=>b.classList.toggle("on",b.dataset.t===t));
 ["params","auth","headers","body"].forEach(x=>$("p-"+x).classList.toggle("hidden",x!==t));$("tabhelp").textContent=TABHELP[t];}
$("tabs").innerHTML=Object.keys(TABHELP).map(t=>`<button class="tab" data-t="${t}" data-tip="${TABHELP[t]}">${{params:"Params",auth:"Authorization",headers:"Headers",body:"Body"}[t]}</button>`).join("");
$("tabs").querySelectorAll("button").forEach(b=>b.onclick=()=>tab(b.dataset.t));
document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-r]").forEach(x=>x.classList.toggle("on",x===b));
 $("out").classList.toggle("hidden",b.dataset.r!=="body");$("rhead").classList.toggle("hidden",b.dataset.r!=="headers");});
$("authType").onchange=()=>{renderAuth({type:$("authType").value});pv();};
$("bodyType").onchange=()=>{bodyView();pv();};
function bodyView(){const t=$("bodyType").value;$("bodyText").classList.toggle("hidden",t!=="json");$("form").classList.toggle("hidden",t!=="form");document.querySelector('[data-add="form"]').classList.toggle("hidden",t!=="form");}
["p-params","p-auth","p-headers","p-body"].forEach(i=>{$(i).addEventListener("input",pv);$(i).addEventListener("change",pv);});$("url").oninput=pv;$("method").onchange=pv;

function renderNav(){const row=l=>`<button class="lv ${l.id===cur.id?"on":""} ${unlocked(l)?"":"lock"}" data-id="${l.id}"><span class="stars">${stars(l.stars)}</span><b>${l.title}</b>${st.done[l.id]?"<em>&#10003;</em>":""}</button>`;
 const grp=(t,n)=>`<p class="muted grp">${n}</p>`+LEVELS.filter(l=>(l.track||"mission")===t).map(row).join("");
 $("levels").innerHTML=`<p class="muted">${Object.keys(st.done).length}/${LEVELS.length} complete</p>`+grp("mission","Missions")+grp("debug","Debug Lab");
 $("levels").querySelectorAll(".lv").forEach(b=>b.onclick=()=>pick(b.dataset.id));}
function load(){
 const m=st.mode,s=cur.start;
 renderBrief();$("learn").classList.toggle("hidden",m!=="beginner");
 $("method").value=s.method;$("url").value=s.url;kvSet("params",s.params);kvSet("headers",s.headers);kvSet("form",[]);
 renderAuth(s.auth);$("bodyType").value=s.body.type;$("bodyText").value=s.body.text;bodyView();
 $("tabhelp").classList.toggle("hidden",m!=="beginner");$("pv").classList.toggle("hidden",m!=="beginner");$("pv").open=m==="beginner";
 tab(s.method==="POST"||s.method==="PATCH"?"body":"params");pv();
 $("status").textContent="";$("out").textContent="Send a request to see the response.";$("rhead").textContent="";$("verdict").textContent="";$("verdict").className="";
 $("hintbox").textContent="";$("hint").classList.toggle("hidden",m==="practice");$("hint").textContent="Show hint";renderNav();renderModes();afterLoad();
}
async function send(){
 let q;try{q=build();}catch(e){$("status").textContent="Check your inputs: "+e.message;return;}
 $("status").textContent="Sending...";$("status").className="";wire("go");const t0=performance.now();
 try{
  const init={method:q.method,headers:q.headers};if(q.body&&!["GET","HEAD"].includes(q.method))init.body=q.body;
  const r=await fetch(q.url,init),text=await r.text();let json=null;try{json=JSON.parse(text);}catch(e){}
  const res={status:r.status,json,text};if(json&&typeof json==="object"&&r.ok){last=json;captureWallet(json);}
  $("status").textContent=`${r.status} ${r.statusText} \u00b7 ${Math.round(performance.now()-t0)} ms \u00b7 ${text.length} B`;$("status").className=r.ok?"good":"bad";wire(r.ok?"good":"bad");
  $("out").textContent=(json?JSON.stringify(json,null,2):text).slice(0,6000);
  $("rhead").textContent=[...r.headers].map(([k,v])=>`${k}: ${v}`).join("\n")||"(browser exposes only some headers on cross-origin calls)";
  onResult(q,res,r);
 }catch(e){$("status").textContent="Network error";wire("bad");$("status").className="bad";$("out").textContent=e.message+"\n\nCheck the URL, or the server may block browser (CORS) calls.";}
}
$("send").onclick=send;
$("hint").onclick=()=>useHint();
$("reset").onclick=()=>{if(confirm("Reset all progress?")){resetAll();}};
renderModes();
