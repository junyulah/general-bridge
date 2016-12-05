'use strict';

let pc = require('./bridge');

let {
    dsl, interpreter
} = require('leta');

/**
 * support lambda
 */
module.exports = (listen, originSend, sandbox) => {
    let interpret = interpreter(sandbox);
    let newBox = {
        lambda: (lambdaJson) => {
            return interpret(lambdaJson);
        }
    };
    let call = pc(listen, originSend, newBox);

    let run = (data) => call('lambda', [dsl.getJson(data)]);

    return {
        require: dsl.require,
        method: dsl.require,
        r: dsl.r,
        v: dsl.v,
        run
    };
};
