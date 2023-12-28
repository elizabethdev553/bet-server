'use strict';

const fs = require ('fs');
const os = require ('os');
const Redis = require ('ioredis');

const robot = require ('robotjs');
const cluster = require ('cluster');
const fastify = require ('fastify')({logger: true, http2: true, https: {allowHTTP1: true, key: fs.readFileSync ('./cert/playcasinos.stream/privkey.pem'), cert: fs.readFileSync ('./cert/playcasinos.stream/cert.pem'), ca: fs.readFileSync ('./cert/playcasinos.stream/chain.pem')}});

/*
 * Register the @fastify/cors plugin to enable CORS.
 */
fastify.register (require ('@fastify/cors'),{origin:'*',allowedHeaders:'*',maxAge:86400,});

/*
 * Register the @fastify/websocket plugin with options
*/
fastify.register (require ('@fastify/websocket'), {errorHandler: function (error, conn, req , reply ) {conn.destroy (error);}, options: { maxPayload: 7777777, verifyClient: function (info, next) {if (info.req.headers['host'] !== 'api.playcasinos.stream') {return next(false);}next(true);}},});

/*
 * Configuration for connecting to Redis (local Redis server).
*/
const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
  password: '6b9ed71ca2d152d6171a1c65d5dc95c42f8b1c870ae9a868c636865d95ec4b08',
};

/*
 * Register the @fastify/redis plugin with redisConfig
*/
fastify.register (require ('@fastify/redis'), redisConfig);

const CryptoJS = require ('crypto-js');

const fetch = require ('node-fetch');
const {WebSocket} = require ('ws');
const {HttpsProxyAgent} = require ('https-proxy-agent');
const {SocksProxyAgent} = require ('socks-proxy-agent');

const isObject = (o) => typeof o === 'object' && !Array.isArray(o);
const isValidJson = (s) => {try{JSON.parse(s);return true;}catch(e){return false;}}
const isProcessAlive = (pid) => {try {process.kill(pid, 0);return true;} catch (err) {return false;}}
const isNotEmptyObject = (o) => typeof o === 'object' && o !== null && Object.keys(o).length > 0;

const trim = (s, c) => s.replace (new RegExp(`^[${c.join``}]+|[${c.join``}]+$`, 'g'), '');
const read = (f) => {try {return fs.readFileSync(f, 'utf8');} catch (err) {return null;}}
const write = (f, d, o={encoding:'utf8', flag:'w', mode: 0o666}) => {try {fs.writeFileSync(f, d, o);return true;} catch (err) {return null;}}
const gstrb = (from, to, strs, offset=0) => {let offsetStart = strs.indexOf (from, offset);offsetStart = (offsetStart !== -1 ? offsetStart + from.length : offset);let offsetEnd = strs.indexOf (to, offsetStart);offsetEnd = (offsetEnd !== -1 ? offsetEnd : strs.length);return strs.substring (offsetStart, offsetEnd);}
const uri2path1 = (z) => {let path = {'index':'play/player.html', 'imgvideobg.jpg':'play/img/videobg.jpg', 'jsplayer.min.js':'play/js/player.min.js', 'jsstreamPlay.js':'play/js/streamPlay.js', }[gstrb('/', '/', ((z[2]??'/index/')+(z[3]??'/index/')))]??'index.html';return path;}
const uri2path2 = (z) => {let path = {'script.js':'script.js', 'script.dev.js':'script.dev.js', 'script1.js':'script1.js', 'script2.js':'script2.js', 'wslogger.js':'wslogger.js', 'wslogger.dev.js':'wslogger.dev.js', 'userAccounts.json':'userAccounts.json', }[gstrb('/', '/', ((z[2]??'/index/')+(z[3]??'/index/')))]??'html/index.html';return path;}
const strReplace = (t,w,r) => {if(!Array.isArray(w)){w=[w];r=[r]}const e=w.map(e=>e.replace(/[-/\\^$*+?.()|[\]{}]/g,e=>'\\'+e)),n=new RegExp(e.join('|'),'g');return t.replace(n,e=>r[w.indexOf(e)])};

