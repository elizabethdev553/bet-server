'use strict';

const fs = require ('fs');
const os = require ('os');

const cluster = require ('cluster');
const fastify = require ('fastify');

const requests = require ('./requests.js');

const CryptoJS = require ('crypto-js');

const fetch = require ('node-fetch');
const {WebSocket} = require ('ws');
const {HttpsProxyAgent} = require ('https-proxy-agent');
const {SocksProxyAgent} = require ('socks-proxy-agent');

const read = function (f) {try {return fs.readFileSync(f, 'utf8');} catch (err) {return null;}}
const write = function (f, d, o={encoding:'utf8', flag:'w', mode: 0o666}) {try {fs.writeFileSync(f, d, o);return true;} catch (err) {return null;}}
const gstrb = function (from, to, strs, offset=0){let offsetStart = strs.indexOf (from, offset);offsetStart = (offsetStart !== -1 ? offsetStart + from.length : offset);let offsetEnd = strs.indexOf (to, offsetStart);offsetEnd = (offsetEnd !== -1 ? offsetEnd : strs.length);return strs.substring (offsetStart, offsetEnd);}

//range(1, 24, 1);
//range('A'.charCodeAt(0), 'Z'.charCodeAt(0), 1).map((x) =>String.fromCharCode(x),);
const isProcessAlive = function (pid) {try {process.kill(pid, 0);return true;} catch (err) {return false;}}
const range = (start, stop, step=1) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
const sem_get = function (key, max=1){return range (1, max, 1).map ((i) => (os.tmpdir()+'/.sem.'+key+'.'+i),);}
const sem_acquire = function (sem_id){for (let i in sem_id){try {if (isProcessAlive(parseInt(read(sem_id[i]))) === false){write (sem_id[i], process.pid.toString());return [sem_id[i]];}} catch (err) {return false;}}return false;}
const sem_release = function (sem_id){for (let i in sem_id){try {fs.unlinkSync(sem_id[i]);} catch (err) {}}return sem_id;}

const include = function (x) {eval.apply (global, [x.s ? x.s : read (x.f)]);}

const server = {controller:new AbortController ()};
server.options = {logger: true, http2: true, https: {allowHTTP1: true, key: fs.readFileSync ('./cert/playcasinos.stream/privkey.pem'), cert: fs.readFileSync ('./cert/playcasinos.stream/cert.pem'), ca: fs.readFileSync ('./cert/playcasinos.stream/chain.pem')}};

if (cluster.isMaster) {

    let cpus = require ('os').cpus ();
    let ncpus = require ('os').cpus ().length;

    console.log ('No of cpus:' + ncpus);
    console.log (cpus);

    for (let i = 0; i < ncpus; i++) {cluster.fork ();}

    cluster.on ('fork', function (worker) {console.log ('Worker: ' + worker.id + ' is forked');});
    cluster.on ('online', function (worker) {console.log ('Worker: ' + worker.id + ' is online');});
    cluster.on ('listening', function (worker) {console.log ('Worker: ' + worker.id + ' is listening');});
    cluster.on ('disconnect', function(worker) {console.log ('worker: ' + worker.id + " is disconnected");});
    cluster.on ('exit', function (worker) {console.log ('Worker: ' + worker.id + " is dead");cluster.fork ();});

} else {

    server.fastify = fastify (server.options);

    server.fastify.addHook ('onRequest', async function (request, reply) {
        request.raw.on ('close', () => { if ( request.raw.aborted ) { server.fastify.log.info ('request closed') } });
    });
    server.fastify.get ('/*', async function (request, reply) {

        server.fastify.log.info ({ip: request.headers['x-real-ip'] || request.ip, ipRaw: request.raw.ip || request.headers['x-connecting-ip'], ips: request.headers['x-forwarded-for'] || request.ips, ipRemote: request.headers['cf-connecting-ip'] || request.raw.connection.remoteAddress});

        let api = (request.url + '/null/').split('/');
        let security = (request.url.indexOf ('security=off') == -1);
        let whitelist = read ('./whitelist.json');
        let disallowedIP = whitelist.indexOf ( '"'+(request.headers['cf-connecting-ip'] || request.ip)+'",' ) == -1;
        let disallowedReferer = whitelist.indexOf ( (request.headers.referer != undefined ? '"'+gstrb('://', '/', request.headers.referer)+'",' : 'disallowed.com') ) == -1;

        if (security && disallowedIP && disallowedReferer){

            reply.code (403);
            reply.header ('server', 'fastify');
            reply.headers ({'content-type': 'application/json; charset=utf-8',});
            reply.send (JSON.stringify ({status:403}));

        } else if (typeof (requests.routes[api[1]]) == 'function'){

            let response = await requests.routes[api[1]] (request, reply, api);

            reply.code (response.code);
            reply.header ('server', 'fastify');
            reply.headers (response.headers);
            reply.send (response.body);

        } else {

            reply.code (404);
            reply.header ('server', 'fastify');
            reply.headers ({'content-type': 'application/json; charset=utf-8',});
            reply.send (JSON.stringify ({status:404}));

        }

    });

    server.fastify.post ('/*', async function (request, reply) {

        server.fastify.log.info ({ip: request.headers['x-real-ip'] || request.ip, ipRaw: request.raw.ip || request.headers['x-connecting-ip'], ips: request.headers['x-forwarded-for'] || request.ips, ipRemote: request.headers['cf-connecting-ip'] || request.raw.connection.remoteAddress});

        let api = (request.url + '/null/').split('/');
        let security = (request.url.indexOf ('security=off') == -1);
        let whitelist = read ('./whitelist.json');
        let disallowedIP = whitelist.indexOf ( '"'+(request.headers['cf-connecting-ip'] || request.ip)+'",' ) == -1;
        let disallowedReferer = whitelist.indexOf ( (request.headers.referer != undefined ? '"'+gstrb('://', '/', request.headers.referer)+'",' : 'disallowed.com') ) == -1;

        if (security && disallowedIP && disallowedReferer){

            reply.code (403);
            reply.header ('server', 'fastify');
            reply.headers ({'content-type': 'application/json; charset=utf-8',});
            reply.send (JSON.stringify ({status:403}));

        } else if (typeof (requests.routes[api[1]]) == 'function'){

            let response = await requests.routes[api[1]] (request, reply, api);

            reply.code (response.code);
            reply.header ('server', 'fastify');
            reply.headers (response.headers);
            reply.send (response.body);

        } else {

            reply.code (404);
            reply.header ('server', 'fastify');
            reply.headers ({'content-type': 'application/json; charset=utf-8',});
            reply.send (JSON.stringify ({status:404}));

        }

    });

    server.fastify.listen ({ port: 443, host: '0.0.0.0' });

    console.log ('Worker: ' + process.pid + ' started');

}
