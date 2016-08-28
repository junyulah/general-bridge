'use strict';

let {pc} = require('./bridge');

let {stringify, parseJSON} = require('./serialize');

module.exports = {
    stringify,
    parseJSON,
    pc
};
