'use strict';

let {
    front
} = require('../..');

let listen = (channel, handler) => {
    process.on('message', handler);
};

let send = (channel, message) => {
    console.log('front', channel, message); // eslint-disable-line
    process.send(message);
};

module.exports = (channelName, sandbox) => {
    return front(channelName, sandbox, listen, send);
};
