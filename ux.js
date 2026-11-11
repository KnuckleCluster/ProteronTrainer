// Single floating tooltip (no more empty/janky pseudo-element tips), token wallet, screen helpers.
const SCREENS=["intro","primer","map","app","academy","sandbox"];
function showOnly(id){SCREENS.forEach(s=>$(s).classList.toggle("hidden",s!==id));renderModes();window.scrollTo&&window.scrollTo(0,0);}
function hideExtra(){["academy","sandbox"].forEach(i=>$(i).classList.add("hidden"));}
function navMark(){[["academy","n-learn"],["sandbox","n-play"]].forEach(([s,b])=>$(b)&&$(b).classList.toggle("on",!$(s).classList.contains("hidden")));}
document.body.insertAdjacentHTML("beforeend",'<div id="tip" class="tipbox"></div>');
let tipT;
document.addEventListener("mouseover",e=>{const t=e.target.closest&&e.target.closest("[data-tip]"),b=$("tip");clearTimeout(tipT);
 if(!t||!t.dataset.tip.trim()){b.classList.remove("show");return;}
 tipT=setTimeout(()=>{b.textContent=t.dataset.tip;b.classList.add("show");const r=t.getBoundingClientRect(),w=b.offsetWidth,h=b.offsetHeight;
  let top=r.bottom+8;if(top+h>innerHeight-8)top=r.top-h-8;b.style.top=Math.max(8,top)+"px";b.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left))+"px";},220);});
document.addEventListener("mouseout",e=>{const n=e.relatedTarget;if(!n||!n.closest||!n.closest("[data-tip]")){clearTimeout(tipT);$("tip").classList.remove("show");}});
document.addEventListener("scroll",()=>$("tip").classList.remove("show"),true);
document.addEventListener("click",()=>$("tip").classList.remove("show"));
// token wallet: tokens from successful responses are kept (errors can no longer wipe them)
function captureWallet(j){Object.entries(j).forEach(([k,v])=>{if(typeof v==="string"&&/token/i.test(k))wallet[k]=v;});renderWallet();}
const walKey=()=>wallet.accessToken?"accessToken":wallet.token?"token":null;
function renderWallet(){const k=walKey(),el=$("wallet");if(!k){el.classList.add("hidden");return;}
 el.innerHTML=`<b>Token Wallet</b> <span class="muted">saved from your last successful response</span><div class="wrow"><code>${k} = ${wallet[k].slice(0,22)}&hellip;</code><button class="link" data-w="copy">Copy</button>${st.mode==="practice"?"":'<button class="link" data-w="use">Use as Bearer</button>'}<span class="muted">or type <code>{{${k}}}</code> in any field</span></div>`;el.classList.remove("hidden");}
document.addEventListener("click",e=>{const w=e.target.dataset&&e.target.dataset.w;if(!w)return;const k=walKey();
 if(w==="copy"){navigator.clipboard&&navigator.clipboard.writeText(wallet[k]);toast("Token copied");}
 if(w==="use"){renderAuth({type:"bearer",token:wallet[k]});pv();tab("auth");toast("Bearer token filled in");}});
$("resetreq").onclick=()=>{const s=cur.start;$("method").value=s.method;$("url").value=s.url;kvSet("params",s.params);kvSet("headers",s.headers);kvSet("form",[]);renderAuth(s.auth);$("bodyType").value=s.body.type;$("bodyText").value=s.body.text;bodyView();pv();toast("Request reset. Your token wallet is kept.");};
