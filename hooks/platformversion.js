module.exports = function(context) {
    if (context.opts.cordova.platforms.indexOf("ios") < 0) {
        return;
    }
    console.log("Running iOS platform version setup for Ver-ID plugin");
    var deferral = context.requireCordovaModule("q").defer();
    var xcProject = require("./xcodeproject.js")(context);
    xcProject.readProjectFile().then(function(data) {
        return new Promise(function(resolve,reject) {
            data = data.replace(/buildSettings = \{((.|\s)*?)\};/g, function(match) {
                var targetPattern = /IPHONEOS_DEPLOYMENT_TARGET\s*=\s*(\d+)(\.\d+);/;
                var result = match;
                var target = result.match(targetPattern);
                if (target && (parseInt(target[1]) < 10)) {
                    result = result.replace(targetPattern, "IPHONEOS_DEPLOYMENT_TARGET = 10.0;");
                }
                return result;
            });
            return resolve(data);
        });
    }).then(function(data){
        return xcProject.writeProjectFile(data);
    }).then(deferral.resolve).catch(deferral.reject);
    return deferral.promise;
};