'use strict';

let {
    stringify, parseJSON, bridge
} = require('../..');

module.exports = {
    reqCaller: (request) => {
        return bridge(null, (msg) => request(stringify(msg)).then(parseJSON));
    },

    midder: (sandbox, options) => {
        let reqHandler = null;

        bridge((handler) => {
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
