const pathModule = require('path');
const Constants = require('../utils/constants');
const BaseLogic = require('./BaseLogic');
const Utils = require('../utils/Utils');
const getCmdArgs = require('../utils/getCommandLineArgs');
const Messages = require('../utils/Messages');

class Configuration extends BaseLogic {
    /**
     * Function that reads the configuration file and
     * saves the configuration data in the property
     * @returns {Promise}
     */
    initConfig = () => {
        return this.getParsedConfig().then((config) => {
            this.config = config;
            return config;
        });
    };

    /**
     * Functions that gets the name of the project
     * @returns {string}
     */
    getProjectName = () => {
        if (!this.projectName) {
            [this.projectName] = this.config.widget.name;
            console.log(`Getting Project Name: ${this.projectName}`);
        }

        return this.projectName;
    };

    /**
     * Function that saves the configuration data into
     * the configuration file of the project
     * @returns {Promise}
     */
    saveConfig = () => {
        if (this.action !== Constants.Actions.VERIFY) {
            if (!this.config) {
                throw new Error('Parsed config.xml not found');
            }
            return Utils.writeFile(this.getConfigFilePath(), Utils.parseJsonToXml(this.config));
        }
        return null;
    };

    /**
     * returns the configuration data after reading it from
     * the configuration file
     * @returns {string}
     */
    getConfig = () => {
        return Utils.readFile(this.getConfigFilePath());
    };

    /**
     * Returns the parsed configuration data
     * @returns {string}
     */
    getParsedConfig = () => {
        return this.getConfig().then(Utils.parseXmlToJson);
    };

    /**
     * returns the password used in the plugin
     * 1. The password could be available at the configuration data
     * 2. The password could come from the command arguments
     * @returns {string}
     */
    getVeridPassword = () => {
        const { veridConfig } = this.config.widget;
        return veridConfig && veridConfig.length > 0 && veridConfig[0].$.password
            ? veridConfig[0].$.password
            : null;
    };

    /**
     * Adds, removes or verify the password to the configuration data
     * @returns {Object}
     */
    handleVeridPassword = () => {
        let { veridConfig } = this.config.widget;
        console.log(`${this.action} VerID Password Config.xml!`);
        if (this.action !== Constants.Actions.VERIFY) {
            if (this.action === Constants.Actions.ADD && !veridConfig) {
                console.log('Adding!');
                veridConfig = { $: { password: this.getArguments().password } };
                this.config.widget.veridConfig = veridConfig;
            } else if (this.action === Constants.Actions.REMOVE) {
                console.log('Removing!');
                delete this.config.widget.veridConfig;
            }
        } else if (!veridConfig) {
            this.handleErrors('VerID Password not Found in Config.xml!');
        }

        return this.config;
    };

    /**
     * Function that Adds, removes or verify the iOS resource data to the configuration File
     * @returns {promise}
     */
    handleIosResource = () => {
        console.log(`${this.action} iOS Resource to config.xml`);
        return this.handleResourceUpdate({
            platform: 'ios',
            src: Constants.DEFAULT_FILE_LICENSE_PATH,
            target: Constants.DEFAULT_FILE_NAME,
        });
    };

    /**
     * Function that Adds, removes or verify the Android resource data to the configuration File
     * @returns {promise}
     */
    handleAndroidResource = () => {
        console.log(`${this.action} Android Resource to config.xml`);
        return this.handleResourceUpdate({
            platform: 'android',
            src: Constants.DEFAULT_FILE_LICENSE_PATH,
            target: pathModule.join(Constants.ANDROID_LICENSE_PATH_LOCATION, Constants.DEFAULT_FILE_NAME),
        });
    };

    /**
     * Function that Adds, removes or verify a resource to the configuration data
     * depending on the platform provided
     * @returns {Object}
     */
    handleResourceUpdate = (options) => {
        let platforms = this.config.widget.platform;
        const platformFound = platforms.find((platform) => platform.$.name === options.platform);
        if (platformFound) {
            let platformUpdated = [];
            platformUpdated = this.updatePlatformResource(platformFound, options);

            platforms = platforms.map((platform) => {
                let newPlatformData = platform;
                if (platform.$.name === options.platform) {
                    console.log('Updating the platform', options.platform);
                    newPlatformData = platformUpdated;
                }
                return newPlatformData;
            });
            this.config.widget.platform = platforms;
        } else {
            Messages.logError(`Platform ${options.platform} not found!`);
        }


        return this.config;
    };

    /**
     * Adds, removes or verify the platform resource data
     * @param {*} platform
     * @param {*} options
     * @returns {Object}
     */
    updatePlatformResource = (platform, options) => {
        console.log(`${this.action} Platform resource`);

        const newPlatformData = platform;
        const resourceIndex = platform['resource-file'] || [];
        if (this.action !== Constants.Actions.VERIFY) {
            if (this.action === Constants.Actions.ADD && options.target && options.src) {
                resourceIndex.push({ $: { src: options.src, target: options.target } });
                newPlatformData['resource-file'] = resourceIndex;
            } else if (this.action === Constants.Actions.REMOVE) {
                newPlatformData['resource-file'] = resourceIndex.filter((entry) => {
                    return !entry.$.target.match(Constants.DEFAULT_FILE_NAME);
                });
            }
        } else {
            console.log('Verifying iOS resource tag in Config.xml');
            if (!this.hasResourceFile(platform)) {
                this.handleErrors('Resource tag not found in Config.xml');
            }
        }

        return newPlatformData;
    };

    /**
     * Function that returns true if the platform
     * has the resource data
     * @param {*} platform
     * @returns {Object}
     */
    hasResourceFile = (platform) => {
        const resourceIndex = platform['resource-file'] || [];
        const resourceFound = resourceIndex.find((index) =>
            index.$.target.match(Constants.DEFAULT_FILE_NAME)
        );
        return resourceFound;
    };

    /**
     * Returns the password and license path from:
     * 1. Command arguments
     * 2. From the Configuration File
     * @returns {Object}
     */
    getArguments = () => {
        if (!this.arguments) {
            let args = getCmdArgs(this.context);
            if (!args) {
                const password = this.getVeridPassword();
                if (!password) {
                    throw new Error('VerIdConfiguration not found on config.xml!');
                }
                args = {
                    password: password,
                    certificate: Constants.DEFAULT_FILE_LICENSE_PATH,
                };
            }
            this.arguments = args;
        }
        return this.arguments;
    };
}
module.exports = Configuration;
