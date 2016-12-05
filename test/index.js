'use strict';

let {
    pc, lam
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

    it('support lambda', () => {
        let handler = null;

        let {
            run, r, v, method
        } = lam((handle) => {
            handler = handle;
        }, (data) => {
            handler(data);
        }, {
            add: (a, b) => a + b
        });

        let add = method('add');

        return run(
            r('x', add(v('x'), 1))(4)
        ).then((ret) => {
            assert.equal(ret, 5);
        });
    });
});
