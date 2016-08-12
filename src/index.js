var request = require('request');
var Q = require('q');
var _ = require('lodash');
var winston = require('winston');
var rumBeacon = require('./browserRumBeacon');
var session = require('./sessionData');
var eumUtilities = require('eum-utilities');
var beaconTransforms = {};
var jsErrors = {};



/*************************
 * CHANGE ME
 ************************/
var host = process.env.ECOMM_URL;
var beaconHost = process.env.EUM_URL;
var appDKey =  process.env.EUM_KEY;
var numberOfActiveSessions = process.env.ACTIVE_SESSIONS || 5;
var debugConsole = process.env.DEBUG_CONSOLE || false;
var consoleLevel = process.env.CONSOLE_LOG_LEVEL || 'info';
var logFilePath = process.env.LOG_PATH || ((process.cwd().indexOf('src') !== -1) ? '../logs/' : 'logs/');
var logFileLevel =  process.env.LOG_LEVEL || 'info';
var logFileName = host.replace('http://','') + '-' + process.pid + '-' + Date.now() + '.log';

/**************************
 * ECOMMERCE VARIABLES
 *************************/
var addToCartItems = function(form) {
    var f = _.random(1,14);
    var s = _.random(1,14);

    if (f == s) {
        s+=1;
    } else if (f > s) {
        var t = f;
        f = s;
        s = t;
    }

    var r = _.rangeRight(f,s).reduce( (result, value) => value + ',' + result);
    form.selectedItemId = r;
    return form;
}

var pages = [
    {
        url : host + '/appdynamicspilot/',
        getBeacon : 'getHomepage',
        beaconTransform : 'alterStandardBeacon',
    },
    {
        url : host + '/appdynamicspilot/UserLogin.action',
        form : {
            loginName : 'aleftik',
            password : 'aleftik'
        }
    },
    {
        url : host +  '/appdynamicspilot/ViewItems.action',
        getBeacon : 'getFetchCatalog',
        beaconTransform : 'alterStandardBeacon',
        drop : 5
    },
    {
        url : host + '/appdynamicspilot/ViewCart!addToCart.action',
        form : {
            username : 'aleftik',
            selectedId : 1,
            selectedId : 2,
            selectedItemId:',1,2'
        },
        getBeacon : 'getAddToCart',
        beaconTransform : 'alterStandardBeacon',
        jsError : 'addToCartError',
        drop : 10
    },
    {
        url : host +  '/appdynamicspilot/ViewCart!sendItems.action',
        form : {
            username : 'aleftik'
        },
        getBeacon : 'getCheckout',
        beaconTransform : 'alterStandardBeacon',
        headers : {'appdynamicssnapshotenabled' : 'true'},
        drop : 20
    }
]

var users = [];
var indexOfUsers = 0;

var getPages = function() {
    var user =  users[indexOfUsers];
    pages[1].form.loginName = user.email;
    pages[1].form.password = user.password;
    pages[3].form.username = user.email;
    pages[4].form.username = user.email;
    if (indexOfUsers < (users.length -1)) {
        indexOfUsers++;
    } else {
        indexOfUsers = 0;
    }
    return pages;
}


/*******************************
 * Logging
 *******************************/
var logger = new winston.Logger({
    transports : [
        new (winston.transports.File)({
            name : 'file',
            filename : logFilePath + logFileName,
            level : logFileLevel
        })  ,
        new (winston.transports.Console)({
            name : 'console',
            level : consoleLevel
        })
    ]
});
if (!debugConsole) {
    logger.remove('console');
}

logger.log('info', 'Load script start', {
    beaconHost : process.env.EUM_URL,
    appDKey :  process.env.EUM_KEY,
    host : process.env.ECOMM_URL,
    activeSessions : numberOfActiveSessions,
    debugConsole : debugConsole,
    consoleLevel : consoleLevel,
    logFilePath : logFilePath,
    logFileLevel :  logFileLevel,
    logFileName : logFileName
});
setTimeout(function() {
    logger.log('info','Heartbeat');
}, 10000);


/**************************
 * DONT CHANGE
 *************************/
var _getSteps = null;

var begin = function(pagesToExecute, numberOfSessions) {
    _getSteps = pagesToExecute;
    var numberOfSessions = numberOfSessions || 1;
    for (var i = 1; i <= numberOfSessions; i++) {
        logger.log('info', 'Initiating looping session :' + i);
        startSession(i);
    }
}

var startSession = function(sessionId) {
    var steps = JSON.parse(JSON.stringify(typeof(_getSteps) === 'function' ? _getSteps() : _getSteps));
    var sessionData = getSession();
    sessionData.sessionId = sessionId;
    logger.log('info','New session start for Id ' + sessionId, sessionData);
    nextStep(steps, request.jar(), sessionData);
}

