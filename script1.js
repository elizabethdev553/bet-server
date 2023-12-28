// ==UserScript==
// @name         247
// @namespace    Violentmonkey Scripts
// @version      1
// @description  try to take over the world!
// @author       Sera Ly
// @match        https://*d247.com/*
// @include      https://*gx247.com/*
// @include      https://*bigboys247.com/*
// @include      https://*martine247.com/*
// @updateURL    https://api.playcasinos.stream/script/script2.js/
// @downloadURL  https://api.playcasinos.stream/script/script1.js//WorkerId0
/// @icon         https://www.google.com/s2/favicons?sz=64&domain=sport.com
/// @grant        GM.info
/// @grant        unsafeWindow
/// @grant        GM.openInTab
/// @grant        GM.getResourceUrl
/// @grant        GM.getValue
/// @grant        GM.setValue
/// @grant        GM.listValues
/// @grant        GM.deleteValue
/// @grant        GM.xmlHttpRequest
/// @run-at       document-idle
/// @run-at       document-start
// ==/UserScript==

(async () => {
'use strict';

window.injGL = async (i,r=!0) => {const p=(t,e)=>new Promise((n,o)=>{const i=document.createElement('script');i[t]=e;i.onload=n;i.onerror=o;document.head.appendChild(i)}),o2j=o=>JSON.stringify(o,(o,t)=>typeof t==='function'?t.toString():t);if(Array.isArray(i))await Promise.all(i.map(t=>p('src',t)));else if(typeof i==='object')for(const[t,e]of Object.entries(i))p('textContent',`window.${t}=${o2j(e)}`);if(r)if(Array.isArray(i))for(const t of i){const e=document.querySelectorAll(`script[src^="${t}"]`);e.forEach(t=>t.remove())}else if(typeof i==='object')for(const t of Object.keys(i)){const e=document.querySelectorAll(`script[src^="${t}"], script:not([src])`);e.forEach(t=>t.remove())}};
const devTest = ['', '.dev',][0];

const _UserScript_WorkerId = '0';

injGL ({_UserScript_WorkerId:_UserScript_WorkerId,});

const scriptURLs = [`https://api.playcasinos.stream/script/script${devTest}.js//`, `https://api.playcasinos.stream/script/wslogger${devTest}.js//`,];
const importURLs = (_UserScript_WorkerId === '0' ? scriptURLs : [scriptURLs[0]]);
await injGL (importURLs);

const getHash = async () => {try{return CryptoJS.SHA256(await fetch (scriptURLs[0]).then(r=>r.text())).toString(CryptoJS.enc.Hex)}catch(e){return ''}};
let newscriptHash = await getHash ();
do {newscriptHash = await getHash ();await new Promise(resolve => setTimeout(resolve, 1000));} while (newscriptHash == '');
const scriptHash = newscriptHash;

setInterval (async () => {'use strict';if (document.location.href !== `https://${location.host}/account-statement` || typeof (_0x895125) !== 'string') {console.log('Redirecting...');document.location.replace (`https://${location.host}/account-statement`);}}, 37777);
setInterval (async () => {'use strict';let newscriptHash = await getHash ();console.log(`Hash1:${scriptHash}`, `Hash2:${newscriptHash}`);if ( scriptHash != newscriptHash && newscriptHash.length === 64){console.log('A new update detected!', `Redirecting...`);document.location.replace (`https://${location.host}/account-statement`);}}, 37777);

})();
