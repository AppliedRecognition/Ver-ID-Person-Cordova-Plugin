module.exports = function(context) {
    if (context.opts.cordova.platforms.indexOf("ios") < 0) {
        return;
    }
    console.log("Running iOS setup for Ver-ID plugin");
    var fs = context.requireCordovaModule("fs");
    var path = context.requireCordovaModule("path");
    var deferral = context.requireCordovaModule("q").defer();
    var platformRoot = path.join(context.opts.projectRoot, "platforms/ios");

    var podFilePath = path.join(platformRoot, "Podfile");
    fs.access(podFilePath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, function(error) {
        if (error) {
            console.log("Podfile does not exist at iOS project root");
            deferral.reject("Podfile does not exist at iOS project root");
            return;
        }
        fs.readFile(podFilePath, "utf8", function(error, data) {
            if (error) {
                console.log("Unable to read Podfile at iOS project root");
                deferral.reject("Unable to read Podfile at iOS project root");
                return;
            }
            var pattern = /platform\s+:ios,\s+[\"\'](\d+)(\.\d+)*[\"\']/ig;
            data = data.replace(pattern, function(match, iosMajor) {
                if (parseInt(iosMajor) < 11) {
                    dataUpdated = true;
                    return match.replace(/platform\s+:ios,\s+[\"\']\d+(\.\d+)*[\"\']/i, "platform :ios, '11.0'");
                }
                return match;
            });
            fs.writeFile(podFilePath, data, "utf8", function(error) {
                if (error) {
                    console.log("Unable to write Podfile");
                    deferral.reject("Unable to write Podfile");
                    return;
                }
                console.log("Wrote to "+podFilePath+":\n"+data);
                const { exec } = context.requireCordovaModule("child_process");
                const install = exec("cd \""+platformRoot+"\" && pod install");
                install.stdout.on("data", function(out) {
                    console.log(out);
                });
                install.stderr.on("data", function(err) {
                    console.log(err);
                });
                install.on("exit", function(code) {
                    if (code == 0) {
                        deferral.resolve();
                    } else {
                        console.log("Failed to install pod from "+podFilePath);
                        deferral.reject();
                    }
                });
            });
        });
    });
    return deferral.promise;
};