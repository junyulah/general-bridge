'use strict';

let idGener = require('./idGener');

let messageQueue = () => {
    let queue = {};
    let generateId = idGener();

    let consume = (arg) => {
        let ret = JSON.parse(arg);
        let id = ret.id;
        let item = queue[id];
        if (ret.error) {
            item && item.reject(ret.error);
        } else {
            item && item.resolve(ret.data);
        }
        delete queue[id];
    };

    let produce = (source) => {
        let id = generateId();
        let data = {
            source,
            id,
            time: new Date().getTime()
        };
        let result = new Promise((resolve, reject) => {
            queue[id] = {
                resolve,
                reject
            };
        });
        return {
            data: stringify(data),
            result
        };
    };

    return {
        produce,
        consume
    };
};

let stringify = (data) => {
    try {
        return JSON.stringify(data);
    } catch(err) {
        console && console.log && console.log(data); // eslint-disable-line
        throw err;
    }
};

module.exports = messageQueue;
