'use strict';

let {
    bridge
} = require('../..');

module.exports = () => {
    let modules = [];

    /**
     * message center
     */

    let addModule = (name, sandbox, options) => {
        let module = {
            sandbox
        };
        modules[name] = module;

        bridge((handler) => {
            module.dealHandler = ({
                msg, callHandler
            }) => {
                return handler(msg, callHandler);
            };

        }, null, sandbox, options);
    };

    let moduleCaller = (moduleName, options) => {
        let callHandler = null;

        return bridge((handler) => {
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
        }, {}, options);
    };

    return {
        addModule,
        moduleCaller
    };
};
