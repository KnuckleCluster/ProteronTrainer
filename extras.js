const STATUS={200:["OK","Success. The body contains what you asked for."],201:["Created","A new resource was made. Typical after POST."],204:["No Content","Worked, nothing to return. Typical after DELETE."],400:["Bad Request","The server couldn't understand the request. Check JSON and required fields."],401:["Unauthorized","The server doesn't know who you are. Add or fix credentials."],403:["Forbidden","We know who you are, but you're not allowed."],404:["Not Found","Nothing lives at this path. Check URL spelling and the id."],405:["Method Not Allowed","This URL doesn't accept that method. Try another verb."],415:["Unsupported Media Type","Wrong or missing Content-Type."],422:["Unprocessable","Right format, invalid values."],429:["Too Many Requests","You're rate limited. Wait, then retry."],500:["Server Error","The server broke. Usually not your fault; retry or report."],503:["Unavailable","Server overloaded or down. Retry later."]};
const LEARNED={
messenger:["GET reads a resource at a path.","Loading a profile page or product details."],
user:["Ids select one item inside a collection.","Fetching the logged-in user's profile."],
filter:["Query params filter results on the server.","Search, 'show only unpaid invoices'."],
pages:["limit and offset page through big lists.","Infinite scroll and any admin table."],
writer:["POST + JSON body creates; 201 means created.","Signup forms, 'Publish' buttons."],
patch:["PATCH changes only the fields you send.","Editing one setting without resending everything."],
gatekeeper:["Basic Auth sends base64(user:pass) in Authorization.","Internal tools and simple service-to-service calls."],
apikey:["API keys identify your app, usually in a header.","Weather, maps and payment APIs."],
chain:["Log in, take the token, send it as Bearer on later calls.","Every mobile app login."],
boss:["Params, auth and body are independent parts of one request.","Any real production API call."],
d404:["404 usually means a typo in the path or id.","The most common bug you'll ever see."],
dverb:["The method decides the action; GET ignores bodies.","Forms that silently do nothing."],
djson:["JSON forbids trailing commas and single quotes.","Hand-written payloads failing with 400."],
dbearer:["No credentials means 401.","Expired or missing tokens in production."],
dauth:["Right credentials, wrong scheme still fails.","Integrating an API whose docs you skimmed."],
dform:["Content-Type tells the server how to parse your body.","Legacy endpoints that expect form data."]};
const PRIMER=[
{t:"What is an API?",h:`<p>An API is a menu of things one program may ask another program to do. You never walk into the kitchen. You order through the waiter.</p><div class="flow"><span>You (client)</span><em>request &rarr;</em><span>Server</span><em>&larr; response</em></div><p class="muted">Every API call is this loop: you ask, the server answers.</p>`,q:["In the restaurant analogy, what is the API?",["The diner","The waiter and menu","The kitchen"],1,"The API is the agreed way to ask."]},
{t:"Anatomy of a request",h:`<div class="cols"><div><b>Method</b><br>What to do: GET, POST, PUT, PATCH, DELETE</div><div><b>URL</b><br>Where: host + path (+ ?query)</div><div><b>Headers</b><br>Metadata: format, credentials</div><div><b>Body</b><br>The data you send (POST/PUT/PATCH)</div></div>`,q:["Which part says WHAT you want to do?",["Method","Header","Body"],0,"GET reads, POST creates, DELETE removes."]},
{t:"Responses and status codes",h:`<div class="cols"><div><b>2xx</b><br>Success</div><div><b>3xx</b><br>Go elsewhere</div><div><b>4xx</b><br>Your request is wrong</div><div><b>5xx</b><br>The server failed</div></div><p class="muted">The body usually explains the details, so always read it.</p>`,q:["You get a 404. Whose turn to fix it?",["Yours: the request is wrong","The server's"],0,"4xx means look at your request first."]},
{t:"Where does my data go?",h:`<div class="cols"><div><b>Path</b><br><code>/users/42</code> picks which one</div><div><b>Query</b><br><code>?role=admin</code> filters a list</div><div><b>Body</b><br>data to create or change</div><div><b>Headers</b><br>auth and format</div></div>`,q:["Where does 'only posts by user 3' belong?",["Body","Query param","Method"],1,"Filters live in the query string."]},
{t:"Proving who you are",h:`<p>HTTP forgets you after every request, so credentials ride along each time: <b>Basic</b> (user:pass), <b>API key</b> (identifies your app), or a <b>Bearer token</b> (from logging in).</p><p><b>401</b> = we don't know you. <b>403</b> = we know you, but no.</p>`,q:["What does a 401 mean?",["You're not authenticated","You're known but not allowed","The server crashed"],0,"Fix your credentials. You're ready for the missions!"]}];
