'use strict';

let {
    fork
} = require('child_process');

let path = require('path');

let assert = require('assert');

let {
    parent
} = require('../apply/process');

describe('process', () => {
    it('base', () => {
        let child = fork(path.join(__dirname, './fixture/test.js'));

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
        let child = fork(path.join(__dirname, './fixture/test.js'));

        let call = parent(child, {
            sub: (a, b) => a - b
        });

        call('detect', null, 'miss').catch(err => {
            assert.equal(err.msg, 'Error: missing sandbox for miss');
            done();
        });
    });

    it('detect', () => {
        let child = fork(path.join(__dirname, './fixture/test.js'));

        let call = parent(child, {
            sub: (a, b) => a - b
        });

        return call('detect', null, 'system', (ret) => {
            assert.equal(ret, true);
        });
    });

    it('callback', () => {
        let child = fork(path.join(__dirname, './fixture/test.js'));

        let call = parent(child);

        return call('testCallback', [(a, b) => a * b, 3, 4]).then(ret => {
            assert.equal(ret, 12);
        });
    });

});
