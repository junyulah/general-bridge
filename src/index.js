'use strict';

let pc = require('./bridge');

let {
    stringify, parseJSON
} = require('./util/serialize');

let mirrorBox = require('./util/mirrorBox');

let mirrorPredicateSet = require('./util/mirrorPredicates');

let callWithAbort = require('./caller/callWithAbort');

let convertRequest = require('./convert/request');

module.exports = {
    stringify,
    parseJSON,
    pc,
    callWithAbort,
    mirrorBox,
    mirrorPredicateSet,
    convertRequest,
    bridge: pc
};
