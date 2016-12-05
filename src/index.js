'use strict';

let pc = require('./bridge');

let lam = require('./lam');

let {stringify, parseJSON} = require('./util/serialize');

module.exports = {
    stringify,
    parseJSON,
    pc,
    lam
};
