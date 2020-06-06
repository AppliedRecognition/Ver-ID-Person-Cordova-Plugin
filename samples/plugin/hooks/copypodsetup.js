module.exports = function(context) {
    if (context.opts.cordova.platforms.indexOf("ios") < 0) {
        return;
    }
    console.log("Running iOS setup for Ver-ID plugin");
    var fs = context.requireCordovaModule("fs");
    var path = context.requireCordovaModule("path");
    var deferral = context.requireCordovaModule("q").defer();
    var configFilePath = path.join(context.opts.projectRoot, "config.xml");
    var scriptName = "podfilesetup.js";
    var scriptSrcPath = path.join(context.opts.plugin.dir, "hooks", scriptName);
    var scriptDestPath = path.join(context.opts.projectRoot, "scripts", scriptName);
    fs.readFile(configFilePath, "utf8", function(error, config) {
        if (error) {
            console.log("Failed to read config file "+configFilePath);
            return deferral.reject();
        }
        fs.copyFile(scriptSrcPath, scriptDestPath, function(error) {
            if (error) {
                console.log("Failed to copy from "+scriptSrcPath+" to "+scriptDestPath);
                return deferral.reject();
            }
            console.log("Copied script from "+scriptSrcPath+" to "+scriptDestPath);
            var pattern = /\<platform name="ios"\>((.|\s)*?)\<\/platform\>/ig;
            var entry = "<hook type=\"before_build\" src=\"scripts/"+scriptName+"\" />";
            var data = config.replace(pattern, function(match, items) {
                if (!items.match(entry)) {
                    return "<platform name=\"ios\">"+items+"\n"+entry+"\n</platform>";
                } else {
                    return match;
                }
            });
            fs.writeFile(configFilePath, data, "utf8", function(error) {
                if (error) {
                    console.log("Failed to write to "+configFilePath);
                    return deferral.reject();
                }
                console.log("Updated config file "+configFilePath);
                deferral.resolve();
            });
        });
    });
    return deferral.promise;
};