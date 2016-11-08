'use strict';

let callFunction = require('./callFunction');

/**
 * deal request data
 *
 * @param source
 * @param box
 * @param call
 */
let dealReq = ({
    type, name, args
}, box) => {
    let sbox = getSBox(box, type);
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
