'use strict';

let {
    funType, isFunction
} = require('basetype');

let idgener = require('idgener');

/**
 * expand box
 *  add system box
 */
module.exports = (sandbox) => {
    let callbackMap = {};

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
            }
        },

        sandbox
    };
};
