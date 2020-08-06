const path = require('path');
const Messages = require('../utils/Messages');

class BaseLogic {
    constructor(context) {
        this.context = context;
    }

    /**
     * Function that returns the root path of the cordova project
     * @returns {string}
     */
    getRootPath = () => {
        return this.context.opts.projectRoot;
    };

    /**
     * Function that returns the path of the configuration project
     * @returns {string}
     */
    getConfigFilePath = () => {
        return path.join(this.getRootPath(), 'config.xml');
    };

    /**
     * Function that returns the path of the iOS platform
     * @returns {string}
     */
    getIosPlatformPath = () => {
        return path.join(this.getRootPath(), 'platforms', 'ios');
    };

    /**
     * Function that returns the path of the Android platform
     * @returns {string}
     */
    getAndroidPlatformPath = () => {
        return path.join(this.getRootPath(), 'platforms', 'android');
    };

    /**
     * Saves and Shows up a message error
     * @param {*} errorMessage 
     */
    handleErrors = (errorMessage) => {
        if (!this.errors) {
            this.errors = [];
        }
        Messages.logError(errorMessage);
        this.errors.push(errorMessage);
    };
}

module.exports = BaseLogic;
