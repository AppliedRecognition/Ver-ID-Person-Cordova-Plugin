const plist = require('plist');
const path = require('path');
const Constants = require('../utils/constants');
const Configuration = require('./Configuration');
const Utils = require('../utils/Utils');
const Messages = require('../utils/Messages');

class Plist extends Configuration {
    /**
     * Function that returns the directory path of the Plist File
     * @returns {string}
     */
    getPlistPath = () => {
        const projectName = this.getProjectName();
        return path.join(this.getIosPlatformPath(), projectName, `${projectName}-Info.plist`);
    };

    /**
     * Function that adds, removes and verify the password configuration on
     * the Plist file
     * @returns {promise}
     */
    handlePlist = () => {
        return Utils.readFile(this.getPlistPath()).then((plistData) => {
            const plistInfo = plist.parse(plistData);
            const hasPassword = plistInfo[Constants.PASSWORD_KEY];

            console.log(`${this.action} the password in plist`);
            if (this.action !== Constants.Actions.VERIFY) {
                if (this.action === Constants.Actions.ADD && !hasPassword) {
                    plistInfo[Constants.PASSWORD_KEY] = this.getArguments().password;
                } else if (this.action === Constants.Actions.REMOVE && hasPassword) {
                    delete plistInfo[Constants.PASSWORD_KEY];
                }

                Utils.writeFile(this.getPlistPath(), plist.build(plistInfo));
            } else {
                console.log('Verifying Password in Plist!');
                if (!hasPassword) {
                    this.handleErrors('Password not Found in the Plist File!');
                }
            }
        });
    };
}

module.exports = Plist;