var nextStep = function(steps, jar, sessionData) {

    var currentPage = steps.shift();

    if (currentPage.drop && (_.random(1,100) < currentPage.drop)) {
        logger.log('info', 'Dropping current session for SessionId ' + sessionData.sessionId);
        return startSession(sessionData.sessionId);
    }
    var options = {
        url : currentPage.url,
        jar : jar,
        headers : {
            'ADRUM' : 'isAjax:true',
            'ADRUM_1' : 'isMobile:true'
        }
    };
    var method = 'get';

    if (currentPage.form) {
        var method = 'post';
        if (currentPage.url.indexOf('!addToCart.action') > -1) {
            options.form = addToCartItems(currentPage.form);
        } else {
            options.form = currentPage.form;
        }
    }

    if (currentPage.headers) {
        options.headers = _.merge(options.headers, currentPage.headers);
    }

    var startTime = Date.now();
    request[method](options, function(err, resp, body) {
        if (err) {
            console.error(err);
        } else {
            logger.log('info','SessionId' + sessionData.sessionId + ' - ' + options.url + ' : ' + resp.statusCode);
        }

        if (!err && currentPage.getBeacon) {
            var endTime = Date.now();
            var beacon = rumBeacon[currentPage.getBeacon]();
            beaconTransforms[currentPage.beaconTransform](beacon, sessionData);
            var correlationInfo = getCorrelation(resp.headers);
            logger.log('debug', 'Correlation info : ', correlationInfo);
            updateCorrelationInfo(beacon, correlationInfo);
            updateMetrics(beacon, (endTime - startTime), sessionData);

            if (currentPage.jsError && jsErrors[currentPage.jsError](beacon, sessionData, currentPage)) {
                logger.log('info','Javascript error triggered for SessionId ' + sessionData.sessionId);
                steps = [];
            } else if (steps.length === 0) {
               beacon.es[0].ud = {
                   username : currentPage.form.username,
                   cartTotal : _.random(8,250)
               }
                logger.log('debug', 'Userdata added to SessionId ' + sessionData.sessionId, beacon.es[0].ud);
            }
            sendBeacon(beacon, sessionData.browser.agent);
        }


        if (steps.length === 0) {
            return startSession(sessionData.sessionId);
        } else {
            setTimeout(function() {
                nextStep(steps, jar, sessionData);
            }, _.random(2000,10000));
        }
    });
}

var specificUser = 0;
jsErrors.addToCartError = function(beacon, sessionData, currentPage) {
    var b = sessionData.browser.agent;

    if (b.indexOf('MSIE 6') > -1 || b.indexOf('MSIE 8') > -1) {
        var errorBeacon = rumBeacon.getCartErrorBeacon();
        errorBeacon.ts = Date.now();
        beacon.es.push(errorBeacon);

        //check time to limit number of sessions, and only IE8 since IE6 doesn't have session support
        var ts = specificUser + (60000 * 30);
        if (ts < Date.now() && b.indexOf('MSIE 8') > -1) {
            beacon.es[0].ud = {
                username : 'kyle.duffy@aol.com',
                cartTotal : _.random(25,75)
            };
            specificUser = Date.now();
            logger.log('debug', 'Userdata added with username for error use case for SessionId ' + sessionData.sessionId, beacon.es[0].ud);
        } else {
            beacon.es[0].ud = {
                username : currentPage.form.username,
                cartTotal : _.random(25,300)
            };
            logger.log('debug', 'Userdata added in error check for SessionId ' + sessionData.sessionId, beacon.es[0].ud);
        }
        return true;
    } else {
        return false;
    }
}

/**
 * PLT - Page Load Time | End User Reponse Time
 * FBT - First Byte Time
 * DRT - HTML Download and DOM Building
 * DOM - DOM Ready
 * PRT - Resource Fetch Time
 * FET - Front End Time (only appears in snapshots for browsers that ????)
 *
 * RAT - Response Available Time -> time for request to be sent to server and first byte back from server
 * DDT - HTML Download Time
 * DPT - DOM Building Time
 *
 * @param beacon default beacon
 * @param HTMLDownloadTime time recorded to download page by script
 * @param sessionData {} session object
 */
