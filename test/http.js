'use strict';

let {
    reqCaller, midder
} = require('../apply/http');
let {
    mirrorBox
} = require('..');
let http = require('http');
let requestor = require('cl-requestor');
let httpRequest = requestor('http');
let assert = require('assert');

let clientCall = () => {
    return reqCaller((str) => {
        return httpRequest({
            hostname: '127.0.0.1',
            path: '/api',
            port: 8088,
            method: 'POST'
        }, str).then(({
            body
        }) => body);
    });
};

let apiServer = (sandbox) => {
    let mid = midder(sandbox);
    let server = http.createServer((req, res) => {
        if (req.url === '/api') {
            let chunks = [];
            req.on('data', (chunk) => {
                chunks.push(chunk);
            });

            req.on('end', () => {
                mid(chunks.join(''), res);
            });
        }
    });
    return new Promise((resolve, reject) => {
        server.listen(8088, (err) => {
            if (err) reject(err);
            else resolve(server);
        });
    });
};

describe('http', () => {
    it('base', () => {
        let call = clientCall();

        return apiServer({
            add: (a, b) => a + b,
            returnUndefined: () => undefined
        }).then((server) => {
            return call('add', [5, 2]).then(ret => {
                assert.equal(ret, 7);
                return call('returnUndefined');
            }).then((ret) => {
                assert.equal(ret === undefined, true);
            }).then(() => {
                server.close();
            });
        });
    });

    it('mirror box', () => {
        let call = clientCall();

        return apiServer({
            math: {
                add: (a, b) => a + b,
                multiple: (a, b) => a * b
            }
        }).then((server) => {
            return mirrorBox(call).then((apis) => {
                return Promise.all([apis.math.add(4, 5), apis.math.multiple(4, 6)]).then(([ret1, ret2]) => {
                    assert.deepEqual(ret1, 9);
                    assert.deepEqual(ret2, 24);
                });
            }).then(() => {
                server.close();
            });
        });
    });
});
