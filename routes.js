var express = require('express');
var targz = require('tar.gz');
var router = express.Router();
var ce = require('./commandExecutor');
var config = require('./config');
var winston = require('./log.js');

var mraa = require('mraa'); // important note: MRAA is instable and is the cause of 90% of crashes, there be dragons.
var IMUClass = require('jsupm_lsm9ds0');  // Instantiate an LSM9DS0 using default parameters (bus 1, gyro addr 6b, xm addr 1d)

var gyroAccelCompass = new IMUClass.LSM9DS0();

/* GET home page. */
router.get('/', function (req, res, next) {
    winston.info("Rendering downloader main page");
    res.render('index', {
        title: 'UNICEF monitoring station',
        moduleId: GLOBAL_CONFIG.moduleId,
        serverTime: new Date().getTime()
    });
});

/* GET closeSession. */
router.get('/closeSession', function (req, res, next) {
    winston.info("closing session");
    ce.shellExecutor(config.shellCommands.closeSession, function (error, stdout, stderr) {
        if (!error) {
            winston.info("closing session OK");
            res.send('closeSession: ' + stdout);
        } else {
            winston.error("closing session ERROR\n" + error + "\n" + stdout + "\n" + stderr);
            res.send('error ' + error);
        }
    });

});

var packagesPath = (process.env.MODULE_PACKAGES_DIR || "/tmp" );
/* GET downloadPackages. */
var serveIndex = require('serve-index');
router.use(express.static(__dirname + "/"));

/*
router.use('/download', express.static(packagesPath));
router.use('/download', serveIndex(packagesPath, {
    'icons': true,
    'view': 'details',
    template: __dirname + "/views/download.template.html"
}));
*/

router.get('/download', function (req, res, next) {

    var today = new Date();
    var day = (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getFullYear().toString();
    var fileName = 'imu_data_'+ day +'.tar.gz';
    var filePath = __dirname + '/' + fileName;
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    targz().compress('/media/sdcard/sensor_data', filePath, function(err) {

          if(err)
            console.error('Something is wrong ', err.stack);
        
        res.type('application/tar+gzip');
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.sendFile(filePath);

    });
    
});

/* GET syncTime. */
router.get('/syncTime', function (req, res, next) {
    ce.shellExecutor(config.shellCommands.syncTime + req.query.newTime,
        function (error, stdout, stderr) {
            if (!error) {
                winston.info("Time synchronized\n" + stdout, req.query);
                res.send('Time synchronized.');
            } else {
                winston.error("error time sync " + error + stderr + stdout);
                res.send('error ' + error);
            }
        });
});

/* GET syncTime. */
router.get('/execute', function (req, res, next) {
    ce.shellExecutor(req.query.command,
        function (error, stdout, stderr) {
            if (error) {
                winston.error("Error when executing command " + req.query.command + "\n" + error + stdout + stderr);
            }
            winston.info("Command executed successfully " + req.query.command + "\n" + stdout);
            res.send({stdout: stdout, stderr: stderr, error: error});
        });
});

/* GET hardwareStatus. */
router.get('/status', function (req, res, next) {

    var sensorsOverallStatus = "OK";

    if (gyroAccelCompass.readReg(IMUClass.LSM9DS0.DEV_GYRO, IMUClass.LSM9DS0.REG_WHO_AM_I_G) === 255) {
        errorStatus += " Gyroscope unreachable. "; // if chip failed return false all the time
        sensorsOverallStatus += " Gyroscope FAIL ";
    }
    if (gyroAccelCompass.readReg(IMUClass.LSM9DS0.DEV_XM, IMUClass.LSM9DS0.REG_WHO_AM_I_XM) === 255) {
        errorStatus += " Accelerometer unreachable. "; // if chip failed return false all the time
        sensorsOverallStatus += " Accelerometer FAIL ";
    }

    winston.info("hardware status page");
    res.render('hardwareStatus', {
        title: 'UNICEF monitoring station - hardwareStatus',
        camera: "N/A",
        voltage: "N/A",
        storage: "N/A",
        motion: sensorsOverallStatus,
        touch: "N/A"
    });
});

module.exports = router;
