'use strict';

let {
    reqCaller, midder
} = require('../apply/http');
let http = require('http');
let requestor = require('cl-requestor');
let httpRequest = requestor('http');
let assert = require('assert');

describe('http', () => {
    it('base', (done) => {
        let call = reqCaller((str) => {
            return httpRequest({
                hostname: '127.0.0.1',
                path: '/api',
                port: 8088,
                method: 'POST'
            }, str).then(({
                body
            }) => body);
        });

        let mid = midder({
            add: (a, b) => a + b
        });
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
        server.listen(8088, () => {
            call('add', [5, 2]).then(ret => {
                done(assert.equal(ret, 7));
            });
        });
    });
});
