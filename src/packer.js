'use strict';

let {
    map
} = require('bolzano');
let messageQueue = require('consume-queue');
let {
    isFunction
} = require('basetype');

let getErrorRes = (err, id) => {
    return {
        error: {
            msg: getErrorMsg(err),
            stack: err.stack,
            data: err.data // carry some data
        },
        id
    };
};

let getErrorMsg = (err) => {
    let str = err.toString();
    let type = str.split(':')[0];
    return str.substring(type.length + 1).trim();
};

/**
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
 */
module.exports = () => {
    let {
        consume, produce
    } = messageQueue();

    /**
     * pack request data
     *
     * @param name
     * @param args
     * @param type String
     *      public (default), system
     */
    let packReq = (name, args, type, box) => {
        let {
            data, result
        } = produce({
            type,
            name,
            args: map(args || [], (arg) => isFunction(arg) ? {
                type: 'function',
                arg: box.systembox.addCallback(arg)
            } : {
                type: 'jsonItem',
                arg
            })
        });

        return {
            data: {
                type: 'request',
                data
            },
            result
        };
    };

    /**
     * unpack request data
     *
     * @param source
     * @param call
     */
    let unPackReq = (requestObj) => {
        return requestObj.data.source;
    };

    let unPackRes = (responseObj) => {
        let data = responseObj.data;
        if (data.error) {
            let err = new Error(data.error.msg);
            // recover stack
            err.stack = data.error.stack;
            // recover data
            err.data = data.error.data;
            data.error = err;
        }
        return consume(data);
    };

    /**
     * pack response data
     *
     * @param ret
     */
    let packRes = (ret, requestObj) => {
        let id = requestObj.data.id;
        return Promise.resolve(ret).then((ret) =>
            (ret instanceof Error) ? getErrorRes(ret, id) : {
                data: ret,
                id
            }
        ).catch(err => getErrorRes(err, id)).then((data) => {
            return {
                type: 'response',
                data
            };
        });
    };

    return {
        packReq,
        unPackReq,
        packRes,
        unPackRes
    };
};
