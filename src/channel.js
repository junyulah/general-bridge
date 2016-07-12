'use strict';

module.exports = (channel = '') => {
    if (typeof channel !== 'string') {
        throw new TypeError(`Expect string for channel, but got ${channel}`);
    }

    return {
        frontRequestChannel: `${channel}/front/request`,
        frontResponseChannel: `${channel}/front/response`,
        backRequestChannel: `${channel}/back/request`,
        backResponseChannel: `${channel}/back/response`,
        detectRequestChannel: `${channel}/front/delect`,
        detectResponseChannel: `${channel}/back/detect`
    };
};
