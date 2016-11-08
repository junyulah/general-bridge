'use strict';

// TODO support high order function

let {
    likeArray, funType, isFalsy, or, isFunction, isString, isObject, isPromise
} = require('basetype');

let expandBox = require('./expandBox');

let detect = require('./detect');

let Packer = require('./packer');

let dealReq = require('./dealRequest');

let {
    forEach
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
 *    data: {
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
        packReq, packRes, unPackRes, unPackReq
    } = Packer();

    let box = expandBox(sandbox);

    // data = {id, source, time}
    let listenHandle = (data, sendData) => {
        switch (data.type) {
            case 'response':
                return unPackRes(data);
            case 'request':
                return packRes(
                    dealReq(
                        unPackReq(data, call),
                        box),
                    data
                ).then(sendData || send);
            default:
                break;
        }
    };

    if (listen) {
        listen(listenHandle);
    }

    let catchSendReq = (requestObj) => {
        try {
            let sendRet = send(requestObj);
            if (!listen) {
                defCall(listenHandle, requestObj.data, sendRet);
            }
        } catch (err) {
            packRes(err, requestObj).then(unPackRes);
        }
    };

    let call = funType((name, args = [], type = 'public') => {
        // data = {id, source, time}
        let {
            data, result
        } = packReq(name, args, type, box);

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
