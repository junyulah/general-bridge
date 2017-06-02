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

module.exports = (packer, box, send, onabort) => {
    // add detect prop
    // TODO if connection closed at this time, should throw an specific exception
    let abortHandler = observe();
    // wait for abort
    onabort(abortHandler);

    let call = detect(funType((name, args = [], type = 'public') => {
        // data = {id, source, time}
        let {
            data, result
        } = packer.packReq(name, args, type, box);

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

    // lambda support
    call.runLam = (lamDsl) => call('lambda', [dsl.getJson(lamDsl)], 'system');

    call.lamDsl = dsl;

    return call;
};
