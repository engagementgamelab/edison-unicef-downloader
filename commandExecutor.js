var exec = require('child_process').exec;
var winston = require('./log.js');

var ce = {
    scriptExecutor: function (scriptName, callback) {
        winston.info("Executing script: " + scriptName);
        exec('./scripts/' + scriptName, {timeout: 5 * 1000}, callback);
    },
    shellExecutor: function (scriptName, callback) {
        winston.info("Executing shell command: " + scriptName);
        exec(scriptName, {timeout: 5 * 1000}, callback);
    }
}

module.exports = ce;