var updateMetrics = function(beacon, HTMLDownloadTime, sessionData) {

    logger.log('debug', 'Server request time (ms) : ' + HTMLDownloadTime);

    beacon.es[0].mc.FBT = HTMLDownloadTime;
    beacon.es[0].mc.DRT = _.random(100, 250);
    beacon.es[0].mc.PRT = _.random(5, 500);

    beacon.es[0].mc.DOM = beacon.es[0].mc.FBT + beacon.es[0].mc.DRT;
    beacon.es[0].mc.PLT = beacon.es[0].mc.DOM + beacon.es[0].mc.PRT;
    beacon.es[0].mc.FET = beacon.es[0].mc.DRT + beacon.es[0].mc.PRT;
    logger.log('debug', 'Cookie Metrics',beacon.es[0].mc);

    if (beacon.es[0].mx) {
        beacon.es[0].mx.FBT = HTMLDownloadTime;
        beacon.es[0].mx.DRT = beacon.es[0].mc.DRT;
        beacon.es[0].mx.DDT = _.random(2, 30);
        beacon.es[0].mx.PRT = beacon.es[0].mc.PRT

        beacon.es[0].mx.DPT = beacon.es[0].mx.DRT - beacon.es[0].mx.DDT;
        beacon.es[0].mx.RAT = beacon.es[0].mx.FBT - beacon.es[0].mx.SCT;
        beacon.es[0].mx.DOM = beacon.es[0].mx.FBT + beacon.es[0].mx.DRT;
        beacon.es[0].mx.PLT = beacon.es[0].mx.DOM + beacon.es[0].mx.PRT;
        beacon.es[0].mx.FET = beacon.es[0].mx.DRT + beacon.es[0].mx.PRT;
        logger.log('debug', 'Navigation Timing Metrics',beacon.es[0].mx);
    }

    if (beacon.es[0].rt) {
        beacon.es[0].rt.r.forEach(function(resource, i) {
            if (i === 0) {
                resource.m[10] = beacon.es[0].mx.FBT + beacon.es[0].mx.DDT
            } else {
                resource.o += HTMLDownloadTime;
            }
        });
    }
}

var getSession = function() {
    var s = session.getSessionData();
    s.GUID = createGUID();
    return s;
}

var getCorrelation = function(headers) {
    return eumUtilities.correlationHeaders(headers);
}

var updateCorrelationInfo = function(beacon, correlationInfo) {

    if (!beacon.es[0].sm) {
        return;
    }

    if (correlationInfo.clientRequestGUID) {
        beacon.gs[0] = correlationInfo.clientRequestGUID;
    }
    if (correlationInfo.globalAccountName) {
        beacon.es[0].sm.btgan = correlationInfo.globalAccountName;
    }
    if (correlationInfo.btId) {
        beacon.es[0].sm.bt[0].id = correlationInfo.btId;
    }
    if (correlationInfo.btERT) {
        beacon.es[0].sm.bt[0].ert = correlationInfo.btERT;
    }
}

beaconTransforms.alterStandardBeacon = function(beacon, sessionData) {
    var ts = Date.now();

    beacon.es[0].ts = ts;
    //beacon.es[0].si = 0;
    //update nav timing
    beacon.es[0].mx.ts = ts;
    //update cookie
    beacon.es[0].mc.ts = ts;
    //update resource timing ts
    beacon.es[0].rt.t = ts;
    beacon.gs[0] = createGUID();
    beacon.ai = sessionData.GUID;
    beacon.ge = sessionData.geo;

    if (sessionData.browser.timing === 'nav' || sessionData.browser.timing === 'none') {
        logger.log('debug', 'Removing resource timing');
        delete beacon.es[0].rt;
    }
    if (sessionData.browser.timing === 'none') {
        logger.log('debug', 'Removing navigation timing');
        delete beacon.es[0].mx;
    }

    if (!sessionData.browser.storage) {
        delete beacon.ai;
        delete beacon.es[0].si;
        logger.log('debug', 'Removing session variables');
    }
}

var sendBeacon = function(beacon, agent) {
    var strBeacon = JSON.stringify(beacon);
    var deferred = Q.defer();
    var options = {
        url : beaconHost + '/eumcollector/beacons/browser/v1/'+ appDKey +'/adrum',
        headers : {
            'User-Agent' : agent,
            'Content-Type' : 'text/plain',
            'Content-Length' : strBeacon.length,
            'Accept' : '*/*',
            'Host' : 'col.eum-appdynamics.com'
        },
        body : strBeacon
    }

    request.post(options, function(error, response, body) {
        if (error) {
            return deferred.reject({type : 'beacon request', err : error});
        }
        logger.log('info', 'beacon sent');
        logger.log('trace', beacon);
        deferred.resolve(response);
    });
    return deferred.promise;
}
/**
 * createGUID
 *
 * Sample GUID - 8a3c1905_1a08_297e_bb32_441eb9f86962
 *
 * @returns {string}
 */
var createGUID = function() {
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    var g = "";
    for( var i=0; i < 36; i++ ) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            g += '_';
        } else {
            g += possible.charAt(Math.floor(Math.random() * possible.length));
        }
    }

    return g;
}

request(host + '/appdynamicspilot/rest/json/user/all', function(err,resp,body) {
    users = JSON.parse(body);
    begin(getPages, numberOfActiveSessions);
});

setInterval(function() {
  request(host + "/appdynamicspilot/Order.action", function(err, resp, body) {
    if (err) {
      logger.error("Thread contention url errored out");
      logger.error(err);
      return;
    }
    logger.info("Thread contention url called successfully");
  })
}, 2000);
