'use strict';

let {
    likeArray, funType, isFalsy, or, isFunction, isString, isPromise, isObject
} = require('basetype');

let messageQueue = require('consume-queue');

let callFunction = require('./callFunction');

let wrapListen = require('./wrapListen');

let listenHandler = (reqHandler, resHandler) => ({
    type, data
}, send) => {
    if (type === 'response') {
        return resHandler(data, send);
    } else if (type === 'request') {
        return reqHandler(data, send);
    }
};

let sender = (type, send) => (data) => {
    return send({
        type, data
    });
};

let pc = funType((listen, send, sandbox) => {
    // data = {id, error, data}
    let {
        consume, produce
    } = messageQueue();

    listen = wrapListen(listen, send);

    let listenHandle = listenHandler(reqHandler(sandbox), consume);

    // data = {id, source, time}
    let sendReq = sender('request', send);

    let watch = listen(listenHandle);

    let call = funType((name, args = [], type = 'public') => {
        // data = {id, source, time}
        let {
            data, result
        } = produce({
            name, args, type
        });

        watch(data, sendReq(data));

        return result;
    }, [isString, or(likeArray, isFalsy), or(isString, isFalsy)]);

    // detect connection
    detect(call);

    return call;
}, [or(isFalsy, isFunction), or(isFalsy, isFunction), or(isFalsy, isObject)]);

let detect = (call) => {
    // detect connection
    call.detect = (tryTimes = 10) => {
        if (tryTimes < 0) return Promise.resolve(false);
        return call('detect', null, 'system').catch(() => {
            return call.detect(--tryTimes);
        });
    };
};

let reqHandler = (sandbox) => {
    let box = {
        sandbox,
        systembox: {
            detect: () => true
        }
    };

    // reqData = {id, source, time}
    return (reqData, send) => {
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
};

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
    pc
};
