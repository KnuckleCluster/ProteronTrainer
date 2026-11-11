const LESSONS=[
{id:"l1",sec:"Foundations",t:"What is an API?",min:3,learn:["What an API is, in plain words","Client vs server","Why APIs exist"],
body:`<p>An <b>API</b> (Application Programming Interface) is a contract: <i>"send me a message shaped like this and I'll reply with something shaped like that."</i> You never touch the other program's insides. You use its menu.</p><h4>The restaurant</h4><p>You are the <b>client</b>. The kitchen is the <b>server</b>. The waiter and menu are the <b>API</b>. You can only order what is on the menu, in the format the waiter understands.</p><h4>Web APIs</h4><p>Most APIs you'll use are <b>web APIs</b>: messages travel over the internet using <b>HTTP</b>, usually carrying <b>JSON</b> data.</p>`,
use:["A weather app asks a weather service for today's forecast","A checkout page asks a payment service to charge a card","Your frontend asks your own backend for the logged-in user's profile"],
go:[["See requests travel in the Playground","play"]],q:["In the restaurant analogy, what is the API?",["The diner","The menu and waiter","The kitchen"],1]},
{id:"l2",sec:"Foundations",t:"HTTP: request and response",min:4,learn:["The four parts of a request","What a response contains","Why HTTP is stateless"],
body:`<p><b>HTTP</b> is a strict conversation: the client sends one <b>request</b>, the server sends back one <b>response</b>. The server never speaks first.</p><h4>A request</h4><pre class="cb">POST /orders HTTP/1.1
Host: api.pizza.test
Content-Type: application/json

{"customer":"Ana","qty":2}</pre><p>Four parts: <b>method</b> (what to do), <b>path</b> (which thing), <b>headers</b> (metadata) and an optional <b>body</b> (data).</p><h4>A response</h4><pre class="cb">HTTP/1.1 201 Created
Content-Type: application/json

{"id":5,"customer":"Ana","qty":2}</pre><p>A <b>status code</b>, headers, and usually a body. HTTP is <b>stateless</b>: the server forgets you after each response, so credentials travel with every request.</p>`,
use:["Every page your browser loads is an HTTP GET","Saving your profile in an app sends a PUT or PATCH","Any code that calls a web API is just building these text messages"],
go:[["Watch a request fly in the Playground","play"],["Mission: The Messenger","m:messenger"]],q:["Who always speaks first in HTTP?",["The server","The client","Whoever is faster"],1]},
{id:"l3",sec:"Using APIs",t:"Methods and CRUD",min:4,learn:["The five core methods","CRUD mapping","Safe and idempotent"],
body:`<p>The <b>method</b> is the verb. With the URL (the noun) it says exactly what you want. Most APIs follow <b>CRUD</b>: Create, Read, Update, Delete.</p><table class="t"><tr><th>Method</th><th>Does</th><th>Example</th></tr><tr><td>GET</td><td>Read</td><td><code>GET /orders/5</code></td></tr><tr><td>POST</td><td>Create</td><td><code>POST /orders</code></td></tr><tr><td>PUT</td><td>Replace the whole record</td><td><code>PUT /orders/5</code></td></tr><tr><td>PATCH</td><td>Change some fields</td><td><code>PATCH /orders/5</code></td></tr><tr><td>DELETE</td><td>Remove</td><td><code>DELETE /orders/5</code></td></tr></table><h4>Safe and idempotent</h4><p><b>GET</b> never changes anything. <b>PUT</b> and <b>DELETE</b> are <b>idempotent</b>: doing them twice leaves the same result. <b>POST</b> is not: send it twice and you may create two orders.</p>`,
use:["Add to cart = POST, remove from cart = DELETE","Edit your display name = PATCH","Refreshing a feed = GET"],
go:[["Create and delete in the Playground","play"],["Mission: Ink and Paper","m:writer"]],q:["Which method changes just ONE field of an existing record?",["PUT","PATCH","POST"],1]},
{id:"l4",sec:"Using APIs",t:"URLs, paths and query params",min:3,learn:["Reading a URL","Path vs query","What never belongs in a URL"],
body:`<pre class="cb">https://api.pizza.test/orders/5?status=ready&amp;limit=10</pre><table class="t"><tr><td><code>https://</code></td><td>scheme: HTTPS means encrypted</td></tr><tr><td><code>api.pizza.test</code></td><td>host: which server</td></tr><tr><td><code>/orders/5</code></td><td>path: which resource (order 5)</td></tr><tr><td><code>?status=ready&amp;limit=10</code></td><td>query: filters and options joined by &amp;</td></tr></table><h4>Path or query?</h4><p><b>Path</b> picks <i>which one</i>. <b>Query</b> narrows or shapes a <i>list</i>. Never put secrets in a URL: it ends up in logs and browser history.</p>`,
use:["/products?category=shoes&sort=price","/users/42/posts","Pagination: ?limit=20&offset=40"],
go:[["Filter data in the Playground","play"],["Mission: Needle in a Haystack","m:filter"]],q:["Where does 'only ready orders' belong?",["Path: /orders/ready","Query: /orders?status=ready","Body"],1]},
{id:"l5",sec:"Using APIs",t:"Headers and JSON bodies",min:4,learn:["What headers do","JSON syntax rules","Why Content-Type matters"],
body:`<p><b>Headers</b> are labels on the envelope: <code>Content-Type</code> says what format the body is in, <code>Accept</code> what you want back, <code>Authorization</code> carries credentials.</p><h4>JSON</h4><pre class="cb">{
  "customer": "Ana",
  "qty": 2,
  "toppings": ["basil", "olives"],
  "paid": true,
  "note": null
}</pre><p>Rules: double quotes only, no trailing commas, no comments. Send JSON with <code>Content-Type: application/json</code>, or the server may refuse it (415) or choke (400).</p>`,
use:["Sign-up forms POST a JSON body","Mobile apps send an Accept-Language header","APIs return errors as JSON so code can read them"],
go:[["Break a request on purpose (console)","play"],["Debug: Broken JSON","m:djson"]],q:["Which header tells the server your body is JSON?",["Accept","Content-Type","Authorization"],1]},
{id:"l6",sec:"Reading responses",t:"Status codes",min:3,learn:["The five families","The codes you'll meet daily","Whose turn it is to fix it"],
body:`<table class="t"><tr><th>Range</th><th>Meaning</th></tr><tr><td>2xx</td><td>Success: 200 OK, 201 Created, 204 No Content</td></tr><tr><td>3xx</td><td>Look elsewhere (redirects)</td></tr><tr><td>4xx</td><td>Your request is wrong: 400 bad, 401 who are you, 403 not allowed, 404 not found, 405 wrong method, 422 invalid values, 429 slow down</td></tr><tr><td>5xx</td><td>The server failed: 500, 503</td></tr></table><p>Debug rule: <b>4xx means fix your request, 5xx means retry or report it</b>. Always read the body too: good APIs explain the error there.</p>`,
use:["A 404 on your own page means a broken link","A 401 after a day idle means your session token expired","A 503 during a big sale means the server is overloaded"],
go:[["Cause a 405 and a 422 in the Playground","play"],["Debug: 404 Hunt","m:d404"]],q:["You get a 422. What happened?",["The server crashed","Valid JSON, but invalid values","Wrong URL"],1]},
{id:"l7",sec:"Staying safe",t:"Authentication",min:4,learn:["401 vs 403","API keys, Basic, Bearer","The login flow"],
body:`<p><b>Authentication</b> = who are you? <b>Authorization</b> = what may you do? A 401 means the first failed; a 403 means the second.</p><table class="t"><tr><th>Type</th><th>How</th></tr><tr><td>API key</td><td><code>X-API-Key: abc123</code> identifies your app</td></tr><tr><td>Basic</td><td><code>Authorization: Basic base64(user:pass)</code></td></tr><tr><td>Bearer token</td><td><code>Authorization: Bearer &lt;token&gt;</code>, obtained by logging in</td></tr><tr><td>OAuth 2.0</td><td>"Sign in with Google": a user grants limited access</td></tr></table><h4>The login flow</h4><p>1) POST credentials to /login. 2) The server replies with a token. 3) You send that token on every later request. Treat tokens like passwords and never put them in public code.</p>`,
use:["Maps and weather APIs use API keys","Every mobile app login ends in a bearer token","'Sign in with GitHub' is OAuth"],
go:[["Beat the API-key lock in the Playground","play"],["Mission: The Token Heist","m:chain"]],q:["After logging in, how does your next request prove who you are?",["It sends the token","The server remembers you","It puts the password in the URL"],0]},
{id:"l8",sec:"Staying safe",t:"Real-world survival",min:4,learn:["Pagination and rate limits","Timeouts and retries","CORS and webhooks"],
body:`<h4>Pagination</h4><p>Big lists come in pages: <code>?limit=20&amp;offset=40</code>, or a cursor.</p><h4>Rate limits</h4><p>APIs cap requests. A <b>429</b> with <code>Retry-After</code> means wait.</p><h4>Timeouts and retries</h4><p>Always set a timeout. Retry GET, PUT and DELETE on 5xx with backoff (1s, 2s, 4s). Do not blindly retry POST: you may create duplicates.</p><h4>CORS</h4><p>A browser-only rule: a web page can read another site's API only if that API allows it. curl and servers are not affected.</p><h4>Webhooks</h4><p>The reverse of an API call: the server calls <i>you</i> when something happens.</p>`,
use:["Infinite scroll uses pagination","Payment providers call your webhook when a charge succeeds","Good clients retry flaky calls automatically"],
go:[["Trigger a 429 and a 500 in the Playground","play"],["Mission: Page Turner","m:pages"]],q:["A 429 response means...",["You are rate limited: wait","Wrong password","The server crashed"],0]}];
BADGES.push(["scholar","Scholar","Complete every Academy lesson",()=>LESSONS.every(l=>st.lessons&&st.lessons[l.id])]);
let lesson=0;
function goTo(c){if(c==="play")return openSandbox();const l=LEVELS.find(x=>x.id===c.slice(2));if(l)startLevel(l);}
function openAcademy(i){if(i!==undefined)lesson=i;showOnly("academy");drawAcademy();}
function drawAcademy(){const L=LESSONS[lesson],done=st.lessons=st.lessons||{};let side="",g="";
 LESSONS.forEach((l,i)=>{if(l.sec!==g){side+=`<p class="muted grp">${l.sec}</p>`;g=l.sec;}side+=`<button class="lv ${i===lesson?"on":""}" data-i="${i}"><b>${l.t}</b>${done[l.id]?"<em>&#10003;</em>":""}</button>`;});
 $("academy").innerHTML=`<div class="acad"><aside><p class="muted">${Object.keys(done).length}/${LESSONS.length} lessons complete</p>${side}</aside><article class="card lesson"><span class="chap">${L.sec} &middot; ${L.min} min read</span><h1>${L.t}</h1><div class="learnbox"><b>You'll learn</b><ul>${L.learn.map(x=>`<li>${x}</li>`).join("")}</ul></div>${L.body}<h3>Where you'll see this at work</h3><ul>${L.use.map(x=>`<li>${x}</li>`).join("")}</ul><h3>Try it now</h3><div class="gos">${L.go.map(x=>`<button class="btn sm" data-go="${x[1]}">${x[0]}</button>`).join("")}</div><div class="quiz"><b>Knowledge check:</b> ${L.q[0]}<div class="opts">${L.q[1].map((o,i)=>`<button class="pill opt" data-i="${i}"><b>${"ABC"[i]}</b>${o}</button>`).join("")}</div><div id="aq" class="qfb"></div></div><div class="row between"><button class="link" id="aprev" ${lesson?"":"disabled"}>&larr; Previous</button><button class="btn" id="adone" ${done[L.id]?"":"disabled"}>${done[L.id]?"Completed":"Mark complete"}</button><button class="link" id="anext" ${lesson<LESSONS.length-1?"":"disabled"}>Next &rarr;</button></div></article></div>`;
 const A=$("academy");A.querySelectorAll(".lv").forEach(b=>b.onclick=()=>openAcademy(+b.dataset.i));A.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>goTo(b.dataset.go));
 const opts=[...A.querySelectorAll(".opt")];
 opts.forEach(b=>b.onclick=()=>{if(b.disabled)return;const ok=+b.dataset.i===L.q[2];
  if(ok){b.classList.add("right");opts.forEach(o=>{o.disabled=true;if(o!==b)o.classList.add("dim");});burst(b);$("adone").disabled=false;}else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");}
  $("aq").textContent=ok?"Correct! Now mark the lesson complete.":"Not quite. Re-read the lesson and try again.";$("aq").className="qfb show "+(ok?"good":"bad");});
 $("aprev").onclick=()=>openAcademy(lesson-1);$("anext").onclick=()=>openAcademy(lesson+1);
 $("adone").onclick=()=>{if(done[L.id])return;done[L.id]=1;st.xp+=10;const nb=grantBadges();save();renderStats();toast("+10 XP"+(nb.length?" - New badge: "+nb.join(", "):""));drawAcademy();};}
