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
});
