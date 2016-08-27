'use strict';

let {
    back
} = require('../..');

module.exports = (child, channelName, sandbox) => {
    let listen = (channel, handler) => {
        child.on('message', (arg) => {
            console.log('on back', channel, arg); // eslint-disable-line
            handler(arg);
        });
    };

    let send = (channel, message) => {
        console.log('back', channel, message);
        child.send(message);
    };

    return back(channelName, sandbox, listen, send);
};
