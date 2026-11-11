// Playground: generate an API system, build a tiny app on it, watch every request travel.
const SB_KEY="sandbox-key-123",SBFAST=/jsdom/.test(navigator.userAgent),sbWait=ms=>new Promise(r=>setTimeout(r,SBFAST?0:ms)),sbE=x=>String(x==null?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const SB_SYS={
pizza:{name:"Pizza Shop",path:"orders",one:"order",sf:"status",fields:[{k:"customer",t:"text"},{k:"pizza",t:"select",o:["Margherita","Pepperoni","Hawaiian","Veggie"]},{k:"qty",t:"number"},{k:"status",t:"select",o:["preparing","baking","ready","delivered"]}],seed:[{customer:"Ana",pizza:"Margherita",qty:2,status:"baking"},{customer:"Ben",pizza:"Pepperoni",qty:1,status:"preparing"},{customer:"Cleo",pizza:"Veggie",qty:3,status:"ready"}]},
books:{name:"Library",path:"books",one:"book",sf:"status",fields:[{k:"title",t:"text"},{k:"author",t:"text"},{k:"pages",t:"number"},{k:"status",t:"select",o:["available","borrowed","lost"]}],seed:[{title:"Dune",author:"Herbert",pages:612,status:"available"},{title:"Emma",author:"Austen",pages:474,status:"borrowed"},{title:"Ulysses",author:"Joyce",pages:730,status:"available"}]},
pets:{name:"Pet Shelter",path:"pets",one:"pet",sf:"status",fields:[{k:"name",t:"text"},{k:"species",t:"select",o:["dog","cat","rabbit"]},{k:"age",t:"number"},{k:"status",t:"select",o:["available","fostered","adopted"]}],seed:[{name:"Rex",species:"dog",age:3,status:"available"},{name:"Mimi",species:"cat",age:2,status:"fostered"},{name:"Bun",species:"rabbit",age:1,status:"available"}]}};
function sbParse(name,spec){const path=name.trim().toLowerCase().replace(/[^a-z0-9]/g,"");if(!path)throw Error("Give your resource a name, like recipes");
 const fields=spec.split(",").map(s=>s.trim()).filter(Boolean).map(s=>{const[a,b]=s.split(":").map(x=>x.trim()),k=(a||"").toLowerCase().replace(/[^a-z0-9_]/g,"");if(!k||k==="id")throw Error('Bad field name: "'+a+'"');
  if(!b||b==="text")return{k,t:"text"};if(b==="number")return{k,t:"number"};const o=b.split("|").map(x=>x.trim()).filter(Boolean);if(o.length<2)throw Error('"'+k+'": use text, number, or options like a|b|c');return{k,t:"select",o};});
 if(!fields.length)throw Error("Add at least one field, like title, minutes:number");const sel=fields.find(f=>f.t==="select");
 return{name:path[0].toUpperCase()+path.slice(1)+" system",path,one:path.replace(/s$/,""),sf:sel&&sel.k,fields,seed:[1,2,3].map(n=>Object.fromEntries(fields.map(f=>[f.k,f.t==="number"?n*3:f.t==="select"?f.o[(n-1)%f.o.length]:`${f.k} ${n}`])))};}
const rs=(status,json,headers,fx)=>({status,json,headers:headers||{},fx:fx||null});
class SbMock{
 constructor(s){this.sys=s;this.flags={auth:false,slow:false,flaky:false,limit:false};this.hits=[];this.reset();}
 reset(){this.rows=this.sys.seed.map((r,i)=>({id:i+1,...r}));this.nid=this.rows.length+1;}
 validate(b,full){const e=[];this.sys.fields.forEach(f=>{const v=b[f.k];if(v===undefined||v===""){if(full)e.push(f.k+" is required");return;}
  if(f.t==="number"&&(typeof v!=="number"||isNaN(v)))e.push(f.k+" must be a number");if(f.t==="text"&&typeof v!=="string")e.push(f.k+" must be text");
  if(f.t==="select"&&!f.o.includes(v))e.push(f.k+" must be one of: "+f.o.join(", "));});return e.length?e.join("; "):null;}
 clean(b){return Object.fromEntries(this.sys.fields.filter(f=>b[f.k]!==undefined).map(f=>[f.k,b[f.k]]));}
 parse(q){if(!/application\/json/i.test(q.headers["content-type"]||""))return{err:rs(415,{error:"Send the body as JSON and set Content-Type: application/json"})};let v;try{v=JSON.parse(q.body)}catch(e){return{err:rs(400,{error:"Body is not valid JSON: "+e.message})}}
  return v&&typeof v==="object"&&!Array.isArray(v)?{v}:{err:rs(400,{error:"Body must be a JSON object"})};}
 async handle(q){const f=this.flags,S=this.sys;await sbWait(f.slow?1400:350);const now=Date.now();this.hits=this.hits.filter(t=>now-t<10000);this.hits.push(now);
  if(f.limit&&this.hits.length>5)return rs(429,{error:"Too many requests. Wait a few seconds."},{"retry-after":"5"});
  if(f.flaky&&Math.random()<.4)return rs(500,{error:"Internal server error (flaky mode)"});
  if(f.auth){const k=q.headers["x-api-key"];if(!k)return rs(401,{error:"Missing API key. Send the X-API-Key header."});if(k!==SB_KEY)return rs(403,{error:"That API key is not valid."});}
  const m=q.path.match(new RegExp("^/"+S.path+"(?:/(\\d+))?/?$"));if(!m)return rs(404,{error:"No such route. Try /"+S.path});
  const id=m[1]?+m[1]:null,M=q.method;
  if(!id){
   if(M==="GET"){let r=this.rows.slice();for(const[k,v]of Object.entries(q.query)){if(k==="limit")continue;if(k==="id"||S.fields.some(x=>x.k===k))r=r.filter(x=>String(x[k])===v);else return rs(400,{error:"Unknown filter: "+k});}if(q.query.limit)r=r.slice(0,+q.query.limit);return rs(200,r);}
   if(M==="POST"){const b=this.parse(q);if(b.err)return b.err;const bad=this.validate(b.v,true);if(bad)return rs(422,{error:bad});const row={id:this.nid++,...this.clean(b.v)};this.rows.push(row);return rs(201,row,{location:`/${S.path}/${row.id}`},{type:"create",id:row.id});}
   return rs(405,{error:M+" is not allowed on /"+S.path+". Try GET or POST."},{allow:"GET, POST"});}
  const row=this.rows.find(x=>x.id===id);if(!row)return rs(404,{error:`${S.one} ${id} not found`});
  if(M==="GET")return rs(200,row,{},{type:"read",id});
  if(M==="DELETE"){this.rows=this.rows.filter(x=>x.id!==id);return rs(204,null,{},{type:"delete",id});}
  if(M==="PUT"||M==="PATCH"){const b=this.parse(q);if(b.err)return b.err;const bad=this.validate(b.v,M==="PUT");if(bad)return rs(422,{error:bad});const c=this.clean(b.v);if(!Object.keys(c).length)return rs(400,{error:"Nothing to update: send at least one known field"});Object.assign(row,c);return rs(200,row,{},{type:"update",id});}
  return rs(405,{error:M+" is not allowed here. Try GET, PUT, PATCH or DELETE."},{allow:"GET, PUT, PATCH, DELETE"});}
}
const QUESTS=[
{id:"read",t:"Read the data",h:"Press Refresh on the list. That is a GET.",ok:e=>e.req.method==="GET"&&e.res.status===200&&!/\/\d+$/.test(e.req.path.split("?")[0])},
{id:"create",t:"Create a record",h:"Fill in the form and Submit. That is a POST.",ok:e=>e.req.method==="POST"&&e.res.status===201},
{id:"one",t:"Look up one record",h:"Add a Find block, or GET /thing/1 in the console.",ok:e=>e.req.method==="GET"&&e.res.status===200&&/\/\d+$/.test(e.req.path.split("?")[0])},
{id:"update",t:"Change a record",h:"Use the Next button, or PATCH in the console.",ok:e=>(e.req.method==="PATCH"||e.req.method==="PUT")&&e.res.status===200},
{id:"delete",t:"Delete a record",h:"Use a Delete button. Expect 204.",ok:e=>e.req.method==="DELETE"&&e.res.status===204},
{id:"filter",t:"Filter with a query",h:"Add a Search block, or GET /thing?field=value.",ok:e=>e.req.method==="GET"&&e.res.status===200&&e.req.path.includes("?")},
{id:"405",t:"Cause a 405",h:"Console: DELETE on the whole collection.",ok:e=>e.res.status===405},
{id:"422",t:"Cause a 422",h:"Console: POST with a missing or invalid field.",ok:e=>e.res.status===422},
{id:"raw",t:"Speak raw HTTP",h:"Send any successful request from the console.",ok:e=>e.req.manual&&e.res.status<300},
{id:"auth",t:"Beat the lock",h:"Turn on API key required, get a 401, then use the key shown in the Server panel.",ok:(e,c)=>c.saw401&&SB.srv.flags.auth&&e.res.status<300},
{id:"retry",t:"Survive a flaky server",h:"Turn on Flaky, get a 500, then retry until it works.",ok:(e,c)=>c.saw500&&SB.srv.flags.flaky&&e.res.status<300}];
BADGES.push(["sbq","Sandbox Architect","Finish all 11 Playground quests",()=>QUESTS.every(q=>st.sbq&&st.sbq[q.id])],["maker","System Maker","Generate your own custom system",()=>st.maker]);
let SB=null;
function openSandbox(){showOnly("sandbox");SB?drawSandbox():drawPicker();}
function drawPicker(){$("sandbox").innerHTML=`<div class="maphead"><span class="chip">Playground</span><h1>Generate a system.<br><span class="grad">Then run it.</span></h1><p class="muted">Pick a system and a working API with a database spins up right here. Build a tiny app on top of it, then watch every request travel to the server and back.</p></div><div class="cards">${Object.entries(SB_SYS).map(([k,s])=>`<button class="card mode" data-sys="${k}"><span class="num">API</span><h3>${s.name}</h3><p>/${s.path} &middot; ${s.fields.map(f=>f.k).join(", ")}</p><span class="go">Generate &rarr;</span></button>`).join("")}</div><div class="card"><h3>Or invent your own</h3><div class="row"><div class="f grow"><label data-tip="The plural noun your API manages, like recipes, tickets or plants.">Resource <i>?</i></label><input id="cx-name" value="recipes"></div><div class="f grow"><label data-tip="Comma separated. Plain names are text. Add :number for numbers, or :a|b|c for a dropdown.">Fields <i>?</i></label><input id="cx-fields" value="title, minutes:number, level:easy|medium|hard"></div><button class="btn" id="cx-go">Generate</button></div><div id="cx-err" class="bad"></div></div>`;}
async function generate(sys){$("sandbox").innerHTML=`<div class="card gen"><pre id="genlog"></pre></div>`;
 for(const l of [`> creating database for "${sys.path}"...`,`> defining ${sys.fields.length} fields: ${sys.fields.map(f=>f.k).join(", ")}`,`> seeding ${sys.seed.length} records...`,`> mounting routes on /${sys.path}`,`> server online. You are in control.`]){$("genlog").textContent+=l+"\n";await sbWait(380);}
 SB={sys,srv:new SbMock(sys),blocks:[],log:[],bid:0,auto:true,key:"",ctx:{}};sbAdd("list");sbAdd("form");drawSandbox();}
function sbAdd(type){SB.blocks.push({id:++SB.bid,type,o:{del:true,adv:true},data:null,res:"",vals:{}});}
function drawSandbox(){const S=SB.sys;
 $("sandbox").innerHTML=`<div class="row between sbtop"><div><span class="chip">Playground</span><h2>${sbE(S.name)}</h2></div><div><button class="link" id="sb-reset">Reset data</button> <button class="link" id="sb-new">New system</button></div></div>
<div class="sbgrid"><aside class="card sbq"><b>Quests</b><ol id="sb-quests"></ol><b>Chaos controls</b><p class="muted">Make the server misbehave, like real life.</p>
<label class="tg" data-tip="Server demands an X-API-Key header. Without it you get 401."><input type="checkbox" data-flag="auth"> API key required</label>
<label class="tg" data-tip="Every response takes 1.5 seconds."><input type="checkbox" data-flag="slow"> Slow server</label>
<label class="tg" data-tip="40% of requests fail with a 500, like a flaky server."><input type="checkbox" data-flag="flaky"> Flaky server</label>
<label class="tg" data-tip="More than 5 requests in 10 seconds returns 429."><input type="checkbox" data-flag="limit"> Rate limit</label></aside>
<div class="sbmain"><div class="stage" id="sb-stage"><section class="pane" id="sb-app"><div class="row between"><b>Your app (client)</b><div class="adds"><button class="mini" data-add="list">+ List</button><button class="mini" data-add="form">+ Form</button><button class="mini" data-add="lookup">+ Find</button><button class="mini" data-add="filter">+ Search</button></div></div>
<div class="row appcfg"><label class="chk" data-tip="Real apps re-fetch the list after a change. Watch the extra GET fly out."><input type="checkbox" id="sb-auto" checked>Re-fetch lists after changes</label><label class="chk">API key <input id="sb-key" placeholder="X-API-Key value" spellcheck="false"></label></div><div id="sb-blocks"></div></section>
<section class="pane" id="sb-server"><div class="row between"><b>Server + database</b><span id="sb-status" class="muted">idle</span></div><div id="sb-db"></div><details open><summary>Auto-generated API docs</summary><div id="sb-docs"></div></details></section></div>
<div class="card"><b>Request console</b> <span class="muted">Write raw HTTP yourself. Templates fill in a valid example.</span><div class="tpls">${[["list","GET all"],["one","GET one"],["post","POST"],["put","PUT"],["patch","PATCH"],["del","DELETE"],["bad","DELETE all"]].map(([k,l])=>`<button class="mini" data-tpl="${k}">${l}</button>`).join("")}</div>
<div class="row"><select id="cs-m"><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select><input id="cs-p" class="grow" value="/${S.path}" spellcheck="false"><button class="btn" id="cs-go">Send &#9654;</button></div>
<label data-tip="You write these yourself. The app's API key box only applies to the blocks above.">Headers <i>?</i></label><textarea id="cs-h" rows="2" placeholder="Content-Type: application/json" spellcheck="false"></textarea><label>Body</label><textarea id="cs-b" rows="3" spellcheck="false"></textarea><div id="cs-out"></div></div>
<div class="card"><b>Request log</b> <span class="muted">Open an entry to see the raw request, the response, and the equivalent curl.</span><div id="sb-log"></div></div></div></div>`;
 renderBlocks();sbDB([],null);sbDocs();sbLog();sbQuestsUI();}
function renderBlocks(){const S=SB.sys;$("sb-blocks").innerHTML=SB.blocks.map(b=>{const v=b.vals;
 const fld=f=>f.t==="select"?`<select data-f="${f.k}">${f.o.map(o=>`<option ${v[f.k]===o?"selected":""}>${sbE(o)}</option>`).join("")}</select>`:`<input data-f="${f.k}" type="${f.t==="number"?"number":"text"}" placeholder="${f.k}" value="${sbE(v[f.k])}">`;
 const item=(r,btn)=>`<div class="item"><span class="id">#${r.id}</span><span>${S.fields.filter(f=>f.k!==S.sf).map(f=>sbE(r[f.k])).join(" &middot; ")}</span>${S.sf?`<span class="chip">${sbE(r[S.sf])}</span>`:""}${btn?btn(r):""}</div>`;
 const head=(t,l)=>`<div class="bh"><b>${t}</b><code>${l}</code><button class="x" data-act="rm" data-tip="Remove this block">&times;</button></div>`;let h="";
 if(b.type==="list")h=head(sbE(S.name)+" list","GET /"+S.path)+`<div class="opts2"><label class="chk"><input type="checkbox" data-opt="del" ${b.o.del?"checked":""}>Delete button</label>${S.sf?`<label class="chk"><input type="checkbox" data-opt="adv" ${b.o.adv?"checked":""}>Next ${S.sf} button</label>`:""}<button class="mini hot" data-act="refresh">Refresh</button></div><div class="items">${b.data?(b.data.map(r=>item(r,x=>(b.o.del?`<button class="mini" data-act="del" data-id="${x.id}">Delete</button>`:"")+(b.o.adv&&S.sf?`<button class="mini" data-act="next" data-id="${x.id}">Next</button>`:""))).join("")||'<p class="muted">Empty.</p>'):'<p class="muted">Not loaded yet. Press Refresh. That is a GET request.</p>'}</div>`;
 if(b.type==="form")h=head("New "+S.one+" form","POST /"+S.path)+`<div class="fgrid">${S.fields.map(f=>`<div class="f"><label>${f.k}</label>${fld(f)}</div>`).join("")}</div><button class="mini hot" data-act="submit">Submit</button>`;
 if(b.type==="lookup")h=head("Find one","GET /"+S.path+"/:id")+`<div class="row"><input data-f="id" type="number" placeholder="id" value="${sbE(v.id)}"><button class="mini hot" data-act="find">Find</button></div>`;
 if(b.type==="filter")h=head("Search","GET /"+S.path+"?field=value")+`<div class="row"><select data-f="k">${S.fields.map(f=>`<option ${v.k===f.k?"selected":""}>${f.k}</option>`).join("")}</select><input data-f="v" placeholder="equals..." value="${sbE(v.v)}"><button class="mini hot" data-act="search">Search</button></div>`+(b.data?`<div class="items">${b.data.map(r=>item(r)).join("")||'<p class="muted">No matches.</p>'}</div>`:"");
 return `<div class="blk" data-b="${b.id}">${h}${b.res?`<div class="bres">${sbE(b.res)}</div>`:""}</div>`;}).join("")||'<p class="muted">Your app is empty. Add blocks above.</p>';}
function sbDocs(){const S=SB.sys,p="/"+S.path,F=S.fields.map(f=>`${f.k}: ${f.t==="select"?f.o.join(" | "):f.t}`).join(", ");
 $("sb-docs").innerHTML=`<table class="t"><tr><td><code>GET ${p}</code></td><td>List. Filter with <code>?field=value</code>, or <code>?limit=2</code></td></tr><tr><td><code>GET ${p}/:id</code></td><td>One record</td></tr><tr><td><code>POST ${p}</code></td><td>Create. JSON body, all fields</td></tr><tr><td><code>PUT ${p}/:id</code></td><td>Replace. All fields</td></tr><tr><td><code>PATCH ${p}/:id</code></td><td>Update some fields</td></tr><tr><td><code>DELETE ${p}/:id</code></td><td>Remove (204)</td></tr></table><p class="muted">Fields: ${sbE(F)}</p>`+(SB.srv.flags.auth?`<p class="keyhint">Auth required. Send header <code>X-API-Key: ${SB_KEY}</code></p>`:"");}
function sbDB(before,fx){const S=SB.sys,draw=(rows,m)=>{$("sb-db").innerHTML=`<table class="db"><tr><th>id</th>${S.fields.map(f=>`<th>${f.k}</th>`).join("")}</tr>${rows.map(r=>`<tr class="${m[r.id]||""}"><td>${r.id}</td>${S.fields.map(f=>`<td>${sbE(r[f.k])}</td>`).join("")}</tr>`).join("")}</table><p class="muted">${rows.length} record(s) in the database</p>`;};
 if(fx&&fx.type==="delete"){draw(before,{[fx.id]:"del"});setTimeout(()=>SB&&draw(SB.srv.rows,{}),SBFAST?0:700);return;}
 draw(SB.srv.rows,fx&&fx.id?{[fx.id]:{create:"new",update:"upd",read:"read"}[fx.type]}:{});}
async function sbFly(from,to,label,cls){const stg=$("sb-stage");if(!stg)return;const S=stg.getBoundingClientRect(),c=e=>{const r=e.getBoundingClientRect();return[r.left+r.width/2-S.left,r.top+r.height/2-S.top];};
 const a=c(from&&from.isConnected?from:$("sb-app")),b=c(to),p=document.createElement("div");p.className="pkt2 "+cls;p.textContent=label;stg.append(p);
 if(!p.animate){p.remove();return;}
 await p.animate([{transform:`translate(${a[0]}px,${a[1]}px) scale(.6)`,opacity:.2},{opacity:1,offset:.15},{transform:`translate(${b[0]}px,${b[1]}px) scale(1)`,opacity:1}],{duration:SBFAST?0:750,easing:"ease-in-out",fill:"forwards"}).finished;p.remove();}
async function call(q,src){const u=new URL(q.path,"http://sandbox.local"),req={method:q.method.toUpperCase(),path:u.pathname,query:Object.fromEntries(u.searchParams),headers:Object.fromEntries(Object.entries(q.headers||{}).map(([k,v])=>[k.toLowerCase(),v])),body:q.body||""},srv=$("sb-server");
 $("sb-status").textContent=`Request #${SB.log.length+1} in flight...`;await sbFly(src,srv,req.method,"req");srv.classList.add("busy");$("sb-status").textContent=`Server got ${req.method} ${u.pathname}${u.search}`;
 const t0=performance.now(),before=SB.srv.rows.map(r=>({...r})),res=await SB.srv.handle(req);srv.classList.remove("busy");sbDB(before,res.fx);
 await sbFly(srv,src,res.status,res.status<400?"ok":"bad");$("sb-status").textContent=`Responded ${res.status} ${(STATUS[res.status]||[""])[0]}`;
 const e={n:SB.log.length+1,req:{method:req.method,path:q.path,headers:req.headers,body:req.body,manual:!!q.manual},res,ms:Math.round(performance.now()-t0)};SB.log.unshift(e);sbLog();sbQuests(e);return res;}
function sbLog(){$("sb-log").innerHTML=SB.log.slice(0,12).map(e=>{const h=Object.entries(e.req.headers).map(([k,v])=>`${k}: ${v}`).join("\n"),
 curl=`curl -X ${e.req.method} 'https://api.example.com${e.req.path}'`+Object.entries(e.req.headers).map(([k,v])=>` \\\n  -H '${k}: ${v}'`).join("")+(e.req.body?` \\\n  -d '${e.req.body}'`:""),x=STATUS[e.res.status];
 return `<details class="le ${e.res.status<400?"ok":"bad"}"><summary><b>${e.req.method}</b> ${sbE(e.req.path)} <span class="chip">${e.res.status}</span> <span class="muted">${e.ms}ms</span></summary><pre>${sbE(`${e.req.method} ${e.req.path} HTTP/1.1\n${h}${e.req.body?"\n\n"+e.req.body:""}\n\n--- response ---\nHTTP/1.1 ${e.res.status}\n${e.res.json?JSON.stringify(e.res.json,null,2):"(no body)"}`)}</pre><p class="muted">${x?sbE(x[0]+": "+x[1]):""}</p><pre>${sbE(curl)}</pre></details>`;}).join("")||'<p class="muted">No requests yet. Press Refresh in your app.</p>';}
function sbQuestsUI(){const d=st.sbq=st.sbq||{};$("sb-quests").innerHTML=QUESTS.map(q=>`<li class="${d[q.id]?"ok":""}"><b>${q.t}</b><span class="muted">${q.h}</span></li>`).join("");}
function sbQuests(e){const c=SB.ctx,f=SB.srv.flags;if(f.auth&&e.res.status===401)c.saw401=true;if(f.flaky&&e.res.status===500)c.saw500=true;
 const d=st.sbq=st.sbq||{};QUESTS.forEach(q=>{if(!d[q.id]&&q.ok(e,c)){d[q.id]=1;st.xp+=15;const nb=grantBadges();save();renderStats();toast(`Quest complete: ${q.t} (+15 XP)${nb.length?" - New badge: "+nb.join(", "):""}`);burst($("sb-quests"));}});sbQuestsUI();}
async function sbList(b,src){const r=await call({method:"GET",path:"/"+SB.sys.path,headers:sbH({})},src);if(r.status===200){b.data=r.json;b.res="";}else b.res=`${r.status}: ${r.json&&r.json.error}`;renderBlocks();}
const sbH=x=>SB.key?{...x,"x-api-key":SB.key}:x;
async function sbAct(t){const a=t.dataset.act,bEl=t.closest(".blk"),b=SB.blocks.find(x=>x.id==bEl.dataset.b),S=SB.sys,p="/"+S.path,J={"content-type":"application/json"},err=r=>`${r.status}: ${r.json&&r.json.error}`;
 if(a==="rm"){SB.blocks=SB.blocks.filter(x=>x!==b);return renderBlocks();}if(a==="refresh")return sbList(b,t);let r;
 if(a==="submit"){const body={};S.fields.forEach(f=>{const v=b.vals[f.k];body[f.k]=f.t==="number"?(v===undefined||v===""?"":Number(v)):f.t==="select"?(v||f.o[0]):(v||"");});
  r=await call({method:"POST",path:p,headers:sbH(J),body:JSON.stringify(body)},t);b.res=r.status===201?`Created #${r.json.id}`:err(r);if(r.status===201)b.vals={};}
 if(a==="find"){r=await call({method:"GET",path:p+"/"+(b.vals.id||0),headers:sbH({})},t);b.res=r.status===200?JSON.stringify(r.json):err(r);}
 if(a==="search"){const q=new URLSearchParams();if(b.vals.v)q.set(b.vals.k||S.fields[0].k,b.vals.v);r=await call({method:"GET",path:p+(q.toString()?"?"+q:""),headers:sbH({})},t);if(r.status===200)b.data=r.json;b.res=r.status===200?`${r.json.length} result(s)`:err(r);}
 if(a==="del"){r=await call({method:"DELETE",path:p+"/"+t.dataset.id,headers:sbH({})},t);b.res=r.status===204?"Deleted":err(r);}
 if(a==="next"){const f=S.fields.find(x=>x.k===S.sf),row=(b.data||[]).find(x=>x.id==t.dataset.id),nx=f.o[(f.o.indexOf(row[S.sf])+1)%f.o.length];
  r=await call({method:"PATCH",path:p+"/"+t.dataset.id,headers:sbH(J),body:JSON.stringify({[S.sf]:nx})},t);b.res=r.status===200?`${S.sf} is now ${nx}`:err(r);}
 renderBlocks();if(SB.auto&&r&&r.status<300&&["submit","del","next"].includes(a))for(const l of SB.blocks.filter(x=>x.type==="list"))await sbList(l,document.querySelector(`.blk[data-b="${l.id}"] [data-act=refresh]`));}
function sbTpl(k){const S=SB.sys,p="/"+S.path,smp=JSON.stringify(Object.fromEntries(S.fields.map(f=>[f.k,f.t==="number"?2:f.t==="select"?f.o[0]:"Sample"])),null,1),pf=S.fields.find(f=>f.k===S.sf)||S.fields[0],
 T={list:["GET",p,"",""],one:["GET",p+"/1","",""],post:["POST",p,"Content-Type: application/json",smp],put:["PUT",p+"/1","Content-Type: application/json",smp],patch:["PATCH",p+"/1","Content-Type: application/json",JSON.stringify({[pf.k]:pf.t==="number"?5:pf.t==="select"?pf.o[1]:"Changed"})],del:["DELETE",p+"/1","",""],bad:["DELETE",p,"",""]}[k];
 $("cs-m").value=T[0];$("cs-p").value=T[1];$("cs-h").value=T[2];$("cs-b").value=T[3];}
async function sbConsole(){const h={};$("cs-h").value.split("\n").forEach(l=>{const i=l.indexOf(":");if(i>0)h[l.slice(0,i).trim()]=l.slice(i+1).trim();});
 const r=await call({method:$("cs-m").value,path:$("cs-p").value.trim()||"/",headers:h,body:$("cs-b").value,manual:true},$("cs-go"));
 $("cs-out").innerHTML=`<b class="${r.status<400?"good":"bad"}">${r.status} ${(STATUS[r.status]||[""])[0]}</b><pre>${sbE(r.json?JSON.stringify(r.json,null,2):"(no body)")}</pre>`;}
$("sandbox").addEventListener("click",async e=>{const t=e.target.closest("button");if(!t)return;const d=t.dataset;
 if(d.sys)return generate(SB_SYS[d.sys]);
 if(t.id==="cx-go"){try{const s=sbParse($("cx-name").value,$("cx-fields").value);st.maker=1;save();const nb=grantBadges();nb.length&&toast("New badge: "+nb.join(", "));generate(s);}catch(x){$("cx-err").textContent=x.message;}return;}
 if(t.id==="sb-new"){SB=null;return drawPicker();}
 if(t.id==="sb-reset"){SB.srv.reset();sbDB([],null);SB.blocks.forEach(b=>b.data=null);renderBlocks();return toast("Database reset");}
 if(d.add){sbAdd(d.add);return renderBlocks();}if(d.tpl)return sbTpl(d.tpl);if(t.id==="cs-go")return sbConsole();if(d.act)return sbAct(t);});
$("sandbox").addEventListener("change",e=>{const t=e.target;if(!SB)return;if(t.dataset.flag){SB.srv.flags[t.dataset.flag]=t.checked;sbDocs();}else if(t.id==="sb-auto")SB.auto=t.checked;
 else if(t.dataset.opt){SB.blocks.find(b=>b.id==t.closest(".blk").dataset.b).o[t.dataset.opt]=t.checked;renderBlocks();}});
$("sandbox").addEventListener("input",e=>{const t=e.target;if(!SB)return;if(t.id==="sb-key")SB.key=t.value;else if(t.dataset.f)SB.blocks.find(b=>b.id==t.closest(".blk").dataset.b).vals[t.dataset.f]=t.value;});
$("modecards").insertAdjacentHTML("beforeend",`<button class="card mode" id="acard"><span class="num">LEARN</span><h3>Academy</h3><p>A classroom-style wiki: 8 lessons with examples, use cases and checks.</p><span class="go">Open &rarr;</span></button><button class="card mode" id="pgcard"><span class="num">BUILD</span><h3>Playground</h3><p>Generate a whole API system, build an app on it, and watch data fly.</p><span class="go">Generate &rarr;</span></button>`);
$("acard").onclick=()=>openAcademy();$("pgcard").onclick=openSandbox;$("n-learn").onclick=()=>openAcademy();$("n-play").onclick=openSandbox;
