'use strict';

let Module = require('../apply/module');

let assert = require('assert');

describe('module', () => {
    it('base', () => {
        let {
            addModule, moduleCaller
        } = Module();

        addModule('math', {
            add: (a, b) => a + b
        });

        let call = moduleCaller('math');

        return Promise.all([
            call('add', [1, 2]).then(ret => {
                assert.equal(ret, 3);
            }),
            call('add', [8, 2]).then(ret => {
                assert.equal(ret, 10);
            })
        ]);
    });
});
