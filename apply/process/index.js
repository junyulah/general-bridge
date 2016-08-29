'use strict';

let {
    pc
} = require('../..');

let remoteCall = (p, sandbox = {}) => {
    return pc((handler, send) => {
        p.on('message', (data) => {
            handler(data, send);
        });
    }, (msg) => p.send(msg), sandbox);
};

let child = (sandbox) => {
    return remoteCall(process, sandbox);
};

let parent = remoteCall;

module.exports = {
    child,
    parent
};
