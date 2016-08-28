'use strict';

let {
    likeArray, funType, isFalsy, or, isFunction, isString, isPromise, isObject
} = require('basetype');

let messageQueue = require('consume-queue');

let callFunction = require('./callFunction');

let id = v => v;

let listenHandler = (reqHandler, resHandler) => ({
    type, data
}, send) => {
    if (type === 'response') {
        return resHandler(data);
    } else if (type === 'request') {
        return reqHandler(data, send);
    }
};

let sender = (type, send) => (data) => {
    return send({
        type, data
    });
};

let wrapListen = (listen) => {
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
        return (handle, send) => {
            listen(handle, send);

            return id;
        };
    }
};

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

    listen = wrapListen(listen);

    // data = {id, error, data}
    let listenHandle = listenHandler(null, consume);

    // data = {id, source, time}
    let sendReq = sender('request', send);

    let watch = listen(listenHandle);

    let sendReqData = (data) => {
        let ret = sendReq(data);
        watch(data, ret);
    };

    let call = funType((name, args = [], type = 'public') => {
        // data = {id, source, time}
        let {
            data, result
        } = produce({
            name, args, type
        });

        //
        sendReqData(data);

        return result;
    }, [isString, or(likeArray, isFalsy), or(isString, isFalsy)]);

    // detect connection
    detect(call);

    return call;
}, [isFunction, or(isFunction, isFalsy)]);

let detect = (call) => {
    // detect connection
    call.detect = (tryTimes = 10) => {
        if (tryTimes < 0) return Promise.resolve(false);
        return call('detect', null, 'system').catch(() => {
            return call.detect(--tryTimes);
        });
    };
};

/**
 * deal
 *      1. can accept message
 *      2. can send message
 *
 * send: string -> void
 * listen: string -> void -> void
 */

let dealer = funType((sandbox = {}, listen) => {
    let box = {
        sandbox,
        systembox: {
            detect: () => true
        }
    };

    // reqData = {id, source, time}
    let handle = (reqData, send) => {
        let sendRes = sender('response', send);

        let sendData = (data) => {
            sendRes(data);
            return data;
        };

        let ret = dealReq(reqData, box);

        if (isPromise(ret.data)) {
            return ret.data.then((inData) => sendData({
                id: ret.id,
                data: inData
            })).catch((err = '') => sendData({
                id: ret.id,
                error: err.toString()
            }));
        } else {
            return sendData(ret);
        }
    };

    // listen for request, and handle it
    listen(listenHandler(handle, null));
}, [or(isObject, isFalsy), isFunction]);

let dealReq = (reqData, {
    sandbox, systembox
}) => {
    let map = null;
    let type = reqData.source.type;
    if (type === 'public') {
        map = sandbox;
    } else if (type === 'system') {
        map = systembox;
    } else {
        let err = new Error(`missing sandbox for ${type}`);
        return {
            error: {
                msg: err.toString(),
                stack: err.stack
            },
            id: reqData.id
        };
    }

    // process args

    return callFunction(map, reqData);
};

module.exports = {
    caller,
    dealer
};
