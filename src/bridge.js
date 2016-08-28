'use strict';

let {
    likeArray, funType, isFalsy, or, isFunction, isString, isPromise, isObject
} = require('basetype');

let {
    get
} = require('jsenhance');

let messageQueue = require('consume-queue');

/**
 * call
 *      1. can send message
 *      2. can accept message
 *
 * send: string -> void
 *
 * listen: (string -> void) -> void
 */

let caller = funType((send, listen) => {
    let {
        consume, produce
    } = messageQueue();

    if (listen) {
        listen(consume);
    }

    return funType((name, args = []) => {
        // data = {id, source, time}
        let {
            data, result
        } = produce({
            name, args
        });

        //
        let ret = send(data);
        if (!listen) {
            ret.then(res => {
                consume(res);
            }).catch(err => {
                consume({
                    error: err,
                    id: data.id
                });
            });
        }

        return result;
    }, [isString, or(likeArray, isFalsy)]);
}, [isFunction, or(isFunction, isFalsy)]);

/**
 * deal
 *      1. can accept message
 *      2. can send message
 *
 * send: string -> void
 * listen: string -> void -> void
 */

let dealer = funType((sandbox, listen) => {
    let handle = (reqData, send) => {
        let ret = getResponseData(sandbox, reqData);
        if (isPromise(ret.data)) {
            return ret.data.then((inData) => {
                let data = {
                    id: ret.id,
                    data: inData
                };
                send(data);
                return data;
            }).catch((err = '') => {
                let data = {
                    id: ret.id,
                    error: err.toString()
                };
                send(data);
                return data;
            });
        } else {
            send(ret);
            return ret;
        }
    };

    // listen for request, and handle it
    listen(handle);
}, [isObject, isFunction]);

let getResponseData = (sandbox, reqData) => {
    let {
        id, source
    } = reqData;

    let {
        args, name
    } = source;

    let fun = get(sandbox, name);
    if (!fun && typeof fun !== 'function') {
        return {
            id,
            error: `missing function ${name}`
        };
    } else {
        return apply(fun, args, id);
    }
};

let apply = (fun, args, id) => {
    try {
        return {
            id,
            data: fun.apply(undefined, args)
        };
    } catch (err) {
        return {
            id,
            error: {
                message: err.toString(),
                stack: err.stack
            }
        };
    }
};

module.exports = {
    caller,
    dealer
};
