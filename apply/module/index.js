'use strict';

let {
    pc
} = require('../..');

module.exports = () => {
    let modules = [];

    /**
     * message center
     */

    let addModule = (name, sandbox) => {
        let module = {
            sandbox
        };
        modules[name] = module;

        pc((handler) => {
            module.dealHandler = ({
                msg, callHandler
            }) => {
                return handler(msg, callHandler);
            };

        }, null, sandbox);
    };

    let moduleCaller = (moduleName) => {
        let callHandler = null;

        return pc((handler) => {
            callHandler = handler;
        }, (msg) => {
            let module = modules[moduleName];
            if (!module) {
                throw new Error(`do not exist module ${moduleName}`);
            }
            module.dealHandler({
                msg,
                callHandler
            });
        });
    };

    return {
        addModule,
        moduleCaller
    };
};
