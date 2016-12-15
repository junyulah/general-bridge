'use strict';

/**
 * atom calling action for detecting aborting event
 */

const ABORT_EVENT_TYPE = 'abort_happened';

// TODO expand for process, http etc
module.exports = (callClient, onAbort) => {
    let abortResolves = [];

    let detectAbort = () => {
        return new Promise((resolve) => {
            abortResolves.push(resolve);
        });
    };

    onAbort(() => {
        while (abortResolves.length) {
            let resolve = abortResolves.pop();
            resolve();
        }
    });

    return (callFun) => {
        return callClient.detect().then((connected) => {
            if (!connected) {
                throw new Error('timeout, and fail to connect to client.');
            }

            return new Promise((resolve, reject) => {
                detectAbort().then(() => {
                    let err = new Error(ABORT_EVENT_TYPE);
                    err.type = ABORT_EVENT_TYPE;
                    reject(err);
                });
                callFun().then(resolve).catch(reject);
            });
        });
    };
};
