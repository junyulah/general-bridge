'use strict';

// TODO support high order function

let {
    likeArray, funType, isFalsy, or, isFunction, isString, isObject
} = require('basetype');

let messageQueue = require('consume-queue');

let callFunction = require('./callFunction');

let wrapListen = require('./wrapListen');

let idgener = require('idgener');

let {
    map, forEach
} = require('bolzano');

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

        return packRes(ret, id).then(sendRes).then(() => ret);
    };

    listen = wrapListen(listen, send);

    let listenHandle = listenHandler(reqHandler, (ret) => {
        if (ret.error) {
            let err = new Error(ret.error.msg);
            err.stack = ret.error.stack;
            ret.error = err;
        }
        return consume(ret);
    });

    // data = {id, source, time}
    let sendReq = sender('request', send);

    let watch = listen(listenHandle);

    let call = funType((name, args = [], type = 'public') => {
        // data = {id, source, time}
        let {
            data, result
        } = produce(packReq(name, args, type, box));

        watch(data, sendReq(data));

        let clearCallback = () => forEach(args, (arg) => {
            if (isFunction(arg) && arg.onlyInCall) {
                box.systembox.removeCallback(arg);
            }
        });

        result.then(clearCallback).catch(clearCallback);

        return result;
    }, [isString, or(likeArray, isFalsy), or(isString, isFalsy)]);

    // detect connection
    detect(call);

    return call;
}, [or(isFalsy, isFunction), or(isFalsy, isFunction), or(isFalsy, isObject)]);

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

let getBox = (sandbox) => {
    let callbackMap = {};

    return {
        systembox: {
            detect: () => true,

            addCallback: funType((callback) => {
                let id = idgener();
                callback.callId = id;
                callbackMap[id] = callback;
                return id;
            }, [isFunction]),

            callback: (id, args) => {
                let fun = callbackMap[id];
                if (!fun) {
                    throw new Error(`missing callback function for id ${id}`);
                }

                return fun.apply(undefined, args);
            },

            removeCallback: (callback) => {
                delete callbackMap[callback.callId];
            }
        },

        sandbox
    };
};

let detect = (call) => {
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

let packRes = (ret, id) => {
    return Promise.resolve(ret).then((ret) =>
        (ret instanceof Error) ? getErrorRes(ret, id) : {
            data: ret,
            id
        }
    ).catch(err => getErrorRes(err, id));
};

let getErrorRes = (err, id) => {
    return {
        error: {
            msg: getErrorMsg(err),
            stack: err.stack
        },
        id
    };
};

let getErrorMsg = (err) => {
    let str = err.toString();
    let type = str.split(':')[0];
    return str.substring(type.length + 1).trim();
};

module.exports = {
    pc
};
