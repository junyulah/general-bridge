'use strict';

let {
    likeArray, funType, isFalsy, or, isFunction, isString, isObject, isPromise
} = require('basetype');

let expandBox = require('./expandBox');

let detect = require('./detect');

let Packer = require('./packer');

let dealReq = require('./dealRequest');

let {
    dsl
} = require('leta');

let {
    forEach
} = require('bolzano');

let observe = require('fun-observer');

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
 *
 * @param listen
 *      listen to the data from other side
 * @param originSend
 *      send data to the other side
 * @param sandbox Object
 *      provides interfaces
 *
 * TODO support on close event
 */

module.exports = funType((listen, originSend, sandbox, options = {}) => {
    options.onabort = options.onabort || id;
    let sender = (originSend) => (requestObj) => {
        try {
            let sendRet = originSend(requestObj);
            if (!listen) {
                if (!isPromise(sendRet)) {
                    throw new Error(`there is no listener and response of sending is not a promise. response is ${sendRet}`);
                }
                // listen for response data
                sendRet.then(listenHandle).catch(err => listenHandle(packRes(err, requestObj)));
            }
        } catch (err) {
            return packRes(err, requestObj).then(unPackRes);
        }
    };

    // data = {id, error, data}
    let send = sender(originSend);

    let {
        packReq, packRes, unPackRes, unPackReq
    } = Packer();

    let box = expandBox(sandbox);

    // data = {id, source, time}
    // accept data
    let listenHandle = (data, sendData) => {
        let sendFun = send;
        if (sendData) {
            sendFun = sender(sendData);
        }
        switch (data.type) {
            case 'response':
                return unPackRes(data);
            case 'request':
                return packRes(
                    dealReq(
                        unPackReq(data),
                        box,
                        call
                    ),
                    data
                ).then(sendFun);
            default:
                break;
        }
    };

    if (listen) {
        listen(listenHandle);
    }

    // add detect prop
    // TODO if connection closed at this time, should throw an specific exception
    let abortHandler = observe();
    // wait for abort
    options.onabort(abortHandler);

    let call = detect(funType((name, args = [], type = 'public') => {
        // data = {id, source, time}
        let {
            data, result
        } = packReq(name, args, type, box);

        send(data);

        // detect aborting
        result = abortHandler.during(result).then(({
            happened,
            ret
        }) => {
            if (happened) {
                let err = new Error(`abort happened during calling. Abrot message is ${ret}`);
                err.type = 'call-abort';
                throw err;
            } else {
                return ret;
            }
        });

        let clearCallback = () => forEach(args, (arg) => {
            if (isFunction(arg) && arg.onlyInCall) {
                box.systembox.removeCallback(arg);
            }
        });

        result.then(clearCallback).catch(clearCallback);

        return result;
    }, [
        isString,
        or(likeArray, isFalsy),
        or(isString, isFalsy)
    ]));

    // detect connection
    detect(call);

    // lambda support
    call.runLam = (lamDsl) => call('lambda', [dsl.getJson(lamDsl)], 'system');

    call.lamDsl = dsl;

    return call;
}, [
    or(isFalsy, isFunction),
    or(isFalsy, isFunction),
    or(isFalsy, isObject),
    or(isFalsy, isObject)
]);

let id = v => v;
