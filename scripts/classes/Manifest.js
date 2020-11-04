const path = require('path');
const Constants = require('../utils/constants');
const Configuration = require('./Configuration');
const Utils = require('../utils/Utils');
const Messages = require('../utils/Messages');

class Manifest extends Configuration {
    /**
     * Function that returns the path of the manifest File
     * @returns {promise}
     */
    getManifestPath = () => {
        return path.join(this.getAndroidPlatformPath(), Constants.ANDROID_MANIFEST_PATH);
    };

    /**
     * Function that add the password to the manifest File
     * @returns {promise}
     */
    handlePasswordManifest = () => {
        console.log(`${this.application} password manifest!`);
        return Utils.readFile(this.getManifestPath())
            .then(Utils.parseXmlToJson)
            .then(this.setManifest)
            .then(this.getMetaData)
            .then(this.handleMetaDataToManifest)
            .then(this.setMetaData)
            .then(this.saveManifest);
    };

    /**
     * Adds, removes or verify to the manifest a meta data with the password
     * configuration
     * @param {Object} metaDataArray
     */
    handleMetaDataToManifest = (metaDataArray) => {
        let newMetadata = metaDataArray;
        const verIdIndexFound = newMetadata.find(
            (metaData) => metaData.$['android:name'] === Constants.PASSWORD_KEY
        );

        if (this.action !== Constants.Actions.VERIFY) {
            if (this.action === Constants.Actions.ADD) {
                if (!verIdIndexFound) {
                    const metaDataEntry = {
                        'android:name': Constants.PASSWORD_KEY,
                        'android:value': this.getArguments().password,
                    };

                    console.log('Adding meta data to Manifest!');
                    newMetadata.push({
                        $: metaDataEntry,
                    });
                }
            } else {
                newMetadata = newMetadata.filter(
                    (metaData) => metaData.$['android:name'] !== Constants.PASSWORD_KEY
                );
            }
        } else {
            console.log('Verifying the password in the manifest!');
            if (!verIdIndexFound) {
                this.handleErrors('Password not found in manifest');
            }
        }

        return newMetadata;
    };

    /**
     * saves the manifest data in memory
     * @param {*} manifest
     * @returns {Object}
     */
    setManifest = (manifest) => {
        this.manifest = manifest;
        return this.manifest;
    };

    /**
     * returns the password meta data from the manifest
     * @returns {Array}
     */
    getMetaData = () => {
        return this.manifest.manifest.application[0]['meta-data'] || [];
    };

    /**
     * Saves the meta data information into the manifest
     * @param {Array} metaDataArray
     */
    setMetaData = (metaDataArray) => {
        if (metaDataArray && metaDataArray.length > 0) {
            this.manifest.manifest.application[0]['meta-data'] = metaDataArray;
        } else if (this.action === Constants.Actions.REMOVE) {
            console.log('Removing metadata manifest');
            delete this.manifest.manifest.application[0]['meta-data'];
        }
    };

    /**
     * Saves the manifest information into the file
     * @returns {Promise}
     */
    saveManifest = () => {
        if (!this.manifest) {
            Messages.logError('Parsed AndroidManifest.xml not found');
            return;
        }
        const xml = Utils.parseJsonToXml(this.manifest);
        console.log('Saving manifest');
        Utils.writeFile(this.getManifestPath(), xml);
    };
}

module.exports = Manifest;
