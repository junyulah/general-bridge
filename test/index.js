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

    it('support lambda', () => {
        let handler = null;

        let {
            runLam, lamDsl
        } = pc((handle) => {
            handler = handle;
        }, (data) => {
            handler(data);
        }, {
            add: (a, b) => a + b,
            multiple: (a, b) => a * b
        });

        let {
            r, v
        } = lamDsl;

        let add = lamDsl.require('add');
        let multiple = lamDsl.require('multiple');

        return runLam(
            r('x',
                multiple(
                    add(v('x'), 1), 4
                )
            )(4)
        ).then((ret) => {
            assert.equal(ret, 20);
        });
    });
});
