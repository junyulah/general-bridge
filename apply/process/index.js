'use strict';

let {
    pc
} = require('../..');

let child = (sandbox = {}) => {
    return pc((handler, send) => {
        process.on('message', (data) => {
            handler(data, send);
        });
    }, (msg) => process.send(msg), sandbox);
};

let parent = (child, sandbox = {}) => {
    return pc((handler, send) => {
        child.on('message', (data) => {
            handler(data, send);
        });
    }, (msg) => child.send(msg), sandbox);
};

module.exports = {
    child,
    parent
};
