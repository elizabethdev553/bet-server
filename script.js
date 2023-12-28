
(async (WorkerId) => {
    'use strict';

    const scriptURLs = [
    `https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js`,
    ];

    await injGL (scriptURLs);
    await injGL ({sportsTaskDone:{}, casinosTaskDone:{}, sportsGameDetailTasks:{}, sportsGameDataTasks:{}});

    const printLog = false;
    const targetHost = location.host;
    const WorkerIdHash = CryptoJS.SHA256(`Worker${WorkerId}`).toString(CryptoJS.enc.Hex);
    const StatusIdHash = CryptoJS.SHA256(`Status${WorkerId}`).toString(CryptoJS.enc.Hex);
    const userAccounts = await fetch ('https://api.playcasinos.stream/script/userAccounts.json//').then(response => response.json());

    console.log ('WorkerId:', WorkerId );
    console.log ('TargetHost:', targetHost );

    const isObject = (o) => typeof o === 'object' && !Array.isArray(o);
    const isValidJson = (s) => {try{JSON.parse(s);return true;}catch(e){return false;}}
    const isNotEmptyObject = (o) => typeof o === 'object' && o !== null && Object.keys(o).length > 0;
    const genStatus = async (k=StatusIdHash) => ({ [`${k}`]: JSON.stringify({ lastOnline: Date.now() }) });

    const trim = (s, c) => s.replace (new RegExp(`^[${c.join``}]+|[${c.join``}]+$`, 'g'), '');
    const range = (start, stop, step=1) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
    const gstrb = (from, to, strs, offset=0) => {let offsetStart = strs.indexOf (from, offset);offsetStart = (offsetStart !== -1 ? offsetStart + from.length : offset);let offsetEnd = strs.indexOf (to, offsetStart);offsetEnd = (offsetEnd !== -1 ? offsetEnd : strs.length);return strs.substring (offsetStart, offsetEnd);}
    //const robot = (table,data) => {'use strict';GM.xmlHttpRequest({method:'POST',url:'https://127.0.0.1/robot/'+table,data:data,headers:{'Content-Type':'application/json','Referer':document.location.href},onload:function(response){console.log(response.responseText);}});}
    const robot = async (t,d) => {httpRequest([{url:`https://127.0.0.1/robot/${t}`,method:'POST',headers:{'Content-Type':'application/json','Referer':document.location.href},postData:d}]).then(r=>{console.log(r[0])})};
    const getCookie = () => {'use strict';return Object.fromEntries(document.cookie.split('; ').map(v=>v.split(/=(.*)/s).map(decodeURIComponent)));}
    const getImageDataUrl = (e) => {let n=document.createElement('canvas'),a=n.getContext('2d');n.width=e.naturalWidth,n.height=e.naturalHeight,a.drawImage(e,0,0);return n.toDataURL('image/png')}
    //const playcasinos_api_update = (table,data) => {'use strict';GM.xmlHttpRequest({method:'POST',url:'https://api.playcasinos.stream/update/'+table,data:data,headers:{'WorkerId':WorkerId,'Content-Type':'application/json','Referer':document.location.href},onload:function(response){if (printLog??false){console.log (response.responseText);}}});}
    const playcasinos_api_update = async (t,d) => {const r=[{url:`https://api.playcasinos.stream/update/${t}`,method:'POST',headers:{WorkerId:WorkerId,'Content-Type':'application/json',Referer:document.location.href},postData:d}];httpRequest(r).then(t=>{(printLog??false)&&console.log(t[0])}).catch(e=>console.error(e))};
    //const playcasinos_stream_update = (data) => {GM.xmlHttpRequest({method:'GET',url:'https://api.playcasinos.stream/update/stream/'+data,headers:{'Referer':'https://www.playcasinos.stream/'},onload:function(response) {if (printLog??false){console.log (response.responseText);}playcasinos_stream_verify (response.responseText);}});}
    const playcasinos_stream_update = async (d) => {const r=[{url:`https://api.playcasinos.stream/update/stream/${d}`,method:'GET',headers:{Referer:'https://www.playcasinos.stream'}}];httpRequest(r).then(t=>{(printLog??false)&&console.log(t[0]),playcasinos_stream_verify(t[0])}).catch(e=>console.error(e))};

    const playcasinos_stream_verify = (response) => {
        'use strict';
        let streamPlay = JSON.parse (response).data;

        for (let key in streamPlay) {
            let timestamp = Math.floor (Date.now() / 1000);
            //let timestamp = Math.floor (new Date().getTime() / 1000);
            let expires = parseInt(new URLSearchParams(streamPlay[key].endpoint).get('expires')) - timestamp;
            //let expires = new URL(`http://localhost/?${streamPlay[key].endpoint}`).searchParams.get('expires') - timestamp;
            if (expires < 37777 && !['31', 'trio'].includes (key)){
                if (document.location.href != `https://${targetHost}${streamPlay[key].sources}`){document.location.replace (`https://${targetHost}${streamPlay[key].sources}`);}
                console.log (key, 'Expiring:' , (expires < 0 ? `${expires * -1} secs ago` : `in ${expires} secs`));
                break;
            }
        };
    }
    const playcasinos_stream_hack = () => {'use strict';if (printLog??false){console.log(document.querySelector('.casino-video-box iframe:first-child')?.contentDocument?.scripts[2].innerText);}}

    const next_cookie_bypass = () => {let date=new Date();return Math.ceil(((date.getUTCMinutes()*60)+date.getUTCSeconds())/300);}
    const current_cookie_bypass = () => {return get_cookie_bypass()['0'];}
    const set_cookie_cfuvid = (x) => {document.cookie = '_cfuvid='+( x )+'; Expires='+(new Date(Date.now() + 365 * 86400 * 1000).toUTCString())+'; SameSite=Lax; Domain=.'+targetHost+'; Path=/;';}
    const set_cookie_bypass = (x) => {document.cookie = 'bypass='+( JSON.stringify(x) )+'; Expires='+(new Date(Date.now() + 365 * 86400 * 1000).toUTCString())+'; SameSite=Strict; Domain=.'+targetHost+'; Path=/;';}
    const get_cookie_bypass = () => {'use strict';let cookies = getCookie();if (typeof (cookies.bypass) != 'string'){set_cookie_bypass( Object.fromEntries(range(0,12,1).map(item => [item, item])) );cookies = getCookie();}return JSON.parse (cookies.bypass);}

    const httpRequest = async (requests) => {if (!Array.isArray(requests) && typeof requests !== 'object') throw new Error('Invalid parameter format');const isArray = Array.isArray(requests);const requestArray = isArray ? requests : Object.values(requests);const results = await Promise.all(requestArray.map(async (request) => {const { url, method = 'GET', headers = {}, queryParameters = {}, postData = null } = request;const urlWithParams = new URL(url);if (queryParameters) {typeof queryParameters === 'string' ? (urlWithParams.search = queryParameters) : Object.entries(queryParameters).forEach(([key, value]) => urlWithParams.searchParams.append(key, typeof value === 'string' ? value : JSON.stringify(value)));}const options = {method,headers: { Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json', ...headers },body: postData && (typeof postData === 'string' ? postData : JSON.stringify(postData)),};try {const response = await fetch(urlWithParams.toString(), options);if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);return await response.text();} catch (error) {return { error: error.message };}}));return isArray ? results : Object.fromEntries(Object.keys(requests).map((key, index) => [key, results[index]]));};
    const encryptData = (d, k) => (CryptoJS.AES.encrypt(d, k).toString() || null);
    const decryptData = (d, k) => (CryptoJS.AES.decrypt(d, k).toString(CryptoJS.enc.Utf8) || null);
    const buildRequest = (uri,data,key)=>{const r=encryptData(JSON.stringify(data),key);if(r){return{url:`${document.location.origin}/api/front/${uri}`,method:"POST",headers:{"Accept":"application/json, text/plain, */*","Content-Type":"application/json"},postData:JSON.stringify({data:r})};}return null;};
    const buildRequests = (uri,data,key)=>{const requestBuilder=(value)=>buildRequest(uri,value,key);if(Array.isArray(data)){return data.map(requestBuilder);}else if(typeof data==='object'){return Object.fromEntries(Object.entries(data).map(([k,v])=>[k,requestBuilder(v)]));}throw new Error('Invalid parameter format for "data". It should be an array or an object.');};
    const buildTreeDataRequests = (data, key) => buildRequests ('treedata', data, key);
    const buildHighlighthomeRequests = (data, key) => buildRequests ('highlighthome', data, key);
    const buildGameDetailRequests = (data, key) => buildRequests ('gamedetail', data, key);
    const buildGameDataRequests = (data, key) => buildRequests ('gamedata', data, key);
    const buildCasinoDataRequests = (data, key) => buildRequests ('casino/data', data, key);
    const buildCasinoLastresultsRequests = (data, key) => buildRequests ('casino/lastresults', data, key);
    const buildAccStatePopupRequests = (data, key) => buildRequests ('accstatepopup', data, key);

    const sportsTaskHandler = async (t) => { sendTaskDone (t); sportsTaskDone = { ...sportsTaskDone, ...t }; }
    const casinosTaskHandler = async (t) => { sendTaskDone (t); casinosTaskDone = { ...casinosTaskDone, ...t }; }
    const sendTaskDone = async (sd={}, gd={}, rd={ex:7777}) => { if ( socket.readyState === WebSocket.OPEN ) { socket.send (JSON.stringify ({WorkerId:WorkerIdHash,setData:{...await genStatus(), ...sd},getData:gd,redis:rd})); return true; } return false; }

    const objectSlice = (o, s=0, n=10000) => Object.fromEntries(Object.entries(o).slice(s, n));
    const extractMid = (k) => {try{const data=JSON.parse(casinosTaskDone[CryptoJS.SHA256(k).toString(CryptoJS.enc.Hex)]) || {}; return (data?.data?.res?.[0]?.mid) ?? '7777777777777'; } catch (error) { console.error(`An error occurred while parsing JSON: ${error}`); return '7777777777777'; } };
    const extractGmidEtid = (j) => Object.values(JSON.parse(j)?.data||{}).flatMap((a)=>Array.isArray(a)?a.filter((i)=>i?.gmid&&i?.etid):[]).map(({gmid,etid})=>({gmid,etid}));
    const extractGmidEtidMScardOldgmidPort = (j) => {try{const d=JSON.parse(j)?.data||[];return d.map(({etid,gmid,m,scard,oldgmid,port})=>({etid,gmid,m,scard,oldgmid,port}))}catch(e){console.error(`Error parsing JSON:`,e);return []}};
    const mergeArrays = (o) => Object.values(o).filter(Array.isArray).reduce((a,c)=>[...a,...c],[]);
    const filterObjectBy = (o1,o2,v=null,b=false) => Object.fromEntries (Object.entries(o1).filter(([k])=>(o2[k]===v||b)));

    const doTask = async (t, th) => {httpRequest( t ).then((r) => {r = Array.isArray(r) ? r.map(v => decryptData(JSON.parse(v).data, _0x895125)) : typeof r === 'object' && r !== null ? Object.fromEntries(Object.entries(r).map(([k, v]) => [k, decryptData(JSON.parse(v).data, _0x895125)])) : r;th(r);if (printLog??false){console.log(r);}}).catch((error) => {console.error('Error:', error);});}
    const buildInput = (array,uri) => array.reduce((acc,value) => (acc[CryptoJS.SHA256(`${uri}${JSON.stringify(value)}`).toString(CryptoJS.enc.Hex)] = (value), acc),{});
    const sportsbuildKeys1 = () => Object.keys (buildInput ( sportsTasks1[`worker0`].map (value => ({etid:value, type:"all"}) ), "highlighthome"));
    const sportsbuildKeys2 = () => Object.keys (buildInput ( ( sportsTasks2 (10,11,sportsGameDetailTasks)[`worker${WorkerId}`] ?? []).map (value => ({gmid:value.gmid, etid:value.etid}) ), "gamedetail"));
    const sportsbuildKeysValues2 = () => buildInput ( ( sportsTasks2 (10,11,sportsGameDetailTasks)[`worker${WorkerId}`] ?? []).map (value => ({gmid:value.gmid, etid:value.etid}) ), "gamedetail");
    const sportsbuildKeys3 = () => Object.keys (buildInput ( ( mergeArrays(sportsGameDataTasks) ?? []).map (value => ({etid:`${value.etid}`,gmid:`${value.gmid}`,m:value.m,port:value.port,vir:true}) ), "gamedata"));
    const sportsbuildKeysValues3 = () => buildInput ( ( mergeArrays(sportsGameDataTasks) ?? []).map (value => ({etid:`${value.etid}`,gmid:`${value.gmid}`,m:value.m,port:value.port,vir:true}) ), "gamedata");

    const sportsTabs = [4,1,2,10,8,15,18,19,11];
    const sportsTasks1 = sportsTabs.reduce ((acc, value, index) => { const key = `worker${Math.floor(index / 3) + 0}`; (acc[key] = acc[key] || []).push(value); return acc; }, {});
    const sportsTasks2 = (n,s,d) => {const m=mergeArrays(d),u=Math.ceil(m.length/n);return m.reduce((a,v,i)=>{const w=Math.floor(i/u)+s,k=`worker${w}`;(a[k]=a[k]||[]).push(v);return a;},{});};
    const casinosTabs = ['3cardj','aaa','aaa2','ab20','ab3','abj','baccarat','baccarat2','btable','card32','card32eu','cmatch20','cmeter','cmeter1','cricketv3','dt20','dt202','dt6','dtl20','dum10','kbc','lottcard','lucky7','lucky7eu','lucky7eu2','notenum','patti2','poker','poker20','poker6','queen','race17','race2','race20','sicbo','superover','teen','teen1','teen120','teen20','teen2024','teen20b','teen3','teen32','teen6','teen8','teen9','teenmuf','teensin','trap','trio','war','worli','worli2'];
    const casinosTasks1 = casinosTabs.reduce ((acc, value, index) => { const key = `worker${Math.floor(index / 6) + 1}`; (acc[key] = acc[key] || []).push(`${value}`); return acc; }, {});

    const callbackHandler = async (o) => {if (isObject (o)){ const keys=Object.keys(o);for(const key of keys){typeof allCallbacks[key]=='function' && isObject (o[key]) && allCallbacks[key](o[key])}}};
    const allCallbacks = {
        sportsGame: async (o) => {if(isObject (o) && Object.keys (o).join(',') == sportsbuildKeys1().join(',')){allCallbacks.checkListing (o);}else{sendTaskDone ({},{checkListing:sportsbuildKeys1()},{ex:777});}},
        checkListing: async (o) => {if (isObject (o)){ const keys=Object.keys(o);for(const key of keys){if(isValidJson (o[key])){sportsGameDetailTasks[key]=extractGmidEtid(o[key]);}}}sendTaskDone ({},{checkGamedetail1:sportsbuildKeys2()});},
        checkGamedetail1: async (o) => {if (isObject (o)){ doTask ( buildGameDetailRequests(objectSlice ( filterObjectBy ( sportsbuildKeysValues2(), o , null, false), 0, 12), _0x895125), async (sd={}, gd={}, rd={ex:777}) => {sendTaskDone (sd,{updateGamedetail:['pingBack']},{ex:777})} ); }},
        updateGamedetail: async (o) => {sendTaskDone ({},{checkGamedetail2:sportsbuildKeys2()},{ex:777});},
        checkGamedetail2: async (o) => {sportsGameDataTasks={};if (isObject (o)){ const keys=Object.keys(o);for(const key of keys){if(isValidJson (o[key])){sportsGameDataTasks[key]=extractGmidEtidMScardOldgmidPort(o[key]);}}}sendTaskDone ({},{checkUpdateGamedata:sportsbuildKeys3()});},
        checkUpdateGamedata: async (o) => {if (isObject (o)){doTask ( buildGameDataRequests(objectSlice ( filterObjectBy ( sportsbuildKeysValues3(), o , null, false), 0, 12), _0x895125), async (sd={}, gd={}, rd={ex:77}) => {sendTaskDone (sd,{},{ex:77})} ); }},
    };

    var socket;
    const connectWebSocket = async () => {socket = new WebSocket('wss://api.playcasinos.stream/');socket.addEventListener('open', handleSocketOpen);socket.addEventListener('message', handleSocketMessage);socket.addEventListener('close', handleSocketClose);}
    const handleSocketOpen = async (event) => {console.log ('Connected to the WebSocket server.');}
    const handleSocketMessage = async (event) => {const message = (isValidJson (event.data) ? JSON.parse (event.data) : event.data);callbackHandler (message);}
    const handleSocketClose = async (event) => {console.log ('Connection closed. Attempting to reconnect...');setTimeout(connectWebSocket, 2000);}
    connectWebSocket ();

    const conditionW0 = () => typeof (_0x895125) == 'string' && sportsTasks1[`worker0`] && socket.readyState === WebSocket.OPEN;
    const conditionW1toW14 = () => typeof (_0x895125) == 'string' && casinosTasks1[`worker${WorkerId}`] && socket.readyState === WebSocket.OPEN;

    const doTaskW0 = async () => doTask ( buildHighlighthomeRequests(buildInput ( sportsTasks1[`worker0`].map (value => ({etid:value, type:"all"}) ), "highlighthome"), _0x895125), sportsTaskHandler );


    if (WorkerId == 0){
        setTimeout (async () => {'use strict';if ( conditionW0 () ){doTaskW0 ();}}, 7777);
        setInterval (async () => {'use strict';if ( conditionW0 () ){doTask( buildTreeDataRequests(buildInput ( [''].map (value => ( {}) ),"treedata"), _0x895125), sendTaskDone );}}, 7777);
    }
    else if ( (WorkerId >= 1 && WorkerId <= 10) ){
        setInterval (async () => {'use strict';if ( conditionW1toW14 () ){doTask( buildCasinoDataRequests(buildInput ( casinosTasks1[`worker${WorkerId}`].map (value => ( {type:`${value}`}) ), "casino/data" ), _0x895125), casinosTaskHandler );}}, 777);
        setInterval (async () => {'use strict';if ( conditionW1toW14 () ){doTask( buildCasinoLastresultsRequests(buildInput ( casinosTasks1[`worker${WorkerId}`].map (value => ( {gType:`${value}`}) ), "casino/lastresults" ), _0x895125), casinosTaskHandler );}}, 7777);
        setInterval (async () => {'use strict';if ( conditionW1toW14 () ){doTask( buildAccStatePopupRequests(buildInput ( casinosTasks1[`worker${WorkerId}`].map (value => ( {gmid:0, mid:extractMid(`casino/lastresults{"gType":"${value}"}`), gtype: `${value}`, dtype:"cs"}) ),"accstatepopup"), _0x895125), sendTaskDone );}}, 7777);
    }
    else if ( (WorkerId >= 11 && WorkerId <= 20) ){
        setTimeout (async () => {'use strict';if ( conditionW0 () ){doTaskW0 ();}}, 7777);
        setInterval (async () => {'use strict';if ( conditionW0 () ){ allCallbacks.sportsGame (sportsTaskDone);}}, 3777);
        setInterval (async () => {'use strict';if ( conditionW0 () ){doTaskW0 ();}}, 77777);
    }

    setInterval (async () => {
            'use strict';

            let ready = (document.readyState == 'complete');
            let usable = (ready && typeof (_0x895125) == 'string');

            /*
            if (ready){
                console.log (`> var cookie_bypass = get_cookie_bypass() ...`);
                var cookie_bypass = get_cookie_bypass();
                if (cookie_bypass['0'] == '0' || document.title == (`Access denied | ${targetHost} used Cloudflare to restrict access`)){
                    console.log (`> cookie_bypass['0'] = next_cookie_bypass() ...`);
                    cookie_bypass['0'] = next_cookie_bypass();
                    console.log (`> set_cookie_cfuvid (cookie_bypass[cookie_bypass['0']]) ...`);
                    set_cookie_cfuvid (cookie_bypass[cookie_bypass['0']]);
                    console.log (`> set_cookie_bypass (cookie_bypass) ...`);
                    set_cookie_bypass (cookie_bypass);
                    console.log (`> document.location.replace https://${targetHost}/account-statement`);
                    document.location.replace (`https://${targetHost}/account-statement`);
                    return;
                }
            }
            */
            if (ready && document.title == (`Access denied | ${targetHost} used Cloudflare to restrict access`)){

                console.log ('Solving the rate limiting ...');
                //document.cookie = 'g_token='+(Date.now())+'; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain='+targetHost+'; path=/;';
                //document.cookie = '_cfuvid='+(Date.now())+'; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.'+targetHost+'; path=/;';
                //document.cookie = 'cf_clearance='+(Date.now())+'; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.'+targetHost+'; path=/;';
                //console.log ('Clearing all cookies ...');
                //document.location.replace ('https://'+targetHost+'/account-statement');
            }
            else if (usable && document.getElementsByName('username') != undefined && document.getElementsByName ('password') != undefined && document.getElementsByClassName('btn btn-primary btn-block')[0] != undefined && document.getElementsByClassName('btn btn-primary btn-block')[0].textContent == 'Login'){
                
                console.log ('Trying to Log in...');

                if ( userAccounts[WorkerId] !== undefined && userAccounts[WorkerId][targetHost] !== undefined  && userAccounts[WorkerId][targetHost].user !== undefined  && userAccounts[WorkerId][targetHost].pass !== undefined ){
                    //Login as Real User
                    document.getElementsByClassName('btn btn-primary btn-block')[0].click();
                    document.getElementsByName ('username')[0].value=userAccounts[WorkerId][targetHost].user;
                    document.getElementsByName ('password')[0].value=userAccounts[WorkerId][targetHost].pass;
                    //console.log (getImageDataUrl (document.querySelector('.logo-header img')) );
                    document.getElementsByClassName ('btn btn-primary btn-block')[0].click();
                    //Tesseract.recognize(getImageDataUrl(document.querySelector('.logo-header img')),'eng',{logger:i=>console.log(i)}).then(({data:{text}})=>{console.log('Decoded Text:',text);document.getElementById ('validCode').value=text;document.getElementsByClassName('btn btn-primary btn-block')[0].click();}).catch(e=>{console.error('Error:',e);});
                }else{
                    //Login as Demo User
                    document.getElementsByClassName('btn btn-primary btn-block')[1].click();
                }
            }
            else if (usable){

                if (`${WorkerId}` === '0'){playcasinos_stream_update ('security=off&stream&cid&pid&token&expires&options&tag');}

                /*
                console.log ("> cookie_bypass[cookie_bypass['0']] = getCookie()._cfuvid ...");
                cookie_bypass[cookie_bypass['0']] = getCookie()._cfuvid;
                console.log ("> cookie_bypass['0'] = '0' ...");
                cookie_bypass['0'] = '0';
                console.log ("> set_cookie_bypass (cookie_bypass) ...");
                set_cookie_bypass (cookie_bypass);
                */
                
                let profiles = [
                    {key: _0x895125, proxy:'http://streamcasino:Anonymously0@127.0.0.1:17080',ua:window.navigator.userAgent,cookie:document.cookie},
                    {key: _0x895125, proxy:'http://streamcasino:Anonymously0@127.0.0.1:17081',ua:window.navigator.userAgent,cookie:document.cookie},
                ];

                playcasinos_api_update ('profiles/?security=off', JSON.stringify (profiles,null,''));
                console.log ('Updating profiles data...');

                if (document.querySelector('.casino-video-box iframe:first-child')?.contentDocument?.scripts[2] != undefined){

                    playcasinos_stream_hack ();
                    console.log ('Retrieving the current WebSocket endpoint...');
                }
                if (document.cookie.indexOf ('cf_clearance') > -1){

                    let cookies = getCookie();
                    let cf_clearance_times_left = (parseInt(cookies.cf_clearance.split('-')[1])+1234) - Math.floor (Date.now() / 1000);
                    if (cf_clearance_times_left < 0){

                        console.log ('Update cf_clearance Cookie ...');
                        document.cookie = `cf_clearance=${Date.now()}; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${targetHost}; path=/;`;
                        document.location.replace (`https://${targetHost}/account-statement`);
                        //document.location.reload();
                        
                    }
                    else{
                        console.log (`cf_clearance cookie Times Left ${cf_clearance_times_left} seconds...`);
                    }
                }
            }
            else if (ready && document.title == 'Just a moment...'){
                
                robot ('mouse/?security=off', JSON.stringify ([{moveMouse: {x:32, y:104, z:false}, mouseClick: {button:'left', double:false},},{moveMouse: {x:258, y:488, z:false}, mouseClick: {button:'left', double:false},}], null, ''));
                console.log ('Solving the captcha challenge...');
            }
            else{
                console.log (`Not Yet Ready...`);
            }
    }, 9777);

})(_UserScript_WorkerId);
