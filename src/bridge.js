'use strict';

// TODO support high order function

let {
    likeArray, funType, isFalsy, or, isFunction, isString, isObject, isPromise
} = require('basetype');

let messageQueue = require('consume-queue');

let callFunction = require('./callFunction');

let expandBox = require('./expandBox');

let detect = require('./detect');

let {
    map, forEach
} = require('bolzano');

/**
 * @param listen ((data, send) => ()) => ()
 *
 * when data.type is request
 *
 * data = {
 *   "type": "request",
 *   "data": {
 *       "id": "1476697966359-5-0.9188467286922068",
 *       "source": {
 *           "type": "public",
 *           "name": "add",
 *           "args": [{
 *               "type": "jsonItem",
 *               "arg": 1
 *           }, {
 *               "type": "jsonItem",
 *               "arg": 2
 *           }]
 *       },
 *       "time": 1476697966359
 *   }
 * }
 *
 * when data.type is response
 *
 * data = {
 *   "type": "response",
 *   "data": {
 *       "data": 3,
 *       "id": "1476697966359-5-0.9188467286922068"
 *   }
 * }
 *
 * data = {
 *    type: 'request',
 *    data:{
 *       id: '1476888114830-13-0.31262883761096827',
 *       source: {
 *          type: 'public',
 *          name: 'testCallback',
 *          args: [Object]
 *       },
 *       time: 1476888114830
 *    }
 * }
 * @param send
 * @param sandbox provides interfaces
 */

let pc = funType((listen, send, sandbox) => {
    // data = {id, error, data}
    let {
        consume, produce
    } = messageQueue();

    let box = expandBox(sandbox);

    // reqData = {id, source, time}
    let reqHandler = ({
        id, source
    }, sendData = send) => {
        let sendRes = sender('response', sendData);

        let ret = dealReq(source, box, call);

        return packRes(ret, id).then(sendRes).then(() => ret);
    };

    // data = {id, source, time}
    let sendReq = sender('request', send);

    let listenHandle = ({
        type, data
    }, send) => {
        if (type === 'response') {
            if (data.error) {
                let err = new Error(data.error.msg);
                err.stack = data.error.stack;
                data.error = err;
            }
            return consume(data);
        } else if (type === 'request') {
            return reqHandler(data, send);
        }
    };

    if (listen) {
        listen(listenHandle);
    }

    let catchSendReq = (data) => {
        try {
            let sendRet = sendReq(data);
            if (!listen) {
                defCall(listenHandle, data, sendRet);
            }
        } catch (err) {
            consume({
                id: data.id,
                error: err
            });
        }
    };

    let call = funType((name, args = [], type = 'public') => {
        // data = {id, source, time}
        let {
            data, result
        } = produce(packReq(name, args, type, box));

        catchSendReq(data);

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

let sender = (type, send) => (data) => {
    return send({
        type, data
    });
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

let defCall = (handle, data, ret) => {
    if (!isPromise(ret)) {
        throw new Error(`there is no listener and response of sending is not a promise. response is ${ret}`);
    }
    ret.then(handle).catch(err => handle({
        error: err,
        id: data.id
    }));
};

module.exports = {
    pc
};
