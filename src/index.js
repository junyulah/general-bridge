'use strict';

let channel = require('./channel'),
    caller = require('./caller'),
    dealer = require('./dealer');

let front = (channelName, sandbox, listen, send) => {
    let {
        frontRequestChannel,
        backResponseChannel,

        backRequestChannel,
        frontResponseChannel,

        detectRequestChannel,
        detectResponseChannel
    } = channel(channelName);

    dealer({
        requestChannel: backRequestChannel,
        responseChannel: frontResponseChannel,
        listen,
        send,
        sandbox
    });

    let detect = ({
        duration,
        maxTry
    } = {}) => new Promise((resolve, reject) => {
        duration = duration || 100;
        maxTry = maxTry || 10;

        send(detectRequestChannel, 'detect');

        let count = 1;
        let flag = true;
        setTimeout(() => {
            if (flag) {
                send(detectRequestChannel, 'detect');
                count++;
                if (count > maxTry) {
                    flag = false;
                }
            } else {
                reject(new Error('timeout'));
            }
        }, duration);

        listen(detectResponseChannel, (arg) => {
            if (arg === 'ok') {
                resolve();
            } else {
                reject(new Error(arg));
            }
        });
    });


    return {
        call: caller({
            requestChannel: frontRequestChannel,
            responseChannel: backResponseChannel,
            listen,
            send
        }),
        detect
    };
};

let back = (channelName, sandbox, listen, send) => {
    let {
        frontRequestChannel,
        backResponseChannel,

        frontResponseChannel,
        backRequestChannel,

        detectRequestChannel,
        detectResponseChannel
    } = channel(channelName);

    dealer({
        requestChannel: frontRequestChannel,
        responseChannel: backResponseChannel,
        listen,
        send,
        sandbox
    });

    listen(detectRequestChannel, () => {
        send(detectResponseChannel, 'ok');
    });

    return {
        call: caller({
            requestChannel: backRequestChannel,
            responseChannel: frontResponseChannel,
            listen,
            send
        })
    };
};

module.exports = {
    front,
    back
};
