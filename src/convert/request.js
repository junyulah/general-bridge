'use strict';

let bridge = require('../bridge');

/**
 * request: obj -> Promise(obj)
 */
module.exports = (request, options) => {
    return bridge(null, request, null, options);
};
