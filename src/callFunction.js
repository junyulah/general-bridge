'use strict';

let {
    get
} = require('jsenhance');

let apply = (fun, args, id) => {
    try {
        return {
            id,
            data: fun.apply(undefined, args)
        };
    } catch (err) {
        return {
            id,
            error: {
                message: err.toString(),
                stack: err.stack
            }
        };
    }
};

module.exports = (map, reqData) => {
    let {
        id, source
    } = reqData;

    let {
        args, name
    } = source;

    let fun = get(map, name);
    if (!fun && typeof fun !== 'function') {
        return {
            id,
            error: `missing function ${name}`
        };
    } else {
        return apply(fun, args, id);
    }
};
