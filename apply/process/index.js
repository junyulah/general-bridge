'use strict';

let {
    pc
} = require('../..');

let {
    mergeMap
} = require('bolzano');

let remoteCall = (p, sandbox = {}, options) => {
    return pc((handler, send) => {
        // listen on data
        p.on('message', (data) => {
            handler(data, send);
        });
    }, (msg) => p.send(msg), sandbox, mergeMap({
        onabort: (handler) => {
            // if process p exits, abort calling
            p.on('exit', handler);
        }
    }, options));
};

let child = (sandbox) => {
    return remoteCall(process, sandbox);
};

let parent = remoteCall;

module.exports = {
    child,
    parent
};
