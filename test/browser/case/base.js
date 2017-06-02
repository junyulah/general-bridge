'use strict';

let ajaxCaller = require('../../../apply/http/ajax');

let call = ajaxCaller('/api/test');

module.exports = call('math.add', [1, 2]);
