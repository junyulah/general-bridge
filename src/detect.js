'use strict';

module.exports = (call) => {
    let tryCall = () => {
        return Promise.race([
            new Promise((resolve, reject) => {
                setTimeout(reject, 1000);
            }), call('detect', null, 'system')
        ]);
    };
    // detect connection
    call.detect = (tryTimes = 10) => {
        if (tryTimes < 0) return Promise.resolve(false);

        return tryCall().catch(() => {
            return call.detect(--tryTimes);
        });
    };

    return call;
};
