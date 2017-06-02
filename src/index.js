'use strict';

let pc = require('./bridge');

let {
    stringify, parseJSON
} = require('./util/serialize');

let mirrorBox = require('./util/mirrorBox');

let mirrorPredicateSet = require('./util/mirrorPredicates');

let callWithAbort = require('./caller/callWithAbort');

module.exports = {
    stringify,
    parseJSON,
    pc,
    callWithAbort,
    mirrorBox,
    mirrorPredicateSet,
    bridge: pc
};
