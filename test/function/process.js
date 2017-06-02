'use strict';

let {
    fork
} = require('child_process');

let path = require('path');

let assert = require('assert');

let {
    parent
} = require('../../apply/process');

let {
    delay
} = require('jsenhance');

describe('process', () => {
    it('base', () => {
        let child = fork(path.join(__dirname, '../fixture/test.js'));

        let call = parent(child, {
            sub: (a, b) => a - b
        });

        return Promise.all([
            call('add', [1, 2]).then(ret => {
                assert.equal(ret, 3);
            }),

            call('doubleSub', [1, 2]).then(ret => {
                assert.equal(ret, -2);
            })
        ]);
    });

    it('missing sandbox', (done) => {
        let child = fork(path.join(__dirname, '../fixture/test.js'));

        let call = parent(child, {
            sub: (a, b) => a - b
        });

        call('detect', null, 'miss').catch(err => {
            assert.equal(err.toString(), 'Error: missing sandbox for miss');
            done();
        });
    });

    it('error carry some data', (done) => {
        let child = fork(path.join(__dirname, '../fixture/test.js'));

        let call = parent(child, {});

        call('error', null).catch(err => {
            assert.equal(err.data.a, 1);
            done();
        });
    });

    it('reject error carry some data', (done) => {
        let child = fork(path.join(__dirname, '../fixture/test.js'));

        let call = parent(child, {});

        call('rejectError', null).catch(err => {
            assert.equal(err.data.a, 1);
            done();
        });
    });

    it('detect', () => {
        let child = fork(path.join(__dirname, '../fixture/test.js'));

        let call = parent(child, {
            sub: (a, b) => a - b
        });

        return call('detect', null, 'system', (ret) => {
            assert.equal(ret, true);
        });
    });

    it('callback', () => {
        let child = fork(path.join(__dirname, '../fixture/test.js'));

        let call = parent(child);

        return call('testCallback', [(a, b) => a * b, 3, 4]).then(ret => {
            assert.equal(ret, 12);
            return call('callHandler', [2, 5]).then(v => {
                assert.equal(v, 10);
            });
        });
    });

    it('callback2', () => {
        let child = fork(path.join(__dirname, '../fixture/test.js'));

        let call = parent(child);

        let handler = (a, b) => a * b;

        handler.onlyInCall = true;

        return call('testCallback', [handler, 3, 4]).then(ret => {
            assert.equal(ret, 12);

            return call('callHandler', [2, 5]).then(v => {
                assert.equal(v, 10);
            }).catch(err => {
                assert.equal(err.toString().indexOf('missing callback function for id') !== -1, true);
            });
        });
    });

    it('abort', () => {
        let child = fork(path.join(__dirname, '../fixture/test.js'));
        let call = parent(child);

        delay(50).then(() => {
            child.kill('SIGINT');
        });

        return call('delay', [100]).catch(err => {
            assert.equal(err.type, 'call-abort');
        });
    });
});
