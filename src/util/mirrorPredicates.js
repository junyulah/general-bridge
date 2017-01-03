'use strict';

let {
    reduce, compact
} = require('bolzano');

let {
    isObject
} = require('basetype');

/**
 * mirror the sandbox for lambda
 */
module.exports = (call, path) => {
    return call('publicBoxMirror', [path], 'system').then((box) => {
        return mirrorPredicateSet(box, path, call.lamDsl);
    });
};

let mirrorPredicateSet = (box, path, lamDsl) => {
    let method = lamDsl.require;

    if (box === 'f') {
        return method(path);
    } else if (isObject(box)) {
        return reduce(box, (prev, item, name) => {
            prev[name] = mirrorPredicateSet(item, compact([path, name]).join('.'), lamDsl);
            return prev;
        }, {});
    }
};
