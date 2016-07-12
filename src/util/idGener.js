'use strict';

let idGener = () => {
    let count = 0;
    let generateId = () => {
        count++;
        if (count > 10e6) {
            count = 0;
        }
        return count + '' + Math.random(Math.random());
    };
    return generateId;
};

module.exports = idGener;
