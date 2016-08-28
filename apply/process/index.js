'use strict';

let {
    caller, dealer
} = require('../..');

const PARENT_REQUEST = 'parent_request';
const PARENT_RESPONSE = 'parent_response';

const CHILD_REQUEST = 'child_request';
const CHILD_RESPONSE = 'child_response';

let child = (sandbox = {}) => {
    dealer(sandbox, (handler) => {
        process.on('message', (data) => {
            if (data.type === PARENT_REQUEST) {
                handler(data.msg, (info) => {
                    process.send({
                        msg: info,
                        type: CHILD_RESPONSE
                    });
                });
            }
        });
    });

    // call
    return caller((msg) => {
        process.send({
            msg,
            type: CHILD_REQUEST
        });
    }, (handler) => {
        process.on('message', (data) => {
            if (data.type === PARENT_RESPONSE) {
                handler(data.msg);
            }
        });
    });
};

let parent = (child, sandbox = {}) => {
    dealer(sandbox, (handler) => {
        child.on('message', (data) => {
            if (data.type === CHILD_REQUEST) {
                handler(data.msg, (info) => {
                    child.send({
                        msg: info,
                        type: PARENT_RESPONSE
                    });
                });
            }
        });
    });
    return caller((msg) => {
        child.send({
            msg,
            type: PARENT_REQUEST
        });
    }, (handler) => {
        child.on('message', (data) => {
            if (data.type === CHILD_RESPONSE) {
                handler(data.msg);
            }
        });
    });
};

module.exports = {
    child,
    parent
};
