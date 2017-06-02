'use strict';

let browserJsEnvTest = require('browser-js-env');
let path = require('path');
let assert = require('assert');
let {
    midder
} = require('../../apply/http');

describe('ajax', () => {
    it('base', (done) => {
        let mid = midder({
            math: {
                add: (a, b) => a + b
            }
        });

        browserJsEnvTest(`module.exports = require("${path.join(__dirname, '../browser/case/base.js')}")`, {
            testDir: path.join(__dirname, '../browser/__test_dir'),
            apiMap: {
                '/api/test': (req, res) => {
                    let chunks = [];

                    req.on('data', (chunk) => {
                        chunks.push(chunk);
                    });

                    req.on('end', () => {
                        mid(chunks.join(''), res);
                    });
                }
            },
            clean: true
        }).then((ret) => {
            assert.deepEqual(ret, 3);
            done();
        });
    });
});
