'use strict';

let {
    caller, dealer
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

        dealer(sandbox, (handler) => {
            module.dealHandler = ({
                msg, callHandler
            }) => {
                return handler(msg, callHandler);
            };
        });
    };

    let moduleCaller = (moduleName) => {
        let callHandler = null;
        return caller((msg) => {
            let module = modules[moduleName];
            if (!module) {
                throw new Error(`do not exist module ${moduleName}`);
            }
            module.dealHandler({
                msg,
                callHandler
            });
        }, (handler) => {
            callHandler = handler;
        });
    };

    return {
        addModule,
        moduleCaller
    };
};
