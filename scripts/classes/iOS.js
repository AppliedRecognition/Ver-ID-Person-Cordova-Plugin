const path = require('path');
const xcode = require('xcode');
const Constants = require('../utils/constants');
const Plist = require('./Plist');
const Utils = require('../utils/Utils');
const Messages = require('../utils/Messages');

class IosOperations extends Plist {
    /**
     * Function that start adding all the configuration and files
     * for iOS platform
     * @returns {promise}
     */
    init = () => {
        this.action = Constants.Actions.ADD;
        Messages.showMessage('Adding iOS');
        this.start().then(this.verify);
    };

    /**
     * Function that start removing all the configuration and files
     * for iOS platform
     * @returns {promise}
     */
    remove = () => {
        this.action = Constants.Actions.REMOVE;
        Messages.showMessage('Removing iOS');
        return this.start().then(() => {
            Messages.showMessage('Removing iOS Successfull');
        });
    };

    /**
     * Function that start verifying all the configuration and files
     * for iOS platform
     * @returns {promise}
     */
    verify = () => {
        this.action = Constants.Actions.VERIFY;
        console.log(Messages.VerifyingHeader);
        this.start().then(() => {
            Messages.showErrors(this.errors);
        });
    };

    /**
     * Function that call all the necessary function to update
     * configuration and files for iOS platform
     * @returns {promise}
     */
    start = () => {
        return this.initConfig()
            .then(this.handleIosFiles)
            //.then(this.handleIosResource)
            .then(this.handleVeridPassword)
            .then(this.saveConfig)
            .then(this.handlePlist)
            .then(this.manageXcodeProject)
            .catch(Messages.logError);
    };

    /**
     * Function that adds, remove or verifies files
     * for iOS platform
     * @returns {promise}
     */
    handleIosFiles = () => {
        const { action } = this;
        console.log('Handle iOS files, action:', action);
        switch (action) {
            case Constants.Actions.ADD: {
                const licensePath = this.getArguments().certificate;
                console.log(`Copying License file ${licensePath} to Plugin directory`);

                return Utils.copyFile(
                    licensePath,
                    Constants.DEFAULT_LICENSE_PATH,
                    Constants.DEFAULT_FILE_NAME
                ).then(() => {
                    console.log(`Copying License file ${licensePath} to  iOS platform`);
                    return Utils.copyFile(licensePath, this.getResourcePath(), Constants.DEFAULT_FILE_NAME);
                });
            }
            case Constants.Actions.REMOVE: {
                console.log(`Removing License file from  iOS platform`);
                if (!Utils.directoryExist(this.getIosPlatformPath())) {
                    throw new Error('iOS Platform dont exist');
                }
                return Utils.removeFile(this.getResourceFilePath());
            }
            case Constants.Actions.VERIFY: {
                console.log('Verifying the license file in Resources directory!');
                if (!Utils.fileExist(this.getResourceFilePath())) {
                    this.handleErrors('License File not Found in Resources directory!');
                }
                break;
            }
            default: {
                console.log('Default Case');
            }
        }
        return null;
    };

    /**
     * Function that return the directory of the license resource
     * @returns {string}
     */
    getResourcePath = () => {
        return path.join(this.getIosPlatformPath(), this.getProjectName(), 'Resources');
    };

    /**
     * Function that return the file path of the license resource
     * @returns {string}
     */
    getResourceFilePath = () => {
        return path.join(this.getResourcePath(), Constants.DEFAULT_FILE_NAME);
    };

    /**
     * Function that adds, removes or verifies if the license file
     * is being bundle with iOS project
     * @returns {promise}
     */
    manageXcodeProject = () => {
        console.log('Started adding the Resource to Xcode!, action:', this.action);

        return new Promise((resolve, reject) => {
            const projectName = this.getProjectName();
            const xcodeproj = path.join(
                this.getIosPlatformPath(),
                `${projectName}.xcodeproj`,
                'project.pbxproj'
            );
            const resourcePath = this.getResourceFilePath();
            const project = xcode.project(xcodeproj);

            project.parse((err) => {
                if (err) {
                    Messages.logError(err);
                    reject(err);
                    return;
                }
                if (this.action !== Constants.Actions.VERIFY) {
                    if (this.action === Constants.Actions.ADD) {
                        project.addResourceFile(resourcePath);
                    } else if (this.action === Constants.Actions.REMOVE) {
                        project.removeResourceFile(resourcePath);
                    }

                    resolve(Utils.writeFile(xcodeproj, project.writeSync()));
                } else {
                    console.log('Verifying license file in xcode project');
                    if (!project.hasFile(resourcePath)) {
                        this.handleErrors('Xcode project does not have license file in bundle!');
                    }
                    resolve();
                }
            });
        });
    };
}

module.exports = IosOperations;
