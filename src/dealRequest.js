'use strict';

let callFunction = require('./callFunction');
let {
    map
} = require('bolzano');

/**
 * deal request data
 *
 * @param type
 *   chose different box
 * @param name
 *   function path
 * @param args
 *   params for function
 * @param box
 *   sandbox
 * @param call
 */
module.exports = ({
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
