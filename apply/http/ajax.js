'use strict';

let {
    convertRequest, parseJSON, stringify
} = require('../..');

let requestor = (apiPath) => (jsonObj) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(parseJSON(xhr.responseText));
                } else {
                    reject(new Error(`status code is ${xhr.status}`));
                }
            }
        };

        xhr.open('post', apiPath);
        xhr.send(stringify(jsonObj));
    });
};

module.exports = (apiPath) => convertRequest(requestor(apiPath));
