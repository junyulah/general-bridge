'use strict';

let {
    fork
} = require('child_process');

let path = require('path');

let back = require('../apply/process/back');

describe('process', () => {
    it('base', () => {
        let child = fork(path.join(__dirname, './fixture/test.js'));
        let {
            call
        } = back(child, 'test_process', {
            sub: (a, b) => a - b
        });

        return call('add', [1, 2]).then(ret => {
            console.log(ret);
        });
    });
});