//range(1, 24, 1);
//range('A'.charCodeAt(0), 'Z'.charCodeAt(0), 1).map((x) =>String.fromCharCode(x),);
const range = (start, stop, step=1) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
const sem_get = (key, max=1) => {return range (1, max, 1).map ((i) => (os.tmpdir()+'/.sem.'+key+'.'+i),);}
const sem_acquire = (sem_id) => {for (let i in sem_id){try {if (isProcessAlive(parseInt(read(sem_id[i]))) === false){write (sem_id[i], process.pid.toString());return [sem_id[i]];}} catch (err) {return false;}}return false;}
const sem_release = (sem_id) => {for (let i in sem_id){try {fs.unlinkSync(sem_id[i]);} catch (err) {}}return sem_id;}

const statusCode = {Continue: 100,SwitchingProtocols: 101,Processing: 102,EarlyHints: 103,Ok: 200,Created: 201,Accepted: 202,NonAuthoritativeInformation: 203,NoContent: 204,ResetContent: 205,PartialContent: 206,MultiStatus: 207,AlreadyReported: 208,ImUsed: 226,MultipleChoices: 300,MovedPermanently: 301,Found: 302,SeeOther: 303,NotModified: 304,UseProxy: 305,Unused: 306,TemporaryRedirect: 307,PermanentRedirect: 308,BadRequest: 400,Unauthorized: 401,PaymentRequired: 402,Forbidden: 403,NotFound: 404,MethodNotAllowed: 405,NotAcceptable: 406,ProxyAuthenticationRequired: 407,RequestTimeout: 408,Conflict: 409,Gone: 410,LengthRequired: 411,PreconditionFailed: 412,PayloadTooLarge: 413,UriTooLong: 414,UnsupportedMediaType: 415,RangeNotSatisfiable: 416,ExpectationFailed: 417,ImATeapot: 418,MisdirectedRequest: 421,UnprocessableEntity: 422,Locked: 423,FailedDependency: 424,TooEarly: 425,UpgradeRequired: 426,PreconditionRequired: 428,TooManyRequests: 429,RequestHeaderFieldsTooLarge: 431,UnavailableForLegalReasons: 451,InternalServerError: 500,NotImplemented: 501,BadGateway: 502,ServiceUnavailable: 503,GatewayTimeout: 504,HttpVersionNotSupported: 505,VariantAlsoNegotiates: 506,InsufficientStorage: 507,LoopDetected: 508,NotExtended: 510,NetworkAuthenticationRequired: 511};

/**
 * Filter network interfaces based on a custom prefix and exclusion list.
 * @param {string} prefix - The prefix of the interfaces to include.
 * @param {string[]} exclude - An array of interface names to exclude.
 * @returns {Object} - An object containing the filtered network interfaces.
 */
const filterInterfaces = (prefix = 'tun', exclude = []) => {
  return Object.fromEntries ( Object.entries (os.networkInterfaces ()).filter ( ([name]) => name.startsWith (prefix) && !exclude.includes (name) ) );
}

/*
 * Define the prefix for tun interfaces and excluded interface names
*/
const interfacesPrefix = 'tun';
const excludedInterfaces = ['tun', 'tun0'];

/*
 * Get tuninterfaces that start with the prefix "tun" but exclude "tun" and "tun0"
*/
const tunInterfaces = filterInterfaces (interfacesPrefix, excludedInterfaces);

/*
 * Extract the keys (interface names) from tunInterfaces as an array
*/
const tunInterfaceNames = Object.keys (tunInterfaces);

/*
 * Define variables for rotating through tun interfaces
*/
const maxInterfaces = tunInterfaceNames.length;
var currentInterfaceIndex = maxInterfaces - 1;

/*
 * Functions to Rotate tun interfaces and return the next one
*/
const getNextTunInterface = () => {currentInterfaceIndex = (currentInterfaceIndex + 1) % maxInterfaces;return tunInterfaceNames[currentInterfaceIndex];}

