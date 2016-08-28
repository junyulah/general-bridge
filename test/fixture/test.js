'use strict';

let {
    child
} = require('../../apply/process');

let call = child({
    add: (a, b) => a + b,

    doubleSub: (a, b) => {
        return call('sub', [a, b]).then(res => {
            return res * 2;
        });
    }
});
