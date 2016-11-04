var eumUtilities = require("eum-utilities"),
  beacons = require("./beacons.js"),
  _ = require("lodash"),
  request = require("request");

//REQUIRED ENVIRONMENT VARIABLES
var appBaseUrl = process.env.ECOMM_URL;
var beaconUrl = process.env.EUM_URL;
var beaconHost = beaconUrl.replace(/^(https?):\/\//,'');
var brumKey =  process.env.EUM_KEY;

//OPTIONAL LOGGER ENVIRONMENT VARIABLES
loggerConfig = {
  logLevel : process.env.LOG_LEVEL || 'info',
  logConsole : process.env.LOG_CONSOLE || "false",
  logFile :  process.env.LOG_FILE || "true"
}

//ECOMMERCE FUNCTIONS
var addToCartItems = function() {
    var f = _.random(1,14);
    var s = _.random(1,14);

    if (f == s) {
        s+=1;
    } else if (f > s) {
        var t = f;
        f = s;
        s = t;
    }

    return _.rangeRight(f,s).reduce( (result, value) => value + ',' + result);
}

var users = [];
var indexOfUsers = 0;
var getPagesForSession = function() {

  var user =  users[indexOfUsers];
  if (indexOfUsers < (users.length -1)) {
      indexOfUsers++;
  } else {
      indexOfUsers = 0;
  }
  var loginName = user.email;
  var password = user.password;

  var cartForm = {
    username : loginName,
    selectedId : 1,
    selectedItemId : addToCartItems()
  };

  return [
    {
      url : appBaseUrl + "/appdynamicspilot/",
      drop : 0,
      beacon : "getHomepage",
    },
    {
      url : appBaseUrl + "/appdynamicspilot/UserLogin.action",
      drop : 0,
      form : {loginName : loginName, password : password}
    },
    {
        url : appBaseUrl + '/appdynamicspilot/ViewItems.action',
        drop : 5,
        beacon : "getFetchCatalog",
    },
    {
        url : appBaseUrl + '/appdynamicspilot/ViewCart!addToCart.action',
        form : cartForm,
        drop : 5,
        beacon : "getAddToCart"
    },
    {
        url : appBaseUrl + '/appdynamicspilot/ViewCart!address.action',
        drop : 5,
        beacon : "getAddress"
    },
    {
        url : appBaseUrl + '/appdynamicspilot/ViewCart!paymentinfo.action',
        drop : 5,
        beacon : "getPayment"
    },
    {
        url : appBaseUrl + '/appdynamicspilot/ViewCart!confirmorder.action',
        drop : 5,
        beacon : "getConfirmOrder"
    },
    {
        url : appBaseUrl + '/appdynamicspilot/Order.action'
    },
    {
        url : appBaseUrl + '/appdynamicspilot/ViewCart!sendItems.action',
        form : {
            username : loginName
        },
        headers : {'appdynamicssnapshotenabled' : 'true'},
        drop : 20,
        beacon : "getCheckout"
    }
  ];
}

//LOG
var logger = eumUtilities.configLogger(loggerConfig, 'startup-');
logger.info("Startup variables", {
    appBaseUrl : appBaseUrl,
    beaconHost :  beaconHost,
    brumKey : brumKey,
    logLevel : loggerConfig.logLevel,
    logConsole : loggerConfig.logConsole,
    logFile : loggerConfig.logFile
});

//START UP
if (!appBaseUrl || !beaconHost || !brumKey) {
  logger.error("One of the required environment variables was not set");
  setTimeout(function() {process.exit();}, 500);
} else {
  request(appBaseUrl + "/appdynamicspilot/rest/json/user/all", function(err,resp,body) {
    if (err) {
      return logger.error("Error fetching users, cannot start", err);
    }
    users = JSON.parse(body);
    eumUtilities.browserMultipleSessions(loggerConfig, 5, getPagesForSession, beacons, beaconHost, brumKey);

  });
}
