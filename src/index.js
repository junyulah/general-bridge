'use strict';

let {caller, dealer, pc} = require('./bridge');

let {stringify, parseJSON} = require('./serialize');

module.exports = {
    caller,
    dealer,
    stringify,
    parseJSON,
    pc
};