/*
 * Read proxy addresses from the file into an array
*/
const proxyList = fs.readFileSync('./proxylist.txt', 'utf-8').trim().split('\n');

/*
 * Define variables for rotating through proxies
*/
const maxProxies = proxyList.length;
var currentProxyIndex = maxProxies - 1;

/*
 * Functions to Rotate proxy and return the next one
*/
const getNextProxy = () => {currentProxyIndex = (currentProxyIndex + 1) % maxProxies;return proxyList[currentProxyIndex];}

/*
 * This object defines the routes and their associated functions to handle route URIs.
 * Each key in this object represents a route URI, and its corresponding value is the
 * function responsible for handling that route.
 */
const routes = {
    play:async (x, y, z) => {'use strict';let path=uri2path1(z);return {code:200,headers:{'content-type': 'text/html; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body:read('./html/'+path)};},
    script:async (x, y, z) => {'use strict';let path=uri2path2(z);let body=read('./'+path);if (z[2] == 'script1.js'){let Id=gstrb(`/script1.js//WorkerId`, "\n", x.url).trim();body=strReplace(body, [`/script1.js//WorkerId0`, `_UserScript_WorkerId = '0';`], [`/script1.js//WorkerId${Id}`, `_UserScript_WorkerId = '${Id}';`]);}return {code:200,headers:{'content-type': 'application/javascript','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body:body};},
    robot:async (x, y, z) => {'use strict';let sem_id = sem_acquire(sem_get('robot', 1));if(sem_id === false){return ({code:429,headers:{'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body:JSON.stringify ({status:429},null,'\t')});}else if (z[2] == 'mouse' && typeof (x.body) == 'object' && typeof (x.body[0]) == 'object' && Object.keys(x.body[0]).join('|') == 'moveMouse|mouseClick'){for (let key in x.body) {x.body[key].moveMouse.z ? robot.moveMouseSmooth (x.body[key].moveMouse.x, x.body[key].moveMouse.y) : robot.moveMouse (x.body[key].moveMouse.x, x.body[key].moveMouse.y);await new Promise(resolve => setTimeout(resolve, 1234));robot.mouseClick (x.body[key].mouseClick.button, x.body[key].mouseClick.double);}sem_release(sem_id);return ({code:200,headers:{'content-type': 'application/json; charset=utf-8',},body:JSON.stringify (x.body,null,'\t')});}else{sem_release(sem_id);return ({code:404,headers:{'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body:JSON.stringify ({status:404},null,'\t')});}},
    update:async (x, y, z) => {'use strict';write ('./@profiles/latest.json', JSON.stringify ({timestamp:Math.floor (Date.now() / 1000).toString()},null,'\t'));if (z[2] == 'profiles' && typeof (x.body) == 'object' && typeof (x.body[0]) == 'object' && Object.keys(x.body[0]).join('|') == 'key|proxy|ua|cookie'){let profilesfile = './@profiles/' + new URL(x.headers.referer).hostname + (x.headers.workerid) +'.json';let profilesdata;try{profilesdata=JSON.parse(read(profilesfile))}catch(e){profilesdata={}};for(let key in x.body){if(profilesdata != x.body){try {write (profilesfile, JSON.stringify (x.body,null,'\t')); return ({code:200,headers:{'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body:JSON.stringify ({message:'Writing done',data:x.body,},null,'\t')});}catch(error) {console.error(error); return ({code:200,headers:{'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body:JSON.stringify ({message:'An error occurred while writing the profile file.'},null,'\t')});}}else{return ({code:200,headers:{'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body:JSON.stringify ({message:'No changes',data:profilesdata,},null,'\t')});}}}else if (z[2] == 'stream' && typeof (z[3]) == 'string' && [...(new URLSearchParams(z[3]).keys())].slice(1).sort().join('|') == 'cid|expires|options|pid|stream|tag|token') {let {id, ...streamArgs} = Object.fromEntries (new URLSearchParams(z[3]));let playfile = './html/play/js/streamPlay.js';let streamfile = './@stream/streamPlay.json';let streamdata = JSON.parse(read(streamfile));if (streamdata[id] != undefined) {try {streamdata={ ...streamdata, [id]: { ...streamdata[id], endpoint: gstrb ('&', '#END', z[3]) } };write(playfile, "var streamPlay = JSON.parse('"+JSON.stringify(Object.fromEntries(Object.entries(streamdata).map(([key, value]) => [key, { endpoint: value.endpoint }])), null, '')+"');");write(streamfile, JSON.stringify(streamdata, null, '\t'));return {code: 200,headers: { 'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body: JSON.stringify({ message: 'Writing done', data: streamdata }, null, '\t')};}catch (error) {console.error(error);return {code: 200,headers: { 'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body: JSON.stringify({ message: 'An error occurred while writing the stream file.' }, null, '\t')};}} else {return {code: 200,headers: { 'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body: JSON.stringify({ message: 'No changes', data: streamdata }, null, '\t')};}}else{return ({code:404,headers:{'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body:JSON.stringify ({status:404},null,'\t')});}},
    checking:async (x, y, z) => {'use strict';if (z[2] == 'running'){return {code:200,headers:{'content-type': 'application/json; charset=utf-8','access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-max-age': 86400,},body:read('./@profiles/latest.json')};}},

    getdata:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'getdata',data:`{}`}); return (source);},
    treedata:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'treedata',data:`{}`}); return (source);},
    userdata:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'userdata',data:`{}`}); return (source);},

    tab_list:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'tablist',data:`{}`}); return (source);},
    table_list:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'tablelist',data:`{}`}); return (source);},
    listing:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'highlighthome',data:`{"etid":${z[2]},"type":"all"}`}); return (source);},
    game_detail:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'gamedetail',data:`{"gmid":${z[3]},"etid":${z[2]}}`}); return (source);},
    game_data:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'gamedata',data:`{"etid":"${z[2]}","gmid":"${z[3]}","m":${z[4]},"port":${z[5]},"vir":true}`}); return (source);},
    scoreboard:async (x, y, z) => {'use strict';let source = await APIs_sportsscore24_com (x, y, z); return (source);},
    cricketvdata:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'cricketvdata',data:`{"gtype":"${z[2]}","gmid":"${z[3]}"}`}); return (source);},

    horsetreedata:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'horsetreedata',data:`{}`}); return (source);},
    buttonlistcs:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'buttonlistcs',data:`{}`}); return (source);},
    casino_book:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'casino/book',data:`{"mid":${z[3]},"gType":"${z[2]}"}`}); return (source);},

    d_rate:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'casino/data',data:`{"type":"${z[2]}"}`}); if (x.url.indexOf ('restructuring=on') != -1){source.body=await restructuring.d_rate(source.body,z);}return (source);},
    v_d_rate:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'vcasino/data',data:`{"type":"${z[2]}"}`}); return (source);},
    l_result:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'casino/lastresults',data:`{"gType":"${z[2]}"}`}); if (x.url.indexOf ('restructuring=on') != -1){source.body=await restructuring.l_result(source.body,z);}return (source);},
    v_l_result:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'vcasino/lastresults',data:`{"gType":"${z[2]}"}`}); return (source);},
    r_result:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'accstatepopup',data:`{"gmid":0,"mid":"${z[3]}","gtype":"${z[2]}","dtype":"cs"}`}); if (x.url.indexOf ('restructuring=on') != -1){source.body=await restructuring.r_result(source.body,z);}return (source);},

    place_bet_casino:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'placebetcasino',data:`{"subType":"${z[2]}","marketId":${z[3]},"sectionId":${z[4]},"subId":${z[5]},"uRate":${z[6]},"bhav":${z[7]},"amount":"${z[8]}","betType":"${z[9]}","gameType":"${z[10]}","nation":"${z[11]}","min":${z[12]},"max":${z[13]},"betStatus":${z[14]}}`}); return (source);return {code:200,headers:{'content-type': 'application/json; charset=utf-8',},body:z};},

    casino_rules:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'casino/rules',data:`{"type":"${z[2]}"}`}); return (source);},
    casino_tablelist:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'casino/tablelist',data:`{"gmid":${z[2]},"ismob":1}`}); return (source);},
    welcomebanners:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'welcomebanners',data:`{}`}); return (source);},
    casino_alllist:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'casino/alllist',data:`{}`}); return (source);},
    casino_launchother:async (x, y, z) => {'use strict';let source = await APIs_247_com (x, y, {uri:'casino/launchother',data:`{"id":"${z[2]}"}`}); return (source);},
}

