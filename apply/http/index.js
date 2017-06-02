'use strict';

let {
    stringify, parseJSON, pc
} = require('../..');

module.exports = {
    reqCaller: (request) => {
        return pc(null, (msg) => request(stringify(msg)).then(parseJSON));
    },

    midder: (sandbox, options) => {
        let reqHandler = null;

        pc((handler) => {
            reqHandler = handler;
        }, null, sandbox, options);

        return (requestData, res) => {
            requestData = parseJSON(requestData);

            return reqHandler(requestData, (msg) => {
                res.end(stringify(msg));
            });
        };
    }
};
