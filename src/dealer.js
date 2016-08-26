'use strict';

let {
    isPromise
} = require('basetype');

// TODO support register function
let dealer = ({
    sandbox,
    requestChannel,
    responseChannel,
    listen,
    send
}) => {
    let handle = (arg) => {
        let ret = getResponseData(sandbox, arg);
        if (isPromise(ret.data)) {
            ret.data.then((inData) => {
                send(responseChannel, JSON.stringify({
                    id: ret.id,
                    data: inData
                }));
            }).catch((err = '') => {
                send(responseChannel, JSON.stringify({
                    id: ret.id,
                    error: err.toString()
                }));
            });
        } else {
            send(responseChannel, JSON.stringify(ret));
        }
    };

    // listen for request, and handle it
    listen(requestChannel, handle);
};

let getResponseData = (sandbox, arg) => {
    arg = JSON.parse(arg);
    let {
        id, source
    } = arg;
    let {
        args, name
    } = source;
    let fun = getFun(sandbox, name);
    if (!fun && typeof fun !== 'function') {
        return {
            id,
            error: `missing function ${name}`
        };
    } else {
        return apply(fun, args, id);
    }
};

/**
 * a.b.c
 */
let getFun = (sandbox, name = '') => {
    let parts = name.split('.');
    let parent = sandbox;
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        parent = parent[part];
        // TODO: avoid exception
        if (!parent) return null;
    }
    return parent;
};

let apply = (fun, args, id) => {
    try {
        let data = fun.apply(undefined, args);
        return {
            id,
            data
        };
    } catch (err) {
        return {
            id,
            error: err.stack
        };
    }
};

module.exports = dealer;
