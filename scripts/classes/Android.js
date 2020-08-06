const path = require('path');
const Manifest = require('./Manifest');
const Constants = require('../utils/constants');
const Utils = require('../utils/Utils');
const Messages = require('../utils/Messages');

class AndroidOperations extends Manifest {
    /**
     * Function that start adding all the configuration and files
     * for android platform
     * @returns {promise}
     */
    init = () => {
        this.action = Constants.Actions.ADD;
        Messages.showMessage('Adding Android');
        this.start().then(this.verify);
    };

    /**
     * Function that start removing all the configuration and files
     * for android platform
     * @returns {promise}
     */
    remove = () => {
        this.action = Constants.Actions.REMOVE;
        Messages.showMessage('Removing Android');
        return this.start().then(() => {
            Messages.showMessage('Removing Android Successfull');
        });
    };

    /**
     * Function that start verifying all the configuration and files
     * for android platform
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
     * configuration and files for android platform
     * @returns {promise}
     */
    start = () => {
        return this.initConfig()
            .then(this.handleAndroidFiles)
            .then(this.handlePasswordManifest)
            //.then(this.handleAndroidResource)
            .then(this.handleVeridPassword)
            .then(this.saveConfig)
            .catch(Messages.logError);
    };

    /**
     * Function that adds, remove or verifies files
     * for android platform
     * @returns {promise}
     */
    handleAndroidFiles = () => {
        const { action } = this;
        console.log('Handle Android files, action:', action);
        switch (action) {
            case Constants.Actions.ADD: {
                const licensePath = this.getArguments().certificate;
                console.log(`Copying License file ${licensePath} to Plugin directory`);

                return Utils.copyFile(
                    licensePath,
                    Constants.DEFAULT_LICENSE_PATH,
                    Constants.DEFAULT_FILE_NAME
                ).then(() => {
                    console.log(`Copying License file ${licensePath} to  android platform`);
                    return Utils.copyFile(licensePath, this.getResourcePath(), Constants.DEFAULT_FILE_NAME);
                });
            }
            case Constants.Actions.REMOVE: {
                console.log(`Removing License file from  Android platform`);
                if (!Utils.directoryExist(this.getAndroidPlatformPath())) {
                    throw new Error('Android Platform dont exist');
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
        return path.join(this.getAndroidPlatformPath(), Constants.ANDROID_LICENSE_PATH_LOCATION);
    };

     /**
     * Function that return the file path of the license resource
     * @returns {string}
     */
    getResourceFilePath = () => {
        return path.join(this.getResourcePath(), Constants.DEFAULT_FILE_NAME);
    };
}

module.exports = AndroidOperations;
