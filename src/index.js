'use strict';

let pc = require('./bridge');

let {stringify, parseJSON} = require('./util/serialize');

module.exports = {
    stringify,
    parseJSON,
    pc
};
