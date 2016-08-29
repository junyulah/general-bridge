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

    it('missing', (done) => {
        let {
            moduleCaller
        } = Module();

        let call = moduleCaller('math');

        call('add', [1, 2]).catch((err) => {
            assert.equal(err.toString(), 'Error: do not exist module math');
            done();
        });
    });

});
