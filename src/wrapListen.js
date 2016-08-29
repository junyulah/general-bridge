'use strict';

let {
    isPromise
} = require('basetype');

let id = v => v;

let wrapListen = (listen, send) => {
    if (!listen) {
        return (handle) => (data, ret) => {
            if (!isPromise(ret)) {
                throw new Error(`there is no listener and response of send is not a promise. response is ${ret}`);
            }
            ret.then(handle).catch(err => handle(getError(err, data)));
        };
    } else {
        return (handle, sendHandle = send) => {
            listen(handle, sendHandle);
            return id;
        };
    }
};

let getError = (err, data) => {
    return {
        error: err,
        id: data.id
    };
};

module.exports = wrapListen;
