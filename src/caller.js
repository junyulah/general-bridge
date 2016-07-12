'use strict';

let {
    messageQueue, isArray
} = require('./util');

module.exports = ({
    requestChannel,
    responseChannel,
    listen,
    send
}) => {
    let {
        consume, produce
    } = messageQueue();

    listen(responseChannel, consume);

    let call = (name, args = []) => {
        if (!isArray(args)) {
            throw new TypeError('Expect array for call\' args.');
        }
        let {
            data, result
        } = produce({
            name,
            args
        });

        //
        send(requestChannel, data);
        return result;
    };

    return call;
};
