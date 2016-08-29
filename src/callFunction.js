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

module.exports = (map, name, args) => {
    let fun = get(map, name);
    if (!fun && typeof fun !== 'function') {
        return new Error(`missing function ${name}`);
    } else {
        return apply(fun, args);
    }
};
