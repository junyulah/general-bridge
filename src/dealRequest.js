'use strict';

let callFunction = require('./callFunction');
let {
    map
} = require('bolzano');

/**
 * deal request data
 *
 * @param source
 * @param box
 * @param call
 */
let dealReq = ({
    type, name, args
}, box, call) => {
    let sbox = getSBox(box, type);
    // process args
    args = map(args, ({
        type, arg
    }) => type === 'function' ? (...fargs) => call('callback', [arg, fargs], 'system') : arg);

    if (sbox) {
        return callFunction(sbox, name, args);
    } else {
        return new Error(`missing sandbox for ${type}`);
    }
};

let getSBox = ({
    sandbox, systembox
}, type) => {
    if (type === 'public') {
        return sandbox;
    } else if (type === 'system') {
        return systembox;
    }
    return false;
};

module.exports = dealReq;
