'use strict';

let {
    dsl
} = require('leta');

let {
    likeArray, funType, isFalsy, or, isFunction, isString
} = require('basetype');

let detect = require('./detect');

let observe = require('fun-observer');

let {
    forEach
} = require('bolzano');

let id = v => v;

module.exports = (packer, box, send, {
    onabort = id, waitTime, retryTimes
}) => {
    // add detect prop
    // TODO if connection closed at this time, should throw an specific exception
    let abortHandler = observe();
    // wait for abort
    onabort(abortHandler);

    let call = detect(funType((name, args = [], type = 'public') => {
        let {
            message, receipt
        } = packer.packReq(name, args, type, box);

        send(message);

        // detect aborting
        receipt = abortHandler.during(receipt).then(({
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

        receipt.then(clearCallback).catch(clearCallback);

        return receipt;
    }, [
        isString,
        or(likeArray, isFalsy),
        or(isString, isFalsy)
    ]), {
        waitTime,
        retryTimes
    });

    // lambda support
    call.runLam = (lamDsl) => call('lambda', [dsl.getJson(lamDsl)], 'system');

    call.lamDsl = dsl;

    return call;
};