/*
 * Functions to restructure JSON data for specific APIs.
*/
const restructuring = {
    // This function restructures data for the 'd_rate' API
    d_rate:async (source,z) => {'use strict';let doable = (source.indexOf ('"sub":') > -1);if (doable){source = source.replace (/"sid":|"nat":|"b":|"bs":|"l":|"ls":|"sr":|"subtype":/g, function (x) {let y = {'"sid":': '"mid":"'+JSON.parse(source).data.mid+'","sid":','"nat":': '"nation":','"b":': '"b1":','"bs":': '"bs1":','"l":': '"l1":','"ls":': '"ls1":','"sr":': '"sr":','"subtype":': '"gtype":',};return y[x];});}source = JSON.parse(source);let restructured = (doable ? {success:true,data:{t1:[{mid:source.data.mid,autotime:source.data.lt,remark:'Hi.',desc:source.data.card}],t2:source.data.sub},gtype:z[2],api:'rate',stime:Date.now(),} : {});return JSON.stringify (doable ? restructured : source);},
    // This function restructures data for the 'l_result' API
    l_result:async (source,z) => {'use strict';let doable = (source.indexOf ('"win":"') > -1);if (doable){source = source.replace ('"win":"','"result":"');}source = JSON.parse(source);let restructured = (doable ? {success:true,data:source.data.res,graphdata:null,gtype:z[2],api:'lresult'} : {});return JSON.stringify (doable ? restructured : source);},
    // This function restructures data for the 'r_result' API
    r_result:async (source,z) => {
    'use strict';
    let doable = (source.indexOf('"rid":') > -1);
    if (doable){source = source.replace (/"rid":|"rdesc":|"card":|"win":/g, function (x) {let y = {'"rid":': '"mid":','"rdesc":': '"desc":','"card":': '"cards":','"win":': '"gtype":"'+z[2]+'","win":',};return y[x];});}
    source = JSON.parse (source);
    let restructured = (doable ? {success:true,data:Object.values (source.data),api:'rresult'} : {});
    return JSON.stringify (doable ? restructured : source);},
}

