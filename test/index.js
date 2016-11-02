'use strict';

let {
    pc
} = require('..');

let assert = require('assert');

describe('index', () => {
    it('call self', () => {
        let handler = null;

        let call = pc((handle) => {
            handler = handle;
        }, (data) => {
            handler(data);
        }, {
            add: (a, b) => a + b
        });

        return call('add', [3, 4]).then((ret) => {
            assert.equal(ret, 7);
        });
    });
});
