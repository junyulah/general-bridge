'use strict';

let {
    funType, isFunction
} = require('basetype');

let idgener = require('idgener');

let {
    interpreter
} = require('leta');

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
            }
        },

        sandbox
    };
};
