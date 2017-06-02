'use strict';

module.exports = (call, {
    waitTime = 1000, retryTimes = 10
} = {}) => {
    let tryCall = () => {
        return Promise.race([
            new Promise((resolve, reject) => {
                setTimeout(reject, waitTime);
            }), call('detect', null, 'system')
        ]);
    };

    // detect connection
    call.detect = (tryTimes = retryTimes) => {
        if (tryTimes < 0) return Promise.resolve(false);

        return tryCall().catch(() => {
            return call.detect(--tryTimes);
        });
    };

    return call;
};
