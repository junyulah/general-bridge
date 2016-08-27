'use strict';

let front = require('../../apply/process/front');

front('test_process', {
    add: (a, b) => a + b
});
