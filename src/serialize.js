'use strict';

let log = console && console.log || (v => v); // eslint-disable-line

let stringify = (data) => {
    try {
        return JSON.stringify(data);
    } catch (err) {
        log(`Error happend when stringify data ${data}. Error is ${err}`);
        throw err;
    }
};

let parseJSON = (str) => {
    try {
        return JSON.parse(str);
    } catch (err) {
        log(`Error happend when parse json ${str}. Error is ${err}`);
        throw err;
    }
};

module.exports = {
    parseJSON,
    stringify
};