/*
 * WebSocket connection to sportsscore24.com
*/
const APIs_sportsscore24_com = async (x, y, z) => {

    'use strict';

/*
 * Fetch data from Redis using the provided URI and data as the key
*/
    //const { redis } = fastify;
    let data = await fastify.redis.get (CryptoJS.SHA256 (`42["subscribe",{"type":${0 == z[2] ? 2 : z[2]},"rooms":[${parseInt(z[3])}]}]`).toString (CryptoJS.enc.Hex));
/*
 * Check if data was found in Redis
*/
    if (data !== null) {return {code:200,headers:{'data-source': 'cache','content-type': 'application/json; charset=utf-8',},body:data};}
/*
 * Data not found in Redis
*/
    else if (x.url.indexOf ('debugging=on') == -1) {return {code:404,headers:{'data-source': 'default','content-type': 'application/json; charset=utf-8',},body:'{"success":false,"msg":"No Record Found.","status":300}'};}

    let hosts = ['d247.com','gx247.com','martine247.com',];
    let host = hosts[2];

    let profiles = JSON.parse (read (`./@profiles/${host}${cluster.worker.id * 0}.json`));
    let profile = Math.floor (Math.random () * profiles.length);

    let headers = {
        Host: 'sportsscore24.com',
        'User-Agent': profiles[profile].ua,
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        Origin: 'https://d247.com',
        Connection: 'keep-alive, Upgrade',
        'Sec-Fetch-Dest': 'websocket',
        'Sec-Fetch-Mode': 'websocket',
        'Sec-Fetch-Site': 'cross-site',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        'Upgrade': 'websocket',
    };

    var wsStart = Date.now ();
    var wsExpire = wsStart + 59000;
    const ws = new WebSocket ('wss://sportsscore24.com/socket.io/?EIO=3&transport=websocket', {headers: headers,agent: (profiles[profile].proxy.indexOf('http') != -1 ? new HttpsProxyAgent(profiles[profile].proxy) : new SocksProxyAgent(profiles[profile].proxy))});

    var Keep = true;var Timeout = 0;var Response = '[]';
    var UpData = `42["subscribe",{"type":${0 == z[2] ? 2 : z[2]},"rooms":[${parseInt(z[3])}]}]`;

    ws.on ('error', console.error);
    ws.on ('open', function open() {console.log('WebSocket: connected');});
    ws.on ('close', function close() {Keep=false;clearTimeout(Timeout);console.log('WebSocket: disconnected');});
    ws.on ('message', function message(DownData) {DownData = DownData.toString('utf8');console.log('Received:', DownData);
        if (DownData == '3' ){Timeout = setTimeout(function timeout() {console.log('Sent:', '2');ws.send('2');}, 1000);}
        else if (DownData.indexOf ('["update",{"type":') > -1 ){ws.close();clearTimeout(Timeout);Response = DownData.substring (DownData.indexOf ('['));console.log('Time: ', Date.now() - wsStart);}
        else if (DownData.indexOf ('","upgrades":[],"pingInterval":25000,"pingTimeout":5000}') > -1 ){console.log('Sent:', UpData);ws.send(UpData);console.log('Sent:', '2');ws.send('2');}
    });

    do {await new Promise(resolve => setTimeout(resolve, 1000));} while (Response == '[]' && Keep && 100 < parseInt(z[3]) && Date.now() < wsExpire);
    ws.close();clearTimeout(Timeout);

    return {code:200,headers:{'content-type': 'application/json; charset=utf-8',},body:Response};
}

