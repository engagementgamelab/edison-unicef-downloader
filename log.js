var winston = require('winston');
var rebootCount = (process.env.REBOOT_COUNT || "RC");
var loggerFilePath = (process.env.MODULE_PACKAGES_DIR || ".") + "/logs/" + rebootCount + "_downloader.log";

winston.add(require('winston-daily-rotate-file'), {
    filename: loggerFilePath,
    handleExceptions: true,
    humanReadableUnhandledException: true
});
winston.info("Logging to file " + loggerFilePath);
module.exports = winston;