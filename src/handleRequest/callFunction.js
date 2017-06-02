'use strict';

let {
    get
} = require('jsenhance');

let apply = (fun, args) => {
    try {
        return fun.apply(undefined, args);
    } catch(err) {
        return err;
    }
};

/**
 * execute function from map
 *
 * TODO support lambda
 *
 * @param map Obejct
 * @param name String
 * @param args Array
 */
module.exports = (map, name, args) => {
    let fun = get(map, name);
    if (!fun && typeof fun !== 'function') {
        return new Error(`missing function ${name}`);
    } else {
        return apply(fun, args);
    }
};
