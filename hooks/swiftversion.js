module.exports = function(context) {
    if (context.opts.cordova.platforms.indexOf("ios") < 0) {
        return;
    }
    console.log("Running iOS Swift version check for Ver-ID plugin");
    var deferral = context.requireCordovaModule("q").defer();
    var xcProject = require("./xcodeproject.js")(context);
    xcProject.readProjectFile().then(function(data) {
        return new Promise(function(resolve,reject) {
            var incompatibleSwiftVersion = false;
            data = data.replace(/buildSettings = \{((.|\s)*?)\};/g, function(match) {
                var swiftPattern = /SWIFT_VERSION\s*=\s*[\'\"]*(\d+)(\.(\d+))*[\'\"]*;/;
                var swift = match.match(swiftPattern);
                var result = match;
                if (swift) {
                    if ((parseInt(swift[1]) < 5)) {
                        // result = match.replace(swiftPattern, "SWIFT_VERSION = 5;");
                        incompatibleSwiftVersion = swift[1]+swift[2];
                    }
                } else {
                    result = match.replace(/\};$/, "SWIFT_VERSION = 5;\n\t\t\t};");
                }
                return result;
            });
            if (incompatibleSwiftVersion) {
                console.log("Incompatible Swift version: "+incompatibleSwiftVersion);
                return reject();
            }
            return resolve(data);
        });
    }).then(function(data){
        return xcProject.writeProjectFile(data);
    }).then(deferral.resolve).catch(deferral.reject);
    return deferral.promise;
};