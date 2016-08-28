'use strict';

let {isPromise} = require('basetype');

let id = v => v;

let wrapListen = (listen, send) => {
    if (!listen) {
        return (handle) => (data, ret) => {
            if (!isPromise(ret)) {
                throw new Error(`there is no listener and response of send is not a promise. response is ${ret}`);
            }
            ret.then(handle).catch(err => handle({
                error: err,
                id: data.id
            }));
        };
    } else {
        return (handle, sendHandle = send) => {
            listen(handle, sendHandle);
            return id;
        };
    }
};

module.exports = wrapListen;
