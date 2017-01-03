'use strict';

let {
    pc, mirrorPredicateSet
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

    it('box mirror', () => {
        let handler = null;

        let call = pc((handle) => {
            handler = handle;
        }, (data) => {
            handler(data);
        }, {
            math: {
                add: (a, b) => a + b,
                multiple: (a, b) => a * b
            },
            id: (v) => v
        });

        return call('publicBoxMirror', [], 'system').then(ret => {
            assert.deepEqual(ret, {
                math: {
                    add: 'f',
                    multiple: 'f'
                },
                id: 'f'
            });

            return call('publicBoxMirror', ['math'], 'system').then((ret) => {
                assert.deepEqual(ret, {
                    add: 'f',
                    multiple: 'f'
                });

                return call('publicBoxMirror', ['math.add'], 'system').then((ret) => {
                    assert.deepEqual(ret, 'f');
                });
            }).then(() => {
                return call('publicBoxMirror', ['abcd'], 'system').then((ret) => {
                    assert.deepEqual(ret, null);
                });
            });
        });
    });

    it('lamabda predicate set mirror', () => {
        let handler = null;

        let call = pc((handle) => {
            handler = handle;
        }, (data) => {
            handler(data);
        }, {
            math: {
                add: (a, b) => a + b,
                multiple: (a, b) => a * b
            },
            id: v => v
        });
        let {
            runLam
        } = call;

        return mirrorPredicateSet(call).then(({
            math: {
                add, multiple
            }, id
        }) => {
            return runLam(id(add(multiple(2, 3), 1))).then(ret => {
                assert.deepEqual(ret, 7);
            });
        });
    });
});
