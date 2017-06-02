'use strict';

let {
    funType, isFunction, isObject
} = require('basetype');

let uuidV4 = require('uuid/v4');

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
module.exports = (sandbox, {
    supportLambda
}) => {
    let callbackMap = {};

    let interpret = interpreter(sandbox);

    return {
        systembox: {
            detect: () => true,

            addCallback: funType((callback) => {
                let id = uuidV4();
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

            /**
             * support lambda
             */
            lambda: (lambdaJson) => {
                if (!supportLambda) {
                    throw new Error('responser closed lambda support, please try normal calling.');
                }
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
