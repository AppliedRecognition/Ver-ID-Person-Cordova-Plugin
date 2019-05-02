module.exports = function(context) {
    var fs = context.requireCordovaModule("fs");
    var path = context.requireCordovaModule("path");
    var platformRoot = path.join(context.opts.projectRoot, "platforms/ios");
    var files = fs.readdirSync(platformRoot, "utf8");
    var projectFile = null;
    for (var i=0; i<files.length; i++) {
        if (files[i].endsWith(".xcodeproj")) {
            projectFile = path.join(platformRoot, files[i], "project.pbxproj");
            break;
        }
    }
    if (!projectFile) {
        console.log("Failed to find Xcode project at "+platformRoot);
    }

    return {
        "readProjectFile": function() {
            return new Promise(function(resolve, reject) {
                if (!projectFile) {
                    return reject("Invalid project file "+projectFile);
                }
                fs.access(projectFile, fs.constants.F_OK | fs.constants.R_OK, function(error) {
                    if (error) {
                        return reject(error);
                    }
                    fs.readFile(projectFile, "utf8", function(error, data) {
                        if (error) {
                            return reject(error);
                        }
                        console.log("Read "+data.length+" bytes from "+projectFile);
                        return resolve(data);
                    });
                });
            });
        },
        "writeProjectFile": function(data) {
            return new Promise(function(resolve, reject) {
                fs.access(projectFile, fs.constants.F_OK | fs.constants.W_OK, function(error) {
                    if (error) {
                        return reject(error);
                    }
                    fs.writeFile(projectFile, data, "utf8", function(error) {
                        if (error) {
                            return reject(error);
                        }
                        console.log("Wrote "+data.length+" bytes to "+projectFile);
                        return resolve();
                    });
                });
            });
        }
    };
};