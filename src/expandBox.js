'use strict';

let {
    funType, isFunction, isObject
} = require('basetype');

let idgener = require('idgener');

let {
    interpreter
} = require('leta');

let {
    reduce, get
} = require('bolzano');

/**
 * expand box
 *      add system box
 */
module.exports = (sandbox) => {
    let callbackMap = {};

    let interpret = interpreter(sandbox);

    return {
        systembox: {
            detect: () => true,

            addCallback: funType((callback) => {
                let id = idgener();
                callback.callId = id;
                callbackMap[id] = callback;
                return id;
            }, [isFunction]),

            callback: (id, args) => {
                let fun = callbackMap[id];
                if (!fun) {
                    throw new Error(`missing callback function for id ${id}. args: ${args}.`);
                }

                return fun.apply(undefined, args);
            },

            removeCallback: (callback) => {
                delete callbackMap[callback.callId];
            },

            lambda: (lambdaJson) => {
                return interpret(lambdaJson);
            },

            publicBoxMirror: (path = '') => {
                return boxMirror(get(sandbox, path));
            }
        },

        sandbox
    };
};

let boxMirror = (box) => {
    if (isFunction(box)) {
        return 'f';
    } else if (isObject(box)) {
        return reduce(box, (prev, item, name) => {
            prev[name] = boxMirror(item);
            return prev;
        }, {});
    } else {
        return null;
    }
};
