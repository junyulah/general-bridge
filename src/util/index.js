'use strict';

let messageQueue = require('./messageQueue');

let isArray = v => v && typeof v === 'object' && typeof v.length === 'number' && v.length >= 0;

let isPromise = v => v && typeof v === 'object' && typeof v.then === 'function';

module.exports = {
    isArray,
    isPromise,
    messageQueue
};
