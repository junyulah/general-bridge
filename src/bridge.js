'use strict';

let {
    likeArray, funType, isFalsy, or, isFunction, isString, isObject
} = require('basetype');

let messageQueue = require('consume-queue');

let callFunction = require('./callFunction');

let wrapListen = require('./wrapListen');

let idgener = require('idgener');

let {
    map
} = require('bolzano');

let listenHandler = (reqHandle, resHandle) => ({
    type, data
}, send) => {
    if (type === 'response') {
        return resHandle(data, send);
    } else if (type === 'request') {
        return reqHandle(data, send);
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

    let box = getBox(sandbox);

    // reqData = {id, source, time}
    let reqHandler = ({
        id, source
    }, send) => {
        let sendRes = sender('response', send);

        let ret = dealReq(source, box, call);

        return Promise.resolve(ret).then((ret) => {
            sendRes({
                data: (ret instanceof Error) ? null : ret,
                error: (ret instanceof Error) ? {
                    msg: ret.toString(),
                    stack: ret.stack
                } : null,
                id
            });
            return ret;
        });
    };

    listen = wrapListen(listen, send);

    let listenHandle = listenHandler(reqHandler, consume);

    // data = {id, source, time}
    let sendReq = sender('request', send);

    let watch = listen(listenHandle);

    let call = funType((name, args = [], type = 'public') => {
        // data = {id, source, time}
        let {
            data, result
        } = produce(packReq(name, args, type, box));

        watch(data, sendReq(data));

        return result;
    }, [isString, or(likeArray, isFalsy), or(isString, isFalsy)]);

    // detect connection
    detect(call);

    return call;
}, [or(isFalsy, isFunction), or(isFalsy, isFunction), or(isFalsy, isObject)]);

let getBox = (sandbox) => {
    let box = {
        systembox: {
            detect: () => true,

            addCallback: (callback) => {
                let id = idgener();
                box.callbackMap[id] = callback;
                return id;
            },

            callback: (id, args) => {
                let fun = box.callbackMap[id];
                if (!fun) {
                    throw new Error(`missing callback function for id ${id}`);
                }

                return fun.apply(undefined, args);
            }
        },

        sandbox,
        callbackMap: {}
    };

    return box;
};

let detect = (call) => {
    // detect connection
    call.detect = (tryTimes = 10) => {
        if (tryTimes < 0) return Promise.resolve(false);
        return call('detect', null, 'system').catch(() => {
            return call.detect(--tryTimes);
        });
    };
};

let packReq = (name, args, type, box) => {
    return {
        type,
        name,
        args: map(args || [], (arg) => isFunction(arg) ? {
            type: 'function',
            arg: box.systembox.addCallback(arg)
        } : {
            type: 'jsonItem',
            arg
        })
    };
};

let unPackReq = (source, call) => {
    // process args
    source.args = map(source.args, ({
        type, arg
    }) => type === 'function' ? (...fargs) => call('callback', [arg, fargs], 'system') : arg);

    return source;
};

let dealReq = (source, box, call) => {
    let {
        type, name, args
    } = unPackReq(source, call);
    let sbox = getSBox(box, type);
    if (sbox) {
        return callFunction(sbox, name, args);
    } else {
        return new Error(`missing sandbox for ${type}`);
    }
};

let getSBox = ({
    sandbox, systembox
}, type) => {
    if (type === 'public') {
        return sandbox;
    } else if (type === 'system') {
        return systembox;
    }
    return false;
};

module.exports = {
    pc
};