/*
 * Fetches data from APIs_247_com endpoint asynchronously.
*/
const APIs_247_com = async (x, y, z) => {

    'use strict';

/*
 * Fetch data from Redis using the provided URI and data as the key
*/
    //const { redis } = fastify;
    let data = await fastify.redis.get (CryptoJS.SHA256 (z.uri+z.data).toString (CryptoJS.enc.Hex));
/*
 * Check if data was found in Redis
*/
    if (data !== null) {return {code:200,headers:{'data-source': 'cache','content-type': 'application/json; charset=utf-8',},body:data};}
/*
 * Data not found in Redis
*/
    else if (x.url.indexOf ('debugging=on') == -1) {return {code:404,headers:{'data-source': 'default','content-type': 'application/json; charset=utf-8',},body:'{"success":false,"msg":"No Record Found.","status":300}'};}

    let hosts = ['d247.com','gx247.com','martine247.com',];
    let host = hosts[2];

    let profiles = JSON.parse (read (`./@profiles/${host}${cluster.worker.id * 0}.json`));
    let profile = Math.floor (Math.random () * profiles.length);
    if (profiles[profile].cookie.indexOf ('cf_clearance') > -1){

        let cookies = Object.fromEntries(profiles[profile].cookie.split('; ').map(v=>v.split(/=(.*)/s).map(decodeURIComponent)));
        let cf_clearance_times_left = (parseInt(cookies.cf_clearance.split('-')[1])+1600) - Math.floor (Date.now() / 1000);
        if (false && cf_clearance_times_left < 0){routes.robot (({body:[{moveMouse: {x:426, y:185, z:false}, mouseClick: {button:'left', double:false},},{moveMouse: {x:825, y:148, z:false}, mouseClick: {button:'left', double:false},}]}, y, ['','robot','mouse']));}
        else{console.log (`cf_clearance cookie Times Left ${cf_clearance_times_left} seconds...`);}
    }

    let headers = {
        'Host': host,
        'User-Agent': profiles[profile].ua,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        //'Proxy-Authorization': 'Basic c3RyZWFtY2FzaW5vOkFub255bW91c2x5MA==',
        'Content-Type': 'application/json',
        'Origin': `https://${host}`,
        'Connection': 'keep-alive',
        'Referer': `https://${host}/home`,
        'Cookie': profiles[profile].cookie,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
    };

    //let CryptoCfg = {mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.Pkcs7};

    let dataString = `{"data":"${CryptoJS.AES.encrypt(z.data, profiles[profile].key).toString()}"}`;
    //let proxy = getNextProxy();
    //let proxy = proxyList[cluster.worker.id];
    let proxy = proxyList[19];

    let options = {
        method: 'POST',
        headers: headers,
        body: dataString,
        //agent: (profiles[profile].proxy.indexOf('http') != -1 ? new HttpsProxyAgent(profiles[profile].proxy) : new SocksProxyAgent(profiles[profile].proxy)),
        agent: (proxy.indexOf ('http') !== -1 ? new HttpsProxyAgent (proxy) : new SocksProxyAgent (proxy)),
    };

    return await fetch(`https://${host}/api/front/${z.uri}`, options)
    .then ( async response => { options.agent=proxy; return ( await response.status == 200 ? {code:await response.status,headers:{'data-source': 'api','content-type': 'application/json; charset=utf-8',},body:CryptoJS.AES.decrypt(JSON.parse(await response.text()).data, profiles[profile].key).toString(CryptoJS.enc.Utf8)} : (x.url.indexOf ('debugging=on') != -1 ? {code:200,headers:{'content-type': 'application/json; charset=utf-8',},body:JSON.stringify ({request:options,response:{code:await response.status,headers:await response.headers.raw(),body:await response.text()}},null,'\t')}: {code:200,headers:{'content-type': 'application/json; charset=utf-8',},body:`{}`}));})
    .catch ( error => console.error ('Error detected:', error) );
}

