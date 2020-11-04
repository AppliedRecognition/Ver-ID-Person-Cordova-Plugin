const xml2js = require('xml2js');
const fs = require('fs');
const pathModule = require('path');
const Messages = require('./Messages');

const Utils = {
    /**
     * Converts an XML to a JSON object
     * @param {string} xml
     * @return {Object}
     */
    parseXmlToJson(xml) {
        console.log('Parsing Xml to Json');
        const json = xml2js.parseStringPromise(xml);
        return json;
    },

    /**
     * Converts Json to XML
     * @param {Object} json
     * @returns {string}
     */
    parseJsonToXml(json) {
        console.log('Parsing Json to XML');
        const xml = new xml2js.Builder().buildObject(json);
        return xml;
    },

    /**
     * Creates a directory on target path if directory doesn't exist
     * @param {string} path
     * @returns {Promise}
     */
    createDirectory(path) {
        console.log('creating directory on:', path);
        return new Promise((resolve, reject) => {
            fs.mkdir(path, { recursive: true }, (err) => {
                if (err) {
                    Messages.logError(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    /**
     * Copy a File to a target directory
     * @param {string} file
     * @param {string} targetPath
     */
    copyFileToDirectory(file, targetPath) {
        return new Promise((resolve, reject) => {
            console.log(`Copying file ${file} to ${targetPath}`);
            if (Utils.fileExist(file)) {
                fs.copyFile(file, targetPath, (err) => {
                    if (err) {
                        Messages.logError(err);
                        reject(err);
                    } else {
                        console.log('Copy operation successful!');
                        resolve('Copy operation successful!');
                    }
                });
            } else {
                console.log('Copy Failed!, File already exist:', targetPath);
                resolve('Copy Failed!, File already exist');
            }
        });
    },

    /**
     * Copy a file to the target directory
     * @param {string} rootPath
     * @param {string} targetPath
     * @param {string} fileName
     */
    copyFile(rootfilePath, targetPath, fileName) {
        return new Promise((resolve, reject) => {
            const newFilePath = pathModule.join(targetPath, fileName);
            const copy = () => {
                console.log('Path exists, copying file.');
                return this.copyFileToDirectory(rootfilePath, newFilePath);
            };

            if (Utils.fileExist(rootfilePath) && !Utils.fileExist(newFilePath)) {
                if (!this.directoryExist(targetPath)) {
                    console.log(`Creating directory before copying: ${targetPath}`);
                    resolve(this.createDirectory(targetPath).then(copy).catch(reject));
                    return;
                }

                resolve(copy());
            }

            if (!Utils.fileExist(rootfilePath)) {
                Messages.logError(`File ${rootfilePath} doesn't exist!`);
            }
            resolve();
        });
    },

    fsExist(file) {
        return fs.existsSync(file);
    },

    /**
     * returns true if file exist
     * @param {string} file
     */
    fileExist(file) {
        return this.fsExist(file);
    },

    /**
     * returns true if directory exist
     * @param {string} path
     */
    directoryExist(path) {
        return this.fsExist(path);
    },

    /**
     * Returns the data of a readed file
     * @param {string} file
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            if (Utils.fileExist(file)) {
                fs.readFile(file, 'utf8', function (err, data) {
                    if (err) {
                        Messages.logError(`Error reading file: ${file}`);
                        reject(err);
                        return;
                    }
                    resolve(data);
                });
            } else {
                reject(new Error(`Error, file not found!, file: ${file}`));
            }
        });
    },

    /**
     * Function to write information into a File
     * @param {string} filePath
     * @param {string} information
     * @returns {Promise}
     */
    writeFile(filePath, information) {
        console.log(`Writing file: ${filePath}`);
        return new Promise((resolve, reject) => {
            if (Utils.fileExist(filePath)) {
                fs.writeFile(filePath, information, 'utf8', function (err) {
                    if (err) {
                        Messages.logError(`Error writing file on disk, file: ${filePath}`);
                        reject(err);
                    } else {
                        console.log(`Success updating file: ${filePath}`);
                        resolve();
                    }
                });
            } else {
                reject(new Error(`Error, file not found!, file: ${filePath}`));
            }
        });
    },

    /**
     * Function used to delete a file or directory
     */
    removeFile(file) {
        if (Utils.fileExist(file)) {
            fs.unlink(file, (err) => {
                if (err) Messages.logError(err);
            });
        }
    },
};

module.exports = Utils;
