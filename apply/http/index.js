'use strict';

let {
    dealer, caller, stringify, parseJSON
} = require('../..');

module.exports = {
    reqCaller: (request) => {
        return caller((msg) => request(stringify(msg)).then(parseJSON));
    },

    midder: (sandbox) => {
        let reqHandler = null;

        dealer(sandbox, (handler) => {
            reqHandler = handler;
        });

        return (requestData, res) => {
            requestData = parseJSON(requestData);

            return reqHandler(requestData, (msg) => {
                res.end(stringify(msg));
            });
        };
    }
};
