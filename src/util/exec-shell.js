/*
 * @Description: 
 * @Autor: fage
 * @Date: 2022-07-06 11:01:08
 * @LastEditors: fage
 * @LastEditTime: 2022-07-06 11:01:36
 */
let child_process = require('child_process');

module.exports = myexec;

function myexec(shellCom,cb){
    if (!cb || typeof cb != 'function') {
        return new Promise((resolve, reject) => {
            myexec(shellCom, (err, ret) => {
                err ? reject(err) : resolve(ret);
            });
        });
    }
    child_process.exec(shellCom, cb);
}