/* 
 * Set Redis values from key-value pairs in 'o'.
*/
const redisSet = async (o,e=7777) => {const keys=Object.keys(o);for(const key of keys){o[key].indexOf(`{"success":true,"msg":"`) > -1 && fastify.redis.set(key,o[key],'EX',e);}};

/*
 * Fetch values from Redis for subkeys in 'o' and create a structured object.
*/
const redisGet = async (o) => Object.fromEntries (await Promise.all(Object.entries(o).map(async ([k,v]) => [k,Object.fromEntries(await Promise.all(v.map(async (sk) => [sk, await fastify.redis.get(`${sk}`)])))])));

/*
 * Handles incoming HTTPS requests and provides responses asynchronously.
*/
const requestHandler = async (request, reply) => {
    /*
    fastify.log.info({
        ip: request.headers['x-real-ip'] || request.ip,
        ipRaw: request.raw.ip || request.headers['x-connecting-ip'],
        ips: request.headers['x-forwarded-for'] || request.ips,
        ipRemote: request.headers['cf-connecting-ip'] || request.raw.connection.remoteAddress
    });
    */

    let api = (request.url).split('/');
    let security = (request.url.indexOf ('security=off') == -1);
    let whitelist = read ('./whitelist.json');
    let disallowedIP = whitelist.indexOf (`"${request.headers['cf-connecting-ip'] || request.ip}",`) == -1;
    let disallowedReferer = whitelist.indexOf ( (request.headers.referer != undefined ? `"${gstrb('://', '/', request.headers.referer)}",` : '"disallowed.com"') ) == -1;

    if (security && disallowedIP && disallowedReferer) {
        reply.code (403);
        reply.header ('worker-id', cluster.worker.id);
        reply.headers ({ 'content-type': 'application/json; charset=utf-8' });
        reply.send (JSON.stringify ({ status: 403 }));
    } else if (typeof (routes[api[1] ?? 'undefined']) === 'function') {
        let response = await routes[api[1] ?? 'undefined'](request, reply, api);
        reply.code (response.code);
        reply.header ('worker-id', cluster.worker.id);
        reply.headers (response.headers);
        reply.send (response.body);
    } else {
        reply.code (404);
        reply.header ('worker-id', cluster.worker.id);
        reply.headers ({ 'content-type': 'application/json; charset=utf-8' });
        reply.send (JSON.stringify ({ status: 404 }));
    }
};

