'use strict';

let {
    pc
} = require('../..');

let remoteCall = (p, sandbox = {}) => {
    return pc((handler, send) => {
        // listen on data
        p.on('message', (data) => {
            handler(data, send);
        });
    }, (msg) => p.send(msg), sandbox, {
        onabort: (handler) => {
            // if process p exits, abort calling
            p.on('exit', handler);
        }
    });
};

let child = (sandbox) => {
    return remoteCall(process, sandbox);
};

let parent = remoteCall;

module.exports = {
    child,
    parent
};
