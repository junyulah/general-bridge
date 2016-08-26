'use strict';

let {
    likeArray
} = require('basetype');

let messageQueue = require('consume-queue');

module.exports = ({
    requestChannel,
    responseChannel,
    listen,
    send
}) => {
    let {
        consume, produce
    } = messageQueue();

    listen(responseChannel, (arg) => consume(JSON.parse(arg)));

    let call = (name, args = []) => {
        if (!likeArray(args)) {
            throw new TypeError('Expect array for call\' args.');
        }
        let {
            data, result
        } = produce({
            name,
            args
        });

        //
        send(requestChannel, stringify(data));
        return result;
    };

    return call;
};

let stringify = (data) => {
    try {
        return JSON.stringify(data);
    } catch (err) {
        console && console.log && console.log(data); // eslint-disable-line
        throw err;
    }
};
