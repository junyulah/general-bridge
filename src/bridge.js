'use strict';

let {
    funType, isFalsy, or, isFunction, isObject, isPromise
} = require('basetype');

let expandBox = require('./expandBox');

let Packer = require('./packer');

let HandleRequest = require('./handleRequest');

let Caller = require('./caller');

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
    let sender = (originSend) => (requestObj) => {
        try {
            let sendRet = originSend(requestObj);
            if (!listen) {
                if (!isPromise(sendRet)) {
                    throw new Error(`there is no listener and response of sending is not a promise. response is ${sendRet}`);
                }

                // listen for response data
                sendRet.then(listenHandle).catch(err => listenHandle(packer.packRes(err, requestObj)));
            }
        } catch (err) {
            return packer.packRes(err, requestObj).then(packer.unPackRes);
        }
    };

    // data = {id, error, data}
    let send = sender(originSend);
    let packer = Packer();
    let box = expandBox(sandbox, options);
    let call = Caller(packer, box, send, options.onabort || id);
    let handleRequest = HandleRequest(box, packer, call);

    // accept data
    let listenHandle = (data, sendData) => {
        let sendFun = sendData ? sender(sendData) : send;

        switch (data.type) {
            case 'response':
                return packer.unPackRes(data);
            case 'request':
                return handleRequest(data, sendFun);
            default:
                break;
        }
    };

    if (listen) { // listen on the data
        listen(listenHandle);
    }

    return call;
}, [
    or(isFalsy, isFunction),
    or(isFalsy, isFunction),
    or(isFalsy, isObject),
    or(isFalsy, isObject)
]);

let id = v => v;