/*
 * Handles incoming WebSocket messages and responds.
*/
const websocketHandler = async (connection, req) => {
    //const { redis } = fastify;
    connection.socket.on ('message', async (message) => {
        message = message.toString ();

        if (isValidJson (message)){
            message = JSON.parse (message);

            if ( isObject (message.setData) && isObject (message.getData) && message.WorkerId && message.redis?.ex ){
                if (isNotEmptyObject (message.setData)) { redisSet (message.setData,message.redis.ex); }
                if (isNotEmptyObject (message.getData)) { connection.socket.send ( JSON.stringify (await redisGet (message.getData)) ); }
                fastify.redis.get (message.WorkerId).then ( (task) => { if (task !== null) connection.socket.send (task); }).catch ( (error) => { console.error (error); });
            }else{
                connection.socket.send (`{"message":"Access Denied - Please Check Your Permissions"}`);
            }
        }else{
            connection.socket.send (`{"message":"Please only send JSON for input."}`);
        }
    });
}

/*
 * Define the Redis instance
*/
//let redis;

/*
 * Check if the current process is the master process.
*/
if (cluster.isMaster) {

/*
 * Get information about the available CPU cores
*/
    let cpus = require ('os').cpus ();
    let ncpus = require ('os').cpus ().length;

/*
 * Log the number of CPU cores and CPU details
*/
    console.log (`No of cpus: ${ncpus}`);
    console.log (cpus);

/*
 * Fork worker processes, one for each CPU core
*/
    for (let i = 0; i < ncpus; i++) {cluster.fork ();}

/*
 * Event listeners for worker process events
*/
    cluster.on ('fork', (worker) => {console.log (`Worker: ${worker.id} is forked`);});
    cluster.on ('online', (worker) => {console.log (`Worker: ${worker.id} is online`);});
    cluster.on ('listening', (worker, address) => {console.log (`Worker: ${worker.id} is now connected to ${address.address}:${address.port}`);});
    cluster.on ('disconnect', (worker) => {console.log (`Worker: ${worker.id} is disconnected`);});
/*
 * When a worker exits, we create a new worker with the same ID.
 * This ensures that we maintain workers numbered from 1 to the maximum ${ncpus} available CPU cores.
*/
    cluster.on ('exit', (worker, code, signal) => {console.log (`Worker: ${worker.id} (PID: ${worker.process.pid}) exited with code ${code} and signal ${signal}`);cluster.fork ({workerId: worker.id});});

} else {

/*
 * Initialize the Redis instance
*/
    //redis = new Redis(redisConfig);

/*
 * Attach the Redis instance to the Fastify request object
*/
    //fastify.decorateRequest('redis', () => redis);

/*
 * Add an onRequest hook to handle request closure
*/
    fastify.addHook ('onRequest', async (request, reply) => {
        request.raw.on ('close', () => { if ( request.raw.aborted ) { fastify.log.info ('request closed') } });
    });

/*
 * Define WebSocket route handlers
*/
    fastify.register (async (fastify) => {
        fastify.get('/', { websocket: true }, websocketHandler);
    });

/*
 * Set up routes for handling GET and POST requests
*/
    fastify.get ('/*', requestHandler);
    fastify.post ('/*', requestHandler);

/*
 * Start the Fastify server, listening on port 443 and all available network interfaces
*/
    fastify.listen ({ port: 443, host: '0.0.0.0' });

/*
 * Log that the worker process has started
*/
    console.log (`Worker: ${process.pid} started`);

}
